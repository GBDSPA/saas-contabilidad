export interface ExchangeRate {
    code: string
    value: number
    date: string
}

export async function getDollarRate(): Promise<number | null> {
    try {
        const res = await fetch('https://mindicador.cl/api/dolar', { next: { revalidate: 3600 } }) // Cache for 1 hour
        if (!res.ok) throw new Error('Failed to fetch dollar rate')

        const data = await res.json()
        if (data && data.serie && data.serie.length > 0) {
            return data.serie[0].valor
        }
        return null
    } catch (error) {
        console.error('Error fetching dollar rate:', error)
        return null
    }
}
