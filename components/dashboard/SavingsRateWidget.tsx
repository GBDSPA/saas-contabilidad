
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { PiggyBank, TrendingDown, TrendingUp } from "lucide-react"

interface SavingsRateWidgetProps {
    income: number
    expenses: number
}

export function SavingsRateWidget({ income, expenses }: SavingsRateWidgetProps) {
    // Avoid division by zero
    const rate = income > 0 ? ((income - expenses) / income) * 100 : 0
    const clampedRate = Math.min(Math.max(rate, -100), 100) // Clamp visually
    const isPositive = rate >= 0

    let colorClass = "text-yellow-600"
    let progressColor = "bg-yellow-500"
    let message = "Estás saliendo a mano. ¡Cuidado!"

    if (rate >= 20) {
        colorClass = "text-green-600"
        progressColor = "bg-green-500"
        message = "¡Excelente capacidad de ahorro!"
    } else if (rate > 0) {
        colorClass = "text-blue-600"
        progressColor = "bg-blue-500"
        message = "Estás ahorrando, pero podrías mejorar."
    } else if (rate < 0) {
        colorClass = "text-red-600"
        progressColor = "bg-red-500"
        message = "Estás gastando más de lo que ganas."
    }

    return (
        <Card className="col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasa de Ahorro</CardTitle>
                <PiggyBank className={`h-4 w-4 ${colorClass}`} />
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold ${colorClass}`}>
                    {rate.toFixed(1)}%
                </div>
                <Progress
                    value={Math.abs(clampedRate)}
                    className={`h-2 mt-2 ${rate < 0 ? '[&>div]:bg-red-500' : ''}`}
                // Note: Shadcn Progress component standard color customization might require verify
                />

                <p className="text-xs text-muted-foreground mt-2 flex items-center">
                    {isPositive ? (
                        <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                    ) : (
                        <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                    )}
                    {message}
                </p>
                <div className="mt-4 text-xs text-muted-foreground flex justify-between">
                    <span>Ingresos: {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(income)}</span>
                    <span className="font-medium text-red-400">Gastos: {new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(expenses)}</span>
                </div>
            </CardContent>
        </Card>
    )
}
