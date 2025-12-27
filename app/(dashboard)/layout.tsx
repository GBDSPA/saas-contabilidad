"use client"

import { signOut } from "@/app/(auth)/actions"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
    CreditCard,
    Home,
    LineChart,
    LogOut,
    Menu,
    Settings,
    Users
} from "lucide-react"
import Link from "next/link"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { useState } from "react"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [sheetOpen, setSheetOpen] = useState(false)

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <div className="hidden border-r bg-gray-100/40 lg:block lg:w-64 dark:bg-gray-800/40">
                <div className="flex h-full max-h-screen flex-col gap-2">
                    <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                        <Link href="/" className="flex items-center gap-2 font-semibold">
                            <CreditCard className="h-6 w-6" />
                            <span className="">Blopo Finance</span>
                        </Link>
                    </div>
                    <div className="flex-1 overflow-auto py-2">
                        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                            <Link
                                href="/"
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                            >
                                <Home className="h-4 w-4" />
                                Dashboard
                            </Link>
                            <Link
                                href="/transactions"
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                            >
                                <LineChart className="h-4 w-4" />
                                Transacciones
                            </Link>
                            <Link
                                href="/reports"
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                            >
                                <LineChart className="h-4 w-4" />
                                Reportes
                            </Link>
                            <Link
                                href="/settings"
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                            >
                                <Settings className="h-4 w-4" />
                                Configuración
                            </Link>
                        </nav>
                    </div>
                    <div className="mt-auto p-4">
                        <form action={signOut}>
                            <Button variant="outline" className="w-full gap-2 justify-start">
                                <LogOut className="h-4 w-4" />
                                Cerrar Sesión
                            </Button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-col w-full">
                {/* Mobile Header */}
                <header className="flex h-14 items-center gap-4 border-b bg-gray-100/40 px-6 lg:hidden dark:bg-gray-800/40 justify-between">
                    <Link href="/" className="font-semibold">Blopo Finance</Link>
                    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="lg:hidden">
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right">
                            <SheetTitle className="sr-only">Menú de Navegación</SheetTitle>
                            <nav className="grid gap-2 text-lg font-medium">
                                <Link
                                    href="/"
                                    onClick={() => setSheetOpen(false)}
                                    className="flex items-center gap-2 text-lg font-semibold mb-4"
                                >
                                    <CreditCard className="h-6 w-6" />
                                    <span className="sr-only">Blopo Finance</span>
                                </Link>
                                <Link
                                    href="/"
                                    onClick={() => setSheetOpen(false)}
                                    className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                                >
                                    <Home className="h-5 w-5" />
                                    Dashboard
                                </Link>
                                <Link
                                    href="/transactions"
                                    onClick={() => setSheetOpen(false)}
                                    className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                                >
                                    <LineChart className="h-5 w-5" />
                                    Transacciones
                                </Link>
                                <Link
                                    href="/reports"
                                    onClick={() => setSheetOpen(false)}
                                    className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                                >
                                    <LineChart className="h-5 w-5" />
                                    Reportes
                                </Link>
                                <Link
                                    href="/settings"
                                    onClick={() => setSheetOpen(false)}
                                    className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                                >
                                    <Settings className="h-5 w-5" />
                                    Configuración
                                </Link>
                                <div className="mt-4">
                                    <form action={signOut}>
                                        <Button variant="outline" className="w-full gap-2 justify-start">
                                            <LogOut className="h-4 w-4" />
                                            Cerrar Sesión
                                        </Button>
                                    </form>
                                </div>
                            </nav>
                        </SheetContent>
                    </Sheet>
                </header>

                <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
