"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "@/services/api";
import { useResumeId } from "@/hooks/useResumeId";

export interface SectionStatus {
    basicInfo: boolean;
    education: boolean;
    experience: boolean;
    skills: boolean;
    summary: boolean;
}

interface Resume {
    id: number;
    publicId: string;
    name?: string;
    createdAt?: string;
    updatedAt?: string;
    progressPercentage?: number;
    isDraft?: boolean;
    previewImage?: string | null;
    resume_templates?: {
        id: number;
        name: string;
        templateKey: string;
        preview?: string;
    };
}

interface ResumeContextType {
    sections: SectionStatus;
    progressPercentage: number;
    completedCount: number;
    totalSections: number;
    refreshProgress: () => Promise<void>;
    resumes: Resume[];
    maxResumes: number;
    resumesLoading: boolean;
    refreshResumes: () => Promise<void>;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export const ResumeProvider = ({ children }: { children: React.ReactNode }) => {
    const resumeId = useResumeId();
    const [sections, setSections] = useState<SectionStatus>({
        basicInfo: false,
        education: false,
        experience: false,
        skills: false,
        summary: false,
    });

    const [resumes, setResumes] = useState<Resume[]>([]);
    const [maxResumes, setMaxResumes] = useState<number>(15);
    const [resumesLoading, setResumesLoading] = useState<boolean>(true);

    const refreshProgress = async () => {
        if (!resumeId) return;
        try {
            const res = await api.get(`/resume/builder/${resumeId}/progress`);
            if (res.data?.success) {
                setSections(res.data.sections);
            }
            await api.post(`/resume/builder/${resumeId}/thumbnail`);
            await refreshResumes();
        } catch (err) {
            console.error("Failed to fetch resume progress", err);
        }
    };

    const refreshResumes = async () => {
        try {
            const res = await api.get("/resume");
            if (res.data.success) {
                setResumes(res.data.resumes || res.data.data || []);
                if (res.data.maxResumes) {
                    setMaxResumes(res.data.maxResumes);
                }
            }
        } catch (err) {
            console.error("Failed to fetch resumes", err);
        } finally {
            setResumesLoading(false);
        }
    };

    useEffect(() => {
        refreshProgress();
    }, [resumeId]);

    useEffect(() => {
        refreshResumes();
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
                resumes,
                maxResumes,
                resumesLoading,
                refreshResumes,
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