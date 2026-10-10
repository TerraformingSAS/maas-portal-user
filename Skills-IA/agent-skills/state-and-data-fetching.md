# State Management & Data Fetching Mastery

Frontend state is generally divided into two distinct categories: **Client State** (owned by the browser) and **Server State** (owned by the database, cached in the browser). Mixing these two causes massive synchronization bugs.

---

## 1. Client State Management (Zustand)

For local, UI-specific state (like a toggle, a form input, or an accordion), standard React `useState` and `useReducer` are perfectly fine. However, when state needs to be accessed globally across disconnected components (e.g., Theme, Authentication, Multi-step Wizard), we strictly use **Zustand**.

### Why Zustand over Redux or Context API?
- **No Boilerplate**: No actions, reducers, or dispatchers.
- **Performance**: Unlike React Context, Zustand allows components to subscribe to specific "slices" of the store. A component will ONLY re-render if the specific property it subscribed to changes.

### Zustand Best Practices & Implementation
Always define an Interface for your store. If the store grows large, split it into Slices.

```ts
import { create } from 'zustand';

// 1. Define the Interface
interface AppSettingsState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  toggleTheme: () => void;
  setSidebar: (isOpen: boolean) => void;
}

// 2. Create the Store
export const useAppSettingsStore = create<AppSettingsState>((set) => ({
  theme: 'light',
  sidebarOpen: true,
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  setSidebar: (isOpen) => set({ sidebarOpen: isOpen }),
}));
```

**Crucial Usage Rule**: Always select only the properties you need to avoid unnecessary re-renders.
```tsx
// ✅ Correct (Only re-renders if 'theme' changes)
const theme = useAppSettingsStore((state) => state.theme);

// ❌ Incorrect (Re-renders if ANY property in the store changes)
const store = useAppSettingsStore();
const theme = store.theme;
```

---

## 2. Server State Management (TanStack Query / React Query)

**ALL** data fetching and mutation MUST be handled via TanStack Query. It manages caching, deduping requests, background refetching, and pagination out of the box. **Never use `useEffect` to fetch data.**

### Queries (Fetching Data)
Separate your queries into custom hooks. Define the `queryKey` securely (it acts as the cache identifier).

```tsx
// hooks/useUsersQuery.ts
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { User } from '../types';

const fetchUsers = async (): Promise<User[]> => {
  const { data } = await axios.get('/api/users');
  return data;
};

export const useUsersQuery = () => {
  return useQuery({
    queryKey: ['users', 'list'], // Array-based key for cache
    queryFn: fetchUsers,
    staleTime: 1000 * 60 * 5, // Data stays fresh for 5 minutes
    retry: 2, // Retry failing requests twice before throwing error
  });
};
```

### Mutations (Updating Data) & Cache Invalidation
When you create, update, or delete data, use `useMutation`. Upon success, you must invalidate the relevant queries so the UI updates automatically.

```tsx
// hooks/useCreateUserMutation.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export const useCreateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newUser: { name: string }) => axios.post('/api/users', newUser),
    onSuccess: () => {
      // Invalidates the cache for ['users', 'list'], triggering an automatic background refetch!
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] });
    },
  });
};
```

---

## 3. UI State Lifecycle Handling (Loading, Error, Empty)

A professional UI gracefully handles all states of a network request. You must **always** handle `isLoading`, `isError`, and empty payloads.

### The Standard Pattern

```tsx
import React from 'react';
import { useUsersQuery } from './hooks/useUsersQuery';
import { ItcButton } from 'itc-frontend-base';
import { AlertCircle, Loader2 } from 'lucide-react';

export const UserDashboard = () => {
  const { data: users, isLoading, isError, refetch } = useUsersQuery();

  // 1. Loading State (Spinner or Skeleton)
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin text-primary-500" size={32} />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  // 2. Error State (Actionable Retry)
  if (isError) {
    return (
      <div className="bg-red-50 p-4 rounded flex items-center justify-between">
        <div className="flex items-center text-red-700">
          <AlertCircle className="mr-2" />
          <span>Failed to load users. Please check your connection.</span>
        </div>
        <ItcButton onClick={() => refetch()} variant="outlined">Retry</ItcButton>
      </div>
    );
  }

  // 3. Empty State (Zero data returned)
  if (!users || users.length === 0) {
    return (
      <div className="text-center p-12 bg-gray-50 rounded">
        <h3 className="text-lg font-semibold">No Users Found</h3>
        <p className="text-gray-500">There are no users matching the current criteria.</p>
        <ItcButton className="mt-4">Create First User</ItcButton>
      </div>
    );
  }

  // 4. Success State (Render payload)
  return (
    <ul className="divide-y">
      {users.map(user => (
        <li key={user.id} className="p-4">{user.name}</li>
      ))}
    </ul>
  );
};
```

---

## 4. Next.js Specifics (Server vs Client Data Fetching)

When working in **Next.js (App Router)**, the paradigm shifts significantly:

- **Server Components (Default)**: Do NOT use TanStack Query here. Server components execute on the server, so you can perform data fetching directly using async/await with **Axios** (our standard library) or a direct database/ORM call.
  ```tsx
  // app/dashboard/page.tsx (Server Component)
  import axios from 'axios';
  import { UserList } from '@/features/users/components/UserList';

  export default async function DashboardPage() {
    // Direct server-side fetching using Axios
    const { data: users } = await axios.get('https://api.example.com/users');
    
    return <UserList initialUsers={users} />;
  }
  ```

- **Client Components (`'use client'`)**: Use TanStack Query here just like in standard React SPA. If the user interacts with the UI (e.g., submitting a form, clicking a filter), you must mutate or refetch the data client-side using TanStack Query, as Server Components cannot hold interactive state.
