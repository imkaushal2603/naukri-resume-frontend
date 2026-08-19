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

interface BasicInfo {
    fullName: string;
    email: string;
    phone: string;
    profilePhoto: string | null;
    country: string;
    state: string;
    city: string;
    zipCode: string;
    linkedin: string;
    github: string;
}

export default function BasicInfoStep() {
    const router = useRouter();
    const resumeId = useResumeId();
    const { refreshProgress } = useResume();
    const [form, setForm] = useState<Partial<BasicInfo>>({});
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!resumeId) return;
            try {
                const res = await withMinDelay(api.get(`/resume/builder/${resumeId}/basic-info`));
                if (res.data.success) {
                    setForm(res.data.basicInfo);
                    if (res.data.basicInfo.profilePhoto) {
                        setPreviewUrl(getAssetUrl(res.data.basicInfo.profilePhoto));
                    }
                }
            } catch (err) {
                console.error("Failed to load basic info", err);
                toast.error("Failed to load your details. Please refresh the page.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [resumeId]);

    const handleChange = (field: keyof BasicInfo, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 1 * 1024 * 1024) {
            toast.error("File size must be under 1 MB.");
            return;
        }

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const requiredFields: (keyof BasicInfo)[] = ["fullName", "phone", "country", "state", "city"];

    const fieldLabels: Record<string, string> = {
        name: "Full Name",
        phone: "Phone",
        country: "Country",
        state: "State",
        city: "City",
    };

    const handleSave = async () => {
        if (!resumeId) {
            toast.error("Resume ID missing.");
            return;
        }

        const missing = requiredFields.filter((field) => !form[field]?.toString().trim());

        if (missing.length > 0) {
            toast.error(
                `Please fill in required fields: ${missing.map((f) => fieldLabels[f]).join(", ")}`
            );
            return;
        }

        setSaving(true);
        try {
            const formData = new FormData();

            Object.entries(form).forEach(([key, value]) => {
                if (key !== "profilePhoto" && value !== undefined && value !== null) {
                    formData.append(key, value as string);
                }
            });

            if (selectedFile) {
                formData.append("profilePhoto", selectedFile);
            }

            await api.put(`/resume/builder/${resumeId}/basic-info`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            await refreshProgress();
            toast.success("Basic information saved successfully!");

            if (resumeId) {
                router.push(`/templates/resume-builder/education?resumeId=${resumeId}`);
            }
        } catch (err: any) {
            console.error("Failed to save basic info", err);
            toast.error(err.response?.data?.message || "Failed to save. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const getAssetUrl = (path: string) => {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const assetBase = apiBase.replace(/\/api$/, "");
        return `${assetBase}${path}`;
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="flex gap-6">
            <div className="flex-1">
                <div className="flex justify-between gap-[20px] mb-[45px]">
                    <div className="w-[calc(100%-231px)]">
                        <h4 className="font-bold text-[20px] leading-none text-black mb-[15px]">Basic Information</h4>
                        <p className="font-normal text-[15px] leading-[140%] text-[#00002480] inline-block">Provide your personal details to help employers identify and contact you. This information will appear at the top of your resume.</p>
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
                <div className="flex items-center gap-[20px] mb-[20px] pb-[30px] border-b border-[#0456FF26]">
                    <div className="relative w-[253px] h-[282px] rounded-[10px] overflow-hidden bg-gray-100 border border-[#0456FF26] flex items-center justify-center shrink-0">
                        {previewUrl ? (
                            <img src={previewUrl} alt="Profile Preview" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-[12px] text-gray-400 font-medium">No Photo</span>
                        )}
                        <label className="absolute bottom-[16px] right-[16px] w-[50px] h-[50px] rounded-full bg-white flex items-center justify-center cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M18.9524 1.04712C18.2811 0.376618 17.3711 0 16.4224 0C15.4736 0 14.5636 0.376618 13.8924 1.04712L1.94036 12.9991C1.53389 13.4052 1.24827 13.9162 1.11536 14.4751L0.0203556 19.0771C-0.00929281 19.2018 -0.00651306 19.3319 0.0284298 19.4552C0.0633727 19.5785 0.129314 19.6907 0.219964 19.7813C0.310614 19.8718 0.42295 19.9377 0.546259 19.9725C0.669568 20.0073 0.799739 20.0099 0.924356 19.9801L5.52536 18.8841C6.08466 18.7514 6.59604 18.4657 7.00236 18.0591L18.9524 6.10912C19.6229 5.43785 19.9995 4.52788 19.9995 3.57912C19.9995 2.63035 19.6229 1.72038 18.9524 1.04912M14.9524 2.10912C15.1454 1.91607 15.3746 1.76294 15.6268 1.65847C15.879 1.55399 16.1494 1.50022 16.4224 1.50022C16.6954 1.50022 16.9657 1.55399 17.2179 1.65847C17.4701 1.76294 17.6993 1.91607 17.8924 2.10912C18.0854 2.30216 18.2385 2.53133 18.343 2.78356C18.4475 3.03578 18.5012 3.30611 18.5012 3.57912C18.5012 3.85212 18.4475 4.12245 18.343 4.37467C18.2385 4.6269 18.0854 4.85607 17.8924 5.04912L17.0004 5.93812L14.0604 2.99912L14.9524 2.10912ZM13.0004 4.06112L15.9404 6.99912L5.94036 16.9991C5.73036 17.2091 5.46636 17.3561 5.17736 17.4251L1.76136 18.2391L2.57436 14.8231C2.64336 14.5331 2.79136 14.2691 3.00136 14.0591L13.0004 4.06112Z" fill="#0456FF" />
                            </svg>
                            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                        </label>
                    </div>
                    <div>
                        <h5 className="font-bold text-[20px] leading-none text-black mb-[12px]">Profile Photo</h5>
                        <p className="max-w-[280px] font-normal text-[12px] leading-[130%] text-black mb-[20px]">A professional profile photo helps recruiters recognize you and creates a positive first impression.</p>
                        <label className="border border-[#0456FF] rounded-[6px] px-[20px] py-[10px] flex mb-[15px] font-normal text-[14px] leading-none gap-[14px] w-fit cursor-pointer text-[#0456FF] transition-colors hover:bg-[#0456FF] hover:text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M5.83333 10V3.20833L3.66667 5.375L2.5 4.16667L6.66667 0L10.8333 4.16667L9.66667 5.375L7.5 3.20833V10H5.83333ZM1.66667 13.3333C1.20833 13.3333 0.816111 13.1703 0.49 12.8442C0.163889 12.5181 0.000555556 12.1256 0 11.6667V9.16667H1.66667V11.6667H11.6667V9.16667H13.3333V11.6667C13.3333 12.125 13.1703 12.5175 12.8442 12.8442C12.5181 13.1708 12.1256 13.3339 11.6667 13.3333H1.66667Z" fill="currentColor" />
                            </svg>
                            Upload Photo
                            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                        </label>
                        <p className="font-normal text-[14px] leading-none text-black mb-[10px]">Maximum file size: <strong>1 MB</strong></p>
                        <p className="font-normal text-[14px] leading-none text-black mb-[10px]">Minimum dimensions: <strong>300 × 300 px</strong></p>
                        <p className="font-normal text-[14px] leading-none text-black">Supported formats: <strong>JPG, JPEG, PNG</strong></p>
                    </div>
                </div>
                <div>
                    <h4 className="font-bold text-[20px] leading-none text-black mb-[20px]">Personal Details</h4>
                    <div className="flex flex-wrap gap-[30px] row-gap-[20px]">
                        <div className="w-[calc((100%-60px)/3)]">
                            <label className="inline-block font-bold text-[12px] leading-none text-black mb-[8px]">Full Name *</label>
                            <div className="relative">
                                <div className="absolute w-[42px] h-full flex justify-center items-center bg-[#0456FF26] rounded-l-[6px]">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d="M8 1.9C8.27578 1.9 8.54885 1.95432 8.80364 2.05985C9.05842 2.16539 9.28992 2.32007 9.48492 2.51508C9.67993 2.71008 9.83461 2.94158 9.94015 3.19636C10.0457 3.45115 10.1 3.72422 10.1 4C10.1 4.27578 10.0457 4.54885 9.94015 4.80364C9.83461 5.05842 9.67993 5.28992 9.48492 5.48492C9.28992 5.67993 9.05842 5.83461 8.80364 5.94015C8.54885 6.04568 8.27578 6.1 8 6.1C7.44305 6.1 6.9089 5.87875 6.51508 5.48492C6.12125 5.0911 5.9 4.55695 5.9 4C5.9 3.44305 6.12125 2.9089 6.51508 2.51508C6.9089 2.12125 7.44305 1.9 8 1.9ZM8 10.9C10.97 10.9 14.1 12.36 14.1 13V14.1H1.9V13C1.9 12.36 5.03 10.9 8 10.9ZM8 0C5.79 0 4 1.79 4 4C4 6.21 5.79 8 8 8C10.21 8 12 6.21 12 4C12 1.79 10.21 0 8 0ZM8 9C5.33 9 0 10.34 0 13V16H16V13C16 10.34 10.67 9 8 9Z" fill="#0456FF" />
                                    </svg>
                                </div>
                                <input type="text" value={form.fullName || ""} onChange={(e) => handleChange("fullName", e.target.value)} className="w-full border border-[#0456FF26] rounded-[6px] py-[12px] pl-[60px] pr-[20px] text-[14px] leading-none text-black font-bold" />
                            </div>
                        </div>
                        <div className="w-[calc((100%-60px)/3)]">
                            <label className="inline-block font-bold text-[12px] leading-none text-black mb-[8px]">Email</label>
                            <div className="relative">
                                <div className="absolute w-[42px] h-full flex justify-center items-center bg-[#0456FF26] rounded-l-[6px]">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d="M8 1.9C8.27578 1.9 8.54885 1.95432 8.80364 2.05985C9.05842 2.16539 9.28992 2.32007 9.48492 2.51508C9.67993 2.71008 9.83461 2.94158 9.94015 3.19636C10.0457 3.45115 10.1 3.72422 10.1 4C10.1 4.27578 10.0457 4.54885 9.94015 4.80364C9.83461 5.05842 9.67993 5.28992 9.48492 5.48492C9.28992 5.67993 9.05842 5.83461 8.80364 5.94015C8.54885 6.04568 8.27578 6.1 8 6.1C7.44305 6.1 6.9089 5.87875 6.51508 5.48492C6.12125 5.0911 5.9 4.55695 5.9 4C5.9 3.44305 6.12125 2.9089 6.51508 2.51508C6.9089 2.12125 7.44305 1.9 8 1.9ZM8 10.9C10.97 10.9 14.1 12.36 14.1 13V14.1H1.9V13C1.9 12.36 5.03 10.9 8 10.9ZM8 0C5.79 0 4 1.79 4 4C4 6.21 5.79 8 8 8C10.21 8 12 6.21 12 4C12 1.79 10.21 0 8 0ZM8 9C5.33 9 0 10.34 0 13V16H16V13C16 10.34 10.67 9 8 9Z" fill="#0456FF" />
                                    </svg>
                                </div>
                                <input type="email" value={form.email || ""} onChange={(e) => handleChange("email", e.target.value)} className="w-full border border-[#0456FF26] rounded-[6px] py-[12px] pl-[60px] pr-[20px] text-[14px] leading-none text-black font-bold" />
                            </div>
                        </div>
                        <div className="w-[calc((100%-60px)/3)]">
                            <label className="inline-block font-bold text-[12px] leading-none text-black mb-[8px]">Phone *</label>
                            <div className="relative">
                                <div className="absolute w-[42px] h-full flex justify-center items-center bg-[#0456FF26] rounded-l-[6px]">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                                        <path d="M17.9984 12.46L12.7284 11.85L10.2084 14.37C7.36983 12.9259 5.0625 10.6186 3.61844 7.78L6.14844 5.25L5.53844 0H0.0284377C-0.551562 10.18 7.81844 18.55 17.9984 17.97V12.46Z" fill="#0456FF" />
                                    </svg>
                                </div>
                                <input type="text" value={form.phone || ""} onChange={(e) => handleChange("phone", e.target.value)} className="w-full border border-[#0456FF26] rounded-[6px] py-[12px] pl-[60px] pr-[20px] text-[14px] leading-none text-black font-bold" />
                            </div>
                        </div>
                        <div className="w-[calc((100%-60px)/3)]">
                            <label className="inline-block font-bold text-[12px] leading-none text-black mb-[8px]">Country *</label>
                            <div className="relative">
                                <div className="absolute w-[42px] h-full flex justify-center items-center bg-[#0456FF26] rounded-l-[6px]">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M1.6 7.00012H18.4M1.6 13.0001H18.4M1 10.0001C1 11.182 1.23279 12.3523 1.68508 13.4443C2.13738 14.5362 2.80031 15.5284 3.63604 16.3641C4.47177 17.1998 5.46392 17.8627 6.55585 18.315C7.64778 18.7673 8.8181 19.0001 10 19.0001C11.1819 19.0001 12.3522 18.7673 13.4442 18.315C14.5361 17.8627 15.5282 17.1998 16.364 16.3641C17.1997 15.5284 17.8626 14.5362 18.3149 13.4443C18.7672 12.3523 19 11.182 19 10.0001C19 7.61317 18.0518 5.32399 16.364 3.63616C14.6761 1.94833 12.3869 1.00012 10 1.00012C7.61305 1.00012 5.32387 1.94833 3.63604 3.63616C1.94821 5.32399 1 7.61317 1 10.0001Z" stroke="#0456FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M9.49967 1.00012C7.81501 3.69973 6.92188 6.81799 6.92188 10.0001C6.92188 13.1823 7.81501 16.3005 9.49967 19.0001M10.4997 1.00012C12.1843 3.69973 13.0775 6.81799 13.0775 10.0001C13.0775 13.1823 12.1843 16.3005 10.4997 19.0001" stroke="#0456FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <input type="text" value={form.country || ""} onChange={(e) => handleChange("country", e.target.value)} className="w-full border border-[#0456FF26] rounded-[6px] py-[12px] pl-[60px] pr-[20px] text-[14px] leading-none text-black font-bold" />
                            </div>
                        </div>
                        <div className="w-[calc((100%-60px)/3)]">
                            <label className="inline-block font-bold text-[12px] leading-none text-black mb-[8px]">State *</label>
                            <div className="relative">
                                <div className="absolute w-[42px] h-full flex justify-center items-center bg-[#0456FF26] rounded-l-[6px]">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M1.6 7.00012H18.4M1.6 13.0001H18.4M1 10.0001C1 11.182 1.23279 12.3523 1.68508 13.4443C2.13738 14.5362 2.80031 15.5284 3.63604 16.3641C4.47177 17.1998 5.46392 17.8627 6.55585 18.315C7.64778 18.7673 8.8181 19.0001 10 19.0001C11.1819 19.0001 12.3522 18.7673 13.4442 18.315C14.5361 17.8627 15.5282 17.1998 16.364 16.3641C17.1997 15.5284 17.8626 14.5362 18.3149 13.4443C18.7672 12.3523 19 11.182 19 10.0001C19 7.61317 18.0518 5.32399 16.364 3.63616C14.6761 1.94833 12.3869 1.00012 10 1.00012C7.61305 1.00012 5.32387 1.94833 3.63604 3.63616C1.94821 5.32399 1 7.61317 1 10.0001Z" stroke="#0456FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M9.49967 1.00012C7.81501 3.69973 6.92188 6.81799 6.92188 10.0001C6.92188 13.1823 7.81501 16.3005 9.49967 19.0001M10.4997 1.00012C12.1843 3.69973 13.0775 6.81799 13.0775 10.0001C13.0775 13.1823 12.1843 16.3005 10.4997 19.0001" stroke="#0456FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <input type="text" value={form.state || ""} onChange={(e) => handleChange("state", e.target.value)} className="w-full border border-[#0456FF26] rounded-[6px] py-[12px] pl-[60px] pr-[20px] text-[14px] leading-none text-black font-bold" />
                            </div>
                        </div>
                        <div className="w-[calc((100%-60px)/3)]">
                            <label className="inline-block font-bold text-[12px] leading-none text-black mb-[8px]">City *</label>
                            <div className="relative">
                                <div className="absolute w-[42px] h-full flex justify-center items-center bg-[#0456FF26] rounded-l-[6px]">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
                                        <path d="M11.75 0.750244L0.75 5.75024M10.75 1.75024V20.7502H5.75C3.864 20.7502 2.922 20.7502 2.336 20.1642C1.75 19.5782 1.75 18.6362 1.75 16.7502V5.75024M10.75 5.75024L20.75 10.7502" stroke="#0456FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M8.75 20.7502H15.75C17.636 20.7502 18.578 20.7502 19.164 20.1642C19.75 19.5782 19.75 18.6352 19.75 16.7502V10.2502M16.75 8.75024V5.75024M5.75 9.75024H6.75M5.75 13.7502H6.75M14.75 12.7502H15.75M15.25 20.7502V16.7502" stroke="#0456FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <input type="text" value={form.city || ""} onChange={(e) => handleChange("city", e.target.value)} className="w-full border border-[#0456FF26] rounded-[6px] py-[12px] pl-[60px] pr-[20px] text-[14px] leading-none text-black font-bold" />
                            </div>
                        </div>
                        <div className="w-[calc((100%-60px)/3)]">
                            <label className="inline-block font-bold text-[12px] leading-none text-black mb-[8px]">Zip Code</label>
                            <div className="relative">
                                <div className="absolute w-[42px] h-full flex justify-center items-center bg-[#0456FF26] rounded-l-[6px]">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M1.6 7.00012H18.4M1.6 13.0001H18.4M1 10.0001C1 11.182 1.23279 12.3523 1.68508 13.4443C2.13738 14.5362 2.80031 15.5284 3.63604 16.3641C4.47177 17.1998 5.46392 17.8627 6.55585 18.315C7.64778 18.7673 8.8181 19.0001 10 19.0001C11.1819 19.0001 12.3522 18.7673 13.4442 18.315C14.5361 17.8627 15.5282 17.1998 16.364 16.3641C17.1997 15.5284 17.8626 14.5362 18.3149 13.4443C18.7672 12.3523 19 11.182 19 10.0001C19 7.61317 18.0518 5.32399 16.364 3.63616C14.6761 1.94833 12.3869 1.00012 10 1.00012C7.61305 1.00012 5.32387 1.94833 3.63604 3.63616C1.94821 5.32399 1 7.61317 1 10.0001Z" stroke="#0456FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M9.49967 1.00012C7.81501 3.69973 6.92188 6.81799 6.92188 10.0001C6.92188 13.1823 7.81501 16.3005 9.49967 19.0001M10.4997 1.00012C12.1843 3.69973 13.0775 6.81799 13.0775 10.0001C13.0775 13.1823 12.1843 16.3005 10.4997 19.0001" stroke="#0456FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <input type="text" value={form.zipCode || ""} onChange={(e) => handleChange("zipCode", e.target.value)} className="w-full border border-[#0456FF26] rounded-[6px] py-[12px] pl-[60px] pr-[20px] text-[14px] leading-none text-black font-bold" />
                            </div>
                        </div>
                        <div className="w-[calc((100%-60px)/3)]">
                            <label className="inline-block font-bold text-[12px] leading-none text-black mb-[8px]">LinkedIn</label>
                            <div className="relative">
                                <div className="absolute w-[42px] h-full flex justify-center items-center bg-[#0456FF26] rounded-l-[6px]">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                                        <path d="M5 5H5.002M5 8V13M8 7V9M8 9V13M8 9C8 8.5 8.917 7.217 10 7C11.38 6.724 13 7.5 13 9V13M3 17H15C15.5304 17 16.0391 16.7893 16.4142 16.4142C16.7893 16.0391 17 15.5304 17 15V3C17 2.46957 16.7893 1.96086 16.4142 1.58579C16.0391 1.21071 15.5304 1 15 1H3C2.46957 1 1.96086 1.21071 1.58579 1.58579C1.21071 1.96086 1 2.46957 1 3V15C1 15.5304 1.21071 16.0391 1.58579 16.4142C1.96086 16.7893 2.46957 17 3 17Z" stroke="#0456FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <input type="text" value={form.linkedin || ""} onChange={(e) => handleChange("linkedin", e.target.value)} className="w-full border border-[#0456FF26] rounded-[6px] py-[12px] pl-[60px] pr-[20px] text-[14px] leading-none text-black font-bold" />
                            </div>
                        </div>
                        <div className="w-[calc((100%-60px)/3)]">
                            <label className="inline-block font-bold text-[12px] leading-none text-black mb-[8px]">GitHub</label>
                            <div className="relative">
                                <div className="absolute w-[42px] h-full flex justify-center items-center bg-[#0456FF26] rounded-l-[6px]">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M10 0C8.68678 0 7.38642 0.258658 6.17317 0.761205C4.95991 1.26375 3.85752 2.00035 2.92893 2.92893C1.05357 4.8043 0 7.34784 0 10C0 14.42 2.87 18.17 6.84 19.5C7.34 19.58 7.5 19.27 7.5 19V17.31C4.73 17.91 4.14 15.97 4.14 15.97C3.68 14.81 3.03 14.5 3.03 14.5C2.12 13.88 3.1 13.9 3.1 13.9C4.1 13.97 4.63 14.93 4.63 14.93C5.5 16.45 6.97 16 7.54 15.76C7.63 15.11 7.89 14.67 8.17 14.42C5.95 14.17 3.62 13.31 3.62 9.5C3.62 8.39 4 7.5 4.65 6.79C4.55 6.54 4.2 5.5 4.75 4.15C4.75 4.15 5.59 3.88 7.5 5.17C8.29 4.95 9.15 4.84 10 4.84C10.85 4.84 11.71 4.95 12.5 5.17C14.41 3.88 15.25 4.15 15.25 4.15C15.8 5.5 15.45 6.54 15.35 6.79C16 7.5 16.38 8.39 16.38 9.5C16.38 13.32 14.04 14.16 11.81 14.41C12.17 14.72 12.5 15.33 12.5 16.26V19C12.5 19.27 12.66 19.59 13.17 19.5C17.14 18.16 20 14.42 20 10C20 8.68678 19.7413 7.38642 19.2388 6.17317C18.7362 4.95991 17.9997 3.85752 17.0711 2.92893C16.1425 2.00035 15.0401 1.26375 13.8268 0.761205C12.6136 0.258658 11.3132 0 10 0Z" fill="#0456FF" />
                                    </svg>
                                </div>
                                <input type="text" value={form.github || ""} onChange={(e) => handleChange("github", e.target.value)} className="w-full border border-[#0456FF26] rounded-[6px] py-[12px] pl-[60px] pr-[20px] text-[14px] leading-none text-black font-bold" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-center my-[30px] pt-[42px] border-t border-[#0456FF26]">
                    <button onClick={handleSave} disabled={saving} className="flex gap-[10px] items-center border border-[#0456FF] bg-[#0456FF] py-[11px] px-[26px] rounded-[5px] font-semibold text-[14px] leading-none text-white cursor-pointer hover:bg-transparent hover:text-[#0456FF] transition-colors duration-300 disabled:opacity-50">
                        {saving ? "Saving..." : "Save & Continue"}
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="14" viewBox="0 0 16 14" fill="none">
                            <path d="M15 7L1 7M9 1L15 7L9 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            </div>
            <div className="w-[325px] shrink-0 flex flex-col gap-y-5">
                <ProgressPanel />
                <div className="border border-[#CACACA80] flex flex-col px-4 py-3 gap-y-3 rounded-[6px]">
                    <div className="flex flex-wrap gap-[10px]">
                        <div className="w-[40px]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
                                <rect width="40" height="40" rx="4" fill="#0456FF" fillOpacity="0.15" />
                                <path d="M15 28H19C19 29.1 18.1 30 17 30C15.9 30 15 29.1 15 28ZM13 27H21V25H13V27ZM24.5 17.5C24.5 21.32 21.84 23.36 20.73 24H13.27C12.16 23.36 9.5 21.32 9.5 17.5C9.5 13.36 12.86 10 17 10C21.14 10 24.5 13.36 24.5 17.5ZM22.5 17.5C22.5 14.47 20.03 12 17 12C13.97 12 11.5 14.47 11.5 17.5C11.5 19.97 12.99 21.39 13.85 22H20.15C21.01 21.39 22.5 19.97 22.5 17.5ZM29.37 15.37L28 16L29.37 16.63L30 18L30.63 16.63L32 16L30.63 15.37L30 14L29.37 15.37ZM27 14L27.94 11.94L30 11L27.94 10.06L27 8L26.06 10.06L24 11L26.06 11.94L27 14Z" fill="#0456FF" />
                            </svg>
                        </div>
                        <div className="w-[calc(100%-55px)]">
                            <h6 className="font-bold text-[15px] leading-[140%] text-[#000024]">Pro Tip</h6>
                            <p className="font-normal text-[13px] leading-[140%] inline-block text-[#00002499]">A professional photo and complete information can increase your chances of getting hired by <span className="text-[#0456FF] font-bold">3x</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}