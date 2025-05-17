import { PageTransition } from "../components/ui/page-transition"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Separator } from "../components/ui/separator"
import { Avatar, AvatarFallback } from "../components/ui/avatar"
import { Camera, Save } from "lucide-react"

function Settings() {
  return (
    <PageTransition>
      <div className="container p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-miracle-darkBlue">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-miracle-darkBlue/5">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6 animate-fade-in">
            <Card className="border-miracle-lightGray/30 shadow-sm">
              <CardHeader className="card-gradient-header">
                <CardTitle>Profile Information</CardTitle>
                <CardDescription className="text-white/80">Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col items-center gap-4 sm:flex-row">
                    <div className="relative">
                      <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                        <AvatarFallback className="bg-miracle-mediumBlue text-white text-xl">AJ</AvatarFallback>
                      </Avatar>
                      <Button
                        size="icon"
                        className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-miracle-mediumBlue hover:bg-miracle-darkBlue"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-1 text-center sm:text-left">
                      <h3 className="text-xl font-semibold text-miracle-darkBlue">Poornaaditya</h3>
                      <p className="text-sm text-muted-foreground">Procurement Lead</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" defaultValue="Alex" className="bg-white" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" defaultValue="Johnson" className="bg-white" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue="alex.johnson@example.com" className="bg-white" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" className="bg-white" />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="bio">Bio</Label>
                      <textarea
                        id="bio"
                        rows={4}
                        className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        defaultValue="Experienced sales representative with 5+ years in the automotive parts industry."
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button className="bg-miracle-mediumBlue hover:bg-miracle-darkBlue transition-all duration-300">
                      <Save className="mr-2 h-4 w-4" /> Save Changes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tabs content would be here */}
        </Tabs>
      </div>
    </PageTransition>
  )
}

export default Settings
