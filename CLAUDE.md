# Project Rules for AI Agents

## Overview

This is **PageMade** - a web page builder platform with:
- **Backend**: Flask API server (Python) at `backend/`
- **Frontend**: PageMade Editor (customized GrapesJS) at `frontend/`
- **GrapesJS Source**: Local customized version at `grapesjs/`
- **Website**: Next.js landing page at `website/`

---

## CRITICAL RULES

### 1. GrapesJS Source - DO NOT USE CDN

**NEVER load GrapesJS from CDN or external sources.**

The project has a **local customized GrapesJS** at `grapesjs/packages/core/`. This is the ONLY source for the editor.

```
grapesjs/
├── packages/
│   └── core/           # GrapesJS core source (v0.22.13)
│       ├── src/        # TypeScript source files
│       └── dist/       # Built files (after pnpm build:core)
│           ├── pagemade.min.js
│           ├── pagemade.mjs
│           └── css/pagemade.min.css
```

**Why this rule exists:**
- Version consistency - locked at 0.22.13
- Custom modifications may be applied
- Prevents breaking changes from upstream
- Avoids network dependency issues

**If you need to update GrapesJS:**
```bash
cd grapesjs
pnpm install
pnpm build:core
```

Then copy built files to frontend:
```bash
cp grapesjs/packages/core/dist/pagemade.min.js frontend/src/editor/public/pagemade-core.min.js
cp grapesjs/packages/core/dist/css/pagemade.min.css frontend/src/editor/styles/pagemade-core.min.css
```

### 2. Editor File Structure

```
frontend/src/editor/
├── index.html                    # Main editor HTML
├── public/
│   ├── pagemade.min.js          # Loader script (loads pagemade-core.min.js)
│   └── pagemade-core.min.js     # Built GrapesJS core (FROM LOCAL SOURCE)
├── styles/
│   ├── pagemade-core.min.css    # GrapesJS core CSS (FROM LOCAL SOURCE)
│   └── editor.css               # Custom editor styles
├── scripts/
│   ├── main.js                  # Main editor initialization
│   ├── config/pagemade-config.js
│   ├── components/
│   │   ├── DeviceSwitcher.js
│   │   └── ...
│   └── blocks/
│       ├── basic-blocks.js
│       └── site-blocks.js
```

### 3. Naming Convention

- **PageMade** = The product name (rebranded from GrapesJS)
- **pagemade** = File naming prefix
- **pm** = JavaScript global variable (`window.pm`)
- Do NOT use "grapesjs" or "gjs" in new code (legacy references may exist)

---

## Backend Rules

### API Server
- Flask app runs on `http://localhost:5000`
- Static files served from `backend/static/`
- Authentication uses JWT tokens

### Database
- SQLAlchemy ORM
- Migrations in `backend/migrations/`

---

## Development Commands

### Backend
```bash
cd backend
python run.py          # Start Flask server
```

### Frontend (Editor)
```bash
cd frontend
npm run dev            # Vite dev server for editor
```

### GrapesJS (Rebuild after changes)
```bash
cd grapesjs
pnpm install           # First time only
pnpm build:core        # Build core package
```

### Website
```bash
cd website
npm run dev            # Next.js dev server
```

---

## Common Issues & Solutions

### Issue: Canvas not scrolling
- Ensure `scrollableCanvas: true` in config
- Frame height must be `'auto'` for ResizeObserver to work
- Check `enableCanvasScrolling()` in main.js

### Issue: Version mismatch errors
- NEVER mix CDN and local GrapesJS files
- Always use local build from `grapesjs/packages/core/dist/`

### Issue: CSS conflicts
- Load order: pagemade-core.min.css → editor.css
- Avoid `!important` on GrapesJS internal classes

---

## File Modification Guidelines

1. **Before editing GrapesJS core**: Discuss with team, changes affect entire editor
2. **CSS overrides**: Add to `editor.css`, not inline in HTML
3. **New blocks**: Add to `blocks/site-blocks.js` or `blocks/basic-blocks.js`
4. **Config changes**: Modify `config/pagemade-config.js`

---

## Git Commit Convention

Format: `<type>(<scope>): <description>`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `style`: CSS/styling changes
- `docs`: Documentation
- `chore`: Build/config changes

Examples:
```
feat(editor): add custom hero block
fix(canvas): resolve scroll issue on tablet mode
refactor(backend): optimize page save endpoint
```
