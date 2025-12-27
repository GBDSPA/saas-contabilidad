
"use client"

import * as React from "react"
import { Label, Pie, PieChart } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart"

interface CategoryPieChartProps {
    title: string
    description?: string
    data: {
        category: string
        amount: number
        fill: string
    }[]
    totalAmount: number
}

export function CategoryPieChart({ title, description, data, totalAmount }: CategoryPieChartProps) {

    // Create chart config dynamically based on data
    const chartConfig = React.useMemo(() => {
        const config: ChartConfig = {
            amount: {
                label: "Monto",
            }
        }
        data.forEach((item) => {
            config[item.category] = {
                label: item.category,
                color: item.fill
            }
        })
        return config
    }, [data])

    if (totalAmount === 0) {
        return (
            <Card className="flex flex-col">
                <CardHeader className="items-center pb-0">
                    <CardTitle>{title}</CardTitle>
                    {description && <CardDescription>{description}</CardDescription>}
                </CardHeader>
                <CardContent className="flex flex-1 items-center justify-center min-h-[250px] text-muted-foreground">
                    Sin datos en este periodo
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[250px] w-full min-h-[200px] sm:min-h-[250px]"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const dataItem = payload[0].payload;
                                    const percent = totalAmount > 0 ? (dataItem.amount / totalAmount) * 100 : 0;
                                    return (
                                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                                            <div className="flex flex-col">
                                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                    {dataItem.category}
                                                </span>
                                                <span className="font-bold text-muted-foreground">
                                                    {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(dataItem.amount)}
                                                </span>
                                                <span className="text-xs font-medium text-foreground">
                                                    {percent.toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>
                                    )
                                }
                                return null;
                            }}
                        />
                        <Pie
                            data={data}
                            dataKey="amount"
                            nameKey="category"
                            innerRadius={60}
                            strokeWidth={5}
                        >
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        return (
                                            <text
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    className="fill-foreground text-lg font-bold"
                                                >
                                                    {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', notation: "compact", maximumFractionDigits: 1 }).format(totalAmount)}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 24}
                                                    className="fill-muted-foreground text-xs"
                                                >
                                                    Total
                                                </tspan>
                                            </text>
                                        )
                                    }
                                }}
                            />
                        </Pie>
                        <ChartLegend
                            content={<ChartLegendContent nameKey="category" />}
                            className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center text-xs"
                        />
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
