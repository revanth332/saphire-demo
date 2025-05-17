import { API } from '@/services/API'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, MessageSquare } from 'lucide-react'
import { useState } from 'react'; // Import useEffect
import { Link, useNavigate } from 'react-router-dom'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '../ui/card'
import { Skeleton } from '../ui/skeleton'

// API fetch function


function LeadsWidget({ setIsLoading }) {
  const navigate = useNavigate()

  const fetchLeads = async () => {
    const response = await API.get.getAllLeads()
    const data = response.data
    console.log("setttting loading to false")
    setIsLoading(false)
    return data.data.map((lead) => ({
      id: lead.InteractionId,
      name: lead.CustomerName,
      email: lead.CustomerEmail,
      company: lead.CompanyName || 'ABC Company',
      query: lead.chatDescription || 'Interested in your services.',
      source: 'Chatbot',
      time: lead.CreatedAt
        ? new Date(lead.CreatedAt).toLocaleDateString() + ', ' + new Date(lead.CreatedAt).toLocaleTimeString()
        : 'Just now',
      isNew: lead.Status === 'New',
    }))
  }

  const { data: leads = [], isLoading, isError } = useQuery({
    queryKey: ['leads'],
    queryFn: fetchLeads,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false
  })


  const [readLeads, setReadLeads] = useState(new Set())

  const _markAsRead = (id) => {
    setReadLeads(new Set([...readLeads, id]))
  }


  if (isLoading) // This component's internal loading state can still be used for its own UI
    return (<div className="w-full">
      <Skeleton className="h-[600px] mb-4 bg-gray-300">
      </Skeleton>
    </div>)
  if (isError) return <p className="p-4 text-red-500">Failed to load leads.</p>

  return (
    <Card className="border-miracle-lightGray/30 shadow-md transition-all duration-300 hover:shadow-lg">
      <CardHeader className="flex flex-row items-center py-6 justify-between bg-gradient-to-r from-miracle-darkBlue to-miracle-mediumBlue text-white rounded-t-lg">
        <div>
          <CardTitle>New Leads</CardTitle>
          <CardDescription className="text-white/80">
            Recent leads captured by the website chatbot
          </CardDescription>
        </div>
        <div>
          <Link to="/leads">
            <Button variant="ghost" size="sm" className="gap-1 text-white hover:bg-white/10">
              View all <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-4 max-h-[70vh] overflow-auto">
        <div className="space-y-4">
          {leads.map((lead, index) => {
            // Corrected logic for determining if a lead should be displayed as new:
            // It must be new from the API (lead.isNew) AND not yet marked as read locally.
            const displayAsNew = lead.isNew && !readLeads.has(lead.id);

            return (
              <div
                key={lead.id}
                className={`relative rounded-lg border p-4 transition-all duration-300 hover-scale ${displayAsNew ? 'border-miracle-lightBlue/50 bg-miracle-lightBlue/5' : 'border-border'
                  } animate-slide-up`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-miracle-darkBlue">{lead.name}</h3>
                      <span className="text-sm text-muted-foreground">from {lead.company}</span>
                      {displayAsNew && ( // Use displayAsNew here
                        <Badge variant="default" className="ml-2 bg-miracle-lightBlue text-white">
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm">{lead.query}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {lead.source}
                      </span>
                      <span>•</span>
                      <span>{lead.time}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {/* {displayAsNew && ( // Use displayAsNew here
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => _markAsRead(lead.id)} // Corrected function name
                        className="transition-all duration-300"
                      >
                        Mark as read
                      </Button>
                    )} */}
                    <Button
                      size="sm"
                      className="bg-miracle-mediumBlue hover:bg-miracle-darkBlue transition-all duration-300"
                      onClick={() => navigate(`/leads/${lead.id}`)}
                    >
                      View details
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export { LeadsWidget }
