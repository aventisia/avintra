use futures_util::{SinkExt, StreamExt};
use once_cell::sync::OnceCell;
use std::net::SocketAddr;
use std::sync::atomic::Ordering;
use std::sync::{Arc, Mutex};
use tokio::net::TcpListener;
use tokio::sync::mpsc::UnboundedSender;
use tokio_tungstenite::accept_async;

static WEBSOCKET_PORT: OnceCell<u16> = OnceCell::new();

fn remove_peer(peers: &Arc<Mutex<Vec<UnboundedSender<tokio_tungstenite::tungstenite::Message>>>>, tx: &UnboundedSender<tokio_tungstenite::tungstenite::Message>) {
    let mut peers = peers.lock().unwrap();
    peers.retain(|p| !p.same_channel(tx));
    println!("WebSocket peer removed (peers: {})", peers.len());
}

#[tauri::command]
pub fn get_websocket_port() -> Option<u16> {
    WEBSOCKET_PORT.get().copied()
}

pub async fn start_websocket_server() {
    let addr = "127.0.0.1:0".parse::<SocketAddr>().unwrap();
    let listener = TcpListener::bind(&addr).await.expect("Failed to bind");
    let actual_addr = listener.local_addr().expect("Failed to get local address");
    let _ = WEBSOCKET_PORT.set(actual_addr.port());
    println!("WebSocket server running at ws://{}", actual_addr);

    let peers = Arc::new(Mutex::new(Vec::new()));

    while let Ok((stream, _)) = listener.accept().await {
        let peer_list = Arc::clone(&peers);

        tokio::spawn(async move {
            let ws_stream = accept_async(stream).await.expect("Failed to accept");
            let (mut write, mut read) = ws_stream.split();
            let (tx, mut rx) = tokio::sync::mpsc::unbounded_channel();

            {
                let mut peers = peer_list.lock().unwrap();
                peers.push(tx.clone());
                println!("New WebSocket connection (peers: {})", peers.len());
            }

            let removed = Arc::new(std::sync::atomic::AtomicBool::new(false));

            // Reading from client
            let peer_list_read = Arc::clone(&peer_list);
            let tx_read = tx.clone();
            let removed_read = Arc::clone(&removed);
            let read_handle = tokio::spawn(async move {
                while let Some(Ok(msg)) = read.next().await {
                    if msg.is_text() {
                        let peers = peer_list_read.lock().unwrap();
                        for peer in peers.iter() {
                            // Broadcast to all peers
                            let _ = peer.send(msg.clone());
                        }
                    }
                }
                if removed_read
                    .compare_exchange(false, true, Ordering::SeqCst, Ordering::SeqCst)
                    .is_ok()
                {
                    remove_peer(&peer_list_read, &tx_read);
                }
            });

            // Writing to client
            let peer_list_write = Arc::clone(&peer_list);
            let removed_write = Arc::clone(&removed);
            let write_handle = tokio::spawn(async move {
                while let Some(msg) = rx.recv().await {
                    if write.send(msg).await.is_err() {
                        break;
                    }
                }
                if removed_write
                    .compare_exchange(false, true, Ordering::SeqCst, Ordering::SeqCst)
                    .is_ok()
                {
                    remove_peer(&peer_list_write, &tx);
                }
            });

            // Wait for either half to end.
            tokio::select! {
                _ = read_handle => (),
                _ = write_handle => (),
            }
        });
    }
}
