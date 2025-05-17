import BotIcon from "@/assets/bot-icon.svg";
import UserIcon from "@/assets/user-icon.svg";
import { cn } from "@/lib/utils";
import { MessageCircle, Send, ArrowDownCircle } from "lucide-react";
import { Avatar } from "../ui/avatar";
import { Button } from "../ui/button";
import { useEffect, useRef, useState } from "react";

const QuoteChatbot = ({
    input,
    leadData,
    setInput,
    sendMessage,
    loader,
    isLoading,
    messages,
    setMessages,
}) => {
    const chatContainerRef = useRef(null);
    const [showScrollToBottomButton, setShowScrollToBottomButton] = useState(false);

    function handleInputChange(e) {
        setInput(e.target.value);
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = {
            id: Date.now().toString(),
            role: "user",
            content: input,
            type: "text",
        };

        setMessages((prev) => [...prev, userMessage]);
        sendMessage(input);
        setInput("");
    }

    const scrollToBottom = (behavior = "auto") => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: behavior,
            });
        }
    };

    useEffect(() => {
        if (chatContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
            const isScrolledToBottom = scrollHeight - scrollTop <= clientHeight + 300;

            if (isScrolledToBottom || messages.length <= 2) {
                scrollToBottom("smooth");
            }
        }
    }, [messages, isLoading]);

    useEffect(() => {
        const container = chatContainerRef.current;

        const handleScroll = () => {
            if (container) {
                const { scrollTop, scrollHeight, clientHeight } = container;
                const isFarFromBottom = scrollHeight - scrollTop > clientHeight + 200;
                setShowScrollToBottomButton(isFarFromBottom);
            }
        };

        if (container) {
            container.addEventListener("scroll", handleScroll);
            handleScroll();
            return () => container.removeEventListener("scroll", handleScroll);
        }
    }, [messages]); 


    function renderUserMessage(message) {
        return (
            <div key={message.id} className="flex items-start justify-end gap-2 mb-4">
                <div className="bg-miracle-mediumBlue text-white p-3 rounded-lg rounded-br-none max-w-[80%]">
                    {message.content}
                </div>
                <Avatar className="h-9 w-9 bg-miracle-darkBlue text-white">
                    <img src={UserIcon} alt="User" className="h-9 w-9" />
                </Avatar>
            </div>
        );
    }

    function renderAssistantMessage(message) {
        return (
            <div key={message.id} className="flex items-start gap-2 mb-4">
                <Avatar className="h-9 w-9 bg-gray-200">
                    <img src={BotIcon} alt="Bot" className="h-9 w-9" />
                </Avatar>
                <div
                    className={cn(
                        "bg-gray-200 text-gray-800 p-3 rounded-lg rounded-bl-none max-w-[80%]",
                        message.type === "error" && "bg-red-100 text-red-800"
                    )}
                >
                    {message.content
                        ?.replace("PDF", "Quotation")
                        ?.replace("pdf", "Quotation")}
                </div>
            </div>
        );
    }

    function renderLoadingIndicator() {
        return (
            <div className="flex items-start gap-2 mb-4">
                <Avatar className="h-9 w-9 bg-gray-200">
                    <img src={BotIcon} alt="Bot" className="h-9 w-9" />
                </Avatar>
                <div className="bg-gray-200 text-gray-800 p-3 rounded-lg rounded-bl-none max-w-[80%]">
                    <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        <div
                            className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                            className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0.4s" }}
                        ></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full col-span-3 ">
            <div className="flex flex-col">
                <h2 className="text-2xl font-bold text-miracle-darkBlue">
                    Generate Quote
                </h2>
                <p className="text-muted-foreground">
                    Interact with the chatbot to generate quotes.
                </p>
            </div>
            <div className="flex justify-between mb-2">
                <p className="text-gray-500">
                    Customer Name:
                    <span className="text-miracle-darkBlue"> {leadData.CustomerName}</span>
                </p>
                <p className="text-gray-500">
                    Customer Email:
                    <span className="text-miracle-darkBlue">{leadData.CustomerEmail} </span>
                </p>
            </div>

            <div className="col-span-8 border rounded-lg overflow-hidden flex flex-col w-full relative">
                <div className="p-3 bg-miracle-darkBlue text-white flex justify-between items-center">
                    <div className="flex items-center">
                        <MessageCircle className="h-5 w-5 mr-2" />
                        <h3 className="font-medium">Miraxeon Connect Assistant</h3>
                    </div>
                </div>
                <div
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto p-4 bg-gray-50 min-h-[70vh] max-h-[70vh]"
                >
                    {messages.map((message) =>
                        message.role === "user"
                            ? renderUserMessage(message)
                            : renderAssistantMessage(message)
                    )}
                    {loader && renderLoadingIndicator()}

                    {showScrollToBottomButton && (
                        <Button
                            onClick={() => scrollToBottom('smooth')}
                            className="absolute bottom-[70px] right-6 z-10 p-2 rounded-full bg-miracle-mediumBlue hover:bg-miracle-darkBlue text-white shadow-lg"
                            variant="outline"
                            size="icon"
                        >
                            <ArrowDownCircle size={24} />
                        </Button>
                    )}
                </div>
                <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 bg-white">
                    <div className="flex gap-2">
                        <input
                            value={input}
                            onChange={handleInputChange}
                            placeholder="Type your message to the assistant..."
                            className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-miracle-darkBlue focus:border-transparent"
                            disabled={isLoading}
                        />
                        <Button
                            type="submit"
                            className="bg-miracle-darkBlue hover:bg-miracle-mediumBlue transition-colors"
                            disabled={isLoading || !input.trim()}
                        >
                            <Send size={18} className="mr-1" />
                            <span>Send</span>
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QuoteChatbot;