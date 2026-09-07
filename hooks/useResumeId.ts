"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export const useResumeId = (): string | null => {
    // 1. Read query string synchronously on initial render if window exists
    const [resumeId, setResumeId] = useState<string | null>(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            return params.get("resumeId");
        }
        return null;
    });

    const pathname = usePathname();

    // 2. Update on path/route changes
    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            setResumeId(params.get("resumeId"));
        }
    }, [pathname]);

    return resumeId;
};