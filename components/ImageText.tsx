import Image from "next/image";
import Resume from "@/public/resume.png";

export default function ImageText() {
    return (
        <div className="bg-[#F6F7FE] py-[40px]">
            <div className="max-w-[1230px] mx-auto px-[15px]">
                <div className="flex items-center flex-wrap gap-[45px]">
                    <div className="min-[768px]:max-[1025px]:w-[206px]">
                        <Image src={Resume} alt="Resume" />
                    </div>
                    <div className="min-[768px]:max-[1025px]:w-[calc(100%-251px)]">
                        <h4 className="font-normal text-[25px] leading-[120%] text-[#000024] flex items-center gap-[10px] max-[768px]:inline-block max-[768px]:text-[22px] min-[768px]:max-[1025px]:inline-block"><span className="font-bold text-[#0456ff]">12,500+</span> people are creating their resumes with Naukri Resume right now!</h4>
                    </div>
                </div>
            </div>
        </div>
    )
}