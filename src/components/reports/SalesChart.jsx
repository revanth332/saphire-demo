import { useState } from "react"
import { mockSalesData } from "@/lib/mock-data"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { BarChart, LineChart } from "@/components/ui/chart"



export function SalesChart({ period }) {
    const [chartType, setChartType] = useState("bar")
    const data = mockSalesData[period] || mockSalesData.month

    // Format data for charts
    const chartData = data.map((item) => ({
        name: item.month,
        revenue: item.revenue,
        target: item.target,
    }))

    return (
        <div className="h-full w-full">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                        <div className="h-3 w-3 rounded-sm bg-miracle-mediumBlue"></div>
                        <span>Revenue</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="h-3 w-3 rounded-sm bg-miracle-red/50"></div>
                        <span>Target</span>
                    </div>
                </div>

                <Tabs
                    value={chartType}
                    onValueChange={(value) => setChartType(value)}
                    className="bg-miracle-lightBlue/10 rounded-md p-1"
                >
                    <TabsList className="bg-transparent">
                        <TabsTrigger
                            value="bar"
                            className="text-xs py-1 px-2 data-[state=active]:bg-white data-[state=active]:text-miracle-darkBlue"
                        >
                            Bar
                        </TabsTrigger>
                        <TabsTrigger
                            value="area"
                            className="text-xs py-1 px-2 data-[state=active]:bg-white data-[state=active]:text-miracle-darkBlue"
                        >
                            Area
                        </TabsTrigger>
                        <TabsTrigger
                            value="interactive"
                            className="text-xs py-1 px-2 data-[state=active]:bg-white data-[state=active]:text-miracle-darkBlue"
                        >
                            Interactive
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="h-[calc(100%-40px)] w-full">
                {/* {chartType === "bar" && (
                    <Card className="border-none shadow-none">
                        <CardContent className="p-0">
                            <BarChart
                                data={chartData}
                                index="name"
                                categories={["revenue", "target"]}
                                colors={["#1E88E5", "#E53935"]}
                                valueFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
                                yAxisWidth={60}
                                showAnimation
                                className="h-[300px]"
                            />
                        </CardContent>
                    </Card>
                )} */}

                {/* {chartType === "area" && (
                    <Card className="border-none shadow-none">
                        <CardContent className="p-0">
                            <AreaChart
                                data={chartData}
                                index="name"
                                categories={["revenue", "target"]}
                                colors={["#1E88E5", "#E53935"]}
                                valueFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
                                yAxisWidth={60}
                                showAnimation
                                className="h-[300px]"
                            />
                        </CardContent>
                    </Card>
                )} */}

                {/* {chartType === "interactive" && (
                    <Card className="border-none shadow-none">
                        <CardContent className="p-0">
                            <LineChart
                                data={chartData}
                                index="name"
                                categories={["revenue", "target"]}
                                colors={["#1E88E5", "#E53935"]}
                                valueFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
                                yAxisWidth={60}
                                showAnimation
                                showLegend
                                showTooltip
                                showXAxis
                                showYAxis
                                className="h-[300px]"
                            />
                        </CardContent>
                    </Card>
                )} */}
            </div>
        </div>
    )
}
