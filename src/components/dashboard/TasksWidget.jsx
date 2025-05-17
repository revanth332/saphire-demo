import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { Button } from "../ui/button"
import { Checkbox } from "../ui/checkbox"
import { mockTasks } from "@/lib/mock-data"

function TasksWidget() {
  // Mock tasks data


  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "high":
        return <AlertCircle className="h-4 w-4 text-miracle-red" />
      case "medium":
        return <Clock className="h-4 w-4 text-amber-500" />
      case "low":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      default:
        return null
    }
  }

  return (
    <Card className="border-miracle-lightGray/30 shadow-md transition-all duration-300 hover:shadow-lg h-full">
      <CardHeader className="py-6 bg-gradient-to-r from-miracle-darkBlue to-miracle-mediumBlue text-white rounded-t-lg">
        <CardTitle>Tasks & Reminders</CardTitle>
        <CardDescription className="text-white/80">Actions flagged by the Agentic AI</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          {mockTasks
            .filter((task) => !task.completed)
            .map((task, index) => (
              <div
                key={task.id}
                className="flex items-start gap-3 rounded-md border p-3 transition-all duration-300 hover:border-miracle-lightBlue hover:shadow-sm animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Checkbox id={`task-${task.id}`} className="border-miracle-darkGray" />
                <div className="flex-1 space-y-1">
                  <label
                    htmlFor={`task-${task.id}`}
                    className="block font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {task.title}
                  </label>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      {getPriorityIcon(task.priority)}
                      <span className="capitalize">{task.priority} priority</span>
                    </div>
                    <span>•</span>
                    <span>Due: {task.dueDate}</span>
                  </div>
                </div>
              </div>
            ))}

          {mockTasks.some((task) => task.completed) && (
            <div className="mt-4 animate-slide-up" style={{ animationDelay: "500ms" }}>
              <h4 className="mb-2 text-sm font-medium text-muted-foreground">Completed</h4>
              {mockTasks
                .filter((task) => task.completed)
                .map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 rounded-md border p-3 opacity-60 transition-all duration-300"
                  >
                    <Checkbox id={`task-${task.id}`} defaultChecked className="border-miracle-darkGray" />
                    <div className="flex-1 space-y-1">
                      <label
                        htmlFor={`task-${task.id}`}
                        className="block font-medium leading-none line-through peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {task.title}
                      </label>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                  </div>
                ))}
            </div>
          )}

          <Button
            className="w-full transition-all duration-300 bg-miracle-mediumBlue hover:bg-miracle-darkBlue animate-slide-up"
            style={{ animationDelay: "600ms" }}
          >
            View all tasks
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export { TasksWidget }
