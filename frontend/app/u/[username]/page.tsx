"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getPublicProfile, PublicProfileData } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  UserCircle,
  ShieldCheck,
  Trophy,
  Award,
  BookOpen,
  Sparkles,
  Lock,
  ExternalLink,
  Copy,
  Check,
  Calendar,
  Layers,
  GraduationCap,
  Sliders,
  CheckCircle2,
  ArrowRight,
  Share2,
} from "lucide-react";

const AVATAR_MAP: Record<string, string> = {
  "bot-1": "🤖",
  "scientist": "🔬",
  "developer": "💻",
  "quantum": "⚛️",
  "brain": "🧠",
  "spark": "✨",
};

export default function PublicProfilePage() {
  const params = useParams();
  const username = params?.username as string;
  const router = useRouter();

  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (username) {
      loadProfile(username);
    }
  }, [username]);

  const loadProfile = async (uname: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPublicProfile(uname);
      setProfile(data);
    } catch (err: any) {
      setError(err.message || "User not found or profile unavailable.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-slate-500">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold">Loading learner showcase…</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-xl mx-auto my-16 px-4 text-center">
        <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
            <UserCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Profile Not Found</h2>
          <p className="text-sm text-slate-500 mb-6">
            The learner profile for <span className="font-mono text-indigo-600 font-bold">@{username}</span> does not exist or has been removed.
          </p>
          <Link href="/">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs">
              Return to Homepage
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Handle Private Profile
  if (!profile.is_public) {
    return (
      <div className="max-w-xl mx-auto my-16 px-4 text-center">
        <div className="p-8 sm:p-10 bg-white border border-slate-200 rounded-3xl shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-4 border border-slate-200">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-1">
            @{profile.username}
          </h2>
          <Badge variant="outline" className="mb-4 text-xs border-slate-300 text-slate-600">
            🔒 Private Profile
          </Badge>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
            This learner has configured their AIRA profile to be private. Their enrolled courses, badges, and learning history are hidden.
          </p>
          <Link href="/">
            <Button className="bg-slate-900 hover:bg-slate-800 text-white text-xs">
              Explore AIRA LMS
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const avatarEmoji = AVATAR_MAP[profile.avatar_url] || "🤖";
  const memberDate = profile.member_since
    ? new Date(profile.member_since).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "2026";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Hero Profile Card */}
      <div className="relative overflow-hidden bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-indigo-900/60">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-4xl sm:text-5xl shadow-inner shrink-0">
              {avatarEmoji}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {profile.display_name || profile.username}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  @{profile.username}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Learner
                </span>
              </div>

              {profile.profession && (
                <div className="text-sm font-semibold text-indigo-300 mb-2">
                  {profile.profession}
                </div>
              )}

              {profile.bio && (
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed mb-3">
                  &ldquo;{profile.bio}&rdquo;
                </p>
              )}

              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Member since {memberDate}
                </span>
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> AIRA Frontier Scholar
                </span>
              </div>
            </div>
          </div>

          {/* Share Profile Button */}
          <div className="shrink-0 flex items-center gap-2">
            <Button
              onClick={handleCopyLink}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Copied Profile Link!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Share Profile</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Stats Row in Hero */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-white/10 text-center">
          <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
            <div className="text-xl sm:text-2xl font-black text-white">{profile.total_courses}</div>
            <div className="text-[11px] font-medium text-slate-400">Courses Enrolled</div>
          </div>

          <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
            <div className="text-xl sm:text-2xl font-black text-emerald-400">{profile.completed_courses}</div>
            <div className="text-[11px] font-medium text-slate-400">Completed (100%)</div>
          </div>

          <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
            <div className="text-xl sm:text-2xl font-black text-amber-400">{profile.total_badges}</div>
            <div className="text-[11px] font-medium text-slate-400">Honorary Badges</div>
          </div>

          <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
            <div className="text-xl sm:text-2xl font-black text-purple-400">{profile.total_certificates}</div>
            <div className="text-[11px] font-medium text-slate-400">Certificates Issued</div>
          </div>
        </div>
      </div>

      {/* Section 1: Learning Specialization & Persona (if enabled) */}
      {profile.show_interests && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs">
          <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
            <Sliders className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Learning Specialization & Cognitive Persona</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/80">
              <span className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider block mb-1">
                Domain Specialization
              </span>
              <span className="text-sm font-bold text-slate-900 block">
                {profile.learning_domain || "Artificial Intelligence"}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100/80">
              <span className="text-[10px] uppercase font-bold text-purple-700 tracking-wider block mb-1">
                Proficiency Level
              </span>
              <span className="text-sm font-bold text-slate-900 block">
                {profile.knowledge_level || "Beginner"}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/80">
              <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider block mb-1">
                Explanation Style
              </span>
              <span className="text-sm font-bold text-slate-900 block">
                {profile.explanation_style || "Intuitive"}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100/80">
              <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider block mb-1">
                Primary Goal
              </span>
              <span className="text-sm font-bold text-slate-900 block truncate" title={profile.learning_goal || "Deep-Tech Upskilling"}>
                {profile.learning_goal || "Deep-Tech Upskilling"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Verified Certifications Showcase (if enabled) */}
      {profile.show_certificates && profile.certificates && profile.certificates.length > 0 && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600" />
              <h2 className="text-base font-bold text-slate-900">Verified Certificates of Completion</h2>
            </div>
            <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
              {profile.certificates.length} Verifiable Credentials
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profile.certificates.map((cert) => (
              <div
                key={cert.cert_uuid}
                className="p-5 rounded-2xl bg-linear-to-br from-amber-50/40 via-white to-purple-50/40 border border-amber-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono font-bold bg-slate-900 text-amber-300 px-2 py-0.5 rounded-md">
                      {cert.cert_uuid}
                    </span>
                    <Badge className="bg-emerald-600 text-white text-[10px] font-bold">
                      {cert.score_percentage}% Score
                    </Badge>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mb-1 leading-snug">
                    {cert.course_title}
                  </h3>

                  {cert.badge_name && (
                    <div className="text-xs font-semibold text-amber-700 flex items-center gap-1 mb-3">
                      <Trophy className="w-3.5 h-3.5 text-amber-500" />
                      <span>{cert.badge_name}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Issued: {new Date(cert.issued_at).toLocaleDateString()}
                  </span>
                  <Link
                    href={cert.verification_url}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    <span>View Certificate</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 3: Earned Badges Showcase (if enabled) */}
      {profile.show_badges && profile.badges && profile.badges.length > 0 && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-bold text-slate-900">Honorary Badges & Achievements</h2>
            </div>
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              {profile.badges.length} Badges
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {profile.badges.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-2xl bg-amber-50/30 border border-amber-100 hover:border-amber-300 transition-all flex items-start gap-3.5"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs text-lg">
                  🏆
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 text-xs mb-0.5 truncate">{b.name}</h3>
                  <Badge variant="outline" className="text-[9px] mb-1.5 border-amber-200 text-amber-800 bg-amber-50">
                    {b.domain}
                  </Badge>
                  <p className="text-[11px] text-slate-600 leading-tight line-clamp-2">{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 4: Enrolled & Completed Courses (if enabled) */}
      {profile.show_courses && profile.courses && profile.courses.length > 0 && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Courses & Learning Roadmap</h2>
            </div>
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
              {profile.courses.length} Courses
            </span>
          </div>

          <div className="space-y-3">
            {profile.courses.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-700 border-slate-200">
                      {c.domain} • {c.topic}
                    </Badge>
                    {c.progress_percentage === 100 && (
                      <Badge className="bg-emerald-600 text-white text-[10px] font-bold">
                        ✓ Completed
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{c.title}</h3>
                  <span className="text-xs text-slate-500">
                    {c.completed_lessons} of {c.total_lessons} lessons completed
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full sm:w-48 space-y-1 shrink-0">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-500 text-[11px]">Progress</span>
                    <span className={c.progress_percentage === 100 ? "text-emerald-600" : "text-indigo-600"}>
                      {c.progress_percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/80">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        c.progress_percentage === 100 ? "bg-emerald-500" : "bg-indigo-600"
                      }`}
                      style={{ width: `${Math.max(c.progress_percentage, 0)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom CTA */}
      <div className="p-8 rounded-3xl bg-linear-to-r from-indigo-900 to-slate-900 text-white text-center shadow-lg border border-indigo-800">
        <h3 className="text-xl font-bold mb-2">Inspired by {profile.display_name || profile.username}&apos;s Learning Journey?</h3>
        <p className="text-xs sm:text-sm text-indigo-200 max-w-xl mx-auto mb-6">
          AIRA synthesizes real-time personalized AI & Quantum curriculums tailored to your exact profession, learning speed, and goals.
        </p>
        <Link href="/signup">
          <Button className="bg-white hover:bg-slate-100 text-indigo-950 font-black px-6 py-2.5 rounded-xl text-xs shadow-md">
            Start Learning for Free ➔
          </Button>
        </Link>
      </div>
    </div>
  );
}
