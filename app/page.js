"use client";

import { useEffect, useMemo, useState } from "react";

function formatLong(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "short", day: "numeric" });
}

function formatShort(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function Home() {
  const PAGE_SIZE = 8;
  const [page, setPage] = useState(0);
  const [weeks, setWeeks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState(null);
  const [name, setName] = useState("");
  const [typedName, setTypedName] = useState("");
  const [msg, setMsg] = useState("");

  async function refresh() {
    setLoading(true);
    setMsg("");
    const res = await fetch(`/api/weeks?count=${PAGE_SIZE}&page=${page}`, { cache: "no-store" });
    const json = await res.json();
    setWeeks(json.weeks || []);
    setLoading(false);
  }

  useEffect(() => { refresh(); }, [page]);

  async function claim() {
    setMsg("");
    const res = await fetch("/api/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: selected.date, name }),
    });
    const json = await res.json();
    if (!res.ok) return setMsg(json.error || "Failed.");
    setName("");
    await refresh();
    setMsg("Claimed ✅");
  }

  async function unclaim() {
    setMsg("");
    const res = await fetch("/api/unclaim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: selected.date, typedName }),
    });
    const json = await res.json();
    if (!res.ok) return setMsg(json.error || "Failed.");
    setTypedName("");
    setAdminPin("");
    await refresh();
    setMsg("Unclaimed ✅");
  }

  const selectedFresh = useMemo(() => {
    if (!selected) return null;
    return weeks.find(w => w.date === selected.date) || selected;
  }, [selected, weeks]);

  return (
    <div className="wrap">
      <header className="top">
        <h1>Community Group</h1>
        <p className="muted">Tap a Wednesday to claim cooking for that week. Once claimed, it’s locked.</p>
      </header>

      {!selectedFresh && (
        <section className="card">
          <div className="bar">
          <div className="pill">
             <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>◀</button>

             {weeks?.length
              ? `${formatShort(weeks[0].date)} – ${formatShort(weeks[weeks.length - 1].date)}`
              : "Loading…"
              }

              <button onClick={() => setPage((p) => p + 1)}>▶</button>
          </div>
            <button className="btn secondary" onClick={refresh}>Refresh</button>
          </div>

          <div className="list">
            {loading && <div className="muted">Loading…</div>}
            {!loading && weeks.map(w => (
              <button key={w.date} className="item" onClick={() => { setSelected(w); setMsg(""); }}>
                <div className="row">
                  <div>
                    <div className="title">{formatLong(w.date)}</div>
                    <div className="sub">
                      {w.cookName ? <>Covered by: <b>{w.cookName}</b></> : "No one yet"}
                    </div>
                  </div>
                  <span className={`badge ${w.cookName ? "covered" : "need"}`}>
                    {w.cookName ? "Covered" : "Needs cook"}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <p className="small">Tip: iPhone → Share → <b>Add to Home Screen</b> to install.</p>
        </section>
      )}

      {selectedFresh && (
        <section className="card">
          <button className="btn secondary" onClick={() => { setSelected(null); setMsg(""); }}>← Back</button>

          <div style={{ marginTop: 12 }}>
            <div className="big">{formatLong(selectedFresh.date)}</div>
            <div className="muted" style={{ marginTop: 4 }}>
              Status: {selectedFresh.cookName ? "Covered ✅ (locked)" : "Needs cook ⚠️ (open)"}
            </div>
          </div>

          <div className="divider" />

          {!selectedFresh.cookName && (
            <>
              <div className="notice">
                This week is open. Enter your name to claim cooking for this Wednesday.
              </div>
              <label>Your name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Aleck" />
              <button className="btn primary" onClick={claim}>I’m making dinner this week</button>
            </>
          )}

          {selectedFresh.cookName && (
            <>
              <div className="notice">
                Covered by <b>{selectedFresh.cookName}</b>. To unclaim, type the same name OR use the admin PIN.
              </div>

              <label>Type the cook’s name</label>
              <input value={typedName} onChange={(e) => setTypedName(e.target.value)} placeholder="Same name as above" />

              <button className="btn danger" onClick={unclaim}>Unclaim this week</button>
            </>
          )}

          {msg && <div className="msg">{msg}</div>}
        </section>
      )}

      <style jsx global>{`
        :root{
          --bg: #F5F2EC;
          --card: #FFFFFF;
          --text: #1F2933;
          --muted: #6B7280;
          --border: #E5E1D8;

          --accent: #6F8A6E;
          --need-bg: #F3E6D5;
          --need-text: #6B3F1D;
          --cov-bg: #E3EFE7;
          --cov-text: #1F5A3C;

          --danger-bg: #FCE7E7;
          --danger-text: #8B1E1E;

          --input-bg: #FFFFFF;
          --shadow: 0 10px 22px rgba(0,0,0,.06);
        }
        @media (prefers-color-scheme: dark) {
          :root{
            --bg: #000000;
            --card: #2F2B26;
            --text: #EAE6DF;
            --muted: #A8A29A;
            --border: #3F3A33;

            --accent: #6F8A6E;
            --need-bg: #3B3328;
            --need-text: #F2D6B0;
            --cov-bg: #2F3A31;
            --cov-text: #CFE7D6;

            --danger-bg: #3D2323;
            --danger-text: #F5BDBD;

            --input-bg: #24211D;
            --shadow: 0 10px 24px rgba(0,0,0,.35);
          }
        }

        *{ box-sizing: border-box; }
        body{
          margin:0;
          font-family: -apple-system, system-ui, Segoe UI, Roboto, Arial;
          background: var(--bg);
          color: var(--text);
        }
        .wrap{ max-width:460px; margin:0 auto; padding:16px; }
        .top{ padding: 8px 0 6px; }
        h1{ margin:8px 0 2px; font-size:22px; }
        .muted{ margin:0; color:var(--muted); font-size:14px; line-height:1.35; }

        .card{
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 14px;
          margin: 12px 0;
          box-shadow: var(--shadow);
        }

        .bar{ display:flex; align-items:center; justify-content:space-between; gap:10px; }
        .pill{
          font-size: 12px;
          padding: 6px 10px;
          border-radius: 999px;
          background: color-mix(in srgb, var(--accent) 18%, transparent);
          border: 1px solid color-mix(in srgb, var(--accent) 45%, var(--border));
          color: var(--text);
          font-weight: 900;
          white-space: nowrap;
        }
        .pill button{ all:unset; cursor:pointer; padding:0 4px; font-weight:900; }

        .list{ display:flex; flex-direction:column; gap:10px; margin-top:10px; }
        .item{
          width:100%;
          text-align:left;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 12px;
          cursor: pointer;
        }
        .item:active{ transform: scale(0.99); }

        .row{ display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
        .title{ font-weight: 900; }
        .sub{ font-size: 13px; color: var(--muted); margin-top: 3px; }

        .badge{
          font-size: 12px;
          border-radius: 999px;
          padding: 5px 10px;
          border: 1px solid var(--border);
          font-weight: 900;
          white-space: nowrap;
        }
        .badge.need{ background: var(--need-bg); color: var(--need-text); }
        .badge.covered{ background: var(--cov-bg); color: var(--cov-text); }

        .btn{
          display:block;
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 12px 14px;
          font-size: 16px;
          font-weight: 900;
          cursor: pointer;
          background: transparent;
          color: var(--text);
        }
        .btn.primary{
          margin-top:10px;
          background: var(--accent);
          color: #fff;
        }
        .btn.secondary{ font-size:14px; }
        .btn.danger{
          margin-top:10px;
          background: var(--danger-bg);
          color: var(--danger-text);
        }

        label{ font-size:13px; font-weight:800; color:var(--muted); display:block; margin: 12px 0 6px; }
        input{
          width:100%;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: var(--input-bg);
          color: var(--text);
          font-size: 16px;
          outline: none;
        }

        .divider{ height:1px; background: var(--border); margin: 12px 0; }
        .small{ font-size:12px; color:var(--muted); margin-top:10px; line-height:1.35; }
        .notice{
          background: color-mix(in srgb, var(--card) 85%, var(--accent) 15%);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 10px;
          font-size: 13px;
          color: var(--muted);
          line-height: 1.35;
        }
        .big{ font-size: 18px; font-weight: 900; }
        .msg{ margin-top: 10px; font-size: 13px; color: var(--muted); }
      `}</style>
    </div>
  );
}
