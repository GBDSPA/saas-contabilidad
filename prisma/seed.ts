import { Client } from 'pg'
import 'dotenv/config'

import crypto from 'crypto'

const client = new Client({
    connectionString: process.env.DATABASE_URL,
})

const categories = [
    // Ingresos
    { nombre: 'Ventas de Productos', tipo: 'INGRESO', cuentaContable: 'INGRESO' },
    { nombre: 'Ventas de Servicios', tipo: 'INGRESO', cuentaContable: 'INGRESO' },
    { nombre: 'Intereses Ganados', tipo: 'INGRESO', cuentaContable: 'INGRESO' },
    { nombre: 'Otros Ingresos', tipo: 'INGRESO', cuentaContable: 'INGRESO' },

    // Gastos Operacionales
    { nombre: 'Arriendo', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL' },
    { nombre: 'Sueldos y Salarios', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL' },
    { nombre: 'Servicios Básicos', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL' },
    { nombre: 'Internet y Teléfono', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL' },
    { nombre: 'Publicidad y Marketing', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL' },

    // Gastos Administrativos
    { nombre: 'Material de Oficina', tipo: 'GASTO', cuentaContable: 'GASTO_ADMINISTRATIVO' },
    { nombre: 'Software y Suscripciones', tipo: 'GASTO', cuentaContable: 'GASTO_ADMINISTRATIVO' },
    { nombre: 'Honorarios Profesionales', tipo: 'GASTO', cuentaContable: 'GASTO_ADMINISTRATIVO' },

    // Otros
    { nombre: 'Impuestos', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL' },
    { nombre: 'Mantenimiento', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL' },
    { nombre: 'Transporte', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL' },
    { nombre: 'Comidas y Entretenimiento', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL' },
    { nombre: 'Seguros', tipo: 'GASTO', cuentaContable: 'GASTO_OPERACIONAL' },
    { nombre: 'Gastos Bancarios', tipo: 'GASTO', cuentaContable: 'GASTO_FINANCIERO' },
]

async function main() {
    console.log('Seeding default categories...')
    await client.connect()

    for (const cat of categories) {
        // Check if exists
        const res = await client.query(
            'SELECT id FROM "categories" WHERE nombre = $1',
            [cat.nombre]
        )

        if (res.rowCount === 0) {
            const id = crypto.randomUUID()
            await client.query(
                `INSERT INTO "categories" (id, nombre, tipo, cuenta_contable, es_sistema, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
                [id, cat.nombre, cat.tipo, cat.cuentaContable, true]
            )
        }
    }

    console.log('Seeding completed.')
    await client.end()
}

main().catch(async (e) => {
    console.error(e)
    await client.end()
    process.exit(1)
})
