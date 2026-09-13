"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { isLoggedIn } from "@/lib/api";
import { 
  Sparkles, 
  Cpu, 
  Atom, 
  BookOpen, 
  CheckCircle2, 
  ArrowRight, 
  Target, 
  Lightbulb, 
  GraduationCap, 
  Layers 
} from "lucide-react";

export default function Home() {
  const [auth, setAuth] = useState(false);

  useEffect(() => {
    setAuth(isLoggedIn());
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Background ambient gradient glow */}
      <div className="relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-indigo-300/30 via-purple-300/30 to-pink-300/20 blur-3xl -z-10 pointer-events-none rounded-full" />

        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-4 pt-16 pb-20 sm:pt-24 sm:pb-28 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-6 shadow-xs animate-in fade-in slide-in-from-bottom-2 duration-700">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            Personalized AI & Quantum Learning Platform
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.15] mb-6">
            Master Cutting-Edge Tech,{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Tailored Exactly to You
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Whether you&apos;re a developer, doctor, finance manager, or educator — AIRA synthesizes 
            rich, bespoke multi-lesson curriculums calibrated to your unique background, knowledge level, and goals.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            {auth ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-7 py-3.5 rounded-xl shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Go to My Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-7 py-3.5 rounded-xl shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-semibold px-7 py-3.5 rounded-xl border border-slate-200 shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> AI-Powered Curriculum
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Interactive lmscn Quizzes
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Zero fluff
            </span>
          </div>
        </section>
      </div>

      {/* Two Specialized Domains */}
      <section className="max-w-6xl mx-auto px-4 py-12 w-full">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            Two Frontiers, Infinite Personalized Pathways
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            Choose between Artificial Intelligence and Quantum Computing. Every topic adapts to your chosen persona.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* AI Card */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
              <Cpu className="w-6 h-6" />
            </div>
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-3">
              15 Curated Topics
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Artificial Intelligence</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              From foundational Neural Networks and Supervised Learning to Large Language Models, Transformer architectures, and Diffusion systems.
            </p>
            <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-600">
              <span className="px-2.5 py-1 bg-slate-100 rounded-md">Neural Networks</span>
              <span className="px-2.5 py-1 bg-slate-100 rounded-md">Transformers & Attention</span>
              <span className="px-2.5 py-1 bg-slate-100 rounded-md">Reinforcement Learning</span>
              <span className="px-2.5 py-1 bg-slate-100 rounded-md">Prompt Engineering</span>
            </div>
          </div>

          {/* Quantum Card */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform">
              <Atom className="w-6 h-6" />
            </div>
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold mb-3">
              15 Curated Topics
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Quantum Computing</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              Explore quantum mechanics translated into computation — Qubits, Superposition, Quantum Entanglement, Grover&apos;s Search, and Shor&apos;s Algorithm.
            </p>
            <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-600">
              <span className="px-2.5 py-1 bg-slate-100 rounded-md">Qubits & Superposition</span>
              <span className="px-2.5 py-1 bg-slate-100 rounded-md">Quantum Entanglement</span>
              <span className="px-2.5 py-1 bg-slate-100 rounded-md">Quantum Gates & Circuits</span>
              <span className="px-2.5 py-1 bg-slate-100 rounded-md">Shor&apos;s Algorithm</span>
            </div>
          </div>
        </div>
      </section>

      {/* The AIRA Pedagogy Framework */}
      <section className="bg-slate-100/70 border-y border-slate-200 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
              Engineered for Genuine Comprehension
            </h2>
            <p className="text-slate-600 max-w-xl mx-auto">
              No generic chatbot bullet points. Every generated lesson follows a rigorous 9-stage pedagogy.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <Target className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">Persona-Calibrated</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Examples and depth match your profession — educational analogies for teachers, business ROI for leaders, mathematical precision for devs.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">Multi-Module Structure</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Structured progressive chapters with sequential lessons designed to take you from core intuition to advanced mastery.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">lmscn Quiz Engine</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                End-of-lesson multiple choice questions with immediate answer validation, rationale breakdowns, and score tracking.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <Lightbulb className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">Actionable Takeaways</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every chapter includes key concepts summary, common misconceptions to avoid, practical exercises, and next-step guides.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 py-16 w-full">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            How It Works
          </h2>
          <p className="text-slate-600 max-w-md mx-auto">
            Get your customized course generated and ready to read in under 30 seconds.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="relative flex flex-col items-center text-center p-6 bg-white rounded-xl border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mb-4 text-sm">
              1
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Define Your Profile</h3>
            <p className="text-sm text-slate-600">
              Set your profession, baseline knowledge level, primary objective, and preferred explanation style.
            </p>
          </div>

          <div className="relative flex flex-col items-center text-center p-6 bg-white rounded-xl border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mb-4 text-sm">
              2
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Choose Domain & Topic</h3>
            <p className="text-sm text-slate-600">
              Pick from 30+ AI or Quantum Computing subjects, from high-level overviews to mathematical mechanics.
            </p>
          </div>

          <div className="relative flex flex-col items-center text-center p-6 bg-white rounded-xl border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mb-4 text-sm">
              3
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Learn & Quiz</h3>
            <p className="text-sm text-slate-600">
              Read through tailored modules and complete interactive lmscn quizzes to lock in your understanding.
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <Link
            href={auth ? "/dashboard" : "/signup"}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-indigo-600/25 transition-all hover:scale-105"
          >
            {auth ? "Go to Dashboard" : "Create Your First Course Now"}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2 font-semibold text-slate-800">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            AIRA Prototype v0.1
          </div>
          <div>
            Personalized AI & Quantum Computing Learning Platform
          </div>
          <div className="flex gap-4">
            <Link href="/dashboard" className="hover:text-indigo-600">Dashboard</Link>
            <Link href="/generate" className="hover:text-indigo-600">Generate</Link>
            <Link href="/login" className="hover:text-indigo-600">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
