# CLAUDE.md - LLM E-commerce Project Guide

## Project Commands
- Build: `npm run build` 
- Dev server: `npm run dev`
- Test (all): `npm run test`
- Test (single): `npm run test -- -t "test name"`
- Lint: `npm run lint`
- Typecheck: `npm run typecheck`

## Code Style Guidelines
- **Formatting**: Use Prettier with default settings
- **Imports**: Group imports (React, third-party, internal) with blank line separators
- **Naming**:
  - React components: PascalCase
  - Variables/functions: camelCase
  - Constants: UPPER_SNAKE_CASE
- **Types**: Use TypeScript with explicit return types on functions
- **Error handling**: Try/catch blocks with proper error logging
- **Component structure**: Props interface above component definition
- **File organization**: Group related components/utilities in feature directories

This project is an e-commerce application built with React/Next.js and TypeScript.