import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Badge, Button, EmptyState, Input, Select, Skeleton, Table } from "@ui";
import { cx } from "@shared/cx";

/* Task 5 — everything a table needs before it's usable on real data:
   search, a status filter, sortable columns, pagination, row selection,
   row actions, a loading state and two different empty states.

   Columns are declared as data, so this component works for any dataset. */

export default function DataTable({
  rows = [],
  columns = [],
  searchKeys = [],
  filterKey,
  filterOptions = [],
  loading = false,
  pageSize = 8,
  onRowAction,
  emptyTitle = "No records",
  emptyMessage = "Nothing has been created yet."
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState({ key: columns[0]?.key, direction: "asc" });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set());

  /* useMemo here is not decoration — this chain runs on every keystroke,
     and it walks the whole dataset three times. */
  const processed = useMemo(() => {
    const needle = query.trim().toLowerCase();

    const filtered = rows
      .filter(row => (filter ? row[filterKey] === filter : true))
      .filter(row =>
        needle
          ? searchKeys.some(key =>
              String(row[key] ?? "")
                .toLowerCase()
                .includes(needle)
            )
          : true
      );

    const column = columns.find(item => item.key === sort.key);

    const sorted = [...filtered].sort((a, b) => {
      const left = a[sort.key];
      const right = b[sort.key];

      // Nulls always sort last, whichever direction is active
      if (left == null) return 1;
      if (right == null) return -1;

      const result =
        column?.numeric === true
          ? left - right
          : String(left).localeCompare(String(right), undefined, { numeric: true });

      return sort.direction === "asc" ? result : -result;
    });

    return sorted;
  }, [rows, query, filter, filterKey, searchKeys, sort, columns]);

  const pageCount = Math.max(Math.ceil(processed.length / pageSize), 1);
  const safePage = Math.min(page, pageCount);
  const visible = processed.slice((safePage - 1) * pageSize, safePage * pageSize);

  const allOnPageSelected = visible.length > 0 && visible.every(row => selected.has(row.id));

  function toggleSort(key) {
    setSort(previous =>
      previous.key === key
        ? { key, direction: previous.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
    setPage(1);
  }

  function toggleRow(id) {
    setSelected(previous => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function togglePage() {
    setSelected(previous => {
      const next = new Set(previous);
      visible.forEach(row => (allOnPageSelected ? next.delete(row.id) : next.add(row.id)));
      return next;
    });
  }

  const hasFilters = Boolean(query.trim() || filter);

  return (
    <div className="space-y-3">
      {/* ---------- toolbar ---------- */}
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[190px] flex-1">
          <Input
            icon={Search}
            placeholder="Search…"
            aria-label="Search records"
            value={query}
            onChange={event => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
        </div>

        {filterKey && (
          <Select
            aria-label="Filter"
            placeholder="All statuses"
            options={filterOptions}
            value={filter}
            onChange={event => {
              setFilter(event.target.value);
              setPage(1);
            }}
            className="w-40"
          />
        )}

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery("");
              setFilter("");
              setPage(1);
            }}
          >
            Clear
          </Button>
        )}
      </div>

      {/* ---------- bulk action bar, only when something is selected ---------- */}
      {selected.size > 0 && (
        <div className="border-brand-200 bg-brand-50 dark:border-brand-600/40 dark:bg-brand-600/10 flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2">
          <span className="text-xs font-semibold">{selected.size} selected</span>
          <Button
            size="xs"
            variant="secondary"
            onClick={() => onRowAction?.("export", [...selected])}
          >
            Export
          </Button>
          <Button size="xs" variant="danger" onClick={() => onRowAction?.("delete", [...selected])}>
            Delete
          </Button>
          <Button
            size="xs"
            variant="ghost"
            onClick={() => setSelected(new Set())}
            className="ml-auto"
          >
            Clear selection
          </Button>
        </div>
      )}

      {/* ---------- the table ---------- */}
      <div className="overflow-hidden rounded-xl border">
        {loading ? (
          <div className="space-y-2 p-3">
            <Skeleton className="h-8 w-full" count={pageSize} />
          </div>
        ) : visible.length === 0 ? (
          <div className="p-3">
            {hasFilters ? (
              <EmptyState
                icon={Search}
                title="No matching records"
                message="No row matches that search and filter combination."
                action={
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setQuery("");
                      setFilter("");
                    }}
                  >
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <EmptyState title={emptyTitle} message={emptyMessage} />
            )}
          </div>
        ) : (
          <Table>
            <Table.Head>
              <Table.HeadCell className="w-10">
                <input
                  type="checkbox"
                  checked={allOnPageSelected}
                  onChange={togglePage}
                  aria-label="Select all rows on this page"
                  className="accent-brand-600 size-3.5"
                />
              </Table.HeadCell>

              {columns.map(column => (
                <Table.HeadCell
                  key={column.key}
                  className={cx(column.align === "right" && "text-right", column.hideBelow)}
                  aria-sort={
                    sort.key === column.key
                      ? sort.direction === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  {column.sortable === false ? (
                    column.label
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleSort(column.key)}
                      className={cx(
                        "hover:text-brand-600 dark:hover:text-brand-400 inline-flex items-center gap-1 uppercase",
                        column.align === "right" && "flex-row-reverse"
                      )}
                    >
                      {column.label}
                      {sort.key === column.key ? (
                        sort.direction === "asc" ? (
                          <ArrowUp className="size-3" />
                        ) : (
                          <ArrowDown className="size-3" />
                        )
                      ) : (
                        <ArrowUpDown className="size-3 opacity-40" />
                      )}
                    </button>
                  )}
                </Table.HeadCell>
              ))}

              <Table.HeadCell className="w-24 text-right">Actions</Table.HeadCell>
            </Table.Head>

            <Table.Body>
              {visible.map(row => (
                <Table.Row
                  key={row.id}
                  className={
                    selected.has(row.id) ? "bg-brand-50/60 dark:bg-brand-600/10" : undefined
                  }
                >
                  <Table.Cell>
                    <input
                      type="checkbox"
                      checked={selected.has(row.id)}
                      onChange={() => toggleRow(row.id)}
                      aria-label={`Select ${row.id}`}
                      className="accent-brand-600 size-3.5"
                    />
                  </Table.Cell>

                  {columns.map(column => (
                    <Table.Cell
                      key={column.key}
                      className={cx(
                        column.align === "right" && "text-right tabular-nums",
                        column.hideBelow
                      )}
                    >
                      {column.render ? column.render(row) : (row[column.key] ?? "—")}
                    </Table.Cell>
                  ))}

                  <Table.Cell className="text-right">
                    <div className="inline-flex gap-1">
                      <Button size="xs" variant="ghost" onClick={() => onRowAction?.("view", row)}>
                        View
                      </Button>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => onRowAction?.("delete", row)}
                      >
                        Delete
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </div>

      {/* ---------- pagination ---------- */}
      {!loading && processed.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showing <strong className="tabular-nums">{(safePage - 1) * pageSize + 1}</strong>–
            <strong className="tabular-nums">
              {Math.min(safePage * pageSize, processed.length)}
            </strong>{" "}
            of <strong className="tabular-nums">{processed.length}</strong>
            {hasFilters && ` (filtered from ${rows.length})`}
          </p>

          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              disabled={safePage === 1}
              onClick={() => setPage(value => value - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft className="size-3.5" />
            </Button>

            {Array.from({ length: pageCount }, (_, index) => index + 1)
              .filter(
                number => number === 1 || number === pageCount || Math.abs(number - safePage) <= 1
              )
              .map((number, index, list) => (
                <span key={number} className="flex items-center gap-1">
                  {index > 0 && number - list[index - 1] > 1 && (
                    <span className="px-1 text-xs text-slate-400">…</span>
                  )}
                  <Button
                    size="sm"
                    variant={number === safePage ? "primary" : "outline"}
                    onClick={() => setPage(number)}
                    aria-current={number === safePage ? "page" : undefined}
                    className="w-8 tabular-nums"
                  >
                    {number}
                  </Button>
                </span>
              ))}

            <Button
              size="sm"
              variant="outline"
              disabled={safePage === pageCount}
              onClick={() => setPage(value => value + 1)}
              aria-label="Next page"
            >
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
