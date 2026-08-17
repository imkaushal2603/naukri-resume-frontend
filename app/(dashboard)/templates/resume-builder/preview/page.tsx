"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/services/api";
import { useResumeId } from "@/hooks/useResumeId";
import ProgressPanel from "@/components/dashboard/ProgressPanel";
import Loader from "@/components/ui/Loader";

function withMinDelay<T>(promise: Promise<T>, ms = 1000): Promise<T> {
    return Promise.all([
        promise,
        new Promise((resolve) => setTimeout(resolve, ms)),
    ]).then(([result]) => result as T);
}

export default function PreviewPage() {
    const router = useRouter();
    const resumeId = useResumeId();
    const [html, setHtml] = useState("");
    const [resumeName, setResumeName] = useState("");
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState<"pdf" | "docx" | null>(null);

    const fetchPreview = useCallback(async () => {
        if (!resumeId) return;
        try {
            const previewRes = await withMinDelay(
                api.get(`/resume/builder/${resumeId}/preview`)
            );
            if (previewRes.data?.success) {
                setHtml(previewRes.data.html || "");
                setResumeName(previewRes.data.resumeName || "Untitled Resume");
            }
        } catch (err) {
            console.error("Failed to load preview", err);
            toast.error("Failed to load resume preview.");
        } finally {
            setLoading(false);
        }
    }, [resumeId]);

    useEffect(() => {
        fetchPreview();
    }, [fetchPreview]);

    const handleDownload = async (format: "pdf" | "docx") => {
        if (!resumeId) return;
        setDownloading(format);
        try {
            const res = await api.get(
                `/resume/builder/${resumeId}/download?format=${format}`,
                { responseType: "blob" }
            );

            const blob = new Blob([res.data], {
                type:
                    format === "pdf"
                        ? "application/pdf"
                        : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
                "download",
                `${resumeName.toLowerCase().replace(/\s+/g, "_") || "resume"}.${format}`
            );
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success(`Downloaded ${format.toUpperCase()} successfully!`);
        } catch (err) {
            console.error(`Failed to download ${format}`, err);
            toast.error(`Failed to download ${format.toUpperCase()} file.`);
        } finally {
            setDownloading(null);
        }
    };

    const handlePrevious = () => {
        router.push(`/templates/resume-builder/summary?resumeId=${resumeId}`);
    };

    if (loading) return <Loader />;

    if (!resumeId) {
        return (
            <div className="p-5 border border-[#0456FF26] rounded-[10px] text-center">
                <p className="text-sm font-semibold text-red-500">
                    No active resume ID found. Please select a resume first.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                    <div>
                        <h4 className="font-bold text-[20px] leading-none text-black mb-[10px]">
                            {resumeName}
                        </h4>
                        <p className="font-normal text-[15px] leading-[140%] text-[#00002480]">
                            Preview your resume before downloading.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3 items-center">
                        <button
                            type="button"
                            onClick={() =>
                                router.push(`/templates?resumeId=${resumeId}`)
                            }
                            className="border border-[#0456FF] bg-white py-[9px] px-[18px] rounded-[5px] font-semibold text-[13px] leading-none text-[#0456FF] cursor-pointer hover:bg-[#0456FF] hover:text-white transition-colors duration-300 shrink-0"
                        >
                            Change Template
                        </button>
                        <button
                            type="button"
                            onClick={() => handleDownload("pdf")}
                            disabled={downloading !== null}
                            className="border border-[#0456FF] bg-white py-[9px] px-[18px] rounded-[5px] font-semibold text-[13px] leading-none text-[#0456FF] cursor-pointer hover:bg-[#0456FF] hover:text-white transition-colors duration-300 disabled:opacity-50 shrink-0"
                        >
                            {downloading === "pdf" ? "Downloading..." : "Download PDF"}
                        </button>
                        <button
                            type="button"
                            onClick={() => handleDownload("docx")}
                            disabled={downloading !== null}
                            className="border border-[#0456FF] bg-[#0456FF] py-[9px] px-[18px] rounded-[5px] font-semibold text-[13px] leading-none text-white cursor-pointer hover:bg-transparent hover:text-[#0456FF] transition-colors duration-300 disabled:opacity-50 shrink-0"
                        >
                            {downloading === "docx" ? "Downloading..." : "Download DOCX"}
                        </button>
                    </div>
                </div>

                <div className="border border-[#0456FF26] rounded-[10px] overflow-hidden bg-gray-50 shadow-sm">
                    <iframe
                        srcDoc={html}
                        className="w-full min-h-[850px] lg:min-h-[1050px] border-none block"
                        title="Resume Preview"
                    />
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
                </div>
            </div>

            <div className="w-full lg:w-[280px] shrink-0">
                <ProgressPanel />
            </div>
        </div>
    );
}