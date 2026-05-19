"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    setIsSubmitting(true);
    const supabase = createClient();

    const result =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    if (mode === "signup" && !result.data.session) {
      setNotice("Check your inbox and confirm your email address before signing in.");
      setMode("login");
      return;
    }

    router.push("/");
    router.refresh();
  }

  async function handleDemoAccount() {
    setMode("login");
    const demoEmail = "demo@sourceflights.dev";
    const demoPassword = "SourceAsia@123";
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError("");
    setNotice("");
    setIsSubmitting(true);

    const supabase = createClient();
    const loginResult = await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: demoPassword,
    });

    if (!loginResult.error) {
      setIsSubmitting(false);
      router.push("/");
      router.refresh();
      return;
    }

    const signupResult = await supabase.auth.signUp({
      email: demoEmail,
      password: demoPassword,
    });

    setIsSubmitting(false);

    if (signupResult.error) {
      setError(signupResult.error.message);
      return;
    }

    if (!signupResult.data.session) {
      setNotice("Demo account created. Confirm the email from your inbox, then click Login.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-950">
        {mode === "login" ? "Welcome back" : "Create your account"}
      </h1>
      <p className="mt-2 text-sm text-slate-500">Use Supabase Auth to manage bookings securely.</p>

      <button
        type="button"
        onClick={() => void handleDemoAccount()}
        disabled={isSubmitting}
        className="mt-4 inline-flex h-9 items-center justify-center rounded-md border border-teal-200 bg-teal-50 px-3 text-sm font-semibold text-teal-700 hover:bg-teal-100"
      >
        Use demo account
      </button>

      <div className="mt-5 grid gap-3">
        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-11 rounded-md border border-slate-300 px-3 outline-none focus:border-teal-600"
            required
          />
        </label>
        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-11 rounded-md border border-slate-300 px-3 outline-none focus:border-teal-600"
            required
          />
        </label>
      </div>

      {notice ? <p className="mt-3 rounded-md bg-teal-50 p-3 text-sm text-teal-700">{notice}</p> : null}
      {error ? <p className="mt-3 rounded-md bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-teal-600 px-4 text-sm font-semibold text-white hover:bg-teal-700 disabled:bg-slate-300"
      >
        {isSubmitting ? <Loader2 className="animate-spin" size={17} /> : null}
        {mode === "login" ? "Login" : "Sign up"}
      </button>

      <button
        type="button"
        onClick={() => {
          setMode(mode === "login" ? "signup" : "login");
          setError("");
          setNotice("");
        }}
        className="mt-3 w-full text-sm font-medium text-teal-700 hover:text-teal-800"
      >
        {mode === "login" ? "Need an account? Sign up" : "Already have an account? Login"}
      </button>
    </form>
  );
}
