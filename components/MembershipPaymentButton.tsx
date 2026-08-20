"use client";

import { load } from "@cashfreepayments/cashfree-js";
import api from "@/services/api";


export default function MembershipPaymentButton({ amount = 499 }) {
    const handlePayment = async () => {
        try {
            const { data } = await api.post("/payment/create-order", {
                planId: 1,
            });

            if (!data.success) {
                throw new Error("Order creation failed");
            }

            const cashfree = await load({
                mode: "sandbox",
            });

            await cashfree.checkout({
                paymentSessionId: data.paymentSessionId,
                redirectTarget: "_self",
            });
        } catch (error) {
            console.error("Payment error:", error);
        }
    };

    return (
        <button onClick={handlePayment}>
            Pay ₹{amount}
        </button>
    );
}