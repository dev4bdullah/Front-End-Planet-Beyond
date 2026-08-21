import { useEffect } from "react";
import { Button, Input, Select } from "@ui";
import { useForm } from "@tasks/task-08-controlled-forms/useForm";
import { compose, required, minLength } from "@tasks/task-08-controlled-forms/validators";

const validators = {
  title: compose(required("Title"), minLength("Title", 3)),
  priority: required("Priority")
};

/* Reuses task 8's hook rather than reimplementing validation. */

export default function TaskForm({ onSave, editing, onCancel }) {
  const form = useForm({
    initialValues: { title: "", priority: "medium" },
    validators,
    onSubmit: values => {
      onSave(values);
      form.reset();
    }
  });

  const { setValue } = form;

  // When the parent picks a task to edit, load it into the form
  useEffect(() => {
    if (!editing) return;
    setValue("title", editing.title);
    setValue("priority", editing.priority);
  }, [editing, setValue]);

  return (
    <form onSubmit={form.handleSubmit} noValidate className="stack">
      <Input
        label={editing ? "Edit task" : "New task"}
        placeholder="What needs doing?"
        required
        {...form.field("title")}
      />

      <Select
        label="Priority"
        required
        placeholder=""
        options={[
          { value: "high", label: "High" },
          { value: "medium", label: "Medium" },
          { value: "low", label: "Low" }
        ]}
        {...form.field("priority")}
      />

      <div className="row">
        <Button type="submit">{editing ? "Save changes" : "Add task"}</Button>
        {editing && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              form.reset();
              onCancel();
            }}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
