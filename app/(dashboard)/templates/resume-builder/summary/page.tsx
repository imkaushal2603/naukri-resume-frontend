"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { useResumeId } from "@/hooks/useResumeId";
import { useResume } from "@/context/ResumeContext";
import Loader from "@/components/ui/Loader";

function withMinDelay<T>(promise: Promise<T>, ms: number = 1000): Promise<T> {
    return Promise.all([
        promise,
        new Promise((resolve) => setTimeout(resolve, ms)),
    ]).then(([result]) => result as T);
}

export default function Summary() {
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
                const res = await withMinDelay(api.get(`/resume/builder/${resumeId}/summary`));
                if (res.data.success) {
                    setResumeName(res.data.resumeName || "");
                    setSummary(res.data.summary || "");
                }
            } catch (err) {
                console.error("Failed to load summary", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, [resumeId]);

    const handleSave = async () => {
        if (!resumeId) return;
        setSaving(true);
        try {
            await api.put(`/resume/builder/${resumeId}/summary`, { resumeName, summary });
            await refreshProgress();
            router.push(`/templates/resume-builder/preview?resumeId=${resumeId}`);
        } catch (err) {
            console.error("Failed to save summary", err);
        } finally {
            setSaving(false);
        }
    };

    const handlePrevious = () => {
        router.push(`/templates/skills?resumeId=${resumeId}`);
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div>
            <h4 className="font-bold text-[22px] mb-1">Professional Summary</h4>
            <p className="text-[14px] text-[#00002480] mb-6">
                Write a brief summary about your professional background and key strengths.
            </p>

            <div className="mb-4">
                <label className="text-[13px] font-semibold block mb-1">Resume Title / Name</label>
                <input
                    type="text"
                    value={resumeName}
                    onChange={(e) => setResumeName(e.target.value)}
                    className="w-full border border-[#0456FF26] rounded-[6px] px-3 py-2 text-[14px]"
                />
            </div>

            <div className="mb-6">
                <label className="text-[13px] font-semibold block mb-1">Professional Summary *</label>
                <textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    rows={8}
                    maxLength={1000}
                    className="w-full border border-[#0456FF26] rounded-[6px] px-3 py-2 text-[14px]"
                />
                <p className="text-[11px] text-[#00002480] text-right mt-1">
                    {summary.length} / 1000 characters
                </p>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={handlePrevious}
                    className="border border-[#0456FF26] text-[#0456FF] px-5 py-2.5 rounded-[6px] font-semibold text-[14px]"
                >
                    ← Previous
                </button>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-[#0456FF] text-white px-6 py-3 rounded-[6px] font-semibold text-[14px] disabled:opacity-50"
                >
                    {saving ? "Saving..." : "Save & Continue →"}
                </button>
            </div>
        </div>
    );
}