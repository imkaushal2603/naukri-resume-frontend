"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import api from "@/services/api";
import FORGOTPASSWORD from "@/public/login/login.png";

interface ForgotPasswordProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenLogin?: () => void;
}

export default function ForgotPassword({
    isOpen,
    onClose,
    onOpenLogin,
}: ForgotPasswordProps) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    if (!isOpen) return null;

    const handleRequestReset = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setLoading(true);

        try {
            await api.post("/auth/forgot-password", { email });
            toast.success("Password reset link sent to your email!");
            setIsSubmitted(true);
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || "Failed to process request. Please try again.";
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleBackToLogin = () => {
        setEmail("");
        setIsSubmitted(false);
        onClose();
        if (onOpenLogin) {
            onOpenLogin();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="scrollbar-thin relative w-full max-w-[1000px] bg-white rounded-[10px] shadow-2xl overflow-hidden flex flex-wrap max-h-[90dvh] overflow-y-auto">
                <div className="w-[55%] p-8 sm:p-10 flex flex-col justify-center max-[768px]:w-full">
                    <h2 className="text-[26px] font-bold text-[#000000] leading-none mb-[30px]">Forgot Password?</h2>
                    <button type="button" onClick={onClose} className="absolute top-[20px] right-[40px] text-[#000] cursor-pointer w-[40px] h-[40px] flex items-center justify-center font-semibold z-[1] max-[768px]:right-[20px]">✕</button>
                    {!isSubmitted ? (
                        <form onSubmit={handleRequestReset}>
                            <div>
                                <label className="block text-[16px] font-normal text-[#000000] leading-none mb-[15px]">
                                    Email ID
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your registered Email ID"
                                    required
                                    className="w-full px-3.5 py-2.5 border border-[#0456FF26] rounded-[6px] text-[14px] leading-none text-[#000024] outline-none transition-all placeholder:text-gray-400"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full p-[12px] bg-[#0456FF] border border-[#0456FF] text-white text-[15px] font-semibold rounded-[8px] cursor-pointer disabled:opacity-50 mt-[35px] hover:bg-transparent hover:text-[#0456FF] transition-colors duration-300"
                            >
                                {loading ? "Sending Link..." : "Send Reset Link"}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-[16px] text-green-600 font-semibold mb-2">
                                Check your email!
                            </p>
                            <p className="text-[14px] text-gray-600">
                                We sent a password reset link to <strong>{email}</strong>. Please check your inbox and click the link to reset your password.
                            </p>
                        </div>
                    )}
                    <p className="text-[13px] text-center leading-none text-[#00002499] font-medium mt-[33px]">
                        Remembered your password?{" "}
                        <button
                            type="button"
                            onClick={handleBackToLogin}
                            className="text-[#0456FF] font-medium cursor-pointer hover:underline"
                        >
                            Back to Login
                        </button>
                    </p>
                </div>
                <div className="w-[45%] bg-[#0456FF26] p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden max-[768px]:hidden">
                    <div className="text-center mt-[60px]">
                        <h3 className="text-[#000024] text-[38px] leading-tight font-bold mb-[12px]">Don't worry!</h3>
                        <p className="text-[15px] leading-normal text-[#000024]">Enter your email address and we'll send you a link to reset your password.</p>
                        <div className="relative w-full aspect-[4/3] mx-auto my-auto flex items-center justify-center">
                            <Image src={FORGOTPASSWORD} alt="FORGOT PASSWORD" width={406} height={406} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}