"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getCourse, getCourseFlashcards, Course, Flashcard } from "@/lib/api";
import { FlashcardDeck } from "@/components/lms/flashcards";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, BookOpen, Layers } from "lucide-react";

export default function CourseFlashcardsPage() {
  return (
    <ProtectedRoute>
      <CourseFlashcardsView />
    </ProtectedRoute>
  );
}

function CourseFlashcardsView() {
  const params = useParams();
  const router = useRouter();
  const courseId = Number(params.id);

  const [course, setCourse] = useState<Course | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      getCourse(courseId),
      getCourseFlashcards(courseId, selectedLessonId ?? undefined),
    ])
      .then(([c, fc]) => {
        setCourse(c);
        setCards(fc);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [courseId, selectedLessonId]);

  const allLessons = course?.modules?.flatMap((m) => m.lessons) ?? [];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-20">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/dashboard" className="hover:text-indigo-600">
            Dashboard
          </Link>
          <span>›</span>
          <Link href={`/course/${courseId}`} className="hover:text-indigo-600 truncate max-w-[200px]">
            {course?.title || "Course"}
          </Link>
          <span>›</span>
          <span className="text-slate-800 font-semibold">Flashcards</span>
        </div>

        <Link href={`/course/${courseId}`}>
          <Button variant="outline" size="sm" className="text-slate-600">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Course
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 mb-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Active Recall & Spaced Repetition
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {course?.title} Flashcards
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Reinforce core terminology, mechanics, and key takeaways through interactive review.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-3 py-1 text-sm font-semibold bg-slate-50">
              <Layers className="w-4 h-4 mr-1.5 text-indigo-600" />
              {cards.length} Cards in Deck
            </Badge>
          </div>
        </div>

        {/* Lesson Filter Tabs */}
        {allLessons.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pt-5 mt-5 border-t border-slate-100 scrollbar-none">
            <button
              onClick={() => setSelectedLessonId(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                selectedLessonId === null
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Lessons ({cards.length})
            </button>
            {allLessons.map((l) => (
              <button
                key={l.id}
                onClick={() => setSelectedLessonId(l.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedLessonId === l.id
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {l.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-500">Loading flashcards deck…</div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center">{error}</div>
      ) : (
        <FlashcardDeck
          key={`${selectedLessonId}-${cards.length}`}
          cards={cards}
          courseTitle={course?.title}
          onFinish={() => router.push(`/course/${courseId}`)}
        />
      )}
    </div>
  );
}
