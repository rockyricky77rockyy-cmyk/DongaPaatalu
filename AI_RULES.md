# AI Rules for Harmonix - Neon Music Streaming

This document outlines the core technologies used in this project and provides guidelines for using specific libraries to maintain consistency and best practices.

## Tech Stack Description

*   **React**: A JavaScript library for building user interfaces.
*   **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript, enhancing code quality and maintainability.
*   **Vite**: A fast build tool that provides a lightning-fast development experience.
*   **Tailwind CSS**: A utility-first CSS framework for rapidly building custom designs.
*   **shadcn/ui**: A collection of re-usable components built with Radix UI and Tailwind CSS.
*   **React Router**: A standard library for routing in React applications.
*   **TanStack Query**: A powerful asynchronous state management library for React.
*   **Lucide React**: A library providing a set of beautiful and customizable SVG icons.
*   **React Hook Form & Zod**: Libraries for efficient form management and schema-based validation.
*   **Sonner & Radix UI Toast**: Libraries for displaying toast notifications.

## Library Usage Rules

To ensure a consistent and maintainable codebase, please adhere to the following rules when developing:

*   **Framework**: All new features and components must be built using **React** and **TypeScript**.
*   **Build Tool**: **Vite** is the designated build tool for this project.
*   **Styling**:
    *   Always use **Tailwind CSS** for all styling. Avoid inline styles or custom CSS files unless absolutely necessary for very specific, isolated cases.
    *   Utilize Tailwind's responsive utility classes (`sm:`, `md:`, `lg:`, etc.) to ensure designs are responsive across different screen sizes.
*   **UI Components**:
    *   Prioritize using components from **shadcn/ui**. These components are pre-styled and accessible.
    *   If a required component is not available in shadcn/ui or needs significant custom styling/logic, create a new, dedicated component file in `src/components/`. **Do not modify shadcn/ui component files directly.**
*   **Routing**:
    *   Use **React Router** for all client-side navigation.
    *   All main application routes should be defined within `src/App.tsx`.
*   **Icons**:
    *   Use icons from the **lucide-react** library.
*   **Form Handling**:
    *   For forms, use **React Hook Form** for state management and validation.
    *   For schema validation, use **Zod** in conjunction with React Hook Form.
*   **Data Fetching & State Management**:
    *   For asynchronous data fetching and caching, use **TanStack Query**.
*   **Toasts/Notifications**:
    *   For simple, non-interactive notifications, use **Sonner**.
    *   For more complex or interactive toast notifications, use the **shadcn/ui/toast** system.
*   **Mobile Responsiveness**:
    *   Always consider mobile-first design principles. The `useIsMobile` hook (from `src/hooks/use-mobile.tsx`) is available for conditional rendering based on screen size.
*   **File Structure**:
    *   Place all page components in `src/pages/`.
    *   Place all reusable UI components in `src/components/`.
    *   Place custom React hooks in `src/hooks/`.
    *   Place general utility functions in `src/lib/`.