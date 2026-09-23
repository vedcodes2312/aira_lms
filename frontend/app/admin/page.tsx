"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getMe,
  getAdminStats,
  getAdminCourses,
  deleteAdminCourse,
  getAdminUsers,
  deleteAdminUser,
  getAdminDbTables,
  getAdminTableData,
  AdminStats,
  AdminCourse,
  AdminUser,
  DbTableSummary,
  DbTableData,
} from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  Users,
  BookOpen,
  Trophy,
  Database,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Search,
  CheckCircle2,
  Layers,
  GraduationCap,
  Sparkles,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Copy,
  Check,
  X,
  FileText,
  UserPlus,
} from "lucide-react";

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <AdminPanel />
    </ProtectedRoute>
  );
}

function AdminPanel() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<"courses" | "users" | "database">("courses");

  // Stats
  const [stats, setStats] = useState<AdminStats | null>(null);

  // Courses
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [courseSearch, setCourseSearch] = useState("");
  const [deletingCourseId, setDeletingCourseId] = useState<number | null>(null);

  // Users
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);

  // Database Explorer
  const [tables, setTables] = useState<DbTableSummary[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>("courses");
  const [tableData, setTableData] = useState<DbTableData | null>(null);
  const [loadingTable, setLoadingTable] = useState(false);
  const [cellModal, setCellModal] = useState<{
    tableName: string;
    column: string;
    value: string;
    isJson: boolean;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const tryFormatJson = (val: string) => {
    if (!val) return null;
    const trimmed = val.trim();
    if (!((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]")))) {
      return null;
    }
    try {
      const parsed = JSON.parse(val);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return null;
    }
  };

  // Verify Admin Access
  useEffect(() => {
    getMe()
      .then((user) => {
        if (!user.is_admin) {
          setIsAdmin(false);
          setLoading(false);
        } else {
          setIsAdmin(true);
          loadAdminData();
        }
      })
      .catch(() => {
        setIsAdmin(false);
        setLoading(false);
      });
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [s, c, u, t] = await Promise.all([
        getAdminStats(),
        getAdminCourses(),
        getAdminUsers(),
        getAdminDbTables(),
      ]);
      setStats(s);
      setCourses(c);
      setUsers(u);
      setTables(t);
      if (t.length > 0) {
        const initialT = t.some((item) => item.table_name === selectedTable) ? selectedTable : t[0].table_name;
        loadTable(initialT);
      }
    } catch (e: any) {
      setActionMessage({ type: "error", text: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const [s, c, u, t] = await Promise.all([
        getAdminStats(),
        getAdminCourses(),
        getAdminUsers(),
        getAdminDbTables(),
      ]);
      setStats(s);
      setCourses(c);
      setUsers(u);
      setTables(t);
      if (selectedTable) {
        await loadTable(selectedTable);
      }
      setActionMessage({ type: "success", text: "Admin data & database tables refreshed successfully." });
      setTimeout(() => setActionMessage(null), 3000);
    } catch (e: any) {
      setActionMessage({ type: "error", text: e.message || "Failed to refresh" });
    } finally {
      setRefreshing(false);
    }
  };

  const handleTabSwitch = async (tab: "courses" | "users" | "database") => {
    setActiveTab(tab);
    if (tab === "database") {
      try {
        const t = await getAdminDbTables();
        setTables(t);
        const activeT = t.some((item) => item.table_name === selectedTable) ? selectedTable : (t[0]?.table_name || "courses");
        loadTable(activeT);
      } catch (err) {
        console.error(err);
      }
    } else if (tab === "courses") {
      getAdminCourses().then(setCourses).catch(console.error);
    } else if (tab === "users") {
      getAdminUsers().then(setUsers).catch(console.error);
    }
  };

  const loadTable = async (tableName: string) => {
    setSelectedTable(tableName);
    setLoadingTable(true);
    try {
      const data = await getAdminTableData(tableName);
      setTableData(data);
      // Also update row count in tables pill list
      setTables((prev) =>
        prev.map((t) => (t.table_name === tableName ? { ...t, row_count: data.total_returned } : t))
      );
    } catch (e: any) {
      setActionMessage({ type: "error", text: `Failed to load table: ${e.message}` });
    } finally {
      setLoadingTable(false);
    }
  };

  const handleDeleteCourse = async (course: AdminCourse) => {
    const confirm = window.confirm(
      `Are you sure you want to permanently delete the course "${course.title}" created by ${course.username}?\n\nThis will delete all its modules, lessons, quizzes, attempts, badges, and enrollments.`
    );
    if (!confirm) return;

    setDeletingCourseId(course.id);
    try {
      const res = await deleteAdminCourse(course.id);
      setActionMessage({ type: "success", text: res.message });
      // Refresh list
      setCourses((prev) => prev.filter((c) => c.id !== course.id));
      const [s, t] = await Promise.all([getAdminStats(), getAdminDbTables()]);
      setStats(s);
      setTables(t);
      if (selectedTable === "courses") {
        loadTable("courses");
      }
    } catch (e: any) {
      setActionMessage({ type: "error", text: e.message });
    } finally {
      setDeletingCourseId(null);
    }
  };

  const handleDeleteUser = async (user: AdminUser) => {
    if (user.is_admin) {
      alert("Admin accounts cannot be deleted from the UI.");
      return;
    }
    const confirm = window.confirm(
      `Are you sure you want to permanently delete user "${user.username}"?\n\nAll courses, quiz attempts, enrollments, and badges for this user will also be deleted.`
    );
    if (!confirm) return;

    setDeletingUserId(user.id);
    try {
      const res = await deleteAdminUser(user.id);
      setActionMessage({ type: "success", text: res.message });
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      const [s, c, t] = await Promise.all([getAdminStats(), getAdminCourses(), getAdminDbTables()]);
      setStats(s);
      setCourses(c);
      setTables(t);
      if (selectedTable === "users") {
        loadTable("users");
      }
    } catch (e: any) {
      setActionMessage({ type: "error", text: e.message });
    } finally {
      setDeletingUserId(null);
    }
  };

  if (isAdmin === false) {
    return (
      <div className="max-w-md mx-auto p-6 text-center py-20">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Access Restricted</h2>
        <p className="text-sm text-slate-600 mb-6">
          You must be logged in as an administrator to access the AIRA Admin Panel.
        </p>
        <Link href="/dashboard" className="btn-primary">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const filteredCourses = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
      c.topic.toLowerCase().includes(courseSearch.toLowerCase()) ||
      c.username.toLowerCase().includes(courseSearch.toLowerCase()) ||
      c.domain.toLowerCase().includes(courseSearch.toLowerCase())
  );

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.profession && u.profession.toLowerCase().includes(userSearch.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 pb-24 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" /> Super Admin
            </span>
            <span className="text-xs text-slate-500 font-semibold">AIRA Management Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Platform Administration
          </h1>
        </div>

        <Button
          onClick={handleRefresh}
          disabled={refreshing || loading}
          variant="outline"
          size="sm"
          className="self-start sm:self-auto text-slate-700 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border-slate-200 font-bold"
        >
          <RefreshCw className={`w-4 h-4 mr-1.5 ${refreshing ? "animate-spin text-indigo-600" : ""}`} />
          {refreshing ? "Refreshing Live Data…" : "Refresh Live Data"}
        </Button>
      </div>

      {/* Action Notification Alert */}
      {actionMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-2xs animate-in fade-in ${
            actionMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-xs underline font-bold ml-4 text-slate-500 hover:text-slate-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-semibold">Learners</span>
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{stats.total_users}</div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-semibold">Courses</span>
              <BookOpen className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{stats.total_courses}</div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-semibold">Enrollments</span>
              <UserPlus className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl font-black text-teal-600">{stats.total_enrollments ?? 0}</div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-semibold">Lessons</span>
              <Layers className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{stats.total_lessons}</div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-semibold">Quizzes</span>
              <HelpCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{stats.total_quizzes}</div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-semibold">Badges Awarded</span>
              <Trophy className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-slate-900">{stats.total_badges_earned}</div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-semibold">Avg Quiz Score</span>
              <Sparkles className="w-4 h-4 text-pink-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{stats.average_quiz_score}%</div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => handleTabSwitch("courses")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "courses"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          All Courses ({courses.length})
        </button>

        <button
          onClick={() => handleTabSwitch("users")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "users"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Users className="w-4 h-4" />
          All Learners ({users.length})
        </button>

        <button
          onClick={() => handleTabSwitch("database")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "database"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Database className="w-4 h-4" />
          SQLite Database Explorer ({tables.reduce((acc, t) => acc + t.row_count, 0)} records)
        </button>
      </div>

      {/* Tab 1: All Courses */}
      {activeTab === "courses" && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Course Catalog & Enrollment Metrics
              </h3>
              <p className="text-xs text-slate-500">Inspect creator ownership, enrolled students, and completion rates.</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search courses, users, topics…"
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/70">
                  <th className="p-3">ID</th>
                  <th className="p-3">Course Title</th>
                  <th className="p-3">Creator</th>
                  <th className="p-3">Enrolled</th>
                  <th className="p-3">Domain & Topic</th>
                  <th className="p-3">Lessons</th>
                  <th className="p-3">Creator Progress</th>
                  <th className="p-3">Badge</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredCourses.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400">
                      No courses match your search filter.
                    </td>
                  </tr>
                ) : (
                  filteredCourses.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-bold text-slate-900">#{c.id}</td>
                      <td className="p-3">
                        <Link
                          href={`/course/${c.id}`}
                          className="font-bold text-slate-900 hover:text-indigo-600 flex items-center gap-1 group"
                        >
                          <span className="truncate max-w-[200px]">{c.title}</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 text-indigo-500" />
                        </Link>
                      </td>
                      <td className="p-3">
                        <Link
                          href={`/u/${c.username}`}
                          className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-indigo-50 text-slate-800 hover:text-indigo-600 font-semibold transition-colors"
                        >
                          @{c.username}
                        </Link>
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 text-[11px]">
                          <Users className="w-3 h-3" />
                          {c.enrolled_count ?? 0}
                        </span>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="text-[10px] bg-indigo-50/50 text-indigo-700 border-indigo-200">
                          {c.domain} • {c.topic}
                        </Badge>
                      </td>
                      <td className="p-3">{c.total_lessons} Lessons</td>
                      <td className="p-3">
                        <div className="w-32 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-slate-700">
                              {c.completed_lessons}/{c.total_lessons}
                            </span>
                            <span className={`font-bold ${c.progress_percentage === 100 ? "text-emerald-600" : "text-indigo-600"}`}>
                              {c.progress_percentage}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200/80">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                c.progress_percentage === 100
                                  ? "bg-emerald-500"
                                  : c.progress_percentage > 0
                                  ? "bg-indigo-600"
                                  : "bg-transparent"
                              }`}
                              style={{ width: `${Math.max(c.progress_percentage, 0)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        {c.badge_name ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <Trophy className="w-3 h-3 text-amber-500" />
                            {c.badge_name}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteCourse(c)}
                          disabled={deletingCourseId === c.id}
                          className="text-xs h-7 px-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: All Users */}
      {activeTab === "users" && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">User Accounts & Roles</h3>
              <p className="text-xs text-slate-500">Manage registered learners, creators, and administrators.</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search usernames, professions…"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/70">
                  <th className="p-3">ID</th>
                  <th className="p-3">Username</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Profession</th>
                  <th className="p-3">Knowledge Level</th>
                  <th className="p-3">Courses (Created / Enrolled)</th>
                  <th className="p-3">Badges</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-bold text-slate-900">#{u.id}</td>
                    <td className="p-3 font-bold text-slate-900">
                      <Link href={`/u/${u.username}`} className="hover:text-indigo-600 transition-colors">
                        @{u.username}
                      </Link>
                    </td>
                    <td className="p-3">
                      {u.is_admin ? (
                        <Badge className="bg-amber-500 text-slate-950 font-black text-[10px]">
                          Admin
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] text-slate-600">
                          Learner
                        </Badge>
                      )}
                    </td>
                    <td className="p-3">{u.profession || "—"}</td>
                    <td className="p-3">{u.knowledge_level || "—"}</td>
                    <td className="p-3">
                      <span className="font-semibold text-slate-900">{u.course_count} Total</span>
                      <span className="text-[11px] text-slate-400 ml-1.5">
                        ({u.created_count ?? 0} created, {u.enrolled_count ?? 0} enrolled)
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-amber-600">{u.badge_count} Badges</td>
                    <td className="p-3 text-right">
                      {!u.is_admin && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUser(u)}
                          disabled={deletingUserId === u.id}
                          className="text-xs h-7 px-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete User
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: SQLite Live Database Explorer */}
      {activeTab === "database" && (
        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-1">
                <Database className="w-4 h-4" /> SQLite Direct File Inspector
              </div>
              <h3 className="text-xl font-bold text-white">aira.db Visualizer</h3>
            </div>
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                onClick={() => loadTable(selectedTable)}
                disabled={loadingTable}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl h-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loadingTable ? "animate-spin" : ""}`} />
                Refresh Table
              </Button>
              <div className="text-xs text-slate-400 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                ⚡ Live SQL Queries
              </div>
            </div>
          </div>

          {/* Table Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {tables.map((t) => (
              <button
                key={t.table_name}
                onClick={() => loadTable(t.table_name)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  selectedTable === t.table_name
                    ? "bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-300"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span>{t.table_name}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                    selectedTable === t.table_name
                      ? "bg-indigo-700 text-indigo-100"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {t.row_count}
                </span>
              </button>
            ))}
          </div>

          {/* Table Data View */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span>Table:</span>
                <code className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg font-mono">
                  {selectedTable}
                </code>
                {tableData && (
                  <span className="text-xs text-slate-400 font-normal">
                    ({tableData.total_returned} rows shown)
                  </span>
                )}
              </h4>
            </div>

            {loadingTable ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading table rows…
              </div>
            ) : !tableData || tableData.rows.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">Table &apos;{selectedTable}&apos; is currently empty.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold font-mono text-[11px]">
                      {tableData.columns.map((col) => (
                        <th key={col} className="p-2.5 whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-mono text-[11px]">
                    {tableData.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50/70 transition-colors">
                        {tableData.columns.map((col) => {
                          const val = row[col];
                          const isNull = val === null;
                          const isBool = typeof val === "boolean";
                          const strVal = isNull ? "" : String(val);
                          const formattedJson = tryFormatJson(strVal);
                          const isLong = strVal.length > 25 || formattedJson !== null;

                          return (
                            <td key={col} className="p-2.5 whitespace-nowrap max-w-[260px]">
                              {isNull ? (
                                <span className="text-slate-300 italic">null</span>
                              ) : isBool ? (
                                <span className={val ? "text-emerald-600 font-semibold" : "text-slate-400"}>
                                  {val ? "true" : "false"}
                                </span>
                              ) : isLong ? (
                                <div className="flex items-center justify-between gap-1.5 group/cell">
                                  <span className="truncate max-w-[180px] text-slate-700" title={strVal}>
                                    {strVal}
                                  </span>
                                  <button
                                    onClick={() => {
                                      setCellModal({
                                        tableName: selectedTable,
                                        column: col,
                                        value: formattedJson || strVal,
                                        isJson: formattedJson !== null,
                                      });
                                      setCopied(false);
                                    }}
                                    title="show description"
                                    aria-label="show description"
                                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all border border-indigo-200/80 cursor-pointer shrink-0 shadow-2xs group-hover/cell:opacity-100 opacity-70 hover:scale-105"
                                  >
                                    <span>View</span>
                                    <ChevronRight className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <span className="text-slate-700">{strVal}</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Full Content & JSON Inspector Modal */}
      {cellModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <span>Field Description & Content</span>
                    <span className="px-2 py-0.5 text-[10px] rounded-md font-mono bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {cellModal.tableName}.{cellModal.column}
                    </span>
                    {cellModal.isJson && (
                      <span className="px-1.5 py-0.5 text-[9px] rounded font-mono bg-amber-50 text-amber-700 border border-amber-200 font-bold">
                        Formatted JSON
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500">Inspect complete database record</p>
                </div>
              </div>
              <button
                onClick={() => setCellModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-950 font-mono text-xs text-emerald-400 select-text">
              <pre className="whitespace-pre-wrap break-words leading-relaxed">
                {cellModal.value}
              </pre>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-slate-100 bg-white flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">
                Length: {cellModal.value.length} characters
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(cellModal.value);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="text-xs flex items-center gap-1.5"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Raw</span>
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  onClick={() => setCellModal(null)}
                  className="text-xs bg-slate-900 text-white hover:bg-slate-800"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
