/* eslint-disable @typescript-eslint/no-explicit-any */
import { useExtractViaLLMMutation } from "@/hooks/useExtractViaLLMMutation";
import { useFetchProjectMetaData } from "@/hooks/useFetchProjectMetaData";
import { useFetchUserSession } from "@/hooks/useUserSession";
import { DEV_JWT_LS_KEY } from "@/react-toolkit/constants";

import { Button } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";
import { toast } from "@aventisia/ui/sonner";
import {
  ChatCanvas,
  ChatInput,
  ChatMessage,
  ChatMessages,
  ChatSection,
  useFile,
} from "@llamaindex/chat-ui";
import "@llamaindex/chat-ui/styles/markdown.css";
import "@llamaindex/chat-ui/styles/pdf.css";
import { MicIcon, Volume2Icon, VolumeXIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { useShallow } from "zustand/react/shallow";

import { useFetchSetupFormData } from "../../hooks/useFetchSetupFormData";
import { useTempChatStore } from "../../store/temp-chat-store";
import { generateSystemMessage } from "../../utils/generate-system-message";

type MessageRole = "system" | "user" | "assistant" | "data";
interface Message {
  content: string;
  role: MessageRole;
  annotations?: any[];
}

function AIPersonaTestForm() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const [wsStatus, setWsStatus] = useState<
    "connecting" | "connected" | "failed"
  >("connecting");

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { data: modelData } = useFetchProjectMetaData();

  // -----------------------------------------------
  // Is voice enabled
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  // Audio queue and ref
  const [audioQueue, setAudioQueue] = useState<
    { base64: string; mimeType: string }[]
  >([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingRef = useRef(false);

  // Get temp chat store state and actions
  const {
    chatConfig: {
      llm,
      assistantName,
      systemPrompt,
      temperature,
      maxMessagesInContext,
      languageId,
      voiceId,
    },
    messagesToSend,
    setChatConfig,
    setMessagesToSend,
  } = useTempChatStore(
    useShallow((state) => ({
      chatConfig: state.chatConfig,
      messagesToSend: state.messagesToSend,
      setChatConfig: state.setChatConfig,
      setMessagesToSend: state.setMessagesToSend,
    })),
  );

  // Fetch persona setup data
  const { data: personaData } = useFetchSetupFormData();

  // Get update credits used mutation
  const { updateCreditsUsed } = useExtractViaLLMMutation();

  // Generate and add system message when personaData is available
  useEffect(() => {
    if (personaData && personaData.data && personaData.data.aiPersona) {
      // Set chat config in temp chat store
      setChatConfig({
        llm: personaData.data.aiPersona.llm,
        assistantName: personaData.data.aiPersona.setupObject.name,
        systemPrompt: generateSystemMessage(personaData.data),
        temperature: personaData.data.aiPersona.temperature,
        maxMessagesInContext:
          Number(
            personaData.data.aiPersona.setupObject.contextMemoryTimeframe,
          ) * 2 || 4, // x2 for user and assistant messages
        languageId:
          personaData.data.aiPersona.setupObject?.speechConfiguration
            ?.onPremConfig?.language,
        voiceId:
          personaData.data.aiPersona.setupObject?.speechConfiguration
            ?.onPremConfig?.voice,
      });

      // Set IsVoiceEnabled based on speech configuration
      setIsVoiceEnabled(
        personaData.data.aiPersona.setupObject?.speechConfiguration
          ?.onPremConfig?.language &&
          personaData.data.aiPersona.setupObject?.speechConfiguration
            ?.onPremConfig?.voice
          ? true
          : false,
      );
    }
  }, [personaData, setChatConfig, setMessagesToSend]);

  // Play audio from queue
  useEffect(() => {
    if (!isPlayingRef.current && audioQueue.length > 0) {
      const { base64, mimeType } = audioQueue[0];
      isPlayingRef.current = true;

      // Convert base64 to audio and play
      const audioBytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      const audioBlob = new Blob([audioBytes], { type: mimeType });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        isPlayingRef.current = false;
        setAudioQueue((q) => q.slice(1)); // Remove the played chunk
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        isPlayingRef.current = false;
        setAudioQueue((q) => q.slice(1));
        URL.revokeObjectURL(audioUrl);
      };

      audio.play();
    }
  }, [audioQueue]);

  // -----------------------------------------------

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const { imageUrl, getAnnotations, uploadFile, reset } = useFile({
    uploadAPI: "/fake-upload-endpoint",
  });

  const annotations = getAnnotations();

  const modelId = modelData?.data.id || "";
  const modelName = modelData?.data.name || "";
  const { data } = useFetchUserSession();
  const token = import.meta.env.DEV
    ? localStorage.getItem(DEV_JWT_LS_KEY)
    : data?.data.accessToken;

  // Reflect transcript in input
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  // WebSocket setup
  useEffect(() => {
    if (!token) return;

    const socket = new WebSocket(
      `${import.meta.env.VITE_LLMPIPELINE_API_PATH}/chat?token=${token}`,
    );

    socketRef.current = socket;

    socket.onopen = () => {
      setWs(socket);
      setWsStatus("connected");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // If message from assistant
        if (data.user_type === "assistant" && data.message) {
          // Stop loading state on first chunk of assistant message
          setIsLoading(false);

          // Add assistant message to messagesToSend
          setMessagesToSend({ role: "assistant", content: data.message });

          // Enqueue audio if present
          if (data.audio) {
            setAudioQueue((q) => [
              ...q,
              {
                base64: data.audio,
                mimeType: data.audio_media_type || "audio/mpeg",
              },
            ]);
          }

          // Update messages state to display
          setMessages((prev) => {
            if (prev.length > 0 && prev[prev.length - 1].role === "assistant") {
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                content:
                  updated[updated.length - 1].content + " " + data.message, // append the new word
              };
              return updated;
            } else {
              return [...prev, { role: "assistant", content: data.message }];
            }
          });
        }

        // If message from backend/system for execution_time
        if (
          data.user_type === "system" &&
          data.message_type === "credits_usage"
        ) {
          // TODO: Update units/credits used. For now we are making an api call due to database split but later we should update it from the backend itself
          updateCreditsUsed({
            serviceType: data.service_type,
            consumedUnit: Number(data.consumed_units),
            refType: "AIModel",
            refId: modelId,
            refName: modelName,
          });
        }
      } catch (error) {
        console.error("WebSocket message parsing error:", error);
      }
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
      setWsStatus("failed");
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
      setWsStatus("failed");
    };

    return () => {
      socket.close();
    };
  }, [token, modelId, modelName, setMessagesToSend, updateCreditsUsed]);

  // File upload handler
  const handleUpload = async (file: File) => {
    try {
      await uploadFile(file);
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  // Chat handler
  const handler = {
    input,
    setInput: (val: string) => setInput(val),
    isLoading,
    messages,
    stop: () => {},

    append: async (message: Message) => {
      const msgWithFiles = {
        ...message,
        annotations,
      };

      // -----------------------------------------------

      // Prevent sending empty messages
      if (message.content.trim() === "") {
        toast.error("Cannot send empty message");
        return null;
      }

      // Add user message to messagesToSend
      setMessagesToSend({ role: "user", content: message.content });

      // -----------------------------------------------

      setMessages((prev) => [...prev, msgWithFiles]);

      if (
        message.role === "user" &&
        socketRef.current?.readyState === WebSocket.OPEN
      ) {
        // Set loading state
        setIsLoading(true);

        // Clear audio queue and stop any ongoing playback
        setAudioQueue([]);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        isPlayingRef.current = false;

        // Prepare payload
        const msgPayload = {
          model_id: modelId,
          llm: llm,
          temperature: temperature,
          is_voice_enabled: isVoiceEnabled,
          language_id: languageId,
          voice_id: voiceId,
          messages: [
            { role: "system", content: systemPrompt },
            ...(maxMessagesInContext < messagesToSend.length
              ? messagesToSend.slice(-maxMessagesInContext)
              : messagesToSend),
            { role: "user", content: message.content },
          ],
          file: null,
        };

        try {
          socketRef.current.send(JSON.stringify(msgPayload));
        } catch (e) {
          console.error("Send failed:", e);
          toast.error("Failed to send message");
        }
      }

      reset(); // Clear uploaded files after sending
      return null;
    },
  };

  return (
    <ChatSection handler={handler} className="p-0">
      <ChatMessages className="">
        <ChatMessages.List>
          {messages.map((message, index) => (
            <ChatMessage
              className="p-0 text-md items-start"
              key={index}
              message={message}
              isLast={true}
            >
              <ChatMessage.Avatar />
              <ChatMessage.Content
                isLoading={isLoading}
                append={handler.append}
              >
                <ChatMessage.Content.Markdown />
                <div className="w-1/4 self-end">
                  <ChatMessage.Content.Image />
                </div>
                <ChatMessage.Content.DocumentFile />
              </ChatMessage.Content>
            </ChatMessage>
          ))}
          <ChatMessages.Loading className="justify-start">
            <div className="animate-pulse">Thinking...</div>
          </ChatMessages.Loading>
        </ChatMessages.List>

        <ChatMessages.Empty
          children={
            wsStatus === "connecting" ? (
              <p className="animate-pulse text-base text-center">
                Initializing chat, please wait...
              </p>
            ) : wsStatus === "connected" && ws ? (
              <div className="text-center space-y-2 mb-4">
                <p className="max-w-lg md:max-w-2xl text-md text-muted-foreground mx-auto">
                  {assistantName ? (
                    <>Start chatting with {assistantName}!</>
                  ) : (
                    <>Setup your AI Persona to start chatting</>
                  )}
                </p>
              </div>
            ) : (
              <p className="text-base text-center text-red-500">
                {assistantName && (
                  <>Failed to create chat, please try again...</>
                )}
              </p>
            )
          }
        />
      </ChatMessages>

      <ChatCanvas className="w-1/3" />

      <ChatInput
        annotations={annotations}
        resetUploadedFiles={reset}
        className={cn(
          "px-4 pb-14 box-border flex flex-col shrink-0",
          assistantName ? "flex" : "hidden",
        )}
      >
        {imageUrl && (
          <div className="px-4">
            <img
              className="max-h-[100px] object-contain rounded-md border"
              src={imageUrl}
              alt="Uploaded preview"
            />
          </div>
        )}
        <ChatInput.Form>
          <ChatInput.Field
            className="rounded-lg box-border bg-accent focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:outline-none text-md min-h-0 h-24 max-h-52 px-4 py-5"
            placeholder="Type your message..."
          />
          <div className="absolute right-14 bottom-2">
            <Button
              type="button"
              onClick={() => {
                setIsVoiceEnabled((prev) => !prev);
              }}
              className={cn(
                `p-2 rounded-full text-accent-foreground h-10 w-10`,
                listening && "text-white",
              )}
              variant="ghost"
            >
              {isVoiceEnabled ? <Volume2Icon /> : <VolumeXIcon />}
            </Button>
            {browserSupportsSpeechRecognition && (
              <Button
                type="button"
                onClick={() => {
                  if (listening) {
                    SpeechRecognition.stopListening();
                  } else {
                    resetTranscript();
                    SpeechRecognition.startListening({ continuous: true });
                  }
                }}
                className={cn(
                  `p-2 rounded-full text-accent-foreground h-10 w-10`,
                  listening && "text-white",
                )}
                variant={listening ? "default" : "ghost"}
              >
                <MicIcon />
              </Button>
            )}
          </div>

          <ChatInput.Upload
            multiple={true}
            onUpload={handleUpload}
            className="[&>label]:bg-accent [&>label]:text-accent-foreground [&>label]:p-0"
          />
          <ChatInput.Submit className="bottom-2" />
        </ChatInput.Form>
      </ChatInput>
    </ChatSection>
  );
}

export default AIPersonaTestForm;

// Alow multiple file uploads
// Add support for other file than images
//
