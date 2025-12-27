import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle } from "lucide-react"
import Link from 'next/link'
import { getDashboardMetrics, getVatSummary, getIncomeStatement } from "@/lib/accounting"
import { TaxGuidance } from "@/components/dashboard/TaxGuidance"
import { SavingsRateWidget } from "@/components/dashboard/SavingsRateWidget"
import { CategoryPieChart } from "@/components/dashboard/CategoryPieChart"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/db"
import { getTransactions } from "@/app/actions/transaction"
import { TransactionList } from "@/components/transactions/TransactionList"
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Fetch company
    let company = await prisma.company.findFirst({
        where: { userId: user.id }
    })

    if (!company) {
        const dbUser = await prisma.user.findUnique({ where: { id: user.id } })

        if (!dbUser) {
            await prisma.user.create({
                data: {
                    id: user.id,
                    email: user.email!,
                    nombre: user.user_metadata?.full_name || "Usuario",
                }
            })
        }

        company = await prisma.company.create({
            data: {
                userId: user.id,
                nombreEmpresa: "Mi Empresa",
                moneda: "CLP",
                tipoNegocio: "General"
            }
        })
    }

    const metrics = await getDashboardMetrics(company.id)
    const vatSummary = await getVatSummary(company.id)
    const recentTransactions = await getTransactions()
    const incomeStatement = await getIncomeStatement(company.id)

    // Palette for charts
    // Palette for charts
    const colors = [
        "var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)",
        "var(--color-chart-4)", "var(--color-chart-5)"
    ]

    const incomeData = incomeStatement.revenue.items.slice(0, 5).map((item, index) => ({
        category: item.categoryName,
        amount: item.amount,
        fill: colors[index % colors.length]
    }))

    // Group "Others" if many items? For now just top 5 is fine or slice

    const expenseData = incomeStatement.expenses.items.slice(0, 5).map((item, index) => ({
        category: item.categoryName,
        amount: item.amount,
        fill: colors[index % colors.length]
    }))

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount)
    }

    const formatChange = (change: number) => {
        const sign = change > 0 ? "+" : ""
        return `${sign}${change.toFixed(1)}%`
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl">Dashboard General</h1>
                <Link href="/transactions">
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Gestionar Transacciones
                    </Button>
                </Link>
            </div>

            {/* TAX GUIDANCE WIDGET - Only for Business */}
            {company.type !== 'PERSONAL' ? (
                <div className="grid gap-4 md:grid-cols-1">
                    <TaxGuidance vatSummary={vatSummary} />
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    <div className="grid gap-4 md:grid-cols-1">
                        <SavingsRateWidget income={metrics.income.total} expenses={metrics.expenses.total} />
                    </div>
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {company.type === 'PERSONAL' ? 'Ingresos Totales' : 'Ingresos (Mes Actual)'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(metrics.income.total)}</div>
                        <p className="text-xs text-muted-foreground">{formatChange(metrics.income.change)} respecto al mes anterior</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {company.type === 'PERSONAL' ? 'Gastos Totales' : 'Gastos (Mes Actual)'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{formatCurrency(metrics.expenses.total)}</div>
                        <p className="text-xs text-muted-foreground">{formatChange(metrics.expenses.change)} respecto al mes anterior</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Resultado Neto</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${metrics.netIncome >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                            {formatCurrency(metrics.netIncome)}
                        </div>
                        <p className="text-xs text-muted-foreground">Flujo de caja del periodo</p>
                    </CardContent>
                </Card>
            </div>

            {/* PIE CHARTS - Visible for everyone but tailored context via title */}
            {/* Show only if there is data to show */}
            {(incomeData.length > 0 || expenseData.length > 0) && (
                <div className="grid gap-4 md:grid-cols-2">
                    <CategoryPieChart
                        title="Distribución de Ingresos"
                        description="Este mes"
                        data={incomeData}
                        totalAmount={incomeStatement.revenue.total}
                    />
                    <CategoryPieChart
                        title="Distribución de Gastos"
                        description="Este mes"
                        data={expenseData}
                        totalAmount={incomeStatement.expenses.total}
                    />
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-1">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Transacciones Recientes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Suspense fallback={<div>Cargando...</div>}>
                            <TransactionList transactions={recentTransactions.slice(0, 5)} />
                        </Suspense>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
