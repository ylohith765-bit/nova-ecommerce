"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUserAction } from "@/actions/auth-actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ShieldCheck, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateClientSide = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errors.name = "Full name must be at least 2 characters.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }
    if (!formData.password || formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters long.";
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = "Must contain uppercase, lowercase letters and a number.";
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validateClientSide()) {
      return;
    }

    setIsLoading(true);

    try {
      const res = await registerUserAction(formData);

      if (!res.success) {
        setServerError(res.message || "Registration failed.");
        if (res.errors) {
          const flat: Record<string, string> = {};
          Object.entries(res.errors).forEach(([key, val]) => {
            flat[key] = val[0] || "Invalid value";
          });
          setFieldErrors(flat);
        }
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push("/login?registered=true");
      }, 1500);
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-md bg-zinc-900/90 border-zinc-800 shadow-2xl backdrop-blur-xl">
        <CardHeader className="text-center space-y-2 pb-6">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-2">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">
            Create your account
          </CardTitle>
          <CardDescription className="text-zinc-400 text-sm">
            Join NOVA to save favorites, track orders, and checkout securely.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {serverError && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{serverError}</span>
            </div>
          )}

          {isSuccess && (
            <div className="mb-6 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Account created successfully! Redirecting to sign in...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="e.g. Elena Rostova"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: "" });
              }}
              error={fieldErrors.name}
              disabled={isLoading || isSuccess}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: "" });
              }}
              error={fieldErrors.email}
              disabled={isLoading || isSuccess}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="At least 8 characters"
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: "" });
              }}
              error={fieldErrors.password}
              helperText="Requires uppercase, lowercase, and a number."
              disabled={isLoading || isSuccess}
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={(e) => {
                setFormData({ ...formData, confirmPassword: e.target.value });
                if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: "" });
              }}
              error={fieldErrors.confirmPassword}
              disabled={isLoading || isSuccess}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium mt-2 shadow-lg shadow-indigo-600/20"
              isLoading={isLoading}
              disabled={isLoading || isSuccess}
            >
              <span>{isLoading ? "Creating account..." : "Complete Registration"}</span>
              {!isLoading && <ArrowRight className="w-4 h-4 ml-1.5" />}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center border-t border-zinc-800/80 pt-6">
          <p className="text-xs text-zinc-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
