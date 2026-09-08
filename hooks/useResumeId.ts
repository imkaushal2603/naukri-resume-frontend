"use client";

import { useSearchParams } from "next/navigation";

export const useResumeId = (): string | null => {
    const searchParams = useSearchParams();
    return searchParams.get("resumeId");
};