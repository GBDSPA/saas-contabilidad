import { prisma } from "@/lib/db"
import { startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from "date-fns"

export interface IncomeStatementItem {
    categoryId: string
    categoryName: string
    amount: number
}

export interface IncomeStatement {
    revenue: {
        total: number
        items: IncomeStatementItem[]
    }
    expenses: {
        total: number
        items: IncomeStatementItem[]
    }
    netIncome: number
    period: {
        start: Date
        end: Date
    }
}

export interface DashboardMetrics {
    income: {
        total: number
        change: number
    }
    expenses: {
        total: number
        change: number
    }
    netIncome: number
}

export async function getIncomeStatement(companyId: string, startDate?: Date, endDate?: Date): Promise<IncomeStatement> {
    const start = startDate || startOfMonth(new Date())
    const end = endDate || endOfMonth(new Date())

    const transactions = await prisma.transaction.findMany({
        where: {
            companyId,
            fecha: {
                gte: start,
                lte: end
            },
            status: 'COMPLETED'
        },
        include: {
            category: true
        }
    })

    const revenueItems: Record<string, IncomeStatementItem> = {}
    const expenseItems: Record<string, IncomeStatementItem> = {}
    let totalRevenue = 0
    let totalExpenses = 0

    transactions.forEach(t => {
        // Use Net amount for P&L if available, otherwise fallback to Total
        // If legacy data has no montoNeto, we assume it was gross=net (exempt)
        const amount = t.montoNeto ? Number(t.montoNeto) : Number(t.monto)
        const categoryId = t.categoryId
        const categoryName = t.category.nombre

        if (t.tipo === 'INGRESO') {
            totalRevenue += amount
            if (!revenueItems[categoryId]) {
                revenueItems[categoryId] = { categoryId, categoryName, amount: 0 }
            }
            revenueItems[categoryId].amount += amount
        } else {
            totalExpenses += amount
            if (!expenseItems[categoryId]) {
                expenseItems[categoryId] = { categoryId, categoryName, amount: 0 }
            }
            expenseItems[categoryId].amount += amount
        }
    })

    return {
        revenue: {
            total: totalRevenue,
            items: Object.values(revenueItems).sort((a, b) => b.amount - a.amount)
        },
        expenses: {
            total: totalExpenses,
            items: Object.values(expenseItems).sort((a, b) => b.amount - a.amount)
        },
        netIncome: totalRevenue - totalExpenses,
        period: { start, end }
    }
}

export async function getDashboardMetrics(companyId: string): Promise<DashboardMetrics> {
    const now = new Date()
    const currentStart = startOfMonth(now)
    const currentEnd = endOfMonth(now)

    // Previous month for comparison
    const prevStart = startOfMonth(subMonths(now, 1))
    const prevEnd = endOfMonth(subMonths(now, 1))

    const [current, previous] = await Promise.all([
        getIncomeStatement(companyId, currentStart, currentEnd),
        getIncomeStatement(companyId, prevStart, prevEnd)
    ])

    const calculateChange = (current: number, previous: number) => {
        if (previous === 0) return current === 0 ? 0 : 100
        return ((current - previous) / previous) * 100
    }

    return {
        income: {
            total: current.revenue.total,
            change: calculateChange(current.revenue.total, previous.revenue.total)
        },
        expenses: {
            total: current.expenses.total,
            change: calculateChange(current.expenses.total, previous.expenses.total)
        },
        netIncome: current.netIncome
    }
}

export interface VatSummary {
    debit: number // IVA from Sales (We owe this)
    credit: number // IVA from Purchases (We deduct this)
    balance: number // debit - credit. > 0 means PAY, < 0 means BALANCE IN FAVOR
    period: {
        start: Date
        end: Date
    }
}

export async function getVatSummary(companyId: string): Promise<VatSummary> {
    const now = new Date()
    const start = startOfMonth(now)
    const end = endOfMonth(now)

    const transactions = await prisma.transaction.findMany({
        where: {
            companyId,
            OR: [
                {
                    // Case 1: Has fechaDocumento within range
                    fechaDocumento: {
                        gte: start,
                        lte: end
                    }
                },
                {
                    // Case 2: No fechaDocumento, use fecha within range
                    fechaDocumento: null,
                    fecha: {
                        gte: start,
                        lte: end
                    }
                }
            ],
            afectoIva: true
        }
    })

    let debit = 0
    let credit = 0

    transactions.forEach(t => {
        const iva = Number(t.montoIva) || 0
        if (t.tipo === 'INGRESO') {
            debit += iva
        } else {
            credit += iva
        }
    })

    return {
        debit,
        credit,
        balance: debit - credit,
        period: { start, end }
    }
}
