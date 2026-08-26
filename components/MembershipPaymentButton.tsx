"use client";

import { load } from "@cashfreepayments/cashfree-js";
import api from "@/services/api";

interface MembershipPaymentButtonProps {
    planId?: number;
    label?: string;
}

export default function MembershipPaymentButton({
    planId = 1,
    label = "Upgrade Plan",
}: MembershipPaymentButtonProps) {
    const handlePayment = async () => {
        try {
            const { data } = await api.post("/payment/create-order", {
                planId,
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
        <button
            onClick={handlePayment}
            className="w-full flex items-center justify-center gap-[10px] bg-[#0456FF] text-white font-semibold text-[15px] py-[13px] px-[26px] rounded-[8px] cursor-pointer hover:bg-[#0344cc] transition-colors duration-300"
        >
            {label}
        </button>
    );
}