"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
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
    name?: string;
    createdAt?: string;
    updatedAt?: string;
    resume_templates?: {
        id: number;
        name: string;
        templateKey: string;
        preview?: string;
    };
}

export default function MyResumes() {
    const router = useRouter();
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [creating, setCreating] = useState<boolean>(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    const fetchResumes = async () => {
        try {
            setLoading(true);
            const res = await withMinDelay(api.get("/resume"));
            if (res.data.success) {
                setResumes(res.data.resumes || res.data.data || []);
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

    const handleCreateNewResume = async () => {
        setCreating(true);
        try {
            const res = await api.post("/resume/builder", {});
            if (res.data.success && res.data.resume?.id) {
                router.push(`/templates/resume-builder/basic-info?resumeId=${res.data.resume.id}`);
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

    const handleEdit = (resumeId: number) => {
        router.push(`/templates/resume-builder/basic-info?resumeId=${resumeId}`);
    };

    const handleDelete = async (resumeId: number) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this resume?");
        if (!confirmDelete) return;

        setDeletingId(resumeId);
        try {
            const res = await api.delete(`/resume/builder/${resumeId}`);
            if (res.data.success) {
                setResumes((prev) => prev.filter((r) => r.id !== resumeId));
            }
        } catch (err) {
            console.error("Failed to delete resume", err);
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-black">My Resumes</h2>
                    <p className="text-sm text-[#00002480]">
                        Manage, edit, or delete your existing resume drafts.
                    </p>
                </div>
                <button onClick={handleCreateNewResume}
                    disabled={creating}
                    className="bg-[#0456FF] text-white px-4 py-2 rounded-[6px] font-semibold text-sm hover:bg-[#0344cc] transition-colors"
                >
                    + Create New Resume
                </button>
            </div>

            {resumes.length === 0 ? (
                <div className="border-2 border-dashed border-[#0456FF26] rounded-[12px] p-10 text-center">
                    <p className="text-gray-500 mb-4">You haven't created any resumes yet.</p>
                    <button
                        onClick={() => router.push("/templates")}
                        className="bg-[#0456FF] text-white px-5 py-2.5 rounded-[6px] font-semibold text-sm"
                    >
                        Browse Templates
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {resumes.map((resume) => {
                        console.log(resume)
                        const previewPath = resume.resume_templates?.preview;
                        const isDeleting = deletingId === resume.id;

                        return (
                            <div
                                key={resume.id}
                                className="group relative border border-[#0456FF26] rounded-[8px] p-4 flex flex-col justify-between hover:shadow-lg transition-all duration-200 bg-white"
                            >
                                <div className="relative w-full h-[260px] bg-gray-50 rounded-[6px] overflow-hidden mb-3 border border-gray-100">
                                    {previewPath ? (
                                        <Image
                                            src={`${backendUrl}${previewPath}`}
                                            alt={resume.name || "Resume Preview"}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, 25vw"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                                            No preview available
                                        </div>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <h4 className="font-semibold text-base text-black truncate">
                                        {resume?.name || `Resume #${resume.id}`}
                                    </h4>
                                    {resume.updatedAt && (
                                        <p className="text-xs text-gray-400 mt-1">
                                            Updated {new Date(resume.updatedAt).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleEdit(resume.id)}
                                        className="flex-1 bg-[#0456FF] text-white py-2 rounded-[6px] font-medium text-xs hover:bg-[#0344cc] transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        disabled={isDeleting}
                                        onClick={() => handleDelete(resume.id)}
                                        className="px-3 py-2 border border-red-200 text-red-600 rounded-[6px] font-medium text-xs hover:bg-red-50 disabled:opacity-50 transition-colors"
                                    >
                                        {isDeleting ? "..." : "Delete"}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}