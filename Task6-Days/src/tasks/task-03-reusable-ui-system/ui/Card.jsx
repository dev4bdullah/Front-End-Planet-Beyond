import { cx } from "@shared/cx";

export default function Card({ children, className, padded = true, ...rest }) {
  return (
    <div
      className={cx(
        "rounded-card bg-surface shadow-card dark:bg-surface-dark border",
        padded && "p-4",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

Card.Header = function CardHeader({ title, subtitle, actions, className }) {
  return (
    <div className={cx("flex flex-wrap items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 gap-1.5">{actions}</div>}
    </div>
  );
};

Card.Body = function CardBody({ children, className }) {
  return <div className={cx("mt-3", className)}>{children}</div>;
};

Card.Footer = function CardFooter({ children, className }) {
  return <div className={cx("mt-3 flex flex-wrap gap-2 border-t pt-3", className)}>{children}</div>;
};
