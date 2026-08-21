import { cx } from "@shared/cx";

/* Just the presentation. Sorting, filtering and pagination live in the
   DataTable of task 5 — this stays dumb so it can be reused for any table. */

export function Table({ children, className }) {
  return (
    <div className="scrollbar-slim overflow-x-auto">
      <table className={cx("w-full border-collapse text-sm", className)}>{children}</table>
    </div>
  );
}

Table.Head = function TableHead({ children }) {
  return (
    <thead className="bg-sunk dark:bg-sunk-dark">
      <tr>{children}</tr>
    </thead>
  );
};

Table.HeadCell = function TableHeadCell({ children, className, ...rest }) {
  return (
    <th
      scope="col"
      className={cx(
        "text-2xs border-b px-3 py-2.5 text-left font-bold tracking-wide text-slate-500 uppercase dark:text-slate-400",
        className
      )}
      {...rest}
    >
      {children}
    </th>
  );
};

Table.Body = function TableBody({ children }) {
  return <tbody>{children}</tbody>;
};

Table.Row = function TableRow({ children, className, ...rest }) {
  return (
    <tr
      className={cx(
        "hover:bg-sunk/60 dark:hover:bg-sunk-dark/60 border-b transition-colors last:border-0",
        className
      )}
      {...rest}
    >
      {children}
    </tr>
  );
};

Table.Cell = function TableCell({ children, className, ...rest }) {
  return (
    <td className={cx("px-3 py-2.5 align-middle", className)} {...rest}>
      {children}
    </td>
  );
};
