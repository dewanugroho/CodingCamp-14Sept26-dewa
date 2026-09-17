# Tasks — Expense & Budget Visualizer

All tasks below are marked with their completion status.
Requirements and design references point to `requirements.md` and `design.md`
in this same spec folder.

---

## Phase 1 · Project Scaffold

- [x] **T-01** Create folder structure: `css/`, `js/`, `.kiro/specs/`
- [x] **T-02** Create `index.html` shell with `<head>` meta, Chart.js CDN link, and `defer` script tag for `app.js`
- [x] **T-03** Create placeholder `css/style.css` and `js/app.js`

---

## Phase 2 · HTML Structure

- [x] **T-04** Add `data-theme="light"` attribute to `<html>` element
- [x] **T-05** Add sticky `<header>` with app title and `#theme-toggle` button
- [x] **T-06** Add `.balance-card` section with `#total-balance` display
- [x] **T-07** Add `.form-card` section with `#transaction-form`
  - [x] `#item-name` text input + `#name-error` span
  - [x] `#amount` number input + `#amount-error` span
  - [x] `#category` select with default options (Food, Transport, Fun) + `#category-error` span
  - [x] Submit button
- [x] **T-08** Add `.custom-category-section` inside `.form-card`
  - [x] `#custom-category-input` text input
  - [x] `#add-category-btn` button
  - [x] `#custom-category-error` span
- [x] **T-09** Add `.summary-card` section
  - [x] `#month-selector` select
  - [x] `#summary-empty` empty-state paragraph
  - [x] `#summary-content` div (hidden by default) with `#summary-total-amount` and `#summary-breakdown` list
- [x] **T-10** Add `.content-grid` with `.list-card` (`#transaction-list` ul, `#empty-state`) and `.chart-card` (`#spending-chart` canvas, `#chart-empty`)
- [x] **T-11** Add `<footer>` with attribution text

---

## Phase 3 · CSS Styling

- [x] **T-12** Define CSS custom properties for light theme on `:root` / `[data-theme="light"]`
- [x] **T-13** Define CSS custom property overrides for `[data-theme="dark"]`
- [x] **T-14** Style reset, base `body`, and font stack
- [x] **T-15** Style sticky `.app-header` with flex layout
- [x] **T-16** Style `.theme-btn` as pill-shaped toggle
- [x] **T-17** Style `.app-main` as centered flex column with gap
- [x] **T-18** Style `.card` base (surface color, border, radius, shadow)
- [x] **T-19** Style `.balance-card` with large amount display
- [x] **T-20** Style form elements: labels, inputs, select, error spans, `.btn-primary`, `.btn-secondary`
- [x] **T-21** Style `.custom-category-section` with top border separator and flex row
- [x] **T-22** Style `.summary-card` header row (title + selector inline)
- [x] **T-23** Style `.summary-breakdown` list items
- [x] **T-24** Style `.content-grid` — single column mobile, two-column at 640px
- [x] **T-25** Style `.transaction-list` (scrollable, max-height, custom scrollbar)
- [x] **T-26** Style `.transaction-item`, `.transaction-info`, `.transaction-meta`, `.transaction-right`
- [x] **T-27** Add category badge classes: `.badge-food`, `.badge-transport`, `.badge-fun`, `.badge-custom`
- [x] **T-28** Style `.chart-wrapper` with max-width and auto margin
- [x] **T-29** Style `.empty-state` paragraphs
- [x] **T-30** Style `.app-footer`
- [x] **T-31** Add responsive tweaks at 640px and 960px breakpoints

---

## Phase 4 · JavaScript — Core MVP

- [x] **T-32** Define `STORAGE_KEYS`, `DEFAULT_CATEGORIES`, and `CHART_COLORS` constants
- [x] **T-33** Declare module-level state: `transactions`, `categories`, `chartInstance`
- [x] **T-34** Implement `loadFromStorage` and `saveTransactions` / `saveCategories` with try/catch
- [x] **T-35** Implement `getTotalBalance` and `getSpendingByCategory` computation helpers
- [x] **T-36** Implement `renderBalance` — updates `#total-balance`
- [x] **T-37** Implement `renderCategoryDropdown` — rebuilds `#category` options from `categories[]`
- [x] **T-38** Implement `renderTransactionList` — rebuilds `#transaction-list` from `transactions[]`, newest first; toggles `#empty-state`
- [x] **T-39** Implement `renderChart` — destroys and recreates Chart.js pie chart; handles empty state
- [x] **T-40** Implement `renderAll` — calls all render functions in sequence
- [x] **T-41** Implement `validateForm` with per-field `setFieldError` / `clearFieldError`
- [x] **T-42** Implement `handleFormSubmit` — validates, builds transaction object with `Date.now()` id and ISO date stamp, pushes, saves, renders, resets form
- [x] **T-43** Implement `handleDeleteClick` — event delegation on `#transaction-list`, filters by id, saves, renders
- [x] **T-44** Implement `escapeHtml` utility and apply to all `innerHTML` insertions of user data

---

## Phase 5 · JavaScript — Challenge Features

- [x] **T-45** Implement `getAvailableMonths`, `currentYearMonth`, `formatYearMonth` helpers (FR-5)
- [x] **T-46** Implement `renderMonthlySummary` — populates `#month-selector`, filters transactions by selected month, renders total + per-category breakdown (FR-5)
- [x] **T-47** Implement `handleMonthChange` — calls `renderMonthlySummary` on selector change (FR-5)
- [x] **T-48** Implement `handleAddCategory` — validates, deduplicates, pushes to `categories[]`, saves, re-renders dropdown, auto-selects new category (FR-6)
- [x] **T-49** Wire `keydown Enter` on `#custom-category-input` to `handleAddCategory` (FR-6)
- [x] **T-50** Implement `colorForIndex` using `CHART_COLORS` palette with modulo wrap-around (FR-6.5)
- [x] **T-51** Implement `initTheme` — reads `ebv_theme` from localStorage, sets `data-theme`, updates button label (FR-7)
- [x] **T-52** Implement `handleThemeToggle` — flips `data-theme`, updates button text, saves preference, calls `renderChart` to refresh colors (FR-7)

---

## Phase 6 · Boot & Wiring

- [x] **T-53** Implement `init` function — calls `initTheme`, `loadFromStorage`, attaches all event listeners, calls `renderAll`
- [x] **T-54** Register `init` on `DOMContentLoaded`

---

## Potential Future Tasks

- [ ] **T-55** Add budget limit per category with over-budget visual warning
- [ ] **T-56** Add data export to CSV / JSON download
- [ ] **T-57** Add data import from JSON file
- [ ] **T-58** Add edit transaction functionality (inline or modal)
- [ ] **T-59** Add bar chart view as an alternative to pie chart
- [ ] **T-60** Add unit tests for computation helpers (`getTotalBalance`, `getSpendingByCategory`, `validateForm`)
