import { API } from "@/services/API"
import { useQuery } from "@tanstack/react-query"
import { Mail, MoreHorizontal, Phone, Plus, Search } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { useToast } from "../../hooks/use-toast"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Input } from "../ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"

export function LeadsView() {
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  const { data: leads = [], _isLoading, _isError } = useQuery({
    queryKey: ['leadsView'],
    queryFn: async () => {
      try {
        const response = await API.get.getAllLeads();
        console.log(response.data.data);
        setLeads(response.data.data)
        return response.data.data;

      } catch (error) {
        console.error('Error fetching leads:', error);
        return [];  // Return an empty array in case of error
      }
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false
  })

  const [lead, setLeads] = useState(leads)


  // useEffect(() => {
  //   setLeads(mockLeads)
  // }, [])

  const filteredLeads = lead?.filter(
    (lead) =>
      lead?.CustomerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead?.CustomerEmail?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAction = (action, lead) => {
    toast({
      title: `${action} lead`,
      description: `Action ${action} performed on lead ${lead.name}`,
    })
  }

  return (
    <div className="p-6 space-y-6 page-transition w-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-miracle-darkBlue">Leads Management</h1>
          <p className="text-miracle-darkGray mt-1">Manage and track your sales leads</p>
        </div>
        {/* <Button
            variant="outline"
            className="border-miracle-mediumBlue text-miracle-mediumBlue hover:bg-miracle-mediumBlue hover:text-white transition-colors duration-300"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button> */}
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1 md:w-64">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search leads..." className="w-full pl-9 bg-white" value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
        {/* <Button variant="outline" size="icon" className="border-miracle-lightGray/30">
            <Filter className="h-4 w-4 text-miracle-darkGray" />
          </Button> */}
        <Button className="bg-miracle-mediumBlue hover:bg-miracle-darkBlue text-white transition-colors duration-300">
          <Plus className="mr-2 h-4 w-4" />
          Add Lead
        </Button>
      </div>

      <div className="rounded-md border border-miracle-lightGray/20 overflow-hidden">
        <Table>
          <TableHeader className="bg-miracle-lightBlue/5">
            <TableRow>
              <TableHead className="text-miracle-darkBlue">Name</TableHead>
              <TableHead className="text-miracle-darkBlue">Contact</TableHead>
              <TableHead className="text-miracle-darkBlue">Status</TableHead>
              <TableHead className="text-miracle-darkBlue">Created</TableHead>
              <TableHead className="text-miracle-darkBlue w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-miracle-darkGray">
                  No leads found
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((lead, index) => (
                <TableRow
                  key={lead.id}
                  className="hover:bg-miracle-lightBlue/5 transition-colors duration-200 animate-fade-in"
                  style={{ animationDelay: `${index * 50 + 200}ms` }}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border border-miracle-lightBlue/20">
                        <AvatarFallback className="bg-miracle-lightBlue/10 text-miracle-darkBlue">
                          {lead.CustomerName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-miracle-black">{lead.CustomerName}</div>
                        <div className="text-xs text-miracle-darkGray">{lead.company}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center text-xs text-miracle-darkGray">
                        <Mail className="h-3 w-3 mr-1 text-miracle-lightBlue" />
                        {lead.CustomerEmail}
                      </div>
                      {lead.phone && <div className="flex items-center text-xs text-miracle-darkGray">
                        <Phone className="h-3 w-3 mr-1 text-miracle-lightBlue" />
                        {lead.phone}
                      </div>
                      }
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-miracle-lightBlue/10 text-miracle-mediumBlue border-miracle-lightBlue/30"
                    >
                      {lead.source}
                    </Badge>
                  </TableCell>
                  {/* <TableCell>
                    <Badge
                      className={
                        lead.status === "New"
                          ? "bg-miracle-red text-white"
                          : lead.status === "Contacted"
                            ? "bg-amber-500 text-white"
                            : "bg-green-500 text-white"
                      }
                    >
                      {lead.status}
                    </Badge>
                  </TableCell> */}
                  <TableCell className="text-miracle-darkGray text-sm">{lead.createdAt}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-miracle-darkGray hover:text-miracle-darkBlue"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleAction("View", lead)}>
                          <Link to={`/leads/${lead.id}`}>View Details</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction("Edit", lead)}>Edit Lead</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction("Email", lead)}>Send Email</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleAction("Delete", lead)}
                          className="text-miracle-red focus:text-miracle-red"
                        >
                          Delete Lead
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
