"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import api from "@/services/api";
import { useResumeId } from "@/hooks/useResumeId";
import Loader from "@/components/ui/Loader";

function withMinDelay<T>(promise: Promise<T>, ms: number = 1000): Promise<T> {
    return Promise.all([
        promise,
        new Promise((resolve) => setTimeout(resolve, ms)),
    ]).then(([result]) => result as T);
}

interface Template {
    id: number;
    name: string;
    templateKey: string;
    preview: string;
    status: number;
}

export default function Templates() {
    const router = useRouter();
    const resumeId = useResumeId();
    const [templates, setTemplates] = useState<Template[]>([]);
    const [currentTemplateId, setCurrentTemplateId] = useState<number | null>(null);
    const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    useEffect(() => {
        const fetchData = async () => {
            try {
                const templatesRes = await withMinDelay(api.get("/resume/templates"));
                if (templatesRes.data.success) {
                    setTemplates(templatesRes.data.templates);
                }

                if (resumeId) {
                    const resumeRes = await api.get(`/resume/builder/${resumeId}`);
                    if (resumeRes.data.success) {
                        const tId = resumeRes.data.resume.templateId;
                        setCurrentTemplateId(tId);
                        setSelectedTemplateId(tId);
                    }
                }
            } catch (err) {
                console.error("Failed to load templates", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [resumeId]);

    const handleSelectTemplate = (templateId: number) => {
        setSelectedTemplateId(templateId);
    };

    const handleUpdate = async () => {
        if (!resumeId || !selectedTemplateId) return;
        setSaving(true);
        try {
            const res = await api.put(`/resume/builder/${resumeId}`, { templateId: selectedTemplateId });
            if (res.data.success) {
                router.push(`/templates/resume-builder/preview?resumeId=${resumeId}`);
            }
        } catch (err: any) {
            console.error("Failed to update template", err.response?.data || err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleContinue = async () => {
        if (!selectedTemplateId) return;
        setSaving(true);
        try {
            const res = await api.post("/resume/builder", { templateId: selectedTemplateId });
            if (res.data.success) {
                router.push(`/templates/resume-builder/basic-info?resumeId=${res.data.resume.id}`);
            }
        } catch (err: any) {
            console.error("Failed to select template", err.response?.data || err.message);
        } finally {
            setSaving(false);
        }
    };

    const getImageUrl = (previewPath: string) => {
        if (!previewPath) return "";

        if (previewPath.startsWith("http://") || previewPath.startsWith("https://")) {
            return previewPath;
        }

        const relativePath = previewPath.startsWith("/api/") ? previewPath.slice(4) : previewPath;
        const baseUrl = backendUrl.replace(/\/$/, "");

        return `${baseUrl}${relativePath}`;
    };

    const isEditing = Boolean(resumeId);
    const hasPendingChange = isEditing && selectedTemplateId !== currentTemplateId;
    const showActionButton = isEditing ? hasPendingChange : Boolean(selectedTemplateId);

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="flex flex-wrap gap-[15px]">
            <div className="w-[calc(70%-7.5px)]">
                <div className="flex flex-wrap items-center gap-[150px] justify-between">
                    <div className="w-[40%]">
                        <h4 className="font-bold text-[22px] leading-[120%] text-black mb-[15px]">Choose a Resume Template</h4>
                        <p className="text-[14px] leading-[22px] text-[#00002480]">Select a professionally designed template that matches your career goals and helps your resume stand out.</p>
                    </div>
                </div>

                <div className="mt-[30px]">
                    {loading ? (
                        <p className="text-sm text-[#00002480]">Loading templates...</p>
                    ) : templates.length === 0 ? (
                        <p className="text-sm text-[#00002480]">No templates available.</p>
                    ) : (
                        <div className="grid grid-cols-3 gap-[20px]">
                            {templates.map((template) => {
                                const isCurrent = template.id === currentTemplateId;
                                const isSelected = template.id === selectedTemplateId;

                                return (
                                    <div
                                        key={template.id}
                                        onClick={() => handleSelectTemplate(template.id)}
                                        className={`relative cursor-pointer rounded-[8px] border-2 p-[10px] transition-all ${isSelected
                                            ? "border-[#0456FF]"
                                            : "border-[#0456FF26]"
                                            }`}
                                    >
                                        {isCurrent && (
                                            <span className="absolute top-2 right-2 bg-[#0456FF] text-white text-[10px] font-semibold px-2 py-[2px] rounded-[4px] z-10">
                                                Current
                                            </span>
                                        )}
                                        {template.preview ? (
                                            <Image
                                                src={getImageUrl(template.preview)}
                                                alt={template.name}
                                                width={220}
                                                height={300}
                                                className="w-full h-auto rounded-[4px] object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-[300px] bg-gray-100 rounded-[4px] flex items-center justify-center text-xs text-gray-400">No preview</div>
                                        )}
                                        <p className="text-center font-medium text-[14px] mt-[10px]">{template.name}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {showActionButton && (
                    <button
                        onClick={isEditing ? handleUpdate : handleContinue}
                        disabled={saving}
                        className="mt-[30px] bg-[#0456FF] text-white px-[24px] py-[12px] rounded-[6px] font-semibold text-[14px] disabled:opacity-50"
                    >
                        {saving
                            ? (isEditing ? "Updating..." : "Setting up...")
                            : (isEditing ? "Update" : "Continue with this template")}
                    </button>
                )}
            </div>
            <div className="w-[calc(30%-7.5px)]"></div>
        </div>
    );
}