"use client";

import { Icon } from "@/components/ui/icon";
import { Input, ListBoxItem, Select, Switch, TextArea, TextField } from "@heroui/react";
import { Label } from "@heroui/react";
import { humanize, type FieldDef } from "@/lib/admin";

/**
 * Recursive editor for registry driven content.
 *
 * The API ships a `FieldDef` tree for every entity, so forms are generated from
 * that description instead of hand written inputs. Adding a field on the server
 * makes it appear here without a frontend change.
 */

export type FieldErrors = Record<string, string>;

interface FieldControlProps {
  field: FieldDef;
  value: unknown;
  path: string;
  errors: FieldErrors;
  disabled?: boolean;
  onChange: (value: unknown) => void;
}

const LABEL = "font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400 font-semibold";
const BOX =
  "dashboard-input w-full rounded-lg border border-line bg-surface-2/60 px-3 py-2 text-[12.5px] text-ink outline-none transition-colors focus:border-accent/60 focus:ring-1 focus:ring-accent/20 placeholder:text-slate-500 disabled:opacity-60";

function asText(value: unknown): string {
  if (value === undefined || value === null) return "";
  return String(value);
}

/** ISO timestamp → the `YYYY-MM-DD` a date input expects. */
function asDateInput(value: unknown): string {
  const text = asText(value);
  if (!text) return "";
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function asList(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => asText(item)) : [];
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asRows(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value)
    ? value.map((row) => asRecord(row))
    : [];
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-danger">
      <Icon name="X" className="mt-0.5 h-3 w-3 shrink-0" />
      {message}
    </p>
  );
}

function ScalarControl({
  field,
  value,
  path,
  errors,
  disabled,
  onChange,
}: FieldControlProps) {
  const error = errors[path];
  const multiline = field.kind === "text";
  const required = Boolean(field.required);

  const hint =
    field.kind === "slug"
      ? "lowercase, numbers, dashes"
      : field.kind === "url"
        ? "valid url"
        : field.max
          ? `max ${field.max} chars`
          : undefined;

  const placeholder =
    field.kind === "slug"
      ? "e.g. project-slug"
      : field.kind === "url"
        ? "https://..."
        : field.kind === "date"
          ? "YYYY-MM-DD"
          : field.kind === "number"
            ? "0"
            : `Enter ${humanize(field.name).toLowerCase()}…`;

  const rawValue = field.kind === "date" ? asDateInput(value) : asText(value);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <Label className={LABEL}>
          {humanize(field.name)}
          {required ? <span className="ml-1 text-accent">*</span> : null}
        </Label>
        {hint ? (
          <span className="font-mono text-[9px] text-slate-500 tracking-wider">
            {hint}
          </span>
        ) : null}
      </div>

      {multiline ? (
        <TextField isDisabled={disabled}>
          <TextArea
            rows={field.max && field.max < 400 ? 3 : 6}
            value={rawValue}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            className="dashboard-input w-full rounded-lg border border-line bg-surface-2/60 px-3 py-2 text-[12.5px] text-ink outline-none transition-colors focus:border-accent/60 focus:ring-1 focus:ring-accent/20 placeholder:text-slate-500 disabled:opacity-60 resize-y min-h-[90px]"
          />
        </TextField>
      ) : (
        <TextField isDisabled={disabled}>
          <Input
            type={
              field.kind === "number"
                ? "number"
                : field.kind === "date"
                  ? "date"
                  : field.kind === "url"
                    ? "url"
                    : "text"
            }
            value={rawValue}
            placeholder={placeholder}
            onChange={(e) => {
              const next = e.target.value;
              if (field.kind === "number") onChange(next === "" ? undefined : Number(next));
              else if (field.kind === "date") onChange(next || undefined);
              else onChange(next);
            }}
            className="dashboard-input w-full rounded-lg border border-line bg-surface-2/60 px-3 py-2 text-[12.5px] text-ink outline-none transition-colors focus:border-accent/60 focus:ring-1 focus:ring-accent/20 placeholder:text-slate-500 disabled:opacity-60"
          />
        </TextField>
      )}

      <FieldError message={error} />
    </div>
  );
}

function BooleanControl({ field, value, path, errors, disabled, onChange }: FieldControlProps) {
  return (
    <div className="space-y-1.5">
      <Label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-line bg-surface-2 px-3 py-2.5">
        <span className="text-[12.5px] font-medium text-ink">{humanize(field.name)}</span>
        <Switch
          isSelected={Boolean(value)}
          isDisabled={disabled}
          onChange={(event) => onChange(event)}
          className="h-4 w-7 shrink-0"
        />
      </Label>
      <FieldError message={errors[path]} />
    </div>
  );
}

function EnumControl({ field, value, path, errors, disabled, onChange }: FieldControlProps) {
  return (
    <div className="space-y-1.5">
      <Label className="block">
        <span className={LABEL}>
          {humanize(field.name)}
          {field.required ? <span className="ml-1 text-accent">*</span> : null}
        </span>
        <Select
          value={asText(value)}
          onChange={(next: unknown) => onChange(next || undefined)}
          isDisabled={disabled}
          className={`${BOX} mt-1.5`}
        >
          <ListBoxItem value="">— none —</ListBoxItem>
          {(field.options ?? []).map((option) => (
            <ListBoxItem key={option} value={option}>{humanize(option)}</ListBoxItem>
          ))}
        </Select>
      </Label>
      <FieldError message={errors[path]} />
    </div>
  );
}

function ListControl({ field, value, path, errors, disabled, onChange }: FieldControlProps) {
  const items = asList(value);

  function update(index: number, next: string) {
    onChange(items.map((item, position) => (position === index ? next : item)));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const copy = [...items];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    onChange(copy);
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className={LABEL}>{humanize(field.name)}</span>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange([...items, ""])}
          className="mono inline-flex items-center gap-1 rounded-md border border-accent/30 bg-accent/10 px-2 py-1 text-[9.5px] uppercase tracking-[0.14em] text-accent transition-colors hover:bg-accent/20 hover:border-accent disabled:opacity-50"
        >
          <Icon name="Plus" className="h-3 w-3" />
          add item
        </button>
      </div>

      <div className="space-y-1.5">
        {items.length === 0 ? (
          <p className="rounded-lg border border-dashed border-line px-3 py-2.5 text-[11.5px] text-faint">
            No entries yet.
          </p>
        ) : null}

        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <TextField isDisabled={disabled}>
              <Input
                value={item}
                placeholder={`${humanize(field.name)} ${index + 1}`}
                onChange={(event) => update(index, event.target.value)}
                className={BOX}
              />
            </TextField>
            <button
              type="button"
              disabled={disabled}
              onClick={() => move(index, -1)}
              aria-label="Move up"
              className="grid h-8 w-7 shrink-0 place-items-center rounded-md border border-line text-faint transition-colors hover:text-accent disabled:opacity-40"
            >
              <Icon name="ChevronUp" className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => move(index, 1)}
              aria-label="Move down"
              className="grid h-8 w-7 shrink-0 place-items-center rounded-md border border-line text-faint transition-colors hover:text-accent disabled:opacity-40"
            >
              <Icon name="ChevronDown" className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange(items.filter((_, position) => position !== index))}
              aria-label="Remove entry"
              className="grid h-8 w-7 shrink-0 place-items-center rounded-md border border-line text-faint transition-colors hover:border-danger/40 hover:text-danger disabled:opacity-40"
            >
              <Icon name="Trash2" className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
      <FieldError message={errors[path]} />
    </div>
  );
}

function ObjectControl({ field, value, path, errors, disabled, onChange }: FieldControlProps) {
  const record = asRecord(value);

  return (
    <fieldset className="space-y-3 rounded-xl border border-line bg-surface-2/40 p-3.5">
      <legend className="mono px-1 text-[10px] uppercase tracking-[0.18em] text-accent">
        {humanize(field.name)}
      </legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {(field.children ?? []).map((child) => (
          <FieldControl
            key={child.name}
            field={child}
            value={record[child.name]}
            path={`${path}.${child.name}`}
            errors={errors}
            disabled={disabled}
            onChange={(next) => onChange({ ...record, [child.name]: next })}
          />
        ))}
      </div>
      <FieldError message={errors[path]} />
    </fieldset>
  );
}

function ObjectListControl({ field, value, path, errors, disabled, onChange }: FieldControlProps) {
  const rows = asRows(value);

  function update(index: number, next: Record<string, unknown>) {
    onChange(rows.map((row, position) => (position === index ? next : row)));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= rows.length) return;
    const copy = [...rows];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    onChange(copy);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className={LABEL}>{humanize(field.name)}</span>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange([...rows, {}])}
          className="mono inline-flex items-center gap-1 rounded-md border border-accent/30 bg-accent/10 px-2 py-1 text-[9.5px] uppercase tracking-[0.14em] text-accent transition-colors hover:bg-accent/20 hover:border-accent disabled:opacity-50"
        >
          <Icon name="Plus" className="h-3 w-3" />
          add row
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line px-3 py-2.5 text-[11.5px] text-faint">
          No rows yet.
        </p>
      ) : null}

      <div className="space-y-2">
        {rows.map((row, index) => (
          <div key={index} className="rounded-xl border border-line bg-surface-2/40 p-3">
            <div className="mb-2.5 flex items-center justify-between gap-2">
              <span className="mono text-[10px] uppercase tracking-[0.14em] text-faint">
                {humanize(field.name)} {index + 1}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => move(index, -1)}
                  aria-label="Move row up"
                  className="grid h-7 w-7 place-items-center rounded-md border border-line text-faint transition-colors hover:text-accent disabled:opacity-40"
                >
                  <Icon name="ChevronUp" className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => move(index, 1)}
                  aria-label="Move row down"
                  className="grid h-7 w-7 place-items-center rounded-md border border-line text-faint transition-colors hover:text-accent disabled:opacity-40"
                >
                  <Icon name="ChevronDown" className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange(rows.filter((_, position) => position !== index))}
                  aria-label="Remove row"
                  className="grid h-7 w-7 place-items-center rounded-md border border-line text-faint transition-colors hover:border-danger/40 hover:text-danger disabled:opacity-40"
                >
                  <Icon name="Trash2" className="h-3 w-3" />
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {(field.children ?? []).map((child) => (
                <FieldControl
                  key={child.name}
                  field={child}
                  value={row[child.name]}
                  path={`${path}.${index}.${child.name}`}
                  errors={errors}
                  disabled={disabled}
                  onChange={(next) => update(index, { ...row, [child.name]: next })}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <FieldError message={errors[path]} />
    </div>
  );
}

export function FieldControl(props: FieldControlProps) {
  switch (props.field.kind) {
    case "boolean":
      return <BooleanControl {...props} />;
    case "enum":
      return <EnumControl {...props} />;
    case "list":
      return <ListControl {...props} />;
    case "object":
      return <ObjectControl {...props} />;
    case "objectList":
      return <ObjectListControl {...props} />;
    default:
      return <ScalarControl {...props} />;
  }
}

/** Renders an entity schema in a two column grid. */
export function FieldGrid(props: {
  fields: readonly FieldDef[];
  values: Record<string, unknown>;
  errors: FieldErrors;
  disabled?: boolean;
  onChange: (name: string, value: unknown) => void;
}) {
  return (
    <div className="grid gap-3.5 md:grid-cols-2">
      {props.fields.map((field) => (
        <div
          key={field.name}
          className={
            field.kind === "object" || field.kind === "objectList" || field.kind === "text"
              ? "md:col-span-2"
              : undefined
          }
        >
          <FieldControl
            field={field}
            value={props.values[field.name]}
            path={field.name}
            errors={props.errors}
            disabled={props.disabled}
            onChange={(next) => props.onChange(field.name, next)}
          />
        </div>
      ))}
    </div>
  );
}
