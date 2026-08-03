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
                <div className="flex items-center flex-wrap gap-[50px] border border-[#CACACA] rounded-[15px] py-[46px] px-[40px]">
                    <div className="w-[350px]">
                        <h6 className="font-semibold text-[20px] leading-[120%] text-[#000024]">Our customers have been hired at:</h6>
                    </div>
                    <div className="w-[calc(100%-400px)]">
                        <ul className="flex items-center gap-[10px]">
                            <li className="flex-1 flex justify-center">
                                <Image src={IBM} alt="IBM" />
                            </li>
                            <li className="flex-1 flex justify-center">
                                <Image src={Accenture} alt="Accenture" />
                            </li>
                            <li className="flex-1 flex justify-center">
                                <Image src={Birlasoft} alt="Birlasoft" />
                            </li>
                            <li className="flex-1 flex justify-center">
                                <Image src={Infosys} alt="Infosys" />
                            </li>
                            <li className="flex-1 flex justify-center">
                                <Image src={Tcs} alt="Tcs" />
                            </li>
                            <li className="flex-1 flex justify-center">
                                <Image src={Hdfc} alt="Hdfc" />
                            </li>
                            <li className="flex-1 flex justify-center">
                                <Image src={Icici} alt="Icici" />
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}