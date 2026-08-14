"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { useResumeId } from "@/hooks/useResumeId";

export default function Preview() {
    const router = useRouter();
    const resumeId = useResumeId();
    const [html, setHtml] = useState("");
    const [resumeName, setResumeName] = useState("");
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState<"pdf" | "docx" | null>(null);

    const fetchPreview = async () => {
        if (!resumeId) return;
        try {
            const previewRes = await api.get(`/resume/builder/${resumeId}/preview`);
            if (previewRes.data.success) {
                setHtml(previewRes.data.html);
                setResumeName(previewRes.data.resumeName);
            }
        } catch (err) {
            console.error("Failed to load preview", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPreview();
    }, [resumeId]);

    const handleDownload = async (format: "pdf" | "docx") => {
        if (!resumeId) return;
        setDownloading(format);
        try {
            const res = await api.get(`/resume/builder/${resumeId}/download?format=${format}`, {
                responseType: "blob",
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `${resumeName || "resume"}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Failed to download", err);
        } finally {
            setDownloading(null);
        }
    };

    if (loading) return <p className="text-sm text-[#00002480]">Loading...</p>;
    if (!resumeId) return <p className="text-sm text-red-500">No resume selected.</p>;

    return (
        <div className="flex-1">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h4 className="font-bold text-[22px]">{resumeName}</h4>
                    <p className="text-[14px] text-[#00002480]">Preview your resume before downloading.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => router.push(`/templates?resumeId=${resumeId}`)}
                        className="border border-[#0456FF26] text-[#0456FF] px-4 py-2 rounded-[6px] font-semibold text-[13px]"
                    >
                        Change Template
                    </button>
                    <button
                        onClick={() => handleDownload("pdf")}
                        disabled={downloading === "pdf"}
                        className="border border-[#0456FF26] text-[#0456FF] px-4 py-2 rounded-[6px] font-semibold text-[13px] disabled:opacity-50"
                    >
                        {downloading === "pdf" ? "Downloading..." : "Download PDF"}
                    </button>
                    <button
                        onClick={() => handleDownload("docx")}
                        disabled={downloading === "docx"}
                        className="bg-[#0456FF] text-white px-4 py-2 rounded-[6px] font-semibold text-[13px] disabled:opacity-50"
                    >
                        {downloading === "docx" ? "Downloading..." : "Download DOCX"}
                    </button>
                </div>
            </div>

            <div className="border border-[#0456FF26] rounded-[8px] overflow-hidden bg-gray-50">
                <iframe
                    srcDoc={html}
                    className="w-full"
                    style={{ height: "1100px", border: "none" }}
                    title="Resume Preview"
                />
            </div>
        </div>
    );
}