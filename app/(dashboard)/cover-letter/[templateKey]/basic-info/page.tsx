"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/services/api";
import Loader from "@/components/ui/Loader";

function withMinDelay<T>(promise: Promise<T>, ms = 1000): Promise<T> {
    return Promise.all([
        promise,
        new Promise((resolve) => setTimeout(resolve, ms)),
    ]).then(([result]) => result as T);
}

interface CoverLetterForm {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    jobTitle: string;
    companyName: string;
    hiringManager: string;
    summary: string;
}

const initialForm: CoverLetterForm = {
    fullName: "",
    email: "",
    phone: "",
    address: "",
    jobTitle: "",
    companyName: "",
    hiringManager: "",
    summary: "",
};

const fieldLabels: Record<keyof CoverLetterForm, string> = {
    fullName: "Full Name",
    email: "Email",
    phone: "Phone",
    address: "Address",
    jobTitle: "Job Title",
    companyName: "Company Name",
    hiringManager: "Hiring Manager",
    summary: "Summary",
};

const requiredFields: (keyof CoverLetterForm)[] = ["fullName", "email", "phone", "jobTitle", "companyName", "summary"];

export default function CoverLetterForm() {
    const params = useParams();
    const router = useRouter();
    const templateKey = (params?.templateKey as string) || "classic";

    const [form, setForm] = useState<CoverLetterForm>(initialForm);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [seenSuggestions, setSeenSuggestions] = useState<string[]>([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [loading, setLoading] = useState(true);

    const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isValidPhone = (phone: string) => {
        const digits = phone.replace(/[\s\-()]/g, "");
        return /^\+?\d{7,15}$/.test(digits);
    };

    const handleChange = (field: keyof CoverLetterForm, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const validate = (): boolean => {
        const missing = requiredFields.filter((field) => !form[field]?.toString().trim());

        if (missing.length > 0) {
            toast.error(`Please fill in required fields: ${missing.map((f) => fieldLabels[f]).join(", ")}`);
            return false;
        }

        if (form.email && !isValidEmail(form.email)) {
            toast.error("Please enter a valid email address.");
            return false;
        }

        if (form.phone && !isValidPhone(form.phone)) {
            toast.error("Please enter a valid phone number.");
            return false;
        }

        return true;
    };

    useEffect(() => {
        const saved = sessionStorage.getItem("coverLetterData");
        if (saved) {
            try {
                setForm(JSON.parse(saved));
            } catch {
            }
        }
        const timer = setTimeout(() => setLoading(false), 600);
        return () => clearTimeout(timer);
    }, []);

    const fetchSuggestions = async (exclude: string[]) => {
        if (!form.jobTitle?.trim()) return;
        setLoadingSuggestions(true);
        try {
            const res = await api.post("/cover-letter/summary-suggestions", {
                jobTitle: form.jobTitle,
                companyName: form.companyName,
                excludeSummaries: exclude,
            });
            if (res.data.success) {
                setSuggestions(res.data.suggestions);
                setSeenSuggestions((prev) => [...prev, ...res.data.suggestions]);
            }
        } catch (err) {
            console.error("Failed to get summary suggestions", err);
        } finally {
            setLoadingSuggestions(false);
        }
    };

    const looksLikeJobTitle = (title: string): boolean => {
        const trimmed = title.trim();
        if (trimmed.length < 3) return false;
        if (!/[a-zA-Z]/.test(trimmed)) return false;
        if (/^\d+$/.test(trimmed)) return false;
        return true;
    };

    useEffect(() => {
        if (!looksLikeJobTitle(form.jobTitle || "")) {
            setSuggestions([]);
            setSeenSuggestions([]);
            return;
        }
        const timeout = setTimeout(() => {
            setSeenSuggestions([]);
            fetchSuggestions([]);
        }, 800);

        return () => clearTimeout(timeout);
    }, [form.jobTitle, form.companyName]);

    const handleRefreshSuggestions = () => {
        fetchSuggestions(seenSuggestions);
    };

    const handlePreview = () => {
        if (!validate()) return;
        sessionStorage.setItem("coverLetterData", JSON.stringify(form));
        router.push(`/cover-letter/${templateKey}/preview`);
    };

    return (
        <div className="relative">
            {loading && <Loader overlay />}
            <div className="flex flex-wrap gap-6">
                <div className="flex-1">
                    <div className="flex flex-wrap justify-between gap-[20px] mb-[45px] max-[768px]:flex-col">
                        <div className="w-[calc(100%-231px)] max-[768px]:w-full">
                            <h4 className="font-bold text-[20px] leading-none text-black mb-[15px]">Basic Information</h4>
                            <p className="font-normal text-[15px] leading-[140%] text-[#00002480] inline-block">Provide your personal details.</p>
                        </div>
                        <div className="w-[211px] flex flex-wrap gap-[10px] bg-[#0456FF26] items-center rounded-[8px] px-[15px] py-[12px] font-normal text-[12px] leading-none text-[#0456FF] h-fit">
                            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                                <path d="M8.25 15.75C12.3921 15.75 15.75 12.3921 15.75 8.25C15.75 4.10786 12.3921 0.75 8.25 0.75C4.10786 0.75 0.75 4.10786 0.75 8.25C0.75 12.3921 4.10786 15.75 8.25 15.75Z" stroke="#0456FF" strokeWidth="1.5" />
                                <path d="M8.25 12V7.5" stroke="#0456FF" strokeWidth="1.5" strokeLinecap="round" />
                                <path d="M8.25 4.5C8.66421 4.5 9 4.83579 9 5.25C9 5.66421 8.66421 6 8.25 6C7.83579 6 7.5 5.66421 7.5 5.25C7.5 4.83579 7.83579 4.5 8.25 4.5Z" fill="#0456FF" />
                            </svg>
                            All fields marked are required
                        </div>
                    </div>
                    <div>
                        <div className="flex flex-wrap gap-[30px] row-gap-[20px] max-[768px]:gap-y-[20px] min-[768px]:max-[1400px]:gap-[10px]">
                            <div className="w-[calc((100%-60px)/3)] max-[768px]:w-full min-[768px]:max-[1400px]:w-[calc((100%-20px)/3)]">
                                <label className="inline-block font-bold text-[12px] leading-none text-black mb-[8px]">Full Name *</label>
                                <div className="relative">
                                    <div className="absolute w-[42px] h-full flex justify-center items-center bg-[#0456FF26] rounded-l-[6px]">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <path d="M8 1.9C8.27578 1.9 8.54885 1.95432 8.80364 2.05985C9.05842 2.16539 9.28992 2.32007 9.48492 2.51508C9.67993 2.71008 9.83461 2.94158 9.94015 3.19636C10.0457 3.45115 10.1 3.72422 10.1 4C10.1 4.27578 10.0457 4.54885 9.94015 4.80364C9.83461 5.05842 9.67993 5.28992 9.48492 5.48492C9.28992 5.67993 9.05842 5.83461 8.80364 5.94015C8.54885 6.04568 8.27578 6.1 8 6.1C7.44305 6.1 6.9089 5.87875 6.51508 5.48492C6.12125 5.0911 5.9 4.55695 5.9 4C5.9 3.44305 6.12125 2.9089 6.51508 2.51508C6.9089 2.12125 7.44305 1.9 8 1.9ZM8 10.9C10.97 10.9 14.1 12.36 14.1 13V14.1H1.9V13C1.9 12.36 5.03 10.9 8 10.9ZM8 0C5.79 0 4 1.79 4 4C4 6.21 5.79 8 8 8C10.21 8 12 6.21 12 4C12 1.79 10.21 0 8 0ZM8 9C5.33 9 0 10.34 0 13V16H16V13C16 10.34 10.67 9 8 9Z" fill="#0456FF" />
                                        </svg>
                                    </div>
                                    <input type="text" value={form.fullName} onChange={(e) => handleChange("fullName", e.target.value)} className="w-full border border-[#0456FF26] rounded-[6px] py-[12px] pl-[60px] pr-[20px] text-[14px] leading-none text-black font-bold" />
                                </div>
                            </div>
                            <div className="w-[calc((100%-60px)/3)] max-[768px]:w-full min-[768px]:max-[1400px]:w-[calc((100%-20px)/3)]">
                                <label className="inline-block font-bold text-[12px] leading-none text-black mb-[8px]">Email *</label>
                                <div className="relative">
                                    <div className="absolute w-[42px] h-full flex justify-center items-center bg-[#0456FF26] rounded-l-[6px]">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <path d="M1.5 3C0.671573 3 0 3.67157 0 4.5V11.5C0 12.3284 0.671573 13 1.5 13H14.5C15.3284 13 16 12.3284 16 11.5V4.5C16 3.67157 15.3284 3 14.5 3H1.5ZM1.5 4.5H14.5V5.21739L8 9.28261L1.5 5.21739V4.5ZM14.5 11.5H1.5V6.78261L7.52786 10.5498C7.81846 10.7314 8.18154 10.7314 8.47214 10.5498L14.5 6.78261V11.5Z" fill="#0456FF" />
                                        </svg>
                                    </div>
                                    <input type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} className="w-full border border-[#0456FF26] rounded-[6px] py-[12px] pl-[60px] pr-[20px] text-[14px] leading-none text-black font-bold" />
                                </div>
                            </div>
                            <div className="w-[calc((100%-60px)/3)] max-[768px]:w-full min-[768px]:max-[1400px]:w-[calc((100%-20px)/3)]">
                                <label className="inline-block font-bold text-[12px] leading-none text-black mb-[8px]">Phone *</label>
                                <div className="relative">
                                    <div className="absolute w-[42px] h-full flex justify-center items-center bg-[#0456FF26] rounded-l-[6px]">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                                            <path d="M17.9984 12.46L12.7284 11.85L10.2084 14.37C7.36983 12.9259 5.0625 10.6186 3.61844 7.78L6.14844 5.25L5.53844 0H0.0284377C-0.551562 10.18 7.81844 18.55 17.9984 17.97V12.46Z" fill="#0456FF" />
                                        </svg>
                                    </div>
                                    <input type="text" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} className="w-full border border-[#0456FF26] rounded-[6px] py-[12px] pl-[60px] pr-[20px] text-[14px] leading-none text-black font-bold" />
                                </div>
                            </div>
                            <div className="w-[calc((100%-60px)/3)] max-[768px]:w-full min-[768px]:max-[1400px]:w-[calc((100%-20px)/3)]">
                                <label className="inline-block font-bold text-[12px] leading-none text-black mb-[8px]">Address</label>
                                <div className="relative">
                                    <div className="absolute w-[42px] h-full flex justify-center items-center bg-[#0456FF26] rounded-l-[6px]">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
                                            <path d="M11.75 0.750244L0.75 5.75024M10.75 1.75024V20.7502H5.75C3.864 20.7502 2.922 20.7502 2.336 20.1642C1.75 19.5782 1.75 18.6362 1.75 16.7502V5.75024M10.75 5.75024L20.75 10.7502" stroke="#0456FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M8.75 20.7502H15.75C17.636 20.7502 18.578 20.7502 19.164 20.1642C19.75 19.5782 19.75 18.6352 19.75 16.7502V10.2502M16.75 8.75024V5.75024M5.75 9.75024H6.75M5.75 13.7502H6.75M14.75 12.7502H15.75M15.25 20.7502V16.7502" stroke="#0456FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <input type="text" value={form.address} onChange={(e) => handleChange("address", e.target.value)} className="w-full border border-[#0456FF26] rounded-[6px] py-[12px] pl-[60px] pr-[20px] text-[14px] leading-none text-black font-bold" />
                                </div>
                            </div>
                            <div className="w-[calc((100%-60px)/3)] max-[768px]:w-full min-[768px]:max-[1400px]:w-[calc((100%-20px)/3)]">
                                <label className="inline-block font-bold text-[12px] leading-none text-black mb-[8px]">Job Title *</label>
                                <div className="relative">
                                    <div className="absolute w-[42px] h-full flex justify-center items-center bg-[#0456FF26] rounded-l-[6px]">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5.508 2.466L4.356 5H2.5A1.5 1.5 0 001 6.5v1.882l.503.251a19 19 0 0016.994 0L19 8.382V6.5A1.5 1.5 0 0017.5 5h-1.856l-1.152-2.534A2.5 2.5 0 0012.216 1H7.784a2.5 2.5 0 00-2.276 1.466zM7.784 3a.5.5 0 00-.455.293L6.553 5h6.894l-.776-1.707A.5.5 0 0012.216 3H7.784z" fill="#0456ff" />
                                            <path d="M19 10.613a20.986 20.986 0 01-8 2.003V14a1 1 0 01-2 0v-1.384c-2.74-.131-5.46-.798-8-2.003V17.5A1.5 1.5 0 002.5 19h15a1.5 1.5 0 001.5-1.5v-6.887z" fill="#0456ff" />
                                        </svg>
                                    </div>
                                    <input type="text" value={form.jobTitle} onChange={(e) => handleChange("jobTitle", e.target.value)} className="w-full border border-[#0456FF26] rounded-[6px] py-[12px] pl-[60px] pr-[20px] text-[14px] leading-none text-black font-bold" />
                                </div>
                            </div>
                            <div className="w-[calc((100%-60px)/3)] max-[768px]:w-full min-[768px]:max-[1400px]:w-[calc((100%-20px)/3)]">
                                <label className="inline-block font-bold text-[12px] leading-none text-black mb-[8px]">Company Name *</label>
                                <div className="relative">
                                    <div className="absolute w-[42px] h-full flex justify-center items-center bg-[#0456FF26] rounded-l-[6px]">
                                        <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="#0456ff" width="16" height="16" viewBox="0 0 50 50">
                                            <path d="M8 2L8 6L4 6L4 48L46 48L46 14L30 14L30 6L26 6L26 2 Z M 10 4L24 4L24 8L28 8L28 46L19 46L19 39L15 39L15 46L6 46L6 8L10 8 Z M 10 10L10 12L12 12L12 10 Z M 14 10L14 12L16 12L16 10 Z M 18 10L18 12L20 12L20 10 Z M 22 10L22 12L24 12L24 10 Z M 10 15L10 19L12 19L12 15 Z M 14 15L14 19L16 19L16 15 Z M 18 15L18 19L20 19L20 15 Z M 22 15L22 19L24 19L24 15 Z M 30 16L44 16L44 46L30 46 Z M 32 18L32 20L34 20L34 18 Z M 36 18L36 20L38 20L38 18 Z M 40 18L40 20L42 20L42 18 Z M 10 21L10 25L12 25L12 21 Z M 14 21L14 25L16 25L16 21 Z M 18 21L18 25L20 25L20 21 Z M 22 21L22 25L24 25L24 21 Z M 32 22L32 24L34 24L34 22 Z M 36 22L36 24L38 24L38 22 Z M 40 22L40 24L42 24L42 22 Z M 32 26L32 28L34 28L34 26 Z M 36 26L36 28L38 28L38 26 Z M 40 26L40 28L42 28L42 26 Z M 10 27L10 31L12 31L12 27 Z M 14 27L14 31L16 31L16 27 Z M 18 27L18 31L20 31L20 27 Z M 22 27L22 31L24 31L24 27 Z M 32 30L32 32L34 32L34 30 Z M 36 30L36 32L38 32L38 30 Z M 40 30L40 32L42 32L42 30 Z M 10 33L10 37L12 37L12 33 Z M 14 33L14 37L16 37L16 33 Z M 18 33L18 37L20 37L20 33 Z M 22 33L22 37L24 37L24 33 Z M 32 34L32 36L34 36L34 34 Z M 36 34L36 36L38 36L38 34 Z M 40 34L40 36L42 36L42 34 Z M 32 38L32 40L34 40L34 38 Z M 36 38L36 40L38 40L38 38 Z M 40 38L40 40L42 40L42 38 Z M 10 39L10 44L12 44L12 39 Z M 22 39L22 44L24 44L24 39 Z M 32 42L32 44L34 44L34 42 Z M 36 42L36 44L38 44L38 42 Z M 40 42L40 44L42 44L42 42Z" />
                                        </svg>
                                    </div>
                                    <input type="text" value={form.companyName} onChange={(e) => handleChange("companyName", e.target.value)} className="w-full border border-[#0456FF26] rounded-[6px] py-[12px] pl-[60px] pr-[20px] text-[14px] leading-none text-black font-bold" />
                                </div>
                            </div>
                            <div className="w-[calc((100%-60px)/3)] max-[768px]:w-full min-[768px]:max-[1400px]:w-[calc((100%-20px)/3)]">
                                <label className="inline-block font-bold text-[12px] leading-none text-black mb-[8px]">
                                    Hiring Manager <span className="font-normal text-[#00002480]">(optional)</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute w-[42px] h-full flex justify-center items-center bg-[#0456FF26] rounded-l-[6px]">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 1024 1024" fill="#0456ff" version="1.1">
                                            <path d="M325.36 993.322a7.94 7.94 0 0 1-5.952-2.656 7.996 7.996 0 0 1 0.61-11.294l1.702-1.61c9.24-9.09 14.318-21.228 14.318-34.18 0-26.462-21.528-47.99-47.99-47.99s-47.99 21.528-47.99 47.99a47.82 47.82 0 0 0 12.216 31.994c0.688 0.78 1.406 1.53 2.148 2.248a8 8 0 0 1 0.046 11.31 7.994 7.994 0 0 1-11.31 0.062c-0.96-0.968-1.898-1.936-2.804-2.952a63.806 63.806 0 0 1-16.292-42.664c0-35.29 28.706-63.986 63.986-63.986s63.986 28.698 63.986 63.986c0 17.262-6.772 33.446-19.074 45.568l-2.256 2.124a7.954 7.954 0 0 1-5.344 2.05z" fill="" />
                                            <path d="M304.042 967.578a7.972 7.972 0 0 1-5.654-2.344l-31.994-31.994a7.996 7.996 0 1 1 11.31-11.31l31.994 31.994a7.996 7.996 0 0 1-5.656 13.654z" fill="" />
                                            <path d="M280.174 991.448a7.996 7.996 0 0 1-5.656-13.654l23.872-23.87a7.996 7.996 0 1 1 11.31 11.31l-23.87 23.87a7.98 7.98 0 0 1-5.656 2.344zM272.05 935.584a7.96 7.96 0 0 1-5.476-2.172 8 8 0 0 1-0.352-11.31l61.988-65.984a8.002 8.002 0 0 1 11.654 10.964l-61.988 65.986a7.964 7.964 0 0 1-5.826 2.516z" fill="" />
                                            <path d="M999.898 1023.442H24.102a7.994 7.994 0 0 1-7.998-8v-111.976c0-68.656 35.562-94.964 101.182-119.474 69.096-25.806 124.038-49.678 158.88-69.002 3.876-2.11 8.732-0.75 10.874 3.124a7.996 7.996 0 0 1-3.11 10.874c-35.532 19.7-91.214 43.912-161.052 70.002-61.502 22.962-90.778 44.458-90.778 104.476v103.978h959.8v-103.978c0-60.018-29.276-81.514-90.778-104.476-71.016-26.574-125.208-50.13-161.06-70.002a8.006 8.006 0 0 1-3.124-10.874c2.14-3.876 7.014-5.234 10.874-3.124 35.164 19.496 88.638 42.71 158.92 69.002 65.612 24.51 101.166 50.818 101.166 119.474v111.976a7.996 7.996 0 0 1-8 8z" fill="" />
                                            <path d="M512 735.5c-111.078 0-287.94-157.404-287.94-343.928 0-4.422 3.576-8 7.998-8a7.994 7.994 0 0 1 7.998 8c0 177.854 167.036 327.932 271.944 327.932 104.916 0 271.944-150.078 271.944-327.932 0-4.422 3.578-8 8-8a7.994 7.994 0 0 1 7.996 8c0 186.524-176.87 343.928-287.94 343.928zM512.476 799.488c-4.414 0-8.076-3.578-8.076-8 0-4.42 3.5-7.998 7.92-7.998h0.156a7.994 7.994 0 0 1 7.998 7.998c0 4.422-3.576 8-7.998 8zM512.476 863.472c-4.414 0-8.076-3.576-8.076-7.996 0-4.422 3.5-8 7.92-8h0.156a7.994 7.994 0 0 1 7.998 8 7.992 7.992 0 0 1-7.998 7.996zM512.476 927.46c-4.414 0-8.076-3.578-8.076-7.998 0-4.422 3.5-7.998 7.92-7.998h0.156a7.992 7.992 0 0 1 7.998 7.998 7.994 7.994 0 0 1-7.998 7.998zM512.476 991.448c-4.414 0-8.076-3.576-8.076-7.998s3.5-7.998 7.92-7.998h0.156c4.422 0 7.998 3.576 7.998 7.998s-3.576 7.998-7.998 7.998z" fill="" />
                                            <path d="M711.958 703.508a7.994 7.994 0 0 1-7.998-8v-31.992c0-4.422 3.576-7.998 7.998-7.998s7.998 3.576 7.998 7.998v31.992a7.992 7.992 0 0 1-7.998 8z" fill="" />
                                            <path d="M631.974 815.484a7.996 7.996 0 0 1-4.654-1.484 8.002 8.002 0 0 1-1.844-11.17l79.982-111.976a8.046 8.046 0 0 1 11.156-1.86 8.002 8.002 0 0 1 1.842 11.17l-79.982 111.976a7.986 7.986 0 0 1-6.5 3.344z" fill="" />
                                            <path d="M631.974 815.484a7.86 7.86 0 0 1-3.576-0.844l-95.98-47.99a8.002 8.002 0 0 1-3.578-10.732 8.002 8.002 0 0 1 10.732-3.578l95.98 47.99a8 8 0 1 1-3.578 15.154zM312.042 703.508a7.994 7.994 0 0 1-7.998-8v-31.992a7.994 7.994 0 0 1 7.998-7.998c4.422 0 8 3.576 8 7.998v31.992a7.998 7.998 0 0 1-8 8z" fill="" />
                                            <path d="M392.034 815.484a7.968 7.968 0 0 1-6.514-3.344l-79.984-111.976a8.01 8.01 0 0 1 1.86-11.17 8.02 8.02 0 0 1 11.154 1.86l79.982 111.976a8.012 8.012 0 0 1-1.858 11.17c-1.408 1-3.032 1.484-4.64 1.484z" fill="" />
                                            <path d="M392.034 815.484a8 8 0 0 1-3.586-15.154l95.98-47.99c3.954-1.984 8.74-0.36 10.732 3.578a8 8 0 0 1-3.578 10.732l-95.98 47.99a7.9 7.9 0 0 1-3.568 0.844zM232.058 367.576a8.012 8.012 0 0 1-7.966-7.248c-9.888-105.62 13.028-189.836 68.118-250.324C374.584 19.54 510.446 0.558 609.918 0.558c56.238 0 95.356 6.14 97.01 6.39a8.02 8.02 0 0 1 6.688 6.984 8.004 8.004 0 0 1-4.906 8.31c-57.208 23.542-47.928 80.482-43.146 99.042a143.8 143.8 0 0 1 5.56-0.108c22.73 0 65.596 5.53 97.34 42.616 34.852 40.694 45.412 106.994 31.382 197.022a7.988 7.988 0 0 1-6.342 6.608 7.964 7.964 0 0 1-8.388-3.67L718.364 254.6c-25.306 9.794-120.068 44.038-208.644 44.038-88.302 0-181.916-34.056-207.292-43.96l-63.456 108.932a8.026 8.026 0 0 1-6.914 3.966z m489.602-130.894c2.702 0 5.326 1.39 6.826 3.828l58.55 95.73c8.452-73.876-1.86-128.334-30.712-162.044-27.588-32.212-65.22-37.024-85.202-37.024-6.202 0-10.06 0.484-10.31 0.514-3.67 0.532-7.404-1.702-8.654-5.296-0.282-0.812-24.588-73.266 28.166-112.508-16.824-1.624-41.444-3.328-70.406-3.328-96.246 0-227.438 18.074-305.882 104.212-47.428 52.084-69.508 123.396-65.776 212.268l53.818-92.386a8.01 8.01 0 0 1 9.998-3.344c1.084 0.454 109.766 45.334 207.644 45.334 97.916 0 207.784-44.896 208.894-45.35a8.062 8.062 0 0 1 3.046-0.606z" fill="" />
                                            <path d="M615.978 1007.444a7.992 7.992 0 0 1-7.998-7.998v-95.98a7.994 7.994 0 0 1 7.998-7.998h79.984a7.994 7.994 0 0 1 7.998 7.998c0 4.422-3.578 8-7.998 8h-71.986v87.98a7.992 7.992 0 0 1-7.998 7.998z" fill="" /><path d="M839.932 1007.444a7.994 7.994 0 0 1-7.998-7.998v-87.98h-71.984a7.994 7.994 0 0 1-7.998-8 7.994 7.994 0 0 1 7.998-7.998h79.982c4.422 0 8 3.578 8 7.998v95.98a7.994 7.994 0 0 1-8 7.998z" fill="" /><path d="M743.952 911.464H711.96a7.994 7.994 0 0 1-7.998-8v-31.992c0-4.422 3.576-8 7.998-8h31.992c4.422 0 8 3.578 8 8v31.992c0 4.422-3.578 8-8 8z m-23.994-15.998h15.998v-15.996h-15.998v15.996z" fill="" />
                                            <path d="M711.958 919.462a7.994 7.994 0 0 1-7.998-7.998v-8c0-4.42 3.576-7.998 7.998-7.998s7.998 3.578 7.998 7.998v8a7.992 7.992 0 0 1-7.998 7.998z" fill="" />
                                            <path d="M743.952 919.462a7.992 7.992 0 0 1-7.996-7.998v-8a7.992 7.992 0 0 1 7.996-7.998c4.422 0 8 3.578 8 7.998v8a7.994 7.994 0 0 1-8 7.998z" fill="" />
                                            <path d="M791.944 959.454h-127.974a7.994 7.994 0 0 1-7.998-7.998 7.994 7.994 0 0 1 7.998-7.998h127.974a7.992 7.992 0 0 1 7.996 7.998 7.992 7.992 0 0 1-7.996 7.998z" fill="" />
                                            <path d="M759.95 991.448h-63.986c-4.422 0-8-3.576-8-7.998s3.578-7.998 8-7.998h63.986c4.42 0 7.998 3.576 7.998 7.998s-3.578 7.998-7.998 7.998z" fill="" />
                                        </svg>
                                    </div>
                                    <input type="text" value={form.hiringManager} onChange={(e) => handleChange("hiringManager", e.target.value)} className="w-full border border-[#0456FF26] rounded-[6px] py-[12px] pl-[60px] pr-[20px] text-[14px] leading-none text-black font-bold" />
                                </div>
                            </div>
                            <div className="w-full">
                                <label className="inline-block font-bold text-[12px] leading-none text-black mb-[8px]">Summary *</label>
                                <div className="relative leading-[0]">
                                    <textarea value={form.summary} onChange={(e) => handleChange("summary", e.target.value)} rows={6} placeholder="Write why you're a great fit for this role..." className="w-full border border-[#0456FF26] rounded-[6px] p-[16px] text-[14px] leading-none text-black font-bold resize-y" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-[15px] my-[30px] pt-[30px] border-t border-[#0456FF26]">
                        <button onClick={handlePreview} className="flex gap-[10px] items-center border border-[#0456FF] bg-[#0456FF] py-[11px] px-[26px] rounded-[5px] font-semibold text-[14px] leading-none text-white cursor-pointer hover:bg-transparent hover:text-[#0456FF] transition-colors duration-300">
                            Preview
                        </button>
                    </div>
                </div>
                <div className="w-[325px] shrink-0 flex flex-col gap-y-5 max-[1300px]:w-full">
                    {looksLikeJobTitle(form.jobTitle) && (
                        <div className="border border-[#0456FF26] rounded-[8px] p-[20px]">
                            <div className="flex items-center gap-[8px] mb-[13px]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                                    <circle cx="16" cy="16" r="16" fill="#0456FF" fillOpacity="0.15" />
                                    <path d="M14.3775 10.8092C14.6342 10.0575 15.6975 10.0575 15.9542 10.8092L16.6258 12.7758C16.8314 13.3784 17.1724 13.9259 17.6225 14.3761C18.0727 14.8264 18.62 15.1675 19.2225 15.3733L21.1892 16.045C21.9417 16.3017 21.9417 17.365 21.1892 17.6217L19.2225 18.2933C18.6201 18.499 18.0728 18.84 17.6227 19.2902C17.1725 19.7403 16.8315 20.2876 16.6258 20.89L15.9542 22.8567C15.6975 23.6092 14.6342 23.6092 14.3775 22.8567L13.7058 20.89C13.5001 20.2876 13.1591 19.7403 12.709 19.2902C12.2589 18.84 11.7116 18.499 11.1092 18.2933L9.1425 17.6217C8.39 17.365 8.39 16.3017 9.1425 16.045L11.1092 15.3733C11.7116 15.1676 12.2589 14.8266 12.709 14.3765C13.1591 13.9264 13.5001 13.3791 13.7058 12.7767L14.3775 10.8092ZM21.8325 8.5L22.2575 9.74167L23.4992 10.1667L22.2575 10.5917L21.8325 11.8333L21.4075 10.5917L20.1658 10.1667L21.4075 9.74167L21.8325 8.5Z" stroke="#0456FF" strokeWidth="1.66667" strokeLinejoin="round" />
                                </svg>
                                <h5 className="font-bold text-[16px] text-[#000024] leading-[120%]">AI Summary Suggestions</h5>
                                <span className="text-[#0456FF] bg-[#0456FF26] rounded-[2px] font-bold text-[12px] leading-[100%] py-[4px] px-[8px] inline-block">Beta</span>
                            </div>
                            <p className="text-[13px] text-[#00002480] mb-[15px]">Based on the role "{form.jobTitle}", here are a few opening paragraphs you could use.</p>
                            {loadingSuggestions ? (
                                <div className="flex flex-col gap-[8px]">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="h-[60px] bg-[#F4F1FE] rounded-[6px] animate-pulse" />
                                    ))}
                                </div>
                            ) : suggestions.length === 0 ? (
                                <p className="text-[12px] text-[#00002480]">No suggestions yet — keep typing your job title.</p>
                            ) : (
                                <div className="flex flex-col gap-[10px]">
                                    {suggestions.map((s, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => handleChange("summary", s)}
                                            className="flex items-start justify-between gap-[10px] text-left w-full border-b border-[#0456FF26] pb-[10px] cursor-pointer group"
                                        >
                                            <span className="text-[13px] text-[#000024] leading-[140%]">{s}</span>
                                            <span className="shrink-0 mt-[2px] text-[#0456FF]">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                                    <path d="M4.21875 6.71875H6.71875M6.71875 6.71875H9.21875M6.71875 6.71875V4.21875M6.71875 6.71875V9.21875M6.71875 12.9688C10.1706 12.9688 12.9688 10.1706 12.9688 6.71875C12.9688 3.26688 10.1706 0.46875 6.71875 0.46875C3.26688 0.46875 0.46875 3.26688 0.46875 6.71875C0.46875 10.1706 3.26688 12.9688 6.71875 12.9688Z" stroke="#0456FF" strokeWidth="0.9375" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                            <button onClick={handleRefreshSuggestions} disabled={loadingSuggestions || !form.jobTitle?.trim()}
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
                </div>
            </div>
        </div>
    );
}