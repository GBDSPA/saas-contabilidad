import { getCategories, getTransactions } from '@/app/actions/transaction'
import { TransactionManager } from '@/components/transactions/TransactionManager'

export const dynamic = 'force-dynamic'

export default async function TransactionsPage() {
    const [transactions, categories] = await Promise.all([
        getTransactions(),
        getCategories()
    ])

    return (
        <TransactionManager
            initialTransactions={transactions}
            categories={categories}
        />
    )
}
