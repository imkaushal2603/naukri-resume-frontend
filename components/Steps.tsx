"use client";

import Image from "next/image";
import Login from "@/public/steps/basil_login-outline.svg";
import Grid from "@/public/steps/si_grid-line.svg";
import Edit from "@/public/steps/basil_edit-outline.svg";
import Download from "@/public/steps/material-symbols_download-sharp.svg";
import Play from "@/public/steps/play.svg";

export default function Steps() {
    return (
        <div className="py-[40px]">
            <div className="max-w-[1390px] mx-auto px-[15px]">
                <h2 className="text-center font-medium text-[35px] leading-none text-[#000024] mb-[40px] max-[768px]:text-[30px]">Create your resume in <span className="font-bold text-[#0456FF]">4 simple steps</span></h2>
                <div>
                    <ul className="flex flex-wrap max-[768px]:gap-y-[40px]">
                        <li className="w-1/4 flex flex-col items-center text-center px-[35px] max-[768px]:w-full min-[768px]:max-[1025px]:px-[10px]">
                            <h4 className="font-bold text-[24px] leading-none text-[#0456FF] mb-5">Step 1</h4>
                            <div className="w-[125px] h-[125px] bg-[#F4F5FD] shadow-[3px_4px_13px_0px_#0456FF36] rounded-full flex justify-center items-center mb-5 relative max-[1025px]:w-[80px] max-[1025px]:h-[80px]">
                                <Image src={Login} alt="Login" width={60} height={60} className="max-[1025px]:w-[32px] max-[1025px]:h-[32px]" />
                                <div className="absolute left-[100%] top-1/2 -translate-y-1/2 -z-10 max-[768px]:hidden min-[768px]:max-[1025px]:hidden">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="221" height="2" viewBox="0 0 221 2" fill="none">
                                        <line y1="1" x2="221.002" y2="1" stroke="#0456FF" strokeWidth="2" strokeDasharray="8 8" />
                                    </svg>
                                    <Image src={Play} alt="Play" width={24} height={24} className="absolute left-1/2 -translate-x-1/2 -top-[11px]" />
                                </div>
                            </div>
                            <h4 className="font-semibold text-[24px] leading-none text-[#000024] mb-5">Easy Signup/Login</h4>
                            <p className="font-medium text-[18px] leading-[130%] text-[#4D4D66] inline-block">Create your account in seconds or login to get started.</p>
                        </li>
                        <li className="w-1/4 flex flex-col items-center text-center px-[35px] max-[768px]:w-full min-[768px]:max-[1025px]:px-[10px]">
                            <h4 className="font-bold text-[24px] leading-none text-[#0456FF] mb-5">Step 2</h4>
                            <div className="w-[125px] h-[125px] bg-[#F4F5FD] shadow-[3px_4px_13px_0px_#0456FF36] rounded-full flex justify-center items-center mb-5 relative max-[1025px]:w-[80px] max-[1025px]:h-[80px]">
                                <Image src={Grid} alt="Grid" width={50} height={50} className="max-[1025px]:w-[32px] max-[1025px]:h-[32px]" />
                                <div className="absolute left-[100%] top-1/2 -translate-y-1/2 -z-10 max-[768px]:hidden min-[768px]:max-[1025px]:hidden">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="221" height="2" viewBox="0 0 221 2" fill="none">
                                        <line y1="1" x2="221.002" y2="1" stroke="#0456FF" strokeWidth="2" strokeDasharray="8 8" />
                                    </svg>
                                    <Image src={Play} alt="Play" width={24} height={24} className="absolute left-1/2 -translate-x-1/2 -top-[11px]" />
                                </div>
                            </div>
                            <h4 className="font-semibold text-[24px] leading-none text-[#000024] mb-5">Choose Template</h4>
                            <p className="font-medium text-[18px] leading-[130%] text-[#4D4D66] inline-block">Pick a professional template that fits your role.</p>
                        </li>
                        <li className="w-1/4 flex flex-col items-center text-center px-[35px] max-[768px]:w-full min-[768px]:max-[1025px]:px-[10px]">
                            <h4 className="font-bold text-[24px] leading-none text-[#0456FF] mb-5">Step 3</h4>
                            <div className="w-[125px] h-[125px] bg-[#F4F5FD] shadow-[3px_4px_13px_0px_#0456FF36] rounded-full flex justify-center items-center mb-5 relative max-[1025px]:w-[80px] max-[1025px]:h-[80px]">
                                <Image src={Edit} alt="Edit" width={60} height={60} className="max-[1025px]:w-[32px] max-[1025px]:h-[32px]" />
                                <div className="absolute left-[100%] top-1/2 -translate-y-1/2 -z-10 max-[768px]:hidden min-[768px]:max-[1025px]:hidden">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="221" height="2" viewBox="0 0 221 2" fill="none">
                                        <line y1="1" x2="221.002" y2="1" stroke="#0456FF" strokeWidth="2" strokeDasharray="8 8" />
                                    </svg>
                                    <Image src={Play} alt="Play" width={24} height={24} className="absolute left-1/2 -translate-x-1/2 -top-[11px]" />
                                </div>
                            </div>
                            <h4 className="font-semibold text-[24px] leading-none text-[#000024] mb-5">Enter Your Details</h4>
                            <p className="font-medium text-[18px] leading-[130%] text-[#4D4D66] inline-block">Fill in your information and get Al suggestions as you go.</p>
                        </li>
                        <li className="w-1/4 flex flex-col items-center text-center px-[35px] max-[768px]:w-full min-[768px]:max-[1025px]:px-[10px]">
                            <h4 className="font-bold text-[24px] leading-none text-[#0456FF] mb-5">Step 4</h4>
                            <div className="w-[125px] h-[125px] bg-[#F4F5FD] shadow-[3px_4px_13px_0px_#0456FF36] rounded-full flex justify-center items-center mb-5 relative max-[1025px]:w-[80px] max-[1025px]:h-[80px]">
                                <Image src={Download} alt="Download" width={60} height={60} className="max-[1025px]:w-[32px] max-[1025px]:h-[32px]" />
                            </div>
                            <h4 className="font-semibold text-[24px] leading-none text-[#000024] mb-5">Download Resume</h4>
                            <p className="font-medium text-[18px] leading-[130%] text-[#4D4D66] inline-block">Download your resume in PDF format and apply with confidence.</p>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}