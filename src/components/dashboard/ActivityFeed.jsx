import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Filter } from "lucide-react"
import { Button } from "../ui/button"
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs"
import { mockActivities } from "@/lib/mock-data"

function ActivityFeed() {
  // Mock activities data


  const [filter, setFilter] = useState("all")

  const filteredActivities =
    filter === "all" ? mockActivities : mockActivities.filter((activity) => activity.type === filter)

  const getActivityBullet = (type) => {
    switch (type) {
      case "lead":
        return "bg-miracle-lightBlue"
      case "quote":
        return "bg-miracle-mediumBlue"
      case "order":
        return "bg-miracle-darkBlue"
      case "message":
        return "bg-green-500"
      case "system":
        return "bg-miracle-red"
      default:
        return ""
    }
  }

  return (
    <Card className="shadow-md transition-all duration-300 hover:shadow-lg">
      <CardHeader className="bg-gradient-to-r from-miracle-darkBlue to-miracle-mediumBlue text-white rounded-t-lg py-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription className="text-white/80">A log of recent significant events</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Tabs defaultValue="all" value={filter} onValueChange={setFilter} className="bg-white/10 rounded-md p-1">
              <TabsList className="bg-transparent">
                <TabsTrigger
                  value="all"
                  className="text-xs py-1 px-2 data-[state=active]:bg-white  data-[state=active]:text-miracle-darkBlue"
                >
                  All
                </TabsTrigger>
                <TabsTrigger
                  value="lead"
                  className="text-xs py-1 px-2 data-[state=active]:bg-white data-[state=active]:text-miracle-darkBlue"
                >
                  Leads
                </TabsTrigger>
                <TabsTrigger
                  value="quote"
                  className="text-xs py-1 px-2 data-[state=active]:bg-white data-[state=active]:text-miracle-darkBlue"
                >
                  Quotes
                </TabsTrigger>
                <TabsTrigger
                  value="order"
                  className="text-xs py-1 px-2 data-[state=active]:bg-white data-[state=active]:text-miracle-darkBlue"
                >
                  Orders
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="relative space-y-4">
          {filteredActivities.length === 0 ? (
            <div className="py-8 text-center text-miracle-darkGray">No activities found</div>
          ) : (
            <div className="space-y-3">
              {filteredActivities.map((activity, index) => (
                <div key={activity.id} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="rounded-lg border border-miracle-lightGray/20 bg-white p-3 shadow-sm transition-all duration-300 hover:shadow-md">
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${getActivityBullet(activity.type)}`}
                      ></div>
                      <div className="flex-1">
                        <p
                          className={`text-sm ${!activity.read ? "font-medium text-miracle-darkBlue" : "text-miracle-darkGray"
                            }`}
                        >
                          {activity.description}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                          {!activity.read && (
                            <span className="inline-flex h-2 w-2 rounded-full bg-miracle-lightBlue"></span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 flex justify-center">
            <Button
              variant="outline"
              size="sm"
              className="text-miracle-mediumBlue border-miracle-mediumBlue hover:bg-miracle-mediumBlue hover:text-white"
            >
              View All Activities
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export { ActivityFeed }
