"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/services/api";
import { useResume } from "@/context/ResumeContext";
import { useResumeId } from "@/hooks/useResumeId";
import ProgressPanel from "@/components/dashboard/ProgressPanel";
import Loader from "@/components/ui/Loader";

function withMinDelay<T>(promise: Promise<T>, ms: number = 1000): Promise<T> {
    return Promise.all([
        promise,
        new Promise((resolve) => setTimeout(resolve, ms)),
    ]).then(([result]) => result as T);
}

interface Experience {
    id?: number;
    company: string;
    role: string;
    location: string;
    employmentType: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    description: string;
}

const emptyForm: Experience = {
    company: "",
    role: "",
    location: "",
    employmentType: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
    description: "",
};

const EMPLOYMENT_TYPES = [
    "Full-time",
    "Part-time",
    "Self-employed",
    "Freelance",
    "Internship",
    "Contract",
    "Apprenticeship",
];

export default function ExperiencePage() {
    const router = useRouter();
    const resumeId = useResumeId();
    const { refreshProgress } = useResume();
    const [list, setList] = useState<Experience[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | "new" | null>(null);
    const [form, setForm] = useState<Experience>(emptyForm);
    const [saving, setSaving] = useState(false);

    const fetchList = async () => {
        try {
            const res = await withMinDelay(api.get(`/resume/builder/${resumeId}/experience`));
            if (res.data?.success) setList(res.data.experience || []);
        } catch (err) {
            console.error("Failed to load experience", err);
            toast.error("Failed to load experience.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!resumeId) return;
        fetchList();
    }, [resumeId]);

    const handleChange = (field: keyof Experience, value: unknown) => {
        setForm((prev) => {
            const updated = { ...prev, [field]: value };
            if (field === "isCurrent" && value === true) {
                updated.endDate = "";
            }
            return updated;
        });
    };

    const openAdd = () => {
        setForm(emptyForm);
        setEditingId("new");
    };

    const openEdit = (exp: Experience) => {
        setForm({
            ...exp,
            employmentType: exp.employmentType || "",
            startDate: exp.startDate ? exp.startDate.slice(0, 10) : "",
            endDate: exp.endDate ? exp.endDate.slice(0, 10) : "",
        });
        setEditingId(exp.id ?? null);
    };

    const closeForm = () => {
        setEditingId(null);
        setForm(emptyForm);
    };

    const handleSave = async () => {
        if (!form.role.trim() || !form.company.trim()) {
            toast.error("Please fill in Job Title and Company Name.");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                ...form,
                endDate: form.isCurrent ? "" : form.endDate,
            };

            if (editingId && editingId !== "new") {
                await api.put(`/resume/builder/${resumeId}/experience/${editingId}`, payload);
                toast.success("Experience updated successfully!");
            } else {
                await api.post(`/resume/builder/${resumeId}/experience`, payload);
                toast.success("Experience added successfully!");
            }
            closeForm();
            await fetchList();
            await refreshProgress();
        } catch (err: any) {
            console.error("Failed to save experience", err);
            toast.error(err.response?.data?.message || "Failed to save experience.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id?: number) => {
        if (!id) return;
        try {
            await api.delete(`/resume/builder/${resumeId}/experience/${id}`);
            toast.success("Experience removed.");
            await fetchList();
            await refreshProgress();
        } catch (err) {
            console.error("Failed to delete experience", err);
            toast.error("Failed to delete experience.");
        }
    };

    const handleNext = () => {
        router.push(`/templates/resume-builder/skills?resumeId=${resumeId}`);
    };

    const handlePrevious = () => {
        router.push(`/templates/resume-builder/education?resumeId=${resumeId}`);
    };

    const renderForm = () => (
        <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[27px] mb-4">
                <div>
                    <label className="font-bold text-[12px] leading-none text-[#000024] mb-[8px] inline-block">
                        Job Title *
                    </label>
                    <input
                        type="text"
                        value={form.role}
                        onChange={(e) => handleChange("role", e.target.value)}
                        className="w-full border border-[#0456FF26] rounded-[6px] py-[12px] px-[20px] text-[14px] leading-none text-black font-bold outline-none focus:border-[#0456FF]"
                    />
                </div>
                <div>
                    <label className="font-bold text-[12px] leading-none text-[#000024] mb-[8px] inline-block">
                        Company Name *
                    </label>
                    <input
                        type="text"
                        value={form.company}
                        onChange={(e) => handleChange("company", e.target.value)}
                        className="w-full border border-[#0456FF26] rounded-[6px] py-[12px] px-[20px] text-[14px] leading-none text-black font-bold outline-none focus:border-[#0456FF]"
                    />
                </div>
                <div>
                    <label className="font-bold text-[12px] leading-none text-[#000024] mb-[8px] inline-block">
                        Employment Type
                    </label>
                    <select
                        value={form.employmentType}
                        onChange={(e) => handleChange("employmentType", e.target.value)}
                        className="w-full border border-[#0456FF26] rounded-[6px] py-[12px] px-[20px] text-[14px] leading-none text-black font-bold outline-none focus:border-[#0456FF]"
                    >
                        <option value="">Select type</option>
                        {EMPLOYMENT_TYPES.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-[27px] mb-4">
                <div>
                    <label className="font-bold text-[12px] leading-none text-[#000024] mb-[8px] inline-block">
                        Start Date
                    </label>
                    <input
                        type="date"
                        value={form.startDate}
                        onChange={(e) => handleChange("startDate", e.target.value)}
                        className="w-full border border-[#0456FF26] rounded-[6px] py-[12px] px-[20px] text-[14px] leading-none text-black font-bold outline-none focus:border-[#0456FF]"
                    />
                </div>
                <div>
                    <label className="font-bold text-[12px] leading-none text-[#000024] mb-[8px] inline-block">
                        End Date
                    </label>
                    <input
                        type="date"
                        value={form.endDate}
                        onChange={(e) => handleChange("endDate", e.target.value)}
                        disabled={form.isCurrent}
                        className="w-full border border-[#0456FF26] rounded-[6px] py-[12px] px-[20px] text-[14px] leading-none text-black font-bold disabled:bg-gray-100 disabled:cursor-not-allowed outline-none focus:border-[#0456FF]"
                    />
                </div>
                <div>
                    <label className="font-bold text-[12px] leading-none text-[#000024] mb-[8px] inline-block">
                        Location
                    </label>
                    <input
                        type="text"
                        value={form.location}
                        onChange={(e) => handleChange("location", e.target.value)}
                        className="w-full border border-[#0456FF26] rounded-[6px] py-[12px] px-[20px] text-[14px] leading-none text-black font-bold outline-none focus:border-[#0456FF]"
                    />
                </div>
            </div>

            <div className="flex items-end pb-[12px]">
                <label className="flex items-center gap-2 text-[13px] font-semibold cursor-pointer w-fit select-none">
                    <input
                        className="w-[18px] h-[18px] accent-[#0456FF]"
                        type="checkbox"
                        checked={form.isCurrent}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            handleChange("isCurrent", e.target.checked)
                        }
                    />
                    I currently work here
                </label>
            </div>

            <div className="mb-[30px]">
                <label className="font-bold text-[12px] leading-none text-[#000024] mb-[8px] inline-block">
                    Description
                </label>
                <textarea
                    value={form.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    rows={4}
                    maxLength={1000}
                    className="w-full border border-[#0456FF26] rounded-[6px] py-[12px] px-[20px] text-[14px] leading-[140%] text-black font-bold outline-none focus:border-[#0456FF]"
                />
                <p className="text-[11px] text-[#00002480] text-right mt-1">
                    {form.description?.length || 0} / 1000 characters
                </p>
            </div>

            <div className="flex gap-3 flex-wrap justify-between items-center">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex gap-[10px] items-center border border-[#0456FF] bg-[#0456FF] py-[11px] px-[26px] rounded-[5px] font-semibold text-[14px] leading-none text-white cursor-pointer hover:bg-transparent hover:text-[#0456FF] transition-colors duration-300 disabled:opacity-50"
                >
                    {saving ? "Saving..." : "Save Experience"}
                </button>
                <button
                    onClick={closeForm}
                    className="inline-block border border-[#0456FF] bg-white py-[11px] px-[26px] rounded-[5px] font-semibold text-[14px] leading-none text-[#0456FF] cursor-pointer hover:bg-[#0456FF] hover:text-white transition-colors duration-300"
                >
                    Cancel
                </button>
            </div>
        </div>
    );

    if (loading) return <Loader />;

    return (
        <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
                <div className="flex justify-between items-start gap-[20px] mb-[45px]">
                    <div>
                        <h4 className="font-bold text-[20px] leading-none text-black mb-[15px]">
                            Experience
                        </h4>
                        <p className="font-normal text-[15px] leading-[140%] text-[#00002480]">
                            Add your work experience. Start with your latest experience.
                        </p>
                    </div>
                    <button
                        onClick={openAdd}
                        className="flex gap-[10px] items-center border border-[#0456FF] bg-white py-[11px] px-[26px] rounded-[5px] font-semibold text-[14px] leading-none text-[#0456FF] cursor-pointer hover:bg-[#0456FF] hover:text-white transition-colors duration-300 shrink-0"
                    >
                        + Add Experience
                    </button>
                </div>

                {list.length === 0 && editingId !== "new" && (
                    <p className="text-sm text-[#00002480] mb-4">No experience added yet.</p>
                )}

                <div className="space-y-4">
                    {list.map((exp, i) => (
                        <div key={exp.id ?? i} className="border border-[#0456FF26] rounded-[10px]">
                            <div className="border-b border-[#0456FF26] p-5 flex flex-wrap items-center justify-between">
                                <div className="flex flex-wrap gap-[10px] items-center">
                                    <span className="bg-[#0456FF26] font-bold text-[12px] leading-none text-[#0456FF] w-[30px] h-[30px] flex justify-center items-center rounded-full">
                                        {String(i + 1).padStart(2, "0")}
                                    </span>
                                    <p className="font-bold text-[12px] leading-none text-[#000024]">
                                        Experience {i + 1}
                                    </p>
                                </div>
                                <div className="flex items-center gap-[15px]">
                                    <button
                                        onClick={() => (editingId === exp.id ? closeForm() : openEdit(exp))}
                                        className="border border-[#00002433] px-2 py-1 text-xs font-semibold rounded-[4px] cursor-pointer hover:bg-gray-50"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(exp.id)}
                                        className="border border-red-200 text-red-600 px-2 py-1 text-xs font-semibold rounded-[4px] cursor-pointer hover:bg-red-50"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>

                            {editingId === exp.id ? (
                                renderForm()
                            ) : (
                                <div className="p-5 flex flex-col sm:flex-row gap-[20px]">
                                    <div className="w-[99px] h-[86px] bg-[#0456FF1A] rounded-[6px] flex items-center justify-center shrink-0">
                                        <span className="text-[#0456FF] font-bold text-xs">WORK</span>
                                    </div>
                                    <div className="flex-1 flex flex-col gap-y-[10px]">
                                        <div className="flex flex-wrap items-center gap-[10px]">
                                            <h6 className="font-bold text-[18px] leading-none text-black">
                                                {exp.role}
                                            </h6>
                                            {exp.employmentType && (
                                                <span className="bg-[#0456FF26] text-[#0456FF] font-semibold text-[11px] leading-none px-[10px] py-[5px] rounded-full">
                                                    {exp.employmentType}
                                                </span>
                                            )}
                                        </div>
                                        <p className="font-normal text-[15px] leading-none text-black">
                                            {exp.company} {exp.location && `- ${exp.location}`}
                                        </p>
                                        <p className="font-normal text-[15px] leading-none text-black">
                                            {exp.startDate?.slice(0, 7)} -{" "}
                                            {exp.isCurrent ? "Present" : exp.endDate?.slice(0, 7)}
                                        </p>
                                        {exp.description && (
                                            <p className="font-normal text-[14px] leading-[140%] text-black">
                                                {exp.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {editingId === "new" && (
                    <div className="border border-[#0456FF26] rounded-[10px] mt-[20px]">
                        {renderForm()}
                    </div>
                )}

                <div className="flex flex-wrap gap-[10px] justify-between my-[30px] pt-[42px] border-t border-[#0456FF26]">
                    <button
                        onClick={handlePrevious}
                        className="flex gap-[10px] items-center border border-[#0456FF] bg-white py-[11px] px-[26px] rounded-[5px] font-semibold text-[14px] leading-none text-[#0456FF] cursor-pointer hover:bg-[#0456FF] hover:text-white transition-colors duration-300"
                    >
                        Previous
                    </button>
                    <button
                        onClick={handleNext}
                        className="flex gap-[10px] items-center border border-[#0456FF] bg-[#0456FF] py-[11px] px-[26px] rounded-[5px] font-semibold text-[14px] leading-none text-white cursor-pointer hover:bg-transparent hover:text-[#0456FF] transition-colors duration-300"
                    >
                        Next
                    </button>
                </div>
            </div>

            <div className="w-[325px] shrink-0">
                <ProgressPanel />
            </div>
        </div>
    );
}