/* POPIA enforcement platform — synthetic demonstration. */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const el = (t, c, x) => { const n = document.createElement(t); if (c) n.className = c; if (x != null) n.textContent = x; return n; };
  const KEY = "popia-demo-v1";
  const uid = () => "POP-" + Math.floor(1000 + Math.random() * 9000);
  const now = () => new Date().toISOString();
  const fmt = (iso) => new Date(iso).toLocaleString("en-ZA", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  const hash = (s) => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; return h.toString(16).padStart(8, "0"); };

  const CATS = ["Direct marketing", "Data breach", "Unlawful processing", "Consent", "Cross-border transfer", "Fraud / scam"];
  const STATES = ["New", "Triage", "Investigation", "Resolved"];

  const seed = () => ([
    { ref: "POP-1042", subject: "Unsolicited SMS after opt-out", org: "RetailCo", cat: "Direct marketing", status: "Triage", evidence: 2, opened: "2026-10-24T09:12:00Z", severity: "medium", phone: "+27 82 441 0091" },
    { ref: "POP-1041", subject: "Leaked customer list on forum", org: "FinServe", cat: "Data breach", status: "Investigation", evidence: 4, opened: "2026-10-23T14:40:00Z", severity: "high", phone: "+27 83 220 7781" },
    { ref: "POP-1040", subject: "WhatsApp spam from loan provider", org: "QuickCash", cat: "Direct marketing", status: "New", evidence: 1, opened: "2026-10-23T08:05:00Z", severity: "low", phone: "+27 71 909 3312" },
    { ref: "POP-1039", subject: "ID number requested before service", org: "ClinicGroup", cat: "Unlawful processing", status: "Triage", evidence: 2, opened: "2026-10-22T16:22:00Z", severity: "medium", phone: "+27 82 100 4420" },
    { ref: "POP-1038", subject: "Marketing call after deletion request", org: "TeleSales SA", cat: "Consent", status: "Resolved", evidence: 3, opened: "2026-10-20T11:00:00Z", severity: "medium", phone: "+27 84 772 1103" },
    { ref: "POP-1037", subject: "Scam calls spoofing bank number", org: "Unknown", cat: "Fraud / scam", status: "Investigation", evidence: 5, opened: "2026-10-19T07:35:00Z", severity: "high", phone: "+27 87 550 9912" },
    { ref: "POP-1036", subject: "Data sent to overseas processor", org: "TravelHub", cat: "Cross-border transfer", status: "Triage", evidence: 1, opened: "2026-10-18T13:48:00Z", severity: "medium", phone: "+27 82 664 2010" },
    { ref: "POP-1035", subject: "Unsubscribe ignored for 3 months", org: "InsuranceX", cat: "Direct marketing", status: "Resolved", evidence: 2, opened: "2026-10-16T10:10:00Z", severity: "low", phone: "+27 83 991 4471" },
  ]);

  let state = JSON.parse(localStorage.getItem(KEY) || "null");
  if (!state) {
    state = { complaints: seed(), audit: [], seq: 1 };
    state.audit.push({ id: 1, time: now(), actor: "system", action: "Demonstration dataset loaded", caseRef: "—" });
  }
  const save = () => localStorage.setItem(KEY, JSON.stringify(state));

  function log(action, caseRef) {
    const prev = state.audit[0]?.hash || "genesis";
    const entry = { id: state.seq++, time: now(), actor: "operator", action, caseRef, prev };
    entry.hash = hash(prev + entry.id + action + caseRef + entry.time);
    state.audit.unshift(entry);
    save();
  }
  function toast(m) { const t = $("#toast"); t.textContent = m; t.classList.add("show"); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 2200); }

  function counts() {
    const c = { open: 0, resolved: 0, high: 0 };
    state.complaints.forEach((x) => {
      if (x.status === "Resolved") c.resolved++; else c.open++;
      if (x.severity === "high") c.high++;
    });
    return c;
  }

  function renderDashboard() {
    const c = counts();
    $("#kOpen").textContent = c.open;
    $("#kResolved").textContent = c.resolved;
    $("#kHigh").textContent = c.high;
    $("#casePill").textContent = `${c.open} open cases`;

    const recent = $("#recent");
    recent.innerHTML = "";
    state.complaints.slice(0, 5).forEach((x) => {
      const tr = el("tr", "click");
      tr.innerHTML = `<td class="mono">${x.ref}</td><td>${x.subject}</td><td>${x.cat}</td><td>${badge(x.status)}</td>`;
      tr.addEventListener("click", () => openDetail(x));
      recent.appendChild(tr);
    });

    const totals = {};
    CATS.forEach((c) => (totals[c] = 0));
    state.complaints.forEach((x) => (totals[x.cat] = (totals[x.cat] || 0) + 1));
    const max = Math.max(...Object.values(totals), 1);
    const bars = $("#bars");
    bars.innerHTML = "";
    CATS.forEach((c) => {
      const row = el("div", "bar-row");
      row.innerHTML = `<span>${c}</span><div class="bar"><i style="width:${(totals[c] / max) * 100}%"></i></div><span class="mono">${totals[c]}</span>`;
      bars.appendChild(row);
    });

    const withEvidence = state.complaints.filter((x) => x.evidence > 0).length;
    const pct = Math.round((withEvidence / state.complaints.length) * 100);
    $("#evPct").textContent = pct + "%";
    $("#evBar").style.width = pct + "%";

    const feed = $("#feed");
    feed.innerHTML = "";
    state.audit.slice(0, 6).forEach((a) => {
      const d = el("div", "feed-item");
      d.innerHTML = `<span class="dot"></span><div><strong>${a.action}</strong><div class="mono">${fmt(a.time)} · ${a.caseRef}</div></div>`;
      feed.appendChild(d);
    });
  }

  function badge(s) {
    const cls = s === "Resolved" ? "green" : s === "Investigation" ? "red" : s === "Triage" ? "amber" : "blue";
    return `<span class="badge ${cls}">${s}</span>`;
  }

  function renderTable() {
    const q = $("#search").value.toLowerCase();
    const f = $("#statusFilter").value;
    const rows = state.complaints.filter((x) =>
      (!f || x.status === f) && (!q || (x.ref + " " + x.subject + " " + x.org).toLowerCase().includes(q)));
    const body = $("#rows");
    body.innerHTML = "";
    if (!rows.length) { body.innerHTML = `<tr><td colspan="7" class="empty">No complaints match this filter.</td></tr>`; return; }
    rows.forEach((x) => {
      const tr = el("tr", "click");
      tr.innerHTML = `<td class="mono">${x.ref}</td><td>${x.subject}</td><td>${x.org}</td><td>${x.cat}</td>
        <td><span class="mono">${x.evidence} file(s)</span></td><td>${badge(x.status)}</td><td class="mono">${fmt(x.opened)}</td>`;
      tr.addEventListener("click", () => openDetail(x));
      body.appendChild(tr);
    });
  }

  function modal(title, content, onSave, saveLabel = "Save") {
    const overlay = el("div", "overlay");
    const box = el("div", "modal");
    box.innerHTML = `<div class="between"><h2>${title}</h2><button class="btn sm ghost" id="mClose">✕</button></div><div id="mBody"></div>
      <div class="row" style="justify-content:flex-end;margin-top:14px"><button class="btn" id="mCancel">Cancel</button>${onSave ? `<button class="btn primary" id="mSave">${saveLabel}</button>` : ""}</div>`;
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    $("#mBody", box).innerHTML = content;
    const close = () => overlay.remove();
    $("#mClose", box).addEventListener("click", close);
    $("#mCancel", box).addEventListener("click", close);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
    if (onSave) $("#mSave", box).addEventListener("click", () => { if (onSave(box) !== false) close(); });
    return box;
  }

  function openDetail(x) {
    const box = modal(`Complaint ${x.ref}`, `
      <div class="grid g2">
        <div><div class="mono">SUBJECT</div><div style="margin:2px 0 10px;font-size:14px">${x.subject}</div>
          <div class="mono">ORGANISATION</div><div style="margin:2px 0 10px">${x.org}</div>
          <div class="mono">CATEGORY</div><div style="margin:2px 0 10px">${x.cat}</div></div>
        <div><div class="mono">STATUS</div><div style="margin:2px 0 10px">${badge(x.status)}</div>
          <div class="mono">SEVERITY</div><div style="margin:2px 0 10px;text-transform:capitalize">${x.severity}</div>
          <div class="mono">OPENED</div><div style="margin:2px 0 10px">${fmt(x.opened)}</div></div>
      </div>
      <div class="mono">EVIDENCE</div>
      <div class="evidence">${Array.from({ length: x.evidence }, (_, i) => `<span>attachment-${i + 1}.png</span>`).join("") || "<span>none</span>"}</div>
      <div class="row" style="margin-top:14px">
        ${STATES.filter((s) => s !== x.status).map((s) => `<button class="btn sm" data-status="${s}">Move to ${s}</button>`).join("")}
      </div>`);
    box.querySelectorAll("[data-status]").forEach((b) => b.addEventListener("click", () => {
      x.status = b.dataset.status;
      log(`Case moved to ${x.status}`, x.ref);
      save(); renderAll(); box.remove(); toast(`${x.ref} → ${x.status}`);
    }));
  }

  function newComplaint() {
    const body = `
      <div class="form-grid">
        <label class="field">Subject<input name="subject" required placeholder="Short description" /></label>
        <label class="field">Organisation<input name="org" placeholder="Who is the complaint about?" /></label>
        <label class="field">Category<select name="cat">${CATS.map((c) => `<option>${c}</option>`).join("")}</select></label>
        <label class="field">Severity<select name="severity"><option>low</option><option selected>medium</option><option>high</option></select></label>
        <label class="field" style="grid-column:1/-1">Reference phone (optional)<input name="phone" placeholder="+27 ..." /></label>
      </div>
      <p class="muted" style="margin:10px 0 0">Submitting writes to the local demo register and appends an audit entry. No network request is made.</p>`;
    modal("New complaint", body, (box) => {
      const val = (n) => box.querySelector(`[name="${n}"]`).value.trim();
      if (!val("subject")) { toast("Add a subject first."); return false; }
      const x = { ref: uid(), subject: val("subject"), org: val("org") || "Unknown", cat: box.querySelector('[name="cat"]').value, status: "New", evidence: 0, opened: now(), severity: box.querySelector('[name="severity"]').value, phone: val("phone") };
      state.complaints.unshift(x);
      log("Complaint registered", x.ref);
      save(); renderAll(); toast(`${x.ref} registered`);
    }, "Register complaint");
  }

  function riskFor(number) {
    const digits = number.replace(/\D/g, "");
    if (digits.length < 9) return null;
    const seedN = Number(digits.slice(-4));
    const reports = 1 + (seedN % 8);
    const fraud = reports >= 6 || seedN % 7 === 0;
    const band = fraud || reports >= 6 ? "high" : reports >= 3 ? "elevated" : "low";
    return {
      reports,
      band,
      fraud,
      last: new Date(Date.now() - (seedN % 21) * 86400000).toISOString(),
      categories: fraud ? ["Fraud / scam", "Direct marketing"] : ["Direct marketing", "Consent"],
    };
  }

  function renderIntel(r, number) {
    const box = $("#intelResult");
    if (!r) { box.innerHTML = `<p class="muted" style="margin-top:10px">Enter a full number (at least 9 digits).</p>`; return; }
    const pct = r.band === "high" ? 86 : r.band === "elevated" ? 54 : 22;
    box.innerHTML = `
      <div class="risk">
        <div class="ring" style="--deg:${pct * 3.6}deg"><span>${pct}</span></div>
        <div><div class="mono">RISK BAND</div><div style="font-size:18px;font-weight:750;text-transform:capitalize">${r.band}</div>
          <div class="muted">${r.reports} synthetic report(s) · last ${fmt(r.last)}</div>
          <div class="evidence">${r.categories.map((c) => `<span>${c}</span>`).join("")}</div></div>
      </div>
      <p class="muted" style="margin:10px 0 0">Number ${number}. This is an intake signal, not proof of wrongdoing.</p>`;
  }

  function renderAudit() {
    const body = $("#auditRows");
    body.innerHTML = "";
    state.audit.slice(0, 20).forEach((a) => {
      const tr = el("tr");
      tr.innerHTML = `<td>${String(a.id).padStart(3, "0")}</td><td class="mono">${fmt(a.time)}</td><td>${a.actor}</td>
        <td>${a.action}</td><td class="mono">${a.caseRef}</td><td class="mono">${a.hash || "—"}</td>`;
      body.appendChild(tr);
    });
    $("#auditCount").textContent = `${state.audit.length} entries`;
  }

  function renderAll() { renderDashboard(); renderTable(); renderAudit(); }

  document.querySelectorAll("#nav button").forEach((b) => b.addEventListener("click", () => {
    document.querySelectorAll("#nav button").forEach((x) => x.classList.toggle("active", x === b));
    ["dashboard", "complaints", "intel", "audit"].forEach((v) => $("#view-" + v).classList.toggle("hidden", v !== b.dataset.view));
    $("#pageTitle").textContent = { dashboard: "Dashboard", complaints: "Complaints register", intel: "Phone intel", audit: "Audit log" }[b.dataset.view];
  }));
  document.querySelectorAll("[data-goto]").forEach((b) => b.addEventListener("click", () => document.querySelector(`#nav [data-view="${b.dataset.goto}"]`).click()));
  $("#search").addEventListener("input", renderTable);
  $("#statusFilter").addEventListener("change", renderTable);
  $("#newBtn").addEventListener("click", newComplaint);
  $("#lookup").addEventListener("click", () => {
    const n = $("#phone").value.trim();
    const r = riskFor(n);
    renderIntel(r, n);
    if (r) { log("Phone reputation lookup", "intel"); save(); renderDashboard(); renderAudit(); }
  });
  $("#reset").addEventListener("click", () => {
    localStorage.removeItem(KEY);
    state = { complaints: seed(), audit: [], seq: 1 };
    state.audit.push({ id: 1, time: now(), actor: "system", action: "Demonstration dataset loaded", caseRef: "—" });
    save(); renderAll(); toast("Demo data reset");
  });

  renderAll();
})();
