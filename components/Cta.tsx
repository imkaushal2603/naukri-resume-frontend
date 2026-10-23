"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Login from "./Login";
import Registration from "./Registration";
import ForgotPassword from "./ForgotPassword";
import CTA from "@/public/cta/cta.png";

export default function Cta() {
    const { isAuthenticated, loading } = useAuth();
    const [activeAuthModal, setActiveAuthModal] = useState<"login" | "register" | "reset" | null>(null);

    return (
        <>
            <div>
                <div className="max-w-[1390px] mx-auto px-[15px]">
                    <div className="bg-[#0456FF] flex flex-wrap items-center px-32 py-10 rounded-[15px] max-[768px]:p-[40px] min-[768px]:max-[1025px]:p-[40px]">
                        <div className="w-[50%] pr-5 max-[768px]:w-full max-[768px]:pr-0">
                            <h3 className="font-bold text-[30px] leading-[140%] text-white mb-5">Get noticed, get hired faster</h3>
                            <p className="font-medium text-[18px] leading-[140%] text-white mb-5">Create a professional resume that gets you noticed by recruiters and lands you more interviews.</p>
                            {loading ? null : isAuthenticated ? (
                                <Link href="/dashboard" className="inline-block bg-white px-[26px] py-[11px] font-bold text-[14px] leading-[100%] text-[#0456FF] rounded-[5px] hover:underline">Build My Resume</Link>
                            ) : (
                                <button type="button" onClick={() => setActiveAuthModal("login")} className="inline-block bg-white px-[26px] py-[11px] font-bold text-[14px] leading-[100%] text-[#0456FF] rounded-[5px] cursor-pointer hover:underline">Build My Resume</button>
                            )}
                        </div>
                        <div className="w-[50%] max-[768px]:w-full">
                            <Image src={CTA} className="max-[768px]:w-full min-[768px]:max-[1300px]:w-full" alt="CTA" width={532} height={266} />
                        </div>
                    </div>
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