import { authHttp } from './httpClient';
import { extractApiErrors } from '@/shared/utils/errorExtract';

export interface CheckoutRequestDto {
    currency?: string;
    // method can be a numeric enum value or a string like 'GooglePay'; strings will be normalized
    method?: number | string;
    gatewayTransactionId?: string;
    note?: string;
}

export interface CheckoutSummary {
    OrderId: string;
    ReceiptId: string;
    OrderPaymentId: string;
    Status: string;
    Currency: string;
    Total: number;
    Payment: {
        Method: string;
        Status: string;
        GatewayTransactionId: string;
    };
    Items: Array<{ ProductVariantId: string; Quantity: number }>;
    Note?: string;
}

export interface CheckoutResponse {
    isSuccess: boolean;
    message?: string;
    data?: CheckoutSummary;
}

export async function checkout(payload: CheckoutRequestDto): Promise<CheckoutResponse> {
    try {
        console.log("Checkout payload:", payload);
        // Normalize method: backend expects numeric enum; convert from string when necessary
        const normalizeMethod = (m: unknown): number | undefined => {
            if (typeof m === 'number') return m;
            if (typeof m !== 'string') return undefined;
            const map: Record<string, number> = {
                cash: 0,
                creditcard: 1,
                banktransfer: 2,
                paypal: 3,
                googlepay: 4,
                applepay: 5,
                other: 99,
            };
            const key = m.replace(/\s+/g, '').toLowerCase();
            return map[key];
        };
        const normalized = { ...payload } as any;
        if (typeof normalized.method !== 'undefined') {
            const num = normalizeMethod(normalized.method);
            if (typeof num === 'number') normalized.method = num; else delete normalized.method; // fallback: omit
        }
        const { data } = await authHttp.post<CheckoutResponse>('', normalized);
        console.log("Checkout response data:", data);
        return data;
    } catch (e: any) {
        console.error('Checkout error:', e?.response?.data || e);
        const msgs = extractApiErrors(e);
        return { isSuccess: false, message: msgs.length ? msgs.join(' | ') : (e?.response?.data?.message || e.message) };
    }
}
