import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateReport, ReportPeriod } from "@/lib/reports/generator";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = (searchParams.get("period") || "week") as ReportPeriod;

    // Validate period
    if (!["week", "month", "quarter", "year"].includes(period)) {
      return NextResponse.json(
        { error: "Invalid period. Use: week, month, quarter, or year" },
        { status: 400 }
      );
    }

    const report = await generateReport(session.user.id, period);

    return NextResponse.json({ report });
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
