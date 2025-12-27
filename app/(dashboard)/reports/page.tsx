import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { getIncomeStatement } from "@/lib/accounting"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/db"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const company = await prisma.company.findFirst({
        where: { userId: user.id }
    })

    if (!company) {
        return <div className="p-8">No hay datos de empresa disponibles.</div>
    }

    const statement = await getIncomeStatement(company.id)

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount)
    }

    return (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Reportes Financieros</h1>
                <p className="text-muted-foreground">
                    Estado de Resultados para {format(statement.period.start, 'MMMM yyyy', { locale: es })}
                </p>
            </div>

            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Estado de Resultados</CardTitle>
                    <CardDescription>Resumen de operaciones del periodo</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Revenue Section */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-green-700">INGRESOS OPERACIONALES</h3>
                            <span className="text-lg font-bold text-green-700">{formatCurrency(statement.revenue.total)}</span>
                        </div>
                        <div className="space-y-2 pl-4 border-l-2 border-green-100">
                            {statement.revenue.items.map((item) => (
                                <div key={item.categoryId} className="flex justify-between text-sm">
                                    <span>{item.categoryName}</span>
                                    <span>{formatCurrency(item.amount)}</span>
                                </div>
                            ))}
                            {statement.revenue.items.length === 0 && (
                                <p className="text-sm text-gray-400 italic">Sin ingresos registrados</p>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Expense Section */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-red-700">GASTOS OPERACIONALES</h3>
                            <span className="text-lg font-bold text-red-700">{formatCurrency(statement.expenses.total)}</span>
                        </div>
                        <div className="space-y-2 pl-4 border-l-2 border-red-100">
                            {statement.expenses.items.map((item) => (
                                <div key={item.categoryId} className="flex justify-between text-sm">
                                    <span>{item.categoryName}</span>
                                    <span>{formatCurrency(item.amount)}</span>
                                </div>
                            ))}
                            {statement.expenses.items.length === 0 && (
                                <p className="text-sm text-gray-400 italic">Sin gastos registrados</p>
                            )}
                        </div>
                    </div>

                    <Separator className="my-4" />

                    {/* Net Income */}
                    <div className="flex justify-between items-center pt-2">
                        <h3 className="text-xl font-bold">RESULTADO NETO</h3>
                        <span className={`text-2xl font-bold ${statement.netIncome >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                            {formatCurrency(statement.netIncome)}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
