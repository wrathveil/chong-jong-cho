import { NextResponse } from "next/server";
import { getDb } from "../../../lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const memberId = String(body.memberId ?? "");
    const points = Number(body.points);
    const mode = body.mode === "minus" ? "minus" : "plus";
    const reason = String(body.reason ?? "").trim();
    const evidenceUrl = String(body.evidenceUrl ?? "").trim() || null;
    const evaluatorName = String(body.evaluatorName ?? "").trim() || "Người dùng";

    if (!memberId || !Number.isInteger(points) || points < 1 || points > 100 || !reason) {
      return NextResponse.json({ error: "Vui lòng nhập số điểm hợp lệ và lý do." }, { status: 400 });
    }

    const delta = mode === "minus" ? -points : points;
    const sql = getDb();
    const [result] = await sql`
      WITH ensured AS (
        INSERT INTO monthly_scores (member_id, month_start, score)
        VALUES (${memberId}, date_trunc('month', CURRENT_DATE)::date, 100)
        ON CONFLICT (member_id, month_start) DO NOTHING
      ), changed AS (
        UPDATE monthly_scores
        SET score = GREATEST(0, LEAST(100, score + ${delta}))
        WHERE member_id = ${memberId}
          AND month_start = date_trunc('month', CURRENT_DATE)::date
        RETURNING member_id, month_start, score
      ), logged AS (
        INSERT INTO point_events (member_id, month_start, delta, reason, evidence_url, evaluator_name)
        SELECT member_id, month_start, ${delta}, ${reason}, ${evidenceUrl}, ${evaluatorName}
        FROM changed
        RETURNING id
      )
      SELECT changed.score, (SELECT id FROM logged LIMIT 1) AS event_id FROM changed
    `;

    return NextResponse.json({ score: result?.score ?? 100, eventId: result?.event_id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Không thể lưu thay đổi điểm." }, { status: 500 });
  }
}
