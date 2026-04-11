import { useState } from "react";
import { MdEmail } from "react-icons/md";
import { NavLink } from 'react-router-dom'
import { emailLogin } from "../api/api";
import { IoIosLock } from "react-icons/io";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import Lottie from "lottie-react";
import loader from "../assets/loader2.json";
import { useAuth } from "../context/AuthContext";
import { toast } from "../context/ToastContext";

export default function Login() {
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [password, setPassword] = useState("")
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const { isDark } = useTheme();

    const { login } = useAuth();

    const navigate = useNavigate();

    {/* Email login */ }
    const handleEmailLogin = async () => {
        // Clear previous error
        setError("");

        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address !");
            return;
        }

        if (!password) {
            setError("Password is required !");
            return;
        }

        try {
            setLoading(true);

            const res = await emailLogin({ email, password });
            const userData = res.data.user;

            if (userData) {
                await login(userData);
                toast.success("Login successful.");
                navigate('/');
                setLoading(false);
            }

        } catch (err) {
            setLoading(false);
            const backendMessage = err?.response?.data?.message;
            const error =
                typeof backendMessage === "string"
                    ? backendMessage
                    : err?.message || "Something went wrong";
            setError(error);
        }
    };

    return (
        <div className={`${isDark ? "bg-linear-to-br from-[#020617] via-[#0F172A] to-slate-800" : "bg-linear-to-br from-[#CAD0FD] to-[#F9E1FE]"} flex items-center justify-center px-4 h-dvh w-full relative`}>

            <div className={`${isDark ? "bg-[#0F172A90] shadow-lg shadow-[#0F172A] border-gray-800 border" : "bg-[#FFFFFF60]"} flex flex-row items-center rounded-4xl h-fit lg:gap-30 gap-5`}>
                <div className={`md:min-h-[75dvh] min-h-[70dvh] md:max-w-md max-w-lg rounded-4xl md:rounded-r-none p-5 sm:p-8 flex flex-col items-center`}>
                    {/* Header */}
                    <div className="flex flex-col gap-2 items-center">
                        <div>
                            <img src="/avenza2.png" alt="logo" className="h-20" />
                        </div>
                        <h2 className={`${isDark ? "bg-linear-to-b from-[#f6c0d9] to-[#fa3293]" : "bg-linear-to-b from-pink-400 to-pink-600"} text-4xl whitespace-nowrap sm:text-5xl font-semibold font-[Roboto_Serif] tracking-wider bg-clip-text text-transparent`}>
                            Admin Panel
                        </h2>
                        <p className={`${isDark ? "text-gray-300" : "text-gray-500"} text-[16px] sm:text-[18px] text-center `}>
                            Enter your credentials to access the admin dashboard.
                        </p>
                    </div>

                    <div className={`${isDark ? "bg-gray-800" : "bg-gray-100"} w-full h-px mt-5 sm:mt-4`} />

                    {/* Email login */}
                    <div className="mt-10 space-y-4 w-full">
                        <div className={`${isDark ? "bg-[#0F172A] border-gray-800 shadow-[#0F172A] border-2" : "bg-[#F9FAFB] border border-[#E5E7EB] shadow-gray-200"} flex flex-row shadow-sm rounded-xl px-3 items-center gap-2`}>
                            <MdEmail className="text-[#8b90c7] text-2xl" />
                            <input
                                type="email"
                                value={email}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleEmailLogin();
                                    }
                                }}
                                onChange={(e) => { setEmail(e.target.value) }}
                                placeholder="Email Address"
                                className={`${isDark ? "text-gray-100" : "text-[#374151]"} w-full h-full py-3 text-[#374151] font-semibold focus:outline-none placeholder:font-semibold placeholder:text-[#9CA3AF]`}
                            />
                        </div>

                        <div className={`${isDark ? "bg-[#0F172A] border-gray-800 shadow-[#0F172A] border-2" : "bg-[#F9FAFB] border border-[#E5E7EB] shadow-gray-200"} flex flex-row shadow-sm rounded-xl p-3 items-center gap-2`}>
                            <IoIosLock className="text-[#8b90c7] text-xl" />
                            <input
                                value={password}
                                onChange={(e) => { setPassword(e.target.value) }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleEmailLogin();
                                    }
                                }}
                                type={showPass ? "text" : "password"}
                                placeholder="Password"
                                maxLength={20}
                                className={`${isDark ? "text-gray-100" : "text-[#374151]"} w-full font-semibold focus:outline-none placeholder:font-semibold placeholder:text-[#9CA3AF]`}
                            />
                            <button
                                onClick={() => setShowPass(!showPass)}
                                className="cursor-pointer">
                                {showPass ? <FaEye className="text-[#8b90c7] text-xl" /> : <FaEyeSlash className="text-[#8b90c7] text-xl" />}
                            </button>
                        </div>
                        {error && (
                            <p className="text-red-500 font-semibold">{error}</p>
                        )}

                        <button
                            className="w-full h-12 py-3 rounded-xl transition border-2 hover:bg-[#fc8479] bg-[#FF6F61] border-[#ff3e2d] font-medium text-lg text-white cursor-pointer mt-2 relative flex justify-center items-center font-[sour_gummy]"
                            onClick={handleEmailLogin}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleEmailLogin();
                                }
                            }}
                            disabled={loading}>
                            {loading ? <Lottie
                                animationData={loader}
                                loop={true}
                                className="w-50 h-50 absolute invert brightness-0"
                            /> : "Login"}
                        </button>
                    </div>
                </div>
                <div className={`hidden md:block min-w-xs relative min-h-[75dvh] rounded-4xl ${isDark ? "bg-[#a7366b]" : "bg-[#e47eae]"} `}>
                    <img src="/loginImg.png" alt="img" className="h-90 object-contain absolute -left-10 bottom-0"/>
                </div>
            </div>
        </div>
    );
}
