"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getCourse, Course } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Circle,
  Trophy,
  Award,
  Layers,
  Sparkles,
  ArrowRight,
  BookOpen,
  ArrowLeft,
  GraduationCap,
} from "lucide-react";

export default function CourseOverviewPage() {
  return (
    <ProtectedRoute>
      <CourseOverview />
    </ProtectedRoute>
  );
}

function CourseOverview() {
  const params = useParams();
  const router = useRouter();
  const courseId = Number(params.id);

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getCourse(courseId)
      .then(setCourse)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [courseId]);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading course…</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!course) return null;

  const allLessons = course.modules?.flatMap((m) => m.lessons) ?? [];
  const firstUnfinished = allLessons.find((l) => !l.is_completed) || allLessons[0];
  const progressPct = course.progress_percentage ?? 0;
  const completedCount = course.completed_lessons ?? 0;
  const totalCount = course.total_lessons ?? allLessons.length;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-20">
      {/* Back to Dashboard */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          id="back-to-dashboard"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <Link href={`/course/${courseId}/flashcards`}>
          <Button variant="outline" size="sm" className="bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50">
            <Layers className="w-4 h-4 mr-1.5 text-indigo-600" />
            Practice Flashcards
          </Button>
        </Link>
      </div>

      {/* Header Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 mb-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200/80">
            {course.domain} • {course.topic}
          </span>
          {course.difficulty && (
            <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
              Level: {course.difficulty}
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
          {course.title}
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
          {course.description}
        </p>

        {/* Progress Bar & Stats */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs sm:text-sm font-semibold mb-2">
            <span className="text-slate-700 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              Course Progress
            </span>
            <span className="text-indigo-700">
              {completedCount} of {totalCount} lessons completed ({progressPct}%)
            </span>
          </div>
          <Progress value={progressPct} className="h-2.5 bg-slate-200" />
        </div>

        {/* Badge Alert Banner */}
        {course.badge ? (
          <div className="mt-4 bg-gradient-to-r from-amber-500/10 via-amber-400/15 to-yellow-500/10 border border-amber-300 rounded-xl p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Badge Earned!</span>
                <Badge className="bg-amber-600 text-white text-xs">{course.badge.name}</Badge>
              </div>
              <p className="text-xs text-amber-900 mt-0.5">{course.badge.description}</p>
            </div>
          </div>
        ) : (
          <div className="mt-4 bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center gap-2">
              <Award className="w-4 h-4 text-slate-400" />
              Course Badge unlocks when scoring <strong className="text-slate-800">≥ 80%</strong> on all quizzes
            </span>
            <span className="text-slate-400 font-medium">Locked</span>
          </div>
        )}

        {/* Certificate Banner when 100% Complete */}
        {progressPct === 100 && (
          <div className="mt-4 bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 border border-indigo-500/40 rounded-xl p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-indigo-500/10 animate-in fade-in duration-500">
            <div className="flex items-center gap-3.5 text-left">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Official Certification</span>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-[10px]">Verified</Badge>
                </div>
                <h3 className="text-base font-bold text-white">Your Certificate of Completion is Ready!</h3>
                <p className="text-xs text-slate-300 mt-0.5">Publish your verified credential directly to your LinkedIn Profile.</p>
              </div>
            </div>

            <Button
              onClick={async () => {
                try {
                  const { getCourseCertificate } = await import("@/lib/api");
                  const cert = await getCourseCertificate(courseId);
                  router.push(`/certificate/${cert.cert_uuid}`);
                } catch (e: any) {
                  alert(e?.message || "Failed to load certificate");
                }
              }}
              className="w-full sm:w-auto bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl shadow-md transition-all hover:scale-105 shrink-0 text-xs"
            >
              <Award className="w-4 h-4 mr-1.5" />
              View Certificate & LinkedIn Badge
            </Button>
          </div>
        )}

        {/* Start / Continue CTA */}
        {firstUnfinished ? (
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/course/${courseId}/lesson/${firstUnfinished.id}`}
              id="start-learning-btn"
              className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl"
            >
              {completedCount === 0 ? "Start Learning" : "Continue Course"}
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link href={`/course/${courseId}/flashcards`}>
              <Button variant="outline" className="px-5 py-3 rounded-xl text-slate-700">
                <Layers className="w-4 h-4 mr-1.5 text-indigo-600" /> Practice Flashcards
              </Button>
            </Link>
          </div>
        ) : (
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              onClick={async () => {
                try {
                  const { getCourseCertificate } = await import("@/lib/api");
                  const cert = await getCourseCertificate(courseId);
                  router.push(`/certificate/${cert.cert_uuid}`);
                } catch (e: any) {
                  alert(e?.message || "Failed to load certificate");
                }
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl text-sm"
            >
              <Award className="w-4 h-4 mr-2 text-amber-300" />
              Open Certificate
            </Button>
            <Link href={`/course/${courseId}/flashcards`}>
              <Button variant="outline" className="px-5 py-3 rounded-xl text-slate-700">
                <Layers className="w-4 h-4 mr-1.5 text-indigo-600" /> Practice Flashcards
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Module/Lesson tree */}
      <div className="space-y-4">
        {course.modules?.map((mod) => (
          <div key={mod.id} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center justify-center">
                  M{mod.order}
                </span>
                {mod.title}
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                {mod.lessons.filter((l) => l.is_completed).length} / {mod.lessons.length} Done
              </span>
            </div>

            <div className="space-y-2.5">
              {mod.lessons.map((les) => (
                <div
                  key={les.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-slate-50/70 transition-all group"
                >
                  <Link
                    href={`/course/${courseId}/lesson/${les.id}`}
                    id={`lesson-link-${les.id}`}
                    className="flex items-center gap-3 flex-1"
                  >
                    {les.is_completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 shrink-0 group-hover:text-indigo-500 transition-colors" />
                    )}
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                        {les.order}. {les.title}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                        <span>{les.quizzes.length} Quiz Questions</span>
                        {les.best_quiz_score !== null && les.best_quiz_score !== undefined && (
                          <span className={`font-semibold ${les.best_quiz_score >= 80 ? "text-emerald-700" : "text-amber-700"}`}>
                            • Best Score: {les.best_quiz_score}%
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Link href={`/course/${courseId}/quiz/${les.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
                      >
                        Quiz
                      </Button>
                    </Link>
                    <Link href={`/course/${courseId}/lesson/${les.id}`}>
                      <Button
                        size="sm"
                        className={`text-xs font-semibold ${
                          les.is_completed
                            ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            : "bg-indigo-600 text-white hover:bg-indigo-700"
                        }`}
                      >
                        {les.is_completed ? "Review" : "Read"} →
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
