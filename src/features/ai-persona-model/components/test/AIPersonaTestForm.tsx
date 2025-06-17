/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";
import { toast } from "@aventisia/ui/sonner";
// ChatUI core
import {
  ChatCanvas,
  ChatInput,
  ChatMessage,
  ChatMessages,
  ChatSection,
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

  // When transcript updates, reflect it in the input
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  // SignalR setup
  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://dev-mlmodelbuilder.aventisia.com/api/chatHub")
      .withAutomaticReconnect()
      .build();

    let mounted = true;
    connection
      .start()
      .then(() => {
        if (!mounted) return;
        // toast.success("Socket connected");
        setConn(connection);
      })
      .catch(
        () =>
          mounted &&
          toast.error("Falied to establish connection. Please try again..."),
      );

    connection.on("ReceiveMessage", (userType: string, msg: string) => {
      // Only handle assistant responses
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

  // Custom ChatHandler implementation
  const handler = {
    input,
    setInput: (val: string) => setInput(val),
    isLoading,
    messages,

    stop: () => {
      /* e.g. cancel socket streaming if you supported it */
    },

    // append must return a Promise<string|null|undefined>
    append: async (message: Message) => {
      // Immediately show this message in UI
      setMessages((prev) => [...prev, message]);

      if (message.role === "user" && conn) {
        setIsLoading(true);
        try {
          await conn.invoke("SendMessageAsync", message.content);
        } catch {
          toast.error("Failed to send");
        }
      }

      // You can return an ID or metadata, or null if none.
      return null;
    },
  };

  return (
    <div className="flex flex-col">
      <ChatSection handler={handler} className="pb-0">
        <div className="flex w-full flex-col gap-4 mx-auto h-[calc(100vh-9.5rem)] overflow-hidden p-0 md:p-5 md:pb-3">
          {/* <ScrollArea className="flex-grow h-[calc(100vh-17rem)] pr-4"> */}
          <ChatMessages className="p-0">
            <ChatMessages.List>
              {messages.map((message, index) => (
                <ChatMessage
                  className="p-0 text-md"
                  key={index}
                  message={message}
                  isLast={true}
                />
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
                ) : !isLoading && conn ? (
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
          {/* </ScrollArea> */}

          <ChatInput className="p-0 box-border flex flex-col shrink-0">
            <ChatInput.Form className="">
              <ChatInput.Field
                className=" rounded-lg box-border bg-accent focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:outline-none text-md min-h-0 h-28 max-h-52 px-4 py-5"
                placeholder="Type your message..."
              />
              {/* <ChatInput.Upload /> */}
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
              <ChatInput.Submit className="bottom-2" />
              <ChatInput.Upload
                className="[&>label]:bg-accent [&>label]:text-accent-foreground [&>label]:p-0"
                allowedExtensions={[".pdf", ".jpeg", ".jpg", ".png"]}
                multiple={true}
              />
            </ChatInput.Form>
          </ChatInput>
        </div>
      </ChatSection>
    </div>
  );
}

export default AIPersonaTestForm;
