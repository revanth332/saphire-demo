import { Badge } from "../ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Timeline } from "./timeline"

function CustomerInfo({ lead, isLoading }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case "new":
        return (
          <Badge variant="default" className="bg-miracle-lightBlue text-white">
            New
          </Badge>
        )
      case "contacted":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200">
            Contacted
          </Badge>
        )
      case "qualified":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200">
            Qualified
          </Badge>
        )
      case "proposal":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-200">
            Proposal
          </Badge>
        )
      case "closed":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-50 border-gray-200">
            Closed
          </Badge>
        )
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="border-miracle-lightGray/30 shadow-md ">
          <CardHeader className="bg-gradient-to-r from-miracle-darkBlue to-miracle-mediumBlue text-white rounded-t-lg py-6">
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 animate-pulse">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
        <Timeline lead={lead} isLoading={true} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="border-miracle-lightGray/30 shadow-md transition-all duration-300 hover:shadow-lg">
        <CardHeader className="bg-gradient-to-r from-miracle-darkBlue to-miracle-mediumBlue text-white rounded-t-lg py-6">
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="space-y-4">
            <div className="flex items-center justify-between animate-slide-up" style={{ animationDelay: "100ms" }}>
              <h3 className="text-lg font-semibold text-miracle-darkBlue">{lead?.CustomerName}</h3>
              {getStatusBadge(lead?.status)}
            </div>

            <div className="space-y-3">
              <div className="animate-slide-up" style={{ animationDelay: "150ms" }}>
                <p className="text-sm font-medium text-miracle-mediumBlue">Description</p>
                <p className="transition-all duration-300 hover:translate-x-1">{lead?.chatDescription || "N/A"}</p>
              </div>

              <div className="animate-slide-up" style={{ animationDelay: "150ms" }}>
                <p className="text-sm font-medium text-miracle-mediumBlue">Company</p>
                <p className="transition-all duration-300 hover:translate-x-1">{lead?.CompanyName || "N/A"}</p>
              </div>

              <div className="animate-slide-up" style={{ animationDelay: "200ms" }}>
                <p className="text-sm font-medium text-miracle-mediumBlue">Email</p>
                <p className="transition-all duration-300 hover:translate-x-1">{lead?.CustomerEmail}</p>
              </div>

              <div className="animate-slide-up" style={{ animationDelay: "350ms" }}>
                <p className="text-sm font-medium text-miracle-mediumBlue">Created</p>
                <p className="transition-all duration-300 hover:translate-x-1">
                  {new Date(lead?.CreatedAt).toLocaleDateString() +
                    ", " +
                    new Date(lead?.CreatedAt).toLocaleTimeString() || "Just now"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Timeline lead={lead} />
    </div>
  )
}

export { CustomerInfo }
