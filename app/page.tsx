"use client";

import { useMemo, useState } from "react";

type Member = { id: number; name: string; avatar?: string; score: number };

const initialMembers: Member[] = [
  { id: 1, name: "Nguyễn Thành viên", score: 100 },
  { id: 2, name: "Trần Thành viên", score: 94 },
  { id: 3, name: "Lê Thành viên", score: 87 },
];

export default function Home() {
  const [members, setMembers] = useState(initialMembers);
  const [modal, setModal] = useState<"member" | "score" | null>(null);
  const [selected, setSelected] = useState<Member | null>(null);
  const [mode, setMode] = useState<"plus" | "minus">("plus");
  const [name, setName] = useState("");
  const [points, setPoints] = useState(1);
  const [reason, setReason] = useState("");

  const monthLabel = useMemo(() => new Intl.DateTimeFormat("vi-VN", { month: "long", year: "numeric" }).format(new Date()), []);

  function openScore(member: Member, type: "plus" | "minus") {
    setSelected(member); setMode(type); setPoints(1); setReason(""); setModal("score");
  }

  function submitScore() {
    if (!selected || !reason.trim()) return;
    setMembers(list => list.map(m => m.id === selected.id ? { ...m, score: Math.max(0, Math.min(100, m.score + (mode === "plus" ? points : -points))) } : m));
    setModal(null);
  }

  function addMember() {
    if (!name.trim()) return;
    setMembers(list => [...list, { id: Date.now(), name: name.trim(), score: 100 }]);
    setName(""); setModal(null);
  }

  function removeMember(id: number) {
    if (window.confirm("Bạn có chắc muốn xóa thành viên này?")) setMembers(list => list.filter(m => m.id !== id));
  }

  return (
    <main className="shell">
      <header className="header">
        <div className="brand"><h1>Chong Jong Cho</h1><p>Nhật ký đánh giá thành viên</p></div>
        <div className="actions"><button className="btn" onClick={() => alert("Lịch sử tháng sẽ được kết nối với Neon ở bước tiếp theo.")}>Lịch sử</button><button className="btn" onClick={() => alert("Cài đặt: ngày công khai mặc định là 28.")}>Cài đặt</button><button className="btn primary" onClick={() => setModal("member")}>+ Thêm thành viên</button></div>
      </header>

      <section className="hero">
        <div className="hero-top"><div><h2>Kỳ đánh giá {monthLabel}</h2><p>Mỗi thành viên bắt đầu kỳ mới với 100 điểm.</p></div><span className="lock">🔒 Đang ẩn đánh giá</span></div>
        <p style={{ marginTop: 15, fontSize: 13, color: "#69707d" }}>Các lượt cộng/trừ và lý do sẽ được công khai vào ngày 28 hằng tháng. Ngày này có thể thay đổi trong Cài đặt.</p>
      </section>

      {members.length ? <section className="grid">{members.map(member => <article className="card" key={member.id}>
        <div className="person"><div className="avatar">{member.avatar ? <img src={member.avatar} alt="" /> : member.name.charAt(0).toUpperCase()}</div><div><h3>{member.name}</h3><span>Điểm tháng hiện tại</span></div></div>
        <div className="score"><strong>{member.score}</strong><span>/ 100</span></div>
        <div className="progress"><div style={{ width: `${member.score}%` }} /></div>
        <div className="card-actions"><button className="btn plus" onClick={() => openScore(member, "plus")}>+ Cộng điểm</button><button className="btn minus" onClick={() => openScore(member, "minus")}>− Trừ điểm</button></div>
        <button className="btn" style={{ width: "100%", marginTop: 9 }} onClick={() => removeMember(member.id)}>Xóa thành viên</button>
      </article>)}</section> : <div className="empty">Chưa có thành viên. Hãy thêm thành viên đầu tiên.</div>}

      {modal === "member" && <div className="modal-backdrop" onMouseDown={() => setModal(null)}><div className="modal" onMouseDown={e => e.stopPropagation()}><h2>Thêm thành viên</h2><div className="form"><label>Tên thành viên<input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Nhập tên" /></label><label>Avatar (URL)<input placeholder="https://..." /></label><div className="notice">Thành viên mới sẽ bắt đầu với <strong>100 điểm</strong> trong kỳ hiện tại.</div></div><div className="modal-actions"><button className="btn" onClick={() => setModal(null)}>Hủy</button><button className="btn primary" onClick={addMember}>Tạo thành viên</button></div></div></div>}

      {modal === "score" && selected && <div className="modal-backdrop" onMouseDown={() => setModal(null)}><div className="modal" onMouseDown={e => e.stopPropagation()}><h2>{mode === "plus" ? "Cộng điểm" : "Trừ điểm"} — {selected.name}</h2><div className="form"><label>Số điểm<input type="number" min={1} max={100} value={points} onChange={e => setPoints(Math.max(1, Number(e.target.value)))} /></label><label>Lý do / ghi chú<textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Nhập lý do đánh giá..." /></label><label>Ảnh bằng chứng<input type="file" accept="image/*" /></label><div className="notice">Thông tin người thực hiện và số lượt đánh giá sẽ được giữ kín cho đến ngày công khai.</div></div><div className="modal-actions"><button className="btn" onClick={() => setModal(null)}>Hủy</button><button className="btn primary" onClick={submitScore}>{mode === "plus" ? "Xác nhận cộng" : "Xác nhận trừ"}</button></div></div></div>}
    </main>
  );
}
