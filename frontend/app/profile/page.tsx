"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getUserProfile,
  updateUserProfile,
  getUserFollowers,
  getUserFollowing,
  removeFollower,
  unfollowUser,
  followUser,
  UserProfileData,
  UserProfileUpdatePayload,
  FollowUserItem,
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
  Users,
  UserMinus,
  UserPlus,
  UserCheck,
  Search,
  Trash2,
} from "lucide-react";

const AVATAR_OPTIONS = [
  { id: "bot-1", emoji: "🤖", label: "Neural Bot" },
  { id: "scientist", emoji: "🔬", label: "Researcher" },
  { id: "developer", emoji: "💻", label: "Developer" },
  { id: "quantum", emoji: "⚛️", label: "Quantum" },
  { id: "brain", emoji: "🧠", label: "Cognitive" },
  { id: "spark", emoji: "✨", label: "Explorer" },
];

const AVATAR_MAP: Record<string, string> = {
  "bot-1": "🤖",
  "scientist": "🔬",
  "developer": "💻",
  "quantum": "⚛️",
  "brain": "🧠",
  "spark": "✨",
};

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

  // Social Connections State
  const [socialTab, setSocialTab] = useState<"followers" | "following">("followers");
  const [followers, setFollowers] = useState<FollowUserItem[]>([]);
  const [following, setFollowing] = useState<FollowUserItem[]>([]);
  const [socialLoading, setSocialLoading] = useState(false);
  const [socialSearch, setSocialSearch] = useState("");
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [actionUserId, setActionUserId] = useState<number | null>(null);

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

      // Load initial social connections
      loadSocialConnections(data.username);
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to load profile." });
    } finally {
      setLoading(false);
    }
  };

  const loadSocialConnections = async (uname: string) => {
    setSocialLoading(true);
    try {
      const [followersData, followingData] = await Promise.all([
        getUserFollowers(uname),
        getUserFollowing(uname),
      ]);
      setFollowers(followersData);
      setFollowing(followingData);
    } catch (err) {
      console.error("Failed to load connections", err);
    } finally {
      setSocialLoading(false);
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

  const handleRemoveFollower = async (follower: FollowUserItem) => {
    if (!confirm(`Are you sure you want to remove @${follower.username} from your followers?`)) {
      return;
    }
    setRemovingId(follower.id);
    try {
      const res = await removeFollower(follower.id);
      setFollowers((prev) => prev.filter((f) => f.id !== follower.id));
      if (profile) {
        setProfile({ ...profile, followers_count: res.followers_count });
      }
      setStatusMessage({ type: "success", text: `Removed @${follower.username} from your followers.` });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to remove follower.");
    } finally {
      setRemovingId(null);
    }
  };

  const handleUnfollowUser = async (userToUnfollow: FollowUserItem) => {
    setActionUserId(userToUnfollow.id);
    try {
      const res = await unfollowUser(userToUnfollow.username);
      setFollowing((prev) => prev.filter((f) => f.id !== userToUnfollow.id));
      if (profile) {
        setProfile({ ...profile, following_count: res.following_count });
      }
      setStatusMessage({ type: "success", text: `Unfollowed @${userToUnfollow.username}.` });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to unfollow user.");
    } finally {
      setActionUserId(null);
    }
  };

  const handleFollowBack = async (follower: FollowUserItem) => {
    setActionUserId(follower.id);
    try {
      if (follower.is_following) {
        await unfollowUser(follower.username);
        setFollowers((prev) =>
          prev.map((f) => (f.id === follower.id ? { ...f, is_following: false } : f))
        );
        setFollowing((prev) => prev.filter((f) => f.id !== follower.id));
      } else {
        await followUser(follower.username);
        setFollowers((prev) =>
          prev.map((f) => (f.id === follower.id ? { ...f, is_following: true } : f))
        );
        // Refresh following list
        if (profile) {
          const updatedFollowing = await getUserFollowing(profile.username);
          setFollowing(updatedFollowing);
        }
      }
    } catch (err: any) {
      alert(err.message || "Failed to update follow status.");
    } finally {
      setActionUserId(null);
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

  const activeSocialList = socialTab === "followers" ? followers : following;
  const filteredSocialList = activeSocialList.filter(
    (u) =>
      u.username.toLowerCase().includes(socialSearch.toLowerCase()) ||
      (u.full_name && u.full_name.toLowerCase().includes(socialSearch.toLowerCase())) ||
      (u.profession && u.profession.toLowerCase().includes(socialSearch.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-500">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium">Loading your profile preferences…</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-indigo-900/50 relative overflow-hidden">
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
            Manage your personal bio, AI learning persona calibration, social followers, and customize what others see on your public showcase.
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

      {/* KPI Stats Bar with Followers & Following */}
      {profile && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1 font-semibold">
              <span>Followers</span>
              <Users className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <div className="text-xl font-black text-indigo-600">{profile.followers_count}</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1 font-semibold">
              <span>Following</span>
              <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <div className="text-xl font-black text-slate-900">{profile.following_count}</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1 font-semibold">
              <span>Enrolled</span>
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <div className="text-xl font-black text-slate-900">{profile.total_courses}</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1 font-semibold">
              <span>Done (100%)</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-xl font-black text-slate-900">{profile.completed_courses}</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1 font-semibold">
              <span>Badges</span>
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="text-xl font-black text-slate-900">{profile.total_badges}</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1 font-semibold">
              <span>Certificates</span>
              <Award className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <div className="text-xl font-black text-slate-900">{profile.total_certificates}</div>
          </div>
        </div>
      )}

      {/* Status Banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
            statusMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
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

      {/* ── Social Network & Followers Manager ────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Connections & Follower Management</h2>
              <p className="text-xs text-slate-500">
                View learners who follow you, follow back, or remove/delete followers.
              </p>
            </div>
          </div>

          {/* Social Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => setSocialTab("followers")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                socialTab === "followers"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Followers ({followers.length})
            </button>
            <button
              type="button"
              onClick={() => setSocialTab("following")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                socialTab === "following"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Following ({following.length})
            </button>
          </div>
        </div>

        {/* Search in Connections */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder={`Filter ${socialTab} by name, handle (@username), or profession…`}
            value={socialSearch}
            onChange={(e) => setSocialSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Connections List */}
        <div className="space-y-3 pt-1">
          {socialLoading ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading connections…
            </div>
          ) : filteredSocialList.length === 0 ? (
            <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
              {socialSearch
                ? `No ${socialTab} found matching "${socialSearch}".`
                : socialTab === "followers"
                ? "You do not have any followers yet. Share your public profile link to grow your network!"
                : "You are not following any learners yet. Explore public profiles to connect with peers!"}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredSocialList.map((item) => {
                const uEmoji = AVATAR_MAP[item.avatar_url] || "🤖";
                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-200 bg-slate-50/50 hover:bg-white transition-all flex flex-col justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <Link
                        href={`/u/${item.username}`}
                        className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-2xl shrink-0 hover:scale-105 transition-transform"
                      >
                        {uEmoji}
                      </Link>

                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/u/${item.username}`}
                          className="font-bold text-xs text-slate-900 hover:text-indigo-600 transition-colors flex items-center gap-1.5"
                        >
                          <span className="truncate">{item.full_name || item.username}</span>
                          <span className="text-[11px] font-mono text-slate-400 font-normal">
                            @{item.username}
                          </span>
                        </Link>

                        {item.profession && (
                          <div className="text-[11px] font-medium text-slate-600 truncate mt-0.5">
                            {item.profession}
                          </div>
                        )}

                        {item.bio && (
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">
                            &ldquo;{item.bio}&rdquo;
                          </p>
                        )}

                        <div className="text-[10px] text-slate-400 mt-1">
                          Connected {new Date(item.followed_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <Link
                        href={`/u/${item.username}`}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                      >
                        <span>View Profile</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>

                      <div className="flex items-center gap-2">
                        {socialTab === "followers" ? (
                          <>
                            {/* Follow Back / Following Toggle */}
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleFollowBack(item)}
                              disabled={actionUserId === item.id}
                              className={`h-7 px-2.5 text-[11px] font-bold rounded-lg ${
                                item.is_following
                                  ? "bg-slate-100 text-slate-700 border-slate-200 hover:bg-red-50 hover:text-red-600"
                                  : "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                              }`}
                            >
                              {actionUserId === item.id ? (
                                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              ) : item.is_following ? (
                                "Following"
                              ) : (
                                "+ Follow Back"
                              )}
                            </Button>

                            {/* Delete / Remove Follower Button */}
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleRemoveFollower(item)}
                              disabled={removingId === item.id}
                              className="h-7 px-2.5 text-[11px] font-bold rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border-red-200 hover:border-red-300"
                              title="Delete this follower"
                            >
                              {removingId === item.id ? (
                                <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <>
                                  <UserMinus className="w-3.5 h-3.5 mr-1" />
                                  <span>Remove</span>
                                </>
                              )}
                            </Button>
                          </>
                        ) : (
                          /* Following Tab: Unfollow Button */
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleUnfollowUser(item)}
                            disabled={actionUserId === item.id}
                            className="h-7 px-2.5 text-[11px] font-bold rounded-lg bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 border-slate-200 hover:border-red-200"
                          >
                            {actionUserId === item.id ? (
                              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <>
                                <UserMinus className="w-3.5 h-3.5 mr-1 text-slate-500" />
                                <span>Unfollow</span>
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: Personal Details */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <UserCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Personal Identity & Avatar</h2>
              <p className="text-xs text-slate-500">Your display identity across AIRA LMS.</p>
            </div>
          </div>

          {/* Avatar Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Select Avatar Badge
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {AVATAR_OPTIONS.map((av) => {
                const selected = avatarUrl === av.id;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setAvatarUrl(av.id)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      selected
                        ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <span className="text-3xl">{av.emoji}</span>
                    <span className="text-[11px] font-bold text-slate-700">{av.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Display Name
              </label>
              <input
                type="text"
                placeholder="e.g. Dr. Priya Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Profession / Headline
              </label>
              <input
                type="text"
                placeholder="e.g. Senior Machine Learning Engineer"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Short Bio (Max 250 characters)
            </label>
            <textarea
              rows={2}
              maxLength={250}
              placeholder="Tell other learners about your background, current focus, and what you're building with AIRA…"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Section 2: AI Learning Persona Calibration */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">AI Tutor Persona Calibration</h2>
              <p className="text-xs text-slate-500">Fine-tune how Gemini 2.0 synthesizes curriculums and explains lessons.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Preferred Learning Domain
              </label>
              <select
                value={learningDomain}
                onChange={(e) => setLearningDomain(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
              >
                <option value="Artificial Intelligence">Artificial Intelligence (AI / ML)</option>
                <option value="Quantum Computing">Quantum Computing (Qiskit / QC)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Current Knowledge Level
              </label>
              <select
                value={knowledgeLevel}
                onChange={(e) => setKnowledgeLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
              >
                <option value="Beginner">Beginner (Foundational Intuition)</option>
                <option value="Intermediate">Intermediate (Practical Application)</option>
                <option value="Advanced">Advanced (Rigorous Mathematics & Research)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Teaching & Explanation Style
              </label>
              <select
                value={explanationStyle}
                onChange={(e) => setExplanationStyle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
              >
                <option value="Intuitive">Intuitive & Analogy-Driven</option>
                <option value="Technical">Technical & Mathematical Rigor</option>
                <option value="Code-First">Code-First & Hands-on Implementation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Languages className="w-3.5 h-3.5 text-indigo-600" />
                Default Course & Lesson Language
              </label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
              >
                <option value="English">English (Global)</option>
                <option value="Hinglish">Hinglish (Hindi + English conversational)</option>
                <option value="Hindi">हिन्दी (Hindi)</option>
                <option value="Tamil">தமிழ் (Tamil)</option>
                <option value="Telugu">తెలుగు (Telugu)</option>
                <option value="Marathi">मराठी (Marathi)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Primary Learning Goal
            </label>
            <input
              type="text"
              placeholder="e.g. Build end-to-end multi-agent LLM systems and deploy them to production"
              value={learningGoal}
              onChange={(e) => setLearningGoal(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Section 3: Public Profile Privacy Controls */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Public Showcase Privacy Toggles</h2>
              <p className="text-xs text-slate-500">Choose exactly what information is visible on your public link.</p>
            </div>
          </div>

          {/* Master Public Toggle */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-bold text-slate-900">Enable Public Learner Profile</span>
              </div>
              <p className="text-xs text-slate-500">
                When enabled, your profile can be viewed by anyone at{" "}
                <span className="font-mono text-indigo-600 font-semibold">/u/{profile?.username}</span>.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Granular Visibility Checkboxes */}
          <div className={`space-y-3 transition-opacity ${!isPublic ? "opacity-50 pointer-events-none" : ""}`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Granular Showcase Settings
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Real Name */}
              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200/80 hover:bg-slate-50/80 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={showRealName}
                  onChange={(e) => setShowRealName(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Show Real Name</span>
                  <span className="text-[11px] text-slate-500 block">
                    Displays your full name instead of just your username.
                  </span>
                </div>
              </label>

              {/* Interests & Persona */}
              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200/80 hover:bg-slate-50/80 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={showInterests}
                  onChange={(e) => setShowInterests(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Show Learning Persona</span>
                  <span className="text-[11px] text-slate-500 block">
                    Displays domain specialization, knowledge level, and learning style.
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
