'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarIcon, Loader2, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

import { transactionSchema, type TransactionFormValues } from '@/lib/validations/transaction'
import { createTransaction, updateTransaction } from '@/app/actions/transaction'
import { Category } from '@prisma/client'

interface TransactionFormProps {
    categories: Category[]
    onSuccess?: () => void
    initialData?: any
}

export function TransactionForm({ categories, onSuccess, initialData }: TransactionFormProps) {
    const [isPending, setIsPending] = useState(false)
    const [isCalendarOpen, setIsCalendarOpen] = useState(false)
    const defaultDate = new Date()

    const form = useForm({
        resolver: zodResolver(transactionSchema),
        defaultValues: initialData ? {
            tipo: initialData.tipo,
            monto: Number(initialData.monto),
            descripcion: initialData.descripcion,
            fecha: new Date(initialData.fecha),
            fechaDocumento: initialData.fechaDocumento ? new Date(initialData.fechaDocumento) : undefined,
            monedaOriginal: initialData.monedaOriginal,
            montoOriginal: Number(initialData.montoOriginal) || 0,
            tipoCambio: Number(initialData.tipoCambio) || 1,
            afectoIva: initialData.afectoIva || false,
            status: initialData.status || 'COMPLETED',
            categoryId: initialData.categoryId,
            companyId: initialData.companyId
        } : {
            tipo: 'GASTO' as const,
            monto: 0,
            descripcion: '',
            fecha: undefined as any,
            monedaOriginal: 'CLP' as const,
            montoOriginal: 0,
            tipoCambio: 1,
            afectoIva: false,
            status: 'COMPLETED' as const,
        },
    })

    // Reset when initialData changes
    useEffect(() => {
        if (initialData) {
            form.reset({
                tipo: initialData.tipo,
                monto: Number(initialData.monto),
                descripcion: initialData.descripcion,
                fecha: new Date(initialData.fecha),
                fechaDocumento: initialData.fechaDocumento ? new Date(initialData.fechaDocumento) : undefined,
                monedaOriginal: initialData.monedaOriginal,
                montoOriginal: Number(initialData.montoOriginal) || 0,
                tipoCambio: Number(initialData.tipoCambio) || 1,
                afectoIva: initialData.afectoIva || false,
                status: initialData.status || 'COMPLETED',
                categoryId: initialData.categoryId
            })
        } else {
            // Optional: reset to default if data cleared
            // but usually we rely on mounting/unmounting or specific reset triggers
        }
    }, [initialData, form])

    // Watchers
    const status = form.watch('status')

    useEffect(() => {
        if (status === 'PENDING') {
            form.setValue('fecha', undefined as any)
            form.clearErrors('fecha')
        }
    }, [status, form])
    const moneda = form.watch('monedaOriginal')
    const montoOriginal = form.watch('montoOriginal')
    const tipoCambio = form.watch('tipoCambio')
    const afectoIva = form.watch('afectoIva')
    const currentMonto = form.watch('monto') as number

    // Effect to fetch dollar rate
    useEffect(() => {
        if (moneda === 'USD') {
            // Only auto-fetch if creating new or if explicit
            // But for editing, we might want to keep existing rate unless forced.
            // Logic: If creating (no initialData) -> fetch.
            // If editing -> don't overwrite unless user requests.
            if (!initialData) {
                fetchRate()
            }
        } else {
            form.setValue('tipoCambio', 1)
            form.setValue('monto', form.getValues('montoOriginal') || 0)
        }
    }, [moneda, initialData])

    // Effect to calculate "monto" (CLP)
    useEffect(() => {
        if (moneda === 'USD') {
            const valMonto = Number(montoOriginal) || 0
            const valRate = Number(tipoCambio) || 1
            const calculated = valMonto * valRate
            form.setValue('monto', Math.round(calculated))
        } else {
            form.setValue('monto', Number(montoOriginal) || 0)
        }
    }, [moneda, montoOriginal, tipoCambio])

    async function fetchRate() {
        try {
            const res = await fetch('https://mindicador.cl/api/dolar')
            const data = await res.json()
            if (data && data.serie && data.serie.length > 0) {
                const rate = data.serie[0].valor
                form.setValue('tipoCambio', rate)
                toast.success(`Dólar actual: $${rate}`)
            }
        } catch (e) {
            toast.error("No se pudo obtener el dólar automáticamente")
        }
    }

    async function onSubmit(data: TransactionFormValues) {
        setIsPending(true)

        const formData = new FormData()
        formData.append('tipo', data.tipo)
        formData.append('monto', data.monto.toString())
        if (data.fecha) {
            formData.append('fecha', data.fecha.toISOString())
        }
        formData.append('descripcion', data.descripcion)
        formData.append('categoryId', data.categoryId)
        formData.append('monedaOriginal', data.monedaOriginal)
        if (data.montoOriginal) formData.append('montoOriginal', data.montoOriginal.toString())
        if (data.tipoCambio) formData.append('tipoCambio', data.tipoCambio.toString())
        if (data.fechaDocumento) formData.append('fechaDocumento', data.fechaDocumento.toISOString())
        if (data.fechaDocumento) formData.append('fechaDocumento', data.fechaDocumento.toISOString())
        formData.append('afectoIva', String(data.afectoIva))
        if (data.status) formData.append('status', data.status)

        try {
            let res;
            if (initialData) {
                res = await updateTransaction(initialData.id, formData)
            } else {
                res = await createTransaction(null, formData)
            }

            if (res?.error) {
                if (typeof res.error === 'string') {
                    toast.error(res.error)
                } else {
                    toast.error("Por favor revisa los campos")
                    console.error(res.error)
                }
            } else {
                toast.success(initialData ? "Transacción actualizada" : "Transacción creada correctamente")

                if (!initialData) {
                    form.reset({
                        tipo: 'GASTO',
                        monto: 0,
                        descripcion: '',
                        fecha: new Date(),
                        monedaOriginal: 'CLP',
                        montoOriginal: 0,
                        tipoCambio: 1,
                        afectoIva: false
                    })
                }

                if (onSuccess) onSuccess()
            }
        } catch (err) {
            toast.error("Ocurrió un error inesperado")
        } finally {
            setIsPending(false)
        }
    }

    const incomeCategories = categories.filter(c => c.tipo === 'INGRESO')
    const expenseCategories = categories.filter(c => c.tipo === 'GASTO')

    const currentType = form.watch('tipo')
    const currentStatus = form.watch('status')
    const visibleCategories = currentType === 'INGRESO' ? incomeCategories : expenseCategories

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">





                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="tipo"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipo de Movimiento</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona tipo" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="INGRESO">Ingreso (+)</SelectItem>
                                        <SelectItem value="GASTO">Gasto (-)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Estado</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona estado" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="COMPLETED">Pagado</SelectItem>
                                        <SelectItem value="PENDING">Pendiente</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Categoría</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona una categoría" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {visibleCategories.map((category) => (
                                            <SelectItem key={category.id} value={category.id}>
                                                {category.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="fecha"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>
                                    {currentStatus === 'PENDING' ? 'Fecha Vencimiento (Estimada)' : 'Fecha Pago (Real)'}
                                </FormLabel>
                                {currentStatus !== 'PENDING' && (
                                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "dd MMM yyyy", { locale: es })
                                                    ) : (
                                                        <span>Selecciona fecha</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={(date) => {
                                                    field.onChange(date)
                                                    setIsCalendarOpen(false)
                                                }}
                                                disabled={(date) =>
                                                    date > new Date() || date < new Date("1900-01-01")
                                                }
                                                locale={es}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                )}
                                {currentStatus === 'PENDING' && (
                                    <div className="h-10 px-3 py-2 border rounded-md text-sm text-muted-foreground bg-muted/50 cursor-not-allowed">
                                        No aplica (Pendiente)
                                    </div>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="fechaDocumento"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Fecha Emisión (IVA) <span className="text-xs text-muted-foreground font-normal">(Opcional)</span></FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "dd MMM yyyy", { locale: es })
                                                ) : (
                                                    <span className="text-muted-foreground">Igual a fecha pago</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) =>
                                                date > new Date() || date < new Date("1900-01-01")
                                            }
                                            locale={es}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 border rounded-md bg-gray-50/50">
                    <FormField
                        control={form.control}
                        name="monedaOriginal"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Moneda</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Moneda" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="CLP">🇨🇱 CLP (Pesos)</SelectItem>
                                        <SelectItem value="USD">🇺🇸 USD (Dólares)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {moneda === 'USD' && (
                        <FormField
                            control={form.control}
                            name="tipoCambio"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                        Tasa de Cambio
                                        <Button size="icon" variant="ghost" className="h-4 w-4" onClick={(e) => { e.preventDefault(); fetchRate(); }}>
                                            <RefreshCw className="h-3 w-3" />
                                        </Button>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            value={field.value as number}
                                            onChange={e => field.onChange(e.target.valueAsNumber)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                </div>

                <FormField
                    control={form.control}
                    name="montoOriginal"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Monto {moneda === 'USD' ? '(USD)' : '(CLP)'}</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5">$</span>
                                    <Input
                                        placeholder="0"
                                        type="number"
                                        {...field}
                                        value={(field.value as number) || ''}
                                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                        className="pl-7 text-lg font-semibold"
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {moneda === 'USD' && (
                    <div className="text-right text-sm text-muted-foreground">
                        Equivalente: <strong>${Math.round(form.watch('monto') as number).toLocaleString('es-CL')} CLP</strong>
                    </div>
                )}

                {/* VAT (IVA) Section */}
                <div className="flex items-center space-x-2 py-2">
                    <FormField
                        control={form.control}
                        name="afectoIva"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-2">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>
                                        ¿Afecto a IVA? (19%)
                                    </FormLabel>
                                    <FormDescription>
                                        Se calculará el Neto y el IVA automáticamente.
                                    </FormDescription>
                                </div>
                            </FormItem>
                        )}
                    />
                </div>

                {afectoIva && currentMonto > 0 && (
                    <div className="grid grid-cols-2 gap-4 text-sm bg-muted/50 p-2 rounded mb-4">
                        <div>
                            <span className="text-muted-foreground">Neto:</span>
                            <span className="font-mono ml-2">${Math.round(currentMonto / 1.19).toLocaleString('es-CL')}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">IVA (19%):</span>
                            <span className="font-mono ml-2">${Math.round(currentMonto - (currentMonto / 1.19)).toLocaleString('es-CL')}</span>
                        </div>
                    </div>
                )}

                <FormField
                    control={form.control}
                    name="monto"
                    render={({ field }) => <input type="hidden" {...field} value={(field.value as number) || 0} />}
                />

                <FormField
                    control={form.control}
                    name="descripcion"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Descripción</FormLabel>
                            <FormControl>
                                <Input placeholder="Ej: Venta de servicios, Pago de luz..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Category field moved up */}

                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {initialData ? 'Actualizar Transacción' : 'Guardar Transacción'}
                </Button>
            </form>
        </Form>
    )
}
