"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Button } from "../ui/button"
import { Download, Calendar, TrendingUp, DollarSign } from "lucide-react"
import { SalesChart } from "./SalesChart.jsx"
import { TopPerformersTable } from "./TopPerformersTable.jsx"

export function ReportsView() {
  const [period, setPeriod] = useState("month")

  return (
    <div className="p-6 space-y-6 page-transition">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-miracle-darkBlue">Reports & Analytics</h1>
          <p className="text-miracle-darkGray mt-1">View your sales performance and analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-miracle-lightBlue/10 rounded-md p-1 flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className={`${period === "week" ? "bg-white shadow-sm text-miracle-darkBlue" : "text-miracle-darkGray hover:text-miracle-darkBlue"}`}
              onClick={() => setPeriod("week")}
            >
              Week
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`${period === "month" ? "bg-white shadow-sm text-miracle-darkBlue" : "text-miracle-darkGray hover:text-miracle-darkBlue"}`}
              onClick={() => setPeriod("month")}
            >
              Month
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`${period === "quarter" ? "bg-white shadow-sm text-miracle-darkBlue" : "text-miracle-darkGray hover:text-miracle-darkBlue"}`}
              onClick={() => setPeriod("quarter")}
            >
              Quarter
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`${period === "year" ? "bg-white shadow-sm text-miracle-darkBlue" : "text-miracle-darkGray hover:text-miracle-darkBlue"}`}
              onClick={() => setPeriod("year")}
            >
              Year
            </Button>
          </div>
          <Button
            variant="outline"
            className="border-miracle-mediumBlue text-miracle-mediumBlue hover:bg-miracle-mediumBlue hover:text-white transition-colors duration-300"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up"
        style={{ animationDelay: "100ms" }}
      >
        <Card className="border-miracle-lightGray/20 shadow-sm hover-scale">
          <CardHeader className="pb-2">
            <CardDescription>Total Sales</CardDescription>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl text-miracle-darkBlue">$128,430</CardTitle>
              <DollarSign className="h-5 w-5 text-miracle-lightBlue" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xs flex items-center text-green-500">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>+12.5% from last {period}</span>
            </div>
          </CardContent>
        </Card>

        {/* Additional cards would be here */}
      </div>

      <Tabs defaultValue="sales" className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
        <TabsList className="bg-miracle-lightBlue/10 p-1">
          <TabsTrigger
            value="sales"
            className="data-[state=active]:bg-white data-[state=active]:text-miracle-darkBlue data-[state=active]:shadow-sm text-miracle-darkGray"
          >
            Sales Performance
          </TabsTrigger>
          <TabsTrigger
            value="leads"
            className="data-[state=active]:bg-white data-[state=active]:text-miracle-darkBlue data-[state=active]:shadow-sm text-miracle-darkGray"
          >
            Lead Generation
          </TabsTrigger>
          <TabsTrigger
            value="conversion"
            className="data-[state=active]:bg-white data-[state=active]:text-miracle-darkBlue data-[state=active]:shadow-sm text-miracle-darkGray"
          >
            Conversion Rates
          </TabsTrigger>
        </TabsList>
        <TabsContent value="sales" className="mt-4">
          <Card className="border-miracle-lightGray/20 shadow-sm">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-miracle-darkBlue">Sales Performance</CardTitle>
                  <CardDescription>Revenue trends over time</CardDescription>
                </div>
                <div className="flex items-center text-xs text-miracle-darkGray">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>Last updated: Today, 2:30 PM</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <SalesChart period={period} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Additional tabs content would be here */}
      </Tabs>

      <Card className="border-miracle-lightGray/20 shadow-sm animate-fade-in-up" style={{ animationDelay: "300ms" }}>
        <CardHeader>
          <CardTitle className="text-miracle-darkBlue">Top Performers</CardTitle>
          <CardDescription>Sales representatives with highest performance</CardDescription>
        </CardHeader>
        <CardContent>
          <TopPerformersTable period={period} />
        </CardContent>
      </Card>
    </div>
  )
}
