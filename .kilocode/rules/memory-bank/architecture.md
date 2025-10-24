# Architecture

## System Architecture

The application is a Next.js web application that acts as a frontend for a Python-based PC locking utility. It communicates with the Python utility via a REST API. The Next.js application includes a server-side proxy to forward requests from the client to the individual PCs. Data about the PCs and their schedules is stored in a standalone PostgreSQL database managed by Prisma ORM.

## Source Code Paths

-   **Frontend Components**: `components/`
    -   `pc-control-dashboard.tsx`: The main dashboard for viewing and controlling PCs.
    -   `pc-management.tsx`: Component for adding, editing, and deleting PCs.
    -   `schedule-management.tsx`: Component for managing lock/unlock schedules.
-   **API Routes**: `app/api/`
    -   `pc-proxy/`: Contains the server-side proxy endpoints that communicate with the Python application.
-   **Client-side API Utilities**: `lib/pc-api.ts`
    -   Functions for making requests to the Next.js proxy API from the frontend.
-   **Database Integration**: `lib/db.ts` and `lib/actions/`
    -   `lib/db.ts`: Prisma client instance.
    -   `lib/actions/`: Next.js Server Actions for all database CRUD operations using Prisma.
-   **Database Schema**: `scripts/`
    -   SQL scripts for creating and migrating the database schema.

## Key Technical Decisions

-   **Next.js as a Full-stack Framework**: Next.js is used for both the frontend UI and the backend API proxy, simplifying the stack.
-   **Prisma ORM**: Prisma is used for type-safe database access to a standalone PostgreSQL instance. All data access is now handled server-side via Server Actions.
-   **Server-side Proxy**: A proxy is used to securely communicate with the PCs on the local network from the web application, avoiding CORS issues and hiding PC IP addresses from the client.
-   **Shadcn/ui for Components**: The UI is built using the Shadcn/ui component library, which provides a set of accessible and customizable components.

## Component Relationships

The main page (`app/page.tsx`) assembles the three core components: `PcControlDashboard`, `PcManagement`, and `ScheduleManagement`. These components are largely independent and interact with the database exclusively through Next.js Server Actions.

## Critical Implementation Paths

1.  **Adding a PC**: The user fills out a form in the `PcManagement` component, which triggers a Server Action (`createPc`) to save the PC's information to the `pcs` table via Prisma.
2.  **Controlling a PC**: The `PcControlDashboard` component fetches the list of PCs using a Server Action (`getPcs`). Control actions (lock/unlock) are sent to the Next.js proxy API, which then forwards the request to the appropriate PC.
3.  **Scheduling**: The `ScheduleManagement` component allows users to create and manage schedules via Server Actions (`upsertSchedule`, `toggleScheduleEnabled`), which are stored in the `pc_schedules` table via Prisma. The Python application is responsible for fetching and executing these schedules.