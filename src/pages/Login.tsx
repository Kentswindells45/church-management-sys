/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import {
  Users,
  Calendar,
  Book,
  Lock,
  Mail,
  ChevronRight,
  Church,
  Globe,
  CheckCircle2,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { authService } from "../services/authService";
import baptistLogo from "../assets/baptist-logo.png";
import ghanabaptist from "../assets/ghanabaptist.jpeg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await authService.login({ email, password });
      login(response.user);
      const from = (location.state as any)?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center relative bg-gradient-to-br from-indigo-950 via-purple-900 to-violet-950 overflow-hidden">
      {/* ambient background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-32 -top-24 w-[680px] h-[680px] rounded-full bg-gradient-to-br from-blue-700/12 to-indigo-800/10 blur-3xl animate-blob"></div>
        <div className="absolute -right-32 -bottom-24 w-[520px] h-[520px] rounded-full bg-gradient-to-tr from-pink-600/10 to-yellow-500/8 blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-6 mix-blend-overlay" />
      </div>

      <div className="container relative z-10 w-full max-w-6xl px-4 py-8">
        <div className="bg-white/6 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/10 overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 md:p-8">
          {/* Left visual column */}
          <div className="hidden lg:flex flex-col justify-between p-6 gap-6">
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <img
                src={ghanabaptist}
                alt="Church"
                className="w-full h-80 object-cover transform transition-transform duration-800 hover:scale-[1.06]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-6 flex flex-col justify-end">
                <h3 className="text-2xl font-bold text-white drop-shadow-sm">
                  Bethel Baptist Church
                </h3>
                <p className="text-sm text-white/80 mt-1">
                  Serving the community with faith and compassion
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <AnimatedStatCard
                icon={Users}
                count="500+"
                label="Active Members"
                description="Growing community"
              />
              <AnimatedStatCard
                icon={Calendar}
                count="50+"
                label="Annual Events"
                description="Vibrant activities"
              />
              <AnimatedStatCard
                icon={Book}
                count="10+"
                label="Ministries"
                description="Serving together"
              />
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-semibold text-white/90 mb-2">
                Why choose us
              </h4>
              <div className="flex flex-col gap-3 text-white/80">
                <FeatureItem
                  icon={Church}
                  text="Modern Church Management System"
                />
                <FeatureItem icon={Globe} text="Accessible Anywhere, Anytime" />
                <FeatureItem
                  icon={CheckCircle2}
                  text="Secure & Reliable Platform"
                />
              </div>
            </div>
          </div>

          {/* Right - Login Form */}
          <div className="flex items-center justify-center p-6">
            <div className="w-full max-w-md">
              <div className="mx-auto mb-6 w-28 h-28 relative">
                <div className="absolute inset-0 rounded-full animate-breathe">
                  <div
                    className="absolute inset-0 rounded-full opacity-60 blur-sm"
                    style={{
                      // RGB/RGBA based multi-stop radial glow for richer, RGB-driven color
                      background:
                        "radial-gradient(circle at 30% 30%, rgba(59,130,246,0.40) 0%, rgba(99,102,241,0.22) 35%, rgba(168,85,247,0.12) 65%, rgba(59,130,246,0.06) 100%)",
                      mixBlendMode: "screen",
                    }}
                  />
                </div>

                <div
                  className="absolute inset-2 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center overflow-hidden border border-white/10"
                  style={{
                    // RGB multi-stop glow around the circular logo
                    boxShadow:
                      "0 8px 30px rgba(59,130,246,0.40), 0 18px 60px rgba(99,102,241,0.20), 0 36px 120px rgba(168,85,247,0.12), inset 0 -6px 18px rgba(255,255,255,0.02)",
                    zIndex: 2,
                  }}
                >
                  <img
                    src={baptistLogo}
                    alt="Logo"
                    className="w-full h-full object-cover transform transition-all duration-500"
                    style={{ position: "relative", zIndex: 3 }}
                  />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-center text-white mb-1">
                Welcome Back
              </h2>
              <p className="text-center text-sm text-white/70 mb-6">
                Sign in to access your dashboard
              </p>

              <form
                onSubmit={handleSubmit}
                className="space-y-4"
                aria-label="Login form"
              >
                <InputField
                  icon={Mail}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                />

                <InputField
                  icon={Lock}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                />

                <div className="flex items-center justify-between text-sm text-white/70">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="accent-blue-400 h-4 w-4 rounded"
                    />
                    <span className="text-xs">Remember me</span>
                  </label>
                  <a href="#" className="text-sm text-white/90 hover:underline">
                    Forgot password?
                  </a>
                </div>

                {/* Polished CTA — visual only, functionality unchanged */}
                <button
                  type="submit"
                  aria-label="Sign in"
                  className="group relative w-full rounded-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300/30"
                >
                  <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 transition-transform duration-300 group-hover:scale-105" />
                  <span className="absolute inset-0 rounded-xl bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent)] pointer-events-none" />
                  <div className="relative flex items-center justify-center gap-3 px-6 py-3">
                    <span className="text-white text-base font-semibold tracking-wide drop-shadow-sm">
                      Sign In
                    </span>
                    <span className="bg-white/10 p-1 rounded-full flex items-center justify-center">
                      <ChevronRight className="w-5 h-5 text-white" />
                    </span>
                  </div>
                </button>

                <div className="text-center text-xs text-white/60 mt-2">
                  Or continue with your organisation account
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* AnimatedStatCard (visual only) */
function AnimatedStatCard({
  icon: Icon,
  count,
  label,
  description,
}: {
  icon: React.ElementType;
  count: string;
  label: string;
  description: string;
}) {
  return (
    <div className="relative p-4 rounded-xl bg-gradient-to-b from-white/4 to-white/2 border border-white/6 hover:scale-[1.02] transition-transform">
      <div className="mb-2">
        <Icon className="w-6 h-6 text-white/85" />
      </div>
      <div className="text-lg font-bold text-white">{count}</div>
      <div className="text-xs text-white/70">{label}</div>
      <div className="text-xs text-white/50 mt-1">{description}</div>
    </div>
  );
}

/* InputField (visual only, required prop behavior preserved) */
function InputField({
  icon: Icon,
  ...props
}: { icon: React.ElementType } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
        <Icon className="w-5 h-5" />
      </div>
      <input
        {...props}
        className="w-full bg-white/6 border border-white/10 rounded-xl px-12 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/30 transition"
        required
      />
    </div>
  );
}

/* FeatureItem (fixed typo and improved spacing) */
function FeatureItem({
  icon: Icon,
  text,
}: {
  icon: React.ElementType;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 text-white/80">
      <div className="p-1.5 sm:p-2 rounded-lg bg-white/10">
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
      </div>
      <span className="text-xs sm:text-sm">{text}</span>
    </div>
  );
}
