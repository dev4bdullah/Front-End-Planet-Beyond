import { useForm, Controller } from "react-hook-form";
import { SCHEMAS, CATEGORIES, STATUS, titleCase } from "@model/model";

/* Task 7 — the same product form, rebuilt with react-hook-form.

   The rules move into the register() call; everything else — touched
   tracking, error state, focus on the first failure — comes from the library. */

export default function ProductFormRHF({ initial, onSubmit, onCancel }) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting, isDirty, touchedFields, submitCount }
  } = useForm({
    defaultValues: {
      name: "",
      sku: "",
      category: "peripherals",
      price: "",
      stock: "",
      status: "draft",
      email: "",
      notes: "",
      ...initial
    },
    // Validate on blur, then live once a field has errored — the same
    // behaviour the hand-rolled hook implements by hand in task 6
    mode: "onTouched"
  });

  const notes = watch("notes") ?? "";

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="stack">
      <div className="field">
        <label htmlFor="rhf-name">
          Name <span style={{ color: "var(--bad)" }}>*</span>
        </label>
        <input
          id="rhf-name"
          className={errors.name ? "is-invalid" : undefined}
          aria-invalid={errors.name ? "true" : undefined}
          {...register("name", {
            required: "Name is required.",
            minLength: { value: 3, message: "Name needs at least 3 characters." },
            maxLength: { value: 60, message: "Name must be under 60 characters." }
          })}
        />
        <p className="field__error" role={errors.name ? "alert" : undefined}>
          {errors.name?.message}
        </p>
      </div>

      <div className="field">
        <label htmlFor="rhf-sku">
          SKU <span style={{ color: "var(--bad)" }}>*</span>
        </label>
        <input
          id="rhf-sku"
          className={errors.sku ? "is-invalid" : undefined}
          {...register("sku", {
            required: "SKU is required.",
            pattern: {
              value: /^[A-Z]{2,4}-\d{3,5}$/,
              message: "Two to four capitals, a dash, then 3–5 digits — e.g. KB-1042"
            }
          })}
        />
        <p className="field__error">{errors.sku?.message}</p>
      </div>

      <div className="grid">
        <div className="field">
          <label htmlFor="rhf-price">
            Price (USD) <span style={{ color: "var(--bad)" }}>*</span>
          </label>
          <input
            id="rhf-price"
            type="number"
            step="0.01"
            className={errors.price ? "is-invalid" : undefined}
            {...register("price", {
              required: "Price is required.",
              // valueAsNumber, or every comparison below runs on a string
              valueAsNumber: true,
              min: { value: 0.01, message: "Price must be greater than zero." },
              max: { value: 100000, message: "Price must be at most 100000." }
            })}
          />
          <p className="field__error">{errors.price?.message}</p>
        </div>

        <div className="field">
          <label htmlFor="rhf-stock">
            Stock <span style={{ color: "var(--bad)" }}>*</span>
          </label>
          <input
            id="rhf-stock"
            type="number"
            className={errors.stock ? "is-invalid" : undefined}
            {...register("stock", {
              required: "Stock is required.",
              valueAsNumber: true,
              min: { value: 0, message: "Stock can't be negative." },
              // A custom rule — anything the built-ins don't cover
              validate: {
                whole: value => Number.isInteger(value) || "Stock must be a whole number.",
                activeNeedsStock: (value, values) =>
                  !(values.status === "active" && value === 0) ||
                  "An active product can't have zero stock."
              }
            })}
          />
          <p className="field__error">{errors.stock?.message}</p>
        </div>
      </div>

      {/* Controller is for inputs that don't expose a native ref or event —
          a custom select, a date picker, a rich text editor. A plain <select>
          doesn't need it; this one uses it to show the shape. */}
      <Controller
        name="category"
        control={control}
        rules={{ required: "Category is required." }}
        render={({ field, fieldState }) => (
          <div className="field">
            <label htmlFor="rhf-category">
              Category <span style={{ color: "var(--bad)" }}>*</span>
            </label>
            <select
              id="rhf-category"
              className={fieldState.error ? "is-invalid" : undefined}
              {...field}
            >
              <option value="">Choose one</option>
              {CATEGORIES.map(option => (
                <option key={option} value={option}>
                  {titleCase(option)}
                </option>
              ))}
            </select>
            <p className="field__error">{fieldState.error?.message}</p>
          </div>
        )}
      />

      <div className="field">
        <label htmlFor="rhf-status">Status</label>
        <select id="rhf-status" {...register("status")}>
          {Object.entries(STATUS).map(([key, value]) => (
            <option key={key} value={key}>
              {value.label}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="rhf-email">Supplier email</label>
        <input
          id="rhf-email"
          type="email"
          className={errors.email ? "is-invalid" : undefined}
          {...register("email", {
            validate: value =>
              !value ||
              (value.includes("@") && value.split("@")[1]?.includes(".")) ||
              "That doesn't look like an email address."
          })}
        />
        <p className="field__error">{errors.email?.message}</p>
      </div>

      <div className="field">
        <label htmlFor="rhf-notes">Notes</label>
        <textarea
          id="rhf-notes"
          rows={3}
          {...register("notes", {
            maxLength: { value: 200, message: "Keep notes under 200 characters." }
          })}
        />
        <p className="field__hint">{notes.length} / 200</p>
        <p className="field__error">{errors.notes?.message}</p>
      </div>

      <div className="row" style={{ justifyContent: "flex-end" }}>
        {onCancel && (
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => reset()}
          disabled={!isDirty}
        >
          Reset
        </button>
        <button type="submit" className="btn" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save product"}
        </button>
      </div>

      <p className="tiny muted">
        dirty: {String(isDirty)} · touched: {Object.keys(touchedFields).length} · errors:{" "}
        {Object.keys(errors).length} · submits: {submitCount}
      </p>
    </form>
  );
}

export const PRODUCT_FIELD_COUNT = SCHEMAS.products.fields.length;
