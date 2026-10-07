# Money Matters

A local-first personal finance dashboard for tracking income, expenses, and transactions directly in the browser.

## Features

- Dashboard totals for balance, credits, debits, and recent transactions
- Transaction add/edit/delete flows with search and filters
- Profile editing and local storage persistence
- Responsive layout and accessible UI components

## Run locally

From the repository root:

```bash
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal, usually:

```text
http://localhost:21091
```

## Build

```bash
npm run build
```

The production build is written to the repository-root `dist` directory, which matches Vercel's default output directory.

## Preview

```bash
npm run preview
```

## Notes

- The app stores data in browser localStorage.
- It runs as a standalone React + Vite application and does not require a backend or database.
