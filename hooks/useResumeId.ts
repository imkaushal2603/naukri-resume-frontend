"use client";

import { useSearchParams } from "next/navigation";

export const useResumeId = (): number | null => {
    const searchParams = useSearchParams();
    const id = searchParams.get("resumeId");
    return id ? Number(id) : null;
};