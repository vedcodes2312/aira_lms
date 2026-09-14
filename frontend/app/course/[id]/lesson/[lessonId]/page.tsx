"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getCourse, toggleLessonComplete, translateLesson, Course, LessonItem } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Circle,
  Layers,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Sparkles,
  HelpCircle,
  Globe,
  Loader2,
  Languages,
} from "lucide-react";

const SECTION_LABELS: Record<string, string> = {
  introduction: "1. Introduction & Overview",
  main_explanation: "2. Core Concept & Deep Dive",
  how_it_works: "3. How It Works (Mechanisms)",
  real_world_example: "4. Real-World Application for Your Role",
  practical_applications: "5. Practical Applications & Use Cases",
  important_concepts: "6. Essential Terminology & Concepts",
  limitations: "7. Limitations, Challenges & Edge Cases",
  summary: "8. Summary & Synthesis",
  key_takeaways: "9. Key Takeaways",
};

const SECTION_ORDER = [
  "introduction",
  "main_explanation",
  "how_it_works",
  "real_world_example",
  "practical_applications",
  "important_concepts",
  "limitations",
  "summary",
  "key_takeaways",
];

const AVAILABLE_LANGUAGES = [
  { code: "English", label: "English", icon: "🇬🇧" },
  { code: "Hinglish", label: "Hinglish", icon: "🇮🇳" },
  { code: "Hindi", label: "हिंदी (Hindi)", icon: "🇮🇳" },
  { code: "Tamil", label: "தமிழ் (Tamil)", icon: "🇮🇳" },
  { code: "Telugu", label: "తెలుగు (Telugu)", icon: "🇮🇳" },
  { code: "Marathi", label: "मराठी (Marathi)", icon: "🇮🇳" },
];

export default function LessonPage() {
  return (
    <ProtectedRoute>
      <LessonReader />
    </ProtectedRoute>
  );
}

function LessonReader() {
  const params = useParams();
  const router = useRouter();
  const courseId = Number(params.id);
  const lessonId = Number(params.lessonId);

  const [course, setCourse] = useState<Course | null>(null);
  const [lesson, setLesson] = useState<LessonItem | null>(null);
  const [activeContent, setActiveContent] = useState<Record<string, string | string[]> | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("English");
  const [translating, setTranslating] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getCourse(courseId)
      .then((c) => {
        setCourse(c);
        const allLessons = c.modules?.flatMap((m) => m.lessons) ?? [];
        const found = allLessons.find((l) => l.id === lessonId);
        setLesson(found ?? null);
        setActiveContent(found?.content as Record<string, string | string[]> ?? null);
        setIsCompleted(!!found?.is_completed);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [courseId, lessonId]);

  const handleLanguageChange = async (newLang: string) => {
    if (newLang === selectedLanguage) return;
    setSelectedLanguage(newLang);

    if (newLang === "English") {
      if (lesson) setActiveContent(lesson.content as Record<string, string | string[]>);
      return;
    }

    setTranslating(true);
    try {
      const res = await translateLesson(courseId, lessonId, newLang);
      setActiveContent(res.content as Record<string, string | string[]>);
    } catch (e: any) {
      alert(`Translation failed: ${e?.message || "Please check Gemini API key"}`);
      setSelectedLanguage("English");
      if (lesson) setActiveContent(lesson.content as Record<string, string | string[]>);
    } finally {
      setTranslating(false);
    }
  };

  const handleToggleComplete = async () => {
    setToggling(true);
    try {
      const res = await toggleLessonComplete(courseId, lessonId);
      setIsCompleted(res.is_completed);
    } catch (e: any) {
      alert(`Error updating progress: ${e.message}`);
    } finally {
      setToggling(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading lesson…</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!lesson || !course) return <div className="p-8 text-center text-slate-400">Lesson not found.</div>;

  const allLessons = course.modules?.flatMap((m) => m.lessons) ?? [];
  const currentIdx = allLessons.findIndex((l) => l.id === lessonId);
  const nextLesson = allLessons[currentIdx + 1] ?? null;
  const prevLesson = allLessons[currentIdx - 1] ?? null;

  const content = activeContent || (lesson.content as Record<string, string | string[]>);

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 pb-24">
      {/* Breadcrumb & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link href={`/course/${courseId}`} className="hover:text-indigo-600 truncate max-w-[200px]">
            {course.title}
          </Link>
          <span>›</span>
          <span className="text-slate-800 font-semibold truncate max-w-[200px]">{lesson.title}</span>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/course/${courseId}/flashcards`}>
            <Button variant="outline" size="sm" className="text-xs bg-white text-indigo-700 border-indigo-200">
              <Layers className="w-3.5 h-3.5 mr-1 text-indigo-600" /> Flashcards
            </Button>
          </Link>
          <Button
            size="sm"
            onClick={handleToggleComplete}
            disabled={toggling}
            variant={isCompleted ? "outline" : "default"}
            className={
              isCompleted
                ? "text-xs border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                : "text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
            }
            id="toggle-complete-btn"
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Completed
              </>
            ) : (
              <>
                <Circle className="w-3.5 h-3.5 mr-1" /> Mark Complete
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Multi-Lingual Language Switcher Bar */}
      <div className="bg-slate-900/95 text-slate-200 border border-slate-800 rounded-xl p-3 mb-6 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
          <Languages className="w-4 h-4 text-indigo-400" />
          <span>Lesson Language:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {AVAILABLE_LANGUAGES.map((lang) => {
            const isSelected = selectedLanguage === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                disabled={translating}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-sm font-semibold"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/50"
                }`}
              >
                <span>{lang.icon}</span>
                <span>{lang.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {translating && (
        <div className="mb-6 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 flex items-center justify-center gap-2.5 text-xs font-medium animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
          <span>Synthesizing lesson explanation in {selectedLanguage} with AI...</span>
        </div>
      )}

      {selectedLanguage !== "English" && !translating && (
        <div className="mb-6 px-3.5 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center justify-between text-xs">
          <span>✓ Explaining in <strong>{selectedLanguage}</strong> (AI-Adapted)</span>
          <button
            onClick={() => handleLanguageChange("English")}
            className="underline hover:text-white font-medium ml-2"
          >
            Switch to Original English
          </button>
        </div>
      )}

      {/* Lesson Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 mb-8 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-200">
            Lesson {lesson.order} of {allLessons.length}
          </Badge>
          {isCompleted && (
            <Badge className="bg-emerald-600 text-white text-xs">
              ✓ Completed
            </Badge>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {lesson.title}
        </h1>
      </div>

      {/* Content sections */}
      <div className="space-y-6 mb-12">
        {SECTION_ORDER.map((key) => {
          const value = content[key];
          if (!value) return null;

          return (
            <div key={key} className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
              <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-700 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>{SECTION_LABELS[key] ?? key}</span>
              </h2>

              {key === "key_takeaways" && Array.isArray(value) ? (
                <ul className="space-y-2.5">
                  {(value as string[]).map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed">
                      <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                        ✓
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : key === "practical_applications" ? (
                <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                  {String(value)}
                </div>
              ) : (
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">
                  {String(value)}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Completion & Navigation Controls */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            onClick={handleToggleComplete}
            disabled={toggling}
            className={
              isCompleted
                ? "bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                : "bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
            }
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-1.5" /> Completed
              </>
            ) : (
              <>
                <Circle className="w-4 h-4 mr-1.5" /> Mark as Completed
              </>
            )}
          </Button>

          <Link href={`/course/${courseId}/quiz/${lessonId}`}>
            <Button variant="outline" className="border-indigo-300 text-indigo-700 hover:bg-indigo-50" id="take-quiz-btn">
              <HelpCircle className="w-4 h-4 mr-1.5 text-indigo-600" />
              Take Lesson Quiz ({lesson.quizzes.length} Qs)
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {prevLesson && (
            <Link href={`/course/${courseId}/lesson/${prevLesson.id}`}>
              <Button variant="ghost" size="sm" className="text-xs text-slate-600">
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Prev
              </Button>
            </Link>
          )}
          {nextLesson ? (
            <Link href={`/course/${courseId}/lesson/${nextLesson.id}`}>
              <Button size="sm" className="bg-slate-800 hover:bg-slate-900 text-white text-xs">
                Next: {nextLesson.title} <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          ) : (
            <Link href={`/course/${courseId}`}>
              <Button size="sm" className="bg-slate-800 hover:bg-slate-900 text-white text-xs">
                Course Overview
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
