import { signOut } from "@/app/(auth)/actions"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
    CreditCard,
    Home,
    LineChart,
    LogOut,
    Settings,
    Users
} from "lucide-react"
import Link from "next/link"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
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
                {/* Mobile Header (Simplified) */}
                <header className="flex h-14 items-center gap-4 border-b bg-gray-100/40 px-6 lg:hidden dark:bg-gray-800/40">
                    <Link href="/" className="font-semibold">Blopo Finance</Link>
                </header>

                <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
