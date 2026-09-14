"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { listCourses, getMyBadges, Course, Badge as BadgeType } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles,
  Trophy,
  Award,
  Layers,
  ArrowRight,
  BookOpen,
  Plus,
  CheckCircle2,
  GraduationCap,
  Atom,
  Cpu,
} from "lucide-react";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}

function Dashboard() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([listCourses(), getMyBadges()])
      .then(([c, b]) => {
        setCourses(c);
        setBadges(b);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 pb-24">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Learning Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track your course progress, spaced repetition decks, and mastery badges.
          </p>
        </div>
        <button
          id="new-course-btn"
          onClick={() => router.push("/generate")}
          className="inline-flex items-center gap-2 btn-primary px-5 py-2.5 rounded-xl font-semibold shadow-sm"
        >
          <Plus className="w-4 h-4" /> Generate New Course
        </button>
      </div>

      {loading && <p className="text-slate-500 text-sm py-12 text-center">Loading your learning space…</p>}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      {!loading && (
        <div className="space-y-10">
          {/* Achievements & Badges Showcase */}
          <section className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Trophy className="w-4 h-4" />
                </div>
                <h2 className="font-bold text-slate-900 text-base">
                  Badges & Achievements ({badges.length})
                </h2>
              </div>
              <span className="text-xs text-slate-500">
                Awarded for ≥80% score across all lesson quizzes
              </span>
            </div>

            {badges.length === 0 ? (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-6 text-center">
                <Award className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No badges earned yet</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete all lesson quizzes with a score of 80% or higher in any course to unlock your first badge!
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                {badges.map((b) => (
                  <div
                    key={b.id}
                    className="bg-gradient-to-br from-amber-50/70 to-yellow-50/50 border border-amber-200/90 rounded-xl p-4 flex items-start gap-3 shadow-xs hover:border-amber-300 transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center shrink-0 shadow-xs">
                      {b.domain === "QC" ? <Atom className="w-5 h-5" /> : <Trophy className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Badge variant="outline" className="text-[10px] font-bold bg-white text-amber-800 border-amber-300 py-0">
                          {b.domain}
                        </Badge>
                        <span className="text-[10px] text-slate-600 font-medium">
                          {new Date(b.earned_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm truncate">{b.name}</h4>
                      <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{b.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Courses List */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                Your Courses ({courses.length})
              </h2>
            </div>

            {courses.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl text-center py-16 p-6">
                <GraduationCap className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-800 mb-1">No courses yet</h3>
                <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
                  Pick a topic from AI or Quantum Computing to generate your first AI-tailored course.
                </p>
                <button
                  id="get-started-btn"
                  onClick={() => router.push("/generate")}
                  className="btn-primary px-6 py-3 rounded-xl font-semibold"
                >
                  Generate First Course
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-5">
                {courses.map((course) => {
                  const progressPct = course.progress_percentage ?? 0;
                  const completedCount = course.completed_lessons ?? 0;
                  const totalCount = course.total_lessons ?? 0;

                  return (
                    <div
                      key={course.id}
                      className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all flex flex-col justify-between"
                      id={`course-card-${course.id}`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200/80">
                            {course.domain} • {course.topic}
                          </span>
                          {course.badge && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                              <Trophy className="w-3 h-3 text-amber-600" /> {course.badge.name}
                            </span>
                          )}
                        </div>

                        <Link href={`/course/${course.id}`}>
                          <h3 className="font-bold text-slate-900 text-lg hover:text-indigo-600 transition-colors line-clamp-1 mb-2">
                            {course.title}
                          </h3>
                        </Link>
                        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mb-5">
                          {course.description}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-slate-100">
                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                            <span className="text-slate-600">Progress</span>
                            <span className="text-indigo-700">
                              {completedCount}/{totalCount} lessons ({progressPct}%)
                            </span>
                          </div>
                          <Progress value={progressPct} className="h-2 bg-slate-100" />
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center justify-between gap-2">
                          <Link href={`/course/${course.id}/flashcards`}>
                            <Button variant="outline" size="sm" className="text-xs text-slate-600 hover:text-indigo-600">
                              <Layers className="w-3.5 h-3.5 mr-1" /> Flashcards
                            </Button>
                          </Link>

                          <div className="flex items-center gap-2">
                            {progressPct === 100 && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={async () => {
                                  try {
                                    const { getCourseCertificate } = await import("@/lib/api");
                                    const cert = await getCourseCertificate(course.id);
                                    router.push(`/certificate/${cert.cert_uuid}`);
                                  } catch (e: any) {
                                    alert(e?.message || "Failed to load certificate");
                                  }
                                }}
                                className="text-xs border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 font-semibold"
                              >
                                <Award className="w-3.5 h-3.5 mr-1 text-amber-600" /> Certificate
                              </Button>
                            )}
                            <Link href={`/course/${course.id}`}>
                              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold">
                                {progressPct === 100 ? "Review" : "Continue"} <ArrowRight className="w-3.5 h-3.5 ml-1" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
