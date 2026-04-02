# AGENTS.md — GrocerEase

> **CRITICAL RULE**: Before implementing ANY change, ask clarifying questions to fully understand the intent, scope, and impact. Never assume — always confirm. Produce precise output, not guesses.

---

## Project Overview

**GrocerEase** is a full-stack grocery store management system (ERP).  
It is a **monorepo** with two independent workspaces:

| Workspace   | Path         | Framework         | Port  |
|-------------|--------------|-------------------|-------|
| Frontend    | `frontend/`  | Next.js 16 (App Router) | 3000  |
| Backend     | `backend/`   | Express.js 5      | 5000  |

**Database**: MySQL (cloud-hosted on Railway)  
**Auth**: JWT (Bearer token) + bcryptjs password hashing

---

## Tech Stack & Versions

### Frontend (`frontend/`)
- **Next.js** 16.2.1 (App Router — NOT Pages Router)
- **React** 19.2.4
- **Tailwind CSS** 4 (via `@tailwindcss/postcss`)
- **Recharts** 3.8.1 (dashboard charts)
- **Module system**: ES Modules (`import`/`export`)
- **Styling**: Tailwind CSS + `globals.css` (CSS custom properties) + `<style jsx>` for component-scoped styles

### Backend (`backend/`)
- **Express.js** 5.2.1
- **mysql2** 3.20.0 (connection pool with promises)
- **bcryptjs** 3.0.3
- **jsonwebtoken** 9.0.3
- **dotenv** 17.3.1
- **Module system**: CommonJS (`require`/`module.exports`)

> **WARNING**: Frontend uses ES Modules. Backend uses CommonJS. Never mix them.

---

## Architecture

### Backend Architecture: Route → Middleware → Controller

Every feature follows this 3-layer pattern strictly:

```
Request → Route (traffic director) → Middleware (auth guard) → Controller (business logic + DB)
```

| Layer        | Path                    | Responsibility                          |
|-------------|-------------------------|-----------------------------------------|
| Routes      | `backend/routes/`       | Map HTTP methods to controller functions |
| Middleware   | `backend/middleware/`   | JWT verification (`protect`) and role checks (`adminCheck`) |
| Controllers  | `backend/controllers/`  | Business logic, DB queries, response handling |
| Config       | `backend/config/db.js`  | MySQL connection pool (promisified)      |
| Scripts      | `backend/scripts/`      | DB setup (`setup_db.js`) and seeding (`seed_db.js`) |

**When adding a new feature**, always create all three layers: route file, controller file, and wire middleware as needed.

### Frontend Architecture: App Router + Context

- All page components use the `"use client"` directive
- Auth state is provided via React Context (`AuthProvider` wraps entire app in root `layout.js`)
- The `useAuth()` hook gives access to `{ user, token, loading, login, logout }`



---

## Environment Variables

- **Backend** env vars are in `backend/.env` — read the file directly for variable names
- **Frontend** uses `NEXT_PUBLIC_API_URL` (set on Netlify): local = `http://localhost:5000`, production = `https://grocerease-bnbk.onrender.com`

> **NEVER** log, expose, or commit `.env` values. The `.gitignore` already excludes `.env` files.

---

## Frontend API Call Pattern

Every API call in the frontend follows this exact pattern:

```javascript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const response = await fetch(`${API_URL}/api/<resource>`, {
  method: '<METHOD>',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`   // Only for protected routes
  },
  body: JSON.stringify(payload)           // Only for POST/PUT
});
```

**Always** use this pattern. Never hardcode API URLs.

---

---

## Deployment

| Service   | Platform  | URL                                        | Trigger        |
|-----------|-----------|--------------------------------------------|----------------|
| Frontend  | Netlify   | https://grocerease123.netlify.app/         | Push to `main`  |
| Backend   | Render    | https://grocerease-bnbk.onrender.com       | Push to `main`  |
| Database  | Railway   | Cloud MySQL                                | Always running  |

**Branch**: `main` is the single production branch. Pushing to `main` auto-deploys both frontend and backend.

> **WARNING**: Every push to `main` goes directly to production. Test changes locally before pushing. If unsure, ask before committing.

---

## Coding Conventions

### Comment Annotations
Use these standardized annotations in code comments:

| Tag      | Usage                                           |
|----------|-------------------------------------------------|
| `TODO:`  | Planned feature or improvement to implement     |
| `FIX:`   | Known bug that needs to be fixed                |
| `HACK:`  | Workaround in place — needs a proper solution   |
| `NOTE:`  | Important context for future developers         |
| `PERF:`  | Performance concern or optimization opportunity |

Example: `// TODO: Add pagination to product listing`

### Naming Conventions

| Element             | Convention     | Example                       |
|---------------------|----------------|-------------------------------|
| Files (backend)     | camelCase      | `authController.js`           |
| Files (frontend)    | PascalCase (components) / camelCase (others) | `Navbar.js`, `globals.css` |
| Variables/Functions | camelCase      | `getAllProducts`, `totalAmount`|
| React Components    | PascalCase     | `AdminDashboard`, `Navbar`    |
| DB columns          | snake_case     | `stock_quantity`, `created_at`|
| CSS classes         | kebab-case     | `glass-card`, `btn-primary`   |
| API routes          | kebab-case     | `/api/auth/login`             |
| Env variables       | UPPER_SNAKE    | `NEXT_PUBLIC_API_URL`         |

### Style Conventions
- **Global styles**: Define in `frontend/app/globals.css` using CSS custom properties (`--color-primary`, etc.)
- **Component styles**: Use `<style jsx>` blocks inside components for scoped CSS
- **Design tokens**: Always reference existing CSS variables (e.g., `var(--color-primary)`) — never hardcode colors
- **Glassmorphism pattern**: Use the existing `.glass-card` class for card UI elements

### Code Style
- Use `async/await` for all asynchronous operations (never raw `.then()` chains)
- Backend controllers must always have `try/catch` with proper error responses
- Use descriptive variable names — clarity over brevity
- Keep controller functions focused: one function per API action

---

## Critical Rules

> These rules are **non-negotiable**. Violations can break production.

### 1. Ask Before Acting
- **Always ask clarifying questions** before implementing changes
- Confirm scope, intent, and edge cases
- Never assume the user's intent on ambiguous requests

### 2. No Unauthorized Dependencies
- **Never install new npm packages** without explicit user approval
- Before suggesting a package, explain why it's needed and what alternatives exist
- This applies to both `frontend/` and `backend/`

### 3. Protect Auth & Security Logic
- **Never modify** `authMiddleware.js`, `AuthContext.js`, or `authController.js` unless explicitly asked
- Never weaken auth checks (e.g., removing `protect` or `adminCheck` from routes)
- Never log tokens, passwords, or sensitive user data

### 4. Database Safety
- **Never** run `DROP TABLE`, `TRUNCATE`, or destructive SQL without explicit approval
- **Never** modify the existing schema (add/remove/rename columns or tables) without approval
- Always use parameterized queries (`?` placeholders) — never string concatenation for SQL
- Use database transactions for multi-step operations that must be atomic

### 5. Preserve Existing Patterns
- New backend routes **must** follow: Route → Middleware → Controller
- New frontend pages **must** use `"use client"` directive and the established API call pattern
- New API calls **must** use the `NEXT_PUBLIC_API_URL` pattern — never hardcode URLs

### 6. Git & Deployment Safety
- **Never force push** (`git push --force`)
- **Never commit** `.env` files, secrets, or credentials
- Remember: pushing to `main` **auto-deploys to production**
- Always verify changes work locally before suggesting a push

### 7. No Destructive File Operations
- **Never delete** existing files without explicit approval
- **Never overwrite** files entirely — make targeted, minimal edits
- Always explain what will change before making modifications

### 8. Error Handling
- Backend: Every controller must return proper HTTP status codes with meaningful JSON error messages
- Frontend: Every `fetch` call must handle errors gracefully with user-facing messages
- Never silently swallow errors

---

## Project-Specific Gotchas

1. **Express 5**: This project uses Express **v5** (not v4). Some APIs differ — check compatibility before using Express features.
2. **Next.js 16**: This uses Next.js **v16** with App Router. APIs and conventions may differ from older versions. Read docs in `node_modules/next/dist/docs/` before writing Next.js code.
3. **React 19**: Uses React **v19** — be aware of new features and deprecations.
4. **Tailwind CSS 4**: Uses Tailwind **v4** (PostCSS plugin `@tailwindcss/postcss`), which has a different configuration model than v3.
5. **No test suite**: There are no tests configured. Do not create test files unless asked.
6. **Render cold starts**: The free-tier Render backend may spin down after inactivity. First requests after idle may be slow — this is expected, not a bug.
7. **CORS**: The backend uses `cors()` with default settings (allows all origins). Do not restrict without approval.
8. **Local dev**: Both workspaces must run simultaneously (`npm run dev` in each). Backend must start before frontend for API calls to work.
