"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/services/api";

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export default function ResetPasswordPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            toast.error("Invalid or missing reset token.");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        if (!PASSWORD_REGEX.test(newPassword)) {
            toast.error("Password must be at least 8 characters long and contain upper/lowercase letters and a number.");
            return;
        }

        setLoading(true);

        try {
            const res = await api.post("/auth/reset-password", {
                token,
                newPassword,
            });
            toast.success(res.data.message || "Password updated successfully!");
            router.push("/"); // Redirect user to home or login page
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || "Failed to reset password.";
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-2">Invalid Link</h2>
                    <p className="text-gray-600">The password reset link is invalid or missing a token.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-[10px] shadow-xl max-w-md w-full">
                <h2 className="text-[24px] font-bold text-black mb-6 text-center">Set New Password</h2>

                <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                        <label className="block text-[14px] font-medium text-gray-700 mb-1">New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-[6px] text-[14px] outline-none focus:border-[#0456FF]"
                        />
                    </div>

                    <div>
                        <label className="block text-[14px] font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-[6px] text-[14px] outline-none focus:border-[#0456FF]"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-[#0456FF] border border-[#0456FF] text-white text-[15px] font-semibold rounded-[8px] cursor-pointer disabled:opacity-50 hover:bg-transparent hover:text-[#0456FF] transition-colors duration-300 mt-4"
                    >
                        {loading ? "Updating..." : "Reset Password"}
                    </button>
                </form>
            </div>
        </div>
    );
}