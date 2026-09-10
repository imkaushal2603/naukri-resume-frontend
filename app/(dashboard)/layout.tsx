"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import Footer from "@/components/dashboard/Footer";
import { ResumeProvider } from "@/context/ResumeContext";
import { useAuth } from "@/context/AuthContext";

function DashboardGate({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.replace("/");
        }
    }, [loading, isAuthenticated, router]);

    if (loading || !isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <Suspense fallback={null}>
            <ResumeProvider>
                <DashboardGate>
                    <div className="flex min-h-screen">
                        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                        <div className="flex-1 flex flex-col min-w-0 min-[1025px]:pl-[265px]">
                            <Header onMenuClick={() => setIsSidebarOpen((prev) => !prev)} />
                            <main className="flex-1 p-8 overflow-y-auto max-[1025px]:px-5">
                                {children}
                            </main>
                            <Footer />
                        </div>
                    </div>
                </DashboardGate>
            </ResumeProvider>
        </Suspense>
    );
}