/* eslint-disable @typescript-eslint/no-explicit-any */
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
import * as signalR from "@microsoft/signalr";
import { MicIcon } from "lucide-react";
import { useEffect, useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

type MessageRole = "system" | "user" | "assistant" | "data";
interface Message {
  content: string;
  role: MessageRole;
  annotations?: any[];
}

function AIPersonaTestForm() {
  const [conn, setConn] = useState<signalR.HubConnection | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  // Reflect transcript in input
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  // SignalR setup
  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${import.meta.env.VITE_AI_STUDIO_API_URL}/chatHub`)
      .withAutomaticReconnect()
      .build();

    let mounted = true;
    connection
      .start()
      .then(() => {
        if (!mounted) return;
        setConn(connection);
      })
      .catch(
        () =>
          mounted &&
          toast.error("Failed to establish connection. Please try again..."),
      );

    connection.on("ReceiveMessage", (userType: string, msg: string) => {
      if (userType === "ChatBot") {
        setMessages((prev) => [...prev, { role: "assistant", content: msg }]);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      connection.stop();
    };
  }, []);

  // File upload handler
  const handleUpload = async (file: File) => {
    try {
      await uploadFile(file);
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  // Custom chat handler
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

      if (message.role === "user" && conn) {
        setIsLoading(true);
        try {
          await conn.invoke("SendMessageAsync", message.content);
        } catch {
          toast.error("Failed to send message");
        }
      }

      reset(); // Clear uploaded files after sending
      return null;
    },
  };

  return (
    <div className="flex flex-col">
      <ChatSection handler={handler} className="pb-0">
        <div className="flex w-full flex-col gap-4 mx-auto h-[calc(100vh-9.5rem)] overflow-hidden p-0 md:p-5 md:pb-3">
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
                isLoading ? (
                  <p className="animate-[slide-up_0.5s_ease-out] text-base [animation-delay:300ms] [animation-fill-mode:forwards] text-center">
                    Initializing chat, please wait...
                  </p>
                ) : conn ? (
                  <>
                    <p className="mb-2 animate-[slide-up_0.5s_ease-out] text-3xl text-center font-semibold [animation-delay:100ms] [animation-fill-mode:forwards]">
                      Hello there!
                    </p>
                    <p className="text-muted-foreground animate-[slide-up_0.5s_ease-out] text-center text-lg [animation-delay:300ms] [animation-fill-mode:forwards]">
                      I'm here to help you with your questions.
                    </p>
                  </>
                ) : (
                  <p className="animate-[slide-up_0.5s_ease-out] text-base [animation-delay:300ms] [animation-fill-mode:forwards] text-center">
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
                className=" rounded-lg box-border bg-accent focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:outline-none text-md min-h-0 h-24 max-h-52 px-4 py-5"
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
                className="[&>label]:bg-accent [&>label]:text-accent-foreground [&>label]:p-0"
              />
              <ChatInput.Submit className="bottom-2" />
            </ChatInput.Form>
          </ChatInput>
        </div>
      </ChatSection>
    </div>
  );
}

export default AIPersonaTestForm;

// Alow multiple file uploads
// Add support for other file than images
//
