import datetime
import json
import uuid
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.features.kokoro_tts import kokoro_tts_service
from app.features.kokoro_tts.kokoro_tts_schemas import KokoroTTSRequest
from app.websocket.manager import ConnectionManager
from app.core.security import get_user_from_token
from app.core.llm_service import LLMService
from app.core.logger import logger
from app.models.chat_message import ChatMessage
from app.qdrant.service import add_document_to_collection
from app.core.llm_service import generate_prompt_for_ai_persona
import time
import markdown2
import re
import html

# Create FastAPI router and initialize services
router = APIRouter()
connection_manager = ConnectionManager()
llm_service = LLMService()

def markdown_to_plain(text):
    # Convert Markdown to HTML
    html_text = markdown2.markdown(text)
    # Remove HTML tags
    plain = re.sub(r'<[^>]+>', '', html_text)
    # Unescape HTML entities
    plain = html.unescape(plain)
    # Normalize whitespace (optional)
    plain = re.sub(r'\\s+', ' ', plain)
    return plain.strip()

@router.websocket("/chat")
async def websocket_chat_handler(websocket: WebSocket):
    """
    WebSocket handler for real-time chat between authenticated users and the bot.
    Authenticates the user, processes messages, and returns responses from an LLM.
    """
    try:
        logger.info("WebSocket connection attempt received")

        # Step 1: Authenticate user from token query param
        token = websocket.query_params.get("token")
        model_id = websocket.query_params.get("model_id")
        if not token:
            logger.warning("No token provided — closing connection with 1008")
            await websocket.close(code=1008)
            return
        if not model_id:
            model_id = str(uuid.uuid4())  

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
        # # Step 3: Send initial message to the user
        # ai_intro_message = ChatMessage(
        #     model_id=user_info.id,
        #     user_id=user_info.id,
        #     user_type="AIPersona",
        #     message="Hi! How can I assist you today?",
        #     timestamp=str(datetime.datetime.now(datetime.timezone.utc)),
        #     file=None
        # )

        # # Step 4: Send the introductory message from the LLM
        # await connection_manager.send_personal_message(ai_intro_message.json(), connection_id)

        while True:
            # Step 5: Receive message from the client
            incoming_text = await websocket.receive_text()

            try:
                # Step 6: Parse JSON string into structured data
                message_data = json.loads(incoming_text)

                # Step 7: Construct user ChatMessage object
                user_message = ChatMessage(
                    model_id=message_data["model_id"],
                    user_id=user_info.id,
                    user_type="user",
                    message=message_data["messages"][-1]["content"],  # Assuming last message is user's message
                    timestamp=str(datetime.datetime.now(datetime.timezone.utc)),
                    file=message_data.get("file")  # Optional file
                )

            except Exception as parse_error:
                logger.warning(f"Invalid message format from user {user_info.id}: {parse_error}")
                await websocket.send_text(json.dumps({
                    "error": "Invalid message format. Please send valid JSON."
                }))
                continue

            # Step 8: Echo the user message back
            await connection_manager.send_personal_message(user_message.model_dump_json(), connection_id)

            # Step 9: Compose prompt for the language model with AI persona
            # llm_prompt = generate_prompt_for_ai_persona(model_id=user_message.model_id, user_query=user_message.message)
            logger.info(f"Prompt sent to LLM: {message_data['messages']}")

            # Step 10: Store user message in Qdrant
            # try:
            #     add_document_to_collection(user_message)
            # except Exception as e:
            #     logger.warning(f"Failed to store user message in Qdrant: {e}")
            
            # ---------------------------------------------------
            
            # Buffer for accumulating LLM output
            buffer = ""
            
            # This regex splits after ., !, or ? followed by space, newline, or end of string
            sentence_splitter = re.compile(r'(?<=[.!?])[\s\n]+')

            # Start Time
            start_time = time.perf_counter()

            async for chunk in llm_service.generate_response_stream(
                messages=message_data['messages'],
                model=message_data['llm'],
                temperature=message_data['temperature'],
            ):
                # Append chunk to buffer
                buffer += chunk
                
                # Split buffer into sentences, keeping the last incomplete fragment
                sentences = sentence_splitter.split(buffer)
                
                # All except the last are complete sentences
                for sentence in sentences[:-1]:
                    llm_text = sentence.strip()
                    if not llm_text:
                        continue
                    
                    # -----------------------------------
                    # Only call TTS if message_data['is_voice_enabled'] is True
                    if message_data.get('is_voice_enabled') is True:
                        # Convert markdown to plain text for TTS
                        text_for_tts = markdown_to_plain(llm_text)
                        
                        # Remove HTML tags left by markdown2
                        text_for_tts = re.sub(r'<[^>]+>', '', text_for_tts)
                        try:
                            logger.info(f"Calling Kokoro TTS for text: {text_for_tts}")
                            request = KokoroTTSRequest(
                                text=text_for_tts,
                                voice=message_data.get('voice_id') or 'af_heart',
                                lang_code=message_data.get('language_id') or 'a',
                                return_base64=True
                            )
                            audio_response = await kokoro_tts_service.synthesize(request)
                            if isinstance(audio_response, dict):
                                audio_b64 = audio_response.get("audio_base64")
                                audio_media_type = audio_response.get("media_type")
                            else:
                                audio_b64 = None
                                audio_media_type = None
                        except Exception as tts_err:
                            logger.error(f"Kokoro TTS failed: {tts_err}")
                            audio_b64 = None
                            audio_media_type = None
                    else:
                        audio_b64 = None
                        audio_media_type = None
                        
                    # -----------------------------------

                    ai_response_message = ChatMessage(
                        model_id=user_message.model_id,
                        user_id=user_info.id,
                        user_type="assistant",
                        message=llm_text,
                        timestamp=str(datetime.datetime.now(datetime.timezone.utc)),
                        audio=audio_b64,
                        audio_media_type=audio_media_type
                    )
                    await connection_manager.send_personal_message(ai_response_message.model_dump_json(), connection_id)
                
                # The last element is the incomplete fragment (or empty if buffer ended with a sentence)
                buffer = sentences[-1]
                    
            # End Time. Get total time taken for LLM response
            end_time = time.perf_counter()
            total_time = end_time - start_time

            # Send total time taken to client
            await connection_manager.send_personal_message(json.dumps({
                "user_type": "system",
                "message_type": "credits_usage",
                "service_type": "OnPremGpuText",
                "consumed_units": int(total_time)
            }), connection_id)

            # Step 14: Store AI response message in Qdrant
            # try:
            #     add_document_to_collection(ai_response_message)
            # except Exception as e:
            #     logger.warning(f"Failed to store AI response message in Qdrant: {e}")

    except WebSocketDisconnect:
        # Graceful disconnection
        logger.info(f"User {user_info.id} disconnected. Connection ID: {connection_id}")
        connection_manager.disconnect(connection_id)

    except Exception as unexpected_error:
        # Handle other unexpected exceptions
        logger.error(f"Unexpected error for user {user_info.id}: {unexpected_error}")
        await websocket.close(code=1011)
        connection_manager.disconnect(connection_id)