import { z } from 'zod'

export const transactionSchema = z.object({
    tipo: z.enum(['INGRESO', 'GASTO']),
    monto: z.coerce.number().positive({ message: "El monto debe ser positivo" }),
    fecha: z.date().optional(), // Changed from required to optional
    descripcion: z.string().min(1, 'La descripción es requerida'), // Changed min length and message
    categoryId: z.string().min(1, 'La categoría es requerida'), // Changed from uuid to min(1)
    monedaOriginal: z.enum(['CLP', 'USD']).default('CLP'),
    montoOriginal: z.coerce.number().positive().optional(),
    tipoCambio: z.coerce.number().positive().optional(),
    companyId: z.string().uuid().optional(),
    afectoIva: z.boolean().default(false).optional(),
    fechaDocumento: z.date().optional(),
    status: z.enum(['PENDING', 'COMPLETED']).default('COMPLETED').optional(),
}).superRefine((data, ctx) => {
    if (data.status === 'COMPLETED' && !data.fecha) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "La fecha de pago es requerida cuando el estado es 'Pagado'",
            path: ["fecha"]
        });
    }
})

// Schema for form input (handling what the form might actually give us before coercion if needed)
export type TransactionFormValues = z.infer<typeof transactionSchema>
// But to fix the build error, we just need the inferred type to be consistent.

