"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import api from "@/services/api";
import Loader from "@/components/ui/Loader";

const TOPICS = ["Account Issue", "Billing / Payment", "Bug Report", "Feature Request", "Other"];

export default function Support() {
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        if (f.size > 5 * 1024 * 1024) {
            toast.error("File size must be under 5 MB.");
            return;
        }
        setFile(f);
    };

    const handleSubmit = async () => {
        if (!subject) {
            toast.error("Please choose a topic.");
            return;
        }
        if (!message.trim()) {
            toast.error("Please describe your issue.");
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("subject", subject);
            formData.append("message", message);
            if (file) formData.append("attachment", file);

            const res = await api.post("/support/ticket", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            if (res.data.success) {
                toast.success("Ticket submitted! We'll get back to you soon.");
                setSubject("");
                setMessage("");
                setFile(null);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to submit ticket.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="relative">
            {loading && <Loader overlay />}
            <h4 className="font-bold text-[20px] leading-none text-black mb-[15px]">Help & Support</h4>
            <p className="font-normal text-[15px] leading-[140%] text-[#00002480] mb-[30px]">We're here to help! Submit a ticket or reach out to us using the contact details below.</p>
            <div className="flex flex-wrap gap-[20px]">
                <div className="w-[calc(50%-10px)] border border-[#CACACA80] rounded-[5px] p-[20px] max-[768px]:w-full">
                    <h5 className="font-bold text-[18px] leading-none text-black mb-[10px]">Submit a Support Ticket</h5>
                    <p className="font-bold text-[14px] text-[#00002480] leading-[140%] inline-block mb-[20px]">Describe your issue and our support team will get back to you as soon as possible.</p>
                    <div>
                        <div className="mb-[15px]">
                            <label className="inline-block font-bold text-[12px] leading-none text-black mb-[8px]">Subject</label>
                            <select
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full border border-[#0456FF26] rounded-[5px] py-[10px] px-[14px] text-[14px] text-[#000024]"
                            >
                                <option value="">Choose a topic</option>
                                {TOPICS.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-[15px]">
                            <label className="inline-block font-bold text-[12px] leading-none text-black mb-[8px]">Your Message</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value.slice(0, 1000))}
                                rows={5}
                                placeholder="Please describe your issue in detail..."
                                className="w-full border border-[#0456FF26] rounded-[5px] p-[14px] text-[14px] text-[#000024] resize-y"
                            />
                            <p className="text-[11px] text-[#00002480] text-right mt-[4px]">{message.length}/1000</p>
                        </div>
                        <div className="mb-[20px]">
                            <label className="inline-block font-bold text-[12px] leading-none text-black mb-[8px]">Attachments (Optional)</label>
                            <label className="block border border-dashed border-[#0456FF40] rounded-[5px] p-[20px] text-center cursor-pointer">
                                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                <p className="text-[13px] text-[#000024]">{file ? file.name : "Click to upload or drag and drop"}</p>
                                <p className="text-[11px] text-[#00002480] mt-[4px]">JPG, PNG (Max. 1MB)</p>
                            </label>
                        </div>
                        <button onClick={handleSubmit} disabled={submitting}
                            className="w-full inline-block border border-[#0456FF] bg-[#0456FF] py-[12px] rounded-[5px] font-semibold text-[14px] text-white cursor-pointer hover:bg-transparent hover:text-[#0456FF] transition-colors duration-300 disabled:opacity-50"
                        >
                            {submitting ? "Submitting..." : "Submit Ticket"}
                        </button>
                    </div>
                </div>
                <div className="w-[calc(50%-10px)] border border-[#CACACA80] rounded-[5px] p-[20px] max-[768px]:w-full">
                    <h5 className="font-bold text-[18px] leading-none text-black mb-[10px]">Contact Information</h5>
                    <p className="font-bold text-[14px] text-[#00002480] leading-[140%] inline-block mb-[20px]">You can also reach us directly using the details below.</p>
                    <div className="flex flex-col gap-y-[20px]">
                        <div className="border border-[#CACACA80] rounded-[6px] bg-[#FAFAFB] p-[20px] flex flex-wrap gap-[20px]">
                            <div className="w-[55px] h-[55px] rounded-full bg-[#E8EDFD] flex justify-center items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24" fill="none">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M3.75 5.25L3 6V18L3.75 18.75H20.25L21 18V6L20.25 5.25H3.75ZM4.5 7.6955V17.25H19.5V7.69525L11.9999 14.5136L4.5 7.6955ZM18.3099 6.75H5.68986L11.9999 12.4864L18.3099 6.75Z" fill="#0456FF" />
                                </svg>
                            </div>
                            <div>
                                <h6 className="text-[16px] font-bold leading-[120%] mb-[6px] text-[#000024]">Email</h6>
                                <a href="mailto:support@naukariresume.com" className="text-[#0456FF] font-bold text-[16px] leading-normal inline-block mb-[6px]">support@naukariresume.com</a>
                                <p className="text-[#00002480] text-[15px] leading-normal">We usually reply within a few hours.</p>
                            </div>
                        </div>
                        <div className="border border-[#CACACA80] rounded-[6px] bg-[#FAFAFB] p-[20px] flex flex-wrap gap-[20px]">
                            <div className="w-[55px] h-[55px] rounded-full bg-[#E7F7EE] flex justify-center items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24" fill="none">
                                    <path d="M3.51089 2L7.15002 2.13169C7.91653 2.15942 8.59676 2.64346 8.89053 3.3702L9.96656 6.03213C10.217 6.65159 10.1496 7.35837 9.78693 7.91634L8.40831 10.0375C9.22454 11.2096 11.4447 13.9558 13.7955 15.5633L15.5484 14.4845C15.9939 14.2103 16.5273 14.1289 17.0314 14.2581L20.5161 15.1517C21.4429 15.3894 22.0674 16.2782 21.9942 17.2552L21.7705 20.2385C21.6919 21.2854 20.8351 22.1069 19.818 21.9887C6.39245 20.4276 -1.48056 1.99997 3.51089 2Z" stroke="#27A753" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div>
                                <h6 className="text-[16px] font-bold leading-[120%] mb-[6px] text-[#000024]">Phone</h6>
                                <a href="tel:+911234567890" className="text-[#0456FF] font-bold text-[16px] leading-normal inline-block mb-[6px]">+91 12345 67890</a>
                                <p className="text-[#00002480] text-[15px] leading-normal">Mon - Sat, 10:00 AM - 7:00 PM (IST)</p>
                            </div>
                        </div>
                        <div className="border border-[#CACACA80] rounded-[6px] bg-[#FAFAFB] p-[20px] flex flex-wrap gap-[20px]">
                            <div className="w-[55px] h-[55px] rounded-full bg-[#F1ECFC] flex justify-center items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 7V12L14.5 13.5M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#430FDB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div>
                                <h6 className="text-[16px] font-bold leading-[120%] mb-[6px] text-[#000024]">Support Hours</h6>
                                <p className="text-[#00002480] text-[15px] leading-normal">Mon - Sat, 10:00 AM - 7:00 PM (IST)</p>
                                <p className="text-[#00002480] text-[15px] leading-normal">We're closed on Sundays and public holidays.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}