"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import Image from "next/image";

export default function Testimonials() {
  const testimonials = [
    {
      id: 1,
      name: "Soniya singh",
      role: "Software Engineer",
      companyLogo: "/testimonials/tcs.png",
      userImage: "/person.png",
      quote: '"Naukari Resume helped me create a professional resume that got me interviews from top companies!"',
      rating: 5,
    },
    {
      id: 2,
      name: "Neha Kapoor",
      role: "Software Engineer",
      companyLogo: "/testimonials/infosys.png",
      userImage: "/person.png",
      quote: '"Naukari Resume helped me create a professional resume that got me interviews from top companies!"',
      rating: 5,
    },
    {
      id: 3,
      name: "Pooja Mehra",
      role: "Software Engineer",
      companyLogo: "/testimonials/wipro.png",
      userImage: "/person.png",
      quote: '"Naukari Resume helped me create a professional resume that got me interviews from top companies!"',
      rating: 5,
    },
    {
      id: 4,
      name: "Shivani Singh",
      role: "Software Engineer",
      companyLogo: "/testimonials/amazon.png",
      userImage: "/person.png",
      quote: '"Naukari Resume helped me create a professional resume that got me interviews from top companies!"',
      rating: 5,
    },
    {
      id: 5,
      name: "Ananya Sharma",
      role: "Product Manager",
      companyLogo: "/testimonials/tcs.png",
      userImage: "/person.png",
      quote: '"The ATS-optimized templates made a huge difference in my job search experience!"',
      rating: 5,
    },
  ];

  return (
    <div className="py-[40px] relative overflow-hidden">
      <div className="max-w-[1390px] mx-auto px-[15px]">
        <div className="max-w-[610px] mx-auto text-center mb-[40px]">
          <h2 className="font-semibold text-[35px] leading-[120%] text-[#000024] mb-[10px]">Loved by Thousands of <span className="font-bold text-[#0456FF]">Job Seekers</span></h2>
          <p className="font-medium text-[18px] leading-[120%] text-[#000024]">Our AI-powered resume builder has helped professionals create ATS-friendly resumes and land more interviews at top companies.</p>
        </div>
        <div className="relative px-[50px] custom-swiper-container">
          <button className="swiper-prev-btn absolute left-0 top-1/2 -translate-y-1/2 z-30 w-[40px] h-[40px] rounded-full bg-[#0456FF] text-white flex items-center justify-center shadow-md hover:bg-[#0041C7] transition-all duration-200 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button className="swiper-next-btn absolute right-0 top-1/2 -translate-y-1/2 z-30 w-[40px] h-[40px] rounded-full bg-white border border-[#0456FF] text-[#0456FF] flex items-center justify-center shadow-md hover:bg-[#0456FF] hover:text-white transition-all duration-200 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            loop={true}
            spaceBetween={16}
            slidesPerView={4}
            navigation={{
              prevEl: ".swiper-prev-btn",
              nextEl: ".swiper-next-btn",
            }}
            pagination={{
              clickable: true,
              el: ".custom-pagination",
            }}
            breakpoints={{
              320: { slidesPerView: 1 },
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
              1280: { slidesPerView: 4 },
            }}
            className="!p-[6px]">
            {testimonials.map((item) => (
              <SwiperSlide key={item.id} className="!h-auto">
                <div className="bg-white rounded-[24px] py-[30px] pl-[25px] pr-[12px] shadow-[0px_2px_7px_0px_#CACACADB] text-center relative h-full">
                  <div>
                    <div className="w-full flex flex-wrap mb-[10px]">
                      <span className="w-[25px]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="21" viewBox="0 0 25 21" fill="none">
                          <path d="M10.9484 15.6873C10.9484 14.404 10.613 13.3262 9.94214 12.4542C9.46672 11.8533 8.82166 11.4586 8.00693 11.27C7.20485 11.0833 6.44652 11.0702 5.7611 11.2292C5.52777 9.84375 5.90693 8.37667 6.86943 6.82208C7.83388 5.26847 9.07735 4.10035 10.5998 3.31771L8.29422 0C7.12756 0.5775 6.01922 1.30958 4.99839 2.19479C3.96297 3.08 3.04422 4.09792 2.22756 5.24854C1.41089 6.39917 0.79839 7.69854 0.40464 9.17146C0.0108901 10.6444 -0.0984846 12.1465 0.0896404 13.6923C0.33464 15.734 0.993807 17.3673 2.06714 18.5777C3.1395 19.8037 4.47534 20.4167 6.07464 20.4167C7.48193 20.4167 8.65006 19.9937 9.57464 19.1362C10.4895 18.2962 10.9464 17.1451 10.9455 15.6829L10.9484 15.6873ZM24.2542 15.6873C24.2542 14.404 23.9188 13.3262 23.248 12.4542C22.7716 11.8417 22.1265 11.4445 21.3128 11.2627C20.4961 11.0828 19.7475 11.0722 19.0669 11.2306C18.8336 9.85979 19.1982 8.38687 20.1636 6.82646C21.1261 5.28062 22.3686 4.11396 23.8911 3.32646L21.5913 0C20.4237 0.5775 19.3251 1.3091 18.2955 2.19479C17.2507 3.09323 16.3228 4.11915 15.5334 5.24854C14.7226 6.40062 14.1188 7.69854 13.7251 9.17146C13.3251 10.6432 13.2176 12.1791 13.4086 13.6923C13.6507 15.734 14.3069 17.3673 15.3773 18.5777C16.4468 19.7949 17.7802 20.4035 19.3776 20.4035C20.7873 20.4055 21.9549 19.9792 22.8805 19.1246C23.7953 18.2846 24.2533 17.1335 24.2542 15.6712V15.6873Z" fill="#0456FF" />
                        </svg>
                      </span>
                      <div className="w-[calc(100%-95px)] flex justify-center items-end pr-[16px] flex-col gap-y-[15px]">
                        <div className="w-[100px] h-[100px] rounded-full border border-[#0456FF1F] shadow-[0px_3px_5px_0px_#0456FF4D] overflow-hidden">
                          <Image src={item.userImage} alt={item.name} className="object-cover" width={100} height={100} />
                        </div>
                        <div className="flex gap-1 text-[#0456FF] mr-[6px]">
                          {[...Array(item.rating)].map((_, i) => (
                            <svg key={i} xmlns="http://www.w3.org/2000/svg" width="14" height="13" viewBox="0 0 14 13" fill="none">
                              <path d="M8.34992 0.81375L9.47342 2.96875C9.55699 3.12739 9.67695 3.26397 9.82348 3.3673C9.97001 3.47064 10.1389 3.53779 10.3164 3.56325L12.6894 3.88825C13.9584 4.06325 14.4504 5.62775 13.5119 6.49775L11.8869 7.99725C11.7486 8.12467 11.6447 8.28501 11.585 8.46335C11.5253 8.64169 11.5117 8.83223 11.5454 9.01725L11.9419 11.2162C12.1624 12.4412 10.8879 13.3963 9.76942 12.8363L7.50142 11.7113C7.3453 11.6348 7.17376 11.595 6.99992 11.595C6.82608 11.595 6.65454 11.6348 6.49842 11.7113L4.23042 12.8363C3.11142 13.3913 1.83742 12.4412 2.05792 11.2162L2.45442 9.01675C2.52442 8.64175 2.39442 8.25675 2.11342 7.99675L0.48792 6.49775C-0.45058 5.63275 0.0414199 4.06275 1.31042 3.88775L3.68342 3.56275C3.86143 3.53888 4.03103 3.47236 4.1778 3.36885C4.32458 3.26534 4.44417 3.12791 4.52642 2.96825L5.65042 0.81375C6.22242 -0.27125 7.78242 -0.27125 8.34942 0.81375" fill="#0456FF" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <div className="w-[70px]">
                        <span className="inline-flex items-center gap-1 border-[0.5px] border-[#0456FF]/10 bg-[#0456FF]/[0.08] text-[#0456FF] text-[6px] font-semibold px-2.5 py-1 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" width="8" height="6" viewBox="0 0 8 6" fill="none">
                            <path d="M6.75 0.5L2.58333 4.66667L0.5 2.58333" stroke="#0456FF" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Verified User
                        </span>
                      </div>
                    </div>
                    <p className="inline-block text-[12px] font-medium leading-[110%] text-[#000024] mb-[10px]">{item.quote}</p>
                  </div>
                  <div className="w-full pt-[10px] border-t-[0.5px] border-[#0456FF] flex flex-col items-center">
                    <h3 className="mb-[10px] text-[18px] font-bold leading-[110%] text-[#0456FF]">{item.name}</h3>
                    <p className="inline-block mb-[10px] text-[13px] font-semibold leading-[110%] text-[#00002499]">{item.role}</p>
                    <div className="relative flex items-center justify-center">
                      <Image src={item.companyLogo} alt="Company Logo" width={80} height={24} className="object-contain h-auto w-auto" />
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="custom-pagination flex justify-center items-center gap-[10px] mt-[30px] [&>.swiper-pagination-bullet]:w-[15px] [&>.swiper-pagination-bullet]:h-[15px] [&>.swiper-pagination-bullet]:bg-[#CACACA] [&>.swiper-pagination-bullet]:opacity-100 [&>.swiper-pagination-bullet-active]:bg-[#0456FF] [&>.swiper-pagination-bullet]:rounded-full [&>.swiper-pagination-bullet]:cursor-pointer [&>.swiper-pagination-bullet]:transition-all"></div>
        </div>
      </div>
    </div>
  );
}