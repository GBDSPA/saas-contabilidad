import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('Checking recent companies and categories...')

    const companies = await prisma.company.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
            categories: true,
            user: true
        }
    })

    for (const company of companies) {
        console.log(`Company: ${company.nombreEmpresa} (Type: ${company.type}) - User: ${company.user?.email}`)
        console.log(`Category Count: ${company.categories.length}`)
        if (company.categories.length > 0) {
            console.log(`Sample Categories: ${company.categories.slice(0, 3).map(c => c.nombre).join(', ')}`)
        } else {
            console.log('Use: NO CATEGORIES FOUND')
        }
        console.log('-------------------')
    }
}

main()
    .catch(e => {
        console.error(e)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
