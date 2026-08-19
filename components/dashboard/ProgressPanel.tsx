"use client";

import { useResume } from "@/context/ResumeContext";

export default function ProgressPanel() {
    const { sections, progressPercentage } = useResume();

    const checklist = [
        { label: "Basic Info", key: "basicInfo" },
        { label: "Education", key: "education" },
        { label: "Experience", key: "experience" },
        { label: "Skills", key: "skills" },
        { label: "Summary", key: "summary" },
    ];

    return (
        <div className="w-full bg-white border border-[#CACACA80] rounded-[12px] p-5">
            <h4 className="font-bold text-[16px] text-[#000024] mb-4">Your Progress</h4>
            <div className="flex items-center gap-[15px] mb-6 pb-5 border-b border-[#CACACA80]">
                <div
                    className="relative w-[110px] h-[110px] rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ease-out"
                    style={{
                        background: `conic-gradient(#0456FF ${progressPercentage}%, #E2E8F0 ${progressPercentage}% 100%)`
                    }}
                >
                    <div className="w-[100px] h-[100px] bg-white rounded-full flex items-center justify-center font-extrabold text-[26px] leading-[120%] text-[#000024]">
                        {progressPercentage}%
                    </div>
                </div>
                <div>
                    <p className="font-bold text-[16px] leading-[120%] text-[#29B33A] mb-[5px]">{progressPercentage >= 80 ? "Great Progress!" : "Keep Going!"}</p>
                    <p className="font-normal text-[14px] leading-[120%] text-[#00002499]">
                        {progressPercentage === 100 ? "All sections are completed!" : "Complete all sections to finish."}
                    </p>
                </div>
            </div>
            <div className="space-y-3">
                {checklist.map((item) => {
                    const isDone = sections[item.key as keyof typeof sections];
                    return (
                        <div key={item.key} className="flex items-center gap-3 text-[13px]">
                            <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isDone
                                    ? "bg-[#29B33A] text-white"
                                    : "border border-gray-300 text-transparent"
                                    }`}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="9"
                                    height="9"
                                    viewBox="0 0 36 36"
                                    aria-hidden="true"
                                    role="img"
                                >
                                    <path
                                        fill="#fff"
                                        d="M34.459 1.375a2.999 2.999 0 0 0-4.149.884L13.5 28.17l-8.198-7.58a2.999 2.999 0 1 0-4.073 4.405l10.764 9.952s.309.266.452.359a2.999 2.999 0 0 0 4.15-.884L35.343 5.524a2.999 2.999 0 0 0-.884-4.149z"
                                    />
                                </svg>
                            </div>
                            <span className={isDone ? "font-bold text-[14px] leading-[100%]" : "text-[#00002480]"}>
                                {item.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}