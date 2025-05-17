
import { mockPerformers } from "@/lib/mock-data"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { TrendingDown, TrendingUp } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function TopPerformersTable({ period }) {
  const performers = mockPerformers[period] || mockPerformers.month

  return (
    <Table>
      <TableHeader className="bg-miracle-lightBlue/5">
        <TableRow>
          <TableHead className="text-miracle-darkBlue">Representative</TableHead>
          <TableHead className="text-miracle-darkBlue text-right">Sales</TableHead>
          <TableHead className="text-miracle-darkBlue text-right">Leads</TableHead>
          <TableHead className="text-miracle-darkBlue text-right">Conversion</TableHead>
          <TableHead className="text-miracle-darkBlue text-right">Trend</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {performers.map((performer, index) => (
          <TableRow
            key={performer.id}
            className="hover:bg-miracle-lightBlue/5 transition-colors duration-200 animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 border border-miracle-lightBlue/20">
                  <AvatarFallback className="bg-miracle-lightBlue/10 text-miracle-darkBlue">
                    {performer.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="font-medium text-miracle-black">{performer.name}</div>
              </div>
            </TableCell>
            <TableCell className="text-right font-medium text-miracle-darkBlue">
              ${performer.sales.toLocaleString()}
            </TableCell>
            <TableCell className="text-right">{performer.leads}</TableCell>
            <TableCell className="text-right">{performer.conversion}%</TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end">
                {performer.trend > 0 ? (
                  <div className="flex items-center text-green-500">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>{performer.trend}%</span>
                  </div>
                ) : (
                  <div className="flex items-center text-miracle-red">
                    <TrendingDown className="h-4 w-4 mr-1" />
                    <span>{Math.abs(performer.trend)}%</span>
                  </div>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
