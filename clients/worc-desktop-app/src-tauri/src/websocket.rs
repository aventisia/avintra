use futures_util::{SinkExt, StreamExt};
use once_cell::sync::OnceCell;
use std::net::SocketAddr;
use std::sync::{Arc, Mutex};
use tokio::net::TcpListener;
use tokio_tungstenite::accept_async;

static WEBSOCKET_PORT: OnceCell<u16> = OnceCell::new();

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
            println!("New WebSocket connection");

            let (mut write, mut read) = ws_stream.split();
            let (tx, mut rx) = tokio::sync::mpsc::unbounded_channel();

            {
                let mut peers = peer_list.lock().unwrap();
                peers.push(tx.clone());
            }

            // Reading from client
            let peer_list_read = Arc::clone(&peer_list);
            tokio::spawn(async move {
                while let Some(Ok(msg)) = read.next().await {
                    if msg.is_text() {
                        let peers = peer_list_read.lock().unwrap();
                        for peer in peers.iter() {
                            // Broadcast to all peers
                            let _ = peer.send(msg.clone());
                        }
                    }
                }
            });

            // Writing to client
            while let Some(msg) = rx.recv().await {
                if write.send(msg).await.is_err() {
                    break;
                }
            }
        });
    }
}
