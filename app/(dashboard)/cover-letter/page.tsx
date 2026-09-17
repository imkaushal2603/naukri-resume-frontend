"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Loader from "@/components/ui/Loader";
import api from "@/services/api";
import Image from "next/image";
import PremiumGuard from "../../../components/ui/PremiumGuard";

function withMinDelay<T>(promise: Promise<T>, ms: number = 1000): Promise<T> {
    return Promise.all([
        promise,
        new Promise((resolve) => setTimeout(resolve, ms)),
    ]).then(([result]) => result as T);
}

interface CoverLetterTemplate {
    id: number;
    name: string;
    templateKey: string;
    preview: string | null;
    status: boolean;
}

export default function CoverLetterTemplates() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isEditing = searchParams.get("editing") === "true";
    const [templates, setTemplates] = useState<CoverLetterTemplate[]>([]);
    const [selectedTemplateKey, setSelectedTemplateKey] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                setLoading(true);
                const res = await withMinDelay(api.get("/cover-letter/templates"));
                if (res.data.success) {
                    setTemplates(res.data.templates);
                }
            } catch (err) {
                console.error("Failed to load cover letter templates", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTemplates();
    }, []);

    useEffect(() => {
        if (!isEditing) {
            sessionStorage.removeItem("coverLetterData");
        }
    }, [isEditing]);

    const getImageUrl = (previewPath: string) => {
        if (!previewPath) return "";
        if (previewPath.startsWith("http://") || previewPath.startsWith("https://")) {
            return previewPath;
        }
        const normalizedPath = previewPath.startsWith("/api/") ? previewPath : `/api${previewPath.startsWith("/") ? previewPath : `/${previewPath}`}`;
        const rawBase = backendUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
        return `${rawBase}${normalizedPath}`;
    };

    const handleSelectTemplate = (template: CoverLetterTemplate) => {
        setSelectedTemplateKey(template.templateKey);
    };

    const handleContinue = () => {
        if (!selectedTemplateKey) return;
        if (isEditing) {
            router.push(`/cover-letter/${selectedTemplateKey}/preview`);
        } else {
            router.push(`/cover-letter/${selectedTemplateKey}/basic-info`);
        }
    };

    return (
        <PremiumGuard>
            <div className="relative">
                {loading && <Loader overlay />}
                <h4 className="font-bold text-[20px] leading-none text-black mb-[15px]">Choose a Cover Letter Template</h4>
                <p className="font-normal text-[15px] leading-[140%] text-[#00002480] mb-[30px]">Select a design to get started. Nothing is saved — fill it in, preview, and download.</p>
                <div>
                    {templates.length === 0 ? (
                        <p className="text-sm text-[#00002480]">No templates available.</p>
                    ) : (
                        <div className="grid grid-cols-5 gap-[20px] max-[768px]:grid-cols-1">
                            {templates.map((template) => {
                                const isSelected = template.templateKey === selectedTemplateKey;

                                return (
                                    <div
                                        key={template.id}
                                        onClick={() => handleSelectTemplate(template)}
                                        className={`relative cursor-pointer rounded-[8px] border-2 p-[10px] transition-all flex flex-col justify-between ${isSelected ? "border-[#0456ff]" : "border-[#0456FF26]"}`}
                                    >
                                        {template.preview ? (
                                            <Image src={getImageUrl(template.preview)} alt={template.name} width={220} height={300} className="w-full h-auto rounded-[4px] object-cover" />
                                        ) : (
                                            <div className="w-full h-[300px] bg-gray-100 rounded-[4px] flex items-center justify-center text-xs text-gray-400">No preview</div>
                                        )}
                                        {isSelected && (
                                            <div className="absolute bottom-[8px] right-[8px]">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32" fill="none">
                                                    <path d="M16,2A14,14,0,1,0,30,16,14,14,0,0,0,16,2ZM14,21.5908l-5-5L10.5906,15,14,18.4092,21.41,11l1.5957,1.5859Z" fill="#0456FF" />
                                                </svg>
                                            </div>
                                        )}
                                        <p className={`text-center font-medium text-[14px] mt-[10px] font-semibold ${isSelected ? "text-[#0456FF]" : "text-[#000024]"}`}>{template.name}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                {selectedTemplateKey && (
                    <button onClick={handleContinue}
                        className="inline-block border border-[#0456FF] mt-[30px] bg-[#0456FF] text-white px-[24px] py-[12px] rounded-[6px] font-semibold text-[14px] fixed bottom-[60px] left-1/2 -translate-x-1/2 cursor-pointer hover:bg-transparent hover:text-[#0456FF] transition-colors duration-300"
                    >
                        {isEditing ? "Update" : "Use this template"}
                    </button>
                )}
            </div>
        </PremiumGuard>
    );
}