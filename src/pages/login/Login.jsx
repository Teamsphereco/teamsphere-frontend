import { useState } from "react";
import { Link } from "react-router-dom";
import useLogin from "../../hooks/useLogin";
import useOAuthLogin from "../../hooks/useOAuthLogin";
import GoogleLogo from "../../components/svg/GoogleLogo";

const authHighlights = [
  "Instant sync",
  "Private threads",
  "Searchable history",
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loading, login } = useLogin();
  const { loginWithProvider } = useOAuthLogin();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <section className="relative h-dvh overflow-y-auto bg-[#fafafa] px-4 py-8 font-['Inter',system-ui,-apple-system,sans-serif] text-[#171717] selection:bg-[#171717] selection:text-[#f2f2f2] sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_25%_42%,#50e3c2_0%,transparent_24%),radial-gradient(circle_at_45%_34%,#007cf0_0%,transparent_25%),radial-gradient(circle_at_64%_46%,#7928ca_0%,transparent_24%),radial-gradient(circle_at_78%_58%,#ff0080_0%,transparent_22%),radial-gradient(circle_at_58%_72%,#f9cb28_0%,transparent_20%)] opacity-20 blur-3xl" />
      <div className="relative mx-auto grid min-h-[calc(100dvh-64px)] w-full max-w-[1180px] items-center gap-8 py-8 lg:grid-cols-[0.95fr_1.05fr] lg:py-12">
        <div className="hidden lg:block">
          <Link to="/" className="font-mono text-xs text-[#888888] transition hover:text-[#171717]">TEAMSPHERE</Link>
          <h1 className="mt-5 max-w-xl text-[48px] font-semibold leading-[48px] tracking-[-2.4px] text-[#171717]">
            Return to every conversation with clarity.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-7 text-[#4d4d4d]">
            Sign in to your direct messages, group rooms, shared media, and the threads that still need your attention.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {authHighlights.map((item) => (
              <span key={item} className="rounded-full border border-[#ebebeb] bg-white px-3 py-1.5 font-mono text-xs text-[#4d4d4d] shadow-[0px_1px_1px_#00000005]">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="w-full rounded-xl border border-[#ebebeb] bg-white p-6 shadow-[0px_1px_1px_#00000005,0px_8px_16px_-4px_#0000000a,0px_24px_32px_-8px_#0000000f,0_0_0_1px_#00000014_inset] sm:p-8 lg:ml-auto lg:max-w-md">
          <Link to="/" className="font-mono text-xs text-[#888888] transition hover:text-[#171717] lg:hidden">TEAMSPHERE</Link>
          <p className="mt-6 font-mono text-xs text-[#888888] lg:mt-0">Private threads</p>
          <h2 className="mt-3 text-2xl font-semibold leading-8 tracking-[-0.96px] text-[#171717]">Sign in to Teamsphere.</h2>
          <p className="mt-2 text-sm leading-6 text-[#4d4d4d]">
            Continue to messages, groups, presence, and searchable history.
          </p>

          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={() => loginWithProvider("google")}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-md border border-[#ebebeb] bg-white px-4 text-sm font-medium text-[#171717] transition hover:border-[#a1a1a1] hover:bg-[#fafafa] focus:outline-none focus:ring-2 focus:ring-[#171717] focus:ring-offset-2"
            >
              <GoogleLogo className="h-5 w-5" />
              Continue with Google
            </button>
            <button
              type="button"
              onClick={() => loginWithProvider("outlook")}
              className="flex h-11 w-full items-center justify-center rounded-md border border-[#ebebeb] bg-white px-4 text-sm font-medium text-[#171717] transition hover:border-[#a1a1a1] hover:bg-[#fafafa] focus:outline-none focus:ring-2 focus:ring-[#171717] focus:ring-offset-2"
            >
              Continue with Outlook
            </button>
          </div>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#ebebeb]" />
            <span className="font-mono text-xs text-[#888888]">or</span>
            <div className="h-px flex-1 bg-[#ebebeb]" />
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
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
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                placeholder="Enter your password"
                className="block h-10 w-full rounded-md border border-[#ebebeb] bg-white px-3 text-sm text-[#171717] placeholder:text-[#888888] transition focus:border-[#a1a1a1] focus:outline-none focus:ring-2 focus:ring-[#171717]/10"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <label htmlFor="remember" className="flex cursor-pointer items-center gap-2 text-sm text-[#4d4d4d]">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  className="h-4 w-4 rounded border-[#ebebeb] text-[#171717] focus:ring-[#171717]"
                />
                Remember this device
              </label>
              <span className="text-sm font-medium text-[#4d4d4d]">Forgot password?</span>
            </div>

            <button
              type="submit"
              className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-md bg-[#171717] px-4 text-sm font-medium text-white shadow-[0px_1px_1px_#00000005,0px_2px_2px_#0000000a] transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
              disabled={loading}
            >
              {loading ? (
                <div className="inline-block size-5 animate-spin rounded-full border-[2px] border-current border-t-transparent" role="status" aria-label="loading">
                  <span className="sr-only">Loading...</span>
                </div>
              ) : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#4d4d4d]">
            Not registered yet?
            <Link to="/signup" className="pl-2 font-medium text-[#171717] underline decoration-[#a1a1a1] underline-offset-4 transition hover:decoration-[#171717]">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
