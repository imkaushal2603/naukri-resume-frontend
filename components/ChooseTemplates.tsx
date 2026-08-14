"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { useAuth } from "@/context/AuthContext";
import Login from "./Login";
import Registration from "./Registration";
import ForgotPassword from "./ForgotPassword";

import Template1 from "@/public/Template1.png";
import Template2 from "@/public/Template2.png";
import Template3 from "@/public/Template3.png";
import Template4 from "@/public/Template4.png";
import Template5 from "@/public/Template5.png";

export default function CustomChooseTemplates() {
    const { isAuthenticated, loading } = useAuth();
    const [activeAuthModal, setActiveAuthModal] = useState<"login" | "register" | "reset" | null>(null);

    const templates = [
        { id: 1, image: Template1, name: "Template 1" },
        { id: 2, image: Template2, name: "Template 2" },
        { id: 3, image: Template3, name: "Template 3" },
        { id: 4, image: Template4, name: "Template 4" },
        { id: 5, image: Template5, name: "Template 5" },
        { id: 6, image: Template1, name: "Template 1" },
        { id: 7, image: Template2, name: "Template 2" },
        { id: 8, image: Template3, name: "Template 3" },
        { id: 9, image: Template4, name: "Template 4" },
        { id: 10, image: Template5, name: "Template 5" }
    ];

    return (
        <>
            <div className="py-[40px] border-t border-[#CACACAB2] overflow-hidden">
                <div className="max-w-[1390px] mx-auto px-[15px]">
                    <div className="flex flex-wrap justify-between gap-5 items-center mb-[50px]">
                        <h2 className="font-medium text-[30px] leading-none capitalize text-[#000024]">Professional Templates For Every Career</h2>
                        {loading ? null : isAuthenticated ? (
                            <Link href="/templates" className="flex items-center gap-1 font-semibold text-[16px] leading-[120%] text-[#0456FF] hover:underline">
                                View All Templates
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path
                                        d="M10.2748 4.33753C10.4506 4.16197 10.6889 4.06335 10.9373 4.06335C11.1858 4.06335 11.4241 4.16197 11.5998 4.33753L16.9123 9.65003C17.0879 9.82581 17.1865 10.0641 17.1865 10.3125C17.1865 10.561 17.0879 10.7992 16.9123 10.975L11.5998 16.2875C11.4222 16.4533 11.187 16.5437 10.9441 16.5395C10.7011 16.5353 10.4692 16.4369 10.2973 16.265C10.1255 16.0932 10.0271 15.8613 10.0229 15.6183C10.0187 15.3753 10.109 15.1402 10.2748 14.9625L13.9873 11.25H4.68735C4.43871 11.25 4.20025 11.1513 4.02444 10.9754C3.84862 10.7996 3.74985 10.5612 3.74985 10.3125C3.74985 10.0639 3.84862 9.82543 4.02444 9.64962C4.20025 9.4738 4.43871 9.37503 4.68735 9.37503H13.9873L10.2748 5.66253C10.0993 5.48675 10.0007 5.24847 10.0007 5.00003C10.0007 4.75159 10.0993 4.51331 10.2748 4.33753Z"
                                        fill="#0456FF"
                                    />
                                </svg>
                            </Link>
                        ) : (
                            <button type="button" onClick={() => setActiveAuthModal("login")} className="flex items-center gap-1 font-semibold text-[16px] leading-[120%] text-[#0456FF] cursor-pointer hover:underline">
                                View All Templates
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path
                                        d="M10.2748 4.33753C10.4506 4.16197 10.6889 4.06335 10.9373 4.06335C11.1858 4.06335 11.4241 4.16197 11.5998 4.33753L16.9123 9.65003C17.0879 9.82581 17.1865 10.0641 17.1865 10.3125C17.1865 10.561 17.0879 10.7992 16.9123 10.975L11.5998 16.2875C11.4222 16.4533 11.187 16.5437 10.9441 16.5395C10.7011 16.5353 10.4692 16.4369 10.2973 16.265C10.1255 16.0932 10.0271 15.8613 10.0229 15.6183C10.0187 15.3753 10.109 15.1402 10.2748 14.9625L13.9873 11.25H4.68735C4.43871 11.25 4.20025 11.1513 4.02444 10.9754C3.84862 10.7996 3.74985 10.5612 3.74985 10.3125C3.74985 10.0639 3.84862 9.82543 4.02444 9.64962C4.20025 9.4738 4.43871 9.37503 4.68735 9.37503H13.9873L10.2748 5.66253C10.0993 5.48675 10.0007 5.24847 10.0007 5.00003C10.0007 4.75159 10.0993 4.51331 10.2748 4.33753Z"
                                        fill="#0456FF"
                                    />
                                </svg>
                            </button>
                        )}
                    </div>
                    <div className="relative px-[70px]">
                        <button className="template-prev-btn absolute left-0 top-1/2 -translate-y-1/2 z-30 w-[40px] h-[40px] rounded-full bg-[#0456FF] text-white flex items-center justify-center shadow-md hover:bg-[#0041C7] transition-all duration-200 cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m15 18-6-6 6-6" />
                            </svg>
                        </button>
                        <button className="template-next-btn absolute right-0 top-1/2 -translate-y-1/2 z-30 w-[40px] h-[40px] rounded-full bg-white border border-[#0456FF] text-[#0456FF] flex items-center justify-center shadow-md hover:bg-[#0456FF] hover:text-white transition-all duration-200 cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m9 18 6-6-6-6" />
                            </svg>
                        </button>
                        <Swiper
                            modules={[Navigation, Pagination]}
                            loop={true}
                            centeredSlides={true}
                            spaceBetween={16}
                            slidesPerView={5}
                            navigation={{
                                prevEl: ".template-prev-btn",
                                nextEl: ".template-next-btn",
                            }}
                            pagination={{
                                clickable: true,
                                el: ".custom-template-pagination",
                            }}
                            breakpoints={{
                                320: { slidesPerView: 1, spaceBetween: 10 },
                                640: { slidesPerView: 3, spaceBetween: 12 },
                                1024: { slidesPerView: 5, spaceBetween: 16 },
                            }}
                            className="!p-[8px] [&_.swiper-wrapper]:items-center">
                            {templates.map((item, index) => (
                                <SwiperSlide key={item.id} className="py-2">
                                    <div className="group relative cursor-pointer transition-all duration-300 transform scale-95 opacity-80 hover:opacity-100 hover:scale-100 [.swiper-slide-active_&]:scale-105 [.swiper-slide-active_&]:opacity-100 [.swiper-slide-active_&]:z-20">
                                        <div className="relative overflow-hidden rounded-[10px] aspect-[1/1.41] border-2 border-[#CACACA] shadow-[0px_4px_4px_0px_#0456FF36]">
                                            <Image src={item.image} alt={item.name} fill sizes="(max-width: 768px) 100vw, 300px" className="object-cover transition-transform duration-300 group-hover:scale-105" priority={index < 5} />
                                            <div className="absolute inset-0 bg-black/23 opacity-0 group-hover:opacity-100 [.swiper-slide-active_&]:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-[70px] px-3">
                                                {loading ? null : isAuthenticated ? (
                                                    <Link href="/templates" className="bg-white text-[#000024] font-semibold text-[9px] px-[8px] py-[3.5px] rounded-[5px] shadow-md transition-all duration-200 cursor-pointer hover:bg-[#0456FF] hover:text-white transform translate-y-2 group-hover:translate-y-0 [.swiper-slide-active_&]:translate-y-0">Use This Template</Link>                                                   
                                                ) : (
                                                    <button onClick={() => setActiveAuthModal("login")} className="bg-white text-[#000024] font-semibold text-[9px] px-[8px] py-[3.5px] rounded-[5px] shadow-md transition-all duration-200 cursor-pointer hover:bg-[#0456FF] hover:text-white transform translate-y-2 group-hover:translate-y-0 [.swiper-slide-active_&]:translate-y-0">Use This Template</button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                    <div className="h-[15px] custom-template-pagination flex justify-center items-center gap-[10px] mt-[40px] [&>.swiper-pagination-bullet]:w-[12px] [&>.swiper-pagination-bullet]:h-[12px] [&>.swiper-pagination-bullet]:bg-[#CACACA] [&>.swiper-pagination-bullet]:opacity-100 [&>.swiper-pagination-bullet-active]:bg-[#0456FF] [&>.swiper-pagination-bullet]:rounded-full [&>.swiper-pagination-bullet]:cursor-pointer [&>.swiper-pagination-bullet]:transition-all"></div>
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
    );
}