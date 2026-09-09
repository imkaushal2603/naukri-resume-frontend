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
    const [descSuggestions, setDescSuggestions] = useState<string[]>([]);
    const [selectedBullets, setSelectedBullets] = useState<Set<string>>(new Set());
    const [descSuggestionsLoading, setDescSuggestionsLoading] = useState(false);
    const [previousBullets, setPreviousBullets] = useState<string[]>([]);

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

    const fetchDescriptionSuggestions = async (excludeBullets: string[] = []) => {
        if (!resumeId || !form.role.trim()) return;
        setDescSuggestionsLoading(true);
        try {
            const res = await api.post(`/resume/builder/${resumeId}/experience/description-suggestions`, {
                role: form.role,
                company: form.company,
                employmentType: form.employmentType,
                excludeBullets,
            });
            if (res.data.success) {
                setDescSuggestions(res.data.bullets || []);
                setSelectedBullets(new Set());
            }
        } catch (err) {
            console.error("Failed to load description suggestions", err);
        } finally {
            setDescSuggestionsLoading(false);
        }
    };

    useEffect(() => {
        if (!resumeId) return;
        fetchList();
    }, [resumeId]);

    useEffect(() => {
        if (editingId !== null && form.role.trim()) {
            fetchDescriptionSuggestions();
        } else {
            setDescSuggestions([]);
        }
        setPreviousBullets([]);
    }, [editingId]);

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
            company: exp.company || "",
            role: exp.role || "",
            location: exp.location || "",
            employmentType: exp.employmentType || "",
            description: exp.description || "",
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

    const handleRoleBlur = () => {
        if (editingId !== null && form.role.trim()) {
            fetchDescriptionSuggestions();
        }
    };

    const handleAddBullet = (bullet: string) => {
        const bulletLine = `• ${bullet}`;
        const newDescription = form.description
            ? `${form.description}\n${bulletLine}`
            : bulletLine;

        handleChange("description", newDescription.slice(0, 1000));

        const remaining = descSuggestions.filter((b) => b !== bullet);
        const updatedPrevious = [...previousBullets, bullet];

        if (remaining.length === 0) {
            setDescSuggestionsLoading(true);
        }
        setDescSuggestions(remaining);
        setPreviousBullets(updatedPrevious);

        if (remaining.length === 0) {
            fetchDescriptionSuggestions([...updatedPrevious, ...remaining]);
        }
    };

    const handleRefreshSuggestions = () => {
        fetchDescriptionSuggestions([...previousBullets, ...descSuggestions]);
    };

    const handleNext = async () => {
        if (editingId !== null) {
            const hasAnyData = Object.entries(form).some(([key, val]) => {
                if (key === "id" || key === "isCurrent") return false;
                return typeof val === "string" && val.trim() !== "";
            });

            if (hasAnyData) {
                if (!form.role.trim() || !form.company.trim()) {
                    toast.error("Please fill in Job Title and Company Name before proceeding.");
                    return;
                }

                const payload = {
                    ...form,
                    endDate: form.isCurrent ? "" : form.endDate,
                };

                setSaving(true);
                try {
                    if (editingId !== "new") {
                        await api.put(`/resume/builder/${resumeId}/experience/${editingId}`, payload);
                        toast.success("Experience updated successfully!");
                    } else {
                        await api.post(`/resume/builder/${resumeId}/experience`, payload);
                        toast.success("Experience added successfully!");
                    }
                    await refreshProgress();
                } catch (err: any) {
                    console.error("Failed to auto-save experience on Next step", err);
                    toast.error(err.response?.data?.message || "Failed to save experience details.");
                    setSaving(false);
                    return;
                } finally {
                    setSaving(false);
                }
            }
        }

        router.push(`/templates/resume-builder/skills?resumeId=${resumeId}`);
    };

    const handlePrevious = () => {
        router.push(`/templates/resume-builder/education?resumeId=${resumeId}`);
    };

    const renderForm = () => (
        <div className="p-5">
            <div className="grid grid-cols-3 gap-[27px] mb-4 max-[768px]:grid-cols-1">
                <div>
                    <label className="font-bold text-[12px] leading-none text-[#000024] mb-[8px] inline-block">Job Title *</label>
                    <input type="text" value={form.role} onChange={(e) => handleChange("role", e.target.value)} onBlur={handleRoleBlur}
                        className="w-full border border-[#0456FF26] rounded-[6px] py-[12px] px-[20px] text-[14px] leading-none text-black font-bold outline-none focus:border-[#0456FF]"
                    />
                </div>
                <div>
                    <label className="font-bold text-[12px] leading-none text-[#000024] mb-[8px] inline-block">Company Name *</label>
                    <input type="text" value={form.company} onChange={(e) => handleChange("company", e.target.value)}
                        className="w-full border border-[#0456FF26] rounded-[6px] py-[12px] px-[20px] text-[14px] leading-none text-black font-bold outline-none focus:border-[#0456FF]"
                    />
                </div>
                <div>
                    <label className="font-bold text-[12px] leading-none text-[#000024] mb-[8px] inline-block">Employment Type</label>
                    <select value={form.employmentType} onChange={(e) => handleChange("employmentType", e.target.value)}
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
                    <label className="font-bold text-[12px] leading-none text-[#000024] mb-[8px] inline-block">Start Date</label>
                    <input type="date" value={form.startDate} onChange={(e) => handleChange("startDate", e.target.value)}
                        className="w-full border border-[#0456FF26] rounded-[6px] py-[12px] px-[20px] text-[14px] leading-none text-black font-bold outline-none focus:border-[#0456FF]"
                    />
                </div>
                <div>
                    <label className="font-bold text-[12px] leading-none text-[#000024] mb-[8px] inline-block">End Date</label>
                    <input type="date" value={form.endDate} onChange={(e) => handleChange("endDate", e.target.value)} disabled={form.isCurrent}
                        className="w-full border border-[#0456FF26] rounded-[6px] py-[12px] px-[20px] text-[14px] leading-none text-black font-bold disabled:bg-gray-100 disabled:cursor-not-allowed outline-none focus:border-[#0456FF]"
                    />
                </div>
                <div>
                    <label className="font-bold text-[12px] leading-none text-[#000024] mb-[8px] inline-block">Location</label>
                    <input type="text" value={form.location} onChange={(e) => handleChange("location", e.target.value)}
                        className="w-full border border-[#0456FF26] rounded-[6px] py-[12px] px-[20px] text-[14px] leading-none text-black font-bold outline-none focus:border-[#0456FF]"
                    />
                </div>
            </div>
            <div className="flex items-end pb-[12px]">
                <label className="flex items-center gap-2 text-[13px] font-semibold cursor-pointer w-fit select-none">
                    <input className="w-[18px] h-[18px] accent-[#0456FF]" type="checkbox" checked={form.isCurrent}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange("isCurrent", e.target.checked)} />
                    I currently work here
                </label>
            </div>
            <div className="mb-[30px]">
                <label className="font-bold text-[12px] leading-none text-[#000024] mb-[8px] inline-block">Description</label>
                <textarea value={form.description} onChange={(e) => handleChange("description", e.target.value)} rows={4} maxLength={1000}
                    className="w-full border border-[#0456FF26] rounded-[6px] py-[12px] px-[20px] text-[14px] leading-[140%] text-black font-bold outline-none focus:border-[#0456FF]"
                />
                <p className="text-[11px] text-[#00002480] text-right mt-1">{form.description?.length || 0} / 1000 characters</p>
            </div>
            <div className="flex gap-3 flex-wrap justify-between items-center">
                <button onClick={handleSave} disabled={saving}
                    className="flex gap-[10px] items-center border border-[#0456FF] bg-[#0456FF] py-[11px] px-[26px] rounded-[5px] font-semibold text-[14px] leading-none text-white cursor-pointer hover:bg-transparent hover:text-[#0456FF] transition-colors duration-300 disabled:opacity-50"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 18 18" fill="none">
                        <path d="M11.675 1C12.1366 1.00657 12.5769 1.19527 12.9 1.525L16.225 4.85C16.5547 5.1731 16.7434 5.6134 16.75 6.075V15C16.75 15.4641 16.5656 15.9092 16.2374 16.2374C15.9092 16.5656 15.4641 16.75 15 16.75H2.75C2.28587 16.75 1.84075 16.5656 1.51256 16.2374C1.18437 15.9092 1 15.4641 1 15V2.75C1 2.28587 1.18437 1.84075 1.51256 1.51256C1.84075 1.18437 2.28587 1 2.75 1H11.675Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M13.25 16.75V10.625C13.25 10.3929 13.1578 10.1704 12.9937 10.0063C12.8296 9.84219 12.6071 9.75 12.375 9.75H5.375C5.14294 9.75 4.92038 9.84219 4.75628 10.0063C4.59219 10.1704 4.5 10.3929 4.5 10.625V16.75M4.5 1V4.5C4.5 4.73206 4.59219 4.95462 4.75628 5.11872C4.92038 5.28281 5.14294 5.375 5.375 5.375H11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {saving ? "Saving..." : "Save Experience"}
                </button>
                <button onClick={closeForm}
                    className="inline-block border border-[#0456FF] bg-white py-[11px] px-[26px] rounded-[5px] font-semibold text-[14px] leading-none text-[#0456FF] cursor-pointer hover:bg-[#0456FF] hover:text-white transition-colors duration-300"
                >
                    Cancel
                </button>
            </div>
        </div>
    );

    // if (loading) return <Loader />;

    return (
        <div className="relative">
            {loading && <Loader overlay />}
            <div className="flex flex-wrap gap-6">
                <div className="flex-1">
                    <div className="flex flex-wrap justify-between items-start gap-[20px] mb-[45px]">
                        <div className="max-[768px]:w-full">
                            <h4 className="font-bold text-[20px] leading-none text-black mb-[15px]">Experience</h4>
                            <p className="font-normal text-[15px] leading-[140%] text-[#00002480]">Add your work experience. Start with your latest experience.</p>
                        </div>
                        <button onClick={openAdd}
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
                                        <p className="font-bold text-[12px] leading-none text-[#000024]">Experience {i + 1}</p>
                                    </div>
                                    <div className="flex items-center gap-[15px]">
                                        <button onClick={() => (editingId === exp.id ? closeForm() : openEdit(exp))}
                                            className="border border-[#00002433] w-[30px] h-[28px] flex justify-center items-center rounded-[4px] cursor-pointer"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                <path d="M1.70782 13.6626H2.92465L11.2716 5.31561L10.0548 4.09878L1.70782 12.4458V13.6626ZM0 15.3704V11.7413L11.2716 0.491C11.4424 0.334449 11.6311 0.213478 11.8378 0.128087C12.0444 0.0426957 12.2613 0 12.4885 0C12.7156 0 12.9362 0.0426957 13.1503 0.128087C13.3643 0.213478 13.5493 0.341565 13.7053 0.512347L14.8794 1.70783C15.0502 1.86438 15.1749 2.04939 15.2534 2.26287C15.332 2.47635 15.371 2.68982 15.3704 2.9033C15.3704 3.13101 15.3314 3.34819 15.2534 3.55484C15.1754 3.76149 15.0508 3.94991 14.8794 4.12013L3.62913 15.3704H0ZM10.6526 4.71787L10.0548 4.09878L11.2716 5.31561L10.6526 4.71787Z" fill="#000024" fillOpacity="0.8" />
                                            </svg>
                                        </button>
                                        <button onClick={() => handleDelete(exp.id)}
                                            className="border border-[#00002433] w-[30px] h-[28px] flex justify-center items-center rounded-[4px] cursor-pointer"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="13" viewBox="0 0 12 13" fill="none">
                                                <path d="M9.77083 3.9375V10.7042C9.77083 11.0755 9.62333 11.4316 9.36078 11.6941C9.09823 11.9567 8.74214 12.1042 8.37083 12.1042H3.00417C2.63286 12.1042 2.27677 11.9567 2.01422 11.6941C1.75167 11.4316 1.60417 11.0755 1.60417 10.7042V3.9375M8.02083 2.1875V1.1375C8.02083 0.7525 7.70583 0.4375 7.32083 0.4375H4.05417C3.66917 0.4375 3.35417 0.7525 3.35417 1.1375V2.1875M8.02083 2.1875H3.35417M8.02083 2.1875H10.9375M3.35417 2.1875H0.4375M5.6875 5.6875V9.1875M7.4375 5.6875V9.1875M3.9375 5.6875V9.1875" stroke="#F31010" strokeWidth="0.875" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                {editingId === exp.id ? (
                                    renderForm()
                                ) : (
                                    <div className="p-5 flex flex-wrap gap-[20px]">
                                        <div className="w-[99px] h-[86px] bg-[#0456FF1A] rounded-[6px] flex items-center justify-center shrink-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50" fill="none">
                                                <path d="M19.4168 23.9354C19.4168 23.0604 20.121 22.3479 20.996 22.3375H29.0064C29.8814 22.3479 30.5814 23.0604 30.5814 23.9354V24.4667C30.5814 25.0563 31.0605 25.5334 31.648 25.5334H48.4356C48.5756 25.5336 48.7143 25.5062 48.8438 25.4527C48.9732 25.3991 49.0907 25.3206 49.1897 25.2214C49.2886 25.1223 49.367 25.0046 49.4203 24.875C49.4735 24.7455 49.5007 24.6067 49.5001 24.4667V16.4792C49.5001 15.3021 48.546 14.3479 47.3689 14.3479H35.6522C35.6522 6.14794 26.7772 1.02294 19.673 5.12294C18.0535 6.0575 16.7087 7.40215 15.7739 9.02158C14.8391 10.641 14.3473 12.4781 14.348 14.3479H2.63138C1.4543 14.3479 0.50013 15.3021 0.50013 16.4792V24.4667C0.50013 25.0563 0.977214 25.5334 1.56471 25.5334H18.3543C18.4945 25.5339 18.6335 25.5067 18.7631 25.4533C18.8928 25.3999 19.0106 25.3213 19.1098 25.2222C19.2089 25.123 19.2875 25.0052 19.3409 24.8755C19.3943 24.7459 19.4215 24.6069 19.421 24.4667L19.4168 23.9354ZM25.0001 9.02085C26.5258 9.00042 28.0085 9.52608 29.1806 10.503C30.3527 11.4798 31.137 12.8436 31.3918 14.3479H18.6085C18.8633 12.8436 19.6475 11.4798 20.8196 10.503C21.9917 9.52608 23.4745 9.00042 25.0001 9.02085ZM30.5835 30.6042C30.5839 31.4316 30.4004 32.2488 30.0462 32.9967C29.6921 33.7445 29.1761 34.4043 28.5357 34.9282C27.8953 35.4522 27.1464 35.8273 26.3433 36.0263C25.5401 36.2254 24.7028 36.2434 23.8918 36.0792C22.5995 35.7906 21.4464 35.0648 20.6273 34.0244C19.8082 32.984 19.3732 31.6927 19.396 30.3688V29.7938C19.3962 29.6541 19.369 29.5157 19.3157 29.3865C19.2624 29.2574 19.1842 29.14 19.0855 29.0411C18.9868 28.9422 18.8696 28.8638 18.7405 28.8103C18.6115 28.7567 18.4732 28.7292 18.3335 28.7292H1.56263C1.42293 28.7289 1.28454 28.7562 1.15539 28.8095C1.02624 28.8627 0.908865 28.941 0.809982 29.0396C0.711099 29.1383 0.63265 29.2556 0.579124 29.3846C0.525598 29.5136 0.498047 29.652 0.498047 29.7917V44.1729C0.498047 45.35 1.45221 46.3042 2.6293 46.3042H47.3668C48.5439 46.3042 49.4981 45.35 49.4981 44.1729V29.7938C49.4983 29.6539 49.471 29.5153 49.4176 29.386C49.3642 29.2568 49.2858 29.1393 49.1869 29.0404C49.0879 28.9415 48.9705 28.8631 48.8412 28.8097C48.7119 28.7563 48.5733 28.7289 48.4335 28.7292H31.7522C31.6043 28.7169 31.4555 28.7351 31.315 28.7827C31.1744 28.8303 31.0452 28.9063 30.9352 29.0059C30.8252 29.1055 30.7369 29.2267 30.6757 29.3618C30.6144 29.497 30.5816 29.6433 30.5793 29.7917L30.5835 30.6042Z" fill="#0456FF" />
                                                <path d="M26.321 25.5334H23.6793C23.5396 25.5332 23.4012 25.5605 23.2721 25.6137C23.1429 25.667 23.0256 25.7452 22.9267 25.8439C22.8278 25.9426 22.7494 26.0598 22.6958 26.1889C22.6423 26.3179 22.6147 26.4562 22.6147 26.5959V30.6022C22.6147 30.9155 22.6764 31.2256 22.7963 31.5151C22.9162 31.8045 23.0919 32.0674 23.3134 32.2889C23.5349 32.5105 23.7979 32.6862 24.0873 32.806C24.3767 32.9259 24.6869 32.9876 25.0002 32.9876C25.3134 32.9876 25.6236 32.9259 25.913 32.806C26.2024 32.6862 26.4654 32.5105 26.6869 32.2889C26.9084 32.0674 27.0841 31.8045 27.204 31.5151C27.3239 31.2256 27.3856 30.9155 27.3856 30.6022V26.598C27.3859 26.4582 27.3585 26.3196 27.3051 26.1903C27.2517 26.061 27.1733 25.9436 27.0744 25.8446C26.9755 25.7457 26.858 25.6673 26.7287 25.6139C26.5994 25.5605 26.4609 25.5332 26.321 25.5334Z" fill="#0456FF" />
                                            </svg>
                                        </div>
                                        <div className="flex-1 flex flex-col gap-y-[10px] justify-center">
                                            {(exp.role || exp.employmentType) && (
                                                <div className="flex flex-wrap items-center gap-[10px]">
                                                    {exp.role && (
                                                        <h6 className="font-bold text-[18px] leading-none text-black capitalize">{exp.role}</h6>
                                                    )}
                                                    {exp.employmentType && (
                                                        <span className="bg-[#0456FF26] text-[#0456FF] font-semibold text-[11px] leading-none px-[10px] py-[5px] rounded-full capitalize">
                                                            {exp.employmentType}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                            {(exp.company || exp.location) && (
                                                <p className="font-normal text-[15px] leading-none text-black capitalize">{exp.company} {exp.company && exp.location && " - "} {exp.location}</p>
                                            )}
                                            {(exp.startDate || exp.endDate || exp.isCurrent) && (
                                                <p className="font-normal text-[15px] leading-none text-black capitalize">
                                                    {exp.startDate?.slice(0, 7)}
                                                    {(exp.startDate || exp.endDate || exp.isCurrent) && " - "}
                                                    {exp.isCurrent ? "Present" : exp.endDate?.slice(0, 7)}
                                                </p>
                                            )}
                                            {exp.description && (
                                                <p className="font-normal text-[14px] leading-[140%] text-black capitalize">{exp.description}</p>
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
                        <button onClick={handlePrevious}
                            className="flex gap-[10px] items-center border border-[#0456FF] bg-white py-[11px] px-[26px] rounded-[5px] font-semibold text-[14px] leading-none text-[#0456FF] cursor-pointer hover:bg-[#0456FF] hover:text-white transition-colors duration-300"
                        >
                            Previous
                        </button>
                        <button onClick={handleNext}
                            className="flex gap-[10px] items-center border border-[#0456FF] bg-[#0456FF] py-[11px] px-[26px] rounded-[5px] font-semibold text-[14px] leading-none text-white cursor-pointer hover:bg-transparent hover:text-[#0456FF] transition-colors duration-300"
                        >
                            Next
                        </button>
                    </div>
                </div>
                <div className="w-[325px] shrink-0 flex flex-col gap-y-5 max-[1300px]:w-full">
                    {form.role.trim() && (
                        <div className="w-full bg-white border border-[#CACACA80] rounded-[12px] p-5">
                            <div className="flex items-center gap-[8px] mb-[13px]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                                    <circle cx="16" cy="16" r="16" fill="#0456FF" fillOpacity="0.15" />
                                    <path d="M14.3775 10.8092C14.6342 10.0575 15.6975 10.0575 15.9542 10.8092L16.6258 12.7758C16.8314 13.3784 17.1724 13.9259 17.6225 14.3761C18.0727 14.8264 18.62 15.1675 19.2225 15.3733L21.1892 16.045C21.9417 16.3017 21.9417 17.365 21.1892 17.6217L19.2225 18.2933C18.6201 18.499 18.0728 18.84 17.6227 19.2902C17.1725 19.7403 16.8315 20.2876 16.6258 20.89L15.9542 22.8567C15.6975 23.6092 14.6342 23.6092 14.3775 22.8567L13.7058 20.89C13.5001 20.2876 13.1591 19.7403 12.709 19.2902C12.2589 18.84 11.7116 18.499 11.1092 18.2933L9.1425 17.6217C8.39 17.365 8.39 16.3017 9.1425 16.045L11.1092 15.3733C11.7116 15.1676 12.2589 14.8266 12.709 14.3765C13.1591 13.9264 13.5001 13.3791 13.7058 12.7767L14.3775 10.8092ZM21.8325 8.5L22.2575 9.74167L23.4992 10.1667L22.2575 10.5917L21.8325 11.8333L21.4075 10.5917L20.1658 10.1667L21.4075 9.74167L21.8325 8.5Z" stroke="#0456FF" strokeWidth="1.66667" strokeLinejoin="round" />
                                </svg>
                                <h5 className="font-bold text-[16px] text-[#000024] leading-[120%]">Ai Description Suggestions</h5>
                                <span className="text-[#0456FF] bg-[#0456FF26] rounded-[2px] font-bold text-[12px] leading-[100%] py-[4px] px-[8px] inline-block">Beta</span>
                            </div>
                            <p className="text-[13px] text-[#00002480] mb-[15px]">
                                Based on the role "{form.role}", here's what you might have done. Select the ones that apply.
                            </p>
                            {descSuggestionsLoading ? (
                                <div className="flex flex-col gap-[10px]">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i} className="h-6 w-full bg-[#0456FF1A] rounded animate-pulse" />
                                    ))}
                                </div>
                            ) : descSuggestions.length > 0 ? (
                                <>
                                    <div className="flex flex-col gap-[10px] mb-[15px]">
                                        {descSuggestions.map((bullet) => (
                                            <button
                                                key={bullet}
                                                type="button"
                                                onClick={() => handleAddBullet(bullet)}
                                                className="flex items-start justify-between gap-[10px] text-left w-full border-b border-[#0456FF26] pb-[10px] cursor-pointer group"
                                            >
                                                <span className="text-[13px] text-[#000024] leading-[140%]">{bullet}</span>
                                                <span className="shrink-0 mt-[2px] text-[#0456FF]">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                                        <path d="M4.21875 6.71875H6.71875M6.71875 6.71875H9.21875M6.71875 6.71875V4.21875M6.71875 6.71875V9.21875M6.71875 12.9688C10.1706 12.9688 12.9688 10.1706 12.9688 6.71875C12.9688 3.26688 10.1706 0.46875 6.71875 0.46875C3.26688 0.46875 0.46875 3.26688 0.46875 6.71875C0.46875 10.1706 3.26688 12.9688 6.71875 12.9688Z" stroke="#0456FF" strokeWidth="0.9375" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                    <button onClick={handleRefreshSuggestions} disabled={descSuggestionsLoading}
                                        className="flex gap-[10px] items-center w-full justify-center mt-[20px] border border-[#0456FF] bg-white py-[11px] px-[26px] rounded-[5px] font-semibold text-[14px] leading-none text-[#0456FF] cursor-pointer hover:bg-[#0456FF] hover:text-white transition-colors duration-300"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
                                            <path d="M13.875 4.5C12.831 2.11575 10.2577 0.75 7.4835 0.75C3.97425 0.75 1.08975 3.414 0.75 6.825" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M10.8668 4.80005H13.8442C13.8975 4.80015 13.9502 4.78974 13.9995 4.76944C14.0487 4.74913 14.0934 4.71931 14.1311 4.68169C14.1688 4.64407 14.1987 4.59939 14.2191 4.55021C14.2395 4.50102 14.25 4.4483 14.25 4.39505V1.42505M1.125 10.5C2.169 12.8843 4.74225 14.25 7.5165 14.25C11.0258 14.25 13.9102 11.586 14.25 8.17505" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M4.13325 10.2H1.15575C1.1025 10.1999 1.04976 10.2103 1.00053 10.2306C0.951309 10.2509 0.906574 10.2807 0.868887 10.3183C0.8312 10.3559 0.8013 10.4006 0.7809 10.4498C0.7605 10.499 0.75 10.5517 0.75 10.605V13.575" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        Refresh Suggestions
                                    </button>
                                </>
                            ) : (
                                <p className="text-sm text-gray-400">No suggestions available.</p>
                            )}
                        </div>
                    )}
                    <ProgressPanel />
                </div>
            </div>
        </div>
    );
}