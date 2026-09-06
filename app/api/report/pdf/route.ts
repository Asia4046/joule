import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getReport, REPORT_TTL_DAYS } from "@/lib/report";
import { renderReportPdf } from "@/lib/report-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The engine-generated preparation report — always set in the dark dossier palette. */
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const report = await getReport(user.id);
  const validUntil = new Date(report.generatedAt.getTime() + REPORT_TTL_DAYS * 86400000).toISOString();

  const bytes = await renderReportPdf(report.data, {
    generatedAt: report.generatedAt.toISOString(),
    validUntil,
    cached: report.cached,
    ttlDays: REPORT_TTL_DAYS,
  });

  return new Response(bytes as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="joule-report-${new Date().toISOString().slice(0, 10)}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
