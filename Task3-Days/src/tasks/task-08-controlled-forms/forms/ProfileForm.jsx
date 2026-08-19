import { Button, Input, Select, Textarea } from "@ui";
import { useForm } from "../useForm";
import { compose, required, minLength, email, matches } from "../validators";

const validators = {
  name: compose(required("Name"), minLength("Name", 3)),
  email,
  role: required("Role"),
  bio: value => (value.length > 160 ? "Keep the bio under 160 characters." : ""),
  newPassword: value => (value && value.length < 8 ? "Use at least 8 characters." : ""),
  confirmPassword: matches("newPassword", "Passwords")
};

export default function ProfileForm({ onDone }) {
  const form = useForm({
    initialValues: {
      name: "Syed Abdullah Ayaz",
      email: "abdullah@example.com",
      role: "frontend",
      bio: "Frontend intern with a stubborn interest in accessibility.",
      newPassword: "",
      confirmPassword: ""
    },
    validators,
    onSubmit: async values => {
      await new Promise(resolve => setTimeout(resolve, 400));
      onDone?.(`Profile saved for ${values.name}`);
    }
  });

  return (
    <form onSubmit={form.handleSubmit} noValidate className="stack">
      <Input label="Display name" required {...form.field("name")} />
      <Input label="Email" type="email" required {...form.field("email")} />

      <Select
        label="Role"
        required
        placeholder="Choose a role"
        options={[
          { value: "frontend", label: "Frontend" },
          { value: "backend", label: "Backend" },
          { value: "qa", label: "QA" }
        ]}
        {...form.field("role")}
      />

      <Textarea
        label="Bio"
        rows={3}
        hint={`${form.values.bio.length} / 160 characters`}
        {...form.field("bio")}
      />

      <div className="grid">
        <Input
          label="New password"
          type="password"
          autoComplete="new-password"
          hint="Leave blank to keep the current one"
          {...form.field("newPassword")}
        />
        <Input
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          {...form.field("confirmPassword")}
        />
      </div>

      <div className="row">
        <Button type="submit" loading={form.submitting}>
          Save changes
        </Button>
        <Button type="button" variant="ghost" onClick={form.reset} disabled={!form.isDirty}>
          Discard
        </Button>
      </div>

      <p className="tiny muted">
        Cross-field validation: confirm password compares against the other field via{" "}
        <code>allValues</code>.
      </p>
    </form>
  );
}
