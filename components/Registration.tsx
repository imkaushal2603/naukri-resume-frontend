"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import GoogleAuthButton from "./GoogleAuthButton";
import api from "@/services/api";
import REGISTRATION from "@/public/login/login.png";

interface RegistrationProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin?: () => void;
}

export default function Registration({ isOpen, onClose, onOpenLogin }: RegistrationProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  const PHONE_REGEX = /^(?:\+91|0)?[6-9]\d{9}$/;

  const validatePassword = (pwd: string) => PASSWORD_REGEX.test(pwd);
  const validatePhone = (num: string) => PHONE_REGEX.test(num.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone.trim()) {
      toast.error("Phone number is required.");
      return;
    }

    if (!validatePhone(phone)) {
      toast.error("Please enter a valid 10-digit phone number.");
      return;
    }

    if (!validatePassword(password)) {
      toast.error("Password must be at least 8 characters long and include an uppercase letter, lowercase letter, and a number.");
      return;
    }

    if (!agreeTerms) {
      toast.error("Please accept the terms and conditions.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/register", { name, email, phone, password });

      if (response.data.accessToken) {
        localStorage.setItem("token", response.data.accessToken);
      }
      toast.success("Account created successfully! Please login.");

      onClose();
      if (onOpenLogin) {
        onOpenLogin();
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Registration failed. Please try again.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginClick = () => {
    onClose();
    if (onOpenLogin) {
      onOpenLogin();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="scrollbar-thin relative w-full max-w-[1000px] bg-white rounded-[10px] shadow-2xl overflow-hidden flex flex-wrap max-h-[90dvh] overflow-y-auto">
        <div className="w-[55%] p-8 sm:p-10 flex flex-col justify-center max-[768px]:w-full">
          <h2 className="text-[26px] font-bold text-[#000000] leading-none mb-[30px]">Create Account</h2>
          <button type="button" onClick={onClose} className="absolute top-[20px] right-[40px] text-[#000] cursor-pointer w-[40px] h-[40px] flex items-center justify-center font-semibold z-[1] max-[768px]:right-[20px]">✕</button>
          <form onSubmit={handleSubmit}>
            <div>
              <label className="block text-[16px] font-normal text-[#000000] leading-none mb-[15px]">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter Your Name"
                required
                className="w-full px-3.5 py-2.5 border border-[#0456FF26] rounded-[6px] text-[14px] leading-none text-[#000024] outline-none transition-all placeholder:text-gray-400"
              />
            </div>
            <div className="pt-[20px]">
              <label className="block text-[16px] font-normal text-[#000000] leading-none mb-[15px]">Email ID</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email ID"
                required
                className="w-full px-3.5 py-2.5 border border-[#0456FF26] rounded-[6px] text-[14px] leading-none text-[#000024] outline-none transition-all placeholder:text-gray-400"
              />
            </div>
            <div className="pt-[20px]">
              <label className="block text-[16px] font-normal text-[#000000] leading-none mb-[15px]">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter 10-digit Phone Number"
                maxLength={13}
                required
                className="w-full px-3.5 py-2.5 border border-[#0456FF26] rounded-[6px] text-[14px] leading-none text-[#000024] outline-none transition-all placeholder:text-gray-400"
              />
            </div>
            <div className="pt-[20px] pb-[15px]">
              <label className="block text-[16px] font-normal text-[#000000] leading-none mb-[15px]">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full px-3.5 py-2.5 border border-[#0456FF26] rounded-[6px] text-[14px] leading-none text-[#000024] outline-none transition-all placeholder:text-gray-400"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#0456FF] cursor-pointer hover:underline">
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <div className="flex items-center text-[14px] leading-none text-[#000024CC]">
              <label className="flex items-center gap-[10px] cursor-pointer select-none">
                <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} className="w-[14px] h-[14px] rounded border-gray-300 text-[#0456FF] focus:ring-0 cursor-pointer accent-[#0456FF]" />
                <span>I accept terms and conditions</span>
              </label>
            </div>
            <button type="submit" disabled={loading} className="w-full p-[12px] bg-[#0456FF] border border-[#0456FF] text-white text-[15px] font-semibold rounded-[8px] cursor-pointer disabled:opacity-50 mt-[54px] hover:bg-transparent hover:text-[#0456FF] transition-colors duration-300">
              {loading ? "Registering..." : "Register"}
            </button>
          </form>
          <div className="relative mt-[10px] mb-[30px] text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#0456FF]/15"></div>
            </div>
            <span className="relative bg-white px-3 text-[15px] leading-none text-[#00002499] font-semibold">or</span>
          </div>
          <GoogleAuthButton onSuccessCallback={() => { onClose(); }} />
          <p className="text-[13px] text-center leading-none text-[#00002499] font-medium mt-[33px]">
            Already have an account?{" "}
            <button type="button" onClick={handleLoginClick} className="text-[#0456FF] font-medium cursor-pointer hover:underline">Login</button>
          </p>
        </div>
        <div className="w-[45%] bg-[#0456FF26] p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden max-[768px]:hidden">
          <div className="text-center mt-[60px]">
            <h3 className="text-[#000024] text-[42px] leading-none mb-[12px]">Join Us Today!</h3>
            <p className="text-[15px] leading-none text-[#000024]">Create an account to get started</p>
          </div>
          <div className="relative w-full aspect-[4/3] mx-auto my-auto flex items-center justify-center">
            <Image src={REGISTRATION} alt="REGISTRATION" width={406} height={406} />
          </div>
        </div>
      </div>
    </div>
  );
}