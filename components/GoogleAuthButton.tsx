"use client";

import { GoogleLogin } from "@react-oauth/google";
import { toast } from "sonner";
import api from "@/services/api";

interface GoogleAuthButtonProps {
    onSuccessCallback?: () => void;
}

export default function GoogleAuthButton({
    onSuccessCallback,
}: GoogleAuthButtonProps) {
    const handleGoogleSuccess = async (credentialResponse: any) => {
        try {
            const idToken = credentialResponse.credential;

            if (!idToken) {
                toast.error("Google login failed. Token missing.");
                return;
            }

            const response = await api.post("/auth/google", { idToken }, { withCredentials: true });

            if (response.data.accessToken) {
                localStorage.setItem("token", response.data.accessToken);
            }

            toast.success("Logged in with Google successfully!");

            if (onSuccessCallback) {
                onSuccessCallback();
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || "Google login failed. Please try again.";
            toast.error(errorMsg);
        }
    };

    return (
        <div className="w-full flex justify-center">
            <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error("Google Sign-In failed")}
                useOneTap={false}
                theme="outline"
                size="large"
                shape="rectangular"
                width="320"
            />
        </div>
    );
}