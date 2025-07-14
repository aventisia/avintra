import datetime
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websocket.manager import ConnectionManager
from app.core.security import get_user_from_token
from app.core.llm_service import LLMService
from app.core.logger import logger
from app.models.chat_message import ChatMessage
from app.qdrant.service import add_document_to_collection
from app.core.llm_service import generate_prompt_for_ai_persona

# Create FastAPI router and initialize services
router = APIRouter()
connection_manager = ConnectionManager()
llm_service = LLMService()

@router.websocket("/chat")
async def websocket_chat_handler(websocket: WebSocket):
    """
    WebSocket handler for real-time chat between authenticated users and the bot.
    Authenticates the user, processes messages, and returns responses from an LLM.
    """
    try:
        logger.info("🔌 WebSocket connection attempt received")

        # Step 1: Authenticate user from token query param
        token = websocket.query_params.get("token")
        if not token:
            logger.warning("❌ No token provided — closing connection with 1008")
            await websocket.close(code=1008)  # Policy Violation
            return

        user_info = get_user_from_token(token)
        logger.info(f"User authenticated: {user_info.id}")

    except ValueError as auth_error:
        logger.warning(f"Authentication failed for token '{token}': {auth_error}")
        await websocket.close(code=1008)
        return

    # Step 2: Establish connection for the authenticated user
    connection_id = await connection_manager.connect(websocket, user_info.id)
    logger.info(f"User {user_info.id} connected. Connection ID: {connection_id}")

    try:
        while True:
            # Step 3: Receive message from the client
            incoming_text = await websocket.receive_text()
            logger.info(f"Received raw message from user {user_info.id}: {incoming_text}")

            try:
                # Step 4: Parse JSON string into structured data
                message_data = json.loads(incoming_text)

                # Step 5: Construct user ChatMessage object
                user_message = ChatMessage(
                    model_id=message_data["model_id"],
                    user_id=user_info.id,
                    user_type="User",
                    message=message_data["message"],
                    timestamp=str(datetime.datetime.utcnow()),
                    file=message_data.get("file")  # Optional file
                )
                logger.info(f"Structured user message: {user_message}")

            except Exception as parse_error:
                logger.warning(f"Invalid message format from user {user_info.id}: {parse_error}")
                await websocket.send_text(json.dumps({
                    "error": "Invalid message format. Please send valid JSON."
                }))
                continue

            # Step 6: Echo the user message back
            await connection_manager.send_personal_message(user_message.dict(), connection_id)

            # Step 7: Store user message in Qdrant
            try:
                add_document_to_collection(user_message)
                logger.info(f"User message stored in Qdrant.")
            except Exception as e:
                logger.warning(f"Failed to store user message in Qdrant: {e}")

            # Step 8: Compose prompt for the language model with AI persona
            llm_prompt = generate_prompt_for_ai_persona(model_id=user_message.model_id, user_query= user_message.message)
            logger.info(f"Prompt sent to LLM: {llm_prompt}")

            # Step 9: Get a response from the LLM
            llm_response = await llm_service.generate_response(
                prompt=llm_prompt,
                model="gemma",
                temperature=0.7,
            )
            ai_reply_text = llm_response.get("response", "I'm sorry, I couldn't process your request. Please try again.").strip()

            # Step 10: Create AI response message with updated variable names
            ai_response_message = ChatMessage(
                model_id=user_message.model_id,
                user_id=user_info.id,
                user_type="AIPersona",
                message=ai_reply_text,
                timestamp=str(datetime.datetime.utcnow()),
                file=None
            )

            # Step 11: Send AI response message to the client
            await connection_manager.send_personal_message(ai_response_message.dict(), connection_id)

            # Step 12: Store AI response message in Qdrant
            add_document_to_collection(ai_response_message)
            try:
                logger.info("AI response message stored in Qdrant.")
            except Exception as e:
                logger.warning(f"Failed to store AI response message in Qdrant: {e}")

    except WebSocketDisconnect:
        # Graceful disconnection
        logger.info(f"User {user_info.id} disconnected. Connection ID: {connection_id}")
        connection_manager.disconnect(connection_id)

    except Exception as unexpected_error:
        # Handle other unexpected exceptions
        logger.error(f"Unexpected error for user {user_info.id}: {unexpected_error}")
        await websocket.close(code=1011)
        connection_manager.disconnect(connection_id)
