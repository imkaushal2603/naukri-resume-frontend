"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import api from "@/services/api";
import Loader from "@/components/ui/Loader";

function withMinDelay<T>(promise: Promise<T>, ms = 1000): Promise<T> {
    return Promise.all([
        promise,
        new Promise((resolve) => setTimeout(resolve, ms)),
    ]).then(([result]) => result as T);
}

export default function CoverLetterPreviewPage() {
    const router = useRouter();
    const params = useParams();

    const templateKey = (params?.templateKey as string) || "classic";

    const [html, setHtml] = useState<string>("");
    const [coverLetterName, setCoverLetterName] = useState<string>("Cover Letter");
    const [loading, setLoading] = useState<boolean>(true);
    const [downloading, setDownloading] = useState<"pdf" | "docx" | null>(null);
    const [membership, setMembership] = useState<any>(null);

    const fetchData = useCallback(async () => {
        const saved = sessionStorage.getItem("coverLetterData");
        if (!saved) {
            toast.error("No cover letter data found. Please fill in the form first.");
            router.push(`/cover-letter/${templateKey}/basic-info`);
            return;
        }

        const formData = JSON.parse(saved);

        const requiredFields = ["fullName", "email", "phone", "jobTitle", "companyName", "summary"];
        const missing = requiredFields.filter((f) => !formData[f]?.toString().trim());
        if (missing.length > 0) {
            toast.error("Some required details are missing. Please complete the form.");
            router.push(`/cover-letter/${templateKey}/basic-info`);
            return;
        }

        try {
            const [previewRes, membershipRes] = await withMinDelay(
                Promise.all([
                    api.post(`/cover-letter/preview`, { templateKey, ...formData }),
                    api.get("/membership").catch(() => null),
                ])
            );

            if (previewRes.data?.success) {
                setHtml(previewRes.data.html || "");
                setCoverLetterName(`${formData.jobTitle || "Cover Letter"} - ${formData.companyName || ""}`);
            }

            if (membershipRes?.data?.success) {
                setMembership(membershipRes.data.status);
            }
        } catch (err: any) {
            console.error("Failed to load cover letter preview", err);
            toast.error(err.response?.data?.message || "Failed to load cover letter preview.");
            router.push(`/cover-letter/${templateKey}/basic-info`);
        } finally {
            setLoading(false);
        }
    }, [templateKey, router]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDownload = async () => {
        const saved = sessionStorage.getItem("coverLetterData");
        if (!saved) {
            toast.error("No cover letter data found.");
            return;
        }
        const formData = JSON.parse(saved);

        setDownloading("pdf");
        try {
            const res = await api.post(
                "/cover-letter/download",
                { templateKey, ...formData },
                { responseType: "blob" }
            );
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `${formData.fullName || "Cover_Letter"}_Cover_Letter.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success("Cover letter downloaded!");
        } catch (err: any) {
            console.error("Failed to download cover letter", err);
            if (err.response?.data instanceof Blob) {
                try {
                    const text = await err.response.data.text();
                    const parsed = JSON.parse(text);
                    toast.error(parsed.message || "Failed to download cover letter.");
                } catch {
                    toast.error("Failed to download cover letter.");
                }
            } else {
                toast.error(err.response?.data?.message || "Failed to download cover letter.");
            }
        } finally {
            setDownloading(null);
        }
    };

    const handlePrevious = () => {
        router.push(`/cover-letter/${templateKey}/basic-info`);
    };

    return (
        <div className="relative">
            {loading && <Loader overlay />}
            <div className="flex flex-wrap gap-6">
                <div className="flex-1">
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                        <div className="max-[768px]:w-full">
                            <h4 className="font-bold text-[20px] leading-none text-black mb-[15px]">{coverLetterName}</h4>
                            <p className="font-normal text-[15px] leading-[140%] text-[#00002480] inline-block">Preview your cover letter before downloading.</p>
                        </div>
                        <div className="flex flex-wrap gap-3 items-center">
                            <button
                                type="button"
                                onClick={() => router.push(`/cover-letter?editing=true`)}
                                className="border border-[#0456FF] bg-white py-[11px] px-[26px] rounded-[5px] font-semibold text-[14px] leading-none text-[#0456FF] cursor-pointer hover:bg-[#0456FF] hover:text-white transition-colors duration-300"
                            >
                                Change Template
                            </button>
                        </div>
                    </div>
                    <div>
                        <iframe srcDoc={html} className="w-full min-h-[850px] lg:min-h-[1050px] border-none block" title="Cover Letter Preview" />
                    </div>
                    {!membership && (
                        <div className="bg-[#0456FF0D] border border-[#CACACA80] rounded-[8px] p-[15px] flex flex-wrap gap-[10px] items-center mt-[50px]">
                            <div className="w-[36px]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">
                                    <rect width="36" height="36" rx="4" fill="#0456FF" fillOpacity="0.15" />
                                    <path d="M18 21V23M18 21C18.2652 21 18.5196 20.8946 18.7071 20.7071C18.8946 20.5196 19 20.2652 19 20C19 19.7348 18.8946 19.4804 18.7071 19.2929C18.5196 19.1054 18.2652 19 18 19C17.7348 19 17.4804 19.1054 17.2929 19.2929C17.1054 19.4804 17 19.7348 17 20C17 20.2652 17.1054 20.5196 17.2929 20.7071C17.4804 20.8946 17.7348 21 18 21ZM23 15V14C23 12.6739 22.4732 11.4021 21.5355 10.4645C20.5979 9.52678 19.3261 9 18 9C16.6739 9 15.4021 9.52678 14.4645 10.4645C13.5268 11.4021 13 12.6739 13 14V15H23ZM11 27H25C25.2652 27 25.5196 26.8946 25.7071 26.7071C25.8946 26.5196 26 26.2652 26 26V16C26 15.7348 25.8946 15.4804 25.7071 15.2929C25.5196 15.1054 25.2652 15 25 15H11C10.7348 15 10.4804 15.1054 10.2929 15.2929C10.1054 15.4804 10 15.7348 10 16V26C10 26.2652 10.1054 26.5196 10.2929 26.7071C10.4804 26.8946 10.7348 27 11 27Z" stroke="#000024" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </div>
                            <div className="w-[calc(100%-46px)] leading-[0]">
                                <h6 className="font-bold text-[15px] leading-[140%] text-[#000024] mb-[6px]">Payment Required to Download</h6>
                                <p className="font-normal text-[12px] leading-normal text-[#00002499] inline-block">Please complete the payment to download your cover letter in PDF or DOCX format and unlock all premium features.</p>
                            </div>
                        </div>
                    )}
                    <div className="flex flex-wrap gap-[10px] justify-between my-[30px] pt-[42px] border-t border-[#0456FF26]">
                        <button
                            type="button"
                            onClick={handlePrevious}
                            className="h-fit flex gap-[10px] items-center border border-[#0456FF] bg-white py-[11px] px-[26px] rounded-[5px] font-semibold text-[14px] leading-none text-[#0456FF] cursor-pointer hover:bg-[#0456FF] hover:text-white transition-colors duration-300"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="14" viewBox="0 0 16 14" fill="none">
                                <path d="M1 7L15 7M7 1L1 7L7 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Previous
                        </button>
                        {!membership && (
                            <div className="flex flex-col gap-y-[10px]">
                                <Link href="/plans" className="inline-block border border-[#0456FF] bg-[#0456FF] py-[11px] px-[26px] rounded-[5px] font-semibold text-[14px] leading-none text-white cursor-pointer hover:bg-transparent hover:text-[#0456FF] transition-colors duration-300">
                                    Proceed to Payment
                                </Link>
                                <p className="font-normal text-[12px] leading-[140%] text-[#000024CC] text-center">Secure payment Cancel anytime</p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="w-[325px] shrink-0 flex flex-col gap-y-5 max-[1300px]:w-full min-[768px]:max-[1300px]:flex-wrap min-[768px]:max-[1300px]:[flex-direction:unset] min-[768px]:max-[1300px]:gap-x-[20px]">
                    <div className="border border-[#CACACA80] flex flex-col px-4 py-3 gap-y-3 rounded-[6px] min-[768px]:max-[1300px]:w-[calc(50%-10px)]">
                        <div className="flex flex-wrap gap-[10px] items-center">
                            <div className="w-[30px]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none">
                                    <rect width="30" height="30" rx="4" fill="#0456FF" fillOpacity="0.15" />
                                    <path d="M14.6877 17.9274C14.5904 17.8924 14.5002 17.8333 14.4168 17.7499L11.4168 14.7499C11.2502 14.5833 11.1702 14.3888 11.1768 14.1666C11.1835 13.9444 11.2635 13.7499 11.4168 13.5833C11.5835 13.4166 11.7816 13.3299 12.011 13.3233C12.2404 13.3166 12.4382 13.3963 12.6043 13.5624L14.1668 15.1249V9.16659C14.1668 8.93048 14.2468 8.7327 14.4068 8.57325C14.5668 8.41381 14.7646 8.33381 15.0002 8.33325C15.2357 8.3327 15.4338 8.4127 15.5943 8.57325C15.7549 8.73381 15.8346 8.93159 15.8335 9.16659V15.1249L17.396 13.5624C17.5627 13.3958 17.7607 13.3158 17.9902 13.3224C18.2196 13.3291 18.4174 13.416 18.5835 13.5833C18.7363 13.7499 18.8163 13.9444 18.8235 14.1666C18.8307 14.3888 18.7507 14.5833 18.5835 14.7499L15.5835 17.7499C15.5002 17.8333 15.4099 17.8924 15.3127 17.9274C15.2154 17.9624 15.1113 17.9796 15.0002 17.9791C14.8891 17.9785 14.7849 17.9613 14.6877 17.9274ZM10.0002 21.6666C9.54183 21.6666 9.14961 21.5035 8.8235 21.1774C8.49738 20.8513 8.33405 20.4588 8.3335 19.9999V18.3333C8.3335 18.0971 8.4135 17.8994 8.5735 17.7399C8.7335 17.5805 8.93127 17.5005 9.16683 17.4999C9.40238 17.4994 9.60044 17.5794 9.761 17.7399C9.92155 17.9005 10.0013 18.0983 10.0002 18.3333V19.9999H20.0002V18.3333C20.0002 18.0971 20.0802 17.8994 20.2402 17.7399C20.4002 17.5805 20.5979 17.5005 20.8335 17.4999C21.069 17.4994 21.2671 17.5794 21.4277 17.7399C21.5882 17.9005 21.6679 18.0983 21.6668 18.3333V19.9999C21.6668 20.4583 21.5038 20.8508 21.1777 21.1774C20.8516 21.5041 20.459 21.6671 20.0002 21.6666H10.0002Z" fill="#0456FF" />
                                </svg>
                            </div>
                            <div className="w-[calc(100%-45px)]">
                                <h6 className="font-bold text-[15px] leading-[140%] text-[#000024]">Download Cover Letter</h6>
                            </div>
                        </div>
                        <p className="font-normal text-[12px] leading-[120%] text-[#000024CC]">Get your professional cover letter in PDF format.</p>
                        <button
                            type="button"
                            onClick={handleDownload}
                            disabled={downloading !== null}
                            className="flex items-center gap-[10px] justify-between border border-[#FF0000] bg-white py-[9px] px-[18px] rounded-[5px] font-semibold text-[13px] leading-none text-[#FF0000] cursor-pointer hover:bg-[#FF0000] hover:text-white transition-colors duration-300 disabled:opacity-50 shrink-0"
                        >
                            <div className="flex items-center gap-[10px]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="20" viewBox="0 0 16 20" fill="none">
                                    <path d="M9 7H14.5L9 1.5V7ZM2 0H10L16 6V18C16 18.5304 15.7893 19.0391 15.4142 19.4142C15.0391 19.7893 14.5304 20 14 20H2C1.46957 20 0.960859 19.7893 0.585786 19.4142C0.210714 19.0391 0 18.5304 0 18V2C0 1.46957 0.210714 0.960859 0.585786 0.585786C0.960859 0.210714 1.46957 0 2 0ZM6.93 10.44C7.34 11.34 7.86 12.08 8.46 12.59L8.87 12.91C8 13.07 6.8 13.35 5.53 13.84L5.42 13.88L5.92 12.84C6.37 11.97 6.7 11.18 6.93 10.44ZM13.41 14.25C13.59 14.07 13.68 13.84 13.69 13.59C13.72 13.39 13.67 13.2 13.57 13.04C13.28 12.57 12.53 12.35 11.29 12.35L10 12.42L9.13 11.84C8.5 11.32 7.93 10.41 7.53 9.28L7.57 9.14C7.9 7.81 8.21 6.2 7.55 5.54C7.46927 5.46161 7.37378 5.40003 7.26907 5.35883C7.16435 5.31763 7.0525 5.29764 6.94 5.3H6.7C6.33 5.3 6 5.69 5.91 6.07C5.54 7.4 5.76 8.13 6.13 9.34V9.35C5.88 10.23 5.56 11.25 5.05 12.28L4.09 14.08L3.2 14.57C2 15.32 1.43 16.16 1.32 16.69C1.28 16.88 1.3 17.05 1.37 17.23L1.4 17.28L1.88 17.59L2.32 17.7C3.13 17.7 4.05 16.75 5.29 14.63L5.47 14.56C6.5 14.23 7.78 14 9.5 13.81C10.53 14.32 11.74 14.55 12.5 14.55C12.94 14.55 13.24 14.44 13.41 14.25ZM13 13.54L13.09 13.65C13.08 13.75 13.05 13.76 13 13.78H12.96L12.77 13.8C12.31 13.8 11.6 13.61 10.87 13.29C10.96 13.19 11 13.19 11.1 13.19C12.5 13.19 12.9 13.44 13 13.54ZM3.83 15C3.18 16.19 2.59 16.85 2.14 17C2.19 16.62 2.64 15.96 3.35 15.31L3.83 15ZM6.85 8.09C6.62 7.19 6.61 6.46 6.78 6.04L6.85 5.92L7 5.97C7.17 6.21 7.19 6.53 7.09 7.07L7.06 7.23L6.9 8.05L6.85 8.09Z" fill="currentColor" fillOpacity="0.9" />
                                </svg>
                                {downloading === "pdf" ? "Downloading..." : "Download PDF"}
                            </div>
                            {!membership && (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="20" viewBox="0 0 16 20" fill="none">
                                    <path d="M3.75 7.75V4.75C3.75 2.54 5.54 0.75 7.75 0.75C9.96 0.75 11.75 2.54 11.75 4.75V7.75M7.75 12.75C8.01522 12.75 8.26957 12.6446 8.45711 12.4571C8.64464 12.2696 8.75 12.0152 8.75 11.75C8.75 11.4848 8.64464 11.2304 8.45711 11.0429C8.26957 10.8554 8.01522 10.75 7.75 10.75C7.48478 10.75 7.23043 10.8554 7.04289 11.0429C6.85536 11.2304 6.75 11.4848 6.75 11.75C6.75 12.0152 6.85536 12.2696 7.04289 12.4571C7.23043 12.6446 7.48478 12.75 7.75 12.75ZM7.75 12.75V15.75M2.35 7.75H13.15C14.03 7.75 14.75 8.47 14.75 9.35V16.35C14.75 17.67 13.67 18.75 12.35 18.75H3.15C1.83 18.75 0.75 17.67 0.75 16.35V9.35C0.75 8.47 1.47 7.75 2.35 7.75Z" stroke="currentColor" strokeOpacity="0.8" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}