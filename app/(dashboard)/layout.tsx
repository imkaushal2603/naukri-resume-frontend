"use client";

import { Suspense, useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import Footer from "@/components/dashboard/Footer";
import { ResumeProvider } from "@/context/ResumeContext";
import { useResumeId } from "@/hooks/useResumeId";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const resumeId = useResumeId();

    return (
        <ResumeProvider key={resumeId || "new-resume"}>
            <div className="flex min-h-screen">
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                <div className="flex-1 flex flex-col min-w-0 min-[1025px]:pl-[265px]">
                    <Header onMenuClick={() => setIsSidebarOpen((prev) => !prev)} />
                    <main className="flex-1 p-8 overflow-y-auto max-[1025px]:px-5">{children}</main>
                    <Footer />
                </div>
            </div>
        </ResumeProvider>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={null}>
            <DashboardLayoutContent>{children}</DashboardLayoutContent>
        </Suspense>
    );
}