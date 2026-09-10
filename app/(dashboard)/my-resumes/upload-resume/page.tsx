"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/services/api";
import Loader from "@/components/ui/Loader";

function withMinDelay<T>(promise: Promise<T>, ms: number = 1000): Promise<T> {
    return Promise.all([
        promise,
        new Promise((resolve) => setTimeout(resolve, ms)),
    ]).then(([result]) => result as T);
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

export default function UploadResume() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [creating, setCreating] = useState<boolean>(false);
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [maxResumes, setMaxResumes] = useState<number>(15);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchResumes = async () => {
        try {
            setLoading(true);
            const res = await withMinDelay(api.get("/resume"));
            setResumes(res.data.resumes || res.data.data || []);
            if (res.data.success) {
                if (res.data.maxResumes) {
                    setMaxResumes(res.data.maxResumes);
                }
            }
        } catch (err) {
            console.error("Failed to load resumes", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResumes();
    }, []);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (resumes.length >= maxResumes) {
            toast.error(`You've reached the maximum limit of ${maxResumes} resumes. Extend your limit to upload more.`);
            e.target.value = "";
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("resume", file);
            const res = await api.post("/resume/builder/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            if (res.data.success && res.data.publicId) {
                toast.success("Resume parsed! Review and complete your details.");
                router.push(`/templates/resume-builder/${res.data.publicId}/basic-info`);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to parse resume.");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleCreateNewResume = async () => {
        if (resumes.length >= maxResumes) {
            toast.error(`You've reached the maximum limit of ${maxResumes} resumes. Extend your limit to create more.`);
            return;
        }

        setCreating(true);
        try {
            const res = await api.post("/resume/builder", {});
            if (res.data.success && res.data.resume?.publicId) {
                router.push(`/templates/resume-builder/${res.data.resume.publicId}/basic-info`);
            }
        } catch (err: any) {
            const message = err.response?.data?.message;
            if (message?.includes("only create up to")) {
                toast.error(`${message} Upgrade your plan to create more.`);
            } else {
                toast.error(message || "Failed to create new resume.");
            }
            console.error("Failed to create new resume", err.response?.data || err.message);
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="relative">
            {(loading || uploading) && <Loader overlay />}
            <h4 className="font-bold text-[20px] leading-none text-black mb-[15px]">Create Your Resume</h4>
            <p className="font-normal text-[15px] leading-[140%] text-[#00002480] inline-block">Get started by uploading your existing resume or create a new one from scratch.</p>
            <div className="flex flex-wrap gap-[30px] max-w-[900px] mt-[50px]">
                <div className="w-[calc(50%-15px)] border border-[#0456FF26] rounded-[8px] p-[30px] pb-[70px] flex flex-col items-center justify-center text-center gap-y-[20px]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="80px" height="80px" viewBox="0 0 22 22" fill="none">
                        <g id="File / File_Upload">
                            <path id="Vector" d="M12 18V12M12 12L9 14M12 12L15 14M13 3.00087C12.9045 3 12.7973 3 12.6747 3H8.2002C7.08009 3 6.51962 3 6.0918 3.21799C5.71547 3.40973 5.40973 3.71547 5.21799 4.0918C5 4.51962 5 5.08009 5 6.2002V17.8002C5 18.9203 5 19.4801 5.21799 19.9079C5.40973 20.2842 5.71547 20.5905 6.0918 20.7822C6.51921 21 7.079 21 8.19694 21L15.8031 21C16.921 21 17.48 21 17.9074 20.7822C18.2837 20.5905 18.5905 20.2842 18.7822 19.9079C19 19.4805 19 18.9215 19 17.8036V9.32568C19 9.20296 19 9.09561 18.9991 9M13 3.00087C13.2856 3.00347 13.4663 3.01385 13.6388 3.05526C13.8429 3.10425 14.0379 3.18526 14.2168 3.29492C14.4186 3.41857 14.5918 3.59182 14.9375 3.9375L18.063 7.06298C18.4089 7.40889 18.5809 7.58136 18.7046 7.78319C18.8142 7.96214 18.8953 8.15726 18.9443 8.36133C18.9857 8.53376 18.9963 8.71451 18.9991 9M13 3.00087V5.8C13 6.9201 13 7.47977 13.218 7.90759C13.4097 8.28392 13.7155 8.59048 14.0918 8.78223C14.5192 9 15.079 9 16.1969 9H18.9991M18.9991 9H19.0002" stroke="#0456FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </g>
                    </svg>
                    <div>
                        <h5 className="text-[23px] font-semibold text-[#000024] leading-normal mb-[6px]">Upload Existing Resume</h5>
                        <p className="text-[#00002480] text-[16px] leading-[150%] inline-block">Already have a resume? Upload it and we'll help you improve it.</p>
                    </div>
                    <div className="w-full">
                        <input ref={fileInputRef} type="file" accept=".pdf,.docx" className="hidden" onChange={handleFileUpload} />
                        <button onClick={() => fileInputRef.current?.click()} disabled={uploading || resumes.length >= maxResumes} className="flex w-full text-center justify-center gap-[10px] items-center border border-[#0456FF] bg-[#fff] py-[11px] px-[26px] rounded-[5px] font-semibold text-[14px] leading-none text-[#0456FF] cursor-pointer hover:bg-[#0456FF] hover:text-[#fff] transition-colors duration-300 hover:bg-[#0456FF0D] cursor-pointer">Upload Existing Resume</button>
                    </div>
                    <span className="text-[14px] leading-normal text-[#000024] absolute bottom-[40px]">Supports PDF, DOC, DOCX (Max 5 MB)</span>
                </div>
                <div className="w-[calc(50%-15px)] border border-[#0456FF26] rounded-[8px] p-[30px] pb-[70px] flex flex-col items-center justify-center text-center gap-y-[20px]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="80px" height="80px" viewBox="0 0 22 22" fill="none">
                        <path d="M13.5 3H12H8C6.34315 3 5 4.34315 5 6V18C5 19.6569 6.34315 21 8 21H11M13.5 3L19 8.625M13.5 3V7.625C13.5 8.17728 13.9477 8.625 14.5 8.625H19M19 8.625V11.8125" stroke="#0456FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M17 15V18M17 21V18M17 18H14M17 18H20" stroke="#0456FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div>
                        <h5 className="text-[23px] font-semibold text-[#000024] leading-normal mb-[6px]">Create New Resume</h5>
                        <p className="text-[#00002480] text-[16px] leading-[150%] inline-block">Don't have a resume yet? Create a new one using our step-by-step builder.</p>
                    </div>
                    <div className="w-full">
                        <button onClick={handleCreateNewResume} disabled={creating}
                            className="inline-block w-full text-center justify-center border border-[#0456FF] bg-[#0456FF] py-[11px] px-[26px] rounded-[5px] font-semibold text-[14px] leading-none text-white cursor-pointer hover:bg-transparent hover:text-[#0456FF] transition-colors duration-300"
                        >
                            Create New Resume
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}