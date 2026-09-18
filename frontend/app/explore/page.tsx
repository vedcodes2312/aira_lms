"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { exploreCourses, enrollInCourse, ExploreCourseItem } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Sparkles,
  BookOpen,
  Users,
  Layers,
  ArrowRight,
  CheckCircle2,
  Trophy,
  ExternalLink,
  Plus,
  Atom,
  Cpu,
  UserCircle,
  Filter,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";

const AVATAR_MAP: Record<string, string> = {
  "bot-1": "🤖",
  "scientist": "🔬",
  "developer": "💻",
  "quantum": "⚛️",
  "brain": "🧠",
  "spark": "✨",
};

export default function ExplorePage() {
  return (
    <ProtectedRoute>
      <CourseSearcher />
    </ProtectedRoute>
  );
}

function CourseSearcher() {
  const router = useRouter();
  const [courses, setCourses] = useState<ExploreCourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [enrollingId, setEnrollingId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, [selectedDomain, selectedDifficulty]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const data = await exploreCourses({
        search: searchQuery,
        domain: selectedDomain,
        difficulty: selectedDifficulty,
      });
      setCourses(data);
    } catch (err) {
      console.error("Failed to load explore courses", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCourses();
  };

  const handleEnroll = async (course: ExploreCourseItem) => {
    setEnrollingId(course.id);
    try {
      const res = await enrollInCourse(course.id);
      setToastMessage(res.message);
      // Update local state to mark as enrolled
      setCourses((prev) =>
        prev.map((c) =>
          c.id === course.id
            ? { ...c, is_enrolled: true, enrolled_count: c.enrolled_count + 1 }
            : c
        )
      );
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || "Failed to enroll in course.");
    } finally {
      setEnrollingId(null);
    }
  };

  // Real-time client search filter for smooth typing
  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return courses;
    const q = searchQuery.toLowerCase().trim();
    return courses.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.topic.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.domain.toLowerCase().includes(q) ||
        c.creator_username.toLowerCase().includes(q)
    );
  }, [courses, searchQuery]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-indigo-900/60 text-center">
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI-Generated Course Catalog</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Explore & Search Frontier Courses
          </h1>

          <p className="text-xs sm:text-sm text-slate-300">
            Search peer-generated AI & Quantum curriculums, discover topics synthesized by Gemini 2.0 Flash, and enroll to track your own progress from scratch.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="pt-2">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Search courses by topic, title, concept, or creator handle (@username)…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-white text-slate-900 text-xs sm:text-sm font-medium placeholder:text-slate-400 shadow-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500 border border-transparent"
              />
              <Button
                type="submit"
                className="absolute right-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl h-auto"
              >
                Search
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Filter Tabs & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        {/* Domain Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedDomain("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedDomain === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            All Domains ({courses.length})
          </button>
          <button
            onClick={() => setSelectedDomain("Artificial Intelligence")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              selectedDomain.includes("Artificial") || selectedDomain === "AI"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Artificial Intelligence
          </button>
          <button
            onClick={() => setSelectedDomain("Quantum")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              selectedDomain.includes("Quantum") || selectedDomain === "QC"
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Atom className="w-3.5 h-3.5" />
            Quantum Computing
          </button>
        </div>

        {/* Difficulty Dropdown & Generate CTA */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <Filter className="w-3.5 h-3.5" />
            <span>Difficulty:</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-hidden"
            >
              <option value="all">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <Link href="/generate">
            <Button size="sm" className="text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/80 shadow-2xs">
              <Plus className="w-3.5 h-3.5 mr-1" />
              Generate New Topic
            </Button>
          </Link>
        </div>
      </div>

      {/* Toast Banner */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-between text-xs font-semibold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <Link href="/dashboard" className="underline font-bold hover:text-emerald-950">
            View in Dashboard ➔
          </Link>
        </div>
      )}

      {/* Course Cards Grid */}
      {loading ? (
        <div className="p-16 text-center text-slate-500 space-y-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-medium">Searching course catalog…</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="p-12 sm:p-16 bg-white border border-dashed border-slate-200 rounded-3xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No matching courses found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No course on AIRA matches <span className="font-semibold text-slate-800">&quot;{searchQuery}&quot;</span>. You can generate a fresh, personalized syllabus with AI in 3 seconds!
          </p>
          <Link href={`/generate?topic=${encodeURIComponent(searchQuery)}`}>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Generate &quot;{searchQuery || "New Course"}&quot; with AI ➔
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((c) => {
            const avatar = AVATAR_MAP[c.creator_avatar] || "🤖";
            const isCompleted = c.progress_percentage === 100;

            return (
              <div
                key={c.id}
                className="bg-white border border-slate-200/90 hover:border-indigo-300 rounded-3xl p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Card Badges Header */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-700 border-slate-200">
                      {c.domain} • {c.topic}
                    </Badge>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                      <Sparkles className="w-3 h-3 text-indigo-500" />
                      Generated by AI
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-slate-900 text-base leading-snug mb-2 group-hover:text-indigo-600 transition-colors">
                    {c.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                    {c.description}
                  </p>
                </div>

                <div className="space-y-4 pt-3 border-t border-slate-100">
                  {/* Generator / Creator attribution */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{avatar}</span>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-medium">Prompted by</span>
                        <Link
                          href={`/u/${c.creator_username}`}
                          className="font-bold text-slate-800 hover:text-indigo-600 transition-colors flex items-center gap-0.5"
                        >
                          <span>@{c.creator_username}</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </Link>
                      </div>
                    </div>

                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                      {c.difficulty}
                    </span>
                  </div>

                  {/* Lessons & Learners Stats */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-indigo-500" />
                      {c.total_modules} Modules ({c.total_lessons} Lessons)
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {c.enrolled_count} {c.enrolled_count === 1 ? "Learner" : "Learners"}
                    </span>
                  </div>

                  {/* Enrollment / Progress Actions */}
                  {c.is_enrolled ? (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-slate-500">Your Progress</span>
                        <span className={isCompleted ? "text-emerald-600" : "text-indigo-600"}>
                          {c.progress_percentage}% {isCompleted && "✓ Completed"}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200/60">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isCompleted ? "bg-emerald-500" : "bg-indigo-600"
                          }`}
                          style={{ width: `${Math.max(c.progress_percentage, 0)}%` }}
                        />
                      </div>
                      <Link href={`/course/${c.id}`} className="block">
                        <Button className="w-full text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-8">
                          <span>Continue Learning</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="pt-1 flex items-center gap-2">
                      <Button
                        onClick={() => handleEnroll(c)}
                        disabled={enrollingId === c.id}
                        className="flex-1 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-8 shadow-xs"
                      >
                        {enrollingId === c.id ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />
                            <span>Enrolling…</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            <span>Enroll in Course</span>
                          </>
                        )}
                      </Button>
                      <Link href={`/course/${c.id}`}>
                        <Button variant="outline" size="sm" className="text-xs h-8 rounded-xl text-slate-700 hover:bg-slate-50">
                          Preview
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
