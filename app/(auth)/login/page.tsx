'use client'

import { useActionState } from 'react'
import { login, signup } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs" // Need to install tabs if not available, or just toggle
// Using simple toggle state for now or just two forms. 
// Let's implement a clean single card with tabs if I install tabs, but to save steps I'll just make a switch.

import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true)

    // Using verify-form-state pattern usually, but here we use server actions directly in form action
    // We'll wrap it to handle toasts

    async function handleSubmit(formData: FormData) {
        const action = isLogin ? login : signup

        // We can't really use useActionState easily with the toggle without complex setup.
        // Let's simpler approach: Use the action directly but wrapped for client side feedback if we want specific toast handling
        // or just rely on server redirect.
        // For MVP clean approach, let's use the basic form action.
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">
                        {isLogin ? 'Bienvenido de vuelta' : 'Crear Cuenta'}
                    </CardTitle>
                    <CardDescription className="text-center">
                        {isLogin
                            ? 'Ingresa tus credenciales para acceder'
                            : 'Ingresa tus datos para comenzar'
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={async (formData) => {
                        const res = isLogin ? await login(null, formData) : await signup(null, formData)
                        if (res?.error) {
                            toast.error(res.error)
                        }
                    }} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" placeholder="nombre@empresa.com" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input id="password" name="password" type="password" required minLength={6} />
                        </div>

                        <Button className="w-full" type="submit">
                            {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
                        </Button>
                    </form>

                    <div className="mt-4 text-center text-sm">
                        <span className="text-gray-500">
                            {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
                        </span>
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="font-medium text-blue-600 hover:text-blue-500 underline decoration-transparent hover:decoration-blue-500 transition-all"
                        >
                            {isLogin ? 'Regístrate' : 'Inicia sesión'}
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
