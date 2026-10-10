# React Best Practices & Coding Standards

This document outlines the strict coding standards required to maintain a high-quality React 19 codebase. Code quality, predictability, and performance are paramount.

---

## 1. Functional Components & Strict TypeScript

We write exclusively **Functional Components**. Class components are deprecated and strictly prohibited.

### Strict TypeScript Typing
Every component, prop, state, and function MUST be explicitly typed. The use of `any` is strictly forbidden. 
- Use `interface` for object shapes and component props.
- Use `type` for unions, intersections, and primitive aliases.
- Export complex interfaces in a separate `.types.ts` file alongside your component.

```tsx
// UserProfile.types.ts
export interface UserProfileProps {
  userId: string;
  isActive: boolean;
  onStatusChange: (newStatus: boolean) => void;
  metadata?: Record<string, string>; // Example of typing an object map
}

// UserProfile.tsx
import React from 'react';
import type { UserProfileProps } from './UserProfile.types';
import { ItcButton } from 'itc-frontend-base';

export const UserProfile: React.FC<UserProfileProps> = ({ 
  userId, 
  isActive, 
  onStatusChange 
}) => {
  return (
    <div className="p-4 border rounded">
      <h2>User: {userId}</h2>
      <ItcButton onClick={() => onStatusChange(!isActive)}>
        Toggle Status
      </ItcButton>
    </div>
  );
};
```

---

## 2. Deep Dive into Performance Optimization

React is fast by default, but complex applications require strategic memoization to prevent rendering bottlenecks. **Do not prematurely optimize**, but apply these rules strictly when rendering large lists or passing callbacks to heavily memoized children.

### `useMemo`
Use `useMemo` to memoize expensive calculations or to preserve referential equality of objects/arrays passed as props downstream.

```tsx
// ✅ Correct usage: Memoizing a filtered list to prevent recalculation on every render
const activeUsers = useMemo(() => {
  return users.filter(user => user.status === 'ACTIVE').sort((a, b) => a.score - b.score);
}, [users]);
```

### `useCallback`
Use `useCallback` to preserve referential equality of functions. This is crucial when passing functions to child components wrapped in `React.memo` or when the function is a dependency in a `useEffect`.

```tsx
// ✅ Correct usage: The function reference stays the same unless dependencies change,
// preventing the child <MemoizedTable /> from re-rendering unnecessarily.
const handleRowDelete = useCallback(async (rowId: string) => {
  await deleteUser(rowId);
  refetchUsers();
}, [deleteUser, refetchUsers]);
```

---

## 3. Custom Hooks (Logic Extraction)

To adhere to the Single Responsibility Principle (SRP), components should primarily focus on the UI/View layer. Complex business logic, state management, and data fetching must be extracted into Custom Hooks.

### The Pattern
Create a hook like `use[FeatureName].ts` and return the state and handler functions.

```tsx
// hooks/useAuthForm.ts
import { useState } from 'react';

export const useAuthForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await authenticate(email, password);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { email, setEmail, password, setPassword, isSubmitting, handleSubmit };
};

// components/AuthForm.tsx
import { useAuthForm } from '../hooks/useAuthForm';
import { ItcInput, ItcButton } from 'itc-frontend-base';

export const AuthForm = () => {
  const { email, setEmail, password, setPassword, isSubmitting, handleSubmit } = useAuthForm();

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <ItcInput value={email} onChange={(e) => setEmail(e.target.value)} label="Email" />
      <ItcInput type="password" value={password} onChange={(e) => setPassword(e.target.value)} label="Password" />
      <ItcButton loading={isSubmitting} type="submit">Login</ItcButton>
    </form>
  );
};
```

---

## 4. Import Organization

A clean import block prevents merge conflicts and improves readability. Group and order your imports logically with a single empty line between groups:

1. **React Core** (`react`, `react-router-dom`)
2. **Third-Party Libraries** (`date-fns`, `lucide-react`)
3. **Component Libraries** (`itc-frontend-base`)
4. **Internal Absolute Imports** (`@/features/...`, `@/shared/...`)
5. **Relative Imports** (`./hooks/...`, `../utils/...`)
6. **Types & CSS** (`type { ... } from './types'`, `./styles.css`)

---

## 5. Clean Code & Scalability Principles

- **DRY (Don't Repeat Yourself)**: Extract duplicated JSX into small, reusable sub-components. If two components share the same 50 lines of JSX, create a `<SharedCard />`.
- **Meaningful Names**: Code is read more often than it is written. Use highly descriptive, intent-revealing names.
  - ❌ `const flag = true;`
  - ✅ `const isSubscriptionActive = true;`
  - ❌ `const handle = () => {}`
  - ✅ `const handleFormSubmission = () => {}`
- **Comments as "Why", not "What"**: Your code should read like English. Only use comments to explain complex business rules or peculiar workarounds.
  - ❌ `// Filter active users` (The code `users.filter(u => u.active)` already says this)
  - ✅ `// We filter out legacy users here because the backend v1 API still returns them`

---

## 6. Next.js Specifics (`'use client'`)

When building in **Next.js (App Router)**, components are Server Components by default. 
- You MUST add the `'use client'` directive at the very top of the file if the component uses any React Hooks (`useState`, `useEffect`, `useMemo`, `useCallback`, etc.), handles user interactions (`onClick`, `onChange`), or relies on browser-only APIs (`window`, `document`).
- Keep Client Components as leaf nodes in your component tree as much as possible. Do not put `'use client'` at the root of a page unless absolutely necessary, as it de-optimizes server rendering for all its children.

---

## 7. General Development & Agent Rules (Strict)

These rules apply globally to all automated code generation:

- **DO NOT create `README.md` files**: When scaffolding new components, features, or directories, **never** generate `README.md` files. They add unnecessary clutter and provide zero value to the developers.
- **Environment Variables**: Pay close attention to the build tool being used:
  - **Vite Projects**: You MUST access environment variables using `import.meta.env.VITE_VARIABLE_NAME`. Attempting to use `process.env` in Vite will crash the application.
  - **Next.js Projects**: You MUST access client-side environment variables using `process.env.NEXT_PUBLIC_VARIABLE_NAME`.
