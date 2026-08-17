"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export const useResumeId = (): number | null => {
    // 1. Read query string synchronously on initial render if window exists
    const [resumeId, setResumeId] = useState<number | null>(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const id = params.get("resumeId");
            return id ? Number(id) : null;
        }
        return null;
    });

    const pathname = usePathname();

    // 2. Update on path/route changes
    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const id = params.get("resumeId");
            setResumeId(id ? Number(id) : null);
        }
    }, [pathname]);

    return resumeId;
};