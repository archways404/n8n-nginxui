# TVX-SITE-TEMPLATE

A starter template for new web applications, built with:

- [Vite](https://vite.dev/) — build tool and dev server
- [React](https://react.dev/) (JavaScript, no TypeScript)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/) — copy-in, ownable UI components (Radix primitives, Lucide icons)

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL in your browser.

## Scripts

| Command           | Description                         |
| ------------------ | ------------------------------------ |
| `npm run dev`     | Start the Vite dev server with HMR  |
| `npm run build`   | Type-check-free production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint`    | Lint the project with oxlint         |

## Project structure

```
src/
  components/
    ui/          # shadcn/ui components (Button, Card, Badge, ...)
  lib/
    utils.js     # cn() class-merging helper
  App.jsx        # app entry component
  main.jsx       # React root / mount point
  index.css      # Tailwind entry + shadcn theme tokens
components.json  # shadcn/ui configuration
```

## Adding more shadcn/ui components

```bash
npx shadcn@latest add <component>
```

Browse available components at [ui.shadcn.com](https://ui.shadcn.com/docs/components).

## Path aliases

The `@` alias points to `src/`, e.g. `import { Button } from '@/components/ui/button'`. This is configured in [vite.config.js](vite.config.js) and [jsconfig.json](jsconfig.json).
