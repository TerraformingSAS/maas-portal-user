# UI Components & Accessibility Standards

A consistent, accessible, and highly robust User Interface is the hallmark of enterprise software. This document outlines the strict usage of our internal component library and the non-negotiable accessibility (a11y) standards.

---

## 1. UI Architecture (`itc-frontend-base`)

We employ an internal Component Library (`itc-frontend-base`). **You are strictly forbidden from writing native HTML elements (like `<input>`, `<button>`, `<table>`) directly in the application if an equivalent component exists in the library.**

### Styling with Tailwind CSS 4
All styling is done via Tailwind CSS. 
- Use the `className` prop to style the outer container of any library component.
- **Deep Overrides**: When you need to override the internal styles of a library component, use Tailwind's arbitrary variants targeting the specific internal class. 
- **Specificity**: Because internal library components have their own compiled CSS, you **MUST** use the `!important` modifier (`!`) in your Tailwind classes to guarantee that your overrides take precedence.

```tsx
// ✅ Correct: Overriding internal styles using arbitrary variants and !important
<ItcInput 
  className="mb-4" // Targets the wrapper
  inputClassName="[&_.itc-input-container]:!bg-purple-50 [&_.itc-input-element]:!text-purple-900" 
/>
```

---

## 2. Exhaustive Component API Reference

### `ItcDateRangePicker`
An advanced, highly customizable date range selector.

| Property | Type | Description |
|----------|------|-------------|
| `value` | `DateRange` | The controlled value of the range `{ from: Date, to: Date }` |
| `onChange` | `(range: DateRange) => void` | Event emitted when a date is selected. Intelligent auto-reset applies. |
| `minDate` | `Date` | Disables all calendar days strictly *before* this date. |
| `maxDate` | `Date` | Disables all calendar days strictly *after* this date. |
| `inputClassName`| `string` | Tailwind classes to override the `ItcInput` visual styles (e.g., `!bg-black`). |
| `popoverClassName`| `string` | Tailwind classes to override the floating calendar popup (e.g., `!bg-gray-900`). |
| `className` | `string` | Applied to the wrapper. Ideal for injecting CSS variables like `--color-primary-600` to change the calendar selection color. |
| `dataTestId` | `string` | ID used for Vitest/RTL `getByTestId` locating. |
| `ariaLabel` | `string` | Passed to the input for screen reader identification. |
| `ariaDescribedBy`| `string` | ID of the element that provides additional context/error description. |

**Example: Fully Customized Dark Mode Picker with Bounded Limits**
```tsx
import { ItcDateRangePicker } from 'itc-frontend-base';
import { addDays, subDays } from 'date-fns';

export const BookingForm = () => {
  return (
    <div className="my-custom-theme">
      <style>{`
        .my-custom-theme {
          --color-primary-100: #374151; /* Range middle background */
          --color-primary-600: #10b981; /* Main Emerald selection color */
        }
      `}</style>
      
      <ItcDateRangePicker
        label="Select Booking Dates"
        minDate={new Date()} // Cannot book in the past
        maxDate={addDays(new Date(), 90)} // Can only book up to 90 days out
        
        // Dark theme overrides
        inputClassName="[&_.itc-input-container]:!bg-gray-900 [&_.itc-input-element]:!text-white"
        popoverClassName="!bg-gray-900 !border-gray-800 !text-white shadow-2xl"
        className="my-custom-theme"
        
        // Testing and Accessibility
        dataTestId="booking-date-picker"
        ariaLabel="Booking Date Range Selection"
        ariaDescribedBy="booking-helper-text"
      />
      <span id="booking-helper-text" className="sr-only">
        Select a start and end date for your reservation.
      </span>
    </div>
  );
};
```

### `ItcInput`
The universal input component supporting text, passwords, selects, and checkboxes.

- **Props**: `type`, `label`, `helperText`, `errorMessage`, `successMessage`, `icon`, `suffix`, `clearable`, `loading`.
- **States**: Handled automatically via `disabled`, `readOnly`, `errorMessage` (triggers error borders).

---

## 3. Strict Accessibility (a11y) Standards

Accessibility is a non-negotiable requirement. The application must comply with standard WCAG 2.1 AA guidelines.

### 1. Semantic HTML
Never use `<div>` or `<span>` when a semantic tag exists.
- Use `<button>` for actions (clicks). Never attach `onClick` to a `<div>`.
- Use `<nav>` for navigation links.
- Use `<article>`, `<section>`, and `<main>` to outline the document structure.

### 2. ARIA Attributes
When visual cues are not sufficient for a screen reader, use ARIA attributes.
- **`aria-label` / `ariaLabel`**: Use when an element has no visible text (e.g., an icon-only "X" close button).
  - `<button aria-label="Close modal"><XIcon /></button>`
- **`aria-describedby` / `ariaDescribedBy`**: Use to link an input to its validation error or helper text so the screen reader announces it immediately upon focus.

### 3. Keyboard Navigation
Users must be able to navigate the entire application using only the `Tab`, `Enter`, `Space`, and `Arrow` keys.
- Never use `outline: none` without providing an alternative `:focus-visible` state.
- If building a custom interactive element (which should be rare given the component library), assign `tabIndex={0}` and attach an `onKeyDown` listener handling `Enter` and `Space`.

### 4. Focus Trapping
When modals, popovers, or dialogs open, keyboard focus MUST be trapped inside the modal until it is closed. The focus should return to the triggering element upon closure. (The `itc-frontend-base` modal components handle this automatically).
