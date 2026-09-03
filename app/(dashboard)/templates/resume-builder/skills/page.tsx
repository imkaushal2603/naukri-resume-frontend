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
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);
    const [detectedRole, setDetectedRole] = useState<string | null>(null);

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

    const fetchSuggestions = async () => {
        if (!resumeId) return;
        setSuggestionsLoading(true);
        try {
            const excludeParam = suggestions.length > 0 ? `?exclude=${encodeURIComponent(suggestions.join(","))}` : "";
            const res = await api.get(`/resume/builder/${resumeId}/skills/suggestions${excludeParam}`);

            if (res.data.success) {
                setSuggestions(res.data.suggestions || []);
                setDetectedRole(res.data.role);
            }
        } catch (err) {
            console.error("Failed to load skill suggestions", err);
        } finally {
            setSuggestionsLoading(false);
        }
    };

    useEffect(() => {
        if (!resumeId) return;
        fetchSkills();
        fetchSuggestions();
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

    const handleAddSuggestedSkill = async (skillName: string) => {
        if (!resumeId) return;

        const isDuplicate = skills.some(
            (s) => s.name.toLowerCase() === skillName.toLowerCase()
        );
        if (isDuplicate) {
            toast.error("This skill has already been added.");
            return;
        }

        try {
            await api.post(`/resume/builder/${resumeId}/skills`, { name: skillName });
            toast.success(`Added "${skillName}"`);
            setSuggestions((prev) => prev.filter((s) => s !== skillName));
            await fetchSkills();
            await refreshProgress();
        } catch (err: any) {
            console.error("Failed to add suggested skill", err);
            toast.error(err.response?.data?.message || "Failed to add skill.");
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

    // if (loading) {
    //     return <Loader />;
    // }

    return (
        <div className="relative">
            {loading && <Loader overlay />}
            <div className="flex flex-wrap gap-6">
                <div className="flex-1">
                    <div className="border border-[#0456FF26] rounded-[10px] p-5">
                        <h4 className="font-bold text-[20px] leading-none text-black mb-[15px]">Skills</h4>
                        <p className="font-normal text-[15px] leading-[140%] text-[#00002480] inline-block mb-[30px]">Add your skills to showcase your expertise.</p>
                        <label htmlFor="skill-input" className="font-bold text-[12px] leading-none text-[#000024] mb-[8px] block">Add Skill</label>
                        <div className="flex flex-col sm:flex-row gap-3 mb-6">
                            <input id="skill-input" type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="E.g. React.js, Project Management, SQL"
                                className="w-full border border-[#0456FF26] rounded-[6px] py-[12px] px-[20px] text-[14px] leading-none text-black font-bold outline-none focus:border-[#0456FF] transition-colors"
                            />
                            <button onClick={handleAdd} disabled={adding || !input.trim()}
                                className="border border-[#0456FF] bg-white py-[11px] px-[26px] rounded-[5px] font-semibold text-[14px] leading-none text-[#0456FF] cursor-pointer hover:bg-[#0456FF] hover:text-white transition-colors duration-300 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap"
                            >
                                {adding ? "Adding..." : "+ Add Skill"}
                            </button>
                        </div>
                        <p className="font-bold text-[12px] leading-none text-[#000024] mb-[12px] block">Your Skills ({skills.length})</p>
                        <div className="flex flex-wrap gap-2">
                            {skills.length === 0 && (
                                <p className="text-sm text-[#00002480]">No skills added yet.</p>
                            )}
                            {skills.map((skill) => (
                                <span key={skill.id}
                                    className={`bg-[#0456FF26] rounded-[4px] px-[10px] py-[6px] flex items-center gap-[6px] uppercase font-semibold text-[13px] leading-none text-[#000024CC] transition-opacity ${deletingId === skill.id ? "opacity-40" : "opacity-100"}`}
                                >
                                    {skill.name}
                                    <button type="button" onClick={() => handleRemove(skill.id)} disabled={deletingId === skill.id} aria-label={`Remove ${skill.name}`}
                                        className="font-semibold text-[16px] leading-none text-[#000024CC] hover:text-red-600 cursor-pointer transition-colors"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-[10px] justify-between my-[30px] pt-[42px] border-t border-[#0456FF26]">
                        <button type="button" onClick={handlePrevious}
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
                        <button type="button" onClick={handleNext}
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
                <div className="w-[325px] shrink-0 flex flex-col gap-y-5 max-[1300px]:w-full">
                    {(suggestionsLoading || suggestions.length > 0) && (
                        <div className="w-full bg-white border border-[#CACACA80] rounded-[12px] p-5">
                            <div className="flex items-center gap-[8px] mb-[13px]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                                    <circle cx="16" cy="16" r="16" fill="#0456FF" fillOpacity="0.15" />
                                    <path d="M14.3775 10.8092C14.6342 10.0575 15.6975 10.0575 15.9542 10.8092L16.6258 12.7758C16.8314 13.3784 17.1724 13.9259 17.6225 14.3761C18.0727 14.8264 18.62 15.1675 19.2225 15.3733L21.1892 16.045C21.9417 16.3017 21.9417 17.365 21.1892 17.6217L19.2225 18.2933C18.6201 18.499 18.0728 18.84 17.6227 19.2902C17.1725 19.7403 16.8315 20.2876 16.6258 20.89L15.9542 22.8567C15.6975 23.6092 14.6342 23.6092 14.3775 22.8567L13.7058 20.89C13.5001 20.2876 13.1591 19.7403 12.709 19.2902C12.2589 18.84 11.7116 18.499 11.1092 18.2933L9.1425 17.6217C8.39 17.365 8.39 16.3017 9.1425 16.045L11.1092 15.3733C11.7116 15.1676 12.2589 14.8266 12.709 14.3765C13.1591 13.9264 13.5001 13.3791 13.7058 12.7767L14.3775 10.8092ZM21.8325 8.5L22.2575 9.74167L23.4992 10.1667L22.2575 10.5917L21.8325 11.8333L21.4075 10.5917L20.1658 10.1667L21.4075 9.74167L21.8325 8.5Z" stroke="#0456FF" strokeWidth="1.66667" strokeLinejoin="round" />
                                </svg>
                                <h5 className="font-bold text-[16px] text-[#000024] leading-[120%]">Ai Skills Suggestions</h5>
                                <span className="text-[#0456FF] bg-[#0456FF26] rounded-[2px] font-bold text-[12px] leading-[100%] py-[4px] px-[8px] inline-block">Beta</span>
                            </div>
                            <p className="font-normal text-[12px] leading-[120%] text-[#00002499] mb-[10px]">
                                {detectedRole
                                    ? `Skills recommended for a ${detectedRole} role.`
                                    : "Based on your experience, we've suggested some relevant skills."}
                            </p>
                            {suggestionsLoading ? (
                                <div className="flex gap-[10px] flex-wrap">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <div key={i} className="h-9 w-24 bg-[#0456FF1A] rounded-[6px] animate-pulse" />
                                    ))}
                                </div>
                            ) : (
                                <div>
                                    {suggestions.map((skill) => (
                                        <button key={skill} type="button" onClick={() => handleAddSuggestedSkill(skill)}
                                            className="flex items-center justify-between w-full border-b border-[#0456FF26] py-[10px] cursor-pointer font-medium text-[12px] leading-[100%] text-[#000024CC]"
                                        >
                                            {skill}
                                            <span className="text-[16px] leading-none font-bold">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                                    <path d="M4.21875 6.71875H6.71875M6.71875 6.71875H9.21875M6.71875 6.71875V4.21875M6.71875 6.71875V9.21875M6.71875 12.9688C10.1706 12.9688 12.9688 10.1706 12.9688 6.71875C12.9688 3.26688 10.1706 0.46875 6.71875 0.46875C3.26688 0.46875 0.46875 3.26688 0.46875 6.71875C0.46875 10.1706 3.26688 12.9688 6.71875 12.9688Z" stroke="#0456FF" strokeWidth="0.9375" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                            <button onClick={fetchSuggestions} disabled={suggestionsLoading}
                                className="flex gap-[10px] items-center w-full justify-center mt-[20px] border border-[#0456FF] bg-white py-[11px] px-[26px] rounded-[5px] font-semibold text-[14px] leading-none text-[#0456FF] cursor-pointer hover:bg-[#0456FF] hover:text-white transition-colors duration-300"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
                                    <path d="M13.875 4.5C12.831 2.11575 10.2577 0.75 7.4835 0.75C3.97425 0.75 1.08975 3.414 0.75 6.825" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M10.8668 4.80005H13.8442C13.8975 4.80015 13.9502 4.78974 13.9995 4.76944C14.0487 4.74913 14.0934 4.71931 14.1311 4.68169C14.1688 4.64407 14.1987 4.59939 14.2191 4.55021C14.2395 4.50102 14.25 4.4483 14.25 4.39505V1.42505M1.125 10.5C2.169 12.8843 4.74225 14.25 7.5165 14.25C11.0258 14.25 13.9102 11.586 14.25 8.17505" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M4.13325 10.2H1.15575C1.1025 10.1999 1.04976 10.2103 1.00053 10.2306C0.951309 10.2509 0.906574 10.2807 0.868887 10.3183C0.8312 10.3559 0.8013 10.4006 0.7809 10.4498C0.7605 10.499 0.75 10.5517 0.75 10.605V13.575" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Refresh Suggestions
                            </button>
                        </div>
                    )}
                    <ProgressPanel />
                </div>
            </div>
        </div>
    );
}