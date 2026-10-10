---
name: testing-guidelines
description: Testing standards using Vitest and React Testing Library (RTL)
license: MIT
compatibility: opencode
---

## What I do
- Enforce behavior-driven testing over implementation testing.
- Mandate accessible DOM queries (e.g., getByRole).
- Provide patterns for mocking TanStack Query hooks.

## When to use me
Use this skill whenever writing, debugging, or reviewing unit and integration tests.

# Testing Guidelines & Philosophy

Testing is not an afterthought; it is a core engineering requirement. A robust test suite allows our consultancy teams to refactor aggressively, deploy confidently, and ensure zero regressions. We utilize **Vitest** for test execution and **React Testing Library (RTL)** for DOM assertions.

---

## 1. The Core Philosophy of RTL

React Testing Library is built on a simple premise: **"The more your tests resemble the way your software is used, the more confidence they can give you."**

- **Do NOT** test implementation details (like asserting internal component state variables).
- **DO** test what the user sees and interacts with (e.g., clicking a button and asserting that text appears on the screen).

---

## 2. Robust Element Selection Strategy

Tests become brittle when they rely on CSS classes or deep HTML hierarchy. 

### The Selection Hierarchy
1. **Accessible Roles**: Always try to use `getByRole` first. It ensures your element is accessible.
   - `screen.getByRole('button', { name: /submit/i })`
2. **Label Texts**: For inputs and forms.
   - `screen.getByLabelText(/password/i)`
3. **Static Text**: For paragraphs or static headers.
   - `screen.getByText(/user dashboard/i)`
4. **`dataTestId`**: Use `dataTestId` (mapped to `data-testid` in the DOM) when semantic roles or text are unavailable or dynamic. This is especially useful for wrappers, SVGs, or custom complex components like DateRangePickers.
   - `screen.getByTestId('dashboard-chart-wrapper')`

---

## 3. Unit vs. Integration Testing

### Unit Tests (Component Level)
Focus on isolated behavior of a single component.
- Verify conditional rendering (e.g., passing `disabled={true}` disables the input).
- Verify error states and empty states.
- Mock all external custom hooks and context providers.

### Integration Tests (Feature Level)
Focus on multiple components interacting together, usually wrapping them in necessary Providers (like `QueryClientProvider`).
- Verify that submitting a form calls the mutation hook.
- Verify that changing a dropdown filters the list displayed below it.

---

## 4. Advanced Mocking Strategy (TanStack Query)

Since we strictly use TanStack Query for all API interactions, you will frequently need to mock its hooks (`useQuery` and `useMutation`) in your test files to simulate server responses.

### Simulating a Full Network Lifecycle

```tsx
// UserDashboard.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { UserDashboard } from './UserDashboard';
import { useUsersQuery } from './hooks/useUsersQuery';

// 1. Mock the hook path
vi.mock('./hooks/useUsersQuery', () => ({
  useUsersQuery: vi.fn()
}));

describe('UserDashboard Integration Tests', () => {
  
  it('displays a loading spinner initially', () => {
    // Simulate the pending state
    vi.mocked(useUsersQuery).mockReturnValue({ 
      isLoading: true, 
      data: undefined, 
      isError: false 
    } as any);
    
    render(<UserDashboard />);
    
    // Assert the loader is present
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('displays the user list when fetch is successful', () => {
    // Simulate a successful payload
    const mockUsers = [{ id: 1, name: 'Alice Engineering' }];
    vi.mocked(useUsersQuery).mockReturnValue({ 
      isLoading: false, 
      data: mockUsers, 
      isError: false 
    } as any);
    
    render(<UserDashboard />);
    
    expect(screen.getByText('Alice Engineering')).toBeInTheDocument();
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
  });

  it('displays the error state and handles the retry click', async () => {
    // Simulate a network failure
    const mockRefetch = vi.fn();
    vi.mocked(useUsersQuery).mockReturnValue({ 
      isLoading: false, 
      data: undefined, 
      isError: true,
      refetch: mockRefetch
    } as any);
    
    render(<UserDashboard />);
    
    // Assert error message exists
    expect(screen.getByText(/failed to load users/i)).toBeInTheDocument();
    
    // Simulate user clicking retry
    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);
    
    // Verify our hook's refetch function was triggered
    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });
  });
});
```

---

## 5. Accessibility Testing in RTL

RTL is designed to encourage accessible HTML. By enforcing `getByRole`, your tests inherently verify accessibility.
Additionally, you should verify `aria-*` attributes for dynamic interactive components.

```tsx
it('applies the correct aria-labels to the custom date picker', () => {
  render(<MyCustomForm />);
  
  const dateInput = screen.getByTestId('booking-date-picker');
  
  // Verify screen readers will read the correct descriptive text
  expect(dateInput).toHaveAttribute('aria-label', 'Booking Date Range Selection');
});
```
