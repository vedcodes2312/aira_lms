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
  Layers,
  Award,
  Zap,
  Repeat,
  Shield,
  ChevronRight,
  Code2,
  Stethoscope,
  TrendingUp,
  Glasses,
  Play,
  Flame
} from "lucide-react";

export default function Home() {
  const [auth, setAuth] = useState(false);
  const [activePersona, setActivePersona] = useState<"educator" | "engineer" | "finance" | "doctor" | "beginner">("educator");
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);

  useEffect(() => {
    setAuth(isLoggedIn());
  }, []);

  const personaExamples = {
    educator: {
      role: "High School Teacher / Educator",
      icon: Glasses,
      badgeColor: "bg-amber-500/10 text-amber-600 border-amber-200",
      title: "Explaining Neural Networks via Classroom Analogies",
      snippet: "Think of an artificial neural network like a panel of specialist teachers grading a final project. Each hidden layer represents a grading rubric stage where weights act like rubric importance criteria.",
      keyBenefit: "Actionable classroom metaphors & zero technical barrier to entry",
      domain: "Artificial Intelligence",
    },
    engineer: {
      role: "Senior Software Engineer",
      icon: Code2,
      badgeColor: "bg-indigo-500/10 text-indigo-600 border-indigo-200",
      title: "Vector Embeddings & Backpropagation Mathematics",
      snippet: "Mathematically, gradients compute the partial derivatives of the loss function J(W, b) relative to weights W using the multivariate chain rule: dJ/dW = dJ/da * da/dz * dz/dW.",
      keyBenefit: "Strict mathematical formulas, code implementations & tensor flowcharts",
      domain: "Artificial Intelligence",
    },
    finance: {
      role: "Finance Manager / Analyst",
      icon: TrendingUp,
      badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
      title: "Quantum Portfolio Optimization & Grover's Speedup",
      snippet: "Grover's Quantum Search provides a quadratic speedup O(sqrt(N)) over classical Monte Carlo simulations when exploring high-dimensional risk-return Pareto frontiers.",
      keyBenefit: "Cost-benefit metrics, quantitative risk models & executive summaries",
      domain: "Quantum Computing",
    },
    doctor: {
      role: "Medical Practitioner",
      icon: Stethoscope,
      badgeColor: "bg-rose-500/10 text-rose-600 border-rose-200",
      title: "CNNs in Radiological Pathology & Biomarker Discovery",
      snippet: "Convolutional layers function analogous to biological visual cortex receptive fields, applying spatial feature extraction kernels to highlight micro-calcifications in CT scans.",
      keyBenefit: "Clinical diagnostics relevance, safety guardrails & diagnostic analogies",
      domain: "Artificial Intelligence",
    },
    beginner: {
      role: "Curious Enthusiast",
      icon: Sparkles,
      badgeColor: "bg-purple-500/10 text-purple-600 border-purple-200",
      title: "Quantum Qubits: The Spinning Coin Concept",
      snippet: "A classical bit is a coin resting flat on a table (either Heads or Tails). A quantum qubit in superposition is that coin actively spinning in the air — both states simultaneously until observed!",
      keyBenefit: "Intuitive real-world analogies, step-by-step glossaries & zero jargon",
      domain: "Quantum Computing",
    },
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white font-sans overflow-x-hidden">
      {/* Background ambient lighting effects */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1100px] h-[600px] bg-gradient-to-b from-indigo-600/20 via-purple-600/15 to-transparent blur-[140px] rounded-full" />
        <div className="absolute top-[35%] left-[-10%] w-[600px] h-[500px] bg-blue-600/10 blur-[130px] rounded-full" />
        <div className="absolute top-[60%] right-[-10%] w-[650px] h-[550px] bg-fuchsia-600/10 blur-[140px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b10_1px,transparent_1px),linear-gradient(to_bottom,#1e293b10_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Hero Section */}
      <section className="relative max-w-6xl mx-auto px-4 pt-16 pb-20 sm:pt-24 sm:pb-28 text-center">
        {/* Shimmer Announcement Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-xs font-semibold tracking-wide mb-8 shadow-inner hover:border-indigo-400/50 transition-colors">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span>Next-Generation Personalized AI & Quantum LMS</span>
          <span className="hidden sm:inline text-indigo-500 font-normal">|</span>
          <span className="hidden sm:inline text-indigo-400/90 font-medium">Calibrated to your exact background</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.1] mb-6">
          Master Deep Tech with{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
            AI-Calibrated
          </span>{" "}
          Curriculums
        </h1>

        {/* Hero Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
          Whether you are an educator, software engineer, doctor, or executive — AIRA synthesizes 
          structured multi-lesson courses, 3D flashcards, and verified lmscn quizzes tailored to your cognitive style.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-12">
          {auth ? (
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.03] active:scale-[0.98]"
            >
              Enter Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.03] active:scale-[0.98]"
              >
                Start Learning Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-semibold px-8 py-4 rounded-xl border border-slate-700/80 shadow-sm transition-all hover:scale-[1.03] active:scale-[0.98]"
              >
                Sign In
              </Link>
            </>
          )}
        </div>

        {/* Value Prop Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-slate-400 font-medium">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/70 border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>AI-Powered Multi-Module Structure</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/70 border border-slate-800">
            <Repeat className="w-4 h-4 text-indigo-400" />
            <span>Spaced Repetition 3D Flashcards</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/70 border border-slate-800">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Achievement Badges & Milestones</span>
          </div>
        </div>

        {/* Hero Interactive Mockup Preview */}
        <div className="mt-14 relative max-w-4xl mx-auto rounded-2xl p-1 bg-gradient-to-b from-indigo-500/30 via-purple-500/20 to-slate-800/40 shadow-2xl shadow-indigo-500/10">
          <div className="bg-slate-900/95 backdrop-blur-xl rounded-xl border border-slate-800 p-6 sm:p-8 text-left">
            {/* Mock Header bar */}
            <div className="flex items-center justify-between pb-5 border-b border-slate-800 mb-6">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs text-slate-400 font-mono">AIRA Course Engine · Preview</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                  4 Lessons
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  100% Progress
                </span>
              </div>
            </div>

            {/* Mock Content */}
            <div className="grid md:grid-cols-3 gap-6 items-center">
              <div className="md:col-span-2 space-y-3">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-purple-400">
                  <Flame className="w-3.5 h-3.5" />
                  Lesson 1: Foundations of Artificial Neural Networks
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  How Neurons Process Weighted Inputs
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Every artificial neuron calculates a dot product of inputs and synaptic weights, adds a bias term, 
                  and applies a non-linear activation function (like ReLU or Sigmoid) to fire signals onward.
                </p>
                <div className="flex flex-wrap gap-2 pt-2 text-xs">
                  <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">Dot Products</span>
                  <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">Activation Functions</span>
                  <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">Backprop</span>
                </div>
              </div>

              {/* Interactive Flip Card Demo */}
              <div 
                onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                className="cursor-pointer group relative h-40 bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-slate-900 rounded-xl border border-indigo-500/40 p-4 flex flex-col justify-between hover:border-indigo-400 transition-all shadow-md"
              >
                <div className="flex justify-between items-center text-xs text-indigo-300 font-medium">
                  <span>Interactive Flashcard</span>
                  <span className="text-[10px] bg-indigo-500/20 px-2 py-0.5 rounded text-indigo-200">Click to Flip</span>
                </div>
                <div className="text-center my-auto">
                  {!flashcardFlipped ? (
                    <p className="text-sm font-semibold text-white">
                      What is the purpose of the activation function?
                    </p>
                  ) : (
                    <p className="text-xs text-indigo-200 leading-snug">
                      It introduces non-linearity into the network, allowing it to learn complex non-linear boundary decision curves.
                    </p>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Concept Review</span>
                  <span className="text-emerald-400 font-medium">✓ Mastered</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Persona Calibration Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Target className="w-3.5 h-3.5" />
            Persona-Driven AI Pedagogy
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            See How AIRA Adapts to Who You Are
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
            Select a profession below to see how our generative engine customizes explanations, analogies, and complexity.
          </p>
        </div>

        {/* Persona Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {(Object.keys(personaExamples) as Array<keyof typeof personaExamples>).map((key) => {
            const persona = personaExamples[key];
            const Icon = persona.icon;
            const isSelected = activePersona === key;

            return (
              <button
                key={key}
                onClick={() => setActivePersona(key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105"
                    : "bg-slate-900/90 text-slate-300 hover:bg-slate-800 border border-slate-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{persona.role}</span>
              </button>
            );
          })}
        </div>

        {/* Live Persona Card Display */}
        <div className="max-w-4xl mx-auto bg-slate-900/90 rounded-2xl border border-slate-800 p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <BookOpen className="w-40 h-40 text-indigo-400" />
          </div>

          <div className="relative z-10 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${personaExamples[activePersona].badgeColor}`}>
                {personaExamples[activePersona].role} Perspective
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                Domain: <span className="text-indigo-400 font-semibold">{personaExamples[activePersona].domain}</span>
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white">
              {personaExamples[activePersona].title}
            </h3>

            <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800/90 text-slate-300 text-sm sm:text-base leading-relaxed font-mono">
              &quot;{personaExamples[activePersona].snippet}&quot;
            </div>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Pedagogy Target: {personaExamples[activePersona].keyBenefit}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Two Specialized Frontiers: AI & Quantum */}
      <section className="max-w-6xl mx-auto px-4 py-16 w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Two Frontiers. 30+ Core Topics.
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
            Curated deep-dive subject tracks ready for instant synthesis.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* AI Track Card */}
          <div className="bg-slate-900/90 rounded-2xl p-8 border border-indigo-500/20 hover:border-indigo-500/50 shadow-xl transition-all relative overflow-hidden group">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
              <Cpu className="w-7 h-7" />
            </div>
            <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-500/20">
              15 Comprehensive AI Topics
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Artificial Intelligence</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              From foundational Neural Networks and Supervised Learning to Large Language Models, Transformer architectures, and Diffusion systems.
            </p>
            <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-300">
              <span className="px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-lg">Neural Networks</span>
              <span className="px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-lg">Transformers & Attention</span>
              <span className="px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-lg">Reinforcement Learning</span>
              <span className="px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-lg">Prompt Engineering</span>
            </div>
          </div>

          {/* Quantum Track Card */}
          <div className="bg-slate-900/90 rounded-2xl p-8 border border-purple-500/20 hover:border-purple-500/50 shadow-xl transition-all relative overflow-hidden group">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
              <Atom className="w-7 h-7" />
            </div>
            <div className="inline-block px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 text-xs font-semibold mb-3 border border-purple-500/20">
              15 Comprehensive Quantum Topics
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Quantum Computing</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Explore quantum mechanics translated into computation — Qubits, Superposition, Quantum Entanglement, Grover&apos;s Search, and Shor&apos;s Algorithm.
            </p>
            <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-300">
              <span className="px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-lg">Qubits & Superposition</span>
              <span className="px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-lg">Quantum Entanglement</span>
              <span className="px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-lg">Quantum Gates & Circuits</span>
              <span className="px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-lg">Shor&apos;s Algorithm</span>
            </div>
          </div>
        </div>
      </section>

      {/* Full Feature Ecosystem */}
      <section className="bg-slate-900/50 border-y border-slate-800 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Built for Deep, Measurable Mastery
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
              Every course is built on a 9-stage pedagogical architecture to ensure long-term retention.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
                <Target className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-white mb-2 text-base">Persona-Calibrated</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Matches your background — analogies for educators, code for devs, financial metrics for managers.
              </p>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
                <Repeat className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-white mb-2 text-base">Spaced Flashcards</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                3D flip cards automatically generated from key takeaways and important concepts for rapid recall.
              </p>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-white mb-2 text-base">lmscn Quiz Engine</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Multiple choice quizzes with immediate feedback, detailed rationale breakdowns, and score persistence.
              </p>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-white mb-2 text-base">Achievement Badges</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Unlock awards like &quot;Neural Architect&quot; and &quot;Quantum Pioneer&quot; upon scoring 80%+ across all quizzes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works (3-Step Roadmap) */}
      <section className="max-w-6xl mx-auto px-4 py-20 w-full">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            How It Works
          </h2>
          <p className="text-slate-400 max-w-md mx-auto text-sm">
            Generate and begin your customized deep tech curriculum in under 30 seconds.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="relative flex flex-col items-center text-center p-8 bg-slate-900/80 rounded-2xl border border-slate-800">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white font-bold flex items-center justify-center mb-6 text-base shadow-lg shadow-indigo-500/20">
              1
            </div>
            <h3 className="font-bold text-white mb-2 text-lg">Define Your Profile</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Set your profession, baseline knowledge level, primary objective, and preferred explanation style during onboarding.
            </p>
          </div>

          <div className="relative flex flex-col items-center text-center p-8 bg-slate-900/80 rounded-2xl border border-slate-800">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 to-purple-400 text-white font-bold flex items-center justify-center mb-6 text-base shadow-lg shadow-purple-500/20">
              2
            </div>
            <h3 className="font-bold text-white mb-2 text-lg">Choose Domain & Topic</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Select any AI or Quantum Computing topic. AIRA immediately generates progressive chapters and structured lessons.
            </p>
          </div>

          <div className="relative flex flex-col items-center text-center p-8 bg-slate-900/80 rounded-2xl border border-slate-800">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-600 to-pink-400 text-white font-bold flex items-center justify-center mb-6 text-base shadow-lg shadow-pink-500/20">
              3
            </div>
            <h3 className="font-bold text-white mb-2 text-lg">Master, Quiz & Earn</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Study multi-part lessons, flip through 3D flashcards, test your comprehension with quizzes, and earn badges.
            </p>
          </div>
        </div>

        {/* Bottom CTA Card */}
        <div className="mt-16 bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900 rounded-3xl border border-indigo-500/30 p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white">
              Ready to Accelerate Your Deep Tech Learning?
            </h3>
            <p className="text-slate-300 text-sm sm:text-base">
              Create your free learner account now and generate your first personalized curriculum.
            </p>
            <div className="pt-2">
              <Link
                href={auth ? "/dashboard" : "/signup"}
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-900 font-bold px-8 py-4 rounded-xl shadow-xl transition-all hover:scale-105 active:scale-95 text-sm sm:text-base"
              >
                {auth ? "Go to Dashboard" : "Get Started Free"}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-2 font-semibold text-slate-200">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>AIRA LMS Platform</span>
          </div>
          <div className="text-center sm:text-left text-slate-400">
            AI & Quantum Computing Personalized Learning Platform
          </div>
          <div className="flex gap-6">
            <Link href="/dashboard" className="hover:text-indigo-400 transition-colors">Dashboard</Link>
            <Link href="/generate" className="hover:text-indigo-400 transition-colors">Generate</Link>
            <Link href="/admin" className="hover:text-indigo-400 transition-colors">Admin</Link>
            <Link href="/login" className="hover:text-indigo-400 transition-colors">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
