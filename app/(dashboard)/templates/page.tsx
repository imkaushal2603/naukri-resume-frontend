"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import api from "@/services/api";
import { useResumeId } from "@/hooks/useResumeId";
import Loader from "@/components/ui/Loader";

function withMinDelay<T>(promise: Promise<T>, ms: number = 1000): Promise<T> {
    return Promise.all([
        promise,
        new Promise((resolve) => setTimeout(resolve, ms)),
    ]).then(([result]) => result as T);
}

interface Template {
    id: number;
    name: string;
    templateKey: string;
    preview: string;
    status: number;
}

export default function Templates() {
    const router = useRouter();
    const resumeId = useResumeId();
    const [templates, setTemplates] = useState<Template[]>([]);
    const [currentTemplateId, setCurrentTemplateId] = useState<number | null>(null);
    const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    useEffect(() => {
        const fetchData = async () => {
            try {
                const templatesRes = await withMinDelay(api.get("/resume/templates"));
                if (templatesRes.data.success) {
                    setTemplates(templatesRes.data.templates);
                }

                if (resumeId) {
                    const resumeRes = await api.get(`/resume/builder/${resumeId}`);
                    if (resumeRes.data.success) {
                        const tId = resumeRes.data.resume.templateId;
                        setCurrentTemplateId(tId);
                        setSelectedTemplateId(tId);
                    }
                }
            } catch (err) {
                console.error("Failed to load templates", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [resumeId]);

    const handleSelectTemplate = (templateId: number) => {
        setSelectedTemplateId(templateId);
    };

    const handleUpdate = async () => {
        if (!resumeId || !selectedTemplateId) return;
        setSaving(true);
        try {
            const res = await api.put(`/resume/builder/${resumeId}`, { templateId: selectedTemplateId });
            if (res.data.success) {
                router.push(`/templates/resume-builder/preview?resumeId=${resumeId}`);
            }
        } catch (err: any) {
            console.error("Failed to update template", err.response?.data || err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleContinue = async () => {
        if (!selectedTemplateId) return;
        setSaving(true);
        try {
            const res = await api.post("/resume/builder", { templateId: selectedTemplateId });
            if (res.data.success) {
                router.push(`/templates/resume-builder/basic-info?resumeId=${res.data.resume.id}`);
            }
        } catch (err: any) {
            console.error("Failed to select template", err.response?.data || err.message);
        } finally {
            setSaving(false);
        }
    };

    const getImageUrl = (previewPath: string) => {
        if (!previewPath) return "";

        if (previewPath.startsWith("http://") || previewPath.startsWith("https://")) {
            return previewPath;
        }

        const normalizedPath = previewPath.startsWith("/api/")
            ? previewPath
            : `/api${previewPath.startsWith("/") ? previewPath : `/${previewPath}`}`;

        const rawBase = backendUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");

        return `${rawBase}${normalizedPath}`;
    };

    const isEditing = Boolean(resumeId);
    const hasPendingChange = isEditing && selectedTemplateId !== currentTemplateId;
    const showActionButton = isEditing ? hasPendingChange : Boolean(selectedTemplateId);

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="flex flex-wrap gap-[15px]">
            <div className="w-[calc(70%-7.5px)]">
                <div className="flex flex-wrap items-center gap-[150px] justify-between">
                    <div className="w-[40%]">
                        <h4 className="font-bold text-[22px] leading-[120%] text-black mb-[15px]">Choose a Resume Template</h4>
                        <p className="text-[14px] leading-[22px] text-[#00002480]">Select a professionally designed template that matches your career goals and helps your resume stand out.</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center mt-[30px] gap-[10px]">
                    <div className="border border-[#0456FF26] bg-[#0456FF26] rounded-[6px] flex flex-wrap items-center gap-3 px-[13px] py-[10px]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="18" viewBox="0 0 15 18" fill="none">
                            <path fillRule="evenodd" clipRule="evenodd" d="M2.8125 14.4917L7.5 17.2V17.2042L12.1875 14.4958C13.0414 14.0009 13.7505 13.2906 14.244 12.4359C14.7376 11.5812 14.9982 10.612 15 9.625V2.8125C15 2.34167 14.6833 1.925 14.2292 1.80417L7.5 0L0.770833 1.8C0.316667 1.925 0 2.3375 0 2.80833V9.62083C0.00178054 10.6078 0.262447 11.577 0.755971 12.4317C1.2495 13.2864 1.95861 13.9967 2.8125 14.4917ZM1.25 9.62083V2.96667L7.5 1.29167L13.75 2.96667V9.62083C13.7489 10.3884 13.5463 11.1422 13.1624 11.8069C12.7785 12.4716 12.2268 13.0238 11.5625 13.4083L7.5 15.7542L3.4375 13.4083C2.77318 13.0238 2.22148 12.4716 1.83759 11.8069C1.4537 11.1422 1.25108 10.3884 1.25 9.62083ZM5.72167 10.1667C5.92583 10.3708 6.1925 10.4708 6.45917 10.4708C6.72583 10.4708 6.9925 10.3708 7.19667 10.1667L11.4833 5.87917L10.6 4.99583L6.45833 9.1375L4.81667 7.49583L3.93333 8.37917L5.72083 10.1667H5.72167Z" fill="#0456FF" />
                        </svg>
                        <span className="font-medium text-[14px] leading-[100%] text-[#0456FF]">ATS Friendly</span>
                    </div>
                    <div className="border border-[#0456FF26] bg-[#0456FF26] rounded-[6px] flex flex-wrap items-center gap-3 px-[13px] py-[10px]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M16.2466 12.5C16.4531 12.4999 16.6539 12.5679 16.8177 12.6936C16.9816 12.8193 17.0994 12.9955 17.1528 13.195C17.2835 13.7142 17.5524 14.1883 17.931 14.5669C18.3095 14.9454 18.7836 15.2143 19.3028 15.345C19.5022 15.3984 19.6784 15.5161 19.8041 15.6798C19.9298 15.8436 19.9979 16.0442 19.9979 16.2506C19.9979 16.457 19.9298 16.6577 19.8041 16.8214C19.6784 16.9852 19.5022 17.1029 19.3028 17.1562C18.7836 17.2869 18.3095 17.5558 17.931 17.9344C17.5524 18.313 17.2835 18.787 17.1528 19.3062C17.0999 19.5062 16.9823 19.683 16.8183 19.8092C16.6544 19.9353 16.4534 20.0037 16.2466 20.0037C16.0397 20.0037 15.8387 19.9353 15.6748 19.8092C15.5109 19.683 15.3933 19.5062 15.3403 19.3062C15.2097 18.787 14.9408 18.313 14.5622 17.9344C14.1836 17.5558 13.7095 17.2869 13.1903 17.1562C12.9904 17.1033 12.8136 16.9857 12.6874 16.8218C12.5613 16.6579 12.4929 16.4568 12.4929 16.25C12.4929 16.0432 12.5613 15.8421 12.6874 15.6782C12.8136 15.5143 12.9904 15.3967 13.1903 15.3438C13.7095 15.2131 14.1836 14.9442 14.5622 14.5656C14.9408 14.187 15.2097 13.713 15.3403 13.1938L15.3941 13.0475C15.4688 12.8842 15.5889 12.7457 15.74 12.6487C15.8911 12.5516 16.067 12.5 16.2466 12.5ZM8.74657 1.78139e-07C9.04245 0.00013639 9.32869 0.105226 9.55437 0.296575C9.78006 0.487923 9.93054 0.753124 9.97907 1.045C10.3278 3.1325 10.9978 4.545 11.9741 5.5225C12.9503 6.49875 14.3641 7.16875 16.4516 7.5175C16.7428 7.56675 17.0072 7.71756 17.1979 7.94317C17.3885 8.16878 17.4931 8.45462 17.4931 8.75C17.4931 9.04538 17.3885 9.33122 17.1979 9.55683C17.0072 9.78244 16.7428 9.93325 16.4516 9.9825C14.3641 10.3313 12.9516 11.0012 11.9741 11.9775C10.9978 12.9537 10.3278 14.3675 9.97907 16.455C9.92981 16.7462 9.77901 17.0106 9.5534 17.2013C9.32779 17.392 9.04195 17.4966 8.74657 17.4966C8.45118 17.4966 8.16534 17.392 7.93973 17.2013C7.71412 17.0106 7.56332 16.7462 7.51407 16.455C7.16532 14.3675 6.49532 12.955 5.51907 11.9775C4.54282 11.0012 3.12907 10.3313 1.04157 9.9825C0.75032 9.93325 0.485925 9.78244 0.295265 9.55683C0.104604 9.33122 0 9.04538 0 8.75C0 8.45462 0.104604 8.16878 0.295265 7.94317C0.485925 7.71756 0.75032 7.56675 1.04157 7.5175C3.12907 7.16875 4.54157 6.49875 5.51907 5.5225C6.49532 4.54625 7.16532 3.1325 7.51407 1.045L7.53657 0.93375C7.60654 0.666178 7.76328 0.429366 7.98223 0.260399C8.20119 0.0914327 8.47 -0.000147423 8.74657 1.78139e-07Z" fill="#0456FF" />
                        </svg>
                        <span className="font-medium text-[14px] leading-[100%] text-[#0456FF]">Modern Designs</span>
                    </div>
                    <div className="border border-[#0456FF26] bg-[#0456FF26] rounded-[6px] flex flex-wrap items-center gap-3 px-[13px] py-[10px]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="17" viewBox="0 0 18 17" fill="none">
                            <path d="M8.23125 0.15625L8.69375 1.30625L9.84375 1.76875C9.9375 1.80625 10 1.9 10 2C10 2.1 9.9375 2.19375 9.84375 2.23125L8.69375 2.69375L8.23125 3.84375C8.19375 3.9375 8.1 4 8 4C7.9 4 7.80625 3.9375 7.76875 3.84375L7.30625 2.69375L6.15625 2.23125C6.0625 2.19375 6 2.1 6 2C6 1.9 6.0625 1.80625 6.15625 1.76875L7.30625 1.30625L7.76875 0.15625C7.80625 0.0625 7.9 0 8 0C8.1 0 8.19375 0.0625 8.23125 0.15625ZM3.45937 2.30312L4.13125 3.86875L5.69688 4.54063C5.88125 4.61875 6 4.8 6 5C6 5.2 5.88125 5.38125 5.69688 5.45937L4.13125 6.13125L3.45937 7.69687C3.38125 7.88125 3.2 8 3 8C2.8 8 2.61875 7.88125 2.54063 7.69687L1.86875 6.13125L0.303125 5.45937C0.11875 5.38125 0 5.2 0 5C0 4.8 0.11875 4.61875 0.303125 4.54063L1.86875 3.86875L2.54063 2.30312C2.61875 2.11875 2.8 2 3 2C3.2 2 3.38125 2.11875 3.45937 2.30312ZM14.5 10.5C14.7 10.5 14.8813 10.6188 14.9594 10.8031L15.6313 12.3687L17.1969 13.0406C17.3813 13.1187 17.5 13.3 17.5 13.5C17.5 13.7 17.3813 13.8813 17.1969 13.9594L15.6313 14.6313L14.9594 16.1969C14.8813 16.3813 14.7 16.5 14.5 16.5C14.3 16.5 14.1187 16.3813 14.0406 16.1969L13.3687 14.6313L11.8031 13.9594C11.6188 13.8813 11.5 13.7 11.5 13.5C11.5 13.3 11.6188 13.1187 11.8031 13.0406L13.3687 12.3687L14.0406 10.8031C14.1187 10.6188 14.3 10.5 14.5 10.5ZM14.375 1C14.7188 1 15.05 1.1375 15.2969 1.38125L16.6187 2.70312C16.8625 2.95 17 3.28125 17 3.625C17 3.96875 16.8625 4.3 16.6187 4.54688L13.8625 7.30313L10.6969 4.1375L13.4531 1.38125C13.7 1.1375 14.0312 1 14.375 1ZM1.38125 13.4531L9.6375 5.19688L12.8031 8.3625L4.54688 16.6187C4.3 16.8625 3.96875 17 3.625 17C3.28125 17 2.95 16.8625 2.70312 16.6187L1.38125 15.2969C1.1375 15.05 1 14.7188 1 14.375C1 14.0312 1.1375 13.7 1.38125 13.4531Z" fill="#0456FF" />
                        </svg>
                        <span className="font-medium text-[14px] leading-[100%] text-[#0456FF]">Easy to Customize</span>
                    </div>
                    <div className="border border-[#0456FF26] bg-[#0456FF26] rounded-[6px] flex flex-wrap items-center gap-3 px-[13px] py-[10px]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <g clipPath="url(#clip0_321_519)">
                                <path d="M17.2288 2.76626L17.2475 2.77126C17.3208 2.79771 17.3841 2.84611 17.4289 2.90986C17.4736 2.97361 17.4977 3.04961 17.4977 3.12751C17.4977 3.20541 17.4736 3.28141 17.4289 3.34516C17.3841 3.40891 17.3208 3.45731 17.2475 3.48376L16.2913 3.79376C16.0002 3.89056 15.7358 4.05381 15.5188 4.27056C15.3019 4.4873 15.1383 4.7516 15.0413 5.04251L14.7312 5.99751C14.7055 6.07117 14.6575 6.13496 14.5938 6.18001C14.5313 6.22466 14.4567 6.2491 14.38 6.25001H14.375C14.2967 6.25039 14.2202 6.22624 14.1563 6.18096C14.0924 6.13568 14.0443 6.07152 14.0188 5.99751L13.7075 5.04251C13.611 4.75104 13.4479 4.48608 13.2312 4.26866C13.0144 4.05124 12.7499 3.88736 12.4587 3.79001L11.5025 3.47876C11.4287 3.45288 11.3647 3.4047 11.3194 3.34088C11.2742 3.27706 11.2499 3.20075 11.2499 3.12251C11.2499 3.04427 11.2742 2.96796 11.3194 2.90414C11.3647 2.84032 11.4287 2.79214 11.5025 2.76626L12.4587 2.45626C12.7461 2.35683 13.0065 2.19241 13.2199 1.97581C13.4332 1.75921 13.5937 1.49628 13.6888 1.20751L14 0.252509C14.0259 0.178674 14.0741 0.114704 14.1379 0.069446C14.2017 0.0241879 14.278 -0.00012207 14.3562 -0.00012207C14.4345 -0.00012207 14.5108 0.0241879 14.5746 0.069446C14.6384 0.114704 14.6866 0.178674 14.7125 0.252509L15.0238 1.20751C15.1207 1.49828 15.284 1.76249 15.5008 1.97923C15.7175 2.19597 15.9817 2.35929 16.2725 2.45626L17.2288 2.76626ZM19.7825 7.21376L19.0175 6.96376C18.7847 6.88681 18.573 6.75657 18.3994 6.58339C18.2258 6.41022 18.095 6.1989 18.0175 5.96626L17.77 5.20126C17.7491 5.14242 17.7104 5.0915 17.6594 5.05549C17.6084 5.01949 17.5475 5.00016 17.485 5.00016C17.4225 5.00016 17.3616 5.01949 17.3106 5.05549C17.2596 5.0915 17.2209 5.14242 17.2 5.20126L16.95 5.96626C16.8744 6.19726 16.7464 6.40762 16.5759 6.58089C16.4055 6.75416 16.1972 6.88563 15.9675 6.96501L15.2013 7.21376C15.1428 7.23494 15.0924 7.27361 15.0567 7.32449C15.021 7.37537 15.0019 7.436 15.0019 7.49813C15.0019 7.56027 15.021 7.6209 15.0567 7.67178C15.0924 7.72266 15.1428 7.76132 15.2013 7.78251L15.9675 8.03251C16.2004 8.10987 16.4119 8.24057 16.5853 8.41419C16.7587 8.58781 16.8892 8.79954 16.9662 9.03251L17.215 9.79876C17.2353 9.85818 17.2738 9.90975 17.3249 9.94626C17.376 9.98278 17.4372 10.0024 17.5 10.0024C17.5628 10.0024 17.624 9.98278 17.6751 9.94626C17.7262 9.90975 17.7647 9.85818 17.785 9.79876L18.035 9.03376C18.1121 8.80116 18.2424 8.58976 18.4156 8.41638C18.5888 8.243 18.8 8.11241 19.0325 8.03501L19.7987 7.78626C19.8572 7.76507 19.9076 7.72641 19.9433 7.67553C19.979 7.62465 19.9981 7.56402 19.9981 7.50188C19.9981 7.43975 19.979 7.37912 19.9433 7.32824C19.9076 7.27736 19.8572 7.2387 19.7987 7.21751L19.7825 7.21376ZM4.6875 2.50001C4.10734 2.50001 3.55094 2.73048 3.1407 3.14071C2.73047 3.55095 2.5 4.10735 2.5 4.68751V7.81251C2.5 9.02001 3.48 10 4.6875 10H7.8125C8.39266 10 8.94906 9.76954 9.3593 9.35931C9.76953 8.94907 10 8.39267 10 7.81251V4.68751C10 4.10735 9.76953 3.55095 9.3593 3.14071C8.94906 2.73048 8.39266 2.50001 7.8125 2.50001H4.6875ZM3.75 4.68751C3.75 4.43887 3.84877 4.20041 4.02459 4.0246C4.2004 3.84878 4.43886 3.75001 4.6875 3.75001H7.8125C8.06114 3.75001 8.2996 3.84878 8.47541 4.0246C8.65123 4.20041 8.75 4.43887 8.75 4.68751V7.81251C8.75 8.06115 8.65123 8.29961 8.47541 8.47542C8.2996 8.65124 8.06114 8.75001 7.8125 8.75001H4.6875C4.43886 8.75001 4.2004 8.65124 4.02459 8.47542C3.84877 8.29961 3.75 8.06115 3.75 7.81251V4.68751ZM10.9375 11.25C10.3573 11.25 9.80094 11.4805 9.3907 11.8907C8.98047 12.3009 8.75 12.8573 8.75 13.4375V15.3125C8.75 16.52 9.73 17.5 10.9375 17.5H15.3125C15.8927 17.5 16.4491 17.2695 16.8593 16.8593C17.2695 16.4491 17.5 15.8927 17.5 15.3125V13.4375C17.5 12.8573 17.2695 12.3009 16.8593 11.8907C16.4491 11.4805 15.8927 11.25 15.3125 11.25H10.9375ZM10 13.4375C10 13.1889 10.0988 12.9504 10.2746 12.7746C10.4504 12.5988 10.6889 12.5 10.9375 12.5H15.3125C15.5611 12.5 15.7996 12.5988 15.9754 12.7746C16.1512 12.9504 16.25 13.1889 16.25 13.4375V15.3125C16.25 15.5611 16.1512 15.7996 15.9754 15.9754C15.7996 16.1512 15.5611 16.25 15.3125 16.25H10.9375C10.6889 16.25 10.4504 16.1512 10.2746 15.9754C10.0988 15.7996 10 15.5611 10 15.3125V13.4375ZM2.5 13.4375C2.5 12.23 3.48 11.25 4.6875 11.25H5.3125C6.52 11.25 7.5 12.23 7.5 13.4375V15.3125C7.5 15.8927 7.26953 16.4491 6.8593 16.8593C6.44906 17.2695 5.89266 17.5 5.3125 17.5H4.6875C4.10734 17.5 3.55094 17.2695 3.1407 16.8593C2.73047 16.4491 2.5 15.8927 2.5 15.3125V13.4375ZM4.6875 12.5C4.43886 12.5 4.2004 12.5988 4.02459 12.7746C3.84877 12.9504 3.75 13.1889 3.75 13.4375V15.3125C3.75 15.83 4.17 16.25 4.6875 16.25H5.3125C5.56114 16.25 5.7996 16.1512 5.97541 15.9754C6.15123 15.7996 6.25 15.5611 6.25 15.3125V13.4375C6.25 13.1889 6.15123 12.9504 5.97541 12.7746C5.7996 12.5988 5.56114 12.5 5.3125 12.5H4.6875Z" fill="#0456FF" />
                            </g>
                            <defs>
                                <clipPath id="clip0_321_519">
                                    <rect width="20" height="20" fill="white" />
                                </clipPath>
                            </defs>
                        </svg>
                        <span className="font-medium text-[14px] leading-[100%] text-[#0456FF]">Professional Layouts</span>
                    </div>
                </div>
                <div className="mt-[50px]">
                    {loading ? (
                        <p className="text-sm text-[#00002480]">Loading templates...</p>
                    ) : templates.length === 0 ? (
                        <p className="text-sm text-[#00002480]">No templates available.</p>
                    ) : (
                        <div className="grid grid-cols-3 gap-[20px]">
                            {templates.map((template) => {
                                const isCurrent = template.id === currentTemplateId;
                                const isSelected = template.id === selectedTemplateId;

                                return (
                                    <div
                                        key={template.id}
                                        onClick={() => handleSelectTemplate(template.id)}
                                        className={`relative cursor-pointer rounded-[8px] border-2 p-[10px] transition-all flex flex-col justify-between ${isSelected
                                            ? "border-[#0456FF]"
                                            : "border-[#0456FF26]"
                                            }`}
                                    >
                                        {isCurrent && (
                                            <span className="absolute top-2 right-2 bg-[#0456FF] text-white text-[10px] font-semibold px-2 py-[2px] rounded-[4px] z-10">
                                                Current
                                            </span>
                                        )}
                                        {template.preview ? (
                                            <Image
                                                src={getImageUrl(template.preview)}
                                                alt={template.name}
                                                width={220}
                                                height={300}
                                                className="w-full h-auto rounded-[4px] object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-[300px] bg-gray-100 rounded-[4px] flex items-center justify-center text-xs text-gray-400">No preview</div>
                                        )}
                                        <p className="text-center font-medium text-[14px] mt-[10px] font-semibold">{template.name}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {showActionButton && (
                    <button
                        onClick={isEditing ? handleUpdate : handleContinue}
                        disabled={saving}
                        className="inline-block border border-[#0456FF] mt-[30px] bg-[#0456FF] text-white px-[24px] py-[12px] rounded-[6px] font-semibold text-[14px] fixed bottom-[80px] left-1/2 -translate-x-1/2 cursor-pointer hover:bg-transparent hover:text-[#0456FF] transition-colors duration-300 disabled:opacity-50"
                    >
                        {saving
                            ? (isEditing ? "Updating..." : "Setting up...")
                            : (isEditing ? "Update" : "Continue with this template")}
                    </button>
                )}
            </div>
            <div className="w-[calc(30%-7.5px)]"></div>
        </div>
    );
}