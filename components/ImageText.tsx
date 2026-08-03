import Image from "next/image";
import Resume from "@/public/resume.png";

export default function ImageText() {
    return (
        <div className="bg-[#F6F7FE] py-[40px]">
            <div className="max-w-[1230px] mx-auto px-[15px]">
                <div className="flex items-center flex-wrap gap-[45px]">
                    <div>
                        <Image src={Resume} alt="Resume" />
                    </div>
                    <div>
                        <h4 className="font-normal text-[25px] leading-[120%] text-[#000024] flex items-center gap-[10px]"><span className="font-bold text-[#0456ff]">12,500+</span> people are creating their resumes with Naukari Resume right now!</h4>
                    </div>
                </div>
            </div>
        </div>
    )
}