'use client'

import { useState } from 'react'
import { TransactionList } from './TransactionList'
import { TransactionForm } from './TransactionForm'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { PlusCircle } from 'lucide-react'
import { Category, CompanyType } from '@prisma/client'

interface TransactionManagerProps {
    initialTransactions: any[]
    categories: Category[]
    companyType: CompanyType | string
    companyId?: string
}

export function TransactionManager({ initialTransactions, categories, companyType, companyId }: TransactionManagerProps) {
    const [transactions, setTransactions] = useState(initialTransactions)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [editingTransaction, setEditingTransaction] = useState<any>(null)

    const handleSuccess = () => {
        setIsCreateOpen(false)
        setEditingTransaction(null)
        window.location.reload()
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Transacciones</h1>
                    <p className="text-muted-foreground">Gestiona tus ingresos y gastos.</p>
                </div>

                <Button onClick={() => setIsCreateOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nueva Transacción
                </Button>

                {/* Create Dialog */}
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Agregar Transacción</DialogTitle>
                            <DialogDescription>
                                Registra un nuevo movimiento financiero.
                            </DialogDescription>
                        </DialogHeader>
                        <TransactionForm
                            categories={categories}
                            onSuccess={handleSuccess}
                            companyType={companyType}
                            companyId={companyId}
                        />
                    </DialogContent>
                </Dialog>

                {/* Edit Dialog */}
                <Dialog open={!!editingTransaction} onOpenChange={(open) => !open && setEditingTransaction(null)}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Editar Transacción</DialogTitle>
                            <DialogDescription>
                                Modifica los detalles de la transacción.
                            </DialogDescription>
                        </DialogHeader>
                        {editingTransaction && (
                            <TransactionForm
                                categories={categories}
                                initialData={editingTransaction}
                                onSuccess={handleSuccess}
                                companyType={companyType}
                                companyId={companyId}
                            />
                        )}
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-4">
                <TransactionList
                    transactions={initialTransactions}
                    onEdit={(t) => setEditingTransaction(t)}
                />
            </div>
        </div>
    )
}
