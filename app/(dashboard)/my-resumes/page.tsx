"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import api from "@/services/api";
import Loader from "@/components/ui/Loader";
import PlanDetails from "@/hooks/PlanDetails";

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

interface Membership {
    startDate: string;
    endDate: string;
    membershipPlanId: number;
    status: string;
    plan: {
        id: number;
        name: string;
        price: string;
        durationDays: number;
    };
}

export default function MyResumes() {
    const router = useRouter();
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [maxResumes, setMaxResumes] = useState<number>(15);
    const [loading, setLoading] = useState<boolean>(true);
    const [membership, setMembership] = useState<Membership | null>(null);
    const [membershipLoading, setMembershipLoading] = useState<boolean>(true);
    const [creating, setCreating] = useState<boolean>(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [previewModal, setPreviewModal] = useState<{ open: boolean; html: string; resumeName: string }>({
        open: false,
        html: "",
        resumeName: "",
    });
    const [previewLoadingId, setPreviewLoadingId] = useState<string | null>(null);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const RESUMES_PER_PAGE = 3;
    const totalPages = Math.ceil(resumes.length / RESUMES_PER_PAGE);
    const paginatedResumes = resumes.slice(
        (currentPage - 1) * RESUMES_PER_PAGE,
        currentPage * RESUMES_PER_PAGE
    );
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    const fetchResumes = async () => {
        try {
            setLoading(true);
            const res = await withMinDelay(api.get("/resume"));
            if (res.data.success) {
                setResumes(res.data.resumes || res.data.data || []);
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

    useEffect(() => {
        const fetchMembership = async () => {
            try {
                const res = await api.get("/membership");
                if (res.data.success && res.data.status) {
                    setMembership(res.data.status);
                }
            } catch (err) {
                console.error("Failed to load membership", err);
            } finally {
                setMembershipLoading(false);
            }
        };
        fetchMembership();
    }, []);

    useEffect(() => {
        const maxPage = Math.max(1, Math.ceil(resumes.length / RESUMES_PER_PAGE));
        if (currentPage > maxPage) {
            setCurrentPage(maxPage);
        }
    }, [resumes, currentPage]);

    const handleCreateNewResume = async () => {
        if (resumes.length >= maxResumes) {
            toast.error(`You've reached the maximum limit of ${maxResumes} resumes. Extend your limit to create more.`);
            return;
        }

        setCreating(true);
        try {
            const res = await api.post("/resume/builder", {});
            if (res.data.success && res.data.resume?.publicId) {
                router.push(`/templates/resume-builder/basic-info?resumeId=${res.data.resume.publicId}`);
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

    const handleEdit = (publicId: string) => {
        router.push(`/templates/resume-builder/basic-info?resumeId=${publicId}`);
    };

    const handleDelete = (publicId: string) => {
        toast("Are you sure you want to delete this resume?", {
            description: "This action cannot be undone.",
            duration: Infinity,
            action: {
                label: "Delete",
                onClick: () => confirmDelete(publicId),
            },
            cancel: {
                label: "Cancel",
                onClick: () => { },
            },
            classNames: {
                actionButton: "!bg-red-600 !text-white hover:!bg-red-700",
                cancelButton: "!bg-gray-100 !text-gray-700 hover:!bg-gray-200",
            },
        });
    };

    const confirmDelete = async (publicId: string) => {
        setDeletingId(publicId);
        try {
            const res = await api.delete(`/resume/builder/${publicId}`);
            if (res.data.success) {
                setResumes((prev) => prev.filter((r) => r.publicId !== publicId));
                toast.success("Resume deleted successfully.");
            }
        } catch (err: any) {
            console.error("Failed to delete resume", err);
            toast.error(err.response?.data?.message || "Failed to delete resume.");
        } finally {
            setDeletingId(null);
        }
    };

    const getImageUrl = (previewPath: string) => {
        if (!previewPath) return "";
        if (previewPath.startsWith("http://") || previewPath.startsWith("https://")) {
            return previewPath;
        }

        const rawBase = backendUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
        if (previewPath.startsWith("/api/") || previewPath.startsWith("/uploads/")) {
            return `${rawBase}${previewPath}`;
        }

        const cleanPath = previewPath.startsWith("/") ? previewPath : `/${previewPath}`;
        return `${rawBase}/api${cleanPath}`;
    };

    const handlePreview = async (publicId: string) => {
        setPreviewLoadingId(publicId);
        try {
            const res = await api.get(`/resume/builder/${publicId}/preview`);
            if (res.data.success) {
                setPreviewModal({
                    open: true,
                    html: res.data.html,
                    resumeName: res.data.resumeName || "Resume",
                });
            }
        } catch (err) {
            console.error("Failed to load preview", err);
            toast.error("Failed to load resume preview.");
        } finally {
            setPreviewLoadingId(null);
        }
    };

    const closePreview = () => {
        setPreviewModal({ open: false, html: "", resumeName: "" });
    };

    const handleDownload = async (publicId: string, resumeName: string) => {
        setDownloadingId(publicId);
        try {
            const res = await api.get(`/resume/builder/${publicId}/download?format=pdf`, {
                responseType: "blob",
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `${resumeName || "resume"}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success("Resume downloaded!");
        } catch (err: any) {
            console.error("Failed to download", err);
            if (err.response?.data instanceof Blob) {
                try {
                    const text = await err.response.data.text();
                    const parsed = JSON.parse(text);
                    toast.error(parsed.message || "Failed to download resume.");
                } catch {
                    toast.error("Failed to download resume.");
                }
            } else {
                toast.error(err.response?.data?.message || "Failed to download resume.");
            }
        } finally {
            setDownloadingId(null);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("resume", file);
            const res = await api.post("/resume/builder/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            if (res.data.success && res.data.publicId) {
                toast.success("Resume parsed! Review and complete your details.");
                router.push(`/templates/resume-builder/basic-info?resumeId=${res.data.publicId}`);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to parse resume.");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <div className="relative">
            {loading && <Loader overlay />}
            <div className="flex flex-wrap gap-6">
                <div className="flex-1">
                    <div className="flex gap-[20px] mb-[25px] max-[768px]:flex-wrap">
                        <div className="w-[calc(50%-20px)] max-[768px]:w-full">
                            <h4 className="font-bold text-[20px] leading-none text-black mb-[15px]">My Resumes</h4>
                            <p className="font-normal text-[15px] leading-[140%] text-[#00002480] inline-block">Manage, edit or delete your existing resume.</p>
                        </div>
                        <div className="w-[50%] flex justify-end items-center gap-[10px] max-[768px]:w-full max-[768px]:text-left">
                            <div>
                                <input ref={fileInputRef} type="file" accept=".pdf,.docx" className="hidden" onChange={handleFileUpload} />
                                <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="flex gap-[10px] items-center border border-[#0456FF] bg-[#fff] py-[11px] px-[26px] rounded-[5px] font-semibold text-[14px] leading-none text-[#0456FF] cursor-pointer hover:bg-[#0456FF] hover:text-[#fff] transition-colors duration-300 hover:bg-[#0456FF0D] cursor-pointer">{uploading ? "Parsing..." : "Upload Your Resume"}</button>
                            </div>
                            <button onClick={handleCreateNewResume} disabled={creating}
                                className="inline-block border border-[#0456FF] bg-[#0456FF] py-[11px] px-[26px] rounded-[5px] font-semibold text-[14px] leading-none text-white cursor-pointer hover:bg-transparent hover:text-[#0456FF] transition-colors duration-300"
                            >
                                Create New Resume
                            </button>
                        </div>
                    </div>
                    {resumes.length === 0 ? (
                        <div className="border-2 border-dashed border-[#0456FF26] rounded-[12px] p-10 text-center">
                            <p className="text-gray-500 mb-4">You haven't created any resumes yet.</p>
                        </div>
                    ) : (
                        <div className="">
                            {paginatedResumes.map((resume) => {
                                const previewPath = resume.previewImage || resume.resume_templates?.preview;
                                const isDeleting = deletingId === resume.publicId;

                                return (
                                    <div key={resume.id} className="border-b border-[#0456FF26] flex flex-wrap items-center gap-5 py-5">
                                        <div className="w-[140px] bg-[#F9F8FD] border border-[#CACACA80] p-[5px] rounded-[5px] relative group overflow-hidden">
                                            {previewPath ? (
                                                <>
                                                    <Image src={getImageUrl(previewPath)} alt={resume.name || "Resume Preview"} width="120" height="123"
                                                        className="w-full h-[174px] object-contain rounded-[3px]"
                                                    />
                                                    <button type="button" onClick={() => handlePreview(resume.publicId)} disabled={previewLoadingId === resume.publicId}
                                                        className="absolute inset-0 bg-black/25 group-hover:bg-black/55 transition-all duration-200 flex flex-col items-center justify-center gap-y-1 text-white cursor-pointer rounded-[3px]"
                                                    >
                                                        {previewLoadingId === resume.publicId ? (
                                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                        ) : (
                                                            <>
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    width="16"
                                                                    height="12"
                                                                    viewBox="0 0 13 8"
                                                                    fill="none"
                                                                    className="transition-transform duration-200 group-hover:scale-110"
                                                                >
                                                                    <path
                                                                        d="M12.1667 4C12.1667 4 9.5545 7.5 6.33333 7.5C3.11217 7.5 0.5 4 0.5 4C0.5 4 3.11217 0.5 6.33333 0.5C9.5545 0.5 12.1667 4 12.1667 4Z"
                                                                        stroke="#FFFFFF"
                                                                        strokeMiterlimit="10"
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                    />
                                                                    <path
                                                                        d="M7.57044 5.23744C7.24226 5.56563 6.79714 5.75 6.33301 5.75C5.86888 5.75 5.42376 5.56563 5.09557 5.23744C4.76738 4.90925 4.58301 4.46413 4.58301 4C4.58301 3.53587 4.76738 3.09075 5.09557 2.76256C5.42376 2.43437 5.86888 2.25 6.33301 2.25C6.79714 2.25 7.24226 2.43437 7.57044 2.76256C7.89863 3.09075 8.08301 3.53587 8.08301 4C8.08301 4.46413 7.89863 4.90925 7.57044 5.23744Z"
                                                                        stroke="#FFFFFF"
                                                                        strokeMiterlimit="10"
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                    />
                                                                </svg>
                                                                <span className="text-[12px] font-medium opacity-0 group-hover:opacity-100 max-h-0 group-hover:max-h-[20px] transition-all duration-200 leading-none">
                                                                    Preview
                                                                </span>
                                                            </>
                                                        )}
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                                                    No preview available
                                                </div>
                                            )}
                                        </div>
                                        <div className="w-[calc(100%-160px)] flex flex-wrap items-center gap-5">
                                            <div className="w-[calc(50%-10px)] max-[768px]:w-full">
                                                <h4 className="font-bold text-[16px] leading-[100%] text-[#000024] flex flex-wrap items-center gap-[10px]">
                                                    {resume?.name || `Resume #${resume.id}`}
                                                    {resume.isDraft ? (
                                                        <span className="bg-[#FF9F0A26] text-[#B45F00] text-[10px] font-semibold px-[10px] py-[6px] rounded-full leading-none uppercase">
                                                            Pending
                                                        </span>
                                                    ) : (
                                                        <span className="bg-[#29B33A26] text-[#29B33A] text-[10px] font-semibold px-[10px] py-[6px] rounded-full leading-none uppercase">
                                                            Completed
                                                        </span>
                                                    )}
                                                </h4>
                                                {resume.updatedAt && (
                                                    <p className="font-medium text-[14px] leading-[130%] text-[#000024B2] my-[5px]">
                                                        Updated {new Date(resume.updatedAt).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="w-[calc(50%-10px)] flex flex-wrap gap-[30px] justify-end items-center max-[768px]:w-full max-[768px]:justify-start max-[768px]:gap-2">
                                                <button type="button" onClick={() => handleEdit(resume.publicId)}
                                                    className="flex flex-col items-center gap-y-[5px] font-medium text-[14px] leading-[100%] text-[#000024] cursor-pointer"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="13" viewBox="0 0 11 13" fill="none">
                                                        <path d="M5.83333 0C5.98201 0.000164913 6.12502 0.0570962 6.23313 0.159162C6.34124 0.261227 6.4063 0.400723 6.41502 0.549147C6.42373 0.697571 6.37544 0.843721 6.28001 0.957735C6.18458 1.07175 6.04922 1.14502 5.90158 1.16258L5.83333 1.16667H1.16667V9.33333H9.33333V4.66667C9.3335 4.51799 9.39043 4.37498 9.49249 4.26687C9.59456 4.15876 9.73406 4.0937 9.88248 4.08498C10.0309 4.07627 10.1771 4.12456 10.2911 4.21999C10.4051 4.31541 10.4784 4.45078 10.4959 4.59842L10.5 4.66667V9.33333C10.5001 9.62767 10.3889 9.91116 10.1888 10.127C9.98866 10.3428 9.71434 10.475 9.42083 10.4971L9.33333 10.5H1.16667C0.87233 10.5001 0.588836 10.3889 0.373014 10.1888C0.157191 9.98866 0.024992 9.71434 0.00291679 9.42083L5.84897e-08 9.33333V1.16667C-9.30879e-05 0.87233 0.11107 0.588836 0.311207 0.373014C0.511343 0.157191 0.785659 0.0249919 1.07917 0.00291673L1.16667 0H5.83333ZM9.47508 0.200083C9.58006 0.0954637 9.72092 0.0347238 9.86906 0.0302003C10.0172 0.0256767 10.1615 0.0777088 10.2727 0.175728C10.3838 0.273748 10.4535 0.410405 10.4676 0.557943C10.4816 0.705482 10.439 0.852838 10.3483 0.970083L10.2999 1.0255L4.52492 6.79992C4.41994 6.90454 4.27908 6.96528 4.13094 6.9698C3.98281 6.97432 3.8385 6.92229 3.72734 6.82427C3.61617 6.72625 3.54649 6.58959 3.53243 6.44206C3.51838 6.29452 3.56101 6.14716 3.65167 6.02992L3.70008 5.97508L9.47508 0.200083Z" fill="#000024" />
                                                    </svg>
                                                    Edit
                                                </button>
                                                <button type="button" onClick={() => handleDownload(resume.publicId, resume.name || `Resume-${resume.id}`)} disabled={downloadingId === resume.publicId}
                                                    className={`flex flex-col items-center gap-y-[5px] font-medium text-[14px] leading-[100%] text-[#29B33A] cursor-pointer ${membership ? "text-[#29B33A]" : "text-[#FF0000]"}`}
                                                >
                                                    {membership ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                                            <path d="M7 10.577L3.461 7.039L4.169 6.319L6.5 8.65V0H7.5V8.65L9.83 6.32L10.539 7.039L7 10.577ZM1.616 14C1.15533 14 0.771 13.846 0.463 13.538C0.155 13.23 0.000666667 12.8453 0 12.384V9.961H1V12.384C1 12.538 1.064 12.6793 1.192 12.808C1.32 12.9367 1.461 13.0007 1.615 13H12.385C12.5383 13 12.6793 12.936 12.808 12.808C12.9367 12.68 13.0007 12.5387 13 12.384V9.961H14V12.384C14 12.8447 13.846 13.229 13.538 13.537C13.23 13.845 12.8453 13.9993 12.384 14H1.616Z" fill="#29B33A" />
                                                        </svg>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="13" viewBox="0 0 10 13" fill="none">
                                                            <path d="M8.16666 4.08333H7.58333V2.91667C7.58333 1.30667 6.27666 0 4.66667 0C3.05667 0 1.75 1.30667 1.75 2.91667V4.08333H1.16667C0.525 4.08333 0 4.60833 0 5.25V11.0833C0 11.725 0.525 12.25 1.16667 12.25H8.16666C8.80833 12.25 9.33333 11.725 9.33333 11.0833V5.25C9.33333 4.60833 8.80833 4.08333 8.16666 4.08333ZM2.91667 2.91667C2.91667 1.94833 3.69833 1.16667 4.66667 1.16667C5.635 1.16667 6.41666 1.94833 6.41666 2.91667V4.08333H2.91667V2.91667ZM8.16666 11.0833H1.16667V5.25H8.16666V11.0833ZM4.66667 9.33333C5.30833 9.33333 5.83333 8.80833 5.83333 8.16667C5.83333 7.525 5.30833 7 4.66667 7C4.025 7 3.5 7.525 3.5 8.16667C3.5 8.80833 4.025 9.33333 4.66667 9.33333Z" fill="currentColor" />
                                                        </svg>
                                                    )}
                                                    Download
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={isDeleting}
                                                    onClick={() => handleDelete(resume.publicId)}
                                                    className="flex flex-col items-center gap-y-[5px] font-medium text-[14px] leading-[100%] text-[#000024] cursor-pointer"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none">
                                                        <path d="M10 12V17" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        <path d="M14 12V17" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        <path d="M4 7H20" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        <path d="M6 10V18C6 19.6569 7.34315 21 9 21H15C16.6569 21 18 19.6569 18 18V10" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-6">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="flex gap-[10px] items-center border border-[#0456FF] bg-[#fff] py-[11px] px-[26px] rounded-[5px] font-semibold text-[14px] leading-none text-[#0456FF] cursor-pointer hover:bg-[#0456FF] hover:text-[#fff] transition-colors duration-300 disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#0456FF0D] cursor-pointer"
                            >
                                Previous
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-9 h-9 rounded-[6px] text-[14px] font-medium cursor-pointer transition-colors ${page === currentPage
                                        ? "bg-[#0456FF] text-white"
                                        : "text-[#000024] border border-[#0456FF26] hover:bg-[#0456FF] hover:text-[#fff]"
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="flex gap-[10px] items-center border border-[#0456FF] bg-[#fff] py-[11px] px-[26px] rounded-[5px] font-semibold text-[14px] leading-none text-[#0456FF] cursor-pointer hover:bg-[#0456FF] hover:text-[#fff] transition-colors duration-300 disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#0456FF0D] cursor-pointer"
                            >
                                Next
                            </button>
                        </div>
                    )}
                    {resumes.length >= maxResumes && (
                        <div className="bg-[#FCFCFD] border border-[#CACACA80] mt-[30px] flex items-center flex-row rounded-[5px] p-5 justify-between">
                            <div className="flex items-center gap-[18px]">
                                <div className="">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M9.75 8.75V13.75M9.75 18.75C8.5681 18.75 7.39778 18.5172 6.30585 18.0649C5.21392 17.6126 4.22177 16.9497 3.38604 16.114C2.55031 15.2782 1.88738 14.2861 1.43508 13.1942C0.982792 12.1022 0.75 10.9319 0.75 9.75C0.75 8.5681 0.982792 7.39778 1.43508 6.30585C1.88738 5.21392 2.55031 4.22177 3.38604 3.38604C4.22177 2.55031 5.21392 1.88738 6.30585 1.43508C7.39778 0.982792 8.5681 0.75 9.75 0.75C12.1369 0.75 14.4261 1.69821 16.114 3.38604C17.8018 5.07387 18.75 7.36305 18.75 9.75C18.75 12.1369 17.8018 14.4261 16.114 16.114C14.4261 17.8018 12.1369 18.75 9.75 18.75ZM9.8 5.75V5.85H9.7V5.75H9.8Z" stroke="#0456FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <div className="text-sm">
                                    <p className="font-normal text-[14px] leading-[140%] text-[#000024]">You've reached the maximum limit of {maxResumes} resumes.</p>
                                    <p className="font-normal text-[14px] leading-[140%] text-[#000024]">Delete a resume or extend your limit to create more.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5 w-full sm:w-auto">
                                <Link href="/extend-resume-limit" className="flex items-center gap-[10px] border border-[#0456FF] bg-[#0456FF] py-[11px] px-[26px] rounded-[5px] font-semibold text-[14px] leading-none text-white cursor-pointer hover:bg-transparent hover:text-[#0456FF] transition-colors duration-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="12" viewBox="0 0 13 12" fill="none">
                                        <path d="M0.583496 3.49998L1.34416 4.1084C1.60916 4.32035 1.9172 4.47196 2.24681 4.55264C2.57641 4.63332 2.91965 4.64114 3.25259 4.57555C3.58553 4.50997 3.90015 4.37255 4.17453 4.17288C4.44891 3.97322 4.67644 3.71611 4.84125 3.41948L6.41683 0.583313L7.99241 3.41948C8.15726 3.71615 8.38485 3.97329 8.6593 4.17296C8.93375 4.37263 9.24845 4.51002 9.58146 4.57556C9.91447 4.64109 10.2578 4.63319 10.5874 4.55241C10.9171 4.47162 11.2251 4.3199 11.4901 4.10781L12.2502 3.49998L11.227 8.61581C11.1825 8.83914 11.0875 9.04932 10.9493 9.2303C10.8111 9.41128 10.6333 9.55825 10.4296 9.65998C9.18368 10.283 7.80982 10.6074 6.41683 10.6074C5.02383 10.6074 3.64997 10.283 2.40408 9.65998C2.20035 9.55825 2.02258 9.41128 1.88437 9.2303C1.74616 9.04932 1.65117 8.83914 1.60666 8.61581L0.583496 3.49998Z" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    Extend Limit
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
                <div className="w-[325px] shrink-0 flex flex-col gap-y-5 max-[1300px]:w-full min-[1025px]:max-[1300px]:flex-row min-[1025px]:max-[1300px]:gap-[20px]">
                    <PlanDetails />
                </div>
                {previewModal.open && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6" onClick={closePreview}>
                        <div className="bg-white rounded-[10px] w-full max-w-[850px] max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-center p-4 border-b border-[#0456FF26]">
                                <h4 className="font-bold text-[16px]">{previewModal.resumeName}</h4>
                                <button onClick={closePreview} className="text-[#00002480] cursor-pointer hover:text-black text-xl leading-none">×</button>
                            </div>
                            <div className="flex-1">
                                <iframe srcDoc={previewModal.html} className="w-full" style={{ height: "80vh", border: "none" }} title="Resume Preview" />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}