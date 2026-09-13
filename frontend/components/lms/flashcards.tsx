"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Flashcard } from "@/lib/api";
import {
  ChevronLeft,
  ChevronRight,
  RotateCw,
  CheckCircle2,
  BookmarkCheck,
  Sparkles,
  Layers,
  Award,
} from "lucide-react";

export interface FlashcardsProps {
  cards: Flashcard[];
  courseTitle?: string;
  className?: string;
  onFinish?: () => void;
}

export function FlashcardDeck({
  cards,
  courseTitle,
  className,
  onFinish,
}: FlashcardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());
  const [reviewIds, setReviewIds] = useState<Set<string>>(new Set());

  const total = cards.length;
  const currentCard = cards[currentIndex];

  const handleNext = useCallback(() => {
    if (currentIndex < total - 1) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, total]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const markMastered = () => {
    if (!currentCard) return;
    setMasteredIds((prev) => new Set(prev).add(currentCard.id));
    setReviewIds((prev) => {
      const next = new Set(prev);
      next.delete(currentCard.id);
      return next;
    });
    handleNext();
  };

  const markNeedReview = () => {
    if (!currentCard) return;
    setReviewIds((prev) => new Set(prev).add(currentCard.id));
    setMasteredIds((prev) => {
      const next = new Set(prev);
      next.delete(currentCard.id);
      return next;
    });
    handleNext();
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === " " || e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev]);

  if (total === 0) {
    return (
      <Card className={cn("text-center p-8", className)}>
        <CardContent className="pt-6">
          <Layers className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">No flashcards available for this section.</p>
        </CardContent>
      </Card>
    );
  }

  const progressPct = Math.round(((currentIndex + 1) / total) * 100);
  const isMastered = currentCard ? masteredIds.has(currentCard.id) : false;
  const isReview = currentCard ? reviewIds.has(currentCard.id) : false;

  return (
    <div className={cn("max-w-2xl mx-auto flex flex-col gap-5", className)}>
      {/* Deck Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 font-semibold border-indigo-200">
              <Sparkles className="w-3 h-3 mr-1" />
              Spaced Repetition
            </Badge>
            {courseTitle && (
              <span className="text-xs text-slate-500 font-medium truncate max-w-[240px]">
                {courseTitle}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Card {currentIndex + 1} of {total} • Click card or press Space to flip
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            ✓ {masteredIds.size} Mastered
          </span>
          <span className="text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            ↻ {reviewIds.size} Review
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <Progress value={progressPct} className="h-2 bg-slate-200" />

      {/* 3D Flip Card Container */}
      <div
        className="w-full h-80 sm:h-96 cursor-pointer select-none perspective-1000"
        onClick={handleFlip}
        id="flashcard-flip-container"
      >
        <div
          className={cn(
            "relative w-full h-full transition-transform duration-500 transform-style-3d shadow-md rounded-2xl",
            isFlipped && "rotate-y-180"
          )}
        >
          {/* Front of Card */}
          <Card className="absolute inset-0 w-full h-full backface-hidden bg-white border-2 border-indigo-100/90 rounded-2xl flex flex-col justify-between p-6 sm:p-8 hover:border-indigo-300 transition-colors">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs font-semibold text-indigo-700 border-indigo-200 bg-indigo-50/50">
                {currentCard?.category || "Concept"}
              </Badge>
              <span className="text-xs text-slate-400 font-medium truncate max-w-[180px]">
                {currentCard?.lesson_title}
              </span>
            </div>

            <div className="my-auto text-center px-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">Question / Concept</p>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                {currentCard?.front}
              </h3>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
              <span className="flex items-center gap-1 text-indigo-600 font-medium">
                <RotateCw className="w-3.5 h-3.5" /> Click to reveal breakdown
              </span>
              <span>Front</span>
            </div>
          </Card>

          {/* Back of Card */}
          <Card className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white border-2 border-indigo-600 rounded-2xl flex flex-col justify-between p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <Badge className="bg-indigo-500/30 text-indigo-200 border-indigo-400/30 text-xs">
                Explanation & Anchor
              </Badge>
              <span className="text-xs text-indigo-300/80 truncate max-w-[180px]">
                {currentCard?.lesson_title}
              </span>
            </div>

            <div className="my-auto text-center px-4 overflow-y-auto max-h-48 py-2 scrollbar-thin">
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300 mb-2">Core Takeaway</p>
              <p className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed">
                {currentCard?.back}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-indigo-300/70 pt-3 border-t border-indigo-700/50">
              <span className="flex items-center gap-1">
                <RotateCw className="w-3.5 h-3.5" /> Click to flip back
              </span>
              <span>Back</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Mastery & Navigation Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex-1 sm:flex-initial"
            id="prev-flashcard-btn"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={currentIndex === total - 1}
            className="flex-1 sm:flex-initial"
            id="next-flashcard-btn"
          >
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={markNeedReview}
            className={cn(
              "flex-1 sm:flex-initial text-amber-700 border-amber-300 hover:bg-amber-50",
              isReview && "bg-amber-100 font-bold border-amber-400"
            )}
            id="review-flashcard-btn"
          >
            <RotateCw className="w-3.5 h-3.5 mr-1" /> Review Later
          </Button>
          <Button
            size="sm"
            onClick={markMastered}
            className={cn(
              "flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white",
              isMastered && "bg-emerald-700 ring-2 ring-emerald-400"
            )}
            id="mastered-flashcard-btn"
          >
            <BookmarkCheck className="w-4 h-4 mr-1" /> Mastered
          </Button>
        </div>
      </div>

      {/* Completion summary banner if all reviewed */}
      {currentIndex === total - 1 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-center mt-2 animate-in fade-in">
          <Award className="w-6 h-6 text-indigo-600 mx-auto mb-1" />
          <p className="text-sm font-bold text-slate-800">You reached the end of this deck!</p>
          <p className="text-xs text-slate-600 mt-0.5">
            {masteredIds.size} cards mastered • {reviewIds.size} marked for review
          </p>
          {onFinish && (
            <Button size="sm" onClick={onFinish} className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white">
              Back to Course Overview
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
