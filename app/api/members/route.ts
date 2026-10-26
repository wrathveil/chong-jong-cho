import { NextResponse } from "next/server";
import { getDb } from "../../../lib/db";

export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql`
      SELECT m.id, m.name, m.avatar_url,
        COALESCE(ms.score, 100) AS score
      FROM members m
      LEFT JOIN monthly_scores ms
        ON ms.member_id = m.id
       AND ms.month_start = date_trunc('month', CURRENT_DATE)::date
      WHERE m.deleted_at IS NULL
      ORDER BY m.created_at ASC
    `;
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Không thể tải danh sách thành viên." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const avatarUrl = String(body.avatarUrl ?? "").trim() || null;
    if (!name) return NextResponse.json({ error: "Tên thành viên không được để trống." }, { status: 400 });

    const sql = getDb();
    const [member] = await sql`
      INSERT INTO members (name, avatar_url) VALUES (${name}, ${avatarUrl})
      RETURNING id, name, avatar_url
    `;
    await sql`
      INSERT INTO monthly_scores (member_id, month_start, score)
      VALUES (${member.id}, date_trunc('month', CURRENT_DATE)::date, 100)
      ON CONFLICT (member_id, month_start) DO NOTHING
    `;
    return NextResponse.json({ ...member, score: 100 }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Không thể tạo thành viên." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const sql = getDb();
    await sql`UPDATE members SET deleted_at = now() WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Không thể xóa thành viên." }, { status: 500 });
  }
}
