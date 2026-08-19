"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/services/api";
import { useResumeId } from "@/hooks/useResumeId";
import ProgressPanel from "@/components/dashboard/ProgressPanel";
import Loader from "@/components/ui/Loader";

function withMinDelay<T>(promise: Promise<T>, ms = 1000): Promise<T> {
    return Promise.all([
        promise,
        new Promise((resolve) => setTimeout(resolve, ms)),
    ]).then(([result]) => result as T);
}

export default function PreviewPage() {
    const router = useRouter();
    const resumeId = useResumeId();
    const [html, setHtml] = useState("");
    const [resumeName, setResumeName] = useState("");
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState<"pdf" | "docx" | null>(null);

    const fetchPreview = useCallback(async () => {
        try {
            const previewRes = await withMinDelay(
                api.get(`/resume/builder/${resumeId}/preview`)
            );
            if (previewRes.data?.success) {
                setHtml(previewRes.data.html || "");
                setResumeName(previewRes.data.resumeName || "Untitled Resume");
            }
        } catch (err) {
            console.error("Failed to load preview", err);
            toast.error("Failed to load resume preview.");
        } finally {
            setLoading(false);
        }
    }, [resumeId]);

    useEffect(() => {
        if (!resumeId) return;
        fetchPreview();
    }, [fetchPreview]);

    const handleDownload = async (format: "pdf" | "docx") => {
        if (!resumeId) return;
        setDownloading(format);
        try {
            const res = await api.get(
                `/resume/builder/${resumeId}/download?format=${format}`,
                { responseType: "blob" }
            );

            const blob = new Blob([res.data], {
                type:
                    format === "pdf"
                        ? "application/pdf"
                        : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute(
                "download",
                `${resumeName.toLowerCase().replace(/\s+/g, "_") || "resume"}.${format}`
            );
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success(`Downloaded ${format.toUpperCase()} successfully!`);
        } catch (err) {
            console.error(`Failed to download ${format}`, err);
            toast.error(`Failed to download ${format.toUpperCase()} file.`);
        } finally {
            setDownloading(null);
        }
    };

    const handlePrevious = () => {
        router.push(`/templates/resume-builder/summary?resumeId=${resumeId}`);
    };

    if (loading) return <Loader />;

    if (!resumeId) {
        return (
            <div className="p-5 border border-[#0456FF26] rounded-[10px] text-center">
                <p className="text-sm font-semibold text-red-500">
                    No active resume ID found. Please select a resume first.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                    <div>
                        <h4 className="font-bold text-[20px] leading-none text-black mb-[15px]">{resumeName}</h4>
                        <p className="font-normal text-[15px] leading-[140%] text-[#00002480] inline-block">Preview your resume before downloading.</p>
                    </div>
                    <div className="flex flex-wrap gap-3 items-center">
                        <button type="button" onClick={() => router.push(`/templates?resumeId=${resumeId}`)}
                            className="border border-[#0456FF] bg-white py-[11px] px-[26px] rounded-[5px] font-semibold text-[14px] leading-none text-[#0456FF] cursor-pointer hover:bg-[#0456FF] hover:text-white transition-colors duration-300"
                        >
                            Change Template
                        </button>
                    </div>
                </div>
                <div className="">
                    <iframe
                        srcDoc={html}
                        className="w-full min-h-[850px] lg:min-h-[1050px] border-none block"
                        title="Resume Preview"
                    />
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
                </div>
            </div>
            <div className="w-[325px] shrink-0 flex flex-col gap-y-5">
                <div className="border border-[#CACACA80] flex flex-col px-4 py-3 gap-y-3 rounded-[6px]">
                    <div className="flex flex-wrap gap-[10px] items-center">
                        <div className="w-[30px]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none">
                                <rect width="30" height="30" rx="4" fill="#0456FF" fillOpacity="0.15" />
                                <path d="M14.6877 17.9274C14.5904 17.8924 14.5002 17.8333 14.4168 17.7499L11.4168 14.7499C11.2502 14.5833 11.1702 14.3888 11.1768 14.1666C11.1835 13.9444 11.2635 13.7499 11.4168 13.5833C11.5835 13.4166 11.7816 13.3299 12.011 13.3233C12.2404 13.3166 12.4382 13.3963 12.6043 13.5624L14.1668 15.1249V9.16659C14.1668 8.93048 14.2468 8.7327 14.4068 8.57325C14.5668 8.41381 14.7646 8.33381 15.0002 8.33325C15.2357 8.3327 15.4338 8.4127 15.5943 8.57325C15.7549 8.73381 15.8346 8.93159 15.8335 9.16659V15.1249L17.396 13.5624C17.5627 13.3958 17.7607 13.3158 17.9902 13.3224C18.2196 13.3291 18.4174 13.416 18.5835 13.5833C18.7363 13.7499 18.8163 13.9444 18.8235 14.1666C18.8307 14.3888 18.7507 14.5833 18.5835 14.7499L15.5835 17.7499C15.5002 17.8333 15.4099 17.8924 15.3127 17.9274C15.2154 17.9624 15.1113 17.9796 15.0002 17.9791C14.8891 17.9785 14.7849 17.9613 14.6877 17.9274ZM10.0002 21.6666C9.54183 21.6666 9.14961 21.5035 8.8235 21.1774C8.49738 20.8513 8.33405 20.4588 8.3335 19.9999V18.3333C8.3335 18.0971 8.4135 17.8994 8.5735 17.7399C8.7335 17.5805 8.93127 17.5005 9.16683 17.4999C9.40238 17.4994 9.60044 17.5794 9.761 17.7399C9.92155 17.9005 10.0013 18.0983 10.0002 18.3333V19.9999H20.0002V18.3333C20.0002 18.0971 20.0802 17.8994 20.2402 17.7399C20.4002 17.5805 20.5979 17.5005 20.8335 17.4999C21.069 17.4994 21.2671 17.5794 21.4277 17.7399C21.5882 17.9005 21.6679 18.0983 21.6668 18.3333V19.9999C21.6668 20.4583 21.5038 20.8508 21.1777 21.1774C20.8516 21.5041 20.459 21.6671 20.0002 21.6666H10.0002Z" fill="#0456FF" />
                            </svg>
                        </div>
                        <div className="w-[calc(100%-45px)]">
                            <h6 className="font-bold text-[15px] leading-[140%] text-[#000024]">Download Resume</h6>
                        </div>
                    </div>
                    <p className="font-normal text-[12px] leading-[120%] text-[#000024CC]">Get your professional resume in multiple formats.</p>
                    <button
                        type="button"
                        onClick={() => handleDownload("pdf")}
                        disabled={downloading !== null}
                        className="flex items-center gap-[10px] border border-[#FF0000] bg-white py-[9px] px-[18px] rounded-[5px] font-semibold text-[13px] leading-none text-[#FF0000] cursor-pointer hover:bg-[#FF0000] hover:text-white transition-colors duration-300 disabled:opacity-50 shrink-0"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="20" viewBox="0 0 16 20" fill="none">
                            <path d="M9 7H14.5L9 1.5V7ZM2 0H10L16 6V18C16 18.5304 15.7893 19.0391 15.4142 19.4142C15.0391 19.7893 14.5304 20 14 20H2C1.46957 20 0.960859 19.7893 0.585786 19.4142C0.210714 19.0391 0 18.5304 0 18V2C0 1.46957 0.210714 0.960859 0.585786 0.585786C0.960859 0.210714 1.46957 0 2 0ZM6.93 10.44C7.34 11.34 7.86 12.08 8.46 12.59L8.87 12.91C8 13.07 6.8 13.35 5.53 13.84L5.42 13.88L5.92 12.84C6.37 11.97 6.7 11.18 6.93 10.44ZM13.41 14.25C13.59 14.07 13.68 13.84 13.69 13.59C13.72 13.39 13.67 13.2 13.57 13.04C13.28 12.57 12.53 12.35 11.29 12.35L10 12.42L9.13 11.84C8.5 11.32 7.93 10.41 7.53 9.28L7.57 9.14C7.9 7.81 8.21 6.2 7.55 5.54C7.46927 5.46161 7.37378 5.40003 7.26907 5.35883C7.16435 5.31763 7.0525 5.29764 6.94 5.3H6.7C6.33 5.3 6 5.69 5.91 6.07C5.54 7.4 5.76 8.13 6.13 9.34V9.35C5.88 10.23 5.56 11.25 5.05 12.28L4.09 14.08L3.2 14.57C2 15.32 1.43 16.16 1.32 16.69C1.28 16.88 1.3 17.05 1.37 17.23L1.4 17.28L1.88 17.59L2.32 17.7C3.13 17.7 4.05 16.75 5.29 14.63L5.47 14.56C6.5 14.23 7.78 14 9.5 13.81C10.53 14.32 11.74 14.55 12.5 14.55C12.94 14.55 13.24 14.44 13.41 14.25ZM13 13.54L13.09 13.65C13.08 13.75 13.05 13.76 13 13.78H12.96L12.77 13.8C12.31 13.8 11.6 13.61 10.87 13.29C10.96 13.19 11 13.19 11.1 13.19C12.5 13.19 12.9 13.44 13 13.54ZM3.83 15C3.18 16.19 2.59 16.85 2.14 17C2.19 16.62 2.64 15.96 3.35 15.31L3.83 15ZM6.85 8.09C6.62 7.19 6.61 6.46 6.78 6.04L6.85 5.92L7 5.97C7.17 6.21 7.19 6.53 7.09 7.07L7.06 7.23L6.9 8.05L6.85 8.09Z" fill="currentColor" fillOpacity="0.9" />
                        </svg>
                        {downloading === "pdf" ? "Downloading..." : "Download PDF"}
                    </button>
                    <button
                        type="button"
                        onClick={() => handleDownload("docx")}
                        disabled={downloading !== null}
                        className="flex items-center gap-[10px] border border-[#0456FFE5] bg-white py-[9px] px-[18px] rounded-[5px] font-semibold text-[13px] leading-none text-[#0456FFE5] cursor-pointer hover:bg-[#0456FFE5] hover:text-white transition-colors duration-300 disabled:opacity-50 shrink-0"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="19" viewBox="0 0 17 19" fill="none">
                            <path d="M12.5008 14.9359H15.0008V3.26922H12.5008V1.60256H15.8342C16.0552 1.60256 16.2671 1.69035 16.4234 1.84663C16.5797 2.00291 16.6675 2.21488 16.6675 2.43589V15.7692C16.6675 15.9902 16.5797 16.2022 16.4234 16.3585C16.2671 16.5148 16.0552 16.6026 15.8342 16.6026H12.5008V14.9359ZM0.716667 1.50006L11.1917 0.00422237C11.2507 -0.00424828 11.3109 5.82961e-05 11.3681 0.016851C11.4254 0.0336437 11.4783 0.062531 11.5234 0.10156C11.5686 0.140588 11.6048 0.188848 11.6296 0.243077C11.6545 0.297305 11.6674 0.356237 11.6675 0.415889V17.7892C11.6674 17.8488 11.6545 17.9076 11.6297 17.9618C11.6049 18.016 11.5687 18.0642 11.5237 18.1032C11.4787 18.1422 11.4258 18.1711 11.3687 18.188C11.3116 18.2048 11.2515 18.2092 11.1925 18.2009L0.715833 16.7051C0.517182 16.6768 0.33541 16.5777 0.203907 16.4262C0.0724043 16.2746 1.92548e-06 16.0807 0 15.8801V2.32506C1.92548e-06 2.1244 0.0724043 1.93048 0.203907 1.77893C0.33541 1.62737 0.518016 1.52835 0.716667 1.50006ZM1.6675 3.04839V15.1567L10.0008 16.3476V1.85756L1.6675 3.04839ZM7.50083 5.76922H9.1675V12.4359H7.50083L5.83417 10.7692L4.1675 12.4359H2.50083V5.76922H4.1675L4.17583 9.93589L5.83417 8.26922L7.50083 9.92672V5.76922Z" fill="currentColor" fillOpacity="0.8" />
                        </svg>
                        {downloading === "docx" ? "Downloading..." : "Download DOCX"}
                    </button>
                </div>
                <div className="border border-[#CACACA80] flex flex-col px-4 py-3 gap-y-3 rounded-[6px]">
                    <div className="flex flex-wrap gap-[10px] items-center">
                        <div className="w-[30px]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none">
                                <rect width="30" height="30" rx="4" fill="#0456FF" fillOpacity="0.15" />
                                <path d="M22.5 14.1668C22.5 18.7918 19.3 23.1168 15 24.1668C10.7 23.1168 7.5 18.7918 7.5 14.1668V9.16683L15 5.8335L22.5 9.16683V14.1668ZM15 22.5002C18.125 21.6668 20.8333 17.9502 20.8333 14.3502V10.2502L15 7.65016L9.16667 10.2502V14.3502C9.16667 17.9502 11.875 21.6668 15 22.5002ZM13.3333 19.1668L10 15.8335L11.175 14.6585L13.3333 16.8085L18.825 11.3168L20 12.5002" fill="#0456FF" />
                            </svg>
                        </div>
                        <div className="w-[calc(100%-45px)]">
                            <h6 className="font-bold text-[15px] leading-[140%] text-[#000024]">Check ATS Score</h6>
                        </div>
                    </div>
                    <p className="font-normal text-[12px] leading-[120%] text-[#000024CC]">Analyze your resume and improve your chances.</p>
                    <button
                        type="button"
                        className="flex items-center gap-[10px] border border-[#29B33A] bg-white py-[9px] px-[18px] rounded-[5px] font-semibold text-[13px] leading-none text-[#29B33A] cursor-pointer hover:bg-[#29B33A] hover:text-white transition-colors duration-300 disabled:opacity-50 shrink-0"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="21" viewBox="0 0 20 21" fill="none">
                            <path d="M16.1249 11.696C15.6464 11.7214 15.1703 11.6123 14.7506 11.3811C14.3308 11.1498 13.9842 10.8057 13.7499 10.3877C13.7294 10.3534 13.6991 10.326 13.6629 10.3091C13.6267 10.2922 13.5863 10.2865 13.5469 10.2928C13.5074 10.2991 13.4708 10.317 13.4416 10.3443C13.4124 10.3716 13.3921 10.4071 13.3833 10.446L12.0666 14.6127C11.9795 14.8634 11.8143 15.0796 11.5954 15.2295C11.3764 15.3795 11.1152 15.4554 10.8499 15.446C10.582 15.4503 10.32 15.3672 10.1035 15.2094C9.88696 15.0515 9.72775 14.8274 9.64993 14.571L7.7166 7.36268C7.70704 7.31558 7.68149 7.27324 7.64428 7.24283C7.60707 7.21241 7.56049 7.1958 7.51243 7.1958C7.46438 7.1958 7.4178 7.21241 7.38059 7.24283C7.34338 7.27324 7.31783 7.31558 7.30827 7.36268C7.11959 8.44522 6.78311 9.49671 6.30827 10.4877C6.08964 10.8846 5.76094 11.2098 5.36174 11.4242C4.96254 11.6386 4.50988 11.733 4.05827 11.696H0.141602C0.537666 14.0239 1.74474 16.1366 3.54907 17.6598C5.35341 19.1831 7.63858 20.0187 9.99993 20.0187C12.3613 20.0187 14.6465 19.1831 16.4508 17.6598C18.2551 16.1366 19.4622 14.0239 19.8583 11.696H16.1249Z" fill="currentColor" />
                            <path d="M4.05838 10.0292C4.84171 10.0292 4.89171 10.0292 5.65838 7.06254C5.82504 6.37921 6.03338 5.57921 6.28338 4.64588C6.36467 4.38896 6.52733 4.16546 6.74681 4.00912C6.96629 3.85278 7.23067 3.77208 7.50004 3.77921C7.76443 3.76899 8.02503 3.84464 8.24284 3.99486C8.46066 4.14507 8.62398 4.36178 8.70838 4.61254L10.7084 12.0542C10.721 12.0975 10.7473 12.1355 10.7834 12.1625C10.8194 12.1896 10.8633 12.2042 10.9084 12.2042C10.9535 12.2042 10.9973 12.1896 11.0334 12.1625C11.0694 12.1355 11.0958 12.0975 11.1084 12.0542L12.2334 8.47921C12.3153 8.24327 12.4665 8.03753 12.6672 7.88887C12.8679 7.7402 13.1088 7.65552 13.3584 7.64588C13.5997 7.62732 13.8413 7.67877 14.0541 7.79406C14.267 7.90935 14.4421 8.08359 14.5584 8.29588L14.8 8.76254C15.2834 9.73754 15.425 9.97088 16.125 9.97088H20C19.9923 7.31871 18.9313 4.77824 17.0505 2.90835C15.1697 1.03846 12.623 -0.00769289 9.97088 4.2595e-05C7.31871 0.00777808 4.77824 1.06877 2.90835 2.9496C1.03846 4.83043 -0.00769283 7.37704 4.25944e-05 10.0292H4.05838Z" fill="currentColor" />
                        </svg>
                        Check ATS Score
                    </button>
                </div>
                <ProgressPanel />
            </div>
        </div>
    );
}