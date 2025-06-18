import datetime
from sqlite3.dbapi2 import Timestamp
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websocket.manager import ConnectionManager
from app.core.security import get_user_from_token
from app.core.llm_service import LLMService
from app.core.logger import logger

# Initialize router and services
router = APIRouter()
manager = ConnectionManager()
llm_service = LLMService()

@router.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint to handle incoming messages from clients. It authenticates the
    user, sends responses from the chatbot, and handles connection management.
    """
    
    # Try to authenticate the user using the provided token
    try:
        token = websocket.query_params.get('token')
        if not token:
            await websocket.close(code=1008)  # Policy Violation
            return
        user_info = get_user_from_token(token)
        logger.info(f"User authenticated: {user_info.id}")
    except ValueError as e:
        # Log authentication failure and close connection with error code 1008 (policy violation)
        logger.warning(f"Authentication failed for token {token}: {e}")
        await websocket.close(code=1008)
        return

    # Successfully authenticated, connect the user
    connection_id = await manager.connect(websocket, user_info.id)
    logger.info(f"User {user_info.id} connected: ConnID={connection_id}")
    
    try:
        while True:
            # Receive a message from the client
            message = await websocket.receive_text()
            logger.info(f"Received message from user {user_info.id}: {message}")
            
            # Send the user's message back as a confirmation
            user_message = bot_message = {
                "username": "User",
                "message": message,
                "timestamp": str(datetime.datetime.utcnow)  # Timestamp in ISO 8601 format
            }
            await manager.send_personal_message(user_message, connection_id)

            # Prepare and send prompt to LLM
            prompt = f"You are a helpful assistant. Answer: {message}"
            logger.info(f"Sending prompt to LLM: {prompt}")
            
            # Get the LLM's response
            response = await llm_service.extract_data(prompt, "gemma", 0.7)
            logger.info(f"Received response from LLM: {response['Data']}")

            # Send LLM response to the client as the bot's message
            bot_message = {
                "username": "Bot",
                "message": response['Data'],
                "timestamp": str(datetime.datetime.utcnow)  # Timestamp in ISO 8601 format
            }
            await manager.send_personal_message(bot_message, connection_id)

    except WebSocketDisconnect:
        # Handle the case when a WebSocket disconnects
        logger.info(f"User {user_info.id} disconnected: ConnID={connection_id}")
        manager.disconnect(connection_id)
    
    except Exception as e:
        # Handle other unexpected errors gracefully
        logger.error(f"Unexpected error: {e}")
        await websocket.close(code=1011)  # Internal error
        manager.disconnect(connection_id)
