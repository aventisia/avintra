use futures_util::{SinkExt, StreamExt};
use std::sync::{Arc, Mutex};
use tokio::net::TcpListener;
use std::net::SocketAddr;
use tokio_tungstenite::accept_async;

pub async fn start_websocket_server() {
    let addr = "127.0.0.1:9001".parse::<SocketAddr>().unwrap();
    let listener = TcpListener::bind(&addr).await.expect("Failed to bind");
    println!("WebSocket server running at ws://{}", addr);

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
