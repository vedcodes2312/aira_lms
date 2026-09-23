# 🌟 AIRA — AI & Quantum Computing Personalized LMS

> **"Learn the Future Your Way"** — AIRA synthesizes bespoke, multi-lesson deep tech curriculums calibrated to your unique profession, cognitive background, and learning goals with interactive 3D flashcards, `lmscn` quizzes, and gamified achievement badges.

---

## 🚀 Quick Start Instructions

### 1. Backend Setup (FastAPI + Python 3.10+)

```bash
# Navigate to backend directory
cd backend

# Configure environment variables
copy .env.example .env
# Edit .env and enter your GEMINI_API_KEY=your_gemini_api_key_here

# Create and activate Python virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1       # On Windows PowerShell
# source venv/bin/activate        # On Linux/macOS

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server on port 8000
uvicorn main:app --reload --port 8000
```
* **API Server:** `http://localhost:8000`
* **Interactive OpenAPI Docs:** `http://localhost:8000/docs`

---

### 2. Frontend Setup (Next.js 16 + Tailwind CSS)

```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Start development server
npm run dev
```
* **Web Application:** `http://localhost:3000`

---

## 🔑 Test Accounts & Demo Credentials

| Role | Username | Password | Persona & Background | Badges & Courses |
|---|---|---|---|---|
| **Learner** | `priya_sharma` | `password123` | **High School STEM Educator**<br>*Calibrated for educational analogies & intuitive visuals* | 🏆 **Neural Architect**<br>Course: *Neural Networks for Educators* (100% Completed) |
| **Learner** | `vedtest` | `password123` | **Business Professional / Strategist**<br>*Calibrated for executive ROI & business metrics* | In-progress courses |
| **Super Admin** | `admin` | `adminpassword123` | **Platform Administrator**<br>*Full oversight, course moderation & DB explorer* | ⚡ Access to `/admin` |

---

## 📚 Persona Profiles & Academic References

AIRA adapts each module's pedagogical complexity to the learner's cognitive domain:

### 1. **Priya Sharma (`priya_sharma`)**
* **Role:** Senior Computer Science & Physics Educator (CBSE / ICSE Board Curriculum)
* **AIRA Pedagogy Focus:** Constructivist learning theory, classroom analogies, scaffolded step-by-step intuition, and formative assessment.
* **Academic References:**
  * Papert, S. (1980). *Mindstorms: Children, Computers, and Powerful Ideas*. Basic Books.
  * Mishra, P., & Koehler, M. J. (2006). *Technological Pedagogical Content Knowledge: A Framework for Teacher Knowledge*. Teachers College Record.
  * Vygotsky, L. S. (1978). *Mind in Society: Development of Higher Psychological Processes*. Harvard University Press.

### 2. **Suggested Indian Industry Personas**:
* **Dr. Ananya Deshmukh (`dr_ananya_deshmukh`)**: Radiologist & Medical Researcher using Convolutional Neural Networks (CNNs) for tumor detection and clinical biomarker discovery.
* **Rohit Verma (`rohit_verma`)**: Lead Software Engineer exploring Transformer Attention Mechanisms, Backpropagation matrix calculus, and Tensor pipelines.
* **Kavita Nair (`kavita_nair`)**: FinTech Risk Quant studying Grover's Quantum Search and Quantum Portfolio Optimization.

---

## ⚙️ Key Platform Features

1. **AI-Powered Generative Curriculums**:
   - Generates 2 progressive modules, 4 structured lessons, and 9-stage pedagogy sections per lesson.
2. **Interactive 3D Spaced Flashcards**:
   - Auto-extracted from lesson takeaways and key concepts with 3D flip card animations (`/course/[id]/flashcards`).
3. **`lmscn` Quiz Engine**:
   - Rich multiple-choice interactive quiz with immediate rationale explanations and score tracking.
4. **Achievement Badges & Mastery**:
   - Automated badge awards (e.g., *Neural Architect*, *Quantum Pioneer*) upon scoring $\ge 80\%$ across all lesson quizzes.
5. **Admin Panel & Live Database Explorer**:
   - Platform KPIs, user deletion/management, course removal, and live SQLite database inspection at `/admin`.

---

## 🛡️ Getting a Free Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Click **Create API Key**.
3. Add the key to `backend/.env`:
   ```env
   GEMINI_API_KEY=AIzaSy...your_key_here
   ```

---

## 🧪 Testing & Verification

* Run backend automated test suite:
  ```bash
  python backend/test_suite.py
  ```
* Run live frontend in browser: `http://localhost:3000`
