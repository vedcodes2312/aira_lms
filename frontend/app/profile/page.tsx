"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getUserProfile,
  updateUserProfile,
  UserProfileData,
  UserProfileUpdatePayload,
} from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  UserCircle,
  Shield,
  Eye,
  EyeOff,
  Sparkles,
  BookOpen,
  Trophy,
  Award,
  Globe,
  ExternalLink,
  Copy,
  Check,
  Save,
  CheckCircle2,
  AlertCircle,
  Layers,
  GraduationCap,
  Sliders,
  Languages,
} from "lucide-react";

const AVATAR_OPTIONS = [
  { id: "bot-1", emoji: "🤖", label: "Neural Bot" },
  { id: "scientist", emoji: "🔬", label: "Researcher" },
  { id: "developer", emoji: "💻", label: "Developer" },
  { id: "quantum", emoji: "⚛️", label: "Quantum" },
  { id: "brain", emoji: "🧠", label: "Cognitive" },
  { id: "spark", emoji: "✨", label: "Explorer" },
];

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileEditor />
    </ProtectedRoute>
  );
}

function ProfileEditor() {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Form State
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("bot-1");
  const [profession, setProfession] = useState("");
  const [knowledgeLevel, setKnowledgeLevel] = useState("Beginner");
  const [learningDomain, setLearningDomain] = useState("AI");
  const [learningGoal, setLearningGoal] = useState("");
  const [explanationStyle, setExplanationStyle] = useState("Intuitive");
  const [preferredLanguage, setPreferredLanguage] = useState("English");

  // Privacy State
  const [isPublic, setIsPublic] = useState(true);
  const [showRealName, setShowRealName] = useState(true);
  const [showCourses, setShowCourses] = useState(true);
  const [showBadges, setShowBadges] = useState(true);
  const [showCertificates, setShowCertificates] = useState(true);
  const [showInterests, setShowInterests] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await getUserProfile();
      setProfile(data);
      setFullName(data.full_name || "");
      setBio(data.bio || "");
      setAvatarUrl(data.avatar_url || "bot-1");
      setProfession(data.profession || "");
      setKnowledgeLevel(data.knowledge_level || "Beginner");
      setLearningDomain(data.learning_domain || "AI");
      setLearningGoal(data.learning_goal || "");
      setExplanationStyle(data.explanation_style || "Intuitive");
      setPreferredLanguage(data.preferred_language || "English");

      setIsPublic(data.is_public);
      setShowRealName(data.show_real_name);
      setShowCourses(data.show_courses);
      setShowBadges(data.show_badges);
      setShowCertificates(data.show_certificates);
      setShowInterests(data.show_interests);
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to load profile." });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    const payload: UserProfileUpdatePayload = {
      full_name: fullName,
      bio: bio,
      avatar_url: avatarUrl,
      profession: profession,
      knowledge_level: knowledgeLevel,
      learning_domain: learningDomain,
      learning_goal: learningGoal,
      explanation_style: explanationStyle,
      preferred_language: preferredLanguage,
      is_public: isPublic,
      show_real_name: showRealName,
      show_courses: showCourses,
      show_badges: showBadges,
      show_certificates: showCertificates,
      show_interests: showInterests,
    };

    try {
      const updated = await updateUserProfile(payload);
      setProfile(updated);
      setStatusMessage({ type: "success", text: "Your profile and privacy settings have been updated!" });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to save profile changes." });
    } finally {
      setSaving(false);
    }
  };

  const publicProfileUrl = typeof window !== "undefined" && profile
    ? `${window.location.origin}/u/${profile.username}`
    : `/u/${profile?.username || ""}`;

  const copyPublicLink = () => {
    if (typeof window !== "undefined" && profile) {
      navigator.clipboard.writeText(publicProfileUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-500">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium">Loading your profile preferences…</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-indigo-900/50 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs mb-1 tracking-wide uppercase">
            <UserCircle className="w-4 h-4" /> Account & Profile Customizer
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
            <span>{fullName || profile?.username}</span>
            {isPublic ? (
              <Badge className="bg-emerald-500 text-white text-[10px] font-bold">
                🌐 Public Profile
              </Badge>
            ) : (
              <Badge variant="outline" className="border-slate-600 text-slate-300 text-[10px]">
                🔒 Private
              </Badge>
            )}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
            Manage your personal bio, AI learning persona calibration, and customize what others can see on your public showcase.
          </p>
        </div>

        {/* Action Link to Public Profile */}
        <div className="relative z-10 flex flex-wrap items-center gap-2 shrink-0">
          <Link
            href={`/u/${profile?.username}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md hover:scale-105"
          >
            <span>View Public Showcase</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={copyPublicLink}
            className="text-xs bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400 mr-1" />
                <span className="text-emerald-400 font-bold">Copied URL!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1" />
                <span>Share Link</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      {profile && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-semibold">
              <span>Courses Enrolled</span>
              <BookOpen className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{profile.total_courses}</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-semibold">
              <span>Completed (100%)</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{profile.completed_courses}</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-semibold">
              <span>Badges Earned</span>
              <Trophy className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-slate-900">{profile.total_badges}</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1 font-semibold">
              <span>Certificates</span>
              <Award className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{profile.total_certificates}</div>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl mb-6 flex items-center gap-2.5 text-xs font-semibold ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: Personal Details & Avatar */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <UserCircle className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Personal Information</h2>
          </div>

          {/* Avatar Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Choose Profile Avatar
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
              {AVATAR_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setAvatarUrl(opt.id)}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    avatarUrl === opt.id
                      ? "bg-indigo-50 border-indigo-600 ring-2 ring-indigo-300 shadow-xs scale-105"
                      : "bg-slate-50/70 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <span className="text-2xl">{opt.emoji}</span>
                  <span className="text-[11px] font-semibold text-slate-700">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name / Display Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="input text-xs"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Shown on certificates and public profile when enabled.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Username Handle
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">@</span>
                <input
                  type="text"
                  disabled
                  value={profile?.username || ""}
                  className="input pl-7 text-xs bg-slate-50 text-slate-500 font-mono cursor-not-allowed"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Public profile link: <code>/u/{profile?.username}</code>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Profession / Background
              </label>
              <input
                type="text"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                placeholder="e.g. Educator, Software Engineer, Doctor, Student"
                className="input text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Preferred Interface Language
              </label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="input text-xs"
              >
                <option value="English">English</option>
                <option value="Hinglish">Hinglish 🇮🇳</option>
                <option value="Hindi">Hindi (हिंदी)</option>
                <option value="Tamil">Tamil (தமிழ்)</option>
                <option value="Telugu">Telugu (తెలుగు)</option>
                <option value="Marathi">Marathi (मराठी)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Short Bio / Headline
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others what frontier technologies you are learning and your goals…"
              className="input text-xs resize-none"
            />
          </div>
        </div>

        {/* Section 2: AI Persona Preferences */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sliders className="w-5 h-5 text-purple-600" />
            <h2 className="text-base font-bold text-slate-900">AI Learning Persona & Pedagogy Calibration</h2>
          </div>

          <p className="text-xs text-slate-500 -mt-2">
            These parameters tune how the Gemini 2.0 Flash engine customizes lesson analogies, code snippets, and quizzes.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Primary Learning Domain
              </label>
              <select
                value={learningDomain}
                onChange={(e) => setLearningDomain(e.target.value)}
                className="input text-xs"
              >
                <option value="Artificial Intelligence">Artificial Intelligence (AI)</option>
                <option value="Quantum Computing">Quantum Computing (QC)</option>
                <option value="Both AI & Quantum">Both AI & Quantum Computing</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Knowledge Level
              </label>
              <select
                value={knowledgeLevel}
                onChange={(e) => setKnowledgeLevel(e.target.value)}
                className="input text-xs"
              >
                <option value="Beginner">Beginner (Foundations & Concept Intuition)</option>
                <option value="Intermediate">Intermediate (Practical Application & Code)</option>
                <option value="Advanced">Advanced (Mathematical Rigor & Architecture)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Learning Goal
              </label>
              <input
                type="text"
                value={learningGoal}
                onChange={(e) => setLearningGoal(e.target.value)}
                placeholder="e.g. Master Neural Networks, Build Quantum Circuits"
                className="input text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Explanation Style
              </label>
              <select
                value={explanationStyle}
                onChange={(e) => setExplanationStyle(e.target.value)}
                className="input text-xs"
              >
                <option value="Intuitive">Intuitive (Metaphors & Mental Models)</option>
                <option value="Code-Heavy">Code-Heavy (Production Snippets & PyTorch)</option>
                <option value="Mathematical">Mathematical (Formulas, Proofs & Mechanics)</option>
                <option value="Case-Study Driven">Case-Study Driven (Industry Examples)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Public Profile Showcase & Privacy Controls */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-600" />
              <div>
                <h2 className="text-base font-bold text-slate-900">Public Profile & Showcase Privacy</h2>
                <p className="text-xs text-slate-500">
                  Control what is visible when someone visits your public URL: <span className="font-mono text-indigo-600">/u/{profile?.username}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Master Public Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-indigo-600" /> Enable Public Profile
              </span>
              <p className="text-[11px] text-indigo-700">
                Allow anyone with your link to view your verified credentials and learning showcase.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-indigo-600" />
            </label>
          </div>

          {/* Granular Privacy Checkboxes */}
          <div className={`space-y-3 pt-2 ${!isPublic ? "opacity-50 pointer-events-none" : ""}`}>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Choose What to Display on Your Public Showcase:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Show Real Name */}
              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200/80 hover:bg-slate-50/80 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={showRealName}
                  onChange={(e) => setShowRealName(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Show Real Full Name</span>
                  <span className="text-[11px] text-slate-500 block">
                    Displays &quot;{fullName || "Full Name"}&quot; instead of only username.
                  </span>
                </div>
              </label>

              {/* Show Learning Interests */}
              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200/80 hover:bg-slate-50/80 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={showInterests}
                  onChange={(e) => setShowInterests(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Show Learning Interests</span>
                  <span className="text-[11px] text-slate-500 block">
                    Displays your domain specialization, knowledge level, and learning goals.
                  </span>
                </div>
              </label>

              {/* Show Courses */}
              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200/80 hover:bg-slate-50/80 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={showCourses}
                  onChange={(e) => setShowCourses(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Show Enrolled Courses</span>
                  <span className="text-[11px] text-slate-500 block">
                    Displays courses you have generated along with completion progress.
                  </span>
                </div>
              </label>

              {/* Show Badges */}
              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200/80 hover:bg-slate-50/80 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={showBadges}
                  onChange={(e) => setShowBadges(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Show Earned Badges</span>
                  <span className="text-[11px] text-slate-500 block">
                    Displays honorary badges earned from passing quizzes (≥ 80%).
                  </span>
                </div>
              </label>

              {/* Show Certificates */}
              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200/80 hover:bg-slate-50/80 cursor-pointer transition-colors sm:col-span-2">
                <input
                  type="checkbox"
                  checked={showCertificates}
                  onChange={(e) => setShowCertificates(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Show Verified Certifications</span>
                  <span className="text-[11px] text-slate-500 block">
                    Displays 100% completion certificates with links to cryptographic verification.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-200">
          <div className="text-xs text-slate-500">
            Changes take effect immediately across AIRA and your public showcase.
          </div>
          <Button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving Changes…</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
