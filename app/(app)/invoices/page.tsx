import { Check, FileText, Link2, Plus } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { ScanInvoicesButton } from "@/components/invoices/ScanInvoicesButton";
import { createClient } from "@/lib/supabase/server";
import { createStorageSignedUrl } from "@/lib/supabase/storage";
import type { Invoice, Service } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  assignInvoiceToService,
  createServiceFromInvoice,
  scanInvoices,
} from "./actions";

type InvoiceWithService = Invoice & {
  services: { name: string } | null;
};

export const maxDuration = 60;

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{
    scanned?: string;
    inserted?: string;
    skipped?: string;
    error?: string;
    assigned?: string;
    created?: string;
  }>;
}) {
  const scanStatus = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: emailAccounts } = user
    ? await supabase
        .from("email_accounts")
        .select("email,last_scan_at,scan_enabled")
        .eq("user_id", user.id)
    : { data: [] };

  const { data: invoices } = await supabase
    .from("invoices")
    .select("*, services(name)")
    .order("invoice_date", { ascending: false })
    .limit(50)
    .returns<InvoiceWithService[]>();

  const { data: services } = await supabase
    .from("services")
    .select("id,name,vendor")
    .order("name", { ascending: true })
    .returns<Pick<Service, "id" | "name" | "vendor">[]>();

  const all = invoices ?? [];
  const serviceOptions = services ?? [];
  const signedPdfUrls = new Map(
    await Promise.all(
      all
        .filter((invoice) => invoice.pdf_storage_path)
        .map(async (invoice) => {
          const signedUrl = await createStorageSignedUrl(
            supabase,
            "invoice-pdfs",
            invoice.pdf_storage_path!,
            60 * 10,
          ).catch(() => null);

          return [invoice.id, signedUrl] as const;
        }),
    ),
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight mb-2">חשבוניות</h1>
          <p className="text-[--color-muted]">
            {all.length} חשבוניות אחרונות שנשמרו במערכת
          </p>
        </div>
        <form action={scanInvoices}>
          <ScanInvoicesButton />
        </form>
      </div>

      {emailAccounts && emailAccounts.length > 0 ? (
        <div className="mb-4 rounded-[--radius] border border-[--color-border-soft] bg-[--color-surface] px-4 py-3 text-sm text-[--color-muted]">
          Gmail מחובר: {emailAccounts.map((account) => account.email).join(", ")}
          {emailAccounts[0]?.last_scan_at && (
            <> · סריקה אחרונה: {formatDate(emailAccounts[0].last_scan_at)}</>
          )}
        </div>
      ) : (
        <div className="mb-4 rounded-[--radius] border border-[--color-accent-amber]/30 bg-[--color-accent-amber]/10 px-4 py-3 text-sm text-[--color-accent-amber]">
          לא נמצא חשבון Gmail מחובר לסריקה. התחברות חדשה עם Google תשמור את ההרשאה.
        </div>
      )}

      {(scanStatus.scanned || scanStatus.error) && (
        <div
          className={
            "mb-4 rounded-[--radius] border px-4 py-3 text-sm " +
            (scanStatus.error
              ? "border-[--color-accent-red]/30 bg-[--color-accent-red]/10 text-[--color-accent-red]"
              : "border-[--color-accent-green]/30 bg-[--color-accent-green]/10 text-[--color-accent-green]")
          }
        >
          {scanStatus.error
            ? decodeURIComponent(scanStatus.error)
            : `נסרקו ${scanStatus.scanned} מיילים, נוספו ${scanStatus.inserted} חשבוניות, דולגו ${scanStatus.skipped}.`}
        </div>
      )}

      {(scanStatus.assigned || scanStatus.created) && (
        <div className="mb-4 rounded-[--radius] border border-[--color-accent-green]/30 bg-[--color-accent-green]/10 px-4 py-3 text-sm text-[--color-accent-green]">
          {scanStatus.created
            ? "נוצר שירות חדש והחשבונית שויכה אליו."
            : "החשבונית שויכה לשירות."}
        </div>
      )}

      {all.length === 0 ? (
        <Card className="text-center py-16">
          <div className="mx-auto mb-4 size-12 rounded-[--radius-md] bg-[--color-surface-2] grid place-items-center text-[--color-brand-400]">
            <FileText className="size-6" />
          </div>
          <h2 className="text-lg font-medium mb-1">עדיין אין חשבוניות</h2>
          <p className="text-sm text-[--color-muted]">
            סריקת Gmail תוסיף לכאן חשבוניות כשמזוהה סכום במייל.
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden !p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-[--color-muted]">
                <tr className="border-b border-[--color-border-soft]">
                  <th className="text-right font-medium px-5 py-3">תאריך</th>
                  <th className="text-right font-medium px-5 py-3">ספק</th>
                  <th className="text-right font-medium px-5 py-3">שירות</th>
                  <th className="text-left font-medium px-5 py-3">סכום</th>
                  <th className="text-right font-medium px-5 py-3">סטטוס</th>
                  <th className="text-right font-medium px-5 py-3">שיוך</th>
                  <th className="text-right font-medium px-5 py-3">PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[--color-border-soft]">
                {all.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-[--color-surface-2]/50">
                    <td className="px-5 py-4 whitespace-nowrap">
                      {formatDate(invoice.invoice_date)}
                    </td>
                    <td className="px-5 py-4">{invoice.vendor_raw ?? "-"}</td>
                    <td className="px-5 py-4">
                      {invoice.services?.name ?? "לא משויך"}
                    </td>
                    <td className="px-5 py-4 text-left kpi-number">
                      {formatCurrency(Number(invoice.amount), invoice.currency)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={invoice.status} />
                    </td>
                    <td className="px-5 py-4 min-w-72">
                      {invoice.service_id ? (
                        <span className="text-xs text-[--color-muted]">משויך</span>
                      ) : (
                        <div className="grid gap-2">
                          <form
                            action={assignInvoiceToService}
                            className="flex items-center gap-2"
                          >
                            <input type="hidden" name="invoice_id" value={invoice.id} />
                            <select
                              name="service_id"
                              required
                              className="input h-9 min-w-40 text-xs"
                              defaultValue=""
                            >
                              <option value="" disabled>
                                בחר שירות קיים
                              </option>
                              {serviceOptions.map((service) => (
                                <option key={service.id} value={service.id}>
                                  {service.name}
                                  {service.vendor ? ` · ${service.vendor}` : ""}
                                </option>
                              ))}
                            </select>
                            <button
                              type="submit"
                              className="inline-flex h-9 items-center justify-center gap-1 rounded-[--radius-sm] bg-[--color-surface-2] px-3 text-xs font-medium text-[--color-foreground] hover:bg-[--color-border-soft]"
                              title="שייך לשירות קיים"
                            >
                              <Check className="size-3.5" />
                              שייך
                            </button>
                          </form>

                          <form
                            action={createServiceFromInvoice}
                            className="grid grid-cols-[minmax(10rem,1fr)_auto_auto] items-center gap-2"
                          >
                            <input type="hidden" name="invoice_id" value={invoice.id} />
                            <input
                              name="service_name"
                              required
                              className="input h-9 text-xs"
                              placeholder="שם שירות חדש"
                              defaultValue={invoice.vendor_raw ?? ""}
                            />
                            <select
                              name="billing_cycle"
                              className="input h-9 w-24 text-xs"
                              defaultValue="monthly"
                              aria-label="מחזור חיוב"
                            >
                              <option value="monthly">חודשי</option>
                              <option value="annual">שנתי</option>
                              <option value="one_time">חד פעמי</option>
                            </select>
                            <button
                              type="submit"
                              className="inline-flex h-9 items-center justify-center gap-1 rounded-[--radius-sm] bg-[--color-brand-500] px-3 text-xs font-medium text-white hover:bg-[--color-brand-400]"
                              title="הוסף שירות ושייך חשבונית"
                            >
                              <Plus className="size-3.5" />
                              הוסף
                            </button>
                          </form>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {signedPdfUrls.get(invoice.id) ? (
                        <Link
                          href={signedPdfUrls.get(invoice.id)!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[--color-brand-400] hover:text-[--color-brand-300]"
                        >
                          <Link2 className="size-3.5" />
                          קובץ
                        </Link>
                      ) : (
                        <span className="text-[--color-muted-2]">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: "matched" | "unmatched" | "manual" }) {
  const label =
    status === "matched" ? "משויך" : status === "manual" ? "ידני" : "לא משויך";
  const tone =
    status === "matched"
      ? "bg-[--color-accent-green]/10 text-[--color-accent-green]"
      : status === "manual"
        ? "bg-[--color-brand-500]/10 text-[--color-brand-400]"
        : "bg-[--color-accent-amber]/10 text-[--color-accent-amber]";

  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${tone}`}>
      {label}
    </span>
  );
}
