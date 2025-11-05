# Alpaco Frontend

Next.js 16 web application built with React 19 and TypeScript.

## Tech Stack

- Next.js 16.0.1 (App Router)
- React 19.2.0
- TypeScript
- Tailwind CSS v4
- Zustand ^5.0.8 (State management)
- ESLint

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm run start
```

## Project Structure

```
frontend/
├── app/
│   ├── admin/
│   │   └── page.tsx        # Admin page
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx    # Login page
│   │   └── register/
│   │       └── page.tsx    # Register page
│   ├── drops/
│   │   └── [id]/
│   │       ├── page.tsx   # Drop details page
│   │       └── claim/
│   │           └── page.tsx  # Claim drop page
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
├── store/
├── public/
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── eslint.config.mjs
├── next.config.ts
├── next-env.d.ts
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── tsconfig.json
└── README.md 
```

## Routes

- `/` - Home page (drop list)
- `/auth/login` - User login page
- `/auth/register` - User registration page
- `/drops/[id]` - Drop details page (dynamic route)
- `/drops/[id]/claim` - Claim drop page (dynamic route)
- `/admin` - Admin panel page

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server