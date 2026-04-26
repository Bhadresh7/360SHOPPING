import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { registerApi } from "../lib/api";
import { strengthOfPassword } from "../lib/format";
import { useApp } from "../context/AppContext";
import { useToast } from "../context/ToastContext";
const quotes = [
    "Our studio launch campaign scaled from 2 to 28 cities with 360Shopie.",
    "AI style picks improved conversion by 31% in our premium catalogue.",
    "Corporate gifting now takes hours, not weeks, from concept to dispatch."
];
const floatEmojis = ["👗", "📸", "🎁", "🖼", "💎", "🛍", "🤖", "📦", "🎨", "📺"];
export function LoginPage() {
    const navigate = useNavigate();
    const { login } = useApp();
    const { toast } = useToast();
    const [mode, setMode] = useState("login");
    const [remember, setRemember] = useState(true);
    const [quoteIndex, setQuoteIndex] = useState(0);
    const [showSplash, setShowSplash] = useState(false);
    const [shake, setShake] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [otpStep, setOtpStep] = useState(false);
    const [otp, setOtp] = useState("");
    const [generatedOtp, setGeneratedOtp] = useState("");
    const [loginForm, setLoginForm] = useState({
        email: "",
        password: ""
    });
    const [signupForm, setSignupForm] = useState({
        name: "",
        email: "",
        password: ""
    });
    const strength = useMemo(() => strengthOfPassword(mode === "login" ? loginForm.password : signupForm.password), [
        loginForm.password,
        signupForm.password,
        mode
    ]);
    useEffect(() => {
        const timer = window.setInterval(() => {
            setQuoteIndex((current) => (current + 1) % quotes.length);
        }, 4000);
        return () => window.clearInterval(timer);
    }, []);
    useEffect(() => {
        if (!showSplash) {
            return;
        }
        gsap.fromTo(".splash .logo", { scale: 0.6, opacity: 0 }, {
            scale: 1.05,
            opacity: 1,
            duration: 0.52,
            ease: "power3.out"
        });
        const timer = window.setTimeout(() => {
            navigate("/view-dashboard", { replace: true });
        }, 800);
        return () => window.clearTimeout(timer);
    }, [showSplash, navigate]);
    async function handleLogin(event) {
        event.preventDefault();
        if (!loginForm.email || !loginForm.password) {
            setShake(true);
            setTimeout(() => setShake(false), 350);
            toast("Please enter email and password", "warning", 1800);
            return;
        }
        try {
            await login(loginForm.email, loginForm.password, remember);
            setShowSplash(true);
        }
        catch {
            setShake(true);
            setTimeout(() => setShake(false), 350);
            toast("Invalid credentials", "error", 2200);
        }
    }
    async function handleSignup(event) {
        event.preventDefault();
        if (!signupForm.name || !signupForm.email || !signupForm.password) {
            setShake(true);
            setTimeout(() => setShake(false), 350);
            toast("Please complete all signup fields", "warning", 1800);
            return;
        }
        if (!otpStep) {
            setSendingOtp(true);
            const generated = `${Math.floor(100000 + Math.random() * 900000)}`;
            setGeneratedOtp(generated);
            window.setTimeout(() => {
                setSendingOtp(false);
                setOtpStep(true);
                toast(`OTP simulated: ${generated}`, "info", 3000);
            }, 1200);
            return;
        }
        if (otp.length !== 6 || otp !== generatedOtp) {
            setShake(true);
            setTimeout(() => setShake(false), 350);
            toast("Invalid OTP. Please retry.", "error", 2200);
            return;
        }
        try {
            await registerApi(signupForm);
            await login(signupForm.email, signupForm.password, true);
            setShowSplash(true);
            toast("Account created successfully", "success", 2000);
        }
        catch {
            toast("Signup failed. Email may already exist.", "error", 2400);
        }
    }
    return (_jsxs("section", { className: "login-screen", children: [_jsxs("div", { className: "login-art", children: [floatEmojis.map((emoji, index) => (_jsx("span", { className: "float-emoji", style: { left: `${6 + (index % 5) * 18}%`, top: `${12 + Math.floor(index / 5) * 32}%` }, children: emoji }, `${emoji}-${index}`))), _jsx("h1", { style: { fontSize: "clamp(2rem,4vw,3.6rem)", maxWidth: 560 }, children: "360Shopie powers studio, luxury, and corporate commerce in one intelligent stack." }), _jsx("p", { style: { marginTop: 12, maxWidth: 420 }, children: "Premium Indian SaaS platform for AI-powered multi-division operations." }), _jsxs("div", { className: "quote-box card", children: [_jsx("small", { style: { color: "var(--gold-l)" }, children: "What customers say" }), _jsx("p", { style: { marginTop: 8 }, children: quotes[quoteIndex] })] }), _jsx("div", { className: "stats-ticker", children: _jsx("span", { children: "\u20B94.8Cr processed \u00B7 2,400+ sessions \u00B7 48 cities \u00B7 97.3% fulfilment SLA" }) })] }), _jsx("div", { className: "login-panel", children: _jsxs("div", { className: `auth-card ${shake ? "shake" : ""}`, children: [_jsx("h2", { children: mode === "login" ? "Welcome Back" : "Create Your 360Shopie Account" }), _jsx("p", { children: mode === "login" ? "Log in to your command centre." : "Get started with all divisions." }), _jsxs("div", { className: "auth-tabs", children: [_jsx("button", { type: "button", className: mode === "login" ? "active" : "", onClick: () => setMode("login"), children: "Login" }), _jsx("button", { type: "button", className: mode === "signup" ? "active" : "", onClick: () => {
                                        setMode("signup");
                                        setOtpStep(false);
                                    }, children: "Signup" })] }), mode === "login" ? (_jsxs("form", { className: "field", onSubmit: handleLogin, children: [_jsx("label", { htmlFor: "email-login", children: "Email" }), _jsx("input", { id: "email-login", type: "email", value: loginForm.email, onChange: (event) => setLoginForm((current) => ({ ...current, email: event.target.value })), required: true }), _jsx("label", { htmlFor: "password-login", children: "Password" }), _jsx("input", { id: "password-login", type: "password", value: loginForm.password, onChange: (event) => setLoginForm((current) => ({ ...current, password: event.target.value })), required: true }), _jsx("div", { className: "password-meter", children: _jsx("span", { style: {
                                            width: `${strength.score * 33.33}%`,
                                            background: strength.score === 1 ? "var(--red)" : strength.score === 2 ? "#f7c35f" : "var(--green)"
                                        } }) }), _jsxs("small", { children: ["Password strength: ", strength.label] }), _jsxs("div", { className: "remember-row", children: [_jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: remember, onChange: (event) => setRemember(event.target.checked) }), " ", "Remember me"] }), _jsx("button", { type: "button", className: "link-btn", children: "Forgot password?" })] }), _jsx("button", { type: "submit", className: "btn-gold full", children: "Login to Platform" })] })) : (_jsxs("form", { className: "field", onSubmit: handleSignup, children: [_jsx("label", { htmlFor: "name-signup", children: "Full Name" }), _jsx("input", { id: "name-signup", value: signupForm.name, onChange: (event) => setSignupForm((current) => ({ ...current, name: event.target.value })), required: true }), _jsx("label", { htmlFor: "email-signup", children: "Email" }), _jsx("input", { id: "email-signup", type: "email", value: signupForm.email, onChange: (event) => setSignupForm((current) => ({ ...current, email: event.target.value })), required: true }), _jsx("label", { htmlFor: "password-signup", children: "Password" }), _jsx("input", { id: "password-signup", type: "password", value: signupForm.password, onChange: (event) => setSignupForm((current) => ({ ...current, password: event.target.value })), required: true }), _jsx("div", { className: "password-meter", children: _jsx("span", { style: {
                                            width: `${strength.score * 33.33}%`,
                                            background: strength.score === 1 ? "var(--red)" : strength.score === 2 ? "#f7c35f" : "var(--green)"
                                        } }) }), _jsxs("small", { children: ["Password strength: ", strength.label] }), otpStep ? (_jsxs(_Fragment, { children: [_jsx("label", { htmlFor: "otp-field", children: "Enter 6-digit OTP" }), _jsx("input", { id: "otp-field", maxLength: 6, value: otp, onChange: (event) => setOtp(event.target.value.replace(/[^0-9]/g, "")), placeholder: "123456", required: true })] })) : null, _jsx("button", { type: "submit", className: "btn-gold full", disabled: sendingOtp, children: sendingOtp ? "Sending OTP..." : otpStep ? "Verify OTP & Create Account" : "Send OTP" })] })), _jsx("div", { className: "section-divider" }), _jsx("small", { children: "Continue with" }), _jsx("div", { className: "social-row", children: [_jsx("button", { type: "button", className: "social-btn", onClick: () => toast("Google login simulated", "info", 1800), children: "Google" }), _jsx("button", { type: "button", className: "social-btn", onClick: () => toast("Apple login simulated", "info", 1800), children: "Apple" }), _jsx("button", { type: "button", className: "social-btn", onClick: () => toast("LinkedIn login simulated", "info", 1800), children: "LinkedIn" })] })] }) }), showSplash ? (_jsx("div", { className: "splash", children: _jsx("div", { className: "logo", children: "360Shopie" }) })) : null] }));
}
