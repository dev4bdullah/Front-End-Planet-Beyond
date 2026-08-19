import { Button, Input, Select, Textarea } from "@ui";
import { Switch } from "@interactive";
import { useForm } from "../useForm";
import { compose, required, minLength, positiveNumber } from "../validators";

const validators = {
  name: compose(required("Product name"), minLength("Product name", 3)),
  category: required("Category"),
  price: positiveNumber("Price"),
  stock: value => {
    if (value === "") return "Stock is required.";
    const number = Number(value);
    if (!Number.isInteger(number)) return "Must be a whole number.";
    if (number < 0) return "Cannot be negative.";
    return "";
  },
  description: value => (value.trim().length < 10 ? "Describe it in at least 10 characters." : "")
};

export default function ProductForm({ onDone }) {
  const form = useForm({
    initialValues: {
      name: "",
      category: "",
      price: "",
      stock: "",
      description: "",
      published: false
    },
    validators,
    onSubmit: async values => {
      await new Promise(resolve => setTimeout(resolve, 400));
      onDone?.(`${values.name} saved at $${values.price}`);
      form.reset();
    }
  });

  const margin = form.values.price ? (Number(form.values.price) * 0.35).toFixed(2) : "0.00";

  return (
    <form onSubmit={form.handleSubmit} noValidate className="stack">
      <Input label="Product name" required {...form.field("name")} />

      <div className="grid">
        <Select
          label="Category"
          required
          placeholder="Choose a category"
          options={["Peripherals", "Displays", "Accessories"]}
          {...form.field("category")}
        />
        <Input
          label="Price (USD)"
          type="number"
          step="0.01"
          required
          hint={`Estimated margin $${margin}`}
          {...form.field("price")}
        />
        <Input label="Stock" type="number" required {...form.field("stock")} />
      </div>

      <Textarea label="Description" rows={3} required {...form.field("description")} />

      <Switch
        checked={form.values.published}
        onChange={value => form.setValue("published", value)}
        label="Publish immediately"
      />

      <div className="row">
        <Button type="submit" loading={form.submitting}>
          Create product
        </Button>
        <Button type="button" variant="ghost" onClick={form.reset} disabled={!form.isDirty}>
          Clear
        </Button>
      </div>

      <p className="tiny muted">
        The margin hint under Price is derived from state during render — not stored separately.
      </p>
    </form>
  );
}
