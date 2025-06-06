import loader from "@/assets/Loader.gif"
import ChatSummary from "@/components/leads/ChatSummary"
import { CustomerInfo } from "@/components/leads/CustomerInfo"
import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageTransition } from "@/components/ui/page-transition"
import { API } from "@/services/API"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import ChatbotWidget from "./chatbot-widget"
import { useState } from "react"


function LeadDetail() {

  const { id } = useParams()
  const navigate = useNavigate()
  const [emailSummary, setEmailSummary] = useState(null)

  const { data: lead, isLoading, _error, isSuccess } = useQuery({
    queryKey: [`leadDetails/${id}`],
    queryFn: async () => {
      const res = await API.post.getLead(id);

      if (res.status !== 200) {
        throw new Error("Failed to fetch lead details");
      }
      if (isSuccess) {
        try {
          await API.put.updateLead(id);
          // const emailSummary = await API.post.getEmailSummary(res.data.data.CustomerEmail, res.data.data.InteractionId);
          // console.log(emailSummary)
          // setEmailSummary(emailSummary.data);
        } catch (err) {
          console.error("Failed to update lead", err);
        }
      }
      return res.data.data;
    }
  });

  console.log(emailSummary)



  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="loader">
          <img src={loader} alt="Loading..." className="" />
        </div>
      </div>
    )
  }


  return (
    <>
      <PageTransition>
        <div className="container p-4 md:p-6  max-h-screen">
          <div className="mb-6 flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-miracle-darkBlue hover:bg-miracle-darkBlue/10 transition-all duration-300"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-miracle-darkBlue">Lead Detail</h1>
              <p className="text-muted-foreground">View and manage lead information</p>
            </div>
          </div>

          <div className="grid grid-cols-10  gap-6">
            <div className="md:col-span-4">
              <CustomerInfo lead={lead} isLoading={isLoading} />
            </div>

            <div className="flex flex-col col-span-6 animate-slide-up gap-4" style={{ animationDelay: "200ms" }}>
              <ChatSummary message={lead?.Summary} lead={lead} />
              {/* {emailSummary && (
                <Card className="border-miracle-lightGray/30 shadow-md transition-all duration-300 hover:shadow-lg h-fit">
                  <CardHeader className="bg-gradient-to-r from-miracle-darkBlue py-6 to-miracle-mediumBlue text-white rounded-t-lg">
                    <CardTitle>Email Summary </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 overflow-auto max-h-[68vh]"> */}
              {/* {lead?.actionRequired} <br />
                  <div className="flex gap-3 mt-2">
                    <Button className="bg-miracle-darkBlue hover:bg-miracle-darkBlue" onClick={() => { navigate("/create-quote", { state: lead }) }}>Create Quote</Button>
                    <Button className="bg-miracle-darkBlue hover:bg-miracle-darkBlue">Create Meeting</Button>
                    <Button className="bg-miracle-darkBlue hover:bg-miracle-darkBlue">Send Mail</Button>
                  </div> */}
              {/* <div className="flex flex-col gap-2">
                      <h3 className="text-lg font-semibold">Email Summary</h3>
                      <p>{JSON.stringify(emailSummary)}</p> */}
              {/* <div className="flex gap-3 mt-2">
                        <Button className="bg-miracle-darkBlue hover:bg-miracle-darkBlue" onClick={() => { navigate("/create-quote", { state: lead }) }}>Create Quote</Button>
                        <Button className="bg-miracle-darkBlue hover:bg-miracle-darkBlue">Create Meeting</Button>
                        <Button className="bg-miracle-darkBlue hover:bg-miracle-darkBlue">Send Mail</Button>
                      </div> */}
              {/* </div>
                  </CardContent>
                </Card>
              )} */}
            </div>
          </div>
        </div>
      </PageTransition >
      <div className="fixed bottom-0 right-0 z-50 w-full md:w-1/3 lg:w-1/4">
        <ChatbotWidget lead={lead} />
      </div>
    </>
  )
}

export default LeadDetail

