"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const orderId = searchParams.get("order_id");
    const redirect = searchParams.get("redirect");
    const [countdown, setCountdown] = useState(3);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (countdown <= 0) {
            router.push(redirect || "/dashboard");
        }
    }, [countdown, redirect, router]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-[10px] shadow-xl max-w-md w-full text-center">
                <h1 className="text-[24px] font-bold text-black mb-2">Payment Successful</h1>
                <p className="text-gray-600 mb-4">Thank you! Your payment has been received.</p>
                {orderId && (
                    <p className="text-sm text-gray-500 mb-4">Order ID: {orderId}</p>
                )}
                <p className="text-sm text-[#0456FF] font-medium">
                    Redirecting you back in {Math.max(countdown, 0)}...
                </p>
            </div>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PaymentSuccessContent />
        </Suspense>
    );
}