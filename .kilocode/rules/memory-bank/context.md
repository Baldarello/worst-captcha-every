# Active Context: Next.js Starter Template

## Current State

**Template Status**: CAPTCHA DELL'INFERNO running via Vite SPA

Project is now a simple Vite + React SPA (no Next.js). Dev server runs on port 3001.

## Recently Completed

- [x] Removed Next.js, switched to Vite SPA
- [x] CAPTCHA DELL'INFERNO running at root level
- [x] Dev server on port 3001 (exposed via sandbox proxy)

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `index.html` | Entry point | ✅ Active |
| `src/main.jsx` | React bootstrap | ✅ Active |
| `src/App.jsx` | CAPTCHA component | ✅ Active |
| `src/index.css` | Tailwind + animations | ✅ Active |
| `vite.config.js` | Vite config | ✅ Active |
| `.kilocode/` | AI context & recipes | ✅ Ready |

## Current Focus

The template is ready. Next steps depend on user requirements:

1. What type of application to build
2. What features are needed
3. Design/branding preferences

## Quick Start Guide

### To add a new page:

Create a file at `src/app/[route]/page.tsx`:
```tsx
export default function NewPage() {
  return <div>New page content</div>;
}
```

### To add components:

Create `src/components/` directory and add components:
```tsx
// src/components/ui/Button.tsx
export function Button({ children }: { children: React.ReactNode }) {
  return <button className="px-4 py-2 bg-blue-600 text-white rounded">{children}</button>;
}
```

### To add a database:

Follow `.kilocode/recipes/add-database.md`

### To add API routes:

Create `src/app/api/[route]/route.ts`:
```tsx
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Hello" });
}
```

## Available Recipes

| Recipe | File | Use Case |
|--------|------|----------|
| Add Database | `.kilocode/recipes/add-database.md` | Data persistence with Drizzle + SQLite |

## Pending Improvements

- [ ] Add more recipes (auth, email, etc.)
- [ ] Add example components
- [ ] Add testing setup recipe

## Session History

| Date | Changes |
|------|---------|
| Initial | Template created with base setup |
| 2026-03-19 | Removed Next.js, switched to Vite SPA with CAPTCHA DELL'INFERNO |
