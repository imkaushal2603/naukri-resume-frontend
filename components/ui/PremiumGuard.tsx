"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import Loader from "@/components/ui/Loader";
import { toast } from "sonner";

export default function PremiumGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [checking, setChecking] = useState(true);
    const [allowed, setAllowed] = useState(false);
    const hasChecked = useRef(false);

    useEffect(() => {
        if (hasChecked.current) return;
        hasChecked.current = true;

        const checkMembership = async () => {
            try {
                const res = await api.get("/membership");
                if (res.data.success && res.data.status) {
                    setAllowed(true);
                } else {
                    toast.error("This is a premium feature. Upgrade your plan to access it.");
                    router.replace("/plans");
                }
            } catch (err) {
                console.error("Failed to verify membership", err);
                router.replace("/plans");
            } finally {
                setChecking(false);
            }
        };
        checkMembership();
    }, [router]);

    if (checking) {
        return (
            <div className="relative min-h-[400px]">
                <Loader overlay />
            </div>
        );
    }

    return allowed ? <>{children}</> : null;
}