"use client";

import { useDeferredValue, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Check, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

/**
 * Pick one person, fast, on a phone, one-handed, mid-shift.
 *
 * A flat wrap of names is fine for a dozen and unusable for a full roster:
 * a wall of identical buttons with no order and nothing to aim at. Three
 * things fix that, in the order they matter:
 *
 *   type-ahead   for the manager who knows the name. Two letters is faster
 *                than any amount of scanning, and it is the common case
 *   departments  for the manager who does not. A department heading halves
 *                the list before they read a single name
 *   initials     a soft coloured disc gives every row something to aim at
 *                that is not text, which is what makes a long list scannable
 *
 * The colour is derived from the name, so a person keeps the same disc
 * everywhere and the manager starts recognising them by it: decoration with
 * a job, not decoration.
 */

export interface PickerStaff {
  id: string;
  name: string;
  role?: string;
  department?: string;
}

/** Stable per person, so Diego is always the same colour. Hue only: the
 * lightness and chroma are fixed low so no disc fights the text on it or the
 * cream surface behind it. */
function discStyle(name: string): CSSProperties {
  let h = 0;
  for (let i = 0; i < name.length; i += 1) {
    h = (h * 31 + name.charCodeAt(i)) % 360;
  }
  return {
    backgroundColor: `oklch(0.88 0.045 ${h})`,
    color: `oklch(0.38 0.07 ${h})`,
  };
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || "?";
}

/** "front_office" reads as a database column. Managers say "Front office". */
function prettyDepartment(value: string): string {
  const words = value.replace(/_/g, " ").trim();
  if (words.toLowerCase() === "f and b") return "F&B";
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function StaffPicker({
  staff,
  selectedId,
  onSelect,
}: {
  staff: PickerStaff[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  // Typing stays responsive on a long roster: the filter runs at a lower
  // priority than the keystroke that caused it.
  const deferred = useDeferredValue(query);
  const inputRef = useRef<HTMLInputElement>(null);

  const groups = useMemo(() => {
    const q = deferred.trim().toLowerCase();
    const matched = q
      ? staff.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            (s.department ?? "")
              .replace(/_/g, " ")
              .toLowerCase()
              .includes(q)
        )
      : staff;

    const byDept = new Map<string, PickerStaff[]>();
    for (const s of matched) {
      const key = s.department ?? "Other";
      const list = byDept.get(key);
      if (list) list.push(s);
      else byDept.set(key, [s]);
    }
    return [...byDept.entries()]
      .map(([dept, people]) => ({
        dept,
        people: [...people].sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => b.people.length - a.people.length);
  }, [staff, deferred]);

  const total = groups.reduce((n, g) => n + g.people.length, 0);

  return (
    <div className="space-y-3">
      {/* Search first: on a roster this size it is the fastest route for
          anyone who already knows who they are logging. */}
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Type a name, or pick below (${staff.length})`}
          aria-label="Search staff by name or department"
          className="h-11 rounded-xl border bg-card pl-9 pr-9 [&::-webkit-search-cancel-button]:appearance-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            aria-label="Clear the search"
            className="absolute right-2 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {total === 0 && (
        <p className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
          No one matches &ldquo;{query}&rdquo;.
        </p>
      )}

      <div className="max-h-[19rem] space-y-4 overflow-y-auto pr-1">
        {groups.map((group) => (
          <div key={group.dept} className="space-y-2">
            <p className="sticky top-0 z-10 bg-card/95 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur">
              {prettyDepartment(group.dept)}
              <span className="ml-1.5 font-normal text-muted-foreground/60">
                {group.people.length}
              </span>
            </p>

            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {group.people.map((s) => {
                const selected = s.id === selectedId;
                return (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onSelect(s.id)}
                    className={`flex min-h-12 items-center gap-2.5 rounded-xl border px-2.5 text-left transition-colors ${
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "bg-card hover:border-primary/40 hover:bg-muted/40"
                    }`}
                  >
                    <span
                      aria-hidden
                      className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                      style={
                        selected
                          ? {
                              backgroundColor: "rgb(255 255 255 / 0.22)",
                              color: "inherit",
                            }
                          : discStyle(s.name)
                      }
                    >
                      {initials(s.name)}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold leading-tight">
                        {s.name}
                      </span>
                      {/* The API's "role" is the access role, so it reads
                          "staff" for almost everyone and says nothing. Shown
                          only where it is an actual job title; the department
                          is already the group heading above. */}
                      {s.role && s.role !== "staff" && (
                        <span
                          className={`block truncate text-xs leading-tight ${
                            selected
                              ? "text-primary-foreground/80"
                              : "text-muted-foreground"
                          }`}
                        >
                          {s.role}
                        </span>
                      )}
                    </span>

                    {/* Only on the chosen one. A tick on every row would be
                        noise; a tick on one is the answer to "did that
                        register?" */}
                    {selected && <Check className="size-4 shrink-0" aria-hidden />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
