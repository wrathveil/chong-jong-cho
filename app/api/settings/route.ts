import { NextResponse } from "next/server";
import { getDb } from "../../../lib/db";

export async function GET() {
  try {
    const sql = getDb();
    const [settings] = await sql`SELECT reveal_day, timezone FROM app_settings WHERE id = true LIMIT 1`;
    return NextResponse.json({ revealDay: settings?.reveal_day ?? 28, timezone: settings?.timezone ?? "Asia/Ho_Chi_Minh" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Không thể tải cài đặt." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const revealDay = Number(body.revealDay);
    if (!Number.isInteger(revealDay) || revealDay < 1 || revealDay > 31) {
      return NextResponse.json({ error: "Ngày công khai phải từ 1 đến 31." }, { status: 400 });
    }
    const timezone = String(body.timezone ?? "Asia/Ho_Chi_Minh");
    const sql = getDb();
    const [settings] = await sql`
      INSERT INTO app_settings (id, reveal_day, timezone, updated_at)
      VALUES (true, ${revealDay}, ${timezone}, now())
      ON CONFLICT (id) DO UPDATE SET reveal_day = EXCLUDED.reveal_day, timezone = EXCLUDED.timezone, updated_at = now()
      RETURNING reveal_day, timezone
    `;
    return NextResponse.json({ revealDay: settings.reveal_day, timezone: settings.timezone });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Không thể lưu cài đặt." }, { status: 500 });
  }
}
