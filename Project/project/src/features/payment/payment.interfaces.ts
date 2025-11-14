export const PaymentMethod = {
  GOOGLE_PAY: 'GooglePay',
  CARD: 'Card',
  APPLE_PAY: 'ApplePay',
  PAYPAL: 'PayPal',
} as const;

export const PaymentStatus = {
  INITIATED: 'Initiated',
  AUTHORIZED: 'Authorized',
  CAPTURED: 'Captured',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
} as const;
export type PaymentStatus = typeof PaymentStatus[keyof typeof PaymentStatus];

export interface OrderPaymentDTO {
  id?: string;
  totalAmount: number;
  currency: string;
  method: 4;
  status: PaymentStatus;
  gatewayTransactionId?: string;
  refundAmount?: number | null;
  refundReason?: string | null;
  orderId?: string | null;
  buyerProfileId: string;
  createdAt?: string;
}

export interface CreateOrderPaymentRequest {
  totalAmount: number;
  currency: string;
  method: 4;
  gatewayTransactionId: string;
  buyerProfileId: string;
}

export interface CreateOrderPaymentResponse {
  isSuccess: boolean;
  message?: string;
  data?: OrderPaymentDTO;
}
