import { getCategories, getTransactions, getCompanyProfile } from '@/app/actions/transaction'
import { TransactionManager } from '@/components/transactions/TransactionManager'

export const dynamic = 'force-dynamic'

export default async function TransactionsPage() {
    const [transactions, categories, company] = await Promise.all([
        getTransactions(),
        getCategories(),
        getCompanyProfile()
    ])

    return (
        <TransactionManager
            initialTransactions={transactions}
            categories={categories}
            companyType={company?.type || 'BUSINESS'}
            companyId={company?.id}
        />
    )
}
