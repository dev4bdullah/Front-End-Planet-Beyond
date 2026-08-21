import { Button, Input } from "@ui";
import { Switch } from "@interactive";
import { useForm } from "../useForm";
import { email, password } from "../validators";

const validators = { email, password };

export default function LoginForm({ onDone }) {
  const form = useForm({
    initialValues: { email: "", password: "", remember: true },
    validators,
    onSubmit: async values => {
      await new Promise(resolve => setTimeout(resolve, 500)); // pretend network
      onDone?.(`Signed in as ${values.email}`);
    }
  });

  return (
    <form onSubmit={form.handleSubmit} noValidate className="stack">
      <Input label="Email" type="email" required autoComplete="email" {...form.field("email")} />
      <Input
        label="Password"
        type="password"
        required
        autoComplete="current-password"
        hint="At least 8 characters, including a number"
        {...form.field("password")}
      />

      <Switch
        checked={form.values.remember}
        onChange={value => form.setValue("remember", value)}
        label="Keep me signed in"
      />

      <div className="row">
        <Button type="submit" loading={form.submitting} disabled={form.submitting}>
          Sign in
        </Button>
        <Button type="button" variant="ghost" onClick={form.reset} disabled={!form.isDirty}>
          Reset
        </Button>
      </div>

      <p className="tiny muted">
        valid: {String(form.isValid)} · dirty: {String(form.isDirty)}
      </p>
    </form>
  );
}
