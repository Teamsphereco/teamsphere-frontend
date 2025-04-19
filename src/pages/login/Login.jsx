import { useState } from "react";
import { Link } from "react-router-dom";
import useLogin from "../../hooks/useLogin";
import useGoogleLogin from "../../hooks/useGoogleLogin";
import { useGoogleLogin as useGoogleLoginReact } from '@react-oauth/google';
import { useAuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";
import GoogleLogo from "../../components/svg/GoogleLogo";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loading, login } = useLogin();
  const { loading: googleLoading, googleLogin } = useGoogleLogin();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  const handleGoogleLogin = useGoogleLoginReact({
    onSuccess: async (credentialResponse) => {
      try {
        // We now only pass the access_token to googleLogin
        await googleLogin(credentialResponse.access_token);
        toast.success("Google login successful!");
      } catch (error) {
        console.error("Google login error:", error);
        toast.error('Google login failed');
      }
    },
    onError: (error) => {
      console.error("Google login error:", error);
      toast.error('Google login failed');
    },
    flow: 'implicit'
  });

  return (
    <section className="flex flex-col justify-center bg-gray-50 dark:bg-gray-900 h-screen">
      <div className="py-8 px-4 mx-auto w-3/4 lg:w-1/2 lg:py-16 gap-8 lg:gap-16">
        <div className="lg:flex lg:justify-center">
          <div className="w-full lg:max-w-xl p-6 space-y-8 sm:p-8 bg-white rounded-lg shadow-xl dark:bg-gray-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Sign in to Teamsphere
            </h2>
            <div className="flex justify-center">
              <button
                onClick={() => handleGoogleLogin()}
                disabled={googleLoading}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <GoogleLogo className="w-5 h-5 mr-2" />
                Continue With Google
              </button>
            </div>
            <div className="flex items-center my-4">
              <hr className="flex-grow border-gray-300 dark:border-gray-600" />
              <span className="px-3 text-gray-500 dark:text-gray-400">or</span>
              <hr className="flex-grow border-gray-300 dark:border-gray-600" />
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Your email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="name@company.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Your password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="••••••••"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="remember"
                    aria-describedby="remember"
                    name="remember"
                    type="checkbox"
                    className="w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div className="ms-3 text-sm">
                  <label
                    htmlFor="remember"
                    className="font-medium text-gray-500 dark:text-gray-400"
                  >
                    Remember this device
                  </label>
                </div>
                <a className="ms-auto text-sm font-medium text-blue-600 hover:underline dark:text-blue-500">
                  Forgot Password?
                </a>
              </div>
              <button
                type="submit"
                className="w-full px-5 py-3 text-base font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 sm:w-auto dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                disabled={loading}
              >
                {loading ? 
                  <div className="animate-spin inline-block size-6 border-[3px] border-current border-t-transparent text-blue-600 rounded-full" role="status" aria-label="loading">
                    <span className="sr-only">Loading...</span>
                  </div>
                 : "Login to your account"}
              </button>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Not registered yet?
                <Link
                  to="/signup"
                  className="text-blue-600 hover:underline dark:text-blue-500 pl-2"
                >
                  Create account
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
