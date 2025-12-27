'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'
import { transactionSchema } from '@/lib/validations/transaction'
import { revalidatePath } from 'next/cache'

export async function createTransaction(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'No autorizado' }
    }

    // Get user's company (Assuming 1 company per user for MVP)
    const company = await prisma.company.findFirst({
        where: { userId: user.id }
    })

    let companyId = company?.id

    if (!companyId) {
        // Auto-create simplified company for MVP speed if not found
        const newCompany = await prisma.company.create({
            data: {
                userId: user.id,
                nombreEmpresa: "Mi Empresa",
                moneda: "CLP"
            }
        })
        companyId = newCompany.id
    }

    // Parse Date manually as FormData returns string
    const rawDate = formData.get('fecha') as string
    const dateObj = rawDate ? new Date(rawDate) : undefined

    const rawDocDate = formData.get('fechaDocumento') as string
    const docDateObj = rawDocDate ? new Date(rawDocDate) : undefined

    const rawData = {
        tipo: formData.get('tipo'),
        monto: formData.get('monto'),
        fecha: dateObj,
        fechaDocumento: docDateObj,
        descripcion: formData.get('descripcion'),
        categoryId: formData.get('categoryId'),
        monedaOriginal: formData.get('monedaOriginal'),
        montoOriginal: formData.get('montoOriginal'),
        tipoCambio: formData.get('tipoCambio'),
        afectoIva: formData.get('afectoIva') === 'true',
        status: formData.get('status') || 'COMPLETED',
    }

    console.log("SERVER ACTION - rawData:", rawData) // DEBUG

    const validatedFields = transactionSchema.safeParse(rawData)

    if (!validatedFields.success) {
        console.error("VALIDATION ERROR:", validatedFields.error.flatten().fieldErrors) // DEBUG
        return { error: validatedFields.error.flatten().fieldErrors }
    }

    try {
        const {
            tipo,
            monto,
            fecha,
            fechaDocumento,
            descripcion,
            categoryId,
            monedaOriginal,
            montoOriginal,
            tipoCambio,
            afectoIva,
            status
        } = validatedFields.data

        let montoNeto = null
        let montoIva = null

        if (afectoIva) {
            // Calculate Net and Tax (Assuming 19% VAT for Chile)
            // Monto is Gross (Bruto)
            const netVal = Number(monto) / 1.19
            montoNeto = Math.round(netVal)
            montoIva = Number(monto) - montoNeto
        } else {
            montoNeto = Number(monto)
            montoIva = 0
        }

        await prisma.transaction.create({
            data: {
                company: { connect: { id: companyId } },
                category: { connect: { id: categoryId } },
                tipo: tipo as any,
                monto,
                fecha: fecha ?? null,
                fechaDocumento,
                descripcion,
                monedaOriginal,
                montoOriginal,
                tipoCambio,
                afectoIva,
                status: status as any,
                montoNeto,
                montoIva
            }
        })

        revalidatePath('/transactions')
        revalidatePath('/') // update dashboard
        return { success: true }

    } catch (error) {
        console.error('Error creating transaction:', error)
        return { error: 'Error al crear la transacción' }
    }
}

export async function updateTransaction(transactionId: string, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'No autorizado' }

    // Verify ownership
    const existingTransaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
        include: { company: true }
    })

    if (!existingTransaction || existingTransaction.company.userId !== user.id) {
        return { error: 'Transacción no encontrada o no autorizada' }
    }

    // Save History
    try {
        await prisma.transactionHistory.create({
            data: {
                transactionId: transactionId,
                userId: user.id,
                action: 'UPDATE',
                details: JSON.stringify(existingTransaction) // simple snapshot
            }
        })
    } catch (e) {
        console.error("Error creating history log", e)
        // Continue update even if log fails? Ideally no, but for MVP yes.
    }

    const rawDate = formData.get('fecha') as string
    const dateObj = rawDate ? new Date(rawDate) : undefined

    const rawDocDate = formData.get('fechaDocumento') as string
    const docDateObj = rawDocDate ? new Date(rawDocDate) : undefined

    const rawData = {
        tipo: formData.get('tipo'),
        monto: formData.get('monto'),
        fecha: dateObj,
        fechaDocumento: docDateObj,
        descripcion: formData.get('descripcion'),
        categoryId: formData.get('categoryId'),
        monedaOriginal: formData.get('monedaOriginal'),
        montoOriginal: formData.get('montoOriginal'),
        tipoCambio: formData.get('tipoCambio'),
        afectoIva: formData.get('afectoIva') === 'true',
        status: formData.get('status'),
    }

    const validatedFields = transactionSchema.safeParse(rawData)

    if (!validatedFields.success) {
        return { error: validatedFields.error.flatten().fieldErrors }
    }

    try {
        const {
            tipo,
            monto,
            fecha,
            descripcion,
            categoryId,
            monedaOriginal,
            montoOriginal,
            tipoCambio,
            afectoIva,
            fechaDocumento,
            status
        } = validatedFields.data

        let montoNeto = null
        let montoIva = null

        if (afectoIva) {
            const netVal = Number(monto) / 1.19
            montoNeto = Math.round(netVal)
            montoIva = Number(monto) - montoNeto
        } else {
            montoNeto = Number(monto)
            montoIva = 0
        }

        const updatePayload = {
            tipo: tipo as any,
            monto,
            fecha,
            fechaDocumento,
            descripcion,
            categoryId,
            monedaOriginal,
            montoOriginal,
            tipoCambio,
            afectoIva,
            status: status as any,
            montoNeto,
            montoIva
        }

        await prisma.transaction.update({
            where: { id: transactionId },
            data: updatePayload
        })

        revalidatePath('/transactions')
        revalidatePath('/')
        return { success: true }

    } catch (error) {
        console.error('Error updating transaction:', error)
        return { error: 'Error al actualizar la transacción' }
    }
}


export async function getTransactions() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const company = await prisma.company.findFirst({
        where: { userId: user.id },
        select: { id: true }
    })

    if (!company) return []

    const transactions = await prisma.transaction.findMany({
        where: {
            companyId: company.id
        },
        include: {
            category: true
        },
        orderBy: {
            fecha: 'desc'
        },
        take: 50
    })

    return transactions.map((t: any) => ({
        ...t,
        monto: Number(t.monto),
        montoOriginal: t.montoOriginal ? Number(t.montoOriginal) : null,
        tipoCambio: t.tipoCambio ? Number(t.tipoCambio) : null,
        montoNeto: t.montoNeto ? Number(t.montoNeto) : null,
        montoIva: t.montoIva ? Number(t.montoIva) : null,
    }))
}

export async function getCategories() {
    const categories = await prisma.category.findMany({
        orderBy: { nombre: 'asc' }
    })
    return categories
}
