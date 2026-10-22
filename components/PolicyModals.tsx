"use client";

import { useEffect, useState } from "react";

export const OPEN_PRIVACY_EVENT = "open_privacy_modal";
export const OPEN_TERMS_EVENT = "open_terms_modal";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

function BaseModal({ isOpen, onClose, title, children }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-[600px] max-h-[80vh] bg-white rounded-[16px] shadow-2xl border border-gray-100 p-6 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <h3 className="font-bold text-[20px] text-[#000024]">{title}</h3>
                    <button
                        onClick={onClose}
                        type="button"
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-200 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="py-4 overflow-y-auto font-normal text-[14px] text-gray-600 leading-[160%] flex flex-col gap-3">
                    {children}
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={onClose}
                        type="button"
                        className="px-5 py-2 rounded-[6px] bg-[#0456FF] font-medium text-[14px] text-white hover:bg-blue-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function PolicyModals() {
    const [activeModal, setActiveModal] = useState<"privacy" | "terms" | null>(null);

    useEffect(() => {
        const openPrivacy = () => setActiveModal("privacy");
        const openTerms = () => setActiveModal("terms");

        window.addEventListener(OPEN_PRIVACY_EVENT, openPrivacy);
        window.addEventListener(OPEN_TERMS_EVENT, openTerms);

        return () => {
            window.removeEventListener(OPEN_PRIVACY_EVENT, openPrivacy);
            window.removeEventListener(OPEN_TERMS_EVENT, openTerms);
        };
    }, []);

    const closeModal = () => setActiveModal(null);

    return (
        <>
            <BaseModal
                isOpen={activeModal === "privacy"}
                onClose={closeModal}
                title="Privacy Policy"
            >
                <p>
                    Your privacy is important to us. This policy outlines how we handle, store, and protect your personal data when using our service.
                </p>
                <p>
                    We collect personal information such as contact details and resume history solely to provide and improve our builder services. We do not sell your personal data to third parties.
                </p>
                <p>
                    All sensitive data transmissions are encrypted and secure. You can request deletion of your account and data at any time.
                </p>
            </BaseModal>

            <BaseModal
                isOpen={activeModal === "terms"}
                onClose={closeModal}
                title="Terms of Use"
            >
                <p>
                    By using our application, you agree to comply with these terms. Please read them carefully before creating your documents.
                </p>
                <p>
                    You retain full ownership of all content, text, and details you enter into your resumes. We grant you a non-exclusive license to generate and download PDF exports.
                </p>
                <p>
                    You agree not to misuse the platform, attempt unauthorized API access, or post misleading information using automated scripts.
                </p>
            </BaseModal>
        </>
    );
}