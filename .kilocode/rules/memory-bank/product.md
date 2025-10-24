# Product

## Why this project exists

This project is a web-based companion application for a Python script that can lock and unlock a personal computer. It provides a user-friendly interface to manage and control multiple PCs remotely.

## Problems it solves

-   Provides a centralized dashboard to control multiple PCs.
-   Eliminates the need to manually run the Python script for each PC.
-   Allows for scheduling automatic lock and unlock times.
-   Simplifies the management of PC credentials and connection details.

## How it should work

The web application allows users to add, edit, and remove PCs by providing their name, IP address, port, and the password for the Python script. Once a PC is added, it appears on a control dashboard. From this dashboard, users can:

-   View the current lock status of each PC (Locked, Unlocked, Checking, or Error).
-   Manually lock or unlock a PC.
-   Configure a daily schedule to automatically lock and unlock the PC at specified times.

The web application communicates with the Python script on each PC via a REST API. The Next.js application acts as a proxy, forwarding requests from the user's browser to the respective PC's API.

## User experience goals

-   **Simple and Intuitive:** The interface should be easy to understand and use, even for non-technical users.
-   **Responsive:** The application should work well on both desktop and mobile devices.
-   **Informative:** The user should always have clear feedback on the status of their PCs and the results of their actions.