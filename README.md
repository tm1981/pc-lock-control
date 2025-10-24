# PC Lock Control

A simple web UI to control and schedule the locking/unlocking of remote PCs. This Next.js application stores connection info and schedules in a standalone PostgreSQL database and communicates with a lightweight API running on each target PC.

---

## ✨ Features

-   **Centralized Dashboard**: Monitor and control multiple PCs from a single interface.
-   **Manual Control**: Instantly lock or unlock any configured PC.
-   **PC Management**: Easily add, edit, and remove PC connection details.
-   **Schedule Automation**: Configure daily schedules for automatic locking and unlocking.
-   **Secure Proxy**: All communication with remote PCs is proxied through the Next.js server, enhancing security and avoiding browser-based network issues.

---

## 🛠️ Tech Stack

-   **Framework**: Next.js 15 (App Router), React 19
-   **Language**: TypeScript
-   **Database**: PostgreSQL
-   **ORM**: Prisma for type-safe database access
-   **Data Fetching**: Next.js Server Actions
-   **Styling**: Tailwind CSS v4 with shadcn/ui components
-   **Deployment**: Docker support included

---

## 📂 Project Structure

```
/
├── app/
│   ├── api/pc-proxy/       # Next.js proxy routes to remote PCs
│   ├── layout.tsx
│   └── page.tsx            # Main application page
├── components/
│   ├── pc-control-dashboard.tsx
│   ├── pc-management.tsx
│   ├── schedule-management.tsx
│   └── ... (UI components)
├── lib/
│   ├── actions/            # Server Actions for database operations
│   │   ├── pc.ts
│   │   └── schedule.ts
│   ├── db.ts               # Prisma client instance
│   └── pc-api.ts           # Client for calling the Next.js proxy
├── prisma/
│   ├── schema.prisma       # Prisma database schema
│   └── migrations/         # Database migration history
├── scripts/
│   ├── 001_create_pcs_table.sql      # (Legacy) Initial table schema
│   └── 002_add_schedule_table.sql    # (Legacy) Schedule table schema
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

-   Node.js 18+
-   A running PostgreSQL database.
-   A reachable PC API on your network (see [Remote PC API](#remote-pc-api) below).

### Setup Instructions

1.  **Install Dependencies**

    ```bash
    npm install
    # or
    pnpm install
    ```

2.  **Configure Environment Variables**

    Create a `.env` file in the project root and add your database connection string:

    ```env
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
    ```

    > **Note**: Restart the development server after changing the `.env` file.

3.  **Run Database Migrations**

    Prisma uses the schema in `prisma/schema.prisma` to manage the database tables. Run the following command to create the `pcs` and `pc_schedules` tables:

    ```bash
    npx prisma migrate dev --name init
    ```

4.  **Start the Application**

    ```bash
    npm run dev
    # or
    pnpm dev
    ```

    Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔌 API Endpoints

### Remote PC API

Each managed PC must expose a simple HTTP API with the following endpoints:

| Method | Endpoint             | Body                                                 | Response                  |
| :----- | :------------------- | :--------------------------------------------------- | :------------------------ |
| `GET`  | `/api/status`        | (None)                                               | `{ "locked": boolean }`   |
| `POST` | `/api/lock`          | `{ "password": "..." }`                              | (Status 200 OK)           |
| `POST` | `/api/unlock`        | `{ "password": "..." }`                              | (Status 200 OK)           |
| `POST` | `/api/schedule`      | `{ "password": "...", "enabled": ..., "start": ..., "end": ... }` | (Status 200 OK)           |

### Internal Proxy Endpoints

The web UI calls its own server-side proxy endpoints, which then forward requests to the target PCs. This avoids CORS and mixed-content issues.

| Method | Proxy Endpoint         | Forwards To     | Body                                                 |
| :----- | :--------------------- | :-------------- | :--------------------------------------------------- |
| `POST` | `/api/pc-proxy/status` | `/api/status`   | `{ "ip": "...", "port": ... }`                       |
| `POST` | `/api/pc-proxy/lock`   | `/api/lock`     | `{ "ip": "...", "port": ..., "password": "..." }`      |
| `POST` | `/api/pc-proxy/unlock` | `/api/unlock`   | `{ "ip": "...", "port": ..., "password": "..." }`      |
| `POST` | `/api/pc-proxy/schedule`| `/api/schedule` | `{ "ip": "...", "port": ..., "password": "...", "schedule": ... }` |

---

## 🐳 Docker Deployment

A runtime-configurable Docker image is provided for easy deployment.

1.  **Build the Image**

    ```bash
    docker build -t pc-lock-control .
    ```

2.  **Run with Docker**

    ```bash
    docker run --rm -p 3000:3000 \
      -e DATABASE_URL="postgresql://user:password@host:5432/pc_lock_control?schema=public" \
      pc-lock-control
    ```

3.  **Example `docker-compose.yml`**

    ```yaml
    version: "3.9"
    services:
      app:
        image: your-dockerhub-user/pc-lock-control:latest
        ports:
          - "3000:3000"
        environment:
          DATABASE_URL: "postgresql://user:password@host:5432/pc_lock_control?schema=public"
        # Add networks and extra_hosts as needed so the container can reach your PCs
    ```

---

## 🔍 Troubleshooting

-   **Error: "Can't reach database server"**
    -   Ensure your `DATABASE_URL` in `.env` is correct and that the PostgreSQL server is running and accessible.
-   **Error: "The table ... does not exist in the current database."**
    -   Run the Prisma migration command: `npx prisma migrate dev`.
-   **Network Errors in UI**
    -   The app uses server-side proxies. Ensure the host running the Next.js app (your machine, a server, or a Docker container) can reach the target PC's IP and port. Check firewalls and network routing.

---

## 🔐 Security Notes

-   PC passwords are currently stored in the database. The browser client never sees these passwords; only the server-side proxy uses them to communicate with the remote PC API.
-   For production hardening, consider moving to a more robust secret management solution.

---

## 📝 TODO

-   Harden security and add authentication.
-   Add health checks/retries for device connectivity.
-   Add end-to-end tests for proxy routes.
