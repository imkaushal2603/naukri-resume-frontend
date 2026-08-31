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
            const returnPath = window.location.pathname + window.location.search;
            
            const { data } = await api.post("/payment/create-order", {
                planId,
                returnPath,
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
            className="w-full inline-block border border-[#0456FF] bg-[#0456FF] py-[15px] px-[26px] rounded-[5px] font-semibold text-[14px] leading-none text-white cursor-pointer hover:bg-transparent hover:text-[#0456FF] transition-colors duration-300"
        >
            {label}
        </button>
    );
}