'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const authSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

export async function login(prevState: any, formData: FormData) {
    const supabase = await createClient()

    // Validate fields
    const validatedFields = authSchema.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
    })

    if (!validatedFields.success) {
        return { error: 'Campos inválidos' }
    }

    const { email, password } = validatedFields.data

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signup(prevState: any, formData: FormData) {
    const supabase = await createClient()

    // Validate fields
    const validatedFields = authSchema.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
    })

    if (!validatedFields.success) {
        return { error: 'Campos inválidos' }
    }

    const { email, password } = validatedFields.data
    const companyName = formData.get('companyName') as string || 'Mi Espacio'
    const profileType = formData.get('profileType') as 'BUSINESS' | 'PERSONAL' || 'BUSINESS'

    const { data: { user }, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                companyName,
                profileType
            }
        }
    })

    if (error) {
        return { error: error.message }
    }

    if (user) {
        // Create Prisma User and Default Company
        const { prisma } = await import('@/lib/db')

        await prisma.user.create({
            data: {
                id: user.id,
                email: user.email!,
                nombre: companyName.split(' ')[0] || "Usuario",
            }
        })

        const createdCompany = await prisma.company.create({
            data: {
                userId: user.id,
                nombreEmpresa: companyName,
                type: profileType,
                moneda: "CLP"
            }
        })

        if (profileType === 'PERSONAL') {
            await prisma.category.createMany({
                data: [
                    // Ingresos (Personalizados)
                    { nombre: 'Sueldo', tipo: 'INGRESO', cuentaContable: 'INGRESO', companyId: createdCompany.id, color: '#22c55e', icono: 'DollarSign' },
                    { nombre: 'Venta de Productos', tipo: 'INGRESO', cuentaContable: 'INGRESO', companyId: createdCompany.id, color: '#3b82f6', icono: 'Package' },
                    { nombre: 'Venta de Servicios', tipo: 'INGRESO', cuentaContable: 'INGRESO', companyId: createdCompany.id, color: '#8b5cf6', icono: 'Briefcase' },
                    { nombre: 'Ingresos Plataforma Suscripción', tipo: 'INGRESO', cuentaContable: 'INGRESO', companyId: createdCompany.id, color: '#10b981', icono: 'Monitor' },
                    { nombre: 'Otros Ingresos', tipo: 'INGRESO', cuentaContable: 'INGRESO', companyId: createdCompany.id, color: '#9ca3af', icono: 'Plus' },

                    // Gastos (Requested List)
                    { nombre: 'Casa y cuentas', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL', companyId: createdCompany.id, color: '#ef4444', icono: 'Home' },
                    { nombre: 'Mercadería', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL', companyId: createdCompany.id, color: '#f59e0b', icono: 'ShoppingCart' },
                    { nombre: 'Gustitos', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL', companyId: createdCompany.id, color: '#ec4899', icono: 'Smile' },
                    { nombre: 'Transporte', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL', companyId: createdCompany.id, color: '#6366f1', icono: 'Car' },
                    { nombre: 'Compras', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL', companyId: createdCompany.id, color: '#8b5cf6', icono: 'ShoppingBag' },
                    { nombre: 'Salud y Deportes', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL', companyId: createdCompany.id, color: '#06b6d4', icono: 'Activity' },
                    { nombre: 'Educación', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL', companyId: createdCompany.id, color: '#3b82f6', icono: 'GraduationCap' },
                    { nombre: 'Suscripciones', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL', companyId: createdCompany.id, color: '#6366f1', icono: 'Repeat' },
                    { nombre: 'Viajes y Vacaciones', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL', companyId: createdCompany.id, color: '#f59e0b', icono: 'Plane' },
                    { nombre: 'Donaciones y regalos', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL', companyId: createdCompany.id, color: '#ec4899', icono: 'Gift' },
                    { nombre: 'Otros', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL', companyId: createdCompany.id, color: '#9ca3af', icono: 'MoreHorizontal' },
                    { nombre: 'Ahorro', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL', companyId: createdCompany.id, color: '#22c55e', icono: 'PiggyBank' },
                    { nombre: 'Gastos Bancarios', tipo: 'GASTO', cuentaContable: 'GASTO_FINANCIERO', companyId: createdCompany.id, color: '#64748b', icono: 'Landmark' },
                    { nombre: 'Intereses', tipo: 'GASTO', cuentaContable: 'GASTO_FINANCIERO', companyId: createdCompany.id, color: '#ef4444', icono: 'Percent' },
                    { nombre: 'Crédito de Consumo', tipo: 'GASTO', cuentaContable: 'PASIVO_CORRIENTE', companyId: createdCompany.id, color: '#f59e0b', icono: 'CreditCard' },
                    { nombre: 'Tarjeta de crédito', tipo: 'GASTO', cuentaContable: 'PASIVO_CORRIENTE', companyId: createdCompany.id, color: '#ef4444', icono: 'CreditCard' },
                    { nombre: 'Emprendimiento', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL', companyId: createdCompany.id, color: '#8b5cf6', icono: 'Rocket' },
                    { nombre: 'Mascotas', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL', companyId: createdCompany.id, color: '#14b8a6', icono: 'Dog' },
                ]
            })
        } else {
            // Business Defaults
            await prisma.category.createMany({
                data: [
                    // Ingresos (Match prisma/seed.ts)
                    { nombre: 'Ventas de Productos', tipo: 'INGRESO', cuentaContable: 'INGRESO', companyId: createdCompany.id, color: '#22c55e', icono: 'Package' },
                    { nombre: 'Ventas de Servicios', tipo: 'INGRESO', cuentaContable: 'INGRESO', companyId: createdCompany.id, color: '#3b82f6', icono: 'Briefcase' },
                    { nombre: 'Intereses Ganados', tipo: 'INGRESO', cuentaContable: 'INGRESO', companyId: createdCompany.id, color: '#10b981', icono: 'Percent' },
                    { nombre: 'Otros Ingresos', tipo: 'INGRESO', cuentaContable: 'INGRESO', companyId: createdCompany.id, color: '#9ca3af', icono: 'Plus' },

                    // Gastos Operacionales
                    { nombre: 'Arriendo', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL', companyId: createdCompany.id, color: '#ef4444', icono: 'Building' },
                    { nombre: 'Sueldos y Salarios', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL', companyId: createdCompany.id, color: '#f59e0b', icono: 'Users' },
                    { nombre: 'Servicios Básicos', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL', companyId: createdCompany.id, color: '#f59e0b', icono: 'Lightbulb' },
                    { nombre: 'Internet y Teléfono', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL', companyId: createdCompany.id, color: '#8b5cf6', icono: 'Wifi' },
                    { nombre: 'Publicidad y Marketing', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL', companyId: createdCompany.id, color: '#ec4899', icono: 'Megaphone' },

                    // Gastos Administrativos
                    { nombre: 'Material de Oficina', tipo: 'GASTO', cuentaContable: 'GASTO_ADMINISTRATIVO', companyId: createdCompany.id, color: '#64748b', icono: 'FileText' },
                    { nombre: 'Software y Suscripciones', tipo: 'GASTO', cuentaContable: 'GASTO_ADMINISTRATIVO', companyId: createdCompany.id, color: '#6366f1', icono: 'Monitor' },
                    { nombre: 'Honorarios Profesionales', tipo: 'GASTO', cuentaContable: 'GASTO_ADMINISTRATIVO', companyId: createdCompany.id, color: '#3b82f6', icono: 'Award' },

                    // Otros
                    { nombre: 'Impuestos', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL', companyId: createdCompany.id, color: '#ef4444', icono: 'Landmark' },
                    { nombre: 'Mantenimiento', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL', companyId: createdCompany.id, color: '#f59e0b', icono: 'Tool' },
                    { nombre: 'Transporte', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL', companyId: createdCompany.id, color: '#6366f1', icono: 'Truck' },
                    { nombre: 'Comidas y Entretenimiento', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL', companyId: createdCompany.id, color: '#f59e0b', icono: 'Coffee' },
                    { nombre: 'Seguros', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL', companyId: createdCompany.id, color: '#10b981', icono: 'Shield' },
                    { nombre: 'Gastos Bancarios', tipo: 'GASTO', cuentaContable: 'GASTO_FINANCIERO', companyId: createdCompany.id, color: '#64748b', icono: 'CreditCard' },
                ]
            })
        }
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}
