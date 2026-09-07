"use client";

import React, { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Lock, Mail, Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        // Safe one-time initial admin setup
        const res = await fetch("/api/auth/setup-admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();
        if (!res.ok || data.error) {
          setError(data.error || "Failed to create first admin");
          setLoading(false);
          return;
        }

        // Auto sign-in with the new admin account
        const signInRes = await authClient.signIn.email({
          email,
          password,
        });

        if (signInRes.error) {
          setError("Account created, please sign in.");
          setIsSignUp(false);
        } else {
          window.location.href = "/admin";
        }
      } else {
        const res = await authClient.signIn.email({
          email,
          password,
        });

        if (res.error) {
          setError(res.error.message || "Invalid email or password");
        } else {
          window.location.href = "/admin";
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-xl p-8">
        <div className="flex flex-col items-center text-center mb-8">
          <Link href="/">
            <Image
              src="/logo.png"
              width={160}
              height={45}
              alt="Express Nepal"
              className="h-10 w-auto object-contain mb-4"
              priority
            />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 font-poppins">
            {isSignUp ? "Initial Admin Setup" : "Admin Portal"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isSignUp
              ? "Register the main root administrator (One-Time Setup)"
              : "Sign in to manage news, media, and articles"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Chief Editor / Admin"
                className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-nepal-red focus:bg-white text-gray-900 font-poppins transition-all"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@ktmpost.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-nepal-red focus:bg-white text-gray-900 font-poppins transition-all"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-nepal-red focus:bg-white text-gray-900 font-poppins transition-all"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-nepal-red hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isSignUp ? "Creating account..." : "Signing in..."}</span>
              </>
            ) : (
              <>
                <span>{isSignUp ? "Create Root Admin" : "Sign In"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            {isSignUp
              ? "Already have an account? Sign In"
              : "Need initial setup? Create First Admin"}
          </button>
        </div>
      </div>
    </div>
  );
}
