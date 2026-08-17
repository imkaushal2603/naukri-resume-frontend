"use client";

import { useEffect, useState, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/services/api";
import { useResume } from "@/context/ResumeContext";
import { useResumeId } from "@/hooks/useResumeId";
import ProgressPanel from "@/components/dashboard/ProgressPanel";
import Loader from "@/components/ui/Loader";

function withMinDelay<T>(promise: Promise<T>, ms = 1000): Promise<T> {
    return Promise.all([
        promise,
        new Promise((resolve) => setTimeout(resolve, ms)),
    ]).then(([result]) => result as T);
}

interface Skill {
    id: number;
    name: string;
    level?: string;
}

export default function SkillsPage() {
    const router = useRouter();
    const resumeId = useResumeId();
    const { refreshProgress } = useResume();
    const [skills, setSkills] = useState<Skill[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const fetchSkills = async () => {
        try {
            const res = await withMinDelay(api.get(`/resume/builder/${resumeId}/skills`));
            if (res.data?.success) {
                setSkills(res.data.skills || []);
            }
        } catch (err) {
            console.error("Failed to load skills", err);
            toast.error("Failed to load skills.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!resumeId) return;
        fetchSkills();
    }, [resumeId]);

    const handleAdd = async () => {
        const name = input.trim();
        if (!name) return;

        const isDuplicate = skills.some(
            (s) => s.name.toLowerCase() === name.toLowerCase()
        );

        if (isDuplicate) {
            toast.error("This skill has already been added.");
            return;
        }

        setAdding(true);
        try {
            await api.post(`/resume/builder/${resumeId}/skills`, { name });
            toast.success("Skill added successfully!");
            setInput("");
            await fetchSkills();
            await refreshProgress();
        } catch (err: any) {
            console.error("Failed to add skill", err);
            toast.error(err.response?.data?.message || "Failed to add skill.");
        } finally {
            setAdding(false);
        }
    };

    const handleRemove = async (id: number) => {
        setDeletingId(id);
        try {
            await api.delete(`/resume/builder/${resumeId}/skills/${id}`);
            toast.success("Skill removed.");
            setSkills((prev) => prev.filter((skill) => skill.id !== id));
            await refreshProgress();
        } catch (err) {
            console.error("Failed to remove skill", err);
            toast.error("Failed to remove skill.");
        } finally {
            setDeletingId(null);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAdd();
        }
    };

    const handleNext = () => {
        router.push(`/templates/resume-builder/summary?resumeId=${resumeId}`);
    };

    const handlePrevious = () => {
        router.push(`/templates/resume-builder/experience?resumeId=${resumeId}`);
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
                <div className="border border-[#0456FF26] rounded-[10px] p-5">
                    <h4 className="font-bold text-[20px] leading-none text-black mb-[15px]">
                        Skills
                    </h4>
                    <p className="font-normal text-[15px] leading-[140%] text-[#00002480] inline-block mb-[30px]">
                        Add your skills to showcase your expertise.
                    </p>

                    <label
                        htmlFor="skill-input"
                        className="font-bold text-[12px] leading-none text-[#000024] mb-[8px] block"
                    >
                        Add Skill
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3 mb-6">
                        <input
                            id="skill-input"
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="E.g. React.js, Project Management, SQL"
                            className="w-full border border-[#0456FF26] rounded-[6px] py-[12px] px-[20px] text-[14px] leading-none text-black font-bold outline-none focus:border-[#0456FF] transition-colors"
                        />
                        <button
                            onClick={handleAdd}
                            disabled={adding || !input.trim()}
                            className="border border-[#0456FF] bg-white py-[11px] px-[26px] rounded-[5px] font-semibold text-[14px] leading-none text-[#0456FF] cursor-pointer hover:bg-[#0456FF] hover:text-white transition-colors duration-300 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap"
                        >
                            {adding ? "Adding..." : "+ Add Skill"}
                        </button>
                    </div>

                    <p className="font-bold text-[12px] leading-none text-[#000024] mb-[12px] block">
                        Your Skills ({skills.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {skills.length === 0 && (
                            <p className="text-sm text-[#00002480]">No skills added yet.</p>
                        )}
                        {skills.map((skill) => (
                            <span
                                key={skill.id}
                                className={`bg-[#0456FF26] rounded-[4px] px-[10px] py-[6px] flex items-center gap-[6px] uppercase font-semibold text-[13px] leading-none text-[#000024CC] transition-opacity ${deletingId === skill.id ? "opacity-40" : "opacity-100"
                                    }`}
                            >
                                {skill.name}
                                <button
                                    type="button"
                                    onClick={() => handleRemove(skill.id)}
                                    disabled={deletingId === skill.id}
                                    aria-label={`Remove ${skill.name}`}
                                    className="font-semibold text-[16px] leading-none text-[#000024CC] hover:text-red-600 cursor-pointer transition-colors"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
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
                        onClick={handleNext}
                        className="flex gap-[10px] items-center border border-[#0456FF] bg-[#0456FF] py-[11px] px-[26px] rounded-[5px] font-semibold text-[14px] leading-none text-white cursor-pointer hover:bg-transparent hover:text-[#0456FF] transition-colors duration-300"
                    >
                        Next
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