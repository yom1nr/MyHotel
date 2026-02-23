import { getToken } from './authService'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function authHeaders(): Record<string, string> {
    const token = getToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function generatePromptPayQR(amount: number, bookingId: number | string): Promise<{ chargeId: string; qrCodeUrl: string }> {
    const res = await fetch(`${BASE_URL}/api/payment/promptpay`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...authHeaders(),
        },
        body: JSON.stringify({ amount, bookingId }),
    })

    const json = (await res.json()) as { success: boolean; chargeId: string; qrCodeUrl: string; message?: string }
    if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to generate QR code')
    }

    return { chargeId: json.chargeId, qrCodeUrl: json.qrCodeUrl }
}

export async function payPublicDeposit(bookingCode: string, guestPhone: string): Promise<{ success: boolean }> {
    const res = await fetch(`${BASE_URL}/api/public/bookings/${bookingCode}/deposit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: guestPhone }),
    })

    const json = (await res.json()) as { success: boolean; message?: string }
    if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to process deposit payment')
    }

    return { success: true }
}
