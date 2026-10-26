"use client";

import { useEffect, useState } from "react";

type Member = { id: string; name: string; avatar_url?: string | null; score: number };

export default function Home() {
  const [members, setMembers] = useState<Member[]>([]);
  const [modal, setModal] = useState<"member" | "score" | null>(null);
  const [selected, setSelected] = useState<Member | null>(null);
  const [mode, setMode] = useState<"plus" | "minus">("plus");
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [points, setPoints] = useState(1);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const monthLabel = new Intl.DateTimeFormat("vi-VN", { month: "long", year: "numeric" }).format(new Date());

  async function loadMembers() {
    const response = await fetch("/api/members", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Không thể tải dữ liệu.");
    setMembers(data);
  }

  useEffect(() => { loadMembers().catch(e => setError(e.message)); }, []);

  function openScore(member: Member, type: "plus" | "minus") {
    setSelected(member); setMode(type); setPoints(1); setReason(""); setError(""); setModal("score");
  }

  async function submitScore() {
    if (!selected || !reason.trim()) return;
    setSaving(true); setError("");
    try {
      const response = await fetch("/api/score", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ memberId: selected.id, points, mode, reason }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Không thể lưu điểm.");
      setMembers(list => list.map(m => m.id === selected.id ? { ...m, score: data.score } : m));
      setModal(null);
    } catch (e) { setError(e instanceof Error ? e.message : "Có lỗi xảy ra."); }
    finally { setSaving(false); }
  }

  async function addMember() {
    if (!name.trim()) return;
    setSaving(true); setError("");
    try {
      const response = await fetch("/api/members", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, avatarUrl }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Không thể tạo thành viên.");
      setMembers(list => [...list, data]); setName(""); setAvatarUrl(""); setModal(null);
    } catch (e) { setError(e instanceof Error ? e.message : "Có lỗi xảy ra."); }
    finally { setSaving(false); }
  }

  async function removeMember(id: string) {
    if (!window.confirm("Bạn có chắc muốn xóa thành viên này?")) return;
    const response = await fetch("/api/members", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (response.ok) setMembers(list => list.filter(m => m.id !== id));
  }

  return (
    <main className="shell">
      <header className="header"><div className="brand"><h1>Chong Jong Cho</h1><p>Nhật ký đánh giá thành viên</p></div><div className="actions"><button className="btn" onClick={() => alert("Lịch sử sẽ được mở ở phiên bản tiếp theo.")}>Lịch sử</button><button className="btn" onClick={() => alert("Ngày công khai mặc định: 28 hằng tháng.")}>Cài đặt</button><button className="btn primary" onClick={() => { setError(""); setModal("member"); }}>+ Thêm thành viên</button></div></header>
      <section className="hero"><div className="hero-top"><div><h2>Kỳ đánh giá {monthLabel}</h2><p>Mỗi thành viên bắt đầu kỳ mới với 100 điểm.</p></div><span className="lock">🔒 Đang ẩn đánh giá</span></div><p style={{ marginTop: 15, fontSize: 13, color: "#69707d" }}>Dữ liệu đã được lưu vào cơ sở dữ liệu và sẽ không mất khi bạn tải lại hoặc mở lại website.</p></section>
      {error && <div className="notice" style={{ marginBottom: 16 }}>{error}</div>}
      {members.length ? <section className="grid">{members.map(member => <article className="card" key={member.id}><div className="person"><div className="avatar">{member.avatar_url ? <img src={member.avatar_url} alt="" /> : member.name.charAt(0).toUpperCase()}</div><div><h3>{member.name}</h3><span>Điểm tháng hiện tại</span></div></div><div className="score"><strong>{member.score}</strong><span>/ 100</span></div><div className="progress"><div style={{ width: `${member.score}%` }} /></div><div className="card-actions"><button className="btn plus" onClick={() => openScore(member, "plus")}>+ Cộng điểm</button><button className="btn minus" onClick={() => openScore(member, "minus")}>− Trừ điểm</button></div><button className="btn" style={{ width: "100%", marginTop: 9 }} onClick={() => removeMember(member.id)}>Xóa thành viên</button></article>)}</section> : <div className="empty">Chưa có thành viên. Hãy thêm thành viên đầu tiên.</div>}
      {modal === "member" && <div className="modal-backdrop" onMouseDown={() => !saving && setModal(null)}><div className="modal" onMouseDown={e => e.stopPropagation()}><h2>Thêm thành viên</h2><div className="form"><label>Tên thành viên<input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Nhập tên" /></label><label>Avatar (URL)<input value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} placeholder="https://..." /></label><div className="notice">Thành viên mới sẽ bắt đầu với <strong>100 điểm</strong>. Thông tin được lưu trên máy chủ.</div></div><div className="modal-actions"><button className="btn" disabled={saving} onClick={() => setModal(null)}>Hủy</button><button className="btn primary" disabled={saving} onClick={addMember}>{saving ? "Đang lưu..." : "Tạo thành viên"}</button></div></div></div>}
      {modal === "score" && selected && <div className="modal-backdrop" onMouseDown={() => !saving && setModal(null)}><div className="modal" onMouseDown={e => e.stopPropagation()}><h2>{mode === "plus" ? "Cộng điểm" : "Trừ điểm"} — {selected.name}</h2><div className="form"><label>Số điểm<input type="number" min={1} max={100} value={points} onChange={e => setPoints(Math.max(1, Number(e.target.value)))} /></label><label>Lý do / ghi chú<textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Nhập lý do đánh giá..." /></label><label>Ảnh bằng chứng<input type="file" accept="image/*" /></label><div className="notice">Lý do và số lượt đánh giá vẫn được giữ kín cho đến ngày công khai.</div></div><div className="modal-actions"><button className="btn" disabled={saving} onClick={() => setModal(null)}>Hủy</button><button className="btn primary" disabled={saving || !reason.trim()} onClick={submitScore}>{saving ? "Đang lưu..." : mode === "plus" ? "Xác nhận cộng" : "Xác nhận trừ"}</button></div></div></div>}
    </main>
  );
}
