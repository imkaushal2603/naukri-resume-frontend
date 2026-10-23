"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Logo from "@/public/header/logo.svg";

const Login = dynamic(() => import("./Login"), { ssr: false });
const Registration = dynamic(() => import("./Registration"), { ssr: false });
const ForgotPassword = dynamic(() => import("./ForgotPassword"), { ssr: false });

export default function Header() {
    const { isAuthenticated, loading } = useAuth();
    const [activeAuthModal, setActiveAuthModal] = useState<"login" | "register" | "reset" | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const preloadLogin = () => {
        void import("./Login");
    };

    return (
        <>
            <div className="top_bar bg-[#0456FF]">
                <div className="max-w-[1390px] mx-auto px-[15px]">
                    <p className="text-center text-[15px] font-medium py-[12px] text-[#fff] leading-none">
                        <strong>Early Access Sale:</strong> Get an instant <strong>91% OFF</strong> on all plans!
                    </p>
                </div>
            </div>
            <header className="bg-[#F6F7FE] py-[25px]">
                <div className="max-w-[1390px] mx-auto px-[15px]">
                    <div className="flex justify-between items-center flex-wrap">
                        <div className="w-[200px]">
                            <Link href="/">
                                <Image src={Logo} alt="Naukri Resume" width={196} height={55} priority />
                            </Link>
                        </div>
                        <div className="w-[calc(100%-201px)] pl-10 flex justify-end gap-[15px] flex-wrap">
                            <button
                                type="button"
                                aria-label="Toggle menu"
                                aria-expanded={isMenuOpen}
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="md:hidden flex bg-[#0456FF] w-[35px] h-[35px] rounded-full justify-center items-center text-white"
                            >
                                ☰
                            </button>
                            <div className={`${isMenuOpen ? "flex" : "hidden"} md:flex flex-col md:flex-row items-end md:items-center gap-[10px] absolute md:static top-[85px] right-[15px] md:top-auto md:right-auto bg-white md:bg-transparent p-[15px] md:p-0 rounded-[8px] shadow-md md:shadow-none z-50`}>
                                {loading ? <div className="w-[100px] h-[40px]" aria-hidden="true" /> : isAuthenticated ? (
                                    <Link
                                        href="/dashboard"
                                        className="inline-block border border-[#0456FF] bg-[#0456FF] py-[11px] px-[26px] rounded-[5px] font-semibold text-[14px] leading-none text-white hover:bg-transparent hover:text-[#0456FF] transition-colors duration-300"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setActiveAuthModal("login");
                                                setIsMenuOpen(false);
                                            }}
                                            className="inline-block border border-[#0456FF] rounded-[5px] py-[11px] px-[26px] font-semibold text-sm leading-none text-[#0456FF] cursor-pointer hover:bg-[#0456FF] hover:text-white transition-colors duration-300"
                                        >
                                            Login
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            {activeAuthModal === "login" && (
                <Login
                    isOpen={activeAuthModal === "login"}
                    onClose={() => setActiveAuthModal(null)}
                    onOpenSignUp={() => setActiveAuthModal("register")}
                    onOpenForgotPassword={() => setActiveAuthModal("reset")}
                />
            )}
            {activeAuthModal === "register" && (
                <Registration
                    isOpen={activeAuthModal === "register"}
                    onClose={() => setActiveAuthModal(null)}
                    onOpenLogin={() => setActiveAuthModal("login")}
                />
            )}
            {activeAuthModal === "reset" && (
                <ForgotPassword
                    isOpen={activeAuthModal === "reset"}
                    onClose={() => setActiveAuthModal(null)}
                    onOpenLogin={() => setActiveAuthModal("login")}
                />
            )}
        </>
    )
}