"""
Build two cPanel-ready zip files:
  - mytutor-frontend-deploy.zip  (Next.js build output)
  - mytutor-backend-deploy.zip   (Django source, no venv/staticfiles)
"""

import os
import zipfile
from pathlib import Path

BASE = Path(__file__).parent

# ─── FRONTEND ────────────────────────────────────────────────────────────────
FRONTEND_SRC = BASE / "mytutor-frontend"
FRONTEND_ZIP = BASE / "mytutor-frontend-deploy.zip"

# directories/files to skip entirely
FE_SKIP_DIRS = {
    "node_modules", ".git", ".github", ".history", "coverage", "out", "build",
    ".vercel", "cache",   # skip .next/cache – not needed at runtime
}
FE_SKIP_FILES = {
    ".deployignore", ".dockerignore", ".gitignore", ".eslintrc.json",
    ".gitlab-ci.yml", ".yarnrc.yml", "docker-compose.yml", "Dockerfile",
    "README.md", "web.tar.gz", "next-env.d.ts", "tsconfig.tsbuildinfo",
    # remove dev logs
    ".codex-dev.stderr.log", ".codex-dev.stdout.log",
    ".codex-live-20260811-154310.stderr.log", ".codex-live-20260811-154310.stdout.log",
    ".codex-run-20260810-130949.stderr.log", ".codex-run-20260810-130949.stdout.log",
    ".frontend-dev.stderr.log", ".frontend-dev.stdout.log",
    ".frontend-runtime.stderr.log", ".frontend-runtime.stdout.log",
    "cpanel_deploy.sh",
}

def fe_skip(rel: Path) -> bool:
    parts = rel.parts
    for p in parts:
        if p in FE_SKIP_DIRS:
            return True
    if rel.name in FE_SKIP_FILES:
        return True
    if rel.name.endswith(".env.local") or rel.name.startswith(".env") and rel.name.endswith(".local"):
        return True
    if rel.name.endswith(".pem"):
        return True
    if rel.name.endswith(".tsbuildinfo"):
        return True
    # skip .submodule-git-backup files
    if ".submodule-git-backup" in str(rel):
        return True
    return False

print(f"Building {FRONTEND_ZIP.name} ...")
fe_count = 0
with zipfile.ZipFile(FRONTEND_ZIP, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
    for path in sorted(FRONTEND_SRC.rglob("*")):
        if path.is_dir():
            continue
        rel = path.relative_to(FRONTEND_SRC)
        if fe_skip(rel):
            continue
        zf.write(path, rel)
        fe_count += 1
print(f"  → {fe_count} files  ({FRONTEND_ZIP.stat().st_size // 1024 // 1024} MB)")

# ─── BACKEND ─────────────────────────────────────────────────────────────────
BACKEND_SRC = BASE / "mytutor-backend"
BACKEND_ZIP = BASE / "mytutor-backend-deploy.zip"

BE_SKIP_DIRS = {
    "venv", ".venv", "media", "staticfiles", "node_modules",
    "__pycache__", ".git", ".github", "migrations",
}
BE_SKIP_FILES = {
    "db.sqlite3", ".env", "schema.yml", "packages.txt", "README.md",
    "serve.sh", "deploy-api.sh", "locally-deploy-api.sh", "cpanel_deploy.sh",
    ".deployignore", ".dockerignore", ".gitignore", ".gitlab-ci.yml",
    "run_railway.sh", "makemigration.sh", "migrate.sh", "SECRET_KEY",
    "docker-compose.yml", "Dockerfile",
}

def be_skip(rel: Path) -> bool:
    parts = rel.parts
    for p in parts:
        if p in BE_SKIP_DIRS:
            return True
    if rel.name in BE_SKIP_FILES:
        return True
    if rel.name.endswith(".pyc"):
        return True
    if ".submodule-git-backup" in str(rel):
        return True
    return False

print(f"Building {BACKEND_ZIP.name} ...")
be_count = 0
with zipfile.ZipFile(BACKEND_ZIP, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
    for path in sorted(BACKEND_SRC.rglob("*")):
        if path.is_dir():
            continue
        rel = path.relative_to(BACKEND_SRC)
        if be_skip(rel):
            continue
        zf.write(path, rel)
        be_count += 1
print(f"  → {be_count} files  ({BACKEND_ZIP.stat().st_size // 1024 // 1024} MB)")

print("\nDone! Zip files are in:")
print(f"  {FRONTEND_ZIP}")
print(f"  {BACKEND_ZIP}")
