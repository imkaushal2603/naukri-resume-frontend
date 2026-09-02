"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const pageTitles: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/my-resumes": "My Resumes",
    "/templates": "Templates",
    "/ats-checker": "ATS Checker",
    "/cover-letter": "Cover Letter",
    "/support": "Help & Support",
    "/plans": "Plans",
};

interface HeaderProps {
    onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, loading, logout } = useAuth();

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
        router.push("/");
    };

    const currentTitle = pageTitles[pathname] || "Dashboard";

    return (
        <header className="h-[91px] bg-white border-b border-[#CACACA80] px-[40px] flex items-center justify-between sticky top-0 z-10 max-[768px]:h-[75px] min-[768px]:max-[1025px]:h-[85px] max-[1025px]:px-[20px]">
            <h1 className="text-[18px] leading-[100%] text-[#000024CC] font-bold max-[768px]:text-[16px]">{currentTitle}</h1>
            <div className="max-[1025px]:flex max-[1025px]:items-center max-[1025px]:gap-[20px]">
                <div className="relative" ref={dropdownRef}>
                    {loading ? (
                        <div className="flex items-center gap-3 animate-pulse">
                            <div className="w-10 h-10 rounded-full bg-gray-200" />
                            <div className="w-24 h-4 bg-gray-200 rounded" />
                        </div>
                    ) : (
                        <>
                            <button type="button" onClick={() => setDropdownOpen((prev) => !prev)} className="flex items-center gap-3 cursor-pointer">
                                <div className="w-10 h-10 rounded-full bg-[#0456FF] shadow-[0px_3px_5px_2px_#0456FF4D] text-white flex items-center justify-center font-bold text-sm overflow-hidden max-[768px]:w-[35px] max-[768px]:h-[35px]">
                                    {user?.name
                                        ? user.name.charAt(0).toUpperCase()
                                        : user?.email?.charAt(0).toUpperCase() || "U"}
                                </div>
                                <span className="text-sm font-semibold text-[#000024CC]">{user?.name || user?.email || "User Account"}</span>
                                <svg className={`w-[12px] h-[12px] text-gray-500 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="13"
                                    height="8"
                                    viewBox="0 0 13 8"
                                    fill="none"
                                >
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M5.65703 7.071L2.67029e-05 1.414L1.41403 0L6.36403 4.95L11.314 0L12.728 1.414L7.07103 7.071C6.8835 7.25847 6.62919 7.36379 6.36403 7.36379C6.09886 7.36379 5.84455 7.25847 5.65703 7.071Z"
                                        fill="black"
                                    />
                                </svg>
                            </button>
                            {dropdownOpen && (
                                <div className="absolute right-0 mt-[26px] w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50">
                                    <button type="button" onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 text-left font-medium cursor-pointer hover:bg-red-50 transition-colors">
                                        Logout
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
                <button type="button" onClick={onMenuClick} className="hidden max-[1025px]:flex items-center justify-center w-[40px] h-[40px] max-[1025px]:text-[24px]">☰</button>
            </div>
        </header>
    );
}