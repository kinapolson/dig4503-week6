import { useState } from "react";
import "./CheckoutForm.css";

// ── Validation rules ──────────────────────────────────────────────────────────

const validators = {
  firstName: (v) =>
    v.trim().length < 2 ? "First name must be at least 2 characters." : "",

  lastName: (v) =>
    v.trim().length < 2 ? "Last name must be at least 2 characters." : "",

  email: (v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
      ? ""
      : "Please enter a valid email address.",

  phone: (v) =>
    /^\+?[\d\s\-().]{7,15}$/.test(v.trim())
      ? ""
      : "Phone number must be 7–15 digits (spaces, dashes, parentheses allowed).",

  address: (v) =>
    v.trim().length < 5 ? "Please enter your full street address." : "",

  city: (v) =>
    v.trim().length < 2 ? "Please enter a valid city name." : "",

  state: (v) =>
    v === "" ? "Please select a state." : "",

  zip: (v) =>
    /^\d{5}(-\d{4})?$/.test(v.trim())
      ? ""
      : "ZIP code must be 5 digits, or 5+4 (e.g. 32816-1234).",

  cardNumber: (v) => {
    const digits = v.replace(/\s/g, "");
    return /^\d{16}$/.test(digits)
      ? ""
      : "Card number must be exactly 16 digits.";
  },

  expiry: (v) => {
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(v)) {
      return "Expiry must be in MM/YY format.";
    }
    const [month, year] = v.split("/").map(Number);
    const now = new Date();
    const cardDate = new Date(2000 + year, month - 1, 1);
    return cardDate < new Date(now.getFullYear(), now.getMonth(), 1)
      ? "This card has already expired."
      : "";
  },

  cvv: (v) =>
    /^\d{3,4}$/.test(v.trim()) ? "" : "CVV must be 3 or 4 digits.",
};

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
];

const INITIAL_STATE = {
  firstName: "", lastName: "", email: "", phone: "",
  address: "", city: "", state: "", zip: "",
  cardNumber: "", expiry: "", cvv: "",
};

// ── Field component ───────────────────────────────────────────────────────────

function Field({ label, error, touched, children }) {
  return (
    <div className={`field${touched && error ? " field--error" : ""}${touched && !error ? " field--valid" : ""}`}>
      <label className="field__label">{label}</label>
      {children}
      {touched && error && (
        <span className="field__error" role="alert">{error}</span>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CheckoutForm() {
  const [values, setValues]   = useState(INITIAL_STATE);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // Compute errors for every field
  const errors = Object.fromEntries(
    Object.entries(validators).map(([key, fn]) => [key, fn(values[key])])
  );

  const isValid = Object.values(errors).every((e) => e === "");

  function handleChange(e) {
    const { name, value } = e.target;

    // Auto-format card number with spaces every 4 digits
    if (name === "cardNumber") {
      const digits = value.replace(/\D/g, "").slice(0, 16);
      const formatted = digits.replace(/(.{4})/g, "$1 ").trim();
      setValues((prev) => ({ ...prev, cardNumber: formatted }));
      return;
    }

    // Auto-format expiry MM/YY
    if (name === "expiry") {
      const digits = value.replace(/\D/g, "").slice(0, 4);
      const formatted =
        digits.length > 2 ? digits.slice(0, 2) + "/" + digits.slice(2) : digits;
      setValues((prev) => ({ ...prev, expiry: formatted }));
      return;
    }

    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function handleBlur(e) {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!isValid) return;
    setSubmitted(true);
  }

  function handleReset() {
    setValues(INITIAL_STATE);
    setTouched({});
    setSubmitted(false);
  }

  if (submitted) {
    return (
      <div className="success-screen">
        <div className="success-card">
          <div className="success-icon">✓</div>
          <h2>Order Placed!</h2>
          <p>Thanks, {values.firstName}! Your order is confirmed and a receipt will be sent to <strong>{values.email}</strong>.</p>
          <button className="btn btn--primary" onClick={handleReset}>
            Place Another Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">Checkout</h1>
        <p className="page__subtitle">Complete your purchase securely</p>
      </header>

      <form className="checkout-form" onSubmit={handleSubmit} noValidate>

        {/* ── Contact ── */}
        <section className="form-section">
          <h2 className="form-section__title">
            <span className="form-section__number">1</span>Contact Information
          </h2>
          <div className="grid grid--2">
            <Field label="First Name" error={errors.firstName} touched={touched.firstName}>
              <input
                className="input"
                type="text"
                name="firstName"
                value={values.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Jane"
                autoComplete="given-name"
              />
            </Field>

            <Field label="Last Name" error={errors.lastName} touched={touched.lastName}>
              <input
                className="input"
                type="text"
                name="lastName"
                value={values.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Doe"
                autoComplete="family-name"
              />
            </Field>
          </div>

          <div className="grid grid--2">
            <Field label="Email Address" error={errors.email} touched={touched.email}>
              <input
                className="input"
                type="email"
                name="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="jane@example.com"
                autoComplete="email"
              />
            </Field>

            <Field label="Phone Number" error={errors.phone} touched={touched.phone}>
              <input
                className="input"
                type="tel"
                name="phone"
                value={values.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="(555) 123-4567"
                autoComplete="tel"
              />
            </Field>
          </div>
        </section>

        {/* ── Shipping ── */}
        <section className="form-section">
          <h2 className="form-section__title">
            <span className="form-section__number">2</span>Shipping Address
          </h2>

          <Field label="Street Address" error={errors.address} touched={touched.address}>
            <input
              className="input"
              type="text"
              name="address"
              value={values.address}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="123 Main St"
              autoComplete="street-address"
            />
          </Field>

          <div className="grid grid--3">
            <Field label="City" error={errors.city} touched={touched.city}>
              <input
                className="input"
                type="text"
                name="city"
                value={values.city}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Orlando"
                autoComplete="address-level2"
              />
            </Field>

            <Field label="State" error={errors.state} touched={touched.state}>
              <select
                className="input input--select"
                name="state"
                value={values.state}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="address-level1"
              >
                <option value="">— Select —</option>
                {US_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>

            <Field label="ZIP Code" error={errors.zip} touched={touched.zip}>
              <input
                className="input"
                type="text"
                name="zip"
                value={values.zip}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="32816"
                autoComplete="postal-code"
                maxLength={10}
              />
            </Field>
          </div>
        </section>

        {/* ── Payment ── */}
        <section className="form-section">
          <h2 className="form-section__title">
            <span className="form-section__number">3</span>Payment Details
          </h2>

          <Field label="Card Number" error={errors.cardNumber} touched={touched.cardNumber}>
            <input
              className="input input--card"
              type="text"
              name="cardNumber"
              value={values.cardNumber}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="1234 5678 9012 3456"
              autoComplete="cc-number"
              inputMode="numeric"
              maxLength={19}
            />
          </Field>

          <div className="grid grid--2">
            <Field label="Expiry Date" error={errors.expiry} touched={touched.expiry}>
              <input
                className="input"
                type="text"
                name="expiry"
                value={values.expiry}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="MM/YY"
                autoComplete="cc-exp"
                inputMode="numeric"
                maxLength={5}
              />
            </Field>

            <Field label="CVV" error={errors.cvv} touched={touched.cvv}>
              <input
                className="input"
                type="text"
                name="cvv"
                value={values.cvv}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="123"
                autoComplete="cc-csc"
                inputMode="numeric"
                maxLength={4}
              />
            </Field>
          </div>
        </section>

        {/* ── Submit ── */}
        <div className="form-footer">
          <p className="form-footer__hint">
            {isValid
              ? "All fields are valid — ready to submit!"
              : "Fill in all fields correctly to enable the button."}
          </p>
          <button
            className="btn btn--primary btn--submit"
            type="submit"
            disabled={!isValid}
          >
            Place Order
          </button>
        </div>
      </form>
    </div>
  );
}
