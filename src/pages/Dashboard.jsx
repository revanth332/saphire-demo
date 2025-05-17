import { PageTransition } from "../components/ui/page-transition"
import { LeadsWidget } from "../components/dashboard/LeadsWidget"
import { TasksWidget } from "../components/dashboard/TasksWidget"
import { ActivityFeed } from "../components/dashboard/ActivityFeed"
import { useState } from "react"
// import loader from "@/assets/loader.gif"


function Dashboard() {

  const [isLoading, setIsLoading] = useState(false)

  console.log(isLoading)

  // if (isLoading) {
  //     return (
  //       <div className="flex items-center justify-center h-screen">
  //         <div className="loader">
  //           <img src={loader} alt="Loading..." className="" />
  //         </div>
  //       </div>
  //     )
  //   }

  return (
    <PageTransition>
      <div className="container p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-miracle-darkBlue">Dashboard</h1>
          <p className="text-muted-foreground">Welcome, Alex. Here's what's happening today.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-2 ">
            <LeadsWidget setIsLoading={setIsLoading} />
          </div>
          <div>
            <TasksWidget />
          </div>
        </div>

        <div className="mt-6">
          <ActivityFeed />
        </div>
      </div>
    </PageTransition>
  )
}

export default Dashboard
