
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('Repairing missing categories for PERSONAL companies...')

    const personalCompanies = await prisma.company.findMany({
        where: {
            type: 'PERSONAL',
            categories: { none: {} } // Verify they possess zero categories
        }
    })

    console.log(`Found ${personalCompanies.length} companies to repair.`)

    for (const company of personalCompanies) {
        console.log(`Seeding categories for company: ${company.nombreEmpresa} (${company.id})`)

        await prisma.category.createMany({
            data: [
                // Ingresos (Personalizados)
                { nombre: 'Sueldo', tipo: 'INGRESO', cuentaContable: 'INGRESO', companyId: company.id, color: '#22c55e', icono: 'DollarSign' },
                { nombre: 'Venta de Productos', tipo: 'INGRESO', cuentaContable: 'INGRESO', companyId: company.id, color: '#3b82f6', icono: 'Package' },
                { nombre: 'Venta de Servicios', tipo: 'INGRESO', cuentaContable: 'INGRESO', companyId: company.id, color: '#8b5cf6', icono: 'Briefcase' },
                { nombre: 'Ingresos Plataforma Suscripción', tipo: 'INGRESO', cuentaContable: 'INGRESO', companyId: company.id, color: '#10b981', icono: 'Monitor' },
                { nombre: 'Otros Ingresos', tipo: 'INGRESO', cuentaContable: 'INGRESO', companyId: company.id, color: '#9ca3af', icono: 'Plus' },

                // Gastos (Requested List)
                { nombre: 'Casa y cuentas', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL', companyId: company.id, color: '#ef4444', icono: 'Home' },
                { nombre: 'Mercadería', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL', companyId: company.id, color: '#f59e0b', icono: 'ShoppingCart' },
                { nombre: 'Gustitos', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL', companyId: company.id, color: '#ec4899', icono: 'Smile' },
                { nombre: 'Transporte', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL', companyId: company.id, color: '#6366f1', icono: 'Car' },
                { nombre: 'Compras', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL', companyId: company.id, color: '#8b5cf6', icono: 'ShoppingBag' },
                { nombre: 'Salud y Deportes', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL', companyId: company.id, color: '#06b6d4', icono: 'Activity' },
                { nombre: 'Educación', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL', companyId: company.id, color: '#3b82f6', icono: 'GraduationCap' },
                { nombre: 'Suscripciones', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL', companyId: company.id, color: '#6366f1', icono: 'Repeat' },
                { nombre: 'Viajes y Vacaciones', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL', companyId: company.id, color: '#f59e0b', icono: 'Plane' },
                { nombre: 'Donaciones y regalos', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL', companyId: company.id, color: '#ec4899', icono: 'Gift' },
                { nombre: 'Otros', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL', companyId: company.id, color: '#9ca3af', icono: 'MoreHorizontal' },
                { nombre: 'Ahorro', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL', companyId: company.id, color: '#22c55e', icono: 'PiggyBank' },
                { nombre: 'Gastos Bancarios', tipo: 'GASTO', cuentaContable: 'GASTO_FINANCIERO', companyId: company.id, color: '#64748b', icono: 'Landmark' },
                { nombre: 'Intereses', tipo: 'GASTO', cuentaContable: 'GASTO_FINANCIERO', companyId: company.id, color: '#ef4444', icono: 'Percent' },
                { nombre: 'Crédito de Consumo', tipo: 'GASTO', cuentaContable: 'PASIVO_CORRIENTE', companyId: company.id, color: '#f59e0b', icono: 'CreditCard' },
                { nombre: 'Tarjeta de crédito', tipo: 'GASTO', cuentaContable: 'PASIVO_CORRIENTE', companyId: company.id, color: '#ef4444', icono: 'CreditCard' },
                { nombre: 'Emprendimiento', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL', companyId: company.id, color: '#8b5cf6', icono: 'Rocket' },
                { nombre: 'Mascotas', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL', companyId: company.id, color: '#14b8a6', icono: 'Dog' },
            ]
        })
    }

    console.log('Repair completed.')
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
