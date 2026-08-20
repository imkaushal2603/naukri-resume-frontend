"use client";

import { useSearchParams } from "next/navigation";

export default function PaymentSuccessPage() {
    const searchParams = useSearchParams();

    const orderId = searchParams.get("order_id");

    return (
        <div>
            <h1>Payment Successful</h1>

            <p>Thank you! Your payment has been received.</p>

            {orderId && (
                <p>
                    Order ID: {orderId}
                </p>
            )}
        </div>
    );
}