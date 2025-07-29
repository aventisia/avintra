/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFetchModel } from "@/features/label-data/hooks/useFetchModel";
import { useFetchUserSession } from "@/hooks/useUserSession";

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
import { MicIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

type MessageRole = "system" | "user" | "assistant" | "data";
interface Message {
  content: string;
  role: MessageRole;
  annotations?: any[];
}

function LLMChat() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const [wsStatus, setWsStatus] = useState<
    "connecting" | "connected" | "failed"
  >("connecting");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { data: modelData } = useFetchModel();

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
  const { data } = useFetchUserSession();
  const token = data?.data.accessToken || "";

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
      `${import.meta.env.VITE_LLMPIPELINE_API_URL}/chat?token=${token}`,
    );

    socketRef.current = socket;

    socket.onopen = () => {
      toast.success("Chat created");
      setWs(socket);
      setWsStatus("connected"); // ✅ Connected
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.user_type === "AIPersona" && data.message) {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: data.message },
          ]);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("WebSocket message parsing error:", error);
      }
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
      if (wsStatus !== "connected") {
        setWsStatus("failed"); // ✅ Failed if it never connected
      }
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
      toast.error("WebSocket connection failed.");
      setWsStatus("failed"); // ✅ Failed
    };

    return () => {
      socket.close();
    };
  }, [token]);

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

      setMessages((prev) => [...prev, msgWithFiles]);

      if (
        message.role === "user" &&
        socketRef.current?.readyState === WebSocket.OPEN
      ) {
        setIsLoading(true);
        const msgPayload = {
          model_id: modelId,
          message: message.content,
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
    <div className="flex flex-col w-full md:w-[80%] mx-auto">
      <ChatSection handler={handler} className="pb-0">
        <div className="flex w-full flex-col gap-4 mx-auto max-h-[calc(100vh-9.5rem)] overflow-hidden p-0 md:p-5 md:pb-3">
          <ChatMessages className="p-0">
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
                  <p className="animate-pulse text-xl font-semibold text-center">
                    Initializing chat, please wait...
                  </p>
                ) : wsStatus === "connected" && ws ? (
                  <div className="text-center space-y-2 mb-4">
                    <h1 className="text-xl md:text-3xl xl:text-4xl font-semibold ">
                      Welcome to <span className="text-primary">AI Studio</span>
                    </h1>
                    <p className="max-w-lg md:max-w-2xl text-md md:text-base text-muted-foreground mx-auto">
                      Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                      Impedit quos reprehenderit repellendus autem, magni
                      doloremque nemo ratione explicabo cum ex.
                    </p>
                  </div>
                ) : (
                  <p className="text-base text-center text-red-500">
                    Failed to create chat, please try again...
                  </p>
                )
              }
            />
          </ChatMessages>

          <ChatCanvas className="w-1/3" />

          <ChatInput
            annotations={annotations}
            resetUploadedFiles={reset}
            className="p-0 box-border flex flex-col shrink-0"
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
                className=" rounded-lg box-border bg-white focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:outline-none text-md min-h-0 h-24 max-h-52 px-4 py-5 mx-auto"
                placeholder="Type your message..."
              />
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
                    `absolute right-14 bottom-2 p-2 rounded-full text-accent-foreground h-10 w-10`,
                    listening && "text-white",
                  )}
                  variant={listening ? "default" : "ghost"}
                >
                  <MicIcon />
                </Button>
              )}
              <ChatInput.Upload
                // allowedExtensions={[".pdf", ".jpeg", ".jpg", ".png"]}
                multiple={true}
                onUpload={handleUpload}
                className="[&>label]:bg-white [&>label]:text-accent-foreground [&>label]:p-0 "
              />
              <ChatInput.Submit className="bottom-2" />
            </ChatInput.Form>
          </ChatInput>
        </div>
      </ChatSection>
    </div>
  );
}

export default LLMChat;
