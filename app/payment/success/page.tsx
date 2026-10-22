"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const orderId = searchParams.get("order_id");
    const redirect = searchParams.get("redirect");

    const [status, setStatus] = useState<"VERIFYING" | "SUCCESS" | "FAILED">("VERIFYING");
    const [countdown, setCountdown] = useState(3);

    useEffect(() => {
        if (!orderId) {
            setStatus("FAILED");
            return;
        }

        let isMounted = true;
        let attempts = 0;
        const maxAttempts = 5;

        const checkStatus = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`${API_BASE_URL}/api/payment/status/${orderId}`, {
                    headers: {
                        Authorization: `Bearer ${token || ""}`,
                    },
                });

                const data = await res.json();

                if (!isMounted) return;

                if (data.success && data.status === "SUCCESS") {
                    setStatus("SUCCESS");
                } else if (data.status === "FAILED") {
                    setStatus("FAILED");
                } else if (attempts < maxAttempts) {
                    attempts++;
                    setTimeout(checkStatus, 2000);
                } else {
                    setStatus("FAILED");
                }
            } catch (err) {
                if (isMounted) setStatus("FAILED");
            }
        };

        checkStatus();

        return () => {
            isMounted = false;
        };
    }, [orderId]);

    useEffect(() => {
        if (status !== "SUCCESS") return;

        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [status]);

    useEffect(() => {
        if (status === "SUCCESS" && countdown <= 0) {
            router.push(redirect || "/dashboard");
        }
    }, [countdown, status, redirect, router]);

    if (status === "VERIFYING") {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-[10px] shadow-xl max-w-md w-full text-center">
                    <h1 className="text-[20px] font-bold text-black mb-2">Verifying Payment...</h1>
                    <p className="text-gray-500 text-sm">Please wait while we confirm your payment status.</p>
                </div>
            </div>
        );
    }

    if (status === "FAILED") {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-[10px] shadow-xl max-w-md w-full text-center">
                    <h1 className="text-[24px] font-bold text-red-600 mb-2">Payment Incomplete</h1>
                    <p className="text-gray-600 mb-6">
                        Your payment was not completed or was cancelled.
                    </p>
                    <button
                        onClick={() => router.push(redirect || "/dashboard")}
                        className="w-full py-2.5 bg-[#0456FF] text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

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