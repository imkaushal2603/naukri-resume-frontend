"use client";

import { useResume } from "@/context/ResumeContext";

export default function ProgressPanel() {
    const { sections, progressPercentage } = useResume();

    const checklist = [
        { label: "Basic Information", key: "basicInfo" },
        { label: "Education", key: "education" },
        { label: "Experience", key: "experience" },
        { label: "Skills", key: "skills" },
        { label: "Summary", key: "summary" },
    ];

    return (
        <div className="w-[300px] shrink-0 bg-white border border-[#CACACA80] rounded-[12px] p-5 shadow-sm self-start sticky top-6">
            <h4 className="font-bold text-[16px] text-[#000024] mb-4">Resume Progress</h4>

            <div className="flex items-center gap-4 mb-6 pb-5 border-b border-[#CACACA80]">
                <div className="relative w-14 h-14 rounded-full border-4 border-[#0456FF] flex items-center justify-center font-bold text-[#0456FF] text-[15px] shrink-0">
                    {progressPercentage}%
                </div>
                <div>
                    <p className="font-bold text-[14px] text-[#000024]">
                        {progressPercentage >= 80 ? "Great Progress!" : "Keep Going!"}
                    </p>
                    <p className="text-[12px] text-[#00002480]">
                        {progressPercentage === 100
                            ? "All sections are completed!"
                            : "Complete all sections to finish."}
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
                                        ? "bg-[#10B981] text-white"
                                        : "border border-gray-300 text-transparent"
                                    }`}
                            >
                                ✓
                            </div>
                            <span className={isDone ? "font-semibold text-[#000024]" : "text-[#00002480]"}>
                                {item.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}