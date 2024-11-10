"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  ChatBubble,
  ChatBubbleAction,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/components/ui/chat/chat-bubble";
import { ChatInput } from "@/components/ui/chat/chat-input";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import useChatStore from "@/hooks/useChatStore";
import { AnimatePresence, motion } from "framer-motion";
import {
  CopyIcon,
  CornerDownLeft,
  Mic,
  Paperclip,
  RefreshCcw,
  Volume2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  idlFactory,
  type _SERVICE,
} from "@/declarations/icp_hello_world_rust_backend/icp_hello_world_rust_backend.did";
import {
  idlFactory as gpt2IdlFactory,
  type _SERVICE as _gpt2SERVICE,
} from "@/declarations/icp_gpt2/icp_gpt2.did";

import { Actor, ActorSubclass, HttpAgent } from "@dfinity/agent";
import { InterfaceFactory } from "@dfinity/candid/lib/cjs/idl";

/* CANISTER_ID is replaced by webpack based on node environment
 * Note: canister environment variable will be standardized as
 * process.env.CANISTER_ID_<CANISTER_NAME_UPPERCASE>
 * beginning in dfx 0.15.0
 */
const canisterId = process.env.CANISTER_ID_ICP_HELLO_WORLD_RUST_BACKEND;
const gpt2CanisterId = process.env.CANISTER_ID_ICP_GPT2;

const createActor = (idlF: InterfaceFactory, cId: string) => {
  const agent = new HttpAgent({ host: "http://127.0.0.1:4943" });

  // Fetch root key for certificate validation during development
  if (process.env.DFX_NETWORK !== "ic") {
    agent.fetchRootKey().catch((err) => {
      console.warn(
        "Unable to fetch root key. Check to ensure that your local replica is running"
      );
      console.error(err);
    });
  }

  // Creates an actor with using the candid interface and the HttpAgent
  return Actor.createActor(idlF, {
    agent,
    canisterId: cId,
  });
};

// @ts-ignore
const icp_hello_world_rust_backend: ActorSubclass<_SERVICE> = createActor(
  idlFactory,
  canisterId
);
// @ts-ignore
const icp_gpt2: ActorSubclass<_gpt2SERVICE> = createActor(
  gpt2IdlFactory,
  gpt2CanisterId
);

const ChatAiIcons = [
  {
    icon: CopyIcon,
    label: "Copy",
  },
  {
    icon: RefreshCcw,
    label: "Refresh",
  },
  {
    icon: Volume2,
    label: "Volume",
  },
];

export default function Page() {
  const messages = useChatStore((state) => state.chatBotMessages);
  const setMessages = useChatStore((state) => state.setchatBotMessages);
  const selectedUser = useChatStore((state) => state.selectedUser);
  const input = useChatStore((state) => state.input);
  const setInput = useChatStore((state) => state.setInput);
  const handleInputChange = useChatStore((state) => state.handleInputChange);
  const hasInitialAIResponse = useChatStore(
    (state) => state.hasInitialAIResponse
  );
  const setHasInitialAIResponse = useChatStore(
    (state) => state.setHasInitialAIResponse
  );
  const [isLoading, setisLoading] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const getMessageVariant = (role: string) =>
    role === "ai" ? "received" : "sent";
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSendMessage(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input) return;

    setisLoading(true);

    try {
      console.log("Message received");
      // Add user message
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: prevMessages.length + 1,
          avatar: selectedUser.avatar,
          name: selectedUser.name,
          role: "user",
          message: input,
        },
      ]);
      console.log("input: ", input, icp_hello_world_rust_backend);

      const tokenizeResult = await icp_hello_world_rust_backend.encode(input);

      console.log("tokenizeResult: ", tokenizeResult);

      const modelResponse = await icp_gpt2.model_inference(
        5,
        tokenizeResult.tokens
      );

      console.log("modelResponse: ", modelResponse);

      if ("Ok" in modelResponse) {
        // Decode the response tokens back to text
        const decodedResponse = await icp_hello_world_rust_backend.decode(
          modelResponse.Ok
        );

        console.log("decodeResponse: ", decodedResponse);

        // Add AI response
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: prevMessages.length + 1,
            avatar: "",
            name: "ChatBot",
            role: "ai",
            message: decodedResponse,
          },
        ]);
      } else {
        // console.error("GPT2 error:", modelResponse.Err);

        // Optionally add error message to chat
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: prevMessages.length + 1,
            avatar: "",
            name: "ChatBot",
            role: "ai",
            message: "Sorry, I encountered an error processing your message.",
          },
        ]);
      }
    } catch (error) {
      console.error("Chat error:", error);

      // Add error message to chat
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: prevMessages.length + 1,
          avatar: "",
          name: "ChatBot",
          role: "ai",
          message: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setisLoading(false);
      setInput("");
      formRef.current?.reset();
    }

    setInput("");
    formRef.current?.reset();
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }

    // Simulate AI response
    if (!hasInitialAIResponse) {
      setisLoading(true);
      setTimeout(() => {
        setMessages((messages) => [
          ...messages.slice(0, messages.length - 1),
          {
            id: messages.length + 1,
            avatar: "",
            name: "ChatBot",
            role: "ai",
            message: "Sure! If you have any more questions, feel free to ask.",
          },
        ]);
        setisLoading(false);
        setHasInitialAIResponse(true);
      }, 2500);
    }
  }, []);

  return (
    <div className="h-full w-full">
      <div className="relative flex h-full flex-col rounded-xl bg-muted/20 dark:bg-muted/40 p-4 lg:col-span-2">
        <ChatMessageList ref={messagesContainerRef}>
          {/* Chat messages */}
          <AnimatePresence>
            {messages.map((message, index) => {
              const variant = getMessageVariant(message.role!);
              return (
                <motion.div
                  key={index}
                  layout
                  initial={{ opacity: 0, scale: 1, y: 50, x: 0 }}
                  animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                  exit={{ opacity: 0, scale: 1, y: 1, x: 0 }}
                  transition={{
                    opacity: { duration: 0.1 },
                    layout: {
                      type: "spring",
                      bounce: 0.3,
                      duration: index * 0.05 + 0.2,
                    },
                  }}
                  style={{ originX: 0.5, originY: 0.5 }}
                  className="flex flex-col gap-2 p-4"
                >
                  <ChatBubble key={index} variant={variant}>
                    <Avatar>
                      <AvatarImage
                        src={message.role === "ai" ? "" : message.avatar}
                        alt="Avatar"
                        className={message.role === "ai" ? "dark:invert" : ""}
                      />
                      <AvatarFallback>
                        {message.role === "ai" ? "🤖" : "GG"}
                      </AvatarFallback>
                    </Avatar>
                    <ChatBubbleMessage isLoading={message.isLoading}>
                      {message.message}
                      {message.role === "ai" && (
                        <div className="flex items-center mt-1.5 gap-1">
                          {!message.isLoading && (
                            <>
                              {ChatAiIcons.map((icon, index) => {
                                const Icon = icon.icon;
                                return (
                                  <ChatBubbleAction
                                    variant="outline"
                                    className="size-6"
                                    key={index}
                                    icon={<Icon className="size-3" />}
                                    onClick={() =>
                                      console.log(
                                        "Action " +
                                          icon.label +
                                          " clicked for message " +
                                          index
                                      )
                                    }
                                  />
                                );
                              })}
                            </>
                          )}
                        </div>
                      )}
                    </ChatBubbleMessage>
                  </ChatBubble>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </ChatMessageList>
        <div className="flex-1" />
        <form
          ref={formRef}
          onSubmit={handleSendMessage}
          className="relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring"
        >
          <ChatInput
            ref={inputRef}
            onKeyDown={handleKeyDown}
            onChange={handleInputChange}
            placeholder="Type your message here..."
            className="min-h-12 resize-none rounded-lg bg-background border-0 p-3 shadow-none focus-visible:ring-0"
          />
          <div className="flex items-center p-3 pt-0">
            <Button variant="ghost" size="icon">
              <Paperclip className="size-4" />
              <span className="sr-only">Attach file</span>
            </Button>

            <Button variant="ghost" size="icon">
              <Mic className="size-4" />
              <span className="sr-only">Use Microphone</span>
            </Button>

            <Button
              disabled={!input || isLoading}
              type="submit"
              size="sm"
              className="ml-auto gap-1.5"
            >
              Send Message
              <CornerDownLeft className="size-3.5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
