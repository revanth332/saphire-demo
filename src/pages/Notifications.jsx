import { PageTransition } from "../components/ui/page-transition"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Bell, Check, Clock, FileText, MessageSquare, Settings, ShoppingCart, Users } from "lucide-react"
import { cn } from "../lib/utils"

function Notifications() {
  // Mock notifications data
  const mockNotifications = [
    {
      id: "1",
      type: "lead",
      title: "New Lead Created",
      description: "John Doe from Acme Corp has been added as a new lead.",
      time: "10 minutes ago",
      read: false,
    },
    // Additional notifications would be here
  ]

  const getNotificationIcon = (type) => {
    switch (type) {
      case "lead":
        return <Users className="h-5 w-5 text-miracle-lightBlue" />
      case "quote":
        return <FileText className="h-5 w-5 text-miracle-mediumBlue" />
      case "order":
        return <ShoppingCart className="h-5 w-5 text-miracle-darkBlue" />
      case "message":
        return <MessageSquare className="h-5 w-5 text-green-500" />
      case "system":
        return <Bell className="h-5 w-5 text-miracle-red" />
      default:
        return null
    }
  }

  return (
    <PageTransition>
      <div className="container p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-miracle-darkBlue">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with important events</p>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Filter:</span>
            <Tabs defaultValue="all">
              <TabsList className="bg-miracle-darkBlue/5">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">Unread</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="border-miracle-mediumBlue text-miracle-mediumBlue hover:bg-miracle-mediumBlue hover:text-white"
            >
              <Check className="mr-2 h-4 w-4" /> Mark All as Read
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <Card className="border-miracle-lightGray/30 shadow-sm">
          <CardHeader className="card-gradient-header">
            <CardTitle>Recent Notifications</CardTitle>
            <CardDescription className="text-white/80">Your latest updates and alerts</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {mockNotifications.map((notification, index) => (
                <div
                  key={notification.id}
                  className={cn(
                    "flex items-start gap-4 p-4 transition-all duration-300 hover:bg-miracle-lightBlue/5 animate-fade-in-fast",
                    !notification.read && "bg-miracle-lightBlue/5",
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-miracle-darkBlue">{notification.title}</h3>
                        <p className="text-sm text-muted-foreground">{notification.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {notification.time}
                        </span>
                        {!notification.read && <div className="h-2 w-2 rounded-full bg-miracle-lightBlue"></div>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  )
}

export default Notifications
