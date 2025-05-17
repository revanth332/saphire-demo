import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { API } from "@/services/API"
import { useQuery } from "@tanstack/react-query"
import { Download, Eye, FileText, Mail, MoreHorizontal, Phone, Plus, Search } from "lucide-react" // Added Eye, Phone
import { useState } from "react" // useState is still used for modal control if any, but not for query data
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import { Input } from "../components/ui/input"
import { PageTransition } from "../components/ui/page-transition"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { useNavigate } from "react-router-dom"
import loader from "@/assets/loader.gif"

function Quotes() {
  const navigate = useNavigate();


  const getStatusBadge = (status) => {
    switch (status) {
      case "Draft":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-50 border-gray-200">
            Draft
          </Badge>
        )
      case "Sent":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200">
            Sent
          </Badge>
        )
      case "Accepted":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200">
            Accepted
          </Badge>
        )
      case "Rejected":
        return (
          <Badge
            variant="outline"
            className="bg-miracle-red/10 text-miracle-red hover:bg-miracle-red/10 border-miracle-red/20"
          >
            Rejected
          </Badge>
        )
      case "Expired":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-200">
            Expired
          </Badge>
        )
      default:
        return <Badge variant="outline">{status || "Unknown"}</Badge>;
    }
  }

  const { data: leadsData = [], isLoading: isLoadingLeads } = useQuery({
    queryKey: ['leadsViewForQuotes'],
    queryFn: async () => {
      try {
        const response = await API.get.getAllLeads();
        console.log("Leads for quotes fetched:", response.data.data);
        return response.data.data;
      } catch (error) {
        console.error('Error fetching leads:', error);
        return [];
      }
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false
  });

  const { data: quotesData = [], isLoading: isLoadingQuotes, isError: isErrorQuotes } = useQuery({
    queryKey: ['get-quotes'],
    queryFn: async () => {
      try {
        const quoteResponse = await API.get.getQuotes();
        console.log("Quotes fetched:", quoteResponse.data.data);
        return quoteResponse.data.data;
      } catch (error) {
        console.error('Error fetching quotes:', error);
        throw error;
      }
    },
  });



  const [isViewQuoteModalOpen, setIsViewQuoteModalOpen] = useState(false);
  const [selectedQuoteData, setSelectedQuoteData] = useState(null);

  const handleViewQuote = (quote) => {
    setSelectedQuoteData(quote);
    setIsViewQuoteModalOpen(true);
  };


  return (
    <PageTransition>
      <div className="container p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-miracle-darkBlue">Quotes</h1>
          <p className="text-muted-foreground">Manage and track your sales quotes</p>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search quotes..." className="w-full pl-9 bg-white" />
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-miracle-mediumBlue hover:bg-miracle-darkBlue transition-all duration-300">
                <Plus className="mr-2 h-4 w-4" /> Create Quote
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Select the Lead</DialogTitle>
                <DialogDescription className="sm:max-h-[500px] overflow-auto">
                  <Table>
                    <TableHeader className="bg-miracle-lightBlue/5">
                      <TableRow>
                        <TableHead className="text-miracle-darkBlue">Name</TableHead>
                        <TableHead className="text-miracle-darkBlue">Contact</TableHead>
                        <TableHead className="text-miracle-darkBlue">Created At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingLeads ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-8 text-miracle-darkGray">
                            Loading leads...
                          </TableCell>
                        </TableRow>
                      ) : leadsData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-8 text-miracle-darkGray">
                            No leads found
                          </TableCell>
                        </TableRow>
                      ) : (
                        leadsData.map((leadItem, index) => (
                          <TableRow
                            key={leadItem.id}
                            className="hover:bg-miracle-lightBlue/5 transition-colors duration-200 animate-fade-in cursor-pointer"
                            style={{ animationDelay: `${index * 50 + 200}ms` }}
                            onClick={() => { navigate(`/create-quote`, { state: leadItem }) }}
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8 border border-miracle-lightBlue/20">
                                  <AvatarFallback className="bg-miracle-lightBlue/10 text-miracle-darkBlue">
                                    {leadItem.CustomerName.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium text-miracle-black">{leadItem.CustomerName}</div>
                                  <div className="text-xs text-miracle-darkGray">{leadItem.company}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center text-xs text-miracle-darkGray">
                                  <Mail className="h-3 w-3 mr-1 text-miracle-lightBlue" />
                                  {leadItem.CustomerEmail}
                                </div>
                                {leadItem.phone && (
                                  <div className="flex items-center text-xs text-miracle-darkGray">
                                    <Phone className="h-3 w-3 mr-1 text-miracle-lightBlue" />
                                    {leadItem.phone}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-miracle-darkGray text-sm">
                              {new Date(leadItem.CreatedAt).toLocaleDateString() + ', ' + new Date(leadItem.CreatedAt).toLocaleTimeString() || 'Just now'}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-miracle-lightGray/30 shadow-sm gap-4">
          <CardContent className="p-0">
            {isLoadingQuotes ? (
              <div className="flex flex-col justify-center items-center h-64">
                <img src={loader} alt="Loading..." className="" />
              </div>
            ) : isErrorQuotes ? (
              <div className="flex justify-center items-center h-64 text-center">
                <p className="text-red-600">
                  Failed to load quotes. <br /> Please try again later.
                </p>
              </div>
            ) : quotesData.length === 0 ? (
              <div className="text-center py-16 text-miracle-darkGray">
                <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                No quotes found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quote #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotesData.map((quoteItem, index) => (
                    <TableRow
                      key={quoteItem.QuoteId}
                      className="animate-fade-in-fast hover:bg-gray-50 transition-all duration-200" // Simplified hover
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <TableCell className="font-medium">{quoteItem.QuoteId}</TableCell>
                      <TableCell>{quoteItem.CustomerName || quoteItem.customer || "N/A"}</TableCell> {/* Check for CustomerName as well */}
                      <TableCell className="font-medium">{quoteItem.FinalAmount ? `$${parseFloat(quoteItem.FinalAmount).toFixed(2)}` : "N/A"}</TableCell>
                      <TableCell>{new Date(quoteItem.CreatedAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {quoteItem.ExpiryDate ? new Date(quoteItem.ExpiryDate).toLocaleDateString() :
                          (quoteItem.CreatedAt ? new Date(new Date(quoteItem.CreatedAt).setMonth(new Date(quoteItem.CreatedAt).getMonth() + 2)).toLocaleDateString() : "N/A")}
                      </TableCell>
                      <TableCell>{getStatusBadge(quoteItem.Status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 sm:gap-2">
                          <Button
                            title="View Quote"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleViewQuote(quoteItem)}
                          >
                            <Eye className="h-4 w-4 text-miracle-mediumBlue" />
                          </Button>
                          <Button title="Download Quote" variant="ghost" size="icon" className="h-8 w-8">
                            <Download className="h-4 w-4 text-miracle-mediumBlue" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4 text-miracle-mediumBlue" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuItem>Duplicate</DropdownMenuItem>
                              <DropdownMenuItem>Send</DropdownMenuItem>
                              <DropdownMenuItem className="text-miracle-red">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal for Viewing Quote */}
      {selectedQuoteData && (
        <Dialog open={isViewQuoteModalOpen} onOpenChange={setIsViewQuoteModalOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Quote: {selectedQuoteData.QuoteId}</DialogTitle>
              <DialogDescription>
                Details for quote to {selectedQuoteData.CustomerName || selectedQuoteData.customer || "N/A"}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-2 text-sm">
                {/* <div><strong>Quote ID:</strong> {selectedQuoteData.QuoteId}</div>
                <div><strong>Customer:</strong> {selectedQuoteData.CustomerName || selectedQuoteData.customer || "N/A"}</div>
                <div><strong>Date:</strong> {new Date(selectedQuoteData.CreatedAt).toLocaleDateString()}</div>
                <div><strong>Status:</strong> {getStatusBadge(selectedQuoteData.Status)}</div>
                <div><strong>Amount:</strong> {selectedQuoteData.FinalAmount ? `$${parseFloat(selectedQuoteData.FinalAmount).toFixed(2)}` : "N/A"}</div>
                <div><strong>Expiry Date:</strong> {selectedQuoteData.ExpiryDate ? new Date(selectedQuoteData.ExpiryDate).toLocaleDateString() :
                  (selectedQuoteData.CreatedAt ? new Date(new Date(selectedQuoteData.CreatedAt).setMonth(new Date(selectedQuoteData.CreatedAt).getMonth() + 2)).toLocaleDateString() : "N/A")}</div> */}
                {/* Add other relevant quote details here */}
              </div>

              <div className="">
                {/* <h3 className="font-semibold text-miracle-darkBlue mb-2">Document Preview</h3> */}
                <div className="py-1 max-h-[80vh] overflow-y-auto">
                  <div className="">
                    {selectedQuoteData.QuoteDetails ? (
                      <iframe
                        src={selectedQuoteData.QuoteDetails}
                        width="100%"
                        height="500px"
                        title={`PO Document ${selectedQuoteData.POId}`}
                        className="border rounded-md"
                      />
                    ) : (
                      <div className="my-4 p-6 border border-dashed border-gray-300 rounded-md text-center text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                        PO Document not available for preview.
                      </div>
                    )}
                  </div>
                </div>
                {/* 
                  TODO: Implement actual Quote document display here.
                  This could be an iframe for a PDF, an img tag for an image, or a custom component.
                */}
                {/* <div className="my-4 p-6 border border-dashed border-gray-300 rounded-md text-center text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  Quote Document Preview Area
                  <p className="text-xs mt-1">Implement document fetching and rendering logic here.</p>
                </div> */}
              </div>
            </div>
            {/* <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => setIsViewQuoteModalOpen(false)}>Close</Button>
            </div> */}
          </DialogContent>
        </Dialog>
      )}
    </PageTransition>
  )
}

export default Quotes