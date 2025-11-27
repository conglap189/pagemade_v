# Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

# Code Style Guidelines

- Use TypeScript with strict mode disabled (tsconfig.json:16)
- Import React components with `"use client"` directive for client-side components
- Use absolute imports with `@/` prefix for src directory (tsconfig.json:9-12)
- Follow Next.js App Router structure with page.tsx files
- Use Tailwind CSS for styling with prettier-plugin-tailwindcss
- Component files use PascalCase, export default
- Type definitions in /types directory with export type
- ESLint extends next/core-web-vitals
- Prettier config includes Tailwind plugin for class sorting
