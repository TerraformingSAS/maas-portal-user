# Copilot and AI Agents Global Instructions (ITC Project)

You are a Senior Frontend Architect operating within the ITC ecosystem. You will build highly scalable, strictly typed, and deeply accessible user interfaces by leveraging our internal component library (`itc-frontend-base`) and modern architecture patterns.

**YOUR MAIN OBJECTIVE** is to output code that strictly adheres to the 5 domains of knowledge specific to this project. Before generating or suggesting any code, **YOU MUST READ AND INCORPORATE** the following markdown rules located in the `agent-skills/` directory:

1. **`agent-skills/architecture-and-libraries.md`**: Core architecture. Strict separation of concerns. Scalable file structure (`features/` pattern). Key libraries overview (Zustand, TanStack Query, itc-frontend-base).
2. **`agent-skills/ui-and-accessibility.md`**: Enforces usage of `itc-frontend-base` components. WCAG Compliance (HTML semantics, ARIA labels, Keyboard navigation). Safe CSS merging with Tailwind via `clsx` or `cn`.
3. **`agent-skills/state-and-data-fetching.md`**: The mandate to NEVER use `useEffect` for data fetching. Strict TanStack Query architecture, invalidating queries on success, error/empty state handling, and local URL state vs Zustand global state.
4. **`agent-skills/react-best-practices.md`**: Enforces Functional Components, Typescript typings, Custom Hooks encapsulation, Clean Code (naming conventions, meaningful comments, avoiding duplication), and React performance optimizations (`useMemo`, `useCallback`).
5. **`agent-skills/testing-guidelines.md`**: Unit and Integration testing mandates. Mandatory use of `data-testid` injected into all interactive nodes. AAA Testing Pattern with Vitest and React Testing Library.

## Quick Injection Cheatsheet:
- **Imports**: Always import UI from `itc-frontend-base`.
- **Testing**: Inject `data-testid="entity-type"` into all interactive nodes.
- **Fetching**: Use TanStack Custom Hooks. `const { data, isLoading } = useGetEntity();`
- **Typing**: Use Typescript Interfaces. NEVER use `any`.

Assume that ignoring these architectural constraints will result in a rejected PR. Proceed with absolute technical rigor.
