"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "@/services/api";

export interface SectionStatus {
    basicInfo: boolean;
    education: boolean;
    experience: boolean;
    skills: boolean;
    summary: boolean;
}

interface ResumeContextType {
    sections: SectionStatus;
    progressPercentage: number;
    completedCount: number;
    totalSections: number;
    refreshProgress: () => Promise<void>;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export const ResumeProvider = ({ children }: { children: React.ReactNode }) => {
    const [sections, setSections] = useState<SectionStatus>({
        basicInfo: false,
        education: false,
        experience: false,
        skills: false,
        summary: false,
    });

    const refreshProgress = async () => {
        try {
            const res = await api.get("/resume/progress");
            if (res.data?.success) {
                setSections(res.data.sections);
            }
        } catch (err) {
            console.error("Failed to fetch resume progress", err);
        }
    };

    useEffect(() => {
        refreshProgress();
    }, []);

    const totalSections = Object.keys(sections).length;
    const completedCount = Object.values(sections).filter(Boolean).length;
    const progressPercentage = Math.round((completedCount / totalSections) * 100);

    return (
        <ResumeContext.Provider
            value={{
                sections,
                progressPercentage,
                completedCount,
                totalSections,
                refreshProgress,
            }}
        >
            {children}
        </ResumeContext.Provider>
    );
};

export const useResume = () => {
    const context = useContext(ResumeContext);
    if (!context) {
        throw new Error("useResume must be used within a ResumeProvider");
    }
    return context;
};