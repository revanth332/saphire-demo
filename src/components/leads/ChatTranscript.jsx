import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { cn } from "../../lib/utils"

function ChatTranscript({ leadId }) {
  // Mock chat transcripts data
  const mockChatTranscripts = {
    1: [
      {
        id: "1",
        sender: "customer",
        content: "Hello, I'm interested in learning more about your Turbocharger X1 product.",
        timestamp: "10:32 AM",
      },
      {
        id: "2",
        sender: "bot",
        content:
          "Hi there! I'd be happy to help you with information about our Turbocharger X1. It's one of our premium products designed for high-performance engines. What specific information are you looking for?",
        timestamp: "10:32 AM",
      },
      {
        id: "3",
        sender: "customer",
        content: "I'm mainly interested in the pricing. Can you give me a ballpark figure?",
        timestamp: "10:33 AM",
      },
      // Additional messages would be here
    ],
    2: [
      {
        id: "1",
        sender: "customer",
        content: "Hi, I'm looking for information about your warranty options.",
        timestamp: "9:15 AM",
      },
      // Additional messages would be here
    ],
  }

  const messages = mockChatTranscripts[leadId] || mockChatTranscripts["1"]

  return (
    <Card className="border-miracle-lightGray/30 shadow-md transition-all duration-300 hover:shadow-lg h-full">
      <CardHeader className="bg-gradient-to-r from-miracle-darkBlue py-6 to-miracle-mediumBlue text-white rounded-t-lg">
        <CardTitle>Interaction Summary</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 animate-slide-up",
                message.sender === "customer" ? "justify-start" : "justify-start flex-row-reverse",
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Avatar
                className={cn(
                  "h-8 w-8 transition-all duration-300 hover:scale-110",
                  message.sender === "customer" ? "bg-miracle-mediumBlue" : "bg-miracle-lightBlue",
                )}
              >
                <AvatarFallback>{message.sender === "customer" ? "C" : "B"}</AvatarFallback>
              </Avatar>

              <div
                className={cn(
                  "rounded-lg px-4 py-2 max-w-[80%] transition-all duration-300",
                  message.sender === "customer"
                    ? "bg-miracle-mediumBlue text-white hover:bg-miracle-darkBlue"
                    : "bg-miracle-lightBlue/10 text-miracle-darkBlue hover:bg-miracle-lightBlue/20",
                )}
              >
                <div className="space-y-1">
                  <p className="text-sm">{message.content}</p>
                  <p
                    className={cn("text-xs", message.sender === "customer" ? "text-white/70" : "text-miracle-darkGray")}
                  >
                    {message.timestamp}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export { ChatTranscript }
