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

  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
        loadTable(t[0].table_name);
      }
    } catch (e: any) {
      setActionMessage({ type: "error", text: e.message });
    } finally {
      setLoading(false);
    }
  };

  const loadTable = async (tableName: string) => {
    setSelectedTable(tableName);
    setLoadingTable(true);
    try {
      const data = await getAdminTableData(tableName);
      setTableData(data);
    } catch (e: any) {
      setActionMessage({ type: "error", text: `Failed to load table: ${e.message}` });
    } finally {
      setLoadingTable(false);
    }
  };

  const handleDeleteCourse = async (course: AdminCourse) => {
    const confirm = window.confirm(
      `Are you sure you want to permanently delete the course "${course.title}" created by ${course.username}?\n\nThis will delete all its modules, lessons, quizzes, attempts, and badges.`
    );
    if (!confirm) return;

    setDeletingCourseId(course.id);
    try {
      const res = await deleteAdminCourse(course.id);
      setActionMessage({ type: "success", text: res.message });
      // Refresh list
      setCourses((prev) => prev.filter((c) => c.id !== course.id));
      const s = await getAdminStats();
      setStats(s);
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
      `Are you sure you want to permanently delete user "${user.username}"?\n\nAll courses, quiz attempts, and badges created by this user will also be deleted.`
    );
    if (!confirm) return;

    setDeletingUserId(user.id);
    try {
      const res = await deleteAdminUser(user.id);
      setActionMessage({ type: "success", text: res.message });
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      const [s, c] = await Promise.all([getAdminStats(), getAdminCourses()]);
      setStats(s);
      setCourses(c);
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
    <div className="max-w-7xl mx-auto p-4 sm:p-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
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
          onClick={loadAdminData}
          variant="outline"
          size="sm"
          className="self-start sm:self-auto text-slate-700 bg-white"
        >
          <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh Data
        </Button>
      </div>

      {/* Action Notification Alert */}
      {actionMessage && (
        <div
          className={`p-4 rounded-xl text-sm font-medium mb-6 flex items-center justify-between ${
            actionMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <span>{actionMessage.text}</span>
          <button
            onClick={() => setActionMessage(null)}
            className="text-xs underline font-bold ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Learners</span>
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{stats.total_users}</div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Courses</span>
              <BookOpen className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{stats.total_courses}</div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Lessons</span>
              <Layers className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{stats.total_lessons}</div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Quizzes</span>
              <HelpCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{stats.total_quizzes}</div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Badges Awarded</span>
              <Trophy className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-slate-900">{stats.total_badges_earned}</div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold">Avg Quiz Score</span>
              <Sparkles className="w-4 h-4 text-pink-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{stats.average_quiz_score}%</div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 mb-6 pb-2">
        <button
          onClick={() => setActiveTab("courses")}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === "courses"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          All Courses ({courses.length})
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === "users"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Users className="w-4 h-4" />
          All Learners ({users.length})
        </button>

        <button
          onClick={() => setActiveTab("database")}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === "database"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Database className="w-4 h-4" />
          SQLite Database Explorer
        </button>
      </div>

      {/* Tab 1: All Courses */}
      {activeTab === "courses" && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <h3 className="font-bold text-slate-900 text-base">
              Course Management (Delete Any User&apos;s Course)
            </h3>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search courses, users, topics…"
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                className="input pl-9 text-xs"
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
                  <th className="p-3">Domain & Topic</th>
                  <th className="p-3">Lessons</th>
                  <th className="p-3">Progress</th>
                  <th className="p-3">Badge</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredCourses.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
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
                          <span className="truncate max-w-[220px]">{c.title}</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 text-indigo-500" />
                        </Link>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-semibold">
                          @{c.username}
                        </span>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="text-[10px] bg-indigo-50/50 text-indigo-700 border-indigo-200">
                          {c.domain} • {c.topic}
                        </Badge>
                      </td>
                      <td className="p-3">{c.total_lessons} Lessons</td>
                      <td className="p-3">
                        <span className="font-semibold text-indigo-700">
                          {c.completed_lessons}/{c.total_lessons} ({c.progress_percentage}%)
                        </span>
                      </td>
                      <td className="p-3">
                        {c.badge_name ? (
                          <Badge className="bg-amber-500 text-white text-[10px] font-bold">
                            🏆 {c.badge_name}
                          </Badge>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
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
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <h3 className="font-bold text-slate-900 text-base">Registered Learners & Accounts</h3>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search learners by username, role…"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="input pl-9 text-xs"
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
                  <th className="p-3">Courses</th>
                  <th className="p-3">Badges</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-bold text-slate-900">#{u.id}</td>
                    <td className="p-3 font-bold text-slate-900">@{u.username}</td>
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
                    <td className="p-3 font-semibold">{u.course_count} Courses</td>
                    <td className="p-3">{u.badge_count} Badges</td>
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
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-1">
                <Database className="w-4 h-4" /> SQLite Direct File Inspector
              </div>
              <h3 className="text-xl font-bold text-white">aira.db Visualizer</h3>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Location: c:\Users\Ved\OneDrive\Desktop\myfolder3\aira\backend\aira.db
              </p>
            </div>
            <div className="text-xs text-slate-400 bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-700">
              ⚡ Real-time query execution via SQLAlchemy
            </div>
          </div>

          {/* Table Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {tables.map((t) => (
              <button
                key={t.table_name}
                onClick={() => loadTable(t.table_name)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  selectedTable === t.table_name
                    ? "bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-300"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span>{t.table_name}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] ${
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
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span>Table:</span>
                <code className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-mono">
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
              <div className="p-12 text-center text-slate-500 text-xs">Loading table rows…</div>
            ) : !tableData || tableData.rows.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">Table is currently empty.</div>
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
                      <tr key={rIdx} className="hover:bg-slate-50/70">
                        {tableData.columns.map((col) => (
                          <td key={col} className="p-2.5 whitespace-nowrap max-w-xs truncate">
                            {row[col] === null ? (
                              <span className="text-slate-300 italic">null</span>
                            ) : typeof row[col] === "boolean" ? (
                              row[col] ? "true" : "false"
                            ) : (
                              String(row[col])
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
