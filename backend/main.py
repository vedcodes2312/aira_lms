from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import create_tables
from routers import auth, onboarding, topics, courses, admin, profile

app = FastAPI(title="AIRA API", version="0.1.0")

# Allow Next.js dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create DB tables on startup
create_tables()

# Register routers
app.include_router(auth.router)
app.include_router(onboarding.router)
app.include_router(topics.router)
app.include_router(courses.router)
app.include_router(admin.router)
app.include_router(profile.router)


@app.get("/")
def root():
    return {"message": "AIRA API is running", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}
