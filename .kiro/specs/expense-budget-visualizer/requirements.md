# Requirements — Expense & Budget Visualizer

## Overview

A mobile-friendly web app that helps users track daily spending. It shows a
running total balance, a scrollable transaction history, a pie chart of
spending by category, a monthly summary view, support for custom categories,
and a dark/light mode toggle. All data is stored client-side using the browser
Local Storage API — no backend or server required.

---

## Technical Constraints

| ID   | Constraint |
|------|-----------|
| TC-1 | HTML for structure, CSS for styling, Vanilla JavaScript only — no frameworks (React, Vue, etc.) |
| TC-2 | Browser Local Storage API only — no backend, all data client-side |
| TC-3 | Must work in modern browsers: Chrome, Firefox, Edge, Safari |
| TC-4 | Only 1 CSS file (`css/style.css`) and 1 JavaScript file (`js/app.js`) |

---

## Functional Requirements

### FR-1 · Input Form

- **FR-1.1** The form shall include three fields: Item Name (text), Amount (number), and Category (select).
- **FR-1.2** All three fields are required. Submitting with any field empty or invalid shall display an inline error message beneath the relevant field.
- **FR-1.3** Amount must be a positive number greater than $0.
- **FR-1.4** On successful submit, a new transaction is added to the list and the form resets to empty.
- **FR-1.5** A timestamp (ISO date, `YYYY-MM-DD`) shall be recorded automatically at the time of submission.

### FR-2 · Transaction List

- **FR-2.1** All transactions shall be displayed in a scrollable list, newest first.
- **FR-2.2** Each item shall show: item name, amount, category badge, and date.
- **FR-2.3** Each item shall have a delete button. Clicking it removes the transaction immediately.
- **FR-2.4** When no transactions exist, an empty-state message shall be shown in place of the list.

### FR-3 · Total Balance

- **FR-3.1** A balance card at the top of the page shall display the sum of all transaction amounts.
- **FR-3.2** The balance shall update automatically whenever a transaction is added or deleted.

### FR-4 · Pie Chart

- **FR-4.1** A pie chart shall visualise spending distribution across categories, using Chart.js loaded via CDN.
- **FR-4.2** The chart shall update automatically whenever transaction data changes.
- **FR-4.3** Each slice shall show category label, dollar amount, and percentage in a tooltip.
- **FR-4.4** When no transactions exist, a placeholder message shall replace the chart.

### FR-5 · Monthly Summary (Challenge Feature 1)

- **FR-5.1** A dedicated section shall show total spending for a selected month, broken down by category.
- **FR-5.2** The section shall default to the current calendar month.
- **FR-5.3** If transaction data exists across multiple months, a dropdown selector shall allow the user to switch between months.
- **FR-5.4** Month options shall be derived dynamically from stored transaction dates and sorted newest-first.
- **FR-5.5** When no transactions exist for the selected month, an empty-state message shall be shown.

### FR-6 · Custom Categories (Challenge Feature 2)

- **FR-6.1** Users shall be able to add a custom category via a text input and "Add Category" button below the transaction form.
- **FR-6.2** New categories shall appear immediately in the category dropdown for new transactions.
- **FR-6.3** Custom categories shall persist in Local Storage and survive page reload.
- **FR-6.4** Duplicate category names (case-insensitive) shall be rejected with an inline error.
- **FR-6.5** The pie chart shall automatically assign a distinct color to each new category.

### FR-7 · Dark / Light Mode Toggle (Challenge Feature 3)

- **FR-7.1** A toggle button in the header shall switch between light and dark themes.
- **FR-7.2** The theme shall be implemented using CSS custom properties (variables) — toggling a `data-theme` attribute on the `<html>` element.
- **FR-7.3** The user's theme preference shall be saved in Local Storage and restored on every page load.
- **FR-7.4** The pie chart legend and colors shall update immediately when the theme is toggled.

---

## Non-Functional Requirements

| ID    | Requirement |
|-------|------------|
| NFR-1 | The layout shall be mobile-first and fully usable on screens 320px and wider. |
| NFR-2 | A two-column layout (transaction list + chart) shall activate at ≥ 640px viewport width. |
| NFR-3 | All user-supplied strings rendered to the DOM shall be HTML-escaped to prevent XSS. |
| NFR-4 | Local Storage reads/writes shall be wrapped in try/catch to handle quota or parse errors gracefully. |
| NFR-5 | Code shall be clean, readable, and organized into clearly labeled sections with comments. |

---

## Out of Scope

- User authentication or accounts
- Backend server or database
- Budget limits / alerts
- Recurring transactions
- Data export / import
