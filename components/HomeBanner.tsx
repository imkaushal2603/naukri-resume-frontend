"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Login from "./Login";
import Registration from "./Registration";
import ForgotPassword from "./ForgotPassword";
import api from "@/services/api";
import Harbor from "@/public/templates/harbor.png";
import UserIcon from "@/public/home-banner/user_icon.png";
import ATS from "@/public/home-banner/ats.png";
import AISUGGESTIONS from "@/public/home-banner/ai_suggestions.png";
import WAVE from "@/public/home-banner/wave.png";

export default function HomeBanner() {
    const { isAuthenticated } = useAuth();
    const [activeAuthModal, setActiveAuthModal] = useState<"login" | "register" | "reset" | null>(null);
    const [showBadge1, setShowBadge1] = useState(false);
    const [showBadge2, setShowBadge2] = useState(false);
    const [showBadge3, setShowBadge3] = useState(false);
    const [resumeCount, setResumeCount] = useState<number | null>(null);

    useEffect(() => {
        const timer1 = setTimeout(() => setShowBadge1(true), 2000);
        const timer2 = setTimeout(() => setShowBadge2(true), 3000);
        const timer3 = setTimeout(() => setShowBadge3(true), 4000);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, []);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get("/stats/resume-count");
                if (res.data.success) {
                    setResumeCount(res.data.totalResumes);
                }
            } catch (err) {
                console.error("Failed to fetch resume stats", err);
            }
        };
        fetchStats();
    }, []);

    return (
        <>
            <div className="py-[66px] relative max-[768px]:py-[40px]">
                <div className="max-w-[1390px] mx-auto px-[15px]">
                    <div className="flex flex-wrap max-[768px]:flex-row max-[768px]:gap-[20px]">
                        <div className="w-[50%] max-[768px]:w-full min-[768px]:max-[1400px]:pr-[40px]">
                            <h5 className="flex items-center flex-wrap gap-[5px] font-semibold text-[20px] leading-[120%] capitalize text-[#000024] mb-[60px] max-[768px]:text-[16px] max-[768px]:mb-[20px] min-[768px]:max-[1025px]:mb-[40px]">
                                <Image src={UserIcon} alt="User Icon" width={18} height={18} priority unoptimized />
                                <span className="font-bold text-[#0456FF]">{resumeCount !== null ? resumeCount.toLocaleString() : "..."}</span> resumes created today
                            </h5>
                            <h1 className="font-bold text-[55px] leading-[120%] text-[#000024] mb-[30px] max-[768px]:mb-[20px] max-[768px]:text-[40px] min-[768px]:max-[1025px]:text-[45px]">Create an ATS-Friendly Resume <span className="text-[#0456FF]">with AI</span></h1>
                            <p className="font-medium text-[20px] leading-[120%] text-[#000024] mb-[40px] max-[768px]:text-[18px] max-[768px]:mb-[20px]">Al-powered content, ATS-friendly templates, and<br />easy customization to land your dream job.</p>
                            <div className="flex items-center flex-wrap gap-[15px] mb-[40px]">
                                {isAuthenticated ? (
                                    <Link
                                        href="/dashboard"
                                        className="inline-block border border-[#0456FF] bg-[#0456FF] py-[11px] px-[26px] rounded-[5px] font-semibold text-[14px] leading-none text-white hover:bg-transparent hover:text-[#0456FF] transition-colors duration-300"
                                    >
                                        Build My Resume
                                    </Link>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setActiveAuthModal("login")}
                                        className="inline-block border border-[#0456FF] bg-[#0456FF] py-[11px] px-[26px] rounded-[5px] font-semibold text-[14px] leading-none text-white hover:bg-transparent hover:text-[#0456FF] transition-colors duration-300 cursor-pointer"
                                    >
                                        Build My Resume
                                    </button>
                                )}
                            </div>
                            <div>
                                <ul className="flex items-center flex-wrap gap-[20px]">
                                    <li className="flex items-center flex-wrap gap-[6px]">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                            <path d="M5.77688 9.57125L3.125 6.91875L4.00875 6.035L5.77688 7.8025L9.31188 4.26688L10.1962 5.15125L5.77688 9.57125Z" fill="#0456FF" />
                                            <path fillRule="evenodd" clipRule="evenodd" d="M0 6.875C0 3.07812 3.07812 0 6.875 0C10.6719 0 13.75 3.07812 13.75 6.875C13.75 10.6719 10.6719 13.75 6.875 13.75C3.07812 13.75 0 10.6719 0 6.875ZM6.875 12.5C6.13631 12.5 5.40486 12.3545 4.72241 12.0718C4.03995 11.7891 3.41985 11.3748 2.89752 10.8525C2.37519 10.3301 1.96086 9.71005 1.67818 9.02759C1.39549 8.34514 1.25 7.61369 1.25 6.875C1.25 6.13631 1.39549 5.40486 1.67818 4.72241C1.96086 4.03995 2.37519 3.41985 2.89752 2.89752C3.41985 2.37519 4.03995 1.96086 4.72241 1.67818C5.40486 1.39549 6.13631 1.25 6.875 1.25C8.36684 1.25 9.79758 1.84263 10.8525 2.89752C11.9074 3.95242 12.5 5.38316 12.5 6.875C12.5 8.36684 11.9074 9.79758 10.8525 10.8525C9.79758 11.9074 8.36684 12.5 6.875 12.5Z" fill="#0456FF" />
                                        </svg>
                                        <span className="font-semibold text-[14px] leading-none text-[#000024]">ATS Friendly</span>
                                    </li>
                                    <li className="flex items-center flex-wrap gap-[6px]">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="14" viewBox="0 0 13 14" fill="none">
                                            <path d="M4.38274 2.155C4.75649 1.06125 6.26774 1.02813 6.71086 2.05563L6.74836 2.15563L7.25274 3.63063C7.36833 3.9689 7.55511 4.27844 7.80051 4.53839C8.0459 4.79834 8.34418 5.00263 8.67524 5.1375L8.81086 5.18812L10.2859 5.69188C11.3796 6.06563 11.4127 7.57687 10.3859 8.02L10.2859 8.0575L8.81086 8.56188C8.47248 8.67739 8.1628 8.86414 7.90275 9.10954C7.64269 9.35493 7.4383 9.65325 7.30336 9.98438L7.25274 10.1194L6.74899 11.595C6.37524 12.6888 4.86399 12.7219 4.42149 11.695L4.38274 11.595L3.87899 10.12C3.76347 9.78161 3.57672 9.47194 3.33132 9.21189C3.08593 8.95183 2.78761 8.74743 2.45649 8.6125L2.32149 8.56188L0.846486 8.05812C-0.247889 7.68437 -0.281014 6.17312 0.746486 5.73062L0.846486 5.69188L2.32149 5.18812C2.65976 5.07254 2.96931 4.88575 3.22925 4.64036C3.4892 4.39497 3.69349 4.09668 3.82836 3.76562L3.87899 3.63063L4.38274 2.155ZM5.56586 2.55875L5.06211 4.03375C4.88611 4.54956 4.59978 5.02081 4.22307 5.41469C3.84636 5.80856 3.38833 6.11558 2.88086 6.31437L2.72461 6.37125L1.24961 6.875L2.72461 7.37875C3.24043 7.55476 3.71168 7.84108 4.10555 8.21779C4.49942 8.5945 4.80644 9.05253 5.00524 9.56L5.06211 9.71625L5.56586 11.1912L6.06961 9.71625C6.24562 9.20044 6.53194 8.72919 6.90865 8.33531C7.28536 7.94144 7.74339 7.63442 8.25086 7.43563L8.40711 7.37937L9.88211 6.875L8.40711 6.37125C7.8913 6.19524 7.42005 5.90892 7.02618 5.53221C6.63231 5.1555 6.32528 4.69747 6.12649 4.19L6.07024 4.03375L5.56586 2.55875ZM10.5659 1.1293e-07C10.6828 -1.47483e-07 10.7974 0.0327989 10.8966 0.0946697C10.9958 0.156541 11.0757 0.245002 11.1271 0.35L11.1571 0.423125L11.3759 1.06438L12.0177 1.28313C12.1349 1.32293 12.2376 1.39663 12.3129 1.49488C12.3881 1.59313 12.4325 1.71151 12.4404 1.83501C12.4483 1.95851 12.4194 2.08158 12.3572 2.18862C12.2951 2.29565 12.2026 2.38184 12.0915 2.43625L12.0177 2.46625L11.3765 2.685L11.1577 3.32687C11.1179 3.44402 11.0441 3.54669 10.9458 3.62187C10.8475 3.69705 10.7291 3.74137 10.6056 3.7492C10.4821 3.75703 10.3591 3.72803 10.2521 3.66586C10.1451 3.6037 10.059 3.51117 10.0046 3.4L9.97461 3.32687L9.75586 2.68563L9.11399 2.46688C8.99681 2.42707 8.89409 2.35337 8.81884 2.25512C8.7436 2.15687 8.69921 2.03849 8.69131 1.91499C8.68341 1.79149 8.71236 1.66842 8.77448 1.56138C8.83659 1.45435 8.92909 1.36816 9.04024 1.31375L9.11399 1.28375L9.75524 1.065L9.97399 0.423125C10.0161 0.299641 10.0959 0.192443 10.202 0.116562C10.3082 0.0406806 10.4354 -7.83009e-05 10.5659 1.1293e-07Z" fill="#0456FF" />
                                        </svg>
                                        <span className="font-semibold text-[14px] leading-none text-[#000024]">Al Powered</span>
                                    </li>
                                    <li className="flex items-center flex-wrap gap-[6px]">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                                            <path fillRule="evenodd" clipRule="evenodd" d="M8.63472 0.489048C8.51979 0.305412 8.35046 0.162177 8.15032 0.0792811C7.95017 -0.0036153 7.72916 -0.0220486 7.51805 0.0265477L6.01971 0.370714C5.86616 0.406007 5.7066 0.406007 5.55305 0.370714L4.05471 0.0265477C3.8436 -0.0220486 3.62259 -0.0036153 3.42244 0.0792811C3.2223 0.162177 3.05297 0.305412 2.93805 0.489048L2.12138 1.79238C2.03805 1.92571 1.92555 2.03821 1.79221 2.12238L0.488881 2.93905C0.305562 3.05387 0.162537 3.22292 0.0796585 3.42273C-0.00322004 3.62253 -0.021841 3.84318 0.0263803 4.05405L0.370547 5.55405C0.405712 5.70733 0.405712 5.86659 0.370547 6.01988L0.0263803 7.51905C-0.0220284 7.73004 -0.00350116 7.95087 0.0793863 8.15084C0.162274 8.35082 0.305404 8.52001 0.488881 8.63488L1.79221 9.45155C1.92555 9.53488 2.03805 9.64738 2.12221 9.78071L2.93888 11.084C3.17388 11.4599 3.62221 11.6457 4.05471 11.5465L5.55305 11.2024C5.7066 11.1671 5.86616 11.1671 6.01971 11.2024L7.51888 11.5465C7.72987 11.595 7.9507 11.5764 8.15068 11.4935C8.35065 11.4107 8.51984 11.2675 8.63472 11.084L9.45138 9.78071C9.53471 9.64738 9.64721 9.53488 9.78055 9.45155L11.0847 8.63488C11.2682 8.51984 11.4113 8.35047 11.494 8.15033C11.5768 7.95019 11.5951 7.72924 11.5464 7.51821L11.203 6.01988C11.1678 5.86633 11.1678 5.70677 11.203 5.55322L11.5472 4.05405C11.5957 3.84314 11.5773 3.62237 11.4946 3.42241C11.4118 3.22244 11.2689 3.05321 11.0855 2.93821L9.78138 2.12155C9.64823 2.03806 9.5357 1.92553 9.45221 1.79238L8.63472 0.489048ZM8.21555 3.92821C8.26709 3.83344 8.27986 3.72236 8.25117 3.61836C8.22248 3.51436 8.15457 3.42553 8.06173 3.37058C7.96889 3.31563 7.85835 3.29884 7.75337 3.32373C7.6484 3.34862 7.55717 3.41326 7.49888 3.50405L5.31971 7.19238L4.00388 5.93238C3.96484 5.8923 3.91814 5.86049 3.86654 5.83885C3.81494 5.81721 3.75952 5.80618 3.70357 5.80643C3.64762 5.80667 3.59229 5.81818 3.54089 5.84027C3.48948 5.86236 3.44305 5.89457 3.40437 5.935C3.36568 5.97542 3.33553 6.02321 3.31572 6.07554C3.29591 6.12786 3.28683 6.18364 3.28904 6.23955C3.29125 6.29545 3.3047 6.35034 3.32858 6.40094C3.35246 6.45154 3.38629 6.49681 3.42805 6.53405L5.12305 8.15821C5.16841 8.20159 5.22299 8.23416 5.28271 8.25349C5.34243 8.27281 5.40574 8.2784 5.46792 8.26982C5.5301 8.26125 5.58953 8.23874 5.64179 8.20397C5.69405 8.16921 5.73778 8.12309 5.76971 8.06905L8.21555 3.92821Z" fill="#0456FF" />
                                        </svg>
                                        <span className="font-semibold text-[14px] leading-none text-[#000024]">Recruiter Approved</span>
                                    </li>
                                    <li className="flex items-center flex-wrap gap-[6px]">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="15" viewBox="0 0 13 15" fill="none">
                                            <path d="M0.625 2.63092V7.22467C0.625 11.8184 6.25 13.7872 6.25 13.7872C6.25 13.7872 11.875 11.8184 11.875 7.22467V2.63092L6.25 0.66217L0.625 2.63092Z" stroke="#0456FF" strokeWidth="1.25" strokeLinecap="square" />
                                            <path d="M3.85815 6.70718L5.62503 8.47468L9.16065 4.93906" stroke="#0456FF" strokeWidth="1.25" strokeLinecap="square" />
                                        </svg>
                                        <span className="font-semibold text-[14px] leading-none text-[#000024]">100% Secure</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="w-[50%] flex items-end flex-wrap gap-[50px] max-[768px]:w-full max-[768px]:gap-0 max-[1400px]:max-w-[382px] min-[768px]:max-[1400px]:gap-0 max-[1400px]:relative">
                            <div className="relative w-[382px] max-[768px]:px-[15px] min-[768px]:max-[1400px]:px-[15px]">
                                <Image className="shadow-[1px_1px_4px_0px_#00000040] rounded-[15px]" src={Harbor} alt="Harbor" width="382" height="490" priority />
                                <div className={`absolute -right-[21px] top-[35px] w-[50px] h-[50px] bg-white shadow-[0px_1px_4px_0px_#00000040] rounded-[10px] flex justify-center items-center transition-all duration-500 max-[1400px]:left-[-4px] ${showBadge1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="19" height="24" viewBox="0 0 19 24" fill="none">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M4.0625 13.75C4.0625 13.5014 4.16127 13.2629 4.33709 13.0871C4.5129 12.9113 4.75136 12.8125 5 12.8125H13.75C13.9986 12.8125 14.2371 12.9113 14.4129 13.0871C14.5887 13.2629 14.6875 13.5014 14.6875 13.75C14.6875 13.9986 14.5887 14.2371 14.4129 14.4129C14.2371 14.5887 13.9986 14.6875 13.75 14.6875H5C4.75136 14.6875 4.5129 14.5887 4.33709 14.4129C4.16127 14.2371 4.0625 13.9986 4.0625 13.75ZM4.0625 17.5C4.0625 17.2514 4.16127 17.0129 4.33709 16.8371C4.5129 16.6613 4.75136 16.5625 5 16.5625H13.75C13.9986 16.5625 14.2371 16.6613 14.4129 16.8371C14.5887 17.0129 14.6875 17.2514 14.6875 17.5C14.6875 17.7486 14.5887 17.9871 14.4129 18.1629C14.2371 18.3387 13.9986 18.4375 13.75 18.4375H5C4.75136 18.4375 4.5129 18.3387 4.33709 18.1629C4.16127 17.9871 4.0625 17.7486 4.0625 17.5Z" fill="#0456FF" />
                                        <path fillRule="evenodd" clipRule="evenodd" d="M0 2.5C0 1.1225 1.1225 0 2.5 0H10.8625C11.565 0 12.2275 0.2975 12.6937 0.78875L12.7013 0.7975L18.0912 6.675C18.54 7.15375 18.75 7.78 18.75 8.375V21.25C18.75 22.6275 17.6275 23.75 16.25 23.75H2.5C1.1225 23.75 0 22.6275 0 21.25V2.5ZM10.8613 2.5H2.5V21.25H16.25V8.365L10.88 2.50875L10.8763 2.5075L10.8613 2.5Z" fill="#0456FF" />
                                        <path fillRule="evenodd" clipRule="evenodd" d="M10.8623 0C11.1938 0 11.5118 0.131696 11.7462 0.366117C11.9806 0.600537 12.1123 0.918479 12.1123 1.25V7.125H17.4998C17.664 7.125 17.8265 7.15733 17.9782 7.22015C18.1298 7.28297 18.2676 7.37504 18.3837 7.49112C18.4998 7.60719 18.5918 7.74499 18.6547 7.89664C18.7175 8.0483 18.7498 8.21085 18.7498 8.375C18.7498 8.53915 18.7175 8.7017 18.6547 8.85335C18.5918 9.00501 18.4998 9.14281 18.3837 9.25888C18.2676 9.37496 18.1298 9.46703 17.9782 9.52985C17.8265 9.59267 17.664 9.625 17.4998 9.625H10.8623C10.5308 9.625 10.2128 9.4933 9.97842 9.25888C9.744 9.02446 9.6123 8.70652 9.6123 8.375V1.25C9.6123 0.918479 9.744 0.600537 9.97842 0.366117C10.2128 0.131696 10.5308 0 10.8623 0Z" fill="#0456FF" />
                                    </svg>
                                </div>
                                <div className={`absolute -right-[21px] top-[110px] w-[50px] h-[50px] bg-white shadow-[0px_1px_4px_0px_#00000040] rounded-[10px] flex justify-center items-center transition-all duration-500 max-[1400px]:left-[-4px] ${showBadge2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="19" height="13" viewBox="0 0 19 13" fill="none">
                                        <path d="M1.3999 1.39999H9.2124" stroke="#3D5AFE" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M5.30615 1.39999V11.5562" stroke="#3D5AFE" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M9.99365 6.08749H14.6812" stroke="#3D5AFE" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M12.3374 6.08749V11.5562" stroke="#3D5AFE" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <div className={`absolute -left-[21px] bottom-[45px] w-[50px] h-[50px] bg-white shadow-[0px_1px_4px_0px_#00000040] rounded-[10px] flex justify-center items-center transition-all duration-500 max-[768px]:left-[-4px] min-[768px]:max-[1400px]:left-[-8px] ${showBadge3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="21" viewBox="0 0 17 21" fill="none">
                                        <path d="M7.23958 14.1146L13.125 8.22917L11.6406 6.74479L7.23958 11.1458L5.05208 8.95833L3.56771 10.4427L7.23958 14.1146ZM8.33333 20.8333C5.92014 20.2257 3.92812 18.841 2.35729 16.6792C0.786458 14.5174 0.000694444 12.1174 0 9.47917V3.125L8.33333 0L16.6667 3.125V9.47917C16.6667 12.1181 15.8813 14.5184 14.3104 16.6802C12.7396 18.842 10.7472 20.2264 8.33333 20.8333ZM8.33333 18.6458C10.1389 18.0729 11.6319 16.9271 12.8125 15.2083C13.9931 13.4896 14.5833 11.5799 14.5833 9.47917V4.55729L8.33333 2.21354L2.08333 4.55729V9.47917C2.08333 11.5799 2.67361 13.4896 3.85417 15.2083C5.03472 16.9271 6.52778 18.0729 8.33333 18.6458Z" fill="#29B33A" />
                                    </svg>
                                </div>
                            </div>
                            <div className="flex flex-col gap-y-[30px] max-[1400px]:absolute max-[1400px]:right-[-10px]">
                                <div className="flex justify-center max-[1400px]:justify-end">
                                    <Image src={ATS} alt="ATS" width={175} height={190} />
                                </div>
                                <div>
                                    <Image src={AISUGGESTIONS} alt="AI SUGGESTIONS" width={247} height={176} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-0 right-0 w-1/2 -z-1 max-[768px]:w-full">
                    <Image src={WAVE} alt="wave" width={869} height={407} className="w-full h-full" />
                </div>
            </div>
            <Login
                isOpen={activeAuthModal === "login"}
                onClose={() => setActiveAuthModal(null)}
                onOpenSignUp={() => setActiveAuthModal("register")}
                onOpenForgotPassword={() => setActiveAuthModal("reset")}
            />
            <Registration
                isOpen={activeAuthModal === "register"}
                onClose={() => setActiveAuthModal(null)}
                onOpenLogin={() => setActiveAuthModal("login")}
            />
            <ForgotPassword
                isOpen={activeAuthModal === "reset"}
                onClose={() => setActiveAuthModal(null)}
                onOpenLogin={() => setActiveAuthModal("login")}
            />
        </>
    )
}