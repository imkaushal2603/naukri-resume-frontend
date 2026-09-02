import Image from "next/image";
import IBM from "@/public/ibm.png";
import Accenture from "@/public/accenture.png";
import Birlasoft from "@/public/birlasoft.png";
import Infosys from "@/public/infosys.png";
import Tcs from "@/public/tcs.png";
import Hdfc from "@/public/hdfc.png";
import Icici from "@/public/icici.png";

export default function Logos() {
    return (
        <div className="py-[40px]">
            <div className="max-w-[1390px] mx-auto px-[15px]">
                <div className="flex items-center flex-wrap gap-[50px] border border-[#CACACA] rounded-[15px] py-[46px] px-[40px] max-[768px]:p-[30px] max-[768px]:gap-[30px] min-[768px]:max-[1025px]:p-[40px]">
                    <div className="w-[350px] max-[768px]:w-full min-[768px]:max-[1025px]:w-full">
                        <h6 className="font-semibold text-[20px] leading-[120%] text-[#000024]">Our customers have been hired at:</h6>
                    </div>
                    <div className="w-[calc(100%-400px)] max-[768px]:w-full min-[768px]:max-[1025px]:w-full">
                        <ul className="flex items-center gap-[10px] max-[768px]:flex-wrap">
                            <li className="flex-1 flex justify-center max-[768px]:w-[calc(33.33%-6.667px)] max-[768px]:flex-none">
                                <Image src={IBM} alt="IBM" />
                            </li>
                            <li className="flex-1 flex justify-center max-[768px]:w-[calc(33.33%-6.667px)] max-[768px]:flex-none">
                                <Image src={Accenture} alt="Accenture" />
                            </li>
                            <li className="flex-1 flex justify-center max-[768px]:w-[calc(33.33%-6.667px)] max-[768px]:flex-none">
                                <Image src={Birlasoft} alt="Birlasoft" />
                            </li>
                            <li className="flex-1 flex justify-center max-[768px]:w-[calc(33.33%-6.667px)] max-[768px]:flex-none">
                                <Image src={Infosys} alt="Infosys" />
                            </li>
                            <li className="flex-1 flex justify-center max-[768px]:w-[calc(33.33%-6.667px)] max-[768px]:flex-none">
                                <Image src={Tcs} alt="Tcs" />
                            </li>
                            <li className="flex-1 flex justify-center max-[768px]:w-[calc(33.33%-6.667px)] max-[768px]:flex-none">
                                <Image src={Hdfc} alt="Hdfc" />
                            </li>
                            <li className="flex-1 flex justify-center max-[768px]:w-[calc(33.33%-6.667px)] max-[768px]:flex-none">
                                <Image src={Icici} alt="Icici" />
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}