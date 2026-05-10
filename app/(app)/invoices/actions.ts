"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { scanConnectedEmailAccounts } from "@/lib/gmail/invoice-scanner";
import type { BillingCycle, CurrencyCode } from "@/lib/types";

function requiredString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function invoiceActionError(message: string): never {
  redirect(`/invoices?error=${encodeURIComponent(message)}`);
}

async function authenticatedSupabase() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return { supabase, user };
}

export async function scanInvoices() {
  const { supabase, user } = await authenticatedSupabase();

  const result = await scanConnectedEmailAccounts(supabase, user.id);
  const params = new URLSearchParams({
    scanned: String(result.scannedMessages),
    inserted: String(result.insertedInvoices),
    skipped: String(result.skippedMessages),
  });

  if (result.errors.length > 0) {
    params.set("error", result.errors[0]);
  }

  revalidatePath("/invoices");
  redirect(`/invoices?${params.toString()}`);
}

export async function assignInvoiceToService(formData: FormData) {
  const invoiceId = requiredString(formData, "invoice_id");
  const serviceId = requiredString(formData, "service_id");

  if (!invoiceId || !serviceId) {
    invoiceActionError("בחרו חשבונית ושירות לשיוך");
  }

  const { supabase } = await authenticatedSupabase();
  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("id")
    .eq("id", serviceId)
    .single();

  if (serviceError || !service) {
    invoiceActionError(serviceError?.message ?? "לא נמצא שירות לשיוך");
  }

  const { error } = await supabase
    .from("invoices")
    .update({
      service_id: serviceId,
      status: "matched",
    })
    .eq("id", invoiceId);

  if (error) {
    invoiceActionError(error.message);
  }

  revalidatePath("/");
  revalidatePath("/invoices");
  redirect("/invoices?assigned=1");
}

export async function createServiceFromInvoice(formData: FormData) {
  const invoiceId = requiredString(formData, "invoice_id");
  const serviceName = requiredString(formData, "service_name");
  const billingCycle = requiredString(formData, "billing_cycle") as BillingCycle;

  if (!invoiceId || !serviceName) {
    invoiceActionError("שם השירות נדרש כדי להוסיף שירות חדש");
  }

  if (!["monthly", "annual", "one_time"].includes(billingCycle)) {
    invoiceActionError("מחזור החיוב לא תקין");
  }

  const { supabase } = await authenticatedSupabase();
  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .select("workspace_id, amount, currency, vendor_raw, invoice_date")
    .eq("id", invoiceId)
    .single();

  if (invoiceError || !invoice) {
    invoiceActionError(invoiceError?.message ?? "לא נמצאה חשבונית לשיוך");
  }

  const keywords = Array.from(
    new Set(
      [invoice.vendor_raw, serviceName]
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value)),
    ),
  );

  const { data: service, error: serviceError } = await supabase
    .from("services")
    .insert({
      workspace_id: invoice.workspace_id,
      name: serviceName,
      vendor: invoice.vendor_raw,
      website: null,
      logo_url: null,
      billing_cycle: billingCycle,
      cost_amount: Number(invoice.amount),
      cost_currency: invoice.currency as CurrencyCode,
      next_renewal_date: null,
      status: "active",
      tags: [],
      invoice_keywords: keywords,
      notes: null,
      paid_by_email: null,
    })
    .select("id")
    .single();

  if (serviceError || !service) {
    invoiceActionError(serviceError?.message ?? "לא הצלחנו ליצור שירות חדש");
  }

  const { error: updateError } = await supabase
    .from("invoices")
    .update({
      service_id: service.id,
      status: "matched",
    })
    .eq("id", invoiceId);

  if (updateError) {
    invoiceActionError(updateError.message);
  }

  revalidatePath("/");
  revalidatePath("/services");
  revalidatePath("/invoices");
  redirect("/invoices?created=1");
}
