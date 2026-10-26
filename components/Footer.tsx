"use client";

import Image from "next/image";
import Link from "next/link";
import CookieBanner, { OPEN_COOKIE_SETTINGS_EVENT } from "./CookieBanner";
import PolicyModals, { OPEN_PRIVACY_EVENT, OPEN_TERMS_EVENT } from "./PolicyModals";
import FOOTER from "@/public/footer/footer.png";
import DOTS from "@/public/footer/Dots.png";
import Logo from "@/public/header/logo.svg";

export default function Footer() {
    const handleOpenPrivacy = () => {
        window.dispatchEvent(new Event(OPEN_PRIVACY_EVENT));
    };

    const handleOpenTerms = () => {
        window.dispatchEvent(new Event(OPEN_TERMS_EVENT));
    };

    const handleOpenCookieSettings = () => {
        window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT));
    };

    return (
        <div className="py-[80px] relative">
            <div className="absolute left-[25px] top-[25px] pointer-events-none">
                <Image src={DOTS} alt="FOOTER" width={92} height={68} />
            </div>
            <div className="max-w-[1390px] mx-auto px-[15px]">
                <div className="flex flex-wrap items-center px-[40px] max-[768px]:px-[10px]">
                    <div className="w-[50%] pr-[20px] max-[768px]:pr-0">
                        <Link href="/" aria-label="Naukri Resume Home">
                            <Image src={Logo} alt="Naukri Resume" width={196} height={55} />
                        </Link>
                        <h5 className="font-medium text-[20px] leading-[130%] text-[rgba(0,0,36,0.8)] my-[20px] max-[768px]:text-[18px]">Buld professional resumes that help you get red faster</h5>
                        <span className="inline-block font-bold text-[18px] leading-[115%] text-[#000024] mb-[15px]">Follow us</span>
                        <ul className="flex flex-wrap gap-[10px]">
                            <li>
                                <Link href="https://www.facebook.com/people/Crowdvolley/61591249543914/" target="blank" rel="noopener noreferrer" aria-label="Visit our Facebook page" className="w-[35px] h-[35px] bg-white shadow-[0px_2px_4px_0px_rgba(0,0,0,0.15)] rounded-full flex justify-center items-center text-[#0456FF] hover:bg-[#0456FF] hover:text-white transition-all duration-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="8" height="15" viewBox="0 0 8 15" fill="none">
                                        <path d="M5.25 8.625H7.125L7.875 5.625H5.25V4.125C5.25 3.3525 5.25 2.625 6.75 2.625H7.875V0.105C7.6305 0.0727501 6.70725 0 5.73225 0C3.696 0 2.25 1.24275 2.25 3.525V5.625H0V8.625H2.25V15H5.25V8.625Z" fill="currentColor" />
                                    </svg>
                                </Link>
                            </li>
                            <li>
                                <Link href="https://www.instagram.com/crowdvolley.it/" target="blank" rel="noopener noreferrer" aria-label="Visit our Instagram profile" className="w-[35px] h-[35px] bg-white shadow-[0px_2px_4px_0px_rgba(0,0,0,0.15)] rounded-full flex justify-center items-center text-[#0456FF] hover:bg-[#0456FF] hover:text-white transition-all duration-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                                        <path d="M12 2.25C14.07 2.25 15.75 3.93 15.75 6V12C15.75 14.07 14.07 15.75 12 15.75H6C3.93 15.75 2.25 14.07 2.25 12V6C2.25 3.93 3.93 2.25 6 2.25H9H12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M9 6C10.6575 6 12 7.3425 12 9C12 10.6575 10.6575 12 9 12C7.3425 12 6 10.6575 6 9C6 7.3425 7.3425 6 9 6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M12.75 6.375C13.3713 6.375 13.875 5.87132 13.875 5.25C13.875 4.62868 13.3713 4.125 12.75 4.125C12.1287 4.125 11.625 4.62868 11.625 5.25C11.625 5.87132 12.1287 6.375 12.75 6.375Z" fill="currentColor" />
                                    </svg>
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div className="w-[50%]">
                        <Image src={FOOTER} className="max-[768px]:w-full min-[768px]:max-[1300px]:w-full" alt="FOOTER" width={640} height={304} />
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-[20px] border-t border-[#CACACA] px-10 pt-[30px] mt-[10px] max-[768px]:px-[10px]">
                    <div className="w-[calc((100%-40px)/3)] flex flex-wrap items-center gap-2.5 max-[768px]:w-full max-[768px]:justify-center min-[768px]:max-[1025px]:w-[calc(50%-10px)]">
                        <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-[0px_2px_4px_0px_rgba(0,0,0,0.15)]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="17" viewBox="0 0 14 17" fill="none">
                                <path d="M5.79167 11.2917L10.5 6.58333L9.3125 5.39583L5.79167 8.91667L4.04167 7.16667L2.85417 8.35417L5.79167 11.2917ZM6.66667 16.6667C4.73611 16.1806 3.1425 15.0728 1.88583 13.3433C0.629167 11.6139 0.000555556 9.69389 0 7.58333V2.5L6.66667 0L13.3333 2.5V7.58333C13.3333 9.69444 12.705 11.6147 11.4483 13.3442C10.1917 15.0736 8.59778 16.1811 6.66667 16.6667ZM6.66667 14.9167C8.11111 14.4583 9.30555 13.5417 10.25 12.1667C11.1944 10.7917 11.6667 9.26389 11.6667 7.58333V3.64583L6.66667 1.77083L1.66667 3.64583V7.58333C1.66667 9.26389 2.13889 10.7917 3.08333 12.1667C4.02778 13.5417 5.22222 14.4583 6.66667 14.9167Z" fill="#0456FF" />
                            </svg>
                        </div>
                        <div className="w-[calc(100%-50px)]">
                            <h5 className="font-bold text-[20px] leading-[100%] text-[#000024CC] mb-[6px]">Your data is safe with us.</h5>
                            <p className="inline-block font-medium text-[16px] leading-[100%] text-[#000024CC]">We never share your personal information.</p>
                        </div>
                    </div>
                    <div className="w-[calc((100%-40px)/3)] max-[768px]:w-full max-[768px]:justify-center min-[768px]:max-[1025px]:w-[calc(50%-10px)]">
                        <p className="text-center font-normal text-[16px] leading-[130%] text-[#66667C]">© 2026 Naukri Resume. All Rights Reserved.<br />A Product by <Link href="https://crowdvolley.com/" target="_blank" className="font-semibold text-[#0456FF] hover:underline">Crowdvolley IT Solutions Pvt. Ltd</Link>.</p>
                    </div>
                    <div className="w-[calc((100%-40px)/3)] flex flex-wrap gap-3 items-center justify-end max-[768px]:w-full max-[768px]:justify-center min-[768px]:max-[1025px]:w-full min-[768px]:max-[1025px]:justify-center">
                        <button onClick={handleOpenPrivacy} type="button" className="inline-block font-medium text-[16px] leading-[150%] text-[#000024] cursor-pointer hover:text-[#0456FF] transition-colors duration-300">Privacy Policy</button>
                        <span>|</span>
                        <button onClick={handleOpenTerms} type="button" className="inline-block font-medium text-[16px] leading-[150%] text-[#000024] cursor-pointer hover:text-[#0456FF] transition-colors duration-300">Terms of Use</button>
                        <span>|</span>
                        <button onClick={handleOpenCookieSettings} type="button" className="inline-block font-medium text-[16px] leading-[150%] text-[#000024] cursor-pointer hover:text-[#0456FF] transition-colors duration-300">Cookies Policy</button>
                    </div>
                </div>
            </div>
            <div className="absolute right-[25px] bottom-[25px] pointer-events-none">
                <Image src={DOTS} alt="FOOTER" width={92} height={68} />
            </div>
            <CookieBanner />
            <PolicyModals />
        </div>
    )
}