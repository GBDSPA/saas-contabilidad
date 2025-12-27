
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('Repairing missing categories for BUSINESS companies...')

    const businessCompanies = await prisma.company.findMany({
        where: {
            type: 'BUSINESS',
            // Update ALL business accounts to match the standard
            // categories: { none: {} } 
        }
    })

    console.log(`Found ${businessCompanies.length} companies to repair.`)

    for (const company of businessCompanies) {
        console.log(`Restoring categories for company: ${company.nombreEmpresa} (${company.id})`)

        // 1. Delete existing incorrect categories to avoid duplicates or mismatch
        await prisma.category.deleteMany({
            where: { companyId: company.id }
        })

        // 2. Seed correct list from original spec (prisma/seed.ts)
        await prisma.category.createMany({
            data: [
                // Ingresos
                { nombre: 'Ventas de Productos', tipo: 'INGRESO', cuentaContable: 'INGRESO', companyId: company.id, color: '#22c55e', icono: 'Package' },
                { nombre: 'Ventas de Servicios', tipo: 'INGRESO', cuentaContable: 'INGRESO', companyId: company.id, color: '#3b82f6', icono: 'Briefcase' },
                { nombre: 'Intereses Ganados', tipo: 'INGRESO', cuentaContable: 'INGRESO', companyId: company.id, color: '#10b981', icono: 'Percent' },
                { nombre: 'Otros Ingresos', tipo: 'INGRESO', cuentaContable: 'INGRESO', companyId: company.id, color: '#9ca3af', icono: 'Plus' },

                // Gastos Operacionales
                { nombre: 'Arriendo', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL', companyId: company.id, color: '#ef4444', icono: 'Building' },
                { nombre: 'Sueldos y Salarios', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL', companyId: company.id, color: '#f59e0b', icono: 'Users' },
                { nombre: 'Servicios Básicos', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL', companyId: company.id, color: '#f59e0b', icono: 'Lightbulb' },
                { nombre: 'Internet y Teléfono', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL', companyId: company.id, color: '#8b5cf6', icono: 'Wifi' },
                { nombre: 'Publicidad y Marketing', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL', companyId: company.id, color: '#ec4899', icono: 'Megaphone' },

                // Gastos Administrativos
                { nombre: 'Material de Oficina', tipo: 'GASTO', cuentaContable: 'GASTO_ADMINISTRATIVO', companyId: company.id, color: '#64748b', icono: 'FileText' },
                { nombre: 'Software y Suscripciones', tipo: 'GASTO', cuentaContable: 'GASTO_ADMINISTRATIVO', companyId: company.id, color: '#6366f1', icono: 'Monitor' },
                { nombre: 'Honorarios Profesionales', tipo: 'GASTO', cuentaContable: 'GASTO_ADMINISTRATIVO', companyId: company.id, color: '#3b82f6', icono: 'Award' },

                // Otros
                { nombre: 'Impuestos', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL', companyId: company.id, color: '#ef4444', icono: 'Landmark' },
                { nombre: 'Mantenimiento', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL', companyId: company.id, color: '#f59e0b', icono: 'Tool' },
                { nombre: 'Transporte', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL', companyId: company.id, color: '#6366f1', icono: 'Truck' },
                { nombre: 'Comidas y Entretenimiento', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL', companyId: company.id, color: '#f59e0b', icono: 'Coffee' },
                { nombre: 'Seguros', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL', companyId: company.id, color: '#10b981', icono: 'Shield' },
                { nombre: 'Gastos Bancarios', tipo: 'GASTO', cuentaContable: 'GASTO_FINANCIERO', companyId: company.id, color: '#64748b', icono: 'CreditCard' },
            ]
        })
    }

    console.log('Repair completed.')
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
