import { Outlet } from "react-router-dom"
import { SidebarProvider } from "../components/ui/sidebar"
import { AppSidebar } from "../components/AppSidebar"
import { Toaster } from "@/components/ui/sonner"

const MainLayout = () => {
  return (
    <div className="font-montserrat">
      <SidebarProvider>
        <div className="flex min-h-screen w-[100vw]">
          <AppSidebar />
          <main className="flex-1 transition-all duration-300">
            <Outlet />
          </main>
        </div>
        <Toaster />

      </SidebarProvider>
    </div>
  )
}

export default MainLayout
