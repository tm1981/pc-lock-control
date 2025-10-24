# Project Brief: PC Lock Control

**PC Lock Control** is a web-based companion application for a Python utility that locks and unlocks PCs remotely. This Next.js application provides a centralized dashboard to manage multiple PCs, schedule automatic lock/unlock times, and control them manually.

It communicates with the Python utility on each PC via a REST API, using a server-side proxy to ensure secure communication. The application uses a PostgreSQL database managed by Prisma ORM to store data about the PCs and their schedules. The UI is built with Shadcn/ui and Tailwind CSS.
