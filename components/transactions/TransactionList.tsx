import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"

interface TransactionListProps {
    transactions: any[]
    onEdit?: (transaction: any) => void
}

export function TransactionList({ transactions, onEdit }: TransactionListProps) {
    if (transactions.length === 0) {
        return (
            <div className="text-center p-8 text-gray-500 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
                No hay transacciones registradas aún.
            </div>
        )
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Moneda</TableHead>
                        <TableHead>IVA</TableHead>
                        <TableHead className="text-right">Monto</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.map((t) => (
                        <TableRow key={t.id}>
                            <TableCell>{format(new Date(t.fecha), 'dd/MM/yyyy')}</TableCell>
                            <TableCell className="font-medium">
                                <div className="flex flex-col">
                                    <span>{t.descripcion}</span>
                                    {t.monedaOriginal === 'USD' && (
                                        <span className="text-xs text-muted-foreground">
                                            TC: {Number(t.tipoCambio)}
                                        </span>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                    {t.category.nombre}
                                </span>
                            </TableCell>
                            <TableCell>
                                <span className={cn(
                                    "font-semibold",
                                    t.monedaOriginal === 'USD' ? "text-blue-600" : "text-gray-600"
                                )}>
                                    {t.monedaOriginal}
                                </span>
                            </TableCell>
                            <TableCell>
                                {t.afectoIva ? (
                                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                        Afecto
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                        Exento
                                    </span>
                                )}
                            </TableCell>
                            <TableCell className={cn(
                                "text-right font-bold",
                                t.tipo === 'INGRESO' ? "text-green-600" : "text-red-600"
                            )}>
                                {t.tipo === 'INGRESO' ? '+' : '-'}${Number(t.monto).toLocaleString('es-CL')}
                            </TableCell>
                            <TableCell>
                                {onEdit && (
                                    <Button variant="ghost" size="icon" onClick={() => onEdit(t)}>
                                        <Pencil className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
