# Routing & Role-Based Authorization (Base Structure)

This document provides the foundational pattern for handling protected routes and role-based access control (RBAC) in our frontend applications. 

*Note for Developers: This is a baseline structure. You must adapt the `Role` enum and the specific routing library (e.g., React Router v6, TanStack Router) depending on the project's exact requirements.*

---

## 1. Authentication State (Zustand)

Authorization relies on a robust global authentication state. You should maintain the user session and their roles within a Zustand store.

```ts
// src/shared/store/useAuthStore.ts
import { create } from 'zustand';

// Modify these roles based on the specific project requirements
export type UserRole = 'ADMIN' | 'MANAGER' | 'USER' | 'GUEST';

interface AuthUser {
  id: string;
  name: string;
  roles: UserRole[];
}

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  // Methods to login/logout would go here
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
}));
```

---

## 2. Protected Route Wrapper

A `ProtectedRoute` component ensures that only authenticated users can access specific pages. If a guest tries to access a protected URL, they are immediately redirected to the login page.

```tsx
// src/shared/components/guards/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/shared/store/useAuthStore';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectTo = '/login' 
}) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect them to the login page, but save the current location they were 
    // trying to go to, so we can redirect them back after a successful login.
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If children are provided, render them. Otherwise, render nested routes via Outlet.
  return children ? <>{children}</> : <Outlet />;
};
```

---

## 3. Role-Based Guard (RBAC)

A `RoleGuard` component wraps around pages or specific UI elements (like buttons) to conditionally render them only if the authenticated user possesses the required role.

```tsx
// src/shared/components/guards/RoleGuard.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore, UserRole } from '@/shared/store/useAuthStore';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children?: React.ReactNode;
  fallbackRoute?: string;
  showFallbackUI?: boolean;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ 
  allowedRoles, 
  children, 
  fallbackRoute = '/unauthorized',
  showFallbackUI = false
}) => {
  const user = useAuthStore((state) => state.user);
  
  // Check if the user has AT LEAST ONE of the required roles
  const hasRequiredRole = user?.roles.some(role => allowedRoles.includes(role));

  if (!hasRequiredRole) {
    // If it's a UI element (like a button), we might just want to hide it completely
    if (!showFallbackUI && !fallbackRoute) return null;
    
    // If it's a page route, redirect to an unauthorized access page
    return <Navigate to={fallbackRoute} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
```

---

## 4. Example: Router Configuration

This is how you assemble the guards in your main Router configuration to protect entire sections of the application.

```tsx
// src/app/AppRouter.tsx
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/shared/components/guards/ProtectedRoute';
import { RoleGuard } from '@/shared/components/guards/RoleGuard';

// Pages
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { AdminSettingsPage } from '@/features/admin/pages/AdminSettingsPage';
import { UnauthorizedPage } from '@/shared/pages/UnauthorizedPage';

export const AppRouter = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected Routes (Requires Authentication) */}
      <Route element={<ProtectedRoute />}>
        
        <Route path="/dashboard" element={<DashboardPage />} />
        
        {/* Role-Protected Routes (Requires Authentication AND specific Role) */}
        <Route element={<RoleGuard allowedRoles={['ADMIN', 'MANAGER']} />}>
          <Route path="/settings" element={<AdminSettingsPage />} />
        </Route>

      </Route>
    </Routes>
  );
};
```

---

## 5. Inline UI Conditional Rendering

You can also use the `RoleGuard` to conditionally render individual elements on a page without causing redirects. Just omit the `fallbackRoute` and set `showFallbackUI={false}` (which is the default).

```tsx
// Example inside a component
<RoleGuard allowedRoles={['ADMIN']}>
  <ItcButton variant="danger" onClick={handleDeleteSystem}>
    Delete System
```

---

## 6. Next.js Specifics (App Router)

If you are implementing this in **Next.js (App Router)**, the client-side `ProtectedRoute` pattern shown above should be replaced or augmented by **Server-Side Middleware**.

In Next.js, you protect routes before they even render by using `middleware.ts` at the root of your project:

```ts
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Extract token from cookies (since Zustand local storage isn't available on the server)
  const token = request.cookies.get('auth_token')?.value;

  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Optional: Decode JWT to check Roles (RBAC) on the server side
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/settings/:path*'],
};
```
For inline UI hiding in Next.js, you can still use the `RoleGuard` component, but remember it must include the `'use client'` directive at the top of the file since it relies on Zustand (which uses React Hooks).
