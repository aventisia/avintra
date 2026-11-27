use std::sync::{Arc, Mutex};
use std::time::Duration;

use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine as _};
use sha2::{Digest, Sha256};
use tauri::State;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::{TcpListener, TcpStream};

const CALLBACK_PATHS: [&str; 2] = ["/", "/callback"];
const CALLBACK_TIMEOUT: Duration = Duration::from_secs(5);

/// Live state of the desktop sign-in hand-back attempt.
#[derive(Default)]
pub struct DesktopSignInState {
    attempt: Mutex<Option<Attempt>>,
}

struct Attempt {
    verifier: String,
    code: Arc<Mutex<Option<String>>>,
    task: tauri::async_runtime::JoinHandle<()>,
}

/// Loopback address and PKCE binding of one desktop sign-in attempt.
#[derive(serde::Serialize)]
pub struct DesktopSignInStart {
    pub port: u16,
    pub state: String,
    pub challenge: String,
}

/// Code delivered to the loopback listener, with the verifier the exchange needs.
#[derive(serde::Serialize)]
pub struct DesktopSignInDelivery {
    pub code: String,
    pub verifier: String,
}

/// Binds a loopback listener and returns the port, state and PKCE challenge for one attempt.
#[tauri::command]
pub async fn start_desktop_sign_in(
    state: State<'_, DesktopSignInState>,
    app_base_url: String,
) -> Result<DesktopSignInStart, String> {
    let return_url = returned_page_url(&app_base_url)?;
    let listener = TcpListener::bind("127.0.0.1:0")
        .await
        .map_err(|error| format!("Cannot open the local sign-in listener: {error}"))?;
    let port = listener
        .local_addr()
        .map_err(|error| format!("Cannot read the local sign-in port: {error}"))?
        .port();

    let state_value = random_url_safe(32)?;
    let verifier = random_url_safe(32)?;
    let challenge = code_challenge(&verifier);

    let code = Arc::new(Mutex::new(None));
    let expected_state = state_value.clone();
    let received_code = Arc::clone(&code);
    let task = tauri::async_runtime::spawn(async move {
        accept_one_delivery(listener, expected_state, received_code, return_url).await;
    });

    let previous = state
        .attempt
        .lock()
        .map_err(|_| "The desktop sign-in state is unavailable".to_string())?
        .replace(Attempt {
            verifier,
            code,
            task,
        });

    if let Some(previous) = previous {
        previous.task.abort();
    }

    Ok(DesktopSignInStart {
        port,
        state: state_value,
        challenge,
    })
}

/// Returns the delivered code once, or `None` while nothing has been delivered.
#[tauri::command]
pub fn get_desktop_sign_in_code(
    state: State<'_, DesktopSignInState>,
) -> Result<Option<DesktopSignInDelivery>, String> {
    let attempt = state
        .attempt
        .lock()
        .map_err(|_| "The desktop sign-in state is unavailable".to_string())?;
    let Some(attempt) = attempt.as_ref() else {
        return Ok(None);
    };

    let Some(code) = attempt
        .code
        .lock()
        .map_err(|_| "The desktop sign-in code is unavailable".to_string())?
        .take()
    else {
        return Ok(None);
    };

    Ok(Some(DesktopSignInDelivery {
        code,
        verifier: attempt.verifier.clone(),
    }))
}

/// Stops the loopback listener and forgets the attempt.
#[tauri::command]
pub fn cancel_desktop_sign_in(state: State<'_, DesktopSignInState>) -> Result<(), String> {
    let previous = state
        .attempt
        .lock()
        .map_err(|_| "The desktop sign-in state is unavailable".to_string())?
        .take();

    if let Some(previous) = previous {
        previous.task.abort();
    }

    Ok(())
}

async fn accept_one_delivery(
    listener: TcpListener,
    expected_state: String,
    code: Arc<Mutex<Option<String>>>,
    return_url: String,
) {
    while let Ok((mut stream, _)) = listener.accept().await {
        let mut buffer = [0u8; 4096];
        let read = match tokio::time::timeout(CALLBACK_TIMEOUT, stream.read(&mut buffer)).await {
            Ok(Ok(read)) => read,
            _ => continue,
        };

        let request = String::from_utf8_lossy(&buffer[..read]);
        let Some((received_code, received_state)) = parse_callback(&request) else {
            let _ = respond(&mut stream, "400 Bad Request", denied_page()).await;
            continue;
        };

        if received_state != expected_state {
            let _ = respond(&mut stream, "400 Bad Request", denied_page()).await;
            continue;
        }

        match store_first_delivery(&code, received_code) {
            Some(true) => {
                let _ = redirect_to(&mut stream, &return_url).await;
                return;
            }
            Some(false) => {
                let _ = respond(&mut stream, "409 Conflict", denied_page()).await;
            }
            None => return,
        }
    }
}

/// Keeps the first delivered code; a later delivery never replaces it.
fn store_first_delivery(slot: &Mutex<Option<String>>, received_code: String) -> Option<bool> {
    let mut slot = slot.lock().ok()?;
    if slot.is_some() {
        return Some(false);
    }

    *slot = Some(received_code);
    Some(true)
}

fn parse_callback(request: &str) -> Option<(String, String)> {
    let request_line = request.lines().next()?;
    let mut parts = request_line.split_whitespace();
    if parts.next()? != "GET" {
        return None;
    }

    let target = parts.next()?;
    let (path, query) = target.split_once('?')?;
    if !CALLBACK_PATHS.contains(&path) {
        return None;
    }

    let mut code = None;
    let mut state = None;
    for pair in query.split('&') {
        let (key, value) = pair.split_once('=')?;
        match key {
            "code" => code = Some(value),
            "state" => state = Some(value),
            _ => {}
        }
    }

    let code = code?;
    let state = state?;
    if !is_url_safe(code) || !is_url_safe(state) {
        return None;
    }

    Some((code.to_string(), state.to_string()))
}

fn is_url_safe(value: &str) -> bool {
    !value.is_empty()
        && value
            .chars()
            .all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '_')
}

async fn respond(stream: &mut TcpStream, status: &str, body: &str) -> std::io::Result<()> {
    let response = format!(
        "HTTP/1.1 {status}\r\nContent-Type: text/html; charset=utf-8\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{body}",
        body.len()
    );
    stream.write_all(response.as_bytes()).await?;
    stream.flush().await
}

async fn redirect_to(stream: &mut TcpStream, location: &str) -> std::io::Result<()> {
    let response = format!(
        "HTTP/1.1 303 See Other\r\nLocation: {location}\r\nContent-Length: 0\r\nConnection: close\r\n\r\n"
    );
    stream.write_all(response.as_bytes()).await?;
    stream.flush().await
}

/// The branded service page the browser stays on after handing the sign-in back.
fn returned_page_url(app_base_url: &str) -> Result<String, String> {
    let mut url = reqwest::Url::parse(app_base_url)
        .map_err(|_| "The service address is not valid".to_string())?;
    if url.scheme() != "https" {
        return Err("The service address must use HTTPS".to_string());
    }

    url.set_path("/accounts/desktop/returned");
    url.set_query(None);
    url.set_fragment(None);
    Ok(url.to_string())
}

fn denied_page() -> &'static str {
    "<!doctype html><html><head><meta charset=\"utf-8\"><title>Avintra</title></head>\
     <body style=\"font-family:sans-serif;margin:3rem\"><h1>This sign-in link is not valid for this attempt.</h1></body></html>"
}

fn random_url_safe(bytes: usize) -> Result<String, String> {
    let mut buffer = vec![0u8; bytes];
    getrandom::getrandom(&mut buffer)
        .map_err(|_| "Cannot generate a random sign-in value".to_string())?;
    Ok(URL_SAFE_NO_PAD.encode(buffer))
}

fn code_challenge(verifier: &str) -> String {
    URL_SAFE_NO_PAD.encode(Sha256::digest(verifier.as_bytes()))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn pkce_challenge_matches_the_rfc7636_example() {
        let verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";

        assert_eq!(
            code_challenge(verifier),
            "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM"
        );
    }

    #[test]
    fn generated_pkce_values_have_the_expected_shape() {
        let verifier = random_url_safe(32).unwrap();
        let challenge = code_challenge(&verifier);

        assert_eq!(verifier.len(), 43);
        assert_eq!(challenge.len(), 43);
        assert!(is_url_safe(&verifier));
        assert!(is_url_safe(&challenge));
    }

    #[test]
    fn parses_a_callback_with_code_and_state() {
        let request = "GET /callback?code=abc123&state=xyz HTTP/1.1\r\nHost: 127.0.0.1\r\n\r\n";

        assert_eq!(
            parse_callback(request),
            Some(("abc123".to_string(), "xyz".to_string()))
        );
    }

    #[test]
    fn rejects_a_callback_without_state() {
        let request = "GET /callback?code=abc123 HTTP/1.1\r\n\r\n";

        assert_eq!(parse_callback(request), None);
    }

    #[test]
    fn rejects_values_that_are_not_url_safe() {
        let request = "GET /callback?code=abc%2Fdef&state=xyz HTTP/1.1\r\n\r\n";

        assert_eq!(parse_callback(request), None);
    }

    #[test]
    fn rejects_other_paths_and_methods() {
        let other_path = "GET /other?code=abc123&state=xyz HTTP/1.1\r\n\r\n";
        let other_method = "POST /callback?code=abc123&state=xyz HTTP/1.1\r\n\r\n";

        assert_eq!(parse_callback(other_path), None);
        assert_eq!(parse_callback(other_method), None);
    }

    #[test]
    fn keeps_the_first_delivered_code() {
        let slot = Mutex::new(None);

        assert_eq!(store_first_delivery(&slot, "first".to_string()), Some(true));
        assert_eq!(
            store_first_delivery(&slot, "second".to_string()),
            Some(false)
        );
        assert_eq!(slot.lock().unwrap().as_deref(), Some("first"));
    }

    #[test]
    fn builds_the_returned_page_on_the_service_origin() {
        assert_eq!(
            returned_page_url("https://avintra.example").unwrap(),
            "https://avintra.example/accounts/desktop/returned"
        );
        assert_eq!(
            returned_page_url("https://avintra.example/").unwrap(),
            "https://avintra.example/accounts/desktop/returned"
        );
        assert!(returned_page_url("http://avintra.example").is_err());
    }

    async fn deliver(address: std::net::SocketAddr, request: &str) -> String {
        let mut stream = TcpStream::connect(address).await.unwrap();
        stream.write_all(request.as_bytes()).await.unwrap();
        let mut response = Vec::new();
        stream.read_to_end(&mut response).await.unwrap();
        String::from_utf8_lossy(&response).into_owned()
    }

    #[tokio::test]
    async fn listener_accepts_the_navigation_and_closes_after_the_first_delivery() {
        let listener = TcpListener::bind("127.0.0.1:0").await.unwrap();
        let address = listener.local_addr().unwrap();
        let code = Arc::new(Mutex::new(None));
        let task = tokio::spawn(accept_one_delivery(
            listener,
            "expected-state".to_string(),
            Arc::clone(&code),
            "https://avintra.example/accounts/desktop/returned".to_string(),
        ));

        let wrong_state = "GET /?code=one&state=wrong-state HTTP/1.1\r\nHost: 127.0.0.1\r\n\r\n";
        let navigation = "GET /?code=one&state=expected-state HTTP/1.1\r\nHost: 127.0.0.1\r\n\r\n";

        assert!(deliver(address, wrong_state)
            .await
            .starts_with("HTTP/1.1 400 Bad Request"));
        assert!(code.lock().unwrap().is_none());

        let accepted = deliver(address, navigation).await;
        assert!(accepted.starts_with("HTTP/1.1 303 See Other"), "{accepted}");
        assert!(
            accepted.contains("Location: https://avintra.example/accounts/desktop/returned"),
            "{accepted}"
        );
        task.await.unwrap();
        assert_eq!(code.lock().unwrap().as_deref(), Some("one"));
        assert!(TcpStream::connect(address).await.is_err());
    }

    #[tokio::test]
    async fn a_second_delivery_does_not_replace_the_first_code() {
        let listener = TcpListener::bind("127.0.0.1:0").await.unwrap();
        let address = listener.local_addr().unwrap();
        let code = Arc::new(Mutex::new(Some("first".to_string())));
        let task = tokio::spawn(accept_one_delivery(
            listener,
            "expected-state".to_string(),
            Arc::clone(&code),
            "https://avintra.example/accounts/desktop/returned".to_string(),
        ));
        let second = "GET /?code=second&state=expected-state HTTP/1.1\r\nHost: 127.0.0.1\r\n\r\n";

        assert!(deliver(address, second)
            .await
            .starts_with("HTTP/1.1 409 Conflict"));
        assert_eq!(code.lock().unwrap().as_deref(), Some("first"));

        task.abort();
    }
}
