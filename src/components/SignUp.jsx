/* eslint-disable react/prop-types */
import useOAuthLogin from "../hooks/useOAuthLogin";
import { Link } from "react-router-dom";
import GoogleLogo from "./svg/GoogleLogo";

export default function SignUp({ onChange, formData, onStateChange }) {
    const { loginWithProvider } = useOAuthLogin();

    const handleNext = (event) => {
        event.preventDefault();
        if (!event.currentTarget.reportValidity()) return;
        onStateChange();
    };

    return (
        <section className="relative min-h-screen overflow-hidden bg-[#fafafa] px-4 py-8 font-['Inter',system-ui,-apple-system,sans-serif] text-[#171717] selection:bg-[#171717] selection:text-[#f2f2f2] sm:px-6 lg:px-8">
            <div className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_22%_40%,#50e3c2_0%,transparent_24%),radial-gradient(circle_at_44%_36%,#007cf0_0%,transparent_25%),radial-gradient(circle_at_62%_48%,#7928ca_0%,transparent_24%),radial-gradient(circle_at_78%_56%,#ff0080_0%,transparent_22%),radial-gradient(circle_at_58%_72%,#f9cb28_0%,transparent_20%)] opacity-20 blur-3xl" />
            <div className="relative mx-auto grid min-h-[calc(100vh-64px)] w-full max-w-[1180px] items-center gap-8 py-12 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="hidden lg:block">
                    <Link to="/" className="font-mono text-xs text-[#888888] transition hover:text-[#171717]">TEAMSPHERE</Link>
                    <h1 className="mt-5 max-w-xl text-[48px] font-semibold leading-[48px] tracking-[-2.4px] text-[#171717]">
                        Start with a profile built for conversation.
                    </h1>
                    <p className="mt-5 max-w-lg text-lg leading-7 text-[#4d4d4d]">
                        Create the account, choose the name people will recognize, and crop an avatar that looks crisp across every chat.
                    </p>
                    <div className="mt-8 rounded-lg border border-[#ebebeb] bg-white p-5 shadow-[0px_1px_1px_#00000005,0px_2px_2px_#0000000a,0_0_0_1px_#00000014_inset]">
                        <p className="font-mono text-xs text-[#888888]">Setup flow</p>
                        <div className="mt-4 grid grid-cols-2 gap-3">
                            <div className="rounded-md bg-[#171717] p-3 text-white">
                                <p className="font-mono text-[11px] text-white/60">01</p>
                                <p className="mt-1 text-sm font-medium">Account</p>
                            </div>
                            <div className="rounded-md border border-[#ebebeb] bg-[#fafafa] p-3 text-[#4d4d4d]">
                                <p className="font-mono text-[11px] text-[#888888]">02</p>
                                <p className="mt-1 text-sm font-medium">Profile photo</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full rounded-xl border border-[#ebebeb] bg-white p-6 shadow-[0px_1px_1px_#00000005,0px_8px_16px_-4px_#0000000a,0px_24px_32px_-8px_#0000000f,0_0_0_1px_#00000014_inset] sm:p-8 lg:ml-auto lg:max-w-md">
                    <Link to="/" className="font-mono text-xs text-[#888888] transition hover:text-[#171717] lg:hidden">TEAMSPHERE</Link>
                    <p className="mt-6 font-mono text-xs text-[#888888] lg:mt-0">Step 01 / Account</p>
                    <h2 className="mt-3 text-2xl font-semibold leading-8 tracking-[-0.96px] text-[#171717]">
                        Create your account.
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[#4d4d4d]">
                        Use email or continue with a provider. Your profile details come next.
                    </p>

                    <div className="mt-6 space-y-3">
                        <button
                            type="button"
                            onClick={() => loginWithProvider("google")}
                            className="flex h-11 w-full items-center justify-center gap-2 rounded-md border border-[#ebebeb] bg-white px-4 text-sm font-medium text-[#171717] transition hover:border-[#a1a1a1] hover:bg-[#fafafa] focus:outline-none focus:ring-2 focus:ring-[#171717] focus:ring-offset-2"
                        >
                            <GoogleLogo className="h-5 w-5" />
                            Sign up with Google
                        </button>
                        <button
                            type="button"
                            onClick={() => loginWithProvider("outlook")}
                            className="flex h-11 w-full items-center justify-center rounded-md border border-[#ebebeb] bg-white px-4 text-sm font-medium text-[#171717] transition hover:border-[#a1a1a1] hover:bg-[#fafafa] focus:outline-none focus:ring-2 focus:ring-[#171717] focus:ring-offset-2"
                        >
                            Sign up with Outlook
                        </button>
                    </div>

                    <div className="my-6 flex items-center gap-3">
                        <div className="h-px flex-1 bg-[#ebebeb]" />
                        <span className="font-mono text-xs text-[#888888]">or</span>
                        <div className="h-px flex-1 bg-[#ebebeb]" />
                    </div>

                    <form className="space-y-4" onSubmit={handleNext}>
                        <div>
                            <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#171717]">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                className="block h-10 w-full rounded-md border border-[#ebebeb] bg-white px-3 text-sm text-[#171717] placeholder:text-[#888888] transition focus:border-[#a1a1a1] focus:outline-none focus:ring-2 focus:ring-[#171717]/10"
                                placeholder="name@company.com"
                                value={formData.email}
                                onChange={(e) => onChange(e, "input")}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="mb-2 block text-sm font-medium text-[#171717]">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                id="password"
                                placeholder="At least 6 characters"
                                className="block h-10 w-full rounded-md border border-[#ebebeb] bg-white px-3 text-sm text-[#171717] placeholder:text-[#888888] transition focus:border-[#a1a1a1] focus:outline-none focus:ring-2 focus:ring-[#171717]/10"
                                value={formData.password}
                                onChange={(e) => onChange(e, "input")}
                                minLength={6}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="inline-flex h-11 w-full items-center justify-center rounded-md bg-[#171717] px-4 text-sm font-medium text-white shadow-[0px_1px_1px_#00000005,0px_2px_2px_#0000000a] transition hover:bg-black focus:outline-none focus:ring-2 focus:ring-[#171717] focus:ring-offset-2"
                        >
                            Continue to profile
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-[#4d4d4d]">
                        Already have an account?
                        <Link
                            to="/login"
                            className="pl-2 font-medium text-[#171717] underline decoration-[#a1a1a1] underline-offset-4 transition hover:decoration-[#171717]"
                        >
                            Log in
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
