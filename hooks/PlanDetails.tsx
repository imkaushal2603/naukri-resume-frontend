import { useState, useEffect } from "react";
import api from "@/services/api";
import Link from "next/link";

function withMinDelay<T>(promise: Promise<T>, ms: number = 1000): Promise<T> {
    return Promise.all([
        promise,
        new Promise((resolve) => setTimeout(resolve, ms)),
    ]).then(([result]) => result as T);
}

interface Resume {
    id: number;
    name?: string;
    updatedAt?: string;
    resume_templates?: {
        id: number;
        name: string;
        templateKey: string;
        preview?: string;
    };
}

interface Membership {
    startDate: string;
    endDate: string;
    membershipPlanId: number;
    status: string;
    plan: {
        id: number;
        name: string;
        price: string;
        durationDays: number;
    };
}

export default function PlanDetails() {
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [maxResumes, setMaxResumes] = useState<number>(15);
    const [loading, setLoading] = useState<boolean>(true);
    const [membership, setMembership] = useState<Membership | null>(null);
    const [membershipLoading, setMembershipLoading] = useState<boolean>(true);

    useEffect(() => {
        const checkResumes = async () => {
            try {
                const res = await withMinDelay(api.get("/resume"));
                if (res.data.success) {
                    setResumes(res.data.resumes || []);
                    if (res.data.maxResumes) {
                        setMaxResumes(res.data.maxResumes);
                    }
                }
            } catch (err) {
                console.error("Failed to check resumes", err);
            } finally {
                setLoading(false);
            }
        };
        checkResumes();
    }, []);

    useEffect(() => {
        const fetchMembership = async () => {
            try {
                const res = await api.get("/membership");
                if (res.data.success) {
                    setMembership(res.data.status);
                }
            } catch (err) {
                console.error("Failed to load membership", err);
            } finally {
                setMembershipLoading(false);
            }
        };
        fetchMembership();
    }, []);

    const getPlanLabel = (durationDays: number) => {
        if (durationDays === 365) return "Annual Access";
        return `${durationDays}-Day Access`;
    };

    const getUsageStatus = (used: number, max: number) => {
        const percentage = (used / max) * 100;

        if (percentage >= 100) {
            return {
                color: "#DC2626",
                message: `You've used all ${max} resumes in your plan.`,
            };
        }

        if (percentage >= 60) {
            return {
                color: "#F59E0B",
                message: `You can create up to ${max} resumes in this plan.`,
            };
        }

        return {
            color: "#29B33A",
            message: `You can create up to ${max} resumes in this plan.`,
        };
    };

    const iconColor = membership ? "#0456FF" : "#000024";

    return (
        <>
            {membershipLoading ? (
                <div className="border border-[#CACACA80] rounded-[10px] p-5 animate-pulse">
                    <div className="h-5 w-32 bg-gray-200 rounded mb-3" />
                    <div className="h-4 w-48 bg-gray-100 rounded" />
                </div>
            ) : (
                <>
                    <div className="border border-[#CACACA80] rounded-[5px] py-[15px] px-[21px] min-[1025px]:max-[1300px]:w-[calc(50%-10px)]">
                        <h5 className="font-semibold text-[16px] leading-[120%] text-black mb-[20px] border-b border-[#CACACA80] pb-[10px]">Your Plan Overview</h5>
                        <div className="flex flex-wrap gap-5">
                            <div className="w-[28px]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="31" viewBox="0 0 28 31" fill="none">
                                    <path d="M26.5611 3.2434L14 0L1.43889 3.2434C1.0252 3.35092 0.659875 3.58733 0.399679 3.91588C0.139482 4.24444 -0.00101865 4.64674 5.56013e-06 5.0603V17.3432C0.00332924 19.1216 0.489906 20.868 1.41115 22.4081C2.3324 23.9482 3.65607 25.2281 5.25 26.1199L14 31L22.75 26.1199C24.3439 25.2281 25.6676 23.9482 26.5889 22.4081C27.5101 20.868 27.9967 19.1216 28 17.3432V5.0603C28 4.21192 27.4089 3.46864 26.5611 3.2434ZM13.4322 18.3192C13.2513 18.4934 13.0366 18.6315 12.8004 18.7255C12.5642 18.8195 12.3111 18.8677 12.0556 18.8673C11.5578 18.8673 11.06 18.6871 10.6789 18.3192L7.34223 15.0983L8.99111 13.5067L12.0556 16.4648L19.7867 9.00194L21.4356 10.5936L13.4322 18.3192Z" fill="#29B33A" />
                                </svg>
                            </div>
                            <div className="w-[calc(100%-48px)]">
                                <div className="flex items-center gap-[10px] mb-[13px]">
                                    <h4 className="font-bold text-[16px] leading-none text-[#000024]">{membership ? getPlanLabel(membership.plan.durationDays) : "Free Plan"}</h4>
                                    {membership &&
                                        <span className="border border-[#29B33A] bg-[#E6F9EC] rounded-[20px] font-bold text-[10px] leading-[100%] py-[5px] px-[10px] text-[#29B33A]">
                                            Active
                                        </span>
                                    }
                                </div>
                                {membership &&
                                    <p className="font-normal text-[12px] leading-[100%] mb-[11px] text-[#000024]">
                                        Valid till {new Date(membership.endDate).toLocaleDateString("en-US", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        })}, {new Date(membership.endDate).toLocaleTimeString("en-US", {
                                            hour: "numeric",
                                            minute: "2-digit",
                                            hour12: true,
                                        })}
                                    </p>
                                }
                                {membership &&
                                    (() => {
                                        const daysRemaining = Math.max(
                                            0,
                                            Math.ceil(
                                                (new Date(membership.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                                            )
                                        );
                                        return (
                                            <p className="font-bold text-[12px] leading-[100%] text-[#29B33A]">
                                                ({daysRemaining} {daysRemaining === 1 ? "Day" : "Days"} remaining)
                                            </p>
                                        );
                                    })()
                                }
                            </div>
                        </div>
                        <div className="my-[20px]">
                            <div className="flex justify-between items-center mb-[10px]">
                                <span className="font-bold text-[12px] leading-[100%] text-[#000024]">Resumes Created</span>
                                <span className="font-bold text-[12px] leading-[100%] text-[#000024]">{resumes.length} / {maxResumes}</span>
                            </div>
                            <div className="w-full h-[8px] bg-[#E8E9F0] rounded-full overflow-hidden">
                                <div className="h-full bg-[#29B33A] rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (resumes.length / maxResumes) * 100)}%`, backgroundColor: getUsageStatus(resumes.length, maxResumes).color, }} />
                            </div>
                            <p className="font-normal text-[12px] leading-[100%] text-[#000024] mt-[8px]">You can create up to {maxResumes} resumes in this plan.</p>
                        </div>
                        {membership ? (
                            <Link href={resumes.length === maxResumes ? "/extend-resume-limit" : "/plans"}
                                className="w-full flex items-center justify-center gap-[10px] mt-[10px] border border-[#0456FF] bg-[#0456FF] py-[11px] px-[26px] rounded-[5px] font-semibold text-[14px] leading-none text-white hover:bg-transparent hover:text-[#0456FF] transition-colors duration-300"
                            >
                                {resumes.length === maxResumes ? "Extend Limit" : "View Current Plan"}
                            </Link>
                        ) : (
                            <Link href="/plans"
                                className="w-full flex items-center justify-center gap-[10px] mt-[10px] border border-[#0456FF] bg-[#0456FF] py-[11px] px-[26px] rounded-[5px] font-semibold text-[14px] leading-none text-white hover:bg-transparent hover:text-[#0456FF] transition-colors duration-300"
                            >
                                Upgrade Plan
                            </Link>
                        )}
                    </div>
                    <div className="border border-[#CACACA80] rounded-[5px] py-[15px] px-[21px] min-[1025px]:max-[1300px]:w-[calc(50%-10px)]">
                        {!membership ? (
                            <h5 className="font-semibold text-[18px] leading-[120%] text-black mb-[10px]">Why upgrade?</h5>
                        ) : <h5 className="font-semibold text-[18px] leading-[120%] text-black mb-[10px] flex gap-[10px]">All Premium Features Unlocked
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <g clipPath="url(#clip0_1198_311)">
                                    <path d="M0.5 15.25L2.65 14.5L1.025 13.75L0.5 15.25Z" fill="#F7B600" />
                                    <path d="M6.7252 9.0998L3.7002 6.0498L3.2002 7.4498L6.7252 9.0998Z" fill="#FFDD7D" />
                                    <path d="M3.20039 7.4502L2.65039 9.0252L9.35039 12.1502L9.67539 12.0502L6.72539 9.1002L3.20039 7.4502Z" fill="#F7B600" />
                                    <path d="M2.125 10.6004L7.125 12.9254L9.35 12.1504L2.65 9.02539L2.125 10.6004Z" fill="#FFDD7D" />
                                    <path d="M1.5752 12.1746L4.8752 13.7246L7.1252 12.9246L2.1252 10.5996L1.5752 12.1746Z" fill="#F7B600" />
                                    <path d="M1.57539 12.1748L1.02539 13.7498L2.65039 14.4998L4.87539 13.7248L1.57539 12.1748Z" fill="#FFDD7D" />
                                    <path d="M7.97452 7.79996C9.64952 9.44996 10.5245 11.3 9.92452 11.9C9.29952 12.5 7.44952 11.65 5.74952 9.97496C4.07452 8.32496 3.19952 6.47496 3.79952 5.87496C4.42452 5.27496 6.27452 6.14996 7.97452 7.79996Z" fill="#493816" />
                                    <path d="M5.87526 3.625C5.47526 3.05 5.90026 2.8 6.45026 2.9C5.92526 2.275 6.25026 1.825 7.07526 2C7.32526 2.05 6.97526 2.475 6.75026 2.475C7.42526 2.975 7.05026 3.525 6.32526 3.4C6.97526 4.275 5.87526 4.05 5.37526 4.1C5.25026 4.75 6.00026 5.5 5.75026 5.5C5.20026 5.5 4.30026 3.425 5.87526 3.625Z" fill="#42ADE2" />
                                    <path d="M11.1246 4.8254C10.7496 5.0004 9.69962 3.3504 10.9996 3.3254C10.2496 2.6504 10.3496 2.3254 11.3496 2.3004C10.1996 1.1504 12.0246 0.750403 12.1996 1.3504C12.2496 1.5254 11.6496 1.2004 11.4496 1.5254C11.2246 1.9004 12.8496 2.8754 11.1746 2.8004C11.7996 3.4254 11.8246 3.7254 10.8496 3.8254C10.9746 4.0254 11.3746 4.7254 11.1246 4.8254Z" fill="#FF8736" />
                                    <path d="M11.5498 8.72539L11.9248 8.40039C11.9248 8.40039 12.2748 8.92539 12.5248 9.12539C12.7248 8.22539 12.6748 7.70039 13.6998 8.30039C13.1248 6.75039 14.0748 7.32539 14.9998 7.75039C14.9498 7.35039 14.9998 7.40039 15.3998 7.27539C15.7498 8.60039 14.7998 8.20039 14.0498 7.77539C14.4998 8.97539 14.0248 8.90039 13.0748 8.50039C13.0498 9.00039 12.8998 9.57539 12.5998 9.62539C12.2498 9.72539 11.5498 8.72539 11.5498 8.72539Z" fill="#ED4C5C" />
                                    <path d="M8.7498 5.025C8.2998 5.625 7.5748 5.95 7.0498 6.475C6.4998 7.025 6.1748 8.525 6.1748 8.525C6.1748 8.525 6.3748 6.95 6.8998 6.35C7.3748 5.8 8.0748 5.4 8.4498 4.775C9.0998 3.625 8.4998 2.125 7.6498 1.25C7.8248 1.1 8.0748 0.9 8.1998 0.75C9.0248 1.775 9.7248 3.75 8.7498 5.025Z" fill="#C28FEF" />
                                    <path d="M9.52539 6.29952C8.87539 6.77452 8.40039 7.47452 7.95039 8.12452C7.55039 8.69952 6.27539 9.42452 6.27539 9.42452C6.27539 9.42452 7.47539 8.59952 7.85039 7.99952C8.30039 7.24952 8.75039 6.47452 9.45039 5.92452C10.8504 4.84952 12.8754 4.94952 14.4504 5.52452C14.3504 5.74952 14.1754 6.22452 14.1754 6.22452C14.1754 6.22452 10.8504 5.32452 9.52539 6.29952Z" fill="#FF8736" />
                                    <path d="M12.3002 6.17502C11.8752 6.72502 11.6752 7.40002 11.3502 8.02502C11.0502 8.60002 10.6502 9.15002 10.0752 9.45002C9.42523 9.77502 8.00023 9.67502 8.00023 9.67502C8.00023 9.67502 9.42523 9.65002 10.0252 9.25002C10.6252 8.85002 10.9502 8.15002 11.1752 7.50002C11.6252 6.25002 12.1752 4.90002 13.4752 4.35002C13.5502 4.57502 13.7252 5.05002 13.7252 5.05002C13.7252 5.05002 13.0002 5.25002 12.3002 6.17502ZM0.802734 3.58127L1.50973 2.87402L2.21698 3.58102L1.50998 4.28852L0.802734 3.58127Z" fill="#42ADE2" />
                                    <path d="M1.79297 5.7988L2.49972 5.0918L3.20672 5.7988L2.49972 6.5058L1.79297 5.7988Z" fill="#FF8736" />
                                    <path d="M3.58984 2.45505L4.29684 1.74805L5.00384 2.45505L4.29684 3.16205L3.58984 2.45505Z" fill="#ED4C5C" />
                                    <path d="M11.3008 10.924L12.0078 10.2168L12.7148 10.924L12.0078 11.631L11.3008 10.924Z" fill="#C28FEF" />
                                    <path d="M9.72559 13.3476L10.4326 12.6406L11.1398 13.3479L10.4326 14.0549L9.72559 13.3476Z" fill="#ED4C5C" />
                                    <path d="M12.8193 13.9016L13.5263 13.1943L14.2333 13.9016L13.5263 14.6086L12.8193 13.9016Z" fill="#FF8736" />
                                    <path d="M13.5194 10.6823L14.2264 9.9753L14.9334 10.6823L14.2264 11.3895L13.5194 10.6823ZM12.3389 3.2053L13.0459 2.49805L13.7531 3.2053L13.0461 3.9123L12.3389 3.2053Z" fill="#42ADE2" />
                                    <path d="M4.76074 7.44821L5.46799 6.74121L6.17499 7.44821L5.46799 8.15546L4.76074 7.44821Z" fill="#ED4C5C" />
                                </g>
                                <defs>
                                    <clipPath id="clip0_1198_311">
                                        <rect width="16" height="16" fill="white" />
                                    </clipPath>
                                </defs>
                            </svg>
                        </h5>}
                        <ul className="flex flex-col gap-y-[6px]">
                            {/* <li className="flex flex-wrap items-center gap-[10px]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M5.77687 9.57122L3.125 6.91872L4.00875 6.03497L5.77687 7.80247L9.31187 4.26685L10.1962 5.15122L5.77687 9.57122Z" fill={iconColor} />
                            <path fillRule="evenodd" clipRule="evenodd" d="M0 6.875C0 3.07812 3.07812 0 6.875 0C10.6719 0 13.75 3.07812 13.75 6.875C13.75 10.6719 10.6719 13.75 6.875 13.75C3.07812 13.75 0 10.6719 0 6.875ZM6.875 12.5C6.13631 12.5 5.40486 12.3545 4.72241 12.0718C4.03995 11.7891 3.41985 11.3748 2.89752 10.8525C2.37519 10.3301 1.96086 9.71005 1.67818 9.02759C1.39549 8.34514 1.25 7.61369 1.25 6.875C1.25 6.13631 1.39549 5.40486 1.67818 4.72241C1.96086 4.03995 2.37519 3.41985 2.89752 2.89752C3.41985 2.37519 4.03995 1.96086 4.72241 1.67818C5.40486 1.39549 6.13631 1.25 6.875 1.25C8.36684 1.25 9.79758 1.84263 10.8525 2.89752C11.9074 3.95242 12.5 5.38316 12.5 6.875C12.5 8.36684 11.9074 9.79758 10.8525 10.8525C9.79758 11.9074 8.36684 12.5 6.875 12.5Z" fill={iconColor} />
                        </svg>
                        Unlimited PDF & DOCX Downloads
                    </li> */}
                            <li className="flex flex-wrap items-center gap-[10px]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path d="M5.77687 9.57122L3.125 6.91872L4.00875 6.03497L5.77687 7.80247L9.31187 4.26685L10.1962 5.15122L5.77687 9.57122Z" fill={iconColor} />
                                    <path fillRule="evenodd" clipRule="evenodd" d="M0 6.875C0 3.07812 3.07812 0 6.875 0C10.6719 0 13.75 3.07812 13.75 6.875C13.75 10.6719 10.6719 13.75 6.875 13.75C3.07812 13.75 0 10.6719 0 6.875ZM6.875 12.5C6.13631 12.5 5.40486 12.3545 4.72241 12.0718C4.03995 11.7891 3.41985 11.3748 2.89752 10.8525C2.37519 10.3301 1.96086 9.71005 1.67818 9.02759C1.39549 8.34514 1.25 7.61369 1.25 6.875C1.25 6.13631 1.39549 5.40486 1.67818 4.72241C1.96086 4.03995 2.37519 3.41985 2.89752 2.89752C3.41985 2.37519 4.03995 1.96086 4.72241 1.67818C5.40486 1.39549 6.13631 1.25 6.875 1.25C8.36684 1.25 9.79758 1.84263 10.8525 2.89752C11.9074 3.95242 12.5 5.38316 12.5 6.875C12.5 8.36684 11.9074 9.79758 10.8525 10.8525C9.79758 11.9074 8.36684 12.5 6.875 12.5Z" fill={iconColor} />
                                </svg>
                                Unlimited PDF Downloads
                            </li>
                            <li className="flex flex-wrap items-center gap-[10px]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path d="M5.77687 9.57122L3.125 6.91872L4.00875 6.03497L5.77687 7.80247L9.31187 4.26685L10.1962 5.15122L5.77687 9.57122Z" fill={iconColor} />
                                    <path fillRule="evenodd" clipRule="evenodd" d="M0 6.875C0 3.07812 3.07812 0 6.875 0C10.6719 0 13.75 3.07812 13.75 6.875C13.75 10.6719 10.6719 13.75 6.875 13.75C3.07812 13.75 0 10.6719 0 6.875ZM6.875 12.5C6.13631 12.5 5.40486 12.3545 4.72241 12.0718C4.03995 11.7891 3.41985 11.3748 2.89752 10.8525C2.37519 10.3301 1.96086 9.71005 1.67818 9.02759C1.39549 8.34514 1.25 7.61369 1.25 6.875C1.25 6.13631 1.39549 5.40486 1.67818 4.72241C1.96086 4.03995 2.37519 3.41985 2.89752 2.89752C3.41985 2.37519 4.03995 1.96086 4.72241 1.67818C5.40486 1.39549 6.13631 1.25 6.875 1.25C8.36684 1.25 9.79758 1.84263 10.8525 2.89752C11.9074 3.95242 12.5 5.38316 12.5 6.875C12.5 8.36684 11.9074 9.79758 10.8525 10.8525C9.79758 11.9074 8.36684 12.5 6.875 12.5Z" fill={iconColor} />
                                </svg>
                                ATS Resume Score
                            </li>
                            <li className="flex flex-wrap items-center gap-[10px]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path d="M5.77687 9.57122L3.125 6.91872L4.00875 6.03497L5.77687 7.80247L9.31187 4.26685L10.1962 5.15122L5.77687 9.57122Z" fill={iconColor} />
                                    <path fillRule="evenodd" clipRule="evenodd" d="M0 6.875C0 3.07812 3.07812 0 6.875 0C10.6719 0 13.75 3.07812 13.75 6.875C13.75 10.6719 10.6719 13.75 6.875 13.75C3.07812 13.75 0 10.6719 0 6.875ZM6.875 12.5C6.13631 12.5 5.40486 12.3545 4.72241 12.0718C4.03995 11.7891 3.41985 11.3748 2.89752 10.8525C2.37519 10.3301 1.96086 9.71005 1.67818 9.02759C1.39549 8.34514 1.25 7.61369 1.25 6.875C1.25 6.13631 1.39549 5.40486 1.67818 4.72241C1.96086 4.03995 2.37519 3.41985 2.89752 2.89752C3.41985 2.37519 4.03995 1.96086 4.72241 1.67818C5.40486 1.39549 6.13631 1.25 6.875 1.25C8.36684 1.25 9.79758 1.84263 10.8525 2.89752C11.9074 3.95242 12.5 5.38316 12.5 6.875C12.5 8.36684 11.9074 9.79758 10.8525 10.8525C9.79758 11.9074 8.36684 12.5 6.875 12.5Z" fill={iconColor} />
                                </svg>
                                Al Resume Review & Suggestions
                            </li>
                            <li className="flex flex-wrap items-center gap-[10px]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path d="M5.77687 9.57122L3.125 6.91872L4.00875 6.03497L5.77687 7.80247L9.31187 4.26685L10.1962 5.15122L5.77687 9.57122Z" fill={iconColor} />
                                    <path fillRule="evenodd" clipRule="evenodd" d="M0 6.875C0 3.07812 3.07812 0 6.875 0C10.6719 0 13.75 3.07812 13.75 6.875C13.75 10.6719 10.6719 13.75 6.875 13.75C3.07812 13.75 0 10.6719 0 6.875ZM6.875 12.5C6.13631 12.5 5.40486 12.3545 4.72241 12.0718C4.03995 11.7891 3.41985 11.3748 2.89752 10.8525C2.37519 10.3301 1.96086 9.71005 1.67818 9.02759C1.39549 8.34514 1.25 7.61369 1.25 6.875C1.25 6.13631 1.39549 5.40486 1.67818 4.72241C1.96086 4.03995 2.37519 3.41985 2.89752 2.89752C3.41985 2.37519 4.03995 1.96086 4.72241 1.67818C5.40486 1.39549 6.13631 1.25 6.875 1.25C8.36684 1.25 9.79758 1.84263 10.8525 2.89752C11.9074 3.95242 12.5 5.38316 12.5 6.875C12.5 8.36684 11.9074 9.79758 10.8525 10.8525C9.79758 11.9074 8.36684 12.5 6.875 12.5Z" fill={iconColor} />
                                </svg>
                                Cover Letter Generator
                            </li>
                            <li className="flex flex-wrap items-center gap-[10px]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path d="M5.77687 9.57122L3.125 6.91872L4.00875 6.03497L5.77687 7.80247L9.31187 4.26685L10.1962 5.15122L5.77687 9.57122Z" fill={iconColor} />
                                    <path fillRule="evenodd" clipRule="evenodd" d="M0 6.875C0 3.07812 3.07812 0 6.875 0C10.6719 0 13.75 3.07812 13.75 6.875C13.75 10.6719 10.6719 13.75 6.875 13.75C3.07812 13.75 0 10.6719 0 6.875ZM6.875 12.5C6.13631 12.5 5.40486 12.3545 4.72241 12.0718C4.03995 11.7891 3.41985 11.3748 2.89752 10.8525C2.37519 10.3301 1.96086 9.71005 1.67818 9.02759C1.39549 8.34514 1.25 7.61369 1.25 6.875C1.25 6.13631 1.39549 5.40486 1.67818 4.72241C1.96086 4.03995 2.37519 3.41985 2.89752 2.89752C3.41985 2.37519 4.03995 1.96086 4.72241 1.67818C5.40486 1.39549 6.13631 1.25 6.875 1.25C8.36684 1.25 9.79758 1.84263 10.8525 2.89752C11.9074 3.95242 12.5 5.38316 12.5 6.875C12.5 8.36684 11.9074 9.79758 10.8525 10.8525C9.79758 11.9074 8.36684 12.5 6.875 12.5Z" fill={iconColor} />
                                </svg>
                                Premium Resume Templates
                            </li>
                            <li className="flex flex-wrap items-center gap-[10px]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path d="M5.77687 9.57122L3.125 6.91872L4.00875 6.03497L5.77687 7.80247L9.31187 4.26685L10.1962 5.15122L5.77687 9.57122Z" fill={iconColor} />
                                    <path fillRule="evenodd" clipRule="evenodd" d="M0 6.875C0 3.07812 3.07812 0 6.875 0C10.6719 0 13.75 3.07812 13.75 6.875C13.75 10.6719 10.6719 13.75 6.875 13.75C3.07812 13.75 0 10.6719 0 6.875ZM6.875 12.5C6.13631 12.5 5.40486 12.3545 4.72241 12.0718C4.03995 11.7891 3.41985 11.3748 2.89752 10.8525C2.37519 10.3301 1.96086 9.71005 1.67818 9.02759C1.39549 8.34514 1.25 7.61369 1.25 6.875C1.25 6.13631 1.39549 5.40486 1.67818 4.72241C1.96086 4.03995 2.37519 3.41985 2.89752 2.89752C3.41985 2.37519 4.03995 1.96086 4.72241 1.67818C5.40486 1.39549 6.13631 1.25 6.875 1.25C8.36684 1.25 9.79758 1.84263 10.8525 2.89752C11.9074 3.95242 12.5 5.38316 12.5 6.875C12.5 8.36684 11.9074 9.79758 10.8525 10.8525C9.79758 11.9074 8.36684 12.5 6.875 12.5Z" fill={iconColor} />
                                </svg>
                                Create Up to 15 resume
                            </li>
                            <li className="flex flex-wrap items-center gap-[10px]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path d="M5.77687 9.57122L3.125 6.91872L4.00875 6.03497L5.77687 7.80247L9.31187 4.26685L10.1962 5.15122L5.77687 9.57122Z" fill={iconColor} />
                                    <path fillRule="evenodd" clipRule="evenodd" d="M0 6.875C0 3.07812 3.07812 0 6.875 0C10.6719 0 13.75 3.07812 13.75 6.875C13.75 10.6719 10.6719 13.75 6.875 13.75C3.07812 13.75 0 10.6719 0 6.875ZM6.875 12.5C6.13631 12.5 5.40486 12.3545 4.72241 12.0718C4.03995 11.7891 3.41985 11.3748 2.89752 10.8525C2.37519 10.3301 1.96086 9.71005 1.67818 9.02759C1.39549 8.34514 1.25 7.61369 1.25 6.875C1.25 6.13631 1.39549 5.40486 1.67818 4.72241C1.96086 4.03995 2.37519 3.41985 2.89752 2.89752C3.41985 2.37519 4.03995 1.96086 4.72241 1.67818C5.40486 1.39549 6.13631 1.25 6.875 1.25C8.36684 1.25 9.79758 1.84263 10.8525 2.89752C11.9074 3.95242 12.5 5.38316 12.5 6.875C12.5 8.36684 11.9074 9.79758 10.8525 10.8525C9.79758 11.9074 8.36684 12.5 6.875 12.5Z" fill={iconColor} />
                                </svg>
                                Priority Support
                            </li>
                        </ul>
                        {membership && (() => {
                            const hoursRemaining = (new Date(membership.endDate).getTime() - Date.now()) / (1000 * 60 * 60);

                            if (hoursRemaining <= 24 && hoursRemaining >= 0) {
                                return (
                                    <div className="bg-[#F6F5FD] mt-[25px] rounded-[4px] py-[14px] px-[11px] flex flex-wrap gap-[10px]">
                                        <div className="w-[37px] h-[35px] flex items-center justify-center bg-[#0456FF1A] border border-[#CACACA80] rounded-[4px]">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                <path d="M18.6388 16.3505V10.7455C18.638 9.25357 18.1344 7.80547 17.2093 6.63499C16.2842 5.46451 14.9916 4.63997 13.5403 4.29448V3.80198C13.5403 3.39063 13.3769 2.99612 13.086 2.70525C12.7951 2.41439 12.4006 2.25098 11.9893 2.25098C11.5779 2.25098 11.1834 2.41439 10.8926 2.70525C10.6017 2.99612 10.4383 3.39063 10.4383 3.80198V4.30048C8.99201 4.64997 7.70518 5.47545 6.78451 6.64431C5.86384 7.81317 5.36277 9.25757 5.36179 10.7455V16.3505L3.25879 18.4535V19.425H20.7418V18.4535L18.6388 16.3505Z" stroke="#fb2c36" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M9.66334 19.4248C9.65882 19.7331 9.71563 20.0392 9.83048 20.3253C9.94534 20.6115 10.1159 20.8719 10.3323 21.0915C10.5488 21.3111 10.8067 21.4855 11.0911 21.6046C11.3755 21.7236 11.6808 21.7849 11.9891 21.7849C12.2974 21.7849 12.6027 21.7236 12.8871 21.6046C13.1715 21.4855 13.4294 21.3111 13.6458 21.0915C13.8622 20.8719 14.0328 20.6115 14.1477 20.3253C14.2625 20.0392 14.3194 19.7331 14.3148 19.4248" stroke="#fb2c36" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <div className="w-[calc(100%-47px)]">
                                            <h6 className="font-bold text-[14px] leading-[100%] text-[#000024] mb-[6px]">Plan Expiry Reminder</h6>
                                            <p className="font-normal text-[12px] leading-[140%] text-red-500 mb-[18px]">
                                                Your plan will expire on {new Date(membership.endDate).toLocaleDateString("en-US", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })}, {new Date(membership.endDate).toLocaleTimeString("en-US", {
                                                    hour: "numeric",
                                                    minute: "2-digit",
                                                    hour12: true,
                                                })}. Renew your plan to avoid any interruption.
                                            </p>
                                            <Link href="/plans" className="inline-block border border-[#0456FF] bg-[#0456FF] py-[11px] px-[26px] rounded-[5px] font-semibold text-[14px] leading-none text-white hover:bg-transparent hover:text-[#0456FF] transition-colors duration-300">
                                                Renew Plan
                                            </Link>
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        })()}
                    </div>
                </>
            )}
        </>
    );
}