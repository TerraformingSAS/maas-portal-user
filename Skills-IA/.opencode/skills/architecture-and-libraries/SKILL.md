---
name: architecture-standards
description: Standards for frontend architecture and libraries
license: MIT
compatibility: opencode
---

## What I do
- Enforce the foundational architecture and library choices.
- Ensure long-term scalability and maintainability.

## When to use me
Use this skill when setting up the project architecture, choosing libraries, or structuring the foundational layer of the frontend application.

# Architecture & Key Libraries: Frontend Engineering Standards

This document establishes the foundational architecture and library choices for the frontend application. These standards are designed to ensure long-term scalability, maintainability, and a seamless developer experience across large, distributed engineering teams.

---

## 1. Feature-Based Architecture (Screaming Architecture)

To avoid the common pitfall of massive `components/` and `hooks/` directories that become unmanageable as the application grows, this project strictly adheres to a **Feature-Based Architecture**. This approach is inspired by Domain-Driven Design (DDD) and "Screaming Architecture," where the folder structure clearly communicates the business domains of the application.

### Why Feature-Based?
- **High Cohesion**: Everything related to a specific business feature is co-located.
- **Low Coupling**: Features are isolated, making them easier to refactor, test, and extract into micro-frontends if necessary.
- **Scalability**: New developers can easily understand where code lives without navigating a massive flat hierarchy.

### Scalable File Structure Pattern

```text
src/
  ├── app/                       # Global app setup (Providers, App Router configuration)
  ├── features/                  # Business domains
  │   └── [FeatureName]/         # e.g., 'auth', 'user-management', 'billing'
  │       ├── api/               # API request functions (axios/fetch calls) specific to the feature
  │       ├── components/        # UI Components that belong ONLY to this feature
  │       ├── hooks/             # Custom React hooks (logic, TanStack queries/mutations)
  │       ├── store/             # Zustand stores handling local global state for this feature
  │       ├── types/             # TypeScript definitions and interfaces
  │       ├── utils/             # Helper functions and parsers
  │       └── index.ts           # Public API (Barrel file) - defines what other modules can import
  ├── shared/                    # Shared resources used across multiple features
  │   ├── components/            # Global/Shared components (if not part of itc-frontend-base)
  │   ├── hooks/                 # Global hooks (e.g., useWindowSize, useTheme)
  │   ├── lib/                   # Third-party library configurations (axios instance, query client)
  │   ├── types/                 # Global types (e.g., PaginationResult, ApiError)
  │   └── utils/                 # Global utilities (e.g., formatCurrency, formatDate)
  └── assets/                    # Static assets (images, global CSS)
```

### Module Boundaries and the Barrel Pattern
**Strict Rule**: Features must **never** import directly from the internal folders of another feature. All cross-feature communication must happen through the target feature's `index.ts` file.

**Example of Barrel Export (`src/features/users/index.ts`)**
```ts
// ONLY expose what is necessary for the rest of the app to consume.
// Keep internal components and utilities private by not exporting them here.
export { UserList } from './components/UserList';
export { UserProfileDropdown } from './components/UserProfileDropdown';
export { useUsersQuery } from './hooks/useUsersQuery';
export type { User } from './types/user.types';
```

**Usage in another feature:**
```ts
// ✅ Correct
import { UserList } from '@/features/users';

// ❌ Incorrect (Breaks encapsulation)
import { UserList } from '@/features/users/components/UserList';
```

---

## 2. Key Libraries & The "Why" Behind Them

Our stack is carefully selected to separate concerns, specifically dividing **Server State** from **Client State**.

### 1. `itc-frontend-base` (Internal Component Library)
We utilize a bespoke, centralized UI library. 
- **Why?** To guarantee absolute design consistency across all screens, enforce accessibility standards out-of-the-box, and reduce code duplication. You **must** use `ItcInput`, `ItcButton`, `ItcDateRangePicker`, etc., instead of building native HTML elements.

### 2. React 19
- **Why?** Leveraging the latest concurrent features, optimized rendering, and the strict adherence to functional, declarative programming.

### 3. Zustand (Client/Global State)
- **Why?** Zustand provides a minimalistic, hook-based API for global state without the heavy boilerplate of Redux or the performance pitfalls of the React Context API (which triggers re-renders on all consumers).
- **Usage**: Use exclusively for client-side global state (e.g., UI themes, sidebar toggles, multi-step wizard data).

### 4. TanStack Query (Server State)
- **Why?** The server owns the data; the frontend merely displays a cache of it. React Query handles caching, background synchronization, deduping multiple requests, and optimistic updates.
- **Usage**: Use for **all** asynchronous data fetching. Never use `useEffect` + `useState` for API calls.

### 5. Tailwind CSS 4
- **Why?** Utility-first CSS allows for rapid prototyping, guarantees a consistent design token system (colors, spacing), and ensures that unused CSS is purged in production.

### 6. Lucide React
- **Why?** A modern, consistent, and highly customizable SVG icon library that tree-shakes perfectly in modern bundlers.

---

## 3. Communication Patterns

### Feature-to-Feature Communication
Features should remain as decoupled as possible. If Feature A needs to interact with Feature B:
1. **Via URL/Routing**: Pass IDs in the URL parameters.
2. **Via Shared Global State**: Use a shared Zustand store if the state is truly global.
3. **Via Props**: If Feature A renders Feature B, pass minimal primitive props.

### Component-to-Component Communication
- **Parent to Child**: Standard React props.
- **Child to Parent**: Callback functions passed as props (`onUpdate`, `onChange`).
- **Deeply Nested**: Use Zustand for complex state rather than prop-drilling more than 3 levels deep.

---

## 4. Next.js Specifics (App Router Architecture)

When building in **Next.js**, the feature-based structure remains entirely intact with a slight shift in how the `app/` folder is treated:

- **`src/app/`**: Strictly acts as the **Routing Layer**. Files here (`page.tsx`, `layout.tsx`) should do almost nothing except define the route, handle SEO (metadata), perform server-side data fetching, and immediately import and render a "Feature" component.
- **`src/features/`**: This is where your actual page logic, client components, and heavy UI structures live.

**Next.js Example:**
```tsx
// src/app/dashboard/page.tsx (Server Component)
import { DashboardFeature } from '@/features/dashboard';

export default function Page() {
  return <DashboardFeature />;
}
```
