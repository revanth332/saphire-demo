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
import { Download, Eye, FileText, Mail, MoreHorizontal, Phone, Plus, Search } from "lucide-react";
import { useState } from "react"
import { useNavigate } from "react-router-dom"
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
import { toast } from "sonner"; // Ensure sonner is installed and <Toaster /> is in your app root
import loader from "@/assets/Loader.gif"


function PurchaseOrders() {
  const _navigate = useNavigate();

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
      case "Pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50 border-yellow-200">
            Pending
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
        return <Badge variant="outline">{status || "Unknown"}</Badge>
    }
  }

  const { data: leadsData = [], isLoading: isLoadingLeads } = useQuery({
    queryKey: ['leadsView'],
    queryFn: async () => {
      try {
        const response = await API.get.getAllLeads();
        console.log("Leads fetched:", response.data.data);
        return response.data.data;
      } catch (error) {
        console.error('Error fetching leads:', error);
        return [];
      }
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });

  const { data: purchaseOrdersData = [], isLoading: isLoadingPurchaseOrders, isError: isErrorPurchaseOrders } = useQuery({
    queryKey: ['get-purchase-orders'],
    queryFn: async () => {
      try {
        const response = await API.get.getPurchaseOrders();
        console.log("Purchase Orders fetched:", response.data.data);
        return response.data.data;
      } catch (error) {
        console.error('Error fetching purchase orders:', error);
        throw error;
      }
    },
  });

  const handleShipments = async (data) => {
    let id = 1;
    toast.loading("Intiating Dispatch", {
      className: "font-montserrat bg-miracleBlack",
      description: "",
      id: id,
    });

    try {
      const response = await API.post.addShipments(data);
      console.log("Shipments response:", response.data);

      toast.success("Dispatch initiated successfully", {
        classNames: "font-montserrat bg-miracleBlack ",
        description: "",
        id: id,

      });
      setTimeout((id) => {
        toast.dismiss(id);
      }, 2000);
    } catch (error) {
      toast.error("Failed to initiate dispatch", {
        className: "font-montserrat bg-miracleBlack",
        description: "",
        id: id,
      });
      setTimeout((id) => {
        toast.dismiss(id);
      }, 2000);
      console.error(error);
    }
  }

  const [isViewPoModalOpen, setIsViewPoModalOpen] = useState(false);
  const [selectedPoData, setSelectedPoData] = useState(null);

  const handleViewPo = (po) => {
    setSelectedPoData(po);
    setIsViewPoModalOpen(true);
  };

  return (
    <PageTransition>
      <div className="container p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-miracle-darkBlue">Purchase Orders</h1>
          <p className="text-muted-foreground">Manage and track your sales purchase orders</p>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search purchase orders..." className="w-full pl-9 bg-white" />
          </div>

          <Dialog className="w-[100vw]" >
            <DialogTrigger asChild>
              <Button className="bg-miracle-mediumBlue hover:bg-miracle-darkBlue transition-all duration-300">
                <Plus className="h-4 w-4" /> Create Purchase Order
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader >
                <DialogTitle>Select the Lead</DialogTitle>
                <DialogDescription > {/* Added asChild to DialogDescription to prevent nesting p tags */}
                  <div className="max-h-[500px] overflow-auto"> {/* Moved max-h and overflow here */}
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
                            onClick={() => { _navigate(`/create-purchase-orders`, { state: leadItem }) }}
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
                  </div>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-miracle-lightGray/30 shadow-sm gap-4">
          <CardContent className="p-0">
            {isLoadingPurchaseOrders ? (
              <div className="flex flex-col justify-center items-center h-64">
                <div className="flex flex-col justify-center items-center h-64">
                  <img src={loader} alt="Loading..." className="" />
                </div>
              </div>
            ) : isErrorPurchaseOrders ? (
              <div className="flex justify-center items-center h-64 text-center">
                <p className="text-red-600">
                  Failed to load purchase orders. <br /> Please try again later.
                </p>
              </div>
            ) : purchaseOrdersData.length === 0 ? (
              <div className="text-center py-16 text-miracle-darkGray">
                <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                No purchase orders found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseOrdersData.map((poItem, index) => (
                    <TableRow
                      key={poItem.POId || poItem.QuoteId}
                      className="animate-fade-in-fast hover:bg-gray-50 transition-all duration-200"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <TableCell className="font-medium">{poItem.POId}</TableCell>
                      <TableCell>{ "Miracle Software Systems"}</TableCell>
                      <TableCell>{new Date(poItem.CreatedAt).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(poItem.Status)}</TableCell>
                      <TableCell>{getStatusBadge(poItem.Status)}</TableCell>
                      <TableCell className="">
                        <div className="flex gap-1 sm:gap-2">
                          <Button
                            title="View Order"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleViewPo(poItem)}
                          >
                            <Eye className="h-4 w-4 text-miracle-mediumBlue" />
                          </Button>
                          <Button title="Download PO" variant="ghost" size="icon" className="h-8 w-8">
                            <Download className="h-4 w-4 text-miracle-mediumBlue" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4 text-miracle-mediumBlue" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { console.log("edit") }}>Edit</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { handleShipments({ POId: poItem.POId, QuoteId: poItem.QuoteId }) }}>Dispatch Items</DropdownMenuItem> {/* Simplified onClick */}
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

      {selectedPoData && (
        <Dialog open={isViewPoModalOpen} onOpenChange={setIsViewPoModalOpen}>
          <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>Purchase Order: {selectedPoData.POId}</DialogTitle>
              <DialogDescription>
                Details for purchase order from {selectedPoData.CustomerEmail || "N/A"}.
              </DialogDescription>
            </DialogHeader>
            <div className="py-1 max-h-[70vh] overflow-y-auto">
              <div className="">
                {selectedPoData.ExtractedDetails ? (
                  <iframe
                    src={selectedPoData.ExtractedDetails}
                    width="100%"
                    height="500px"
                    title={`PO Document ${selectedPoData.POId}`}
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
          </DialogContent>
        </Dialog>
      )}
    </PageTransition>
  )
}

export default PurchaseOrders