# 🧹 PageMaker Project Cleanup Plan

## 📋 Current Status Analysis

### Root Directory (`/home/helios/ver1.1/`)
```
Total files: 16
- Documentation: 12 MD files (KEEP selective)
- Build scripts: 2 SH files (KEEP)
- Config: 1 .gitignore (KEEP)
- Source: grapesjs/, backend/ (KEEP)
```

### Backend Directory (`/home/helios/ver1.1/backend/`)
```
Total files: ~60+
- Documentation: 14 MD files (CLEANUP NEEDED)
- Python scripts: 20+ files (CLEANUP NEEDED)
- Test files: 6 JSON + 5 PY files (DELETE)
- Deploy scripts: 10+ SH files (CLEANUP NEEDED)
- Config: 3 .env files (KEEP)
- Nginx: 2 .conf files (KEEP)
- Folders: app/, templates/, static/ (KEEP)
```

---

## 🗑️ FILES TO DELETE

### 1. **Test Reports & Debug Files** (DELETE ALL)
```bash
backend/test_report_20251001_*.json  # 6 files - old test reports
backend/test_republish.py
backend/test_subdomain.py
backend/test_suite.py
backend/test_vps.py
backend/verify_save_load.py
backend/silex_debug_test.html
backend/debug_db.py
backend/create_demo_data.py
backend/server.log
```

### 2. **Redundant Documentation** (DELETE)
```bash
# Backend docs (move to root if needed)
backend/COMPLETION_SUMMARY.md
backend/DEPLOYMENT_SUCCESS.md
backend/FINAL_COMPLETION_REPORT.md
backend/IMPLEMENTATION_TRACKER.md
backend/PHASE_C_COMPLETION_REPORT.md
backend/PHASE_D_COMPLETION_REPORT.md
backend/PHASE_D_PLAN.md
backend/TASK_6_COMPLETION_REPORT.md
backend/VPS_DEPLOYMENT_PHASE_C_COMPLETE.md
backend/WORKFLOW_OPTIMIZATION.md
backend/SILEX_SUBDOMAIN_WORKFLOW_COMPLETE.md
backend/SILEX_TEMPLATE_SYSTEM.md

# Root docs (consolidate)
PAGEMAKER_LAYERS_FIX.md
PAGEMAKER_STYLE_FIX.md
PAGEMAKER_PUBLISH_COMPLETE.md
PAGEMAKER_SAVE_LOAD_COMPLETE.md
PAGEMAKER_TEST_GUIDE.md
ROADMAP_PHASE1_STATUS.md
```

### 3. **Redundant Deployment Scripts** (CLEANUP)
```bash
backend/deploy_pagemade_silex.sh
backend/deploy_simple.sh
backend/deploy_subdomain_system.sh
backend/deploy_vps_restart.sh
backend/deploy_vps_subdomain.sh
backend/deployment_instructions.sh
backend/fix_silex_loading.sh
backend/quick_restart.sh
backend/vps_auto_restart.py
backend/vps_deploy_package.sh
backend/vps_restart_commands.txt
backend/EMERGENCY_VPS_GUIDE.sh
```

### 4. **Old Migration Scripts** (KEEP 1, DELETE OTHERS)
```bash
backend/migrate_auth.py         # DELETE
backend/migrate_clean_auth.py   # DELETE
backend/migrate_subdomain.py    # KEEP (latest)
```

### 5. **Redundant Python Files**
```bash
backend/hybrid_architecture.py  # DELETE
backend/optimal_architecture.py # DELETE
backend/cache.py                # CHECK if used
```

### 6. **Old Virtual Env** (DELETE)
```bash
backend/venv/  # Old venv, keep .venv only
```

---

## ✅ FILES TO KEEP

### Root Directory
```
✅ .gitignore
✅ DEPLOYMENT_QUICKREF.txt
✅ GRAPESJS_CUSTOMIZE_GUIDE.md
✅ PAGEMAKER_BUILD_GUIDE.md
✅ PAGEMAKER_DEPLOYMENT_PRODUCTION.md
✅ build-grapesjs.sh
✅ grapesjs/
✅ backend/
```

### Backend Directory (Core Files)
```
✅ .env, .env.local, .env.production
✅ config.py
✅ run.py
✅ run_local.py
✅ wsgi.py
✅ setup.sh
✅ requirements.txt
✅ requirements_local.txt
✅ migrate_subdomain.py (latest migration)
✅ nginx_subdomain.conf
✅ nginx_subdomain_simple.conf
✅ deploy_production.sh (keep 1 main deploy script)

✅ app/
✅ templates/
✅ static/
✅ instance/
✅ migrations/
✅ logs/
✅ storage/
✅ .venv/
```

### Backend Documentation (Consolidate)
```
✅ README.md (update with latest info)
✅ SUBDOMAIN_SYSTEM_SUMMARY.md
✅ SUBDOMAIN_USER_GUIDE.md
DELETE rest, merge info into README if needed
```

---

## 📝 NEW STRUCTURE (After Cleanup)

```
/home/helios/ver1.1/
├── .gitignore
├── README.md                              # Main project README
├── DEPLOYMENT_QUICKREF.txt
├── build-grapesjs.sh
│
├── docs/                                  # NEW: Centralize docs
│   ├── GRAPESJS_CUSTOMIZE_GUIDE.md
│   ├── PAGEMAKER_BUILD_GUIDE.md
│   ├── PAGEMAKER_DEPLOYMENT_PRODUCTION.md
│   ├── PAGEMAKER_INTEGRATION.md
│   ├── PAGEMAKER_PROFESSIONAL_CHECKLIST.md
│   └── SUBDOMAIN_USER_GUIDE.md
│
├── grapesjs/                              # Source (not deployed)
│
└── backend/
    ├── .env, .env.local, .env.production
    ├── .venv/
    ├── README.md                          # Backend-specific README
    │
    ├── config.py
    ├── run.py
    ├── run_local.py
    ├── wsgi.py
    │
    ├── requirements.txt
    ├── requirements_local.txt
    │
    ├── setup.sh
    ├── deploy_production.sh               # Single deploy script
    │
    ├── nginx_subdomain.conf
    ├── migrate_subdomain.py
    │
    ├── app/
    ├── templates/
    ├── static/
    ├── instance/
    ├── migrations/
    ├── logs/
    └── storage/
```

---

## 🚀 Cleanup Actions

### Phase 1: Delete Test Files
- Remove all test_*.json, test_*.py
- Remove debug_*.py, create_demo_data.py

### Phase 2: Consolidate Documentation
- Create docs/ folder
- Move relevant MD files to docs/
- Delete redundant completion reports

### Phase 3: Cleanup Scripts
- Keep only deploy_production.sh
- Delete old deploy scripts
- Keep setup.sh for fresh installs

### Phase 4: Clean Python Files
- Delete hybrid/optimal architecture files
- Keep only active migration script
- Remove old venv/

### Phase 5: Update .gitignore
- Add all cleanup patterns
- Ensure no temp files committed

---

## 📊 Expected Results

**Before:**
- Root: 16 files
- Backend: 60+ files
- Total: ~76 files (messy)

**After:**
- Root: 6 files + 1 docs/ folder
- Backend: 20 core files
- Total: ~26 files (clean, organized)

**Space Saved:** ~50 files deleted
**Organization:** ⭐⭐⭐⭐⭐ Professional

---

**Ready to execute cleanup?** Y/N
