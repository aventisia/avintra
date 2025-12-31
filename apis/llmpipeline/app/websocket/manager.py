from fastapi import WebSocket
from typing import Dict
import uuid
from app.core.logger import logger

class ConnectionManager:
    def __init__(self):
        # A dictionary to keep track of active connections
        self.active_connections: Dict[str, WebSocket] = {}
        # A dictionary to map each connection ID to a user ID
        self.user_connection_map: Dict[str, str] = {}

    async def connect(self, websocket: WebSocket, user_id: str) -> str:
        """
        Called when a client connects to the WebSocket. 
        Maps the connection ID to a user ID and logs the connection.
        """
        await websocket.accept()  # Accept the WebSocket connection

        # Generate a unique connection ID for this session
        connection_id = str(uuid.uuid4())
        
        # Add the connection and user mapping to the active connections
        self.active_connections[connection_id] = websocket
        self.user_connection_map[connection_id] = user_id
        
        # Log the successful connection
        logger.info(f"Connected: ConnID={connection_id}, UserID={user_id}")

        return connection_id

    def disconnect(self, connection_id: str):
        """
        Called when a client disconnects. 
        Removes the connection and user mapping from the active connections.
        """
        # Retrieve the user ID associated with the connection and remove both mappings
        user_id = self.user_connection_map.pop(connection_id, None)
        self.active_connections.pop(connection_id, None)
        
        # Log the disconnection
        logger.info(f"Disconnected: ConnID={connection_id}, UserID={user_id}")

    async def send_personal_message(self, message: str, connection_id: str):
        """
        Sends a message to a specific connection (client).
        """
        # Check if the connection ID exists in the active connections
        if connection_id in self.active_connections:

            # Send the message to the WebSocket client as a JSON string
            await self.active_connections[connection_id].send_text(str(message))
            
            # logger.info(f"Sent message to ConnID={connection_id}: {message}")

    def get_connection_id_by_user(self, user_id: str) -> str:
        """
        Given a user ID, find the associated connection ID.
        """
        for conn_id, uid in self.user_connection_map.items():
            if uid == user_id:
                logger.info(f"Found ConnID={conn_id} for UserID={user_id}")
                return conn_id
        logger.warning(f"Connection not found for UserID={user_id}")
        return None
