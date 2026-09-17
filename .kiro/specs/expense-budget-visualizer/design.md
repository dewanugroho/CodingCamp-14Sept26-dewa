# Design — Expense & Budget Visualizer

## File Structure

```
expense-budget-visualizer/
├── index.html                  # Single-page HTML shell
├── css/
│   └── style.css               # All styles (one file per TC-4)
├── js/
│   └── app.js                  # All logic (one file per TC-4)
└── .kiro/
    └── specs/
        └── expense-budget-visualizer/
            ├── requirements.md
            ├── design.md
            └── tasks.md
```

---

## HTML Structure (`index.html`)

Chart.js 4.4.0 is loaded from jsDelivr CDN. Both external scripts use `defer`
so they execute after the DOM is parsed.

```
<html data-theme="light">           ← theme attribute toggled by JS
  <head>
    Chart.js CDN (defer)
    app.js (defer)
    style.css
  </head>
  <body>
    <header>
      App title
      #theme-toggle button

    <main>
      .balance-card               → #total-balance
      .form-card
        #transaction-form         → #item-name, #amount, #category
        .custom-category-section  → #custom-category-input, #add-category-btn
      .summary-card               → #month-selector, #summary-content
      .content-grid
        .list-card                → #transaction-list (ul)
        .chart-card               → #spending-chart (canvas)

    <footer>
```

---

## CSS Architecture (`style.css`)

### Theming

All colors are declared as CSS custom properties on `:root` / `[data-theme="light"]`
and overridden on `[data-theme="dark"]`. Toggling the theme is a single
`setAttribute` call in JS — no class manipulation needed.

Key variable groups:
- `--color-bg`, `--color-surface`, `--color-surface-alt`, `--color-border`
- `--color-primary`, `--color-danger`, `--color-text`, `--color-text-muted`
- `--color-balance-bg`, `--color-balance-text`
- Per-category badge colors: `--color-badge-food(-text)`, `--color-badge-transport(-text)`, `--color-badge-fun(-text)`, `--color-badge-custom(-text)`
- `--shadow-sm`, `--shadow-md`, `--radius`, `--transition`

### Layout

- Mobile-first single column (`flex-direction: column`) on `<main>`
- `.content-grid` uses CSS Grid: `1fr` by default, `1fr 1fr` at `min-width: 640px`
- Header is `position: sticky; top: 0` so the theme toggle and title stay visible while scrolling

### Category Badges

Four CSS classes handle badge coloring:
`.badge-food`, `.badge-transport`, `.badge-fun`, `.badge-custom`

The `badgeClass()` JS function maps a category string to the correct class.
Any category not in the default three receives `.badge-custom`.

---

## JavaScript Architecture (`app.js`)

### Data Model

```js
// Single transaction object shape
{
  id:       number,   // Date.now() at creation — unique, doubles as sort key
  name:     string,   // user-entered item name (HTML-escaped on render)
  amount:   number,   // positive float, 2 decimal places
  category: string,   // must exist in categories[]
  date:     string,   // "YYYY-MM-DD" ISO date (auto-stamped on creation)
}

// In-memory arrays
let transactions = [];   // persisted under "ebv_transactions"
let categories   = [];   // persisted under "ebv_categories"

// Chart.js instance (module-level, single reference)
let chartInstance = null;
```

### localStorage Keys

| Key                | Value |
|--------------------|-------|
| `ebv_transactions` | JSON array of transaction objects |
| `ebv_categories`   | JSON array of category strings |
| `ebv_theme`        | `"light"` or `"dark"` |

All reads are wrapped in `try/catch`. On parse failure the app falls back to
empty arrays and default categories so it never hard-crashes.

### Module Sections (labeled in source)

| # | Section | Responsibilities |
|---|---------|-----------------|
| 1 | Constants & storage keys | `STORAGE_KEYS`, `DEFAULT_CATEGORIES`, `CHART_COLORS` palette |
| 2 | In-memory state | `transactions`, `categories`, `chartInstance` |
| 3 | localStorage helpers | `loadFromStorage`, `saveTransactions`, `saveCategories` |
| 4 | Computation helpers | `getTotalBalance`, `getSpendingByCategory`, `getAvailableMonths`, `currentYearMonth`, `formatYearMonth`, `formatCurrency`, `badgeClass`, `colorForIndex` |
| 5–9 | Render functions | One function per UI region (balance, dropdown, list, chart, summary) |
| 10 | `renderAll` | Calls all five render functions in sequence |
| 11 | Form validation | `setFieldError`, `clearFieldError`, `validateForm` |
| 12 | Event handlers | `handleFormSubmit`, `handleDeleteClick`, `handleAddCategory`, `handleMonthChange`, `handleThemeToggle` |
| 13 | Theme init | `initTheme` — reads localStorage before first paint |
| 14 | Utility | `escapeHtml` — sanitises all user strings before DOM insertion |
| 15 | Boot | `init` — wires all listeners, loads data, calls `renderAll` |

### Data Flow

```
Page load
  └─ initTheme()              reads ebv_theme, sets data-theme, updates button label
  └─ loadFromStorage()        parses ebv_transactions + ebv_categories
  └─ renderAll()              paints every region from in-memory state

User submits form
  └─ validateForm()           inline errors if invalid → abort
  └─ push transaction         new { id, name, amount, category, date }
  └─ saveTransactions()
  └─ renderAll()

User clicks delete
  └─ filter transactions[]    by id (via event delegation on #transaction-list)
  └─ saveTransactions()
  └─ renderAll()

User adds custom category
  └─ duplicate check          case-insensitive
  └─ push to categories[]
  └─ saveCategories()
  └─ renderCategoryDropdown() auto-selects new category

User changes month selector
  └─ renderMonthlySummary()   filters transactions by selected "YYYY-MM"

User toggles theme
  └─ flip data-theme attr     on <html>
  └─ update button label
  └─ save to ebv_theme
  └─ renderChart()            redraws with updated CSS variable colors
```

### Chart.js Integration

- Chart is destroyed and recreated on every `renderChart()` call. This avoids
  Chart.js internal state bugs when datasets or colors change.
- Colors are derived by mapping each category to its index in `categories[]`,
  then looking up `CHART_COLORS[index % CHART_COLORS.length]`. This gives every
  category — including custom ones — a consistent, distinct color.
- Legend and border colors are read from computed CSS variables at render time,
  so they automatically reflect the current theme.

### Security

`escapeHtml()` is applied to every user-supplied string (`name`, `category`)
before it is written into `innerHTML`. This prevents stored XSS from crafted
transaction names or category strings.

---

## Responsive Breakpoints

| Breakpoint | Layout change |
|-----------|--------------|
| < 640px   | Single column, stacked cards |
| ≥ 640px   | `.content-grid` → two columns (list + chart side by side) |
| ≥ 960px   | Main container horizontal padding removed (max-width centers it) |
