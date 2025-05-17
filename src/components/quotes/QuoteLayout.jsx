import { useEffect, useState } from "react";
import DisplayQuote from "./DisplayQuotePDF";
import QuoteChatbot from "./QuoteChatbot";
import { useMutation } from "@tanstack/react-query";
import { API } from "@/services/API";
import { useLocation } from "react-router-dom";

const CreateQuote = () => {

    const [loader, setLoader] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [input, setInput] = useState("");
    const [quoteData, setQuoteData] = useState([]);
    const [quotationMetadata, setQuotationMetadata] = useState([]);

    const location = useLocation();
    const [leadData, _setLeadData] = useState(location?.state || []);

    const [messages, setMessages] = useState([
        {
            id: "1",
            role: "assistant",
            content: "Hello! I'm your Miraxeon Connect assistant. I can help you create a Quote for the customer?",
        },
    ]);

    const { mutate: sendMessage, isLoading } = useMutation({
        mutationFn: async (message) => {
            setLoader(true);
            return await API.post.chatCompletion({ InteractionId: leadData.InteractionId, prompt: message, sessionId });
        },
        onSuccess: (data) => {
            console.log("API Success:", data);
            const botResponseContent = typeof data.data.response.quotation === "object"
                ? "I have generated the quote based on the lead details. Please check the PDF."
                : data.data.response.quotation || "Sorry, I couldn't process that request.";

            const botResponse = {
                id: Date.now().toString(),
                role: "assistant",
                content: botResponseContent,
                type: data.type || "text",
            };
            setMessages((prev) => [...prev, botResponse]);
            if (data.data.sessionId) {
                setSessionId(data.data.sessionId);
            }
            setInput("");
            if (data.data.response.quotationMetaData) {
                setQuotationMetadata(data.data.response.quotationMetaData);
            }
            if (typeof data.data.response.quotation === "object") {
                setQuoteData(data.data.response.quotation);
            }
            setLoader(false);
        },
        onError: (error) => {
            console.error("API Error:", error);
            const errorMessage = {
                id: Date.now().toString(),
                role: "assistant",
                content: "Sorry, there was an error processing your request. Please try again.",
                type: "error",
            };
            setMessages((prev) => [...prev, errorMessage]);
            setLoader(false);
        },
    });

    useEffect(() => {
        if (leadData && Object.keys(leadData).length > 0) {
            const initialPrompt = `I have a new lead with the following details: ${JSON.stringify(leadData?.Summary)}. Please help me create a quote.`;
            const userMessage = {
                id: "init-lead-" + Date.now(),
                role: "user",
                content: initialPrompt,
            };
            setMessages(prevMessages => [...prevMessages, userMessage]);
            sendMessage(initialPrompt);
        }

    }, [leadData, sendMessage, setMessages]);

    return (
        <div className="grid gap-6 grid-cols-6 p-4 h-screen">
            <QuoteChatbot
                className="col-span-2"
                input={input}
                setInput={setInput}
                leadData={leadData} // Pass leadData to QuoteChatbot if it needs it
                sendMessage={sendMessage}
                loader={loader}
                isLoading={isLoading}
                messages={messages}
                setMessages={setMessages}
            />
            <DisplayQuote
                quoteData={quoteData}
                leadData={leadData} // Pass leadData to DisplayQuote
                quotationMetadata={quotationMetadata}
                className="col-span-3"
            />
        </div>
    );
};

export default CreateQuote;