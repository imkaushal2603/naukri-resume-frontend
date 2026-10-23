"use client";

import { useState } from "react";
import Image from "next/image";
import FAQ from "@/public/faq/faq.png";

export default function Faq() {
    const [openIndex, setOpenIndex] = useState<number | null>(1);

    const faqData = [
        {
            question: "What is Naukri Resume?",
            answer: "Naukri Resume is an AI-powered resume builder designed to help job seekers create professional, ATS-friendly resumes in minutes. Choose from modern templates, customize your content, preview your resume in real time, and download it in PDF format with a premium plan."
        },
        {
            question: "Is Naukri Resume ATS-friendly?",
            answer: "Yes. All Naukri Resume templates are optimized for Applicant Tracking Systems (ATS). Our layouts use clean formatting, readable fonts, and proper section structures to improve compatibility with most recruiters' ATS software. You can also use our ATS Score Checker to identify areas for improvement before applying."
        },
        {
            question: "Can I download my resume for free?",
            answer: "You can create, edit, and preview your resume for free. Downloading your resume in PDF format requires an active Premium plan. Premium also includes ATS Score checking, AI suggestions, premium templates, and other advanced features."
        },
        {
            question: "Is my data safe with Naukri Resume?",
            answer: "Yes. Your privacy and security are important to us. Your resume data is stored securely using encrypted connections, and we never sell or share your personal information with third parties. You remain in full control of your resumes and account at all times."
        }
    ];

    const toggleFaq = (index: number) => {
        setOpenIndex((prevIndex) => (prevIndex === index ? null : index));
    };

    return (
        <div className="py-[40px]">
            <div className="max-w-[1390px] mx-auto px-[15px]">
                <h2 className="text-center font-semibold text-[35px] leading-[120%] text-[#000024] mb-[30px] max-[768px]:text-[30px]">Frequently Asked <span className="font-bold text-[#0456FF]">Questions</span></h2>
                <div className="flex flex-wrap items-center gap-[25px] max-[768px]:flex-col-reverse min-[768px]:max-[1025px]:flex-col-reverse">
                    <div className="w-[calc(100%-410px)] border border-[#00002440] p-10 rounded-[24px] max-[768px]:w-full max-[768px]:p-[30px] min-[768px]:max-[1025px]:w-full">
                        <ul className="flex flex-col divide-y divide-black/25">
                            {faqData.map((item, index) => {
                                const isOpen = openIndex === index;
                                return (
                                    <li key={index} className="py-5 first:pt-0 last:pb-0">
                                        <button onClick={() => toggleFaq(index)} className="w-full flex justify-between items-start text-left gap-4 cursor-pointer group" aria-expanded={isOpen}>
                                            <h3 className="font-semibold text-[18px] md:text-[20px] text-[#000024] leading-[110%] transition-colors duration-200">{index + 1}. {item.question}</h3>
                                            <div className="mt-1 flex-shrink-0 text-[#000024] group-hover:text-[#0456FF] transition-colors duration-200">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}>
                                                    <path d="m6 9 6 6 6-6" />
                                                </svg>
                                            </div>
                                        </button>
                                        <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0"}`}>
                                            <div className="overflow-hidden">
                                                <p className="text-[18px] leading-[140%] text-[#4D4D66] pr-[40px]">{item.answer}</p>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                    <div className="w-[385px] max-[768px]:w-full">
                        <Image src={FAQ} className="max-[768px]:w-full" alt="FAQ" width={385} height={430} />
                    </div>
                </div>
            </div>
        </div>
    )
}