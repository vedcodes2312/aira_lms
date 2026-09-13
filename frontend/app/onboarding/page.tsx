"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveOnboarding } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";

const PROFESSIONS = ["Student", "Teacher", "Business Professional", "Developer", "Researcher", "Other"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const DOMAINS = ["Artificial Intelligence", "Quantum Computing"];
const GOALS = [
  "Understand basics",
  "Use in my profession",
  "Build applications",
  "Learn programming",
  "Conduct research",
];
const STYLES = ["Simple", "Practical", "Technical", "Balanced"];

export default function OnboardingPage() {
  return (
    <ProtectedRoute>
      <OnboardingForm />
    </ProtectedRoute>
  );
}

function OnboardingForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    profession: "Student",
    profession_other: "",
    knowledge_level: "Beginner",
    learning_domain: "Artificial Intelligence",
    learning_goal: "Understand basics",
    explanation_style: "Balanced",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await saveOnboarding(form);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card w-full max-w-lg">
        <h1 className="text-2xl font-bold text-indigo-700 mb-1">Set up your learning profile</h1>
        <p className="text-sm text-gray-500 mb-6">
          AIRA personalizes every course to you. Fill this in once.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Profession */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Profession / Role
            </label>
            <select
              id="onboard-profession"
              className="input"
              value={form.profession}
              onChange={(e) => setForm({ ...form, profession: e.target.value })}
            >
              {PROFESSIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            {form.profession === "Other" && (
              <input
                id="onboard-profession-other"
                className="input mt-2"
                placeholder="Please specify your profession"
                value={form.profession_other}
                onChange={(e) => setForm({ ...form, profession_other: e.target.value })}
                required
              />
            )}
          </div>

          {/* Knowledge Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Knowledge Level</label>
            <div className="flex gap-3">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  type="button"
                  id={`onboard-level-${l.toLowerCase()}`}
                  onClick={() => setForm({ ...form, knowledge_level: l })}
                  className={`flex-1 py-2 rounded-md border text-sm font-medium transition ${
                    form.knowledge_level === l
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-700 border-gray-300 hover:border-indigo-400"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Learning Domain */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Learning Domain</label>
            <div className="flex gap-3">
              {DOMAINS.map((d) => (
                <button
                  key={d}
                  type="button"
                  id={`onboard-domain-${d.toLowerCase().replace(/\s+/g, "-")}`}
                  onClick={() => setForm({ ...form, learning_domain: d })}
                  className={`flex-1 py-2 rounded-md border text-sm font-medium transition ${
                    form.learning_domain === d
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-700 border-gray-300 hover:border-indigo-400"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Learning Goal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Learning Goal</label>
            <select
              id="onboard-goal"
              className="input"
              value={form.learning_goal}
              onChange={(e) => setForm({ ...form, learning_goal: e.target.value })}
            >
              {GOALS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Explanation Style */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Explanation Style
            </label>
            <div className="grid grid-cols-2 gap-2">
              {STYLES.map((s) => (
                <button
                  key={s}
                  type="button"
                  id={`onboard-style-${s.toLowerCase()}`}
                  onClick={() => setForm({ ...form, explanation_style: s })}
                  className={`py-2 rounded-md border text-sm font-medium transition ${
                    form.explanation_style === s
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-700 border-gray-300 hover:border-indigo-400"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            id="onboard-submit"
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-2"
          >
            {loading ? "Saving…" : "Start Learning →"}
          </button>
        </form>
      </div>
    </div>
  );
}
