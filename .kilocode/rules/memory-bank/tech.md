# Technologies

## Frontend

-   **Framework**: Next.js (v15) with React (v19)
-   **Language**: TypeScript
-   **UI Components**: Shadcn/ui, built on Radix UI
-   **Styling**: Tailwind CSS
-   **Form Management**: React Hook Form with Zod for validation
-   **Fonts**: Geist Sans and Geist Mono

## Backend

-   **Framework**: Next.js API Routes
-   **Database**: PostgreSQL (managed via Prisma ORM)
-   **ORM**: Prisma
-   **Authentication**: None (removed Supabase Auth dependency)

## Development

-   **Package Manager**: The user seems to be using `pnpm` based on the presence of `pnpm-lock.yaml`.
-   **Linting**: ESLint
-   **Build Tool**: Next.js CLI (`next build`)

## Key Dependencies

-   `@prisma/client` and `prisma`: For database access and schema management.
-   `lucide-react`: For icons.
-   `next-themes`: For theme management (e.g., dark mode).
-   `sonner`: For toast notifications.
-   `shadcn/ui` related packages (`@radix-ui/*`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tailwindcss-animate`): Core of the UI component library.