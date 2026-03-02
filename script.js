// ── Field definitions ─────────────────────────────────────────────────────────
// Each entry: { id, rules[] }
// Each rule:  { test: value => bool, message: string }

const FIELDS = [
  {
    id: 'name',
    rules: [
      { test: v => v.trim().length > 0,      message: 'Full name is required.' },
      { test: v => v.trim().split(/\s+/).length >= 2, message: 'Please enter your first and last name.' },
      { test: v => /^[A-Za-z\s'\-]+$/.test(v.trim()), message: 'Name may only contain letters, spaces, hyphens, or apostrophes.' },
    ],
  },
  {
    id: 'email',
    rules: [
      { test: v => v.trim().length > 0,  message: 'Email address is required.' },
      { test: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
        message: 'Enter a valid email address (e.g. jane@example.com).' },
    ],
  },
  {
    id: 'phone',
    rules: [
      { test: v => v.trim().length > 0,  message: 'Phone number is required.' },
      { test: v => v.replace(/\D/g, '').length >= 10,
        message: 'Phone number must have at least 10 digits.' },
      { test: v => /^[\d\s\(\)\-\+\.]+$/.test(v.trim()),
        message: 'Phone number contains invalid characters.' },
    ],
  },
  {
    id: 'address',
    rules: [
      { test: v => v.trim().length > 0,  message: 'Street address is required.' },
      { test: v => v.trim().length >= 5, message: 'Please enter a complete street address.' },
    ],
  },
  {
    id: 'city',
    rules: [
      { test: v => v.trim().length > 0,  message: 'City is required.' },
      { test: v => /^[A-Za-z\s'\-\.]+$/.test(v.trim()),
        message: 'City name contains invalid characters.' },
    ],
  },
  {
    id: 'state',
    rules: [
      { test: v => v.trim().length > 0,  message: 'Please select a state.' },
    ],
  },
  {
    id: 'zip',
    rules: [
      { test: v => v.trim().length > 0,       message: 'ZIP code is required.' },
      { test: v => /^\d{5}(-\d{4})?$/.test(v.trim()),
        message: 'Enter a valid ZIP code (e.g. 32816 or 32816-1234).' },
    ],
  },
  {
    id: 'card-name',
    rules: [
      { test: v => v.trim().length > 0,       message: 'Name on card is required.' },
      { test: v => /^[A-Za-z\s'\-]+$/.test(v.trim()),
        message: 'Name on card may only contain letters.' },
    ],
  },
  {
    id: 'card-number',
    rules: [
      { test: v => v.trim().length > 0,       message: 'Card number is required.' },
      { test: v => v.replace(/\s/g, '').length === 16,
        message: 'Card number must be exactly 16 digits.' },
      { test: v => /^\d+$/.test(v.replace(/\s/g, '')),
        message: 'Card number must contain only digits.' },
      { test: v => luhn(v.replace(/\s/g, '')),
        message: 'Card number is invalid. Please check and try again.' },
    ],
  },
  {
    id: 'expiry',
    rules: [
      { test: v => v.trim().length > 0,  message: 'Expiration date is required.' },
      { test: v => /^(0[1-9]|1[0-2])\s*\/\s*\d{2}$/.test(v.trim()),
        message: 'Use MM / YY format (e.g. 08 / 27).' },
      { test: v => !isExpired(v),        message: 'This card has expired.' },
    ],
  },
  {
    id: 'cvv',
    rules: [
      { test: v => v.trim().length > 0,       message: 'CVV is required.' },
      { test: v => /^\d{3,4}$/.test(v.trim()),
        message: 'CVV must be 3 or 4 digits.' },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function luhn(num) {
  let sum = 0;
  let alternate = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let n = parseInt(num[i], 10);
    if (alternate) { n *= 2; if (n > 9) n -= 9; }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

function isExpired(val) {
  const match = val.trim().match(/^(\d{1,2})\s*\/\s*(\d{2})$/);
  if (!match) return true;
  const month = parseInt(match[1], 10);
  const year  = 2000 + parseInt(match[2], 10);
  const now   = new Date();
  const exp   = new Date(year, month, 1); // first day of month after expiry
  return exp <= now;
}

// ── Formatting helpers (input masks) ─────────────────────────────────────────

function formatCardNumber(input) {
  input.addEventListener('input', () => {
    let v = input.value.replace(/\D/g, '').slice(0, 16);
    input.value = v.replace(/(.{4})/g, '$1 ').trim();
  });
}

function formatExpiry(input) {
  input.addEventListener('input', e => {
    let v = input.value.replace(/\D/g, '').slice(0, 4);
    if (v.length >= 3) v = v.slice(0, 2) + ' / ' + v.slice(2);
    input.value = v;
  });
}

// ── Core validation ───────────────────────────────────────────────────────────

function validateField(fieldDef) {
  const el      = document.getElementById(fieldDef.id);
  const wrapper = document.getElementById('field-' + fieldDef.id);
  const errEl   = wrapper.querySelector('.error');
  const value   = el.value;

  // Run rules in order; stop at first failure
  for (const rule of fieldDef.rules) {
    if (!rule.test(value)) {
      errEl.textContent = rule.message;
      wrapper.classList.add('error');
      wrapper.classList.remove('valid');
      return false;
    }
  }

  errEl.textContent = '';
  wrapper.classList.remove('error');
  wrapper.classList.add('valid');
  return true;
}

function validateAll() {
  return FIELDS.every(f => validateField(f));
}

// ── Enable / disable submit ───────────────────────────────────────────────────

function refreshSubmit() {
  // Silent pass — just checks current state without showing errors
  const allOk = FIELDS.every(f => {
    const el = document.getElementById(f.id);
    return f.rules.every(r => r.test(el.value));
  });
  document.getElementById('submit-btn').disabled = !allOk;
}

// ── Wire up events ────────────────────────────────────────────────────────────

function init() {
  // Attach masks
  formatCardNumber(document.getElementById('card-number'));
  formatExpiry(document.getElementById('expiry'));

  FIELDS.forEach(fieldDef => {
    const el = document.getElementById(fieldDef.id);

    // Show error only after the user leaves the field (blur)
    el.addEventListener('blur', () => {
      validateField(fieldDef);
      refreshSubmit();
    });

    // Clear error and re-check as user types (after first blur)
    el.addEventListener('input', () => {
      const wrapper = document.getElementById('field-' + fieldDef.id);
      if (wrapper.classList.contains('error') || wrapper.classList.contains('valid')) {
        validateField(fieldDef);
      }
      refreshSubmit();
    });

    // select elements fire 'change', not 'input'
    el.addEventListener('change', () => {
      validateField(fieldDef);
      refreshSubmit();
    });
  });

  // Form submit
  document.getElementById('checkout-form').addEventListener('submit', e => {
    e.preventDefault();
    if (validateAll()) {
      document.getElementById('success').classList.remove('hidden');
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
