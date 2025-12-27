import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle } from "lucide-react"
import Link from 'next/link'
import { getDashboardMetrics, getVatSummary } from "@/lib/accounting"
import { TaxGuidance } from "@/components/dashboard/TaxGuidance"
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

            {/* TAX GUIDANCE WIDGET */}
            <div className="grid gap-4 md:grid-cols-1">
                <TaxGuidance vatSummary={vatSummary} />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ingresos (Mes Actual)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(metrics.income.total)}</div>
                        <p className="text-xs text-muted-foreground">{formatChange(metrics.income.change)} respecto al mes anterior</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Gastos (Mes Actual)</CardTitle>
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
