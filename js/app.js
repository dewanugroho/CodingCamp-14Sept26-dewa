/* ============================================================
   app.js — Expense & Budget Visualizer
   Vanilla JS only (TC-1). All data stored in localStorage (TC-2).
   ============================================================ */

'use strict';

/* ── 1. CONSTANTS & STORAGE KEYS ───────────────────────────── */

const STORAGE_KEYS = {
  transactions: 'ebv_transactions',
  categories:   'ebv_categories',
  theme:        'ebv_theme',
};

const DEFAULT_CATEGORIES = ['Food', 'Transport', 'Fun'];

/**
 * A deterministic color palette for chart slices.
 * New categories cycle through these; defaults use the first three.
 */
const CHART_COLORS = [
  '#4f46e5', // indigo   — Food
  '#10b981', // emerald  — Transport
  '#f59e0b', // amber    — Fun
  '#ef4444', // red
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#84cc16', // lime
  '#f97316', // orange
  '#14b8a6', // teal
];

/* ── 2. IN-MEMORY STATE ─────────────────────────────────────── */

let transactions = [];   // [{ id, name, amount, category, date }]
let categories   = [];   // string[] — default + custom
let chartInstance = null;

/* ── 3. LOCAL STORAGE HELPERS ───────────────────────────────── */

function loadFromStorage() {
  try {
    const storedTx   = localStorage.getItem(STORAGE_KEYS.transactions);
    const storedCats = localStorage.getItem(STORAGE_KEYS.categories);

    transactions = storedTx   ? JSON.parse(storedTx)   : [];
    categories   = storedCats ? JSON.parse(storedCats) : [...DEFAULT_CATEGORIES];
  } catch (e) {
    console.error('Failed to load from localStorage:', e);
    transactions = [];
    categories   = [...DEFAULT_CATEGORIES];
  }
}

function saveTransactions() {
  localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(transactions));
}

function saveCategories() {
  localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(categories));
}

/* ── 4. COMPUTATION HELPERS ─────────────────────────────────── */

/** Sum of all transaction amounts. */
function getTotalBalance() {
  return transactions.reduce((sum, tx) => sum + tx.amount, 0);
}

/** Returns { Category: totalAmount } for the given transaction subset. */
function getSpendingByCategory(txList) {
  return txList.reduce((acc, tx) => {
    acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
    return acc;
  }, {});
}

/**
 * Returns an array of unique "YYYY-MM" strings present in transactions,
 * sorted newest-first.
 */
function getAvailableMonths() {
  const months = new Set(transactions.map(tx => tx.date.slice(0, 7)));
  return [...months].sort((a, b) => b.localeCompare(a));
}

/** Returns "YYYY-MM" for today. */
function currentYearMonth() {
  return new Date().toISOString().slice(0, 7);
}

/** Formats "YYYY-MM" → "September 2026" */
function formatYearMonth(ym) {
  const [year, month] = ym.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

/** Formats a number as a USD currency string. */
function formatCurrency(amount) {
  return '$' + amount.toFixed(2);
}

/** Returns the CSS badge class for a category. */
function badgeClass(category) {
  const map = { Food: 'badge-food', Transport: 'badge-transport', Fun: 'badge-fun' };
  return map[category] || 'badge-custom';
}

/** Returns the chart color for a given category index. */
function colorForIndex(index) {
  return CHART_COLORS[index % CHART_COLORS.length];
}

/* ── 5. RENDER: BALANCE ─────────────────────────────────────── */

function renderBalance() {
  document.getElementById('total-balance').textContent =
    formatCurrency(getTotalBalance());
}

/* ── 6. RENDER: CATEGORY DROPDOWN ──────────────────────────── */

function renderCategoryDropdown() {
  const select = document.getElementById('category');
  // Preserve current selection
  const current = select.value;

  // Remove all dynamic options (keep only the placeholder at index 0)
  while (select.options.length > 1) select.remove(1);

  const icons = { Food: '🍔', Transport: '🚌', Fun: '🎮' };

  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = (icons[cat] || '🏷️') + ' ' + cat;
    select.appendChild(opt);
  });

  // Restore selection if still valid
  if (current && categories.includes(current)) {
    select.value = current;
  }
}

/* ── 7. RENDER: TRANSACTION LIST ────────────────────────────── */

function renderTransactionList() {
  const list       = document.getElementById('transaction-list');
  const emptyState = document.getElementById('empty-state');

  list.innerHTML = '';

  if (transactions.length === 0) {
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;

  // Show newest first
  const sorted = [...transactions].sort((a, b) => b.id - a.id);

  sorted.forEach(tx => {
    const li = document.createElement('li');
    li.className = 'transaction-item';
    li.dataset.id = tx.id;

    const formattedDate = new Date(tx.date).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric',
    });

    li.innerHTML = `
      <div class="transaction-info">
        <span class="transaction-name">${escapeHtml(tx.name)}</span>
        <div class="transaction-meta">
          <span class="category-badge ${badgeClass(tx.category)}">${escapeHtml(tx.category)}</span>
          <span class="transaction-date">${formattedDate}</span>
        </div>
      </div>
      <div class="transaction-right">
        <span class="transaction-amount">${formatCurrency(tx.amount)}</span>
        <button class="btn-delete" aria-label="Delete ${escapeHtml(tx.name)}" data-id="${tx.id}">✕</button>
      </div>
    `;
    list.appendChild(li);
  });
}

/* ── 8. RENDER: PIE CHART ───────────────────────────────────── */

function renderChart() {
  const canvas     = document.getElementById('spending-chart');
  const emptyNote  = document.getElementById('chart-empty');

  if (transactions.length === 0) {
    emptyNote.hidden = false;
    canvas.hidden    = true;
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
    return;
  }

  emptyNote.hidden = false; // keep layout stable; hide below
  emptyNote.hidden = true;
  canvas.hidden    = false;

  const spending = getSpendingByCategory(transactions);
  const labels   = Object.keys(spending);
  const data     = Object.values(spending);
  const colors   = labels.map(label => {
    const idx = categories.indexOf(label);
    return colorForIndex(idx === -1 ? labels.indexOf(label) : idx);
  });

  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  chartInstance = new Chart(canvas, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: getComputedStyle(document.documentElement)
          .getPropertyValue('--color-surface').trim() || '#ffffff',
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: getComputedStyle(document.documentElement)
              .getPropertyValue('--color-text').trim() || '#111827',
            font: { size: 12 },
            padding: 12,
          },
        },
        tooltip: {
          callbacks: {
            label(ctx) {
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
              const pct   = ((ctx.parsed / total) * 100).toFixed(1);
              return ` ${ctx.label}: ${formatCurrency(ctx.parsed)} (${pct}%)`;
            },
          },
        },
      },
    },
  });
}

/* ── 9. RENDER: MONTHLY SUMMARY ─────────────────────────────── */

function renderMonthlySummary() {
  const selector     = document.getElementById('month-selector');
  const summaryEmpty = document.getElementById('summary-empty');
  const summaryContent = document.getElementById('summary-content');
  const totalEl      = document.getElementById('summary-total-amount');
  const breakdownEl  = document.getElementById('summary-breakdown');

  const months = getAvailableMonths();

  // Rebuild the month selector options
  const prevSelected = selector.value;
  selector.innerHTML = '';

  if (months.length === 0) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = 'No data';
    selector.appendChild(opt);
    selector.disabled = true;
    summaryEmpty.hidden  = false;
    summaryContent.hidden = true;
    return;
  }

  selector.disabled = false;
  months.forEach(ym => {
    const opt = document.createElement('option');
    opt.value = ym;
    opt.textContent = formatYearMonth(ym);
    selector.appendChild(opt);
  });

  // Restore previous selection, default to current month or newest
  const defaultMonth = months.includes(currentYearMonth())
    ? currentYearMonth()
    : months[0];
  selector.value = months.includes(prevSelected) ? prevSelected : defaultMonth;

  const selectedYM = selector.value;
  const monthTx    = transactions.filter(tx => tx.date.slice(0, 7) === selectedYM);

  if (monthTx.length === 0) {
    summaryEmpty.hidden   = false;
    summaryContent.hidden = true;
    return;
  }

  summaryEmpty.hidden   = true;
  summaryContent.hidden = false;

  const total    = monthTx.reduce((s, tx) => s + tx.amount, 0);
  const spending = getSpendingByCategory(monthTx);

  totalEl.textContent = formatCurrency(total);

  breakdownEl.innerHTML = '';
  Object.entries(spending)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, amt]) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span class="cat-name">${escapeHtml(cat)}</span>
        <span class="cat-amount">${formatCurrency(amt)}</span>
      `;
      breakdownEl.appendChild(li);
    });
}

/* ── 10. RENDER ALL ─────────────────────────────────────────── */

function renderAll() {
  renderBalance();
  renderCategoryDropdown();
  renderTransactionList();
  renderChart();
  renderMonthlySummary();
}

/* ── 11. FORM VALIDATION ────────────────────────────────────── */

/** Shows an error message under a field and marks it invalid. */
function setFieldError(inputId, errorId, message) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  input.classList.add('input-error');
  error.textContent = message;
}

/** Clears error state for a field. */
function clearFieldError(inputId, errorId) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  input.classList.remove('input-error');
  error.textContent = '';
}

/** Returns true if form is valid; false otherwise. */
function validateForm(name, amount, category) {
  let valid = true;

  clearFieldError('item-name', 'name-error');
  clearFieldError('amount', 'amount-error');
  clearFieldError('category', 'category-error');

  if (!name.trim()) {
    setFieldError('item-name', 'name-error', 'Item name is required.');
    valid = false;
  }

  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
    setFieldError('amount', 'amount-error', 'Enter a valid amount greater than $0.');
    valid = false;
  }

  if (!category) {
    setFieldError('category', 'category-error', 'Please select a category.');
    valid = false;
  }

  return valid;
}

/* ── 12. EVENT HANDLERS ─────────────────────────────────────── */

/** Handle transaction form submission. */
function handleFormSubmit(e) {
  e.preventDefault();

  const nameInput     = document.getElementById('item-name');
  const amountInput   = document.getElementById('amount');
  const categoryInput = document.getElementById('category');

  const name     = nameInput.value;
  const amount   = amountInput.value;
  const category = categoryInput.value;

  if (!validateForm(name, amount, category)) return;

  const transaction = {
    id:       Date.now(),
    name:     name.trim(),
    amount:   parseFloat(Number(amount).toFixed(2)),
    category,
    date:     new Date().toISOString().slice(0, 10), // "YYYY-MM-DD"
  };

  transactions.push(transaction);
  saveTransactions();
  renderAll();

  // Reset form
  nameInput.value     = '';
  amountInput.value   = '';
  categoryInput.value = '';
  nameInput.focus();
}

/** Handle delete button clicks via event delegation on the list. */
function handleDeleteClick(e) {
  const btn = e.target.closest('.btn-delete');
  if (!btn) return;

  const id = Number(btn.dataset.id);
  transactions = transactions.filter(tx => tx.id !== id);
  saveTransactions();
  renderAll();
}

/** Handle custom category addition. */
function handleAddCategory() {
  const input    = document.getElementById('custom-category-input');
  const errorEl  = document.getElementById('custom-category-error');
  const value    = input.value.trim();

  errorEl.textContent = '';
  input.classList.remove('input-error');

  if (!value) {
    errorEl.textContent = 'Please enter a category name.';
    input.classList.add('input-error');
    return;
  }

  // Case-insensitive duplicate check
  const duplicate = categories.some(
    c => c.toLowerCase() === value.toLowerCase()
  );
  if (duplicate) {
    errorEl.textContent = `"${value}" already exists.`;
    input.classList.add('input-error');
    return;
  }

  categories.push(value);
  saveCategories();
  renderCategoryDropdown();

  // Auto-select the new category
  document.getElementById('category').value = value;

  input.value = '';
  input.focus();
}

/** Handle month selector change in the summary section. */
function handleMonthChange() {
  renderMonthlySummary();
}

/** Handle dark/light mode toggle. */
function handleThemeToggle() {
  const html   = document.documentElement;
  const btn    = document.getElementById('theme-toggle');
  const isDark = html.getAttribute('data-theme') === 'dark';

  const newTheme = isDark ? 'light' : 'dark';
  html.setAttribute('data-theme', newTheme);
  btn.textContent = isDark ? '🌙 Dark Mode' : '☀️ Light Mode';

  localStorage.setItem(STORAGE_KEYS.theme, newTheme);

  // Redraw chart so legend/border colors update immediately
  renderChart();
}

/* ── 13. THEME INITIALISATION ───────────────────────────────── */

function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEYS.theme);
  const theme = saved === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  document.getElementById('theme-toggle').textContent =
    theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
}

/* ── 14. UTILITY ────────────────────────────────────────────── */

/** Escapes HTML special characters to prevent XSS. */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ── 15. BOOT ───────────────────────────────────────────────── */

function init() {
  // Restore theme first (before paint)
  initTheme();

  // Load persisted data
  loadFromStorage();

  // Wire up event listeners
  document.getElementById('transaction-form')
    .addEventListener('submit', handleFormSubmit);

  document.getElementById('transaction-list')
    .addEventListener('click', handleDeleteClick);

  document.getElementById('add-category-btn')
    .addEventListener('click', handleAddCategory);

  document.getElementById('custom-category-input')
    .addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); handleAddCategory(); }
    });

  document.getElementById('month-selector')
    .addEventListener('change', handleMonthChange);

  document.getElementById('theme-toggle')
    .addEventListener('click', handleThemeToggle);

  // Initial render
  renderAll();
}

// Run after DOM + Chart.js are ready (both scripts use defer)
document.addEventListener('DOMContentLoaded', init);
