import { useEffect, useRef, useState } from "react";
import { MdEmail } from "react-icons/md";
import { NavLink, useLocation } from 'react-router-dom'
import { emailLogin } from "../api/api";
import { IoIosLock } from "react-icons/io";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import Lottie from "lottie-react";
import loader from "../assets/loader2.json";
import { useAuth } from "../context/AuthContext";
import { toast } from "../context/ToastContext";
import { IoWarning } from "react-icons/io5";
import { BsMoonStarsFill } from "react-icons/bs";

export default function Login() {
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [password, setPassword] = useState("")
    const [email, setEmail] = useState("");
    const [errors, setErrors] = useState({
        email: "",
        password: "",
        other: "",
    });
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const { isDark, toggleTheme } = useTheme();
    const emailRef = useRef(null);
    const passRef = useRef(null);

    const { login, isAuthenticated, loading: authloading } = useAuth();

    useEffect(() => {
        if (authloading) return;

        if (isAuthenticated) {
            navigate('/');
        }

    }, [isAuthenticated])

    const navigate = useNavigate();

    {/* Email login */ }
    const handleEmailLogin = async () => {

        let newErrors = { email: "", password: "", other: "" };

        if (!email && !password) {
            newErrors.email = "Email cannot be blank";
            newErrors.password = "Password cannot be blank";
            emailRef.current.focus();

        } else if (!email) {
            newErrors.email = "Email cannot be blank";
            emailRef.current.focus();
        }
        else if (!emailRegex.test(email)) {
            newErrors.email = "Invalid email";
            emailRef.current.focus();
        }
        else if (!password) {
            newErrors.password = "Password cannot be blank";
            passRef.current.focus();
        }

        setErrors(newErrors);

        if (newErrors.email || newErrors.password) return;

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
            console.log(err?.response)
            setLoading(false);
            const backendMessage = err?.response?.data?.message;
            const error =
                typeof backendMessage === "string"
                    ? backendMessage
                    : err?.message || "Something went wrong";
            setErrors((prev) => ({
                ...prev,
                other: error
            }));
            setPassword("");
        }
    };

    useEffect(() => {
        if (!errors.email && !errors.password) return;

        setErrors((prev) => ({
            ...prev,
            email: email ? "" : prev.email,
            password: password ? "" : prev.password,
        }));
    }, [email, password]);

    return (
        <div className={`${isDark ? "bg-linear-to-br from-[#020617] via-[#0F172A] to-slate-800" : "bg-linear-to-br from-[#CAD0FD] to-[#F9E1FE]"} flex items-center justify-center px-4 h-dvh w-full relative`}>

            <div className={`${isDark ? "bg-[#0F172A90] shadow-lg shadow-[#0F172A] border-gray-800 border-2" : "bg-[#FFFFFF60]"} flex flex-row items-center rounded-4xl h-fit lg:gap-30 gap-5 relative`}>
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
                    <div className="mt-8 space-y-4 w-full">
                        <div>
                            <div className={`${isDark ? "bg-[#0F172A] border-gray-800 shadow-[#0F172A] border-2" : "bg-[#F9FAFB] border border-[#E5E7EB] shadow-gray-200"} flex flex-row shadow-sm rounded-xl px-3 items-center gap-2  ${errors.email && "border border-red-600"}`}>
                                <MdEmail className="text-[#8b90c7] text-2xl" />
                                <input
                                    ref={emailRef}
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
                            {errors.email && (
                                <div className="flex flex-row gap-1 items-center text-red-600 text-sm">
                                    <IoWarning />
                                    <p>{errors.email}</p>
                                </div>
                            )}
                        </div>

                        <div>
                            <div className={`${isDark ? "bg-[#0F172A] border-gray-800 shadow-[#0F172A] border-2" : "bg-[#F9FAFB] border border-[#E5E7EB] shadow-gray-200"} flex flex-row shadow-sm rounded-xl p-3 items-center gap-2 ${errors.password && "border border-red-500"}`}>
                                <IoIosLock className="text-[#8b90c7] text-xl" />
                                <input
                                    ref={passRef}
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
                            {errors.password && (
                                <div className="flex flex-row gap-1 items-center text-red-600 text-sm">
                                    <IoWarning />
                                    <p>{errors.password}</p>
                                </div>
                            )}
                        </div>
                        {errors.other && (
                            <div className="flex flex-row gap-1 items-center text-red-600 text-sm">
                                <IoWarning />
                                <p>{errors.other}</p>
                            </div>
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
                <div className={`hidden md:block min-w-xs relative h-[75dvh] rounded-4xl ${isDark ? "bg-[#a7366b]" : "bg-[#e47eae]"} `}>
                    <img src="/loginImg.webp" alt="img" loading="eager" decoding="sync" className="h-90 object-contain absolute -left-10 bottom-0" />
                </div>

                <button onClick={toggleTheme} className='flex justify-center items-center cursor-pointer absolute top-5 right-5'>
                    {isDark ? <img src="https://images.emojiterra.com/google/noto-emoji/unicode-16.0/color/svg/2600.svg" alt="" className='min-h-6 min-w-6' /> : <BsMoonStarsFill className='text-yellow-400 text-xl' />}
                </button>

            </div>
        </div>
    );
}
