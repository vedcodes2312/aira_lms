// lib/api.ts — Centralised API helpers

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("aira_token");
}

export function setToken(token: string) {
  localStorage.setItem("aira_token", token);
}

export function clearToken() {
  localStorage.removeItem("aira_token");
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = true
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.detail || `Request failed: ${res.status}`);
  }

  return data as T;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  access_token: string;
  token_type: string;
  onboarding_done: boolean;
}

export async function signup(
  username: string,
  password: string,
  confirm_password: string
): Promise<AuthResponse> {
  return request<AuthResponse>(
    "/auth/signup",
    { method: "POST", body: JSON.stringify({ username, password, confirm_password }) },
    false
  );
}

export async function login(
  username: string,
  password: string
): Promise<AuthResponse> {
  return request<AuthResponse>(
    "/auth/login",
    { method: "POST", body: JSON.stringify({ username, password }) },
    false
  );
}

// ── Onboarding ─────────────────────────────────────────────────────────────────

export interface OnboardingData {
  profession: string;
  profession_other?: string;
  knowledge_level: string;
  learning_domain: string;
  learning_goal: string;
  explanation_style: string;
}

export async function saveOnboarding(data: OnboardingData) {
  return request("/onboarding", { method: "POST", body: JSON.stringify(data) });
}

export async function getMe() {
  return request<{
    id: number;
    username: string;
    profession: string;
    knowledge_level: string;
    learning_domain: string;
    learning_goal: string;
    explanation_style: string;
    onboarding_done: boolean;
    is_admin: boolean;
  }>("/onboarding/me");
}

// ── Topics ─────────────────────────────────────────────────────────────────────

export async function getTopics(domain: string): Promise<{ domain: string; topics: string[] }> {
  return request(`/topics?domain=${domain}`);
}

// ── Badges & Progress ──────────────────────────────────────────────────────────

export interface Badge {
  id: number;
  course_id: number;
  name: string;
  domain: string;
  description: string;
  icon: string;
  earned_at: string;
}

export interface QuizAttemptCreate {
  score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
}

export interface QuizAttemptOut {
  id: number;
  lesson_id: number;
  score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
  attempted_at: string;
}

export interface QuizAttemptResponse {
  attempt: QuizAttemptOut;
  badge_unlocked: Badge | null;
  all_quizzes_passed: boolean;
  lesson_marked_complete: boolean;
}

export interface Flashcard {
  id: string;
  lesson_id: number;
  lesson_title: string;
  front: string;
  back: string;
  category: string;
}

// ── Courses ────────────────────────────────────────────────────────────────────

export interface QuizItem {
  id: number;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

export interface LessonItem {
  id: number;
  title: string;
  content: Record<string, string | string[]>;
  order: number;
  quizzes: QuizItem[];
  is_completed?: boolean;
  best_quiz_score?: number | null;
  quiz_attempts_count?: number;
}

export interface ModuleItem {
  id: number;
  title: string;
  order: number;
  lessons: LessonItem[];
}

export interface Course {
  id: number;
  domain: string;
  topic: string;
  title: string;
  description: string;
  difficulty: string | null;
  created_at: string;
  total_lessons?: number;
  completed_lessons?: number;
  progress_percentage?: number;
  badge?: Badge | null;
  modules?: ModuleItem[];
}

export async function listCourses(): Promise<Course[]> {
  return request<Course[]>("/courses");
}

export async function generateCourse(domain: string, topic: string): Promise<Course> {
  return request<Course>("/courses/generate", {
    method: "POST",
    body: JSON.stringify({ domain, topic }),
  });
}

export async function getCourse(id: number): Promise<Course> {
  return request<Course>(`/courses/${id}`);
}

export async function toggleLessonComplete(
  courseId: number,
  lessonId: number
): Promise<{
  is_completed: boolean;
  completed_lessons: number;
  total_lessons: number;
  progress_percentage: number;
}> {
  return request(`/courses/${courseId}/lessons/${lessonId}/toggle-complete`, {
    method: "POST",
  });
}

export async function submitQuizAttempt(
  courseId: number,
  lessonId: number,
  data: QuizAttemptCreate
): Promise<QuizAttemptResponse> {
  return request<QuizAttemptResponse>(
    `/courses/${courseId}/lessons/${lessonId}/quiz-attempt`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export async function getCourseFlashcards(
  courseId: number,
  lessonId?: number
): Promise<Flashcard[]> {
  const url = lessonId
    ? `/courses/${courseId}/flashcards?lesson_id=${lessonId}`
    : `/courses/${courseId}/flashcards`;
  return request<Flashcard[]>(url);
}

export async function getMyBadges(): Promise<Badge[]> {
  return request<Badge[]>("/courses/badges/me");
}

// ── Admin ──────────────────────────────────────────────────────────────────────

export interface AdminStats {
  total_users: number;
  total_courses: number;
  total_lessons: number;
  total_quizzes: number;
  total_quiz_attempts: number;
  total_badges_earned: number;
  average_quiz_score: number;
}

export interface AdminCourse {
  id: number;
  user_id: number;
  username: string;
  domain: string;
  topic: string;
  title: string;
  description: string;
  difficulty: string | null;
  created_at: string;
  total_lessons: number;
  completed_lessons: number;
  progress_percentage: number;
  badge_name: string | null;
}

export interface AdminUser {
  id: number;
  username: string;
  profession: string | null;
  knowledge_level: string | null;
  learning_domain: string | null;
  learning_goal: string | null;
  explanation_style: string | null;
  onboarding_done: boolean;
  is_admin: boolean;
  course_count: number;
  badge_count: number;
  created_at: string;
}

export interface DbTableSummary {
  table_name: string;
  row_count: number;
}

export interface DbTableData {
  table_name: string;
  columns: string[];
  total_returned: number;
  rows: Record<string, any>[];
}

export async function getAdminStats(): Promise<AdminStats> {
  return request<AdminStats>("/admin/stats");
}

export async function getAdminCourses(): Promise<AdminCourse[]> {
  return request<AdminCourse[]>("/admin/courses");
}

export async function deleteAdminCourse(courseId: number): Promise<{ message: string }> {
  return request<{ message: string }>(`/admin/courses/${courseId}`, {
    method: "DELETE",
  });
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  return request<AdminUser[]>("/admin/users");
}

export async function deleteAdminUser(userId: number): Promise<{ message: string }> {
  return request<{ message: string }>(`/admin/users/${userId}`, {
    method: "DELETE",
  });
}

export async function getAdminDbTables(): Promise<DbTableSummary[]> {
  return request<DbTableSummary[]>("/admin/database/tables");
}

export async function getAdminTableData(tableName: string): Promise<DbTableData> {
  return request<DbTableData>(`/admin/database/table/${tableName}`);
}

// ── Certificates & LinkedIn ──────────────────────────────────────────────────

export interface CertificateData {
  id: number;
  cert_uuid: string;
  recipient_name: string;
  course_id: number;
  course_title: string;
  domain: string;
  badge_name: string | null;
  score_percentage: number;
  issued_at: string;
  linkedin_url: string;
}

export interface PublicCertificateData {
  valid: boolean;
  cert_uuid: string;
  recipient_name: string;
  course_title: string;
  domain: string;
  badge_name: string | null;
  score_percentage: number;
  issued_at: string;
  issuer: string;
  verification_url: string;
}

export async function getCourseCertificate(courseId: number): Promise<CertificateData> {
  return request<CertificateData>(`/courses/${courseId}/certificate`);
}

export async function verifyCertificatePublic(certUuid: string): Promise<PublicCertificateData> {
  return request<PublicCertificateData>(`/courses/public/verify-certificate/${certUuid}`, {}, false);
}

// ── Translation & Multi-Lingual ───────────────────────────────────────────────

export interface LessonTranslateData {
  lesson_id: number;
  language: string;
  content: Record<string, string | string[]>;
  is_cached: boolean;
}

export async function translateLesson(
  courseId: number,
  lessonId: number,
  language: string
): Promise<LessonTranslateData> {
  return request<LessonTranslateData>(`/courses/${courseId}/lessons/${lessonId}/translate`, {
    method: "POST",
    body: JSON.stringify({ language }),
  });
}

// ── Profile & Privacy Settings ────────────────────────────────────────────────

export interface UserProfileData {
  id: number;
  username: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string;
  profession: string | null;
  knowledge_level: string | null;
  learning_domain: string | null;
  learning_goal: string | null;
  explanation_style: string | null;
  preferred_language: string;
  is_admin: boolean;
  onboarding_done: boolean;
  created_at: string | null;

  // Privacy toggles
  is_public: boolean;
  show_real_name: boolean;
  show_courses: boolean;
  show_badges: boolean;
  show_certificates: boolean;
  show_interests: boolean;

  // Stats
  total_courses: number;
  completed_courses: number;
  total_badges: number;
  total_certificates: number;
}

export interface UserProfileUpdatePayload {
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  profession?: string;
  knowledge_level?: string;
  learning_domain?: string;
  learning_goal?: string;
  explanation_style?: string;
  preferred_language?: string;
  is_public?: boolean;
  show_real_name?: boolean;
  show_courses?: boolean;
  show_badges?: boolean;
  show_certificates?: boolean;
  show_interests?: boolean;
}

export interface PublicCourseItem {
  id: number;
  title: string;
  domain: string;
  topic: string;
  difficulty: string | null;
  total_lessons: number;
  completed_lessons: number;
  progress_percentage: number;
  badge_name: string | null;
}

export interface PublicBadgeItem {
  id: number;
  name: string;
  domain: string;
  description: string;
  icon: string;
  earned_at: string;
}

export interface PublicCertItem {
  cert_uuid: string;
  course_title: string;
  domain: string;
  badge_name: string | null;
  score_percentage: number;
  issued_at: string;
  verification_url: string;
}

export interface PublicProfileData {
  is_public: boolean;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string;
  profession: string | null;
  member_since: string | null;

  show_interests: boolean;
  learning_domain: string | null;
  knowledge_level: string | null;
  learning_goal: string | null;
  explanation_style: string | null;

  show_courses: boolean;
  courses: PublicCourseItem[];

  show_badges: boolean;
  badges: PublicBadgeItem[];

  show_certificates: boolean;
  certificates: PublicCertItem[];

  total_courses: number;
  completed_courses: number;
  total_badges: number;
  total_certificates: number;
}

export async function getUserProfile(): Promise<UserProfileData> {
  return request<UserProfileData>("/profile/me");
}

export async function updateUserProfile(payload: UserProfileUpdatePayload): Promise<UserProfileData> {
  return request<UserProfileData>("/profile/me", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function getPublicProfile(username: string): Promise<PublicProfileData> {
  return request<PublicProfileData>(`/profile/public/${encodeURIComponent(username)}`, {}, false);
}

// ── Course Search & Explore ───────────────────────────────────────────────────

export interface ExploreCourseItem {
  id: number;
  domain: string;
  topic: string;
  title: string;
  description: string;
  difficulty: string;
  creator_id: number;
  creator_username: string;
  creator_avatar: string;
  created_at: string;
  total_lessons: number;
  total_modules: number;
  enrolled_count: number;
  is_enrolled: boolean;
  progress_percentage: number;
  badge_name: string | null;
  is_creator: boolean;
  is_ai_generated: boolean;
}

export interface EnrollCourseResponse {
  message: string;
  enrolled: boolean;
  course_id: number;
}

export async function exploreCourses(params?: {
  search?: string;
  domain?: string;
  difficulty?: string;
}): Promise<ExploreCourseItem[]> {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.domain && params.domain !== "all") query.set("domain", params.domain);
  if (params?.difficulty && params.difficulty !== "all") query.set("difficulty", params.difficulty);

  const qs = query.toString();
  return request<ExploreCourseItem[]>(`/courses/explore${qs ? `?${qs}` : ""}`);
}

export async function enrollInCourse(courseId: number): Promise<EnrollCourseResponse> {
  return request<EnrollCourseResponse>(`/courses/${courseId}/enroll`, {
    method: "POST",
  });
}



