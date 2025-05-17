import MarkDownRender from "@/components/leads/markdown-renderer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { API } from "@/services/API"
import { AnimatePresence, motion } from "framer-motion"
import { Bot, MessageCircle, RotateCcw, Send, User, X } from "lucide-react"; // Added Trash2, removed Maximize2, Minimize2
import { useEffect, useRef, useState } from "react"
import botIcon from "@/assets/bot-icon.svg"
import userIcon from "@/assets/user-icon.svg"

const initialBotMessage = {
  id: 1,
  text: "Hello! I'm Miraxeon's virtual assistant. How can I help you today?",
  isUser: false,
};

export default function ChatbotWidget({ lead }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [messages, setMessages] = useState([initialBotMessage])
  const [previousMessages, setPreviousMessages] = useState([])
  const [sessionId, setSessionId] = useState(null)
  const [input, setInput] = useState("")
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (isOpen) { // Only scroll if open
      scrollToBottom()
    }
  }, [messages, isOpen])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const newUserMessage = {
      id: messages.length + 1,
      text: input,
      isUser: true,
      avatar: <img src={userIcon} alt="Bot" className="h-8 w-8" />
    }

    const updatedMessages = [...messages, newUserMessage]
    setMessages(updatedMessages)
    setInput("")
    setIsTyping(true)

    try {
      const res = await API.post.chatCompletion({
        prompt: input,
        InteractionId: lead?.InteractionId,
        CustomerName: lead?.CustomerName,
        CustomerEmail: lead?.CustomerEmail,
        sessionId
      })

      const data = await res.json()
      console.log(data.sessionId)

      setSessionId(data.sessionId)
      setPreviousMessages(data.chatHistory)
      console.log(data)
      const botResponse = {
        id: updatedMessages.length + 1,
        text: data?.response?.quotation || "Sorry, I couldn't understand that.",
        isUser: false,
      }

      setMessages((prev) => [...prev, { ...botResponse, id: prev.length + 1 }])
    } catch (error) {
      console.error("Chatbot API error:", error)
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: "Oops! Something went wrong. Please try again later.",
          isUser: false,
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const toggleChat = () => {
    setIsOpen(!isOpen)
  }

  // const toggleMinimize = () => { // Removed toggleMinimize
  //   setIsMinimized(!isMinimized)
  // }

  const handleClearChat = () => {
    setMessages([initialBotMessage]);
    setInput("");
    setIsTyping(false);
    // scrollToBottom will be called by useEffect due to messages change if isOpen
  };


  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={cn(
              "bg-white rounded-lg shadow-xl mb-4 w-[450px] h-[550px] overflow-hidden flex flex-col",
            )}
          >
            {/* Chat header */}
            <div className="p-3 bg-miracle-darkBlue text-white flex justify-between items-center">
              <div className="flex items-center">
                <MessageCircle className="h-5 w-5 mr-2" />
                <h3 className="font-medium">Miraxeon Connect Assistant</h3>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-miraxeon-neutralLight hover:bg-miraxeon-danger/80 hover:text-white transition-colors duration-200"
                  onClick={handleClearChat}
                  aria-label="Clear chat"
                  title="Clear chat"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-miraxeon-neutralLight hover:bg-miraxeon-secondary/80 transition-colors duration-200"
                  onClick={toggleChat}
                  aria-label="Close chat"
                >
                  <motion.div whileHover={{ rotate: 90 }} transition={{ duration: 0.2 }}>
                    <X className="h-4 w-4" />
                  </motion.div>
                </Button>
              </div>
            </div>

            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-miraxeon-primary">
                <AnimatePresence initial={false}>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      layout
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                      transition={{ duration: 0.3, type: "spring", stiffness: 150, damping: 20 }}
                      className={cn(
                        "flex items-end gap-2",
                        message.isUser ? "justify-end" : "justify-start"
                      )}
                    >
                      {!message.isUser && (
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-miracle-darkBlue text-white flex items-center justify-center font-semibold text-sm">

                          <img src={botIcon} alt="Bot" className="h-8 w-8" />
                        </div>
                      )}
                      <div
                        className={cn(
                          "max-w-[75%] p-3 rounded-lg shadow-sm",
                          message.isUser
                            ? "bg-miracle-darkBlue text-white rounded-tr-none"
                            : "bg-gray-200 text-miraxeon-neutralDarker rounded-tl-none",
                        )}
                      >
                        <MarkDownRender markdownContent={message.text} />
                      </div>
                      {message.isUser && (
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-miraxeon-accent1 text-miraxeon-neutralLight flex items-center justify-center">
                          {message.avatar}
                        </div>
                      )}
                    </motion.div>
                  ))}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-end gap-2 justify-start"
                    >
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-miracle-darkBlue text-white flex items-center justify-center font-semibold text-sm">
                        <img src={botIcon} alt="Bot" className="h-8 w-8" />
                      </div>
                      <div className="max-w-[75%] p-3 rounded-lg bg-gray-200 text-miraxeon-neutralDarker rounded-tl-none shadow-sm">
                        <TypingAnimation />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Chat input */}
              <div className="p-3 border-t border-miraxeon-neutralDark flex gap-2 bg-miraxeon-neutralDark">
                <Input
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className=" bg-miraxeon-primary border-miraxeon-neutralMid focus-ring:none focus-visible:ring-0 text-miraxeon-neutralLight placeholder:text-miraxeon-neutralMid transition-all duration-200"
                  aria-label="Chat input"
                />
                <motion.div whileTap={{ scale: 0.9 }}>
                  <Button
                    size="icon"
                    onClick={handleSendMessage}
                    className="bg-miracle-darkBlue text-white hover:bg-miraxeon-accent2 transition-colors duration-200"
                    aria-label="Send message"
                    disabled={!input.trim() || isTyping}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            </>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat button */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Button
          size="icon"
          onClick={toggleChat}
          className="h-14 w-14 rounded-full shadow-lg bg-miracle-darkBlue text-white hover:bg-miraxeon-accent2 text-miraxeon-neutralLight transition-colors duration-300"
          aria-label={isOpen ? "Close chat widget" : "Open chat widget"}
        >
          <motion.div
            animate={{
              // rotate: isOpen ? 135 : 0, // Rotates to X when open
              scale: isOpen ? [1, 1.1, 1] : 1,
            }}
            transition={{
              // rotate: { duration: 0.4, ease: "easeInOut" },
              scale: { duration: 0.3, times: [0, 0.5, 1] },
            }}
          >
            {isOpen ? <X className="h-6 w-6 text-white" /> : <img src={botIcon} alt="Bot" className="h-8 w-8" />}
          </motion.div>
        </Button>
      </motion.div>
    </div>
  )
}

// Enhanced typing animation component
function TypingAnimation() {
  return (
    <div className="flex items-center space-x-1.5">
      <motion.div
        className="h-1.5 w-1.5 rounded-full bg-miracle-darkBlue"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 1.2,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop",
          delay: 0,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="h-1.5 w-1.5 rounded-full bg-miracle-darkBlue"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 1.2,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop",
          delay: 0.2,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="h-1.5 w-1.5 rounded-full bg-miracle-darkBlue"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 1.2,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop",
          delay: 0.4,
          ease: "easeInOut",
        }}
      />
    </div>
  )
}