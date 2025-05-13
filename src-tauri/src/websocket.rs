use std::net::SocketAddr;
use futures_util::{StreamExt, SinkExt};
use tokio::net::TcpListener;
use tokio_tungstenite::accept_async;

// Function to run a basic echo WebSocket server
pub async fn start_websocket_server() {
    let addr = "127.0.0.1:9001".parse::<SocketAddr>().unwrap();
    let listener = TcpListener::bind(&addr).await.expect("Failed to bind");

    println!("WebSocket server running at ws://{}", addr);

    while let Ok((stream, _)) = listener.accept().await {
        tokio::spawn(async move {
        let ws_stream = accept_async(stream).await.expect("Failed to accept");
        println!("New WebSocket connection");

        let (mut write, mut read) = ws_stream.split();

        while let Some(msg) = read.next().await {
            if let Ok(msg) = msg {
            println!("Received: {}", msg);
            write.send(msg).await.expect("Failed to send");
            }
        }
        });
    }
}