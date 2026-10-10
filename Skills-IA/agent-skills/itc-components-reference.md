# Component Library Complete Reference (`itc-frontend-base`)

Our internal component library provides a strict, standardized set of 13 UI elements. You **MUST** use these components instead of native HTML tags. 

*Note on styling*: All components support `className` (applied to their outermost wrapper) and `dataTestId`. To override internal component styles, use Tailwind arbitrary variants combined with `!important` (e.g., `[&_.itc-input-container]:!bg-gray-100`).

---

## 1. `ItcInput`
The universal input component supporting all data entry types.

| Property | Type | Description |
|----------|------|-------------|
| `type` | `string` | Supports: `text`, `email`, `password`, `number`, `date`, `file`, `select`, `textarea`, `checkbox`, `radio`, `switch`. |
| `label` | `string` | Visual and accessible label. |
| `placeholder` | `string` | Placeholder text inside the field. |
| `helperText` | `string` | Contextual help text below the field. |
| `errorMessage` | `string` | Turns the input red and displays the error message. |
| `successMessage`| `string` | Turns the input green and displays the success message. |
| `icon` / `suffix` | `ReactNode` | Left/Right side icons. |
| `clearable` | `boolean` | Adds an "X" button to clear the value. |
| `variant` | `string` | `'outlined'` (default), `'filled'`, `'flushed'`, `'ghost'`. |
| `size` | `string` | `'sm'`, `'md'`, `'lg'`. |
| `disabled` / `readOnly` | `boolean` | State flags. |

**Example:**
```tsx
<ItcInput type="email" label="Email" icon={<Mail />} required />
<ItcInput type="switch" label="Enable Notifications" defaultChecked />
<ItcInput type="select" label="Role"><option value="1">Admin</option></ItcInput>
```

---

## 2. `ItcButton`
Standard action trigger component.

| Property | Type | Description |
|----------|------|-------------|
| `variant` | `string` | `'primary'`, `'secondary'`, `'outlined'`, `'ghost'`, `'danger'`. |
| `size` | `string` | `'sm'`, `'md'`, `'lg'`. |
| `loading` | `boolean` | Disables button and replaces icon with spinner. |
| `leftIcon` / `rightIcon`| `ReactNode`| Icons adjacent to the text. |
| `disabled` | `boolean` | Disables interaction. |

**Example:**
```tsx
<ItcButton variant="primary" loading={isSaving} leftIcon={<Save />}>Save</ItcButton>
```

---

## 3. `ItcTable`
Advanced data grid component.

| Property | Type | Description |
|----------|------|-------------|
| `columns` | `TableColumn[]`| `[{ key, title, width, align, render: (row) => JSX }]` |
| `data` | `Array` | Array of row objects. |
| `rowKey` | `function` | Extractor function for the unique row ID (`(row) => row.id`). |
| `showSearch` | `boolean` | Renders a global search input above the table. |
| `pagination` | `boolean` | Enables pagination controls. |
| `pageSize` | `number` | Items per page (if pagination enabled). |
| `loading` | `boolean` | Renders a skeleton overlay. |
| `emptyState` | `ReactNode` | Rendered when `data` is empty. |
| `onRowClick` | `function` | Fired when a table row is clicked. |

**Example:**
```tsx
<ItcTable 
  columns={[{ key: 'name', title: 'Name' }, { key: 'action', title: '', render: () => <ItcButton>Edit</ItcButton> }]} 
  data={users} 
  pagination={true}
  pageSize={10}
/>
```

---

## 4. `ItcModal`
Highly customizable dialog component.

| Property | Type | Description |
|----------|------|-------------|
| `open` | `boolean` | Controls visibility. |
| `onClose` / `onOpen`| `function` | Lifecycle callbacks. |
| `title` / `description` | `ReactNode` | Header text. |
| `content` / `children` | `ReactNode` | Body of the modal. |
| `variant` | `string` | `'default'`, `'confirm'`, `'alert'`, `'success'`, `'info'`, `'form'`. |
| `size` | `string` | `'xs'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'full'`. |
| `animationType`| `string` | `'fade'`, `'zoom'`, `'slide'`, `'bounce'`. |
| `closeOnBackdrop` | `boolean` | Close when clicking outside. |
| `onConfirm` / `onCancel`| `function` | Auto-injects footer buttons handling these callbacks. |

**Example:**
```tsx
<ItcModal open={isOpen} onClose={close} title="Confirm" variant="alert" onConfirm={handleDelete} />
```

---

## 5. `ItcDateRangePicker`
Date range selector.

| Property | Type | Description |
|----------|------|-------------|
| `value` | `DateRange` | Controlled `{ from: Date, to: Date }` |
| `onChange` | `function` | Callback receiving the new range. |
| `minDate` / `maxDate` | `Date` | Strict boundary limits to disable past/future days. |
| `inputClassName` | `string` | Tailwind overrides for the input wrapper. |
| `popoverClassName`| `string` | Tailwind overrides for the calendar popup. |
| `ariaDescribedBy` | `string` | Links input to error texts for screen readers. |

**Example:**
```tsx
<ItcDateRangePicker minDate={new Date()} maxDate={addDays(new Date(), 30)} />
```

---

## 6. `ItcTabs`
Accessible navigation tabs.

| Property | Type | Description |
|----------|------|-------------|
| `items` | `TabItem[]` | `[{ key, label, icon, children, disabled, tooltip }]` |
| `activeKey` / `defaultActiveKey` | `string` | Controlled / Uncontrolled state keys. |
| `variant` | `string` | `'pills'`, `'underline'`, `'minimal'`, `'segmented'`, `'cards'`, `'fullBackground'`. |
| `onChange` | `function` | Callback `(key: string) => void`. |
| `keyboardNavigation` | `boolean` | Enables arrow keys (default `true`). |
| `iconPosition` | `string` | `'left'` or `'top'`. |

**Example:**
```tsx
<ItcTabs variant="segmented" items={[{ key: '1', label: 'Profile', children: <Profile /> }]} />
```

---

## 7. `ItcForm`
Unified form wrapper for layout and submission.

| Property | Type | Description |
|----------|------|-------------|
| `layout` | `string` | `'vertical'`, `'horizontal'`, `'inline'`. |
| `columns` | `number` | CSS Grid columns (`1` to `4`). |
| `initialValues` | `object` | Form payload values. |
| `validationSchema` | `any` | Yup/Zod schema object. |
| `loading` / `disabled` | `boolean` | Propagates to all children fields. |
| `onSubmit` | `function` | Callback `(values: TValues) => void`. |

**Example:**
```tsx
<ItcForm onSubmit={save} layout="vertical" columns={2}>
  <ItcInput name="name" label="Name" />
</ItcForm>
```

---

## 8. `ItcButtonCard`
Large clickable card acting as a macro-option or CTA.

| Property | Type | Description |
|----------|------|-------------|
| `title` / `description` | `string` | Main texts. |
| `icon` / `image` | `ReactNode` | Media elements. |
| `variant` | `string` | `'default'`, `'outlined'`, `'elevated'`, `'filled'`, `'glass'`. |
| `status` | `string` | `'success'`, `'warning'`, `'error'`, `'info'`. |
| `size` | `string` | `'sm'`, `'md'`, `'lg'`. |
| `onClick` | `function` | Standard click handler. |
| `badge` | `string` | Text string to render as a floating badge. |

**Example:**
```tsx
<ItcButtonCard title="New Project" icon={<Plus />} variant="elevated" onClick={openCreation} />
```

---

## 9. `ItcMenu`
Collapsible sidebar navigation.

| Property | Type | Description |
|----------|------|-------------|
| `items` | `MenuItem[]` | `[{ id, label, icon, children }]` tree structure. |
| `collapsed` | `boolean` | Toggles icon-only mode vs expanded mode. |
| `theme` | `string` | `'light'` or `'dark'`. |
| `onToggle` | `function` | Fired when collapse button is pressed. |
| `onItemClick` | `function` | Fired when a route is clicked. |

**Example:**
```tsx
<ItcMenu theme="dark" collapsed={false} items={routes} onItemClick={nav} />
```

---

## 10. `ItcBanner`
System-wide notification block.

| Property | Type | Description |
|----------|------|-------------|
| `variant` | `string` | `'info'`, `'success'`, `'warning'`, `'error'`. |
| `title` / `content` | `ReactNode` | Banner messaging. |
| `closable` | `boolean` | Renders an "X" button to dismiss. |
| `onClose` | `function` | Dismiss callback. |
| `icon` | `ReactNode` | Override the default variant icon. |

**Example:**
```tsx
<ItcBanner variant="warning" title="Maintenance" content="Downtime expected." closable />
```

---

## 11. `ItcCarousel`
Image or content slider.

| Property | Type | Description |
|----------|------|-------------|
| `items` | `CarouselImage[]`| List of media objects or React components. |
| `autoplay` | `boolean` | Auto-slide enabled. |
| `interval` | `number` | Milliseconds between slides. |
| `showControls` / `showIndicators`| `boolean`| Arrows and bottom dots toggles. |
| `effect` | `string` | Transition effect type (e.g. `'slide'`). |
| `onSlideChange`| `function` | Callback firing on index change. |

**Example:**
```tsx
<ItcCarousel items={[<img src="1.jpg"/>, <img src="2.jpg"/>]} autoplay interval={5000} />
```

---

## 12. `ItcGovcoBar`
Institutional header branding bar (GOV.CO standard).

| Property | Type | Description |
|----------|------|-------------|
| `variant` | `string` | `'top'` or `'bottom'`. |
| `theme` | `string` | `'light'` or `'dark'`. |
| `showLogo` | `boolean` | Toggles standard logo. |
| `entityName` / `contactEmail` | `string` | Institutional data. |
| `socialLinks` | `SocialLink[]` | Array of social icons/urls. |
| `fixed` | `boolean` | `true` makes the bar sticky. |

**Example:**
```tsx
<ItcGovcoBar variant="top" entityName="Ministerio de las TIC" fixed />
```

---

## 13. `ItcAccessibilityToolbar`
Floating accessibility toolkit (contrast, text resizing).

| Property | Type | Description |
|----------|------|-------------|
| `position` | `string` | `'bottom-right'`, `'bottom-left'`, `'center-right'`, `'center-left'`. |
| `showScrollToTop`| `boolean` | Adds an automatic "Back to top" button underneath. |
| `showAfter` | `number` | Pixels scrolled before showing the bar. |
| `animated` | `boolean` | Toggle fade/slide animation. |

**Example:**
```tsx
<ItcAccessibilityToolbar position="center-right" showScrollToTop={true} animated={true} />
```
