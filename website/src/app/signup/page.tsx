'use client';
import Link from "next/link";
import { useState } from "react";

const SignupPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Vui lòng nhập họ tên");
      return;
    }
    if (!email.trim()) {
      setError("Vui lòng nhập email");
      return;
    }
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setLoading(true);

    setLoading(true);

    console.log("📝 Starting signup process...");
    console.log("📧 Email:", email);
    console.log("👤 Name:", name);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      console.log("📡 Making request to:", `${apiUrl}/api/signup`);
      
      const response = await fetch(`${apiUrl}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important for shared cookie approach
        body: JSON.stringify({ name, email, password }),
      });

      console.log("📥 Response status:", response.status);
      console.log("📥 Response ok:", response.ok);

      if (!response.ok) {
        console.log("❌ Response not OK, status:", response.status);
        const errorData = await response.json().catch(() => ({ message: 'Server error' }));
        console.log("❌ Error data:", errorData);
        setError(errorData.message || "Đăng ký thất bại");
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log("📦 Response data:", data);

      if (data.success) {
        console.log("✅ Signup successful, redirecting to editor...");
        // Store user info in localStorage for UI purposes
        if (data.data.user) {
          localStorage.setItem('user', JSON.stringify(data.data.user));
        }
        
        // Redirect to backend dashboard
        window.location.href = 'http://localhost:5000/dashboard';
      } else {
        console.log("❌ Signup failed:", data.message);
        setError(data.message || "Đăng ký thất bại");
      }
    } catch (err) {
      console.error("💥 Signup error:", err);
      console.error("💥 Error type:", err instanceof TypeError ? 'Network/CORS error' : 'Other error');
      setError(`Không thể kết nối đến server. Chi tiết: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    window.location.href = `${apiUrl}/auth/google`;
  };

  return (
    <section className="relative z-10 overflow-hidden pt-36 pb-16 md:pb-20 lg:pt-[180px] lg:pb-28">
      <div className="container">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4">
            <div className="shadow-three dark:bg-dark mx-auto max-w-[500px] rounded-sm bg-white px-6 py-10 sm:p-[60px]">
              <h3 className="mb-3 text-center text-2xl font-bold text-black sm:text-3xl dark:text-white">
                Create your account
              </h3>
              <p className="text-body-color mb-11 text-center text-base font-medium">
                It's totally free and super easy
              </p>
              
              <button 
                type="button"
                onClick={handleGoogleSignup}
                className="shadow-submit dark:shadow-submit-dark mb-6 flex w-full items-center justify-center gap-3 rounded-xs border border-stroke bg-white px-6 py-4 text-base font-medium text-black outline-hidden transition-all duration-300 hover:shadow-lg dark:border-transparent dark:bg-[#2C303B] dark:text-white"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20">
                  <path fill="#4285F4" d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z"/>
                  <path fill="#34A853" d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z"/>
                  <path fill="#FBBC05" d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z"/>
                  <path fill="#EA4335" d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z"/>
                </svg>
                Continue with Google
              </button>

              <div className="mb-8 flex items-center justify-center">
                <span className="bg-body-color/50 hidden h-[1px] w-full max-w-[60px] sm:block"></span>
                <p className="text-body-color w-full px-5 text-center text-base font-medium">
                  Or, register with your email
                </p>
                <span className="bg-body-color/50 hidden h-[1px] w-full max-w-[60px] sm:block"></span>
              </div>
              
              {error && (
                <div className="mb-6 rounded-xs bg-red-500/10 px-4 py-3 text-sm text-red-500">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-8">
                  <label htmlFor="name" className="text-dark mb-3 block text-sm dark:text-white">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border-stroke dark:text-body-color-dark dark:shadow-two text-body-color focus:border-primary dark:focus:border-primary w-full rounded-xs border bg-[#f8f8f8] px-6 py-3 text-base outline-hidden transition-all duration-300 dark:border-transparent dark:bg-[#2C303B] dark:focus:shadow-none"
                  />
                </div>
                <div className="mb-8">
                  <label htmlFor="email" className="text-dark mb-3 block text-sm dark:text-white">
                    Work Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-stroke dark:text-body-color-dark dark:shadow-two text-body-color focus:border-primary dark:focus:border-primary w-full rounded-xs border bg-[#f8f8f8] px-6 py-3 text-base outline-hidden transition-all duration-300 dark:border-transparent dark:bg-[#2C303B] dark:focus:shadow-none"
                  />
                </div>
                <div className="mb-8">
                  <label htmlFor="password" className="text-dark mb-3 block text-sm dark:text-white">
                    Your Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter your Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-stroke dark:text-body-color-dark dark:shadow-two text-body-color focus:border-primary dark:focus:border-primary w-full rounded-xs border bg-[#f8f8f8] px-6 py-3 text-base outline-hidden transition-all duration-300 dark:border-transparent dark:bg-[#2C303B] dark:focus:shadow-none"
                  />
                </div>
                <div className="mb-6">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="shadow-submit dark:shadow-submit-dark bg-primary hover:bg-primary/90 flex w-full items-center justify-center rounded-xs px-9 py-4 text-base font-medium text-white duration-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? "Creating account..." : "Sign up"}
                  </button>
                </div>
              </form>
              <p className="text-body-color text-center text-base font-medium">
                Already have an account?{" "}
                <Link href="/signin" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignupPage;
