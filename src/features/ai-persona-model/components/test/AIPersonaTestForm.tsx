import { Input } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { ScrollArea } from "@aventisia/ui/scroll";
import { toast } from "@aventisia/ui/sonner";
import * as signalR from "@microsoft/signalr";
import React, { useEffect, useState } from "react";

const AIPersonaTestForm: React.FC = () => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(
    null,
  );
  const [messages, setMessages] = useState<
    { sender: "user" | "bot"; text: string }[]
  >([]);
  const [inputText, setInputText] = useState("");
  const [chatCreated, setChatCreated] = useState<boolean>(false);

  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl("https://dev-mlmodelbuilder.aventisia.com/api/chatHub")
      .withAutomaticReconnect()
      .build();

    newConnection
      .start()
      .then(() => {
        setChatCreated(true);
        toast.success("Socket connection established");
      })
      .catch(() => {
        setChatCreated(false);
      });

    newConnection.on("ReceiveMessage", (userType, message) => {
      console.log("message", message);

      const sender = userType === "ChatBot" ? "bot" : "user";
      setMessages((prev) => [...prev, { sender, text: message }]);
    });

    setConnection(newConnection);

    return () => {
      newConnection.stop();
    };
  }, []);

  const handleSend = async () => {
    if (inputText.trim() && connection) {
      await connection.invoke("SendMessageAsync", inputText);
      // Simulate delay and bot reply - in real case, this will be handled by backend
      setTimeout(() => {
        connection.invoke("SendMessageToUser", "bot", `Reply to: ${inputText}`);
      }, 1000);
      setInputText("");
    }
  };

  return (
    <div>
      <ScrollArea className="flex-grow h-[calc(100vh-13.2rem)]">
        {chatCreated ? (
          <span className="text-green-500 text-xs flex items-center justify-center">
            Chat Created
          </span>
        ) : (
          <span className="text-destructive text-xs text-red-500 flex items-center justify-center">
            Failed to create chat
          </span>
        )}
        <div className="flex flex-col space-y-2 p-3">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[50%] px-4 py-2 rounded-2xl text-white text-sm shadow ${
                  msg.sender === "user"
                    ? "bg-primary rounded-br-none"
                    : "bg-gray-500 rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 border-t flex items-center gap-2">
        <Input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message..."
          disabled={!chatCreated}
        />
        <Button
          onClick={handleSend}
          disabled={!chatCreated}
          className="min-w-20"
        >
          Send
        </Button>
      </div>
    </div>
  );
};

export default AIPersonaTestForm;
