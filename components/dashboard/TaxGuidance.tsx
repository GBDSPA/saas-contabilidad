import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VatSummary } from "@/lib/accounting"
import { ArrowDownIcon, ArrowUpIcon, AlertCircle, CheckCircle2 } from "lucide-react"

interface TaxGuidanceProps {
    vatSummary: VatSummary
}

export function TaxGuidance({ vatSummary }: TaxGuidanceProps) {
    const { debit, credit, balance } = vatSummary
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount)
    }

    const isPayable = balance > 0
    const statusColor = isPayable ? "text-red-600" : "text-green-600"
    const bgStatus = isPayable ? "bg-red-50" : "bg-green-50"

    return (
        <Card className="col-span-1 md:col-span-2 lg:col-span-3 border-l-4 border-l-blue-500 shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <span>📡 Monitor de IVA (Mes Actual)</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid gap-6 md:grid-cols-3">

                    {/* Resumen Principal */}
                    <div className={`rounded-xl p-4 ${bgStatus} border border-opacity-20 flex flex-col justify-center`}>
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                            {isPayable ? "IVA A Pagar" : "Remanente a Favor"}
                        </h3>
                        <div className={`text-3xl font-bold mt-1 ${statusColor}`}>
                            {formatCurrency(Math.abs(balance))}
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-700">
                            {isPayable ? (
                                <AlertCircle className="h-4 w-4 text-red-500" />
                            ) : (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                            )}
                            <p>
                                {isPayable
                                    ? "Debes declarar y pagar este monto."
                                    : "Tienes saldo a favor para el próximo mes."}
                            </p>
                        </div>
                    </div>

                    {/* Detalle Débito / Crédito */}
                    <div className="md:col-span-2 grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <span className="text-xs text-muted-foreground uppercase">IVA Débito (Ventas)</span>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="font-semibold text-gray-900">{formatCurrency(debit)}</span>
                                <ArrowUpIcon className="h-4 w-4 text-orange-500" />
                            </div>
                            <p className="text-[10px] text-gray-400">Impuesto recolectado de tus clientes.</p>
                        </div>

                        <div className="space-y-1">
                            <span className="text-xs text-muted-foreground uppercase">IVA Crédito (Compras)</span>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="font-semibold text-gray-900">{formatCurrency(credit)}</span>
                                <ArrowDownIcon className="h-4 w-4 text-blue-500" />
                            </div>
                            <p className="text-[10px] text-gray-400">Impuesto descontable de tus gastos.</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
