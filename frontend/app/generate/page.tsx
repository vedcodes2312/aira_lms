"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getTopics, generateCourse } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";

const DOMAINS = [
  { id: "AI", label: "Artificial Intelligence" },
  { id: "QC", label: "Quantum Computing" },
];

export default function GeneratePage() {
  return (
    <ProtectedRoute>
      <GenerateForm />
    </ProtectedRoute>
  );
}

function GenerateForm() {
  const router = useRouter();
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [topics, setTopics] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [loadingTopics, setLoadingTopics] = useState(false);

  useEffect(() => {
    if (!selectedDomain) return;
    setLoadingTopics(true);
    setSelectedTopic(null);
    setTopics([]);
    getTopics(selectedDomain)
      .then((res) => setTopics(res.topics))
      .catch((e) => setError(e.message))
      .finally(() => setLoadingTopics(false));
  }, [selectedDomain]);

  const handleGenerate = async () => {
    if (!selectedDomain || !selectedTopic) return;
    setError("");
    setGenerating(true);
    try {
      const course = await generateCourse(selectedDomain, selectedTopic);
      router.push(`/course/${course.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Generation failed");
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Generate a New Course</h1>
      <p className="text-sm text-gray-500 mb-8">
        Pick a domain and topic — AIRA will build a personalized course just for you.
      </p>

      {/* Domain selection */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
          Step 1 — Choose a domain
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {DOMAINS.map((d) => (
            <button
              key={d.id}
              id={`domain-${d.id}`}
              onClick={() => setSelectedDomain(d.id)}
              className={`card text-left transition hover:border-indigo-300 ${
                selectedDomain === d.id
                  ? "border-2 border-indigo-600 bg-indigo-50"
                  : "border-2 border-transparent"
              }`}
            >
              <p className="font-semibold text-gray-900">{d.label}</p>
              <p className="text-xs text-gray-500 mt-1">
                {d.id === "AI"
                  ? "Machine learning, neural networks, NLP, and more"
                  : "Qubits, quantum gates, algorithms, and cryptography"}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Topic selection */}
      {selectedDomain && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
            Step 2 — Choose a topic
          </h2>
          {loadingTopics ? (
            <p className="text-sm text-gray-400">Loading topics…</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {topics.map((t) => (
                <button
                  key={t}
                  id={`topic-${t.replace(/\s+/g, "-").toLowerCase()}`}
                  onClick={() => setSelectedTopic(t)}
                  className={`text-left px-3 py-2 rounded-md border text-sm transition ${
                    selectedTopic === t
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-700 border-gray-200 hover:border-indigo-400"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Generate button */}
      {selectedTopic && (
        <div className="card bg-indigo-50 border-indigo-200">
          <p className="text-sm text-gray-700 mb-3">
            Ready to generate:{" "}
            <span className="font-semibold text-indigo-700">{selectedTopic}</span>
          </p>
          <button
            id="generate-btn"
            onClick={handleGenerate}
            disabled={generating}
            className="btn-primary w-full text-base py-3"
          >
            {generating
              ? "⏳ Generating your personalized course… (this takes ~20s)"
              : "Generate My Course →"}
          </button>
          {generating && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              AI is synthesizing your personalized curriculum. Please wait…
            </p>
          )}
        </div>
      )}
    </div>
  );
}
