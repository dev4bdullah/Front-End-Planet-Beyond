import Button from "./Button";

export default function ErrorState({ title = "Something went wrong", message, onRetry }) {
  return (
    <div className="state state--error" role="alert">
      <strong className="state__title">{title}</strong>
      {message && <p>{message}</p>}
      {onRetry && (
        <div className="state__actions">
          <Button onClick={onRetry}>Try again</Button>
        </div>
      )}
    </div>
  );
}
