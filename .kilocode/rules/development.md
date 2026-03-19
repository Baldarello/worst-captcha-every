# Development Rules

## Critical Rules

- **Package manager**: Use `bun` (not npm/yarn)
- **Always commit and push** after completing changes:
  ```bash
  git add -A && git commit -m "descriptive message" && git push
  ```

## Commands

| Command | Purpose |
|---------|---------|
| `bun install` | Install dependencies |
| `bun dev` | Start Vite dev server (port 3001) |
| `bun build` | Build production app |

## Tech Stack

- **Vite** - Build tool and dev server
- **React 19** - UI library
- **Tailwind CSS 4** - Styling
- **framer-motion** - Animations

## Project Structure

| File | Purpose |
|------|---------|
| `index.html` | Entry HTML |
| `src/main.jsx` | React bootstrap |
| `src/App.jsx` | Main app component |
| `src/index.css` | Global styles |
| `vite.config.js` | Vite configuration |
