"use client";

import Link from "next/link";
import { Pencil, Tag, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Service } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { deleteSelectedServices } from "@/app/(app)/services/actions";

export function ServicesBulkList({ services }: { services: Service[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const allSelected = selected.length === services.length;

  function toggleService(serviceId: string) {
    setSelected((current) =>
      current.includes(serviceId)
        ? current.filter((id) => id !== serviceId)
        : [...current, serviceId],
    );
  }

  function toggleAll() {
    setSelected(allSelected ? [] : services.map((service) => service.id));
  }

  return (
    <form action={deleteSelectedServices} className="grid gap-4">
      <div className="flex flex-col gap-3 rounded-[--radius] border border-[--color-border-soft] bg-[--color-surface] px-4 py-3 md:flex-row md:items-center md:justify-between">
        <label className="inline-flex items-center gap-2 text-sm text-[--color-muted]">
          <input
            type="checkbox"
            className="size-4 accent-[--color-brand-500]"
            checked={allSelected}
            onChange={toggleAll}
          />
          בחירת כל השירותים
        </label>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[--color-muted]">
            {selected.length} נבחרו
          </span>
          <Button
            type="submit"
            variant="danger"
            disabled={selected.length === 0}
            onClick={(event) => {
              if (
                !window.confirm(
                  `למחוק ${selected.length} שירותים? החשבוניות שלהם יישארו במערכת ללא שיוך.`,
                )
              ) {
                event.preventDefault();
              }
            }}
          >
            <Trash2 className="size-4" />
            מחיקה
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => {
          const checked = selectedSet.has(service.id);

          return (
            <Card key={service.id} className="!p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <label className="mt-1">
                  <input
                    type="checkbox"
                    name="serviceIds"
                    value={service.id}
                    className="size-4 accent-[--color-brand-500]"
                    checked={checked}
                    onChange={() => toggleService(service.id)}
                  />
                </label>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold truncate">{service.name}</div>
                  {service.vendor && (
                    <div className="text-xs text-[--color-muted] truncate mt-0.5">
                      {service.vendor}
                    </div>
                  )}
                </div>
                <StatusPill status={service.status} />
              </div>

              <div className="kpi-number text-2xl">
                {formatCurrency(Number(service.cost_amount), service.cost_currency)}
                <span className="text-xs text-[--color-muted-2] font-normal mr-1">
                  /{" "}
                  {service.billing_cycle === "monthly"
                    ? "חודש"
                    : service.billing_cycle === "annual"
                      ? "שנה"
                      : "חד פעמי"}
                </span>
              </div>

              {service.next_renewal_date && (
                <div className="mt-3 text-xs text-[--color-muted]">
                  חידוש: {formatDate(service.next_renewal_date)}
                </div>
              )}

              {service.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {service.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] rounded-md bg-[--color-surface-2] text-[--color-muted]"
                    >
                      <Tag className="size-2.5" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-5 pt-4 border-t border-[--color-border-soft]">
                <Link
                  href={`/services/${service.id}/edit`}
                  className="inline-flex h-8 items-center gap-2 rounded-[--radius-sm] px-3 text-xs font-medium text-[--color-muted] hover:bg-[--color-surface-2] hover:text-[--color-foreground] transition-colors"
                >
                  <Pencil className="size-3.5" />
                  עריכה
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </form>
  );
}

function StatusPill({ status }: { status: Service["status"] }) {
  const label =
    status === "active" ? "פעיל" : status === "paused" ? "מושהה" : "בוטל";
  const tone =
    status === "active"
      ? "bg-[--color-accent-green]/10 text-[--color-accent-green]"
      : status === "paused"
        ? "bg-[--color-accent-amber]/10 text-[--color-accent-amber]"
        : "bg-[--color-muted-2]/10 text-[--color-muted]";

  return (
    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${tone}`}>
      {label}
    </span>
  );
}
