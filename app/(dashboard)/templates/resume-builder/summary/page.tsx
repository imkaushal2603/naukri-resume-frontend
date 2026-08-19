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
                    <h4 className="font-bold text-[20px] leading-none text-black mb-[15px]">Professional Summary</h4>
                    <p className="font-normal text-[15px] leading-[140%] text-[#00002480] inline-block mb-[30px]">Write a brief summary about your professional background and key strengths.</p>
                    <div className="mb-4">
                        <label htmlFor="resume-name" className="font-bold text-[12px] leading-none text-[#000024] mb-[8px] block">Resume Title / Name</label>
                        <input
                            id="resume-name"
                            type="text"
                            value={resumeName}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                setResumeName(e.target.value)
                            }
                            placeholder="e.g. Senior Frontend Developer Resume"
                            className="w-full border border-[#0456FF26] rounded-[6px] py-[12px] px-[20px] text-[14px] leading-none text-black font-bold"
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="summary-text" className="font-bold text-[12px] leading-none text-[#000024] mb-[8px] block">Professional Summary *</label>
                        <textarea
                            id="summary-text"
                            value={summary}
                            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                                setSummary(e.target.value)
                            }
                            rows={8}
                            maxLength={1000}
                            placeholder="Highlight your key achievements, years of experience, and main technical strengths..."
                            className="w-full border border-[#0456FF26] rounded-[6px] py-[12px] px-[20px] text-[14px] leading-none text-black font-bold resize-y"
                        />
                        <p className="text-end font-medium text-[12px] leading-none text-[#00002499] mt-[8px]">{summary.length} / 1000 characters</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-[10px] bg-[#0456FF26] border border-[#0456FF4D] rounded-[6px] px-[20px] py-[14px]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M8.5 13.5H9.5V8H8.5V13.5ZM9.434 6.4C9.55533 6.282 9.616 6.13567 9.616 5.961C9.616 5.78633 9.55667 5.64033 9.438 5.523C9.31933 5.40567 9.17333 5.34667 9 5.346C8.82667 5.34533 8.68067 5.40433 8.562 5.523C8.44333 5.64167 8.38433 5.788 8.385 5.962C8.38567 6.136 8.446 6.282 8.566 6.4C8.686 6.518 8.83067 6.577 9 6.577C9.16933 6.577 9.314 6.518 9.434 6.4ZM9.004 18C7.75867 18 6.58833 17.764 5.493 17.292C4.39767 16.8193 3.44467 16.178 2.634 15.368C1.82333 14.558 1.18167 13.606 0.709 12.512C0.236333 11.418 0 10.2483 0 9.003C0 7.75767 0.236333 6.58767 0.709 5.493C1.181 4.39767 1.82133 3.44467 2.63 2.634C3.43867 1.82333 4.391 1.18167 5.487 0.709C6.583 0.236333 7.753 0 8.997 0C10.241 0 11.411 0.236333 12.507 0.709C13.6023 1.181 14.5553 1.82167 15.366 2.631C16.1767 3.44033 16.8183 4.39267 17.291 5.488C17.7637 6.58333 18 7.753 18 8.997C18 10.241 17.764 11.411 17.292 12.507C16.82 13.603 16.1787 14.556 15.368 15.366C14.5573 16.176 13.6053 16.8177 12.512 17.291C11.4187 17.7643 10.25 18.0007 9.004 18Z" fill="#0456FF" />
                        </svg>
                        <h6 className="font-medium text-[16px] leading-none text-[#000024]"><span className="text-[#0456FF]">Tip:</span> A good summary is 2-4 lines long and highlights your top skills, experience and value.</h6>
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
            <div className="w-[325px] shrink-0">
                <ProgressPanel />
            </div>
        </div>
    );
}