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

    const { data: { user }, error } = await supabase.auth.signUp({
        email,
        password,
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
                nombre: "Usuario",
            }
        })

        await prisma.company.create({
            data: {
                userId: user.id,
                nombreEmpresa: "Mi Empresa",
                moneda: "CLP"
            }
        })
    }



    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}
