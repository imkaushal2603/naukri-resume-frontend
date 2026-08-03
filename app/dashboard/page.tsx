"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";

interface User {
    id: string;
    name?: string;
    email: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            router.push("/");
            return;
        }

        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        setLoading(false);
    }, [router]);

    const handleLogout = async () => {
        try {
            await api.post("/auth/logout", {}, { withCredentials: true });
        } catch (err) {
            console.error("Backend logout error:", err);
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            localStorage.removeItem("user");

            window.dispatchEvent(new Event("authChange"));
            router.push("/");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F6F7FE]">
                <div className="text-[16px] font-semibold text-[#0456FF]">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F6F7FE] flex flex-col">
            <main className="max-w-[1390px] mx-auto w-full px-[15px] py-10 flex-1">
                <div className="bg-white rounded-[10px] p-8 shadow-sm border border-[#0456FF1A]">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-[28px] font-bold text-[#000024]">Welcome back{user?.name ? `, ${user.name}` : ""}!</h1>
                            <p className="text-[14px] text-gray-500 mt-1">Manage your resumes and account settings from your dashboard.</p>
                        </div>
                        <button onClick={handleLogout} className="px-4 py-2 border border-red-500 text-red-500 rounded-[6px] text-sm font-semibold hover:bg-red-50 transition-colors">Logout</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                        <div className="p-6 bg-[#F6F7FE] rounded-[8px] border border-[#0456FF1A]">
                            <h3 className="text-[18px] font-bold text-[#000024] mb-2">My Resumes</h3>
                            <p className="text-[14px] text-gray-600 mb-4">View, edit, or download your created resumes.</p>
                            <span className="text-[24px] font-bold text-[#0456FF]">0 Resumes</span>
                        </div>
                        <div className="p-6 bg-[#F6F7FE] rounded-[8px] border border-[#0456FF1A]">
                            <h3 className="text-[18px] font-bold text-[#000024] mb-2">Account Status</h3>
                            <p className="text-[14px] text-gray-600 mb-4">Logged in as:</p>
                            <span className="text-[14px] font-semibold text-[#000024]">{user?.email}</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}