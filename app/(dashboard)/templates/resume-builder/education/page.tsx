"use client";

import { useEffect, useState } from "react";
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

interface Education {
    id?: number;
    school: string;
    degree: string;
    educationLevel: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    gpa: string;
}

const emptyForm: Education = {
    school: "",
    degree: "",
    educationLevel: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
    gpa: "",
};

export default function Education() {
    const router = useRouter();
    const resumeId = useResumeId();
    const { refreshProgress } = useResume();
    const [list, setList] = useState<Education[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | "new" | null>(null);
    const [form, setForm] = useState<Education>(emptyForm);
    const [saving, setSaving] = useState(false);

    const fetchList = async () => {
        try {
            const res = await withMinDelay(api.get("/resume/education"));
            if (res.data.success) setList(res.data.education);
        } catch (err) {
            console.error("Failed to load education", err);
            toast.error("Failed to load education.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchList();
    }, []);

    const handleChange = (field: keyof Education, value: any) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const openAdd = () => {
        setForm(emptyForm);
        setEditingId("new");
    };

    const openEdit = (edu: Education) => {
        setForm({
            ...edu,
            educationLevel: edu.educationLevel || "",
            startDate: edu.startDate ? edu.startDate.slice(0, 10) : "",
            endDate: edu.endDate ? edu.endDate.slice(0, 10) : "",
        });
        setEditingId(edu.id!);
    };

    const closeForm = () => {
        setEditingId(null);
        setForm(emptyForm);
    };

    const handleSave = async () => {
        if (!form.degree.trim() || !form.school.trim()) {
            toast.error("Please fill in Course/Degree and Institute.");
            return;
        }

        setSaving(true);
        try {
            if (editingId && editingId !== "new") {
                await api.put(`/resume/education/${editingId}`, form);
                toast.success("Education updated successfully!");
            } else {
                await api.post("/resume/education", form);
                toast.success("Education added successfully!");
            }
            closeForm();
            await fetchList();
            await refreshProgress();
        } catch (err: any) {
            console.error("Failed to save education", err);
            toast.error(err.response?.data?.message || "Failed to save education.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/resume/education/${id}`);
            toast.success("Education removed.");
            await fetchList();
            await refreshProgress();
        } catch (err) {
            console.error("Failed to delete education", err);
            toast.error("Failed to delete education.");
        }
    };

    const handleNext = () => {
        router.push(`/templates/resume-builder/experience?resumeId=${resumeId}`);
    };

    const handlePrevious = () => {
        router.push(`/templates/resume-builder/basic-info?resumeId=${resumeId}`);
    };

    const renderForm = () => (
        <div className="p-5">
            <div className="grid grid-cols-3 gap-[27px] mb-4">
                <div>
                    <label className="font-bold text-[12px] leading-none text-[#000024] mb-[8px] inline-block">Course / Degree *</label>
                    <input
                        type="text"
                        value={form.degree}
                        onChange={(e) => handleChange("degree", e.target.value)}
                        className="w-full border border-[#0456FF26] rounded-[6px] py-[12px] px-[20px] text-[14px] leading-none text-black font-bold"
                    />
                </div>
                <div>
                    <label className="font-bold text-[12px] leading-none text-[#000024] mb-[8px] inline-block">Institute *</label>
                    <input
                        type="text"
                        value={form.school}
                        onChange={(e) => handleChange("school", e.target.value)}
                        className="w-full border border-[#0456FF26] rounded-[6px] py-[12px] px-[20px] text-[14px] leading-none text-black font-bold"
                    />
                </div>
                <div>
                    <label className="font-bold text-[12px] leading-none text-[#000024] mb-[8px] inline-block">Education Level</label>
                    <select
                        value={form.educationLevel}
                        onChange={(e) => handleChange("educationLevel", e.target.value)}
                        className="w-full border border-[#0456FF26] rounded-[6px] py-[12px] px-[20px] text-[14px] leading-none text-black font-bold"
                    >
                        <option value="">Select level</option>
                        <option value="High School">High School</option>
                        <option value="Diploma">Diploma</option>
                        <option value="Associate Degree">Associate Degree</option>
                        <option value="Bachelor's Degree">Bachelor's Degree</option>
                        <option value="Master's Degree">Master's Degree</option>
                        <option value="Doctorate">Doctorate</option>
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-[27px] mb-4">
                <div>
                    <label className="font-bold text-[12px] leading-none text-[#000024] mb-[8px] inline-block">Start Date</label>
                    <input
                        type="date"
                        value={form.startDate}
                        onChange={(e) => handleChange("startDate", e.target.value)}
                        className="w-full border border-[#0456FF26] rounded-[6px] py-[12px] px-[20px] text-[14px] leading-none text-black font-bold"
                    />
                </div>
                <div>
                    <label className="font-bold text-[12px] leading-none text-[#000024] mb-[8px] inline-block">End Date</label>
                    <input
                        type="date"
                        value={form.endDate}
                        onChange={(e) => handleChange("endDate", e.target.value)}
                        disabled={form.isCurrent}
                        className="w-full border border-[#0456FF26] rounded-[6px] py-[12px] px-[20px] text-[14px] leading-none text-black font-bold disabled:bg-gray-50"
                    />
                </div>
                <div>
                    <label className="font-bold text-[12px] leading-none text-[#000024] mb-[8px] inline-block">Grade / CGPA</label>
                    <input
                        type="text"
                        value={form.gpa}
                        onChange={(e) => handleChange("gpa", e.target.value)}
                        className="w-full border border-[#0456FF26] rounded-[6px] py-[12px] px-[20px] text-[14px] leading-none text-black font-bold"
                    />
                </div>
            </div>
            <label className="flex items-center gap-2 mb-[30px] text-[13px] font-semibold w-fit cursor-pointer">
                <input className="w-[18px] h-[18px]"
                    type="checkbox"
                    checked={form.isCurrent}
                    onChange={(e) => handleChange("isCurrent", e.target.checked)}
                />
                Currently Studying
            </label>
            <div className="flex gap-3 flex-wrap justify-between items-center">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex gap-[10px] items-center border border-[#0456FF] bg-[#0456FF] py-[11px] px-[26px] rounded-[5px] font-semibold text-[14px] leading-none text-white cursor-pointer hover:bg-transparent hover:text-[#0456FF] transition-colors duration-300 disabled:opacity-50"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 18 18" fill="none">
                        <path d="M11.675 1C12.1366 1.00657 12.5769 1.19527 12.9 1.525L16.225 4.85C16.5547 5.1731 16.7434 5.6134 16.75 6.075V15C16.75 15.4641 16.5656 15.9092 16.2374 16.2374C15.9092 16.5656 15.4641 16.75 15 16.75H2.75C2.28587 16.75 1.84075 16.5656 1.51256 16.2374C1.18437 15.9092 1 15.4641 1 15V2.75C1 2.28587 1.18437 1.84075 1.51256 1.51256C1.84075 1.18437 2.28587 1 2.75 1H11.675Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M13.25 16.75V10.625C13.25 10.3929 13.1578 10.1704 12.9937 10.0063C12.8296 9.84219 12.6071 9.75 12.375 9.75H5.375C5.14294 9.75 4.92038 9.84219 4.75628 10.0063C4.59219 10.1704 4.5 10.3929 4.5 10.625V16.75M4.5 1V4.5C4.5 4.73206 4.59219 4.95462 4.75628 5.11872C4.92038 5.28281 5.14294 5.375 5.375 5.375H11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {saving ? "Saving..." : "Save Education"}
                </button>
                <button
                    onClick={closeForm}
                    className="inline-block border border-[#0456FF] bg-[#fff] py-[11px] px-[26px] rounded-[5px] font-semibold text-[14px] leading-none text-[#0456FF] cursor-pointer hover:bg-[#0456FF] hover:text-[#fff] transition-colors duration-300"
                >
                    Cancel
                </button>
            </div>
        </div>
    );

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="flex gap-6">
            <div className="flex-1">
                <div className="flex justify-between gap-[20px] mb-[45px]">
                    <div className="w-[calc(100%-231px)]">
                        <h4 className="font-bold text-[20px] leading-none text-black mb-[15px]">Education</h4>
                        <p className="font-normal text-[15px] leading-[140%] text-[#00002480] inline-block">Add your education details. Start with your latest education.</p>
                    </div>
                    <div>
                        <button onClick={openAdd} className="flex gap-[10px] border border-[#0456FF] bg-[#fff] py-[11px] px-[26px] rounded-[5px] font-semibold text-[14px] leading-none text-[#0456FF] cursor-pointer hover:bg-[#0456FF] hover:text-[#fff] transition-colors duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
                                <mask id="mask0_453_830" style={{ maskType: "luminance" }} maskUnits="userSpaceOnUse" x="0" y="0" width="15" height="15">
                                    <path d="M0.75 7.5C0.75 3.7725 3.7725 0.75 7.5 0.75C11.2275 0.75 14.25 3.7725 14.25 7.5C14.25 11.2275 11.2275 14.25 7.5 14.25C3.7725 14.25 0.75 11.2275 0.75 7.5Z" fill="white" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M3.75 7.5H11.25" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M7.5 3.75V11.25" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </mask>
                                <g mask="url(#mask0_453_830)">
                                    <path d="M-1.5 -1.5H16.5V16.5H-1.5V-1.5Z" fill="currentColor" />
                                </g>
                            </svg>
                            Add Education
                        </button>
                    </div>
                </div>
                {list.length === 0 && editingId !== "new" && (
                    <p className="text-sm text-[#00002480] mb-4">No education added yet.</p>
                )}
                <div className="space-y-4">
                    {list.map((edu, i) => (
                        <div key={edu.id}>
                            <div className="border border-[#0456FF26] rounded-[10px]">
                                <div className="border-b border-[#0456FF26] p-5 flex flex-wrap items-center justify-between">
                                    <div className="flex flex-wrap gap-[10px] items-center">
                                        <span className="bg-[#0456FF26] font-bold text-[12px] leading-none text-[#0456FF] w-[30px] h-[30px] flex justify-center items-center rounded-full">{String(i + 1).padStart(2, '0')}</span>
                                        <p className="font-bold text-[12px] leading-none text-[#000024] inline-block">Education {i + 1}</p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-[15px]">
                                        <button onClick={() => editingId === edu.id ? closeForm() : openEdit(edu)} className="border border-[#00002433] w-[30px] h-[28px] flex justify-center items-center rounded-[4px] cursor-pointer">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                <path d="M1.70782 13.6626H2.92465L11.2716 5.31561L10.0548 4.09878L1.70782 12.4458V13.6626ZM0 15.3704V11.7413L11.2716 0.491C11.4424 0.334449 11.6311 0.213478 11.8378 0.128087C12.0444 0.0426957 12.2613 0 12.4885 0C12.7156 0 12.9362 0.0426957 13.1503 0.128087C13.3643 0.213478 13.5493 0.341565 13.7053 0.512347L14.8794 1.70783C15.0502 1.86438 15.1749 2.04939 15.2534 2.26287C15.332 2.47635 15.371 2.68982 15.3704 2.9033C15.3704 3.13101 15.3314 3.34819 15.2534 3.55484C15.1754 3.76149 15.0508 3.94991 14.8794 4.12013L3.62913 15.3704H0ZM10.6526 4.71787L10.0548 4.09878L11.2716 5.31561L10.6526 4.71787Z" fill="#000024" fillOpacity="0.8" />
                                            </svg>
                                        </button>
                                        <button onClick={() => handleDelete(edu.id!)} className="border border-[#00002433] w-[30px] h-[28px] flex justify-center items-center rounded-[4px] cursor-pointer">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="13" viewBox="0 0 12 13" fill="none">
                                                <path d="M9.77083 3.9375V10.7042C9.77083 11.0755 9.62333 11.4316 9.36078 11.6941C9.09823 11.9567 8.74214 12.1042 8.37083 12.1042H3.00417C2.63286 12.1042 2.27677 11.9567 2.01422 11.6941C1.75167 11.4316 1.60417 11.0755 1.60417 10.7042V3.9375M8.02083 2.1875V1.1375C8.02083 0.7525 7.70583 0.4375 7.32083 0.4375H4.05417C3.66917 0.4375 3.35417 0.7525 3.35417 1.1375V2.1875M8.02083 2.1875H3.35417M8.02083 2.1875H10.9375M3.35417 2.1875H0.4375M5.6875 5.6875V9.1875M7.4375 5.6875V9.1875M3.9375 5.6875V9.1875" stroke="#F31010" strokeWidth="0.875" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                {editingId === edu.id ? (
                                    <div className="">{renderForm()}</div>
                                ) : (
                                    <div className="p-5 flex flex-wrap gap-[20px]">
                                        <div className="w-[80px]">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80" fill="none">
                                                <circle cx="40" cy="40" r="40" fill="#0456FF" fillOpacity="0.15" />
                                                <path d="M58.2186 34.1438L41.3436 25.7063C41.0843 25.5774 40.7987 25.5104 40.5092 25.5104C40.2197 25.5104 39.9341 25.5774 39.6748 25.7063L28.4248 31.3313L22.7998 34.1438L20.9248 35.0813C20.6156 35.2371 20.3556 35.4755 20.1735 35.77C19.9915 36.0646 19.8946 36.4038 19.8936 36.75V48H23.6436V37.9125L39.6748 45.9375C39.9373 46.0688 40.2186 46.1438 40.5186 46.1438C40.8186 46.1438 41.0998 46.0688 41.3623 45.9375L58.2373 37.5C58.8748 37.1813 59.2686 36.525 59.2686 35.8313C59.2686 35.1375 58.8748 34.4813 58.2373 34.1625L58.2186 34.1438Z" fill="#0456FF" />
                                                <path d="M40.5 49.875C39.6375 49.875 38.7562 49.6687 37.9875 49.275L27.375 43.9688V46.95C27.375 50.8125 33.225 55.5 40.5 55.5C47.775 55.5 53.625 50.8312 53.625 46.95V43.9688L43.0125 49.275C42.2437 49.6687 41.3625 49.875 40.5 49.875Z" fill="#0456FF" />
                                            </svg>
                                        </div>
                                        <div className="w-[calc(100%-100px)] flex flex-col gap-y-[10px]">
                                            <h6 className="font-bold text-[18px] leading-none text-black">{edu.degree}</h6>
                                            <p className="flex gap-[8px] font-normal text-[15px] leading-none text-black items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
                                                    <path d="M10.1667 14.3336H2.66667C2.44565 14.3336 2.23369 14.2458 2.07741 14.0895C1.92113 13.9332 1.83333 13.7213 1.83333 13.5002V7.66691M10.1667 14.3336H14.3333C14.5543 14.3336 14.7663 14.2458 14.9226 14.0895C15.0789 13.9332 15.1667 13.7213 15.1667 13.5002V3.50024M10.1667 14.3336V5.16691M10.1667 5.16691V1.83358M10.1667 5.16691L1 7.66691M6 11.0002V14.3336M9.33333 1.00024L16 3.50024M12.25 6.83358H13.0833M12.25 10.1669H13.0833" stroke="#0456FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                {edu.school} {edu.educationLevel && `- ${edu.educationLevel}`}
                                            </p>
                                            <p className="flex gap-[8px] font-normal text-[15px] leading-none text-black items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                                    <g clipPath="url(#clip0_135_58)">
                                                        <path d="M5.75 3.0415C5.63949 3.0415 5.53351 3.0854 5.45537 3.16354C5.37723 3.24168 5.33333 3.34766 5.33333 3.45817C5.33333 3.56868 5.37723 3.67466 5.45537 3.7528C5.53351 3.83094 5.63949 3.87484 5.75 3.87484H8.25C8.36051 3.87484 8.46649 3.83094 8.54463 3.7528C8.62277 3.67466 8.66667 3.56868 8.66667 3.45817C8.66667 3.34766 8.62277 3.24168 8.54463 3.16354C8.46649 3.0854 8.36051 3.0415 8.25 3.0415H5.75ZM4.91667 7.62484C4.91667 7.84585 4.82887 8.05781 4.67259 8.21409C4.51631 8.37037 4.30435 8.45817 4.08333 8.45817C3.86232 8.45817 3.65036 8.37037 3.49408 8.21409C3.3378 8.05781 3.25 7.84585 3.25 7.62484C3.25 7.40382 3.3378 7.19186 3.49408 7.03558C3.65036 6.8793 3.86232 6.7915 4.08333 6.7915C4.30435 6.7915 4.51631 6.8793 4.67259 7.03558C4.82887 7.19186 4.91667 7.40382 4.91667 7.62484ZM4.91667 10.5415C4.91667 10.7625 4.82887 10.9745 4.67259 11.1308C4.51631 11.287 4.30435 11.3748 4.08333 11.3748C3.86232 11.3748 3.65036 11.287 3.49408 11.1308C3.3378 10.9745 3.25 10.7625 3.25 10.5415C3.25 10.3205 3.3378 10.1085 3.49408 9.95225C3.65036 9.79597 3.86232 9.70817 4.08333 9.70817C4.30435 9.70817 4.51631 9.79597 4.67259 9.95225C4.82887 10.1085 4.91667 10.3205 4.91667 10.5415ZM7 8.45817C7.22101 8.45817 7.43298 8.37037 7.58926 8.21409C7.74554 8.05781 7.83333 7.84585 7.83333 7.62484C7.83333 7.40382 7.74554 7.19186 7.58926 7.03558C7.43298 6.8793 7.22101 6.7915 7 6.7915C6.77899 6.7915 6.56702 6.8793 6.41074 7.03558C6.25446 7.19186 6.16667 7.40382 6.16667 7.62484C6.16667 7.84585 6.25446 8.05781 6.41074 8.21409C6.56702 8.37037 6.77899 8.45817 7 8.45817ZM7.83333 10.5415C7.83333 10.7625 7.74554 10.9745 7.58926 11.1308C7.43298 11.287 7.22101 11.3748 7 11.3748C6.77899 11.3748 6.56702 11.287 6.41074 11.1308C6.25446 10.9745 6.16667 10.7625 6.16667 10.5415C6.16667 10.3205 6.25446 10.1085 6.41074 9.95225C6.56702 9.79597 6.77899 9.70817 7 9.70817C7.22101 9.70817 7.43298 9.79597 7.58926 9.95225C7.74554 10.1085 7.83333 10.3205 7.83333 10.5415ZM9.91667 8.45817C10.1377 8.45817 10.3496 8.37037 10.5059 8.21409C10.6622 8.05781 10.75 7.84585 10.75 7.62484C10.75 7.40382 10.6622 7.19186 10.5059 7.03558C10.3496 6.8793 10.1377 6.7915 9.91667 6.7915C9.69565 6.7915 9.48369 6.8793 9.32741 7.03558C9.17113 7.19186 9.08333 7.40382 9.08333 7.62484C9.08333 7.84585 9.17113 8.05781 9.32741 8.21409C9.48369 8.37037 9.69565 8.45817 9.91667 8.45817Z" fill="#0456FF" />
                                                        <path fillRule="evenodd" clipRule="evenodd" d="M3.66667 -0.0834961C3.77717 -0.0834961 3.88315 -0.0395973 3.96129 0.0385428C4.03943 0.116683 4.08333 0.222664 4.08333 0.333171V1.1665H9.91667V0.333171C9.91667 0.222664 9.96056 0.116683 10.0387 0.0385428C10.1168 -0.0395973 10.2228 -0.0834961 10.3333 -0.0834961C10.4438 -0.0834961 10.5498 -0.0395973 10.628 0.0385428C10.7061 0.116683 10.75 0.222664 10.75 0.333171V1.169C10.9539 1.17067 11.1356 1.17789 11.295 1.19067C11.5992 1.21567 11.8658 1.26817 12.1125 1.39317C12.5044 1.59308 12.8229 1.91193 13.0225 2.304C13.1483 2.55067 13.2008 2.81734 13.2258 3.12067C13.25 3.4165 13.25 3.78067 13.25 4.23234V10.6007C13.25 11.0523 13.25 11.4173 13.2258 11.7115C13.2008 12.0157 13.1483 12.2823 13.0225 12.529C12.8228 12.9208 12.5043 13.2393 12.1125 13.439C11.8658 13.5648 11.5992 13.6173 11.2958 13.6423C11 13.6665 10.6358 13.6665 10.185 13.6665H3.81583C3.36417 13.6665 2.99917 13.6665 2.705 13.6423C2.40083 13.6173 2.13417 13.5648 1.8875 13.439C1.49542 13.2394 1.17658 12.9209 0.976667 12.529C0.851667 12.2823 0.799167 12.0157 0.774167 11.7123C0.75 11.4165 0.75 11.0515 0.75 10.5998V4.23317C0.75 3.83734 0.75 3.50984 0.766667 3.23567L0.774167 3.12234C0.799167 2.81817 0.851667 2.5515 0.976667 2.30484C1.17644 1.91263 1.49529 1.59377 1.8875 1.394C2.13417 1.269 2.40083 1.2165 2.70417 1.1915C2.86472 1.17873 3.04667 1.1715 3.25 1.16984V0.333171C3.25 0.222664 3.2939 0.116683 3.37204 0.0385428C3.45018 -0.0395973 3.55616 -0.0834961 3.66667 -0.0834961ZM3.25 2.4165V2.00234C3.09067 2.00365 2.93142 2.01004 2.7725 2.0215C2.52083 2.0415 2.37583 2.07984 2.26583 2.13567C2.03042 2.25555 1.83904 2.44693 1.71917 2.68234C1.66333 2.79234 1.625 2.93734 1.605 3.189C1.58333 3.4465 1.58333 3.7765 1.58333 4.24984V4.70817H12.4167V4.24984C12.4167 3.7765 12.4167 3.4465 12.395 3.189C12.375 2.93734 12.3367 2.79234 12.2808 2.68234C12.161 2.44693 11.9696 2.25555 11.7342 2.13567C11.6242 2.07984 11.4792 2.0415 11.2275 2.0215C11.0686 2.01004 10.9093 2.00365 10.75 2.00234V2.4165C10.75 2.52701 10.7061 2.63299 10.628 2.71113C10.5498 2.78927 10.4438 2.83317 10.3333 2.83317C10.2228 2.83317 10.1168 2.78927 10.0387 2.71113C9.96056 2.63299 9.91667 2.52701 9.91667 2.4165V1.99984H4.08333V2.4165C4.08333 2.52701 4.03943 2.63299 3.96129 2.71113C3.88315 2.78927 3.77717 2.83317 3.66667 2.83317C3.55616 2.83317 3.45018 2.78927 3.37204 2.71113C3.2939 2.63299 3.25 2.52701 3.25 2.4165ZM12.4167 5.5415H1.58333V10.5832C1.58333 11.0565 1.58333 11.3873 1.605 11.644C1.625 11.8957 1.66333 12.0407 1.71917 12.1507C1.83904 12.3861 2.03042 12.5775 2.26583 12.6973C2.37583 12.7532 2.52083 12.7915 2.7725 12.8115C3.03 12.8332 3.36 12.8332 3.83333 12.8332H10.1667C10.64 12.8332 10.9708 12.8332 11.2275 12.8115C11.4792 12.7915 11.6242 12.7532 11.7342 12.6973C11.9696 12.5775 12.161 12.3861 12.2808 12.1507C12.3367 12.0407 12.375 11.8957 12.395 11.644C12.4167 11.3873 12.4167 11.0565 12.4167 10.5832V5.5415Z" fill="#0456FF" />
                                                    </g>
                                                    <defs>
                                                        <clipPath id="clip0_135_58">
                                                            <rect width="14" height="14" fill="white" />
                                                        </clipPath>
                                                    </defs>
                                                </svg>
                                                {edu.startDate?.slice(0, 4)} -{" "}
                                                {edu.isCurrent ? "Present" : edu.endDate?.slice(0, 4)}
                                            </p>
                                            <p className="flex gap-[8px] font-normal text-[15px] leading-none text-black items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="13" viewBox="0 0 11 13" fill="none">
                                                    <path d="M9.08 0.353333L8.52 0L4.76667 6L1.02 12L1.58667 12.3533L2.14667 12.7067L5.9 6.70667L9.64666 0.706667L9.08 0.353333ZM0 2.68667C0 3.97333 1.04667 5.02 2.33333 5.02C3.62 5.02 4.66667 3.97333 4.66667 2.68667C4.66667 1.4 3.62 0.353333 2.33333 0.353333C1.04667 0.353333 0 1.4 0 2.68667ZM2.33333 1.68667C2.88667 1.68667 3.33333 2.13333 3.33333 2.68667C3.33333 3.24 2.88667 3.68667 2.33333 3.68667C1.78 3.68667 1.33333 3.24 1.33333 2.68667C1.33333 2.13333 1.78 1.68667 2.33333 1.68667ZM6 10.02C6 11.3067 7.04667 12.3533 8.33333 12.3533C9.62 12.3533 10.6667 11.3067 10.6667 10.02C10.6667 8.73333 9.62 7.68667 8.33333 7.68667C7.04667 7.68667 6 8.73333 6 10.02ZM9.33333 10.02C9.33333 10.5733 8.88666 11.02 8.33333 11.02C7.78 11.02 7.33333 10.5733 7.33333 10.02C7.33333 9.46667 7.78 9.02 8.33333 9.02C8.88666 9.02 9.33333 9.46667 9.33333 10.02Z" fill="#0456FF" />
                                                </svg>
                                                {edu.gpa}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
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
                        className="flex gap-[10px] items-center border border-[#0456FF] bg-[#fff] py-[11px] px-[26px] rounded-[5px] font-semibold text-[14px] leading-none text-[#0456FF] cursor-pointer hover:bg-[#0456FF] hover:text-[#fff] transition-colors duration-300"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="14" viewBox="0 0 16 14" fill="none"><path d="M1 7L15 7M7 1L1 7L7 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                        Previous
                    </button>
                    <button
                        onClick={handleNext}
                        className="flex gap-[10px] items-center border border-[#0456FF] bg-[#0456FF] py-[11px] px-[26px] rounded-[5px] font-semibold text-[14px] leading-none text-white cursor-pointer hover:bg-transparent hover:text-[#0456FF] transition-colors duration-300 disabled:opacity-50"
                    >
                        Next
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="14" viewBox="0 0 16 14" fill="none"><path d="M15 7L1 7M9 1L15 7L9 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                    </button>
                </div>
            </div>

            <div className="w-[280px] shrink-0">
                <ProgressPanel />
            </div>
        </div>
    );
}