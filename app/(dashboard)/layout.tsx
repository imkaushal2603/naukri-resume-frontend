import { Suspense } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import Footer from "@/components/dashboard/Footer";
import { ResumeProvider } from "@/context/ResumeContext";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ResumeProvider>
            <div className="flex min-h-screen">
                <Suspense fallback={<div className="w-[265px] shrink-0" />}>
                    <Sidebar />
                </Suspense>
                <div className="flex-1 flex flex-col min-w-0 pl-[265px]">
                    <Header />
                    <main className="flex-1 p-8 overflow-y-auto">
                        {children}
                    </main>
                    <Footer />
                </div>
            </div>
        </ResumeProvider>
    );
}