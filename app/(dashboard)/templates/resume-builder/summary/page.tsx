"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/services/api";
import { useResumeId } from "@/hooks/useResumeId";
import { useResume } from "@/context/ResumeContext";
import ProgressPanel from "@/components/dashboard/ProgressPanel";
import Loader from "@/components/ui/Loader";

function withMinDelay<T>(promise: Promise<T>, ms = 1000): Promise<T> {
    return Promise.all([
        promise,
        new Promise((resolve) => setTimeout(resolve, ms)),
    ]).then(([result]) => result as T);
}

export default function SummaryPage() {
    const router = useRouter();
    const resumeId = useResumeId();
    const { refreshProgress } = useResume();
    const [resumeName, setResumeName] = useState("");
    const [summary, setSummary] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!resumeId) return;

        const fetchSummary = async () => {
            try {
                const res = await withMinDelay(
                    api.get(`/resume/builder/${resumeId}/summary`)
                );
                if (res.data?.success) {
                    setResumeName(res.data.resumeName || "");
                    setSummary(res.data.summary || "");
                }
            } catch (err) {
                console.error("Failed to load summary", err);
                toast.error("Failed to load summary.");
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, [resumeId]);

    const handleSave = async () => {
        if (!resumeId) return;

        if (!summary.trim()) {
            toast.error("Please enter a professional summary.");
            return;
        }

        setSaving(true);
        try {
            await api.put(`/resume/builder/${resumeId}/summary`, {
                resumeName,
                summary,
            });
            toast.success("Summary saved successfully!");
            await refreshProgress();
            router.push(`/templates/resume-builder/preview?resumeId=${resumeId}`);
        } catch (err: any) {
            console.error("Failed to save summary", err);
            toast.error(err.response?.data?.message || "Failed to save summary.");
        } finally {
            setSaving(false);
        }
    };

    const handlePrevious = () => {
        router.push(`/templates/resume-builder/skills?resumeId=${resumeId}`);
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
                <div className="border border-[#0456FF26] rounded-[10px] p-5">
                    <h4 className="font-bold text-[20px] leading-none text-black mb-[15px]">
                        Professional Summary
                    </h4>
                    <p className="font-normal text-[15px] leading-[140%] text-[#00002480] inline-block mb-[30px]">
                        Write a brief summary about your professional background and key strengths.
                    </p>

                    <div className="mb-4">
                        <label
                            htmlFor="resume-name"
                            className="font-bold text-[12px] leading-none text-[#000024] mb-[8px] block"
                        >
                            Resume Title / Name
                        </label>
                        <input
                            id="resume-name"
                            type="text"
                            value={resumeName}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                setResumeName(e.target.value)
                            }
                            placeholder="e.g. Senior Frontend Developer Resume"
                            className="w-full border border-[#0456FF26] rounded-[6px] py-[12px] px-[20px] text-[14px] leading-none text-black font-bold outline-none focus:border-[#0456FF] transition-colors"
                        />
                    </div>

                    <div className="mb-6">
                        <label
                            htmlFor="summary-text"
                            className="font-bold text-[12px] leading-none text-[#000024] mb-[8px] block"
                        >
                            Professional Summary *
                        </label>
                        <textarea
                            id="summary-text"
                            value={summary}
                            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                                setSummary(e.target.value)
                            }
                            rows={8}
                            maxLength={1000}
                            placeholder="Highlight your key achievements, years of experience, and main technical strengths..."
                            className="w-full border border-[#0456FF26] rounded-[6px] py-[12px] px-[20px] text-[14px] leading-[140%] text-black font-bold outline-none focus:border-[#0456FF] transition-colors resize-y"
                        />
                        <p className="text-[11px] text-[#00002480] text-right mt-1">
                            {summary.length} / 1000 characters
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-[10px] justify-between my-[30px] pt-[42px] border-t border-[#0456FF26]">
                    <button
                        type="button"
                        onClick={handlePrevious}
                        className="flex gap-[10px] items-center border border-[#0456FF] bg-white py-[11px] px-[26px] rounded-[5px] font-semibold text-[14px] leading-none text-[#0456FF] cursor-pointer hover:bg-[#0456FF] hover:text-white transition-colors duration-300"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="14"
                            viewBox="0 0 16 14"
                            fill="none"
                        >
                            <path
                                d="M1 7L15 7M7 1L1 7L7 13"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        Previous
                    </button>

                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="flex gap-[10px] items-center border border-[#0456FF] bg-[#0456FF] py-[11px] px-[26px] rounded-[5px] font-semibold text-[14px] leading-none text-white cursor-pointer hover:bg-transparent hover:text-[#0456FF] transition-colors duration-300 disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Save & Continue"}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="14"
                            viewBox="0 0 16 14"
                            fill="none"
                        >
                            <path
                                d="M15 7L1 7M9 1L15 7L9 13"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="w-full lg:w-[280px] shrink-0">
                <ProgressPanel />
            </div>
        </div>
    );
}