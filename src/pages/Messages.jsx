import { PageTransition } from "../components/ui/page-transition"
import { Card, CardContent } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { Avatar, AvatarFallback } from "../components/ui/avatar"
import { Search, Send, Paperclip, MoreVertical } from "lucide-react"
import { cn } from "../lib/utils"

function Messages() {
  // Mock data for contacts and messages
  const mockContacts = [
    {
      id: "1",
      name: "John Doe",
      company: "Acme Corp",
      lastMessage: "Thanks for the quote. I'll review it with my team.",
      time: "10:32 AM",
      unread: true,
      online: true,
    },
    // Additional contacts would be here
  ]

  const mockMessages = {
    1: [
      {
        id: "1",
        sender: "contact",
        content: "Hello, I received your quote for the Turbocharger X1 units.",
        time: "10:30 AM",
      },
      {
        id: "2",
        sender: "user",
        content: "Hi John, great to hear from you! Did you have any questions about the quote?",
        time: "10:31 AM",
        status: "read",
      },
      {
        id: "3",
        sender: "contact",
        content: "Thanks for the quote. I'll review it with my team.",
        time: "10:32 AM",
      },
    ],
  }

  return (
    <PageTransition>
      <div className="container h-[calc(100vh-4rem)] p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-miracle-darkBlue">Messages</h1>
          <p className="text-muted-foreground">Communicate with your customers</p>
        </div>

        <div className="grid h-[calc(100%-5rem)] grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="border-miracle-lightGray/30 shadow-sm md:col-span-1">
            <CardContent className="p-0">
              <div className="p-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="search" placeholder="Search contacts..." className="w-full pl-9 bg-white" />
                </div>
              </div>
              <div className="h-[calc(100vh-15rem)] overflow-y-auto">
                {mockContacts.map((contact, index) => (
                  <div
                    key={contact.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 border-b p-4 transition-all duration-200 hover:bg-miracle-lightBlue/5 animate-fade-in-fast",
                      contact.id === "1" && "bg-miracle-lightBlue/5",
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10 border-2 border-white">
                        <AvatarFallback className="bg-miracle-mediumBlue text-white">
                          {contact.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      {contact.online && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"></span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-miracle-darkBlue">{contact.name}</h3>
                        <span className="text-xs text-muted-foreground">{contact.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{contact.company}</p>
                      <p className="mt-1 truncate text-sm">{contact.lastMessage}</p>
                    </div>
                    {contact.unread && <div className="ml-2 h-2 w-2 rounded-full bg-miracle-lightBlue"></div>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-miracle-lightGray/30 shadow-sm md:col-span-2">
            <CardContent className="flex h-full flex-col p-0">
              <div className="flex items-center justify-between border-b p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-white">
                    <AvatarFallback className="bg-miracle-mediumBlue text-white">JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-miracle-darkBlue">John Doe</h3>
                    <p className="text-xs text-muted-foreground">Acme Corp</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {mockMessages["1"].map((message, index) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3 animate-fade-in-fast",
                      message.sender === "contact" ? "justify-start" : "justify-end",
                    )}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {message.sender === "contact" && (
                      <Avatar className="h-8 w-8 border-2 border-white">
                        <AvatarFallback className="bg-miracle-mediumBlue text-white">JD</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "rounded-lg px-4 py-2 max-w-[80%]",
                        message.sender === "contact"
                          ? "bg-miracle-lightBlue/10 text-miracle-darkBlue"
                          : "bg-miracle-mediumBlue text-white",
                      )}
                    >
                      <div className="space-y-1">
                        <p className="text-sm">{message.content}</p>
                        <div className="flex items-center justify-end gap-1">
                          <p
                            className={cn(
                              "text-xs",
                              message.sender === "contact" ? "text-miracle-darkGray" : "text-white/70",
                            )}
                          >
                            {message.time}
                          </p>
                          {message.status === "read" && <span className="text-xs text-white/70">✓✓</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t p-4">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                    <Paperclip className="h-5 w-5 text-miracle-mediumBlue" />
                  </Button>
                  <Input placeholder="Type a message..." className="flex-1 bg-white" />
                  <Button
                    size="icon"
                    className="h-10 w-10 rounded-full bg-miracle-mediumBlue hover:bg-miracle-darkBlue"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  )
}

export default Messages
