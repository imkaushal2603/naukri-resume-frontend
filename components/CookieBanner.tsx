"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";

const COOKIE_CONSENT_KEY = "user_cookie_consent";
export const OPEN_COOKIE_SETTINGS_EVENT = "open_cookie_settings";

export default function CookieBanner() {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        const consent = Cookies.get(COOKIE_CONSENT_KEY);
        if (!consent) {
            setShowBanner(true);
        }

        const handleOpen = () => setShowBanner(true);
        window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, handleOpen);
        return () => window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, handleOpen);
    }, []);

    const handleAccept = () => {
        Cookies.set(COOKIE_CONSENT_KEY, "accepted", { expires: 365, sameSite: "Lax" });
        setShowBanner(false);
        window.dispatchEvent(new Event("cookie_consent_accepted"));
    };

    const handleDecline = () => {
        Cookies.set(COOKIE_CONSENT_KEY, "declined", { expires: 30, sameSite: "Lax" });
        setShowBanner(false);
        window.dispatchEvent(new Event("cookie_consent_declined"));
    };

    if (!showBanner) return null;

    return (
        <div className="fixed bottom-5 right-5 left-5 md:left-auto md:max-w-[420px] bg-white p-6 rounded-[12px] shadow-[0px_4px_20px_rgba(0,0,0,0.15)] z-50 border border-gray-100 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
                <h4 className="font-bold text-[18px] text-[#000024] leading-[120%]">We value your privacy</h4>
                <p className="font-normal text-[14px] text-gray-600 leading-[140%]">
                    We use cookies to enhance your experience, analyze traffic, and offer personalized content.
                    You can accept all cookies or decline non-essential ones.
                </p>
            </div>

            <div className="flex items-center gap-3 justify-end">
                <button
                    onClick={handleDecline}
                    type="button"
                    className="px-4 py-2 rounded-[6px] border border-gray-300 font-medium text-[14px] text-[#000024] hover:bg-gray-100 transition-colors"
                >
                    Decline
                </button>
                <button
                    onClick={handleAccept}
                    type="button"
                    className="px-4 py-2 rounded-[6px] bg-[#0456FF] font-medium text-[14px] text-white hover:bg-blue-700 transition-colors"
                >
                    Accept All
                </button>
            </div>
        </div>
    );
}