"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  getCourse,
  submitQuizAttempt,
  Course,
  LessonItem,
  QuizItem,
  Badge as BadgeType,
} from "@/lib/api";
import { Quiz, QuizData, QuizResult } from "@/components/lms/quiz";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Award,
  Layers,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function QuizPage() {
  return (
    <ProtectedRoute>
      <QuizRunner />
    </ProtectedRoute>
  );
}

function buildQuizData(lesson: LessonItem, quizzes: QuizItem[]): QuizData {
  return {
    title: `Quiz: ${lesson.title}`,
    description: "Test your understanding of this lesson.",
    passingScore: 70,
    showExplanations: true,
    questions: quizzes.map((q, qi) => {
      const optionIds = q.options.map((_, i) => String.fromCharCode(65 + i)); // A, B, C, D
      return {
        id: `q${qi + 1}`,
        type: "single" as const,
        question: q.question,
        options: q.options.map((label, i) => ({
          id: optionIds[i],
          label,
          explanation: i === q.correct_answer ? q.explanation : undefined,
        })),
        correctIds: [optionIds[q.correct_answer]],
      };
    }),
  };
}

function QuizRunner() {
  const params = useParams();
  const router = useRouter();
  const courseId = Number(params.id);
  const lessonId = Number(params.lessonId);

  const [course, setCourse] = useState<Course | null>(null);
  const [lesson, setLesson] = useState<LessonItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [unlockedBadge, setUnlockedBadge] = useState<BadgeType | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getCourse(courseId)
      .then((c) => {
        setCourse(c);
        const all = c.modules?.flatMap((m) => m.lessons) ?? [];
        setLesson(all.find((l) => l.id === lessonId) ?? null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [courseId, lessonId]);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading quiz…</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!lesson || !course) return <div className="p-8 text-center text-slate-400">Quiz not found.</div>;

  const quizzes: QuizItem[] = lesson.quizzes;
  const allLessons = course.modules?.flatMap((m) => m.lessons) ?? [];
  const currentIdx = allLessons.findIndex((l) => l.id === lessonId);
  const nextLesson = allLessons[currentIdx + 1] ?? null;

  if (quizzes.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white border border-slate-200 rounded-2xl text-center py-10 p-6">
          <p className="text-slate-500">No quiz questions for this lesson.</p>
          <Link href={`/course/${courseId}`} className="btn-secondary mt-4 inline-block">
            Back to Course
          </Link>
        </div>
      </div>
    );
  }

  const quizData = buildQuizData(lesson, quizzes);

  const handleComplete = async (result: QuizResult) => {
    setQuizResult(result);
    setDone(true);
    setSubmitting(true);

    try {
      const resp = await submitQuizAttempt(courseId, lessonId, {
        score: result.score,
        max_score: result.maxScore,
        percentage: result.percentage,
        passed: result.passed,
      });

      if (resp.badge_unlocked) {
        setUnlockedBadge(resp.badge_unlocked);
      }
    } catch (err: any) {
      console.error("Failed to save quiz attempt:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 pb-20">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href={`/course/${courseId}`} className="hover:text-indigo-600 truncate max-w-[200px]">
          {course.title}
        </Link>
        <span>›</span>
        <Link
          href={`/course/${courseId}/lesson/${lessonId}`}
          className="hover:text-indigo-600 truncate max-w-[200px]"
        >
          {lesson.title}
        </Link>
        <span>›</span>
        <span className="text-slate-800 font-semibold">Quiz</span>
      </div>

      {/* Badge Unlock Celebration Banner */}
      {unlockedBadge && (
        <div className="mb-6 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 text-white rounded-2xl p-6 shadow-lg animate-in zoom-in-95 duration-500">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
              <Trophy className="w-7 h-7 text-yellow-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-yellow-200">Achievement Unlocked!</span>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-bold">New Badge</span>
              </div>
              <h3 className="text-xl font-extrabold mt-0.5">{unlockedBadge.name}</h3>
              <p className="text-xs text-white/90 mt-1">{unlockedBadge.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* lmscn Quiz Component */}
      <Quiz
        quizData={quizData}
        onComplete={handleComplete}
        className="mb-6"
      />

      {/* Post-Quiz Actions */}
      {done && quizResult && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 mt-6 shadow-xs">
          <div className="text-center mb-6">
            <h4 className="text-lg font-bold text-slate-900 mb-1">What would you like to do next?</h4>
            <p className="text-xs text-slate-500">
              Your score has been saved to your progress history.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            {nextLesson ? (
              <Link
                href={`/course/${courseId}/lesson/${nextLesson.id}`}
                id="next-lesson-from-quiz"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 btn-primary px-6 py-3 rounded-xl font-semibold"
              >
                Next: {nextLesson.title} <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/dashboard"
                id="back-dashboard-from-quiz"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 btn-primary px-6 py-3 rounded-xl font-semibold"
              >
                🎉 Back to Dashboard
              </Link>
            )}

            <Link href={`/course/${courseId}/flashcards`} className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto border-indigo-200 text-indigo-700 hover:bg-indigo-50 px-5 py-3 rounded-xl">
                <Layers className="w-4 h-4 mr-1.5 text-indigo-600" />
                Practice Flashcards
              </Button>
            </Link>

            <Link
              href={`/course/${courseId}`}
              id="course-overview-from-quiz"
              className="w-full sm:w-auto"
            >
              <Button variant="ghost" className="w-full sm:w-auto text-slate-600 px-5 py-3 rounded-xl">
                Overview
              </Button>
            </Link>

            <button
              id="retry-quiz-btn"
              onClick={() => {
                setDone(false);
                setQuizResult(null);
                setUnlockedBadge(null);
              }}
              className="text-xs text-slate-500 hover:text-slate-800 underline py-2"
            >
              Retry Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
