"use client";
import { useParams } from "next/navigation";

export const useResumeId = (): string | null => {
    const params = useParams();
    return (params?.resumeId as string) ?? null;
};