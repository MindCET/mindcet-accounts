import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ServicesBulkList } from "@/components/services/ServicesBulkList";
import { getAuthenticatedServiceCatalog } from "@/lib/services/shared-catalog";

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const { supabase } = await getAuthenticatedServiceCatalog();
  const { data: services } = await supabase
    .from("services")
    .select("*")
    .order("vendor", { ascending: true, nullsFirst: false })
    .order("name", { ascending: true });

  const all = services ?? [];

  // קיבוץ לפי ספק — server-side
  const groupMap = new Map<string, typeof all>();
  for (const service of all) {
    const key = service.vendor?.trim() || "ללא ספק";
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key)!.push(service);
  }
  // ללא ספק תמיד אחרון
  const groups: [string, typeof all][] = [];
  for (const [key, group] of groupMap) {
    if (key !== "ללא ספק") groups.push([key, group]);
  }
  if (groupMap.has("ללא ספק")) groups.push(["ללא ספק", groupMap.get("ללא ספק")!]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight mb-2">שירותים</h1>
          <p className="text-[--color-muted]">
            {all.length} {all.length === 1 ? "שירות" : "שירותים"}
          </p>
        </div>
        <Link href="/services/new">
          <Button>
            <Plus className="size-4" />
            הוסף שירות
          </Button>
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-[--radius] border border-[--color-accent-red]/30 bg-[--color-accent-red]/10 p-3 text-sm text-[--color-accent-red]">
          {decodeURIComponent(error)}
        </div>
      )}

      {all.length === 0 ? (
        <Card className="text-center py-16">
          <div className="text-5xl mb-4">📦</div>
          <h2 className="text-lg font-medium mb-1">עדיין אין שירותים</h2>
          <p className="text-sm text-[--color-muted] mb-6">
            התחל בהוספת השירות הראשון
          </p>
          <Link href="/services/new" className="inline-block">
            <Button>
              <Plus className="size-4" />
              הוסף שירות ראשון
            </Button>
          </Link>
        </Card>
      ) : (
        <ServicesBulkList services={all} groups={groups} />
      )}
    </div>
  );
}
