/* POC-Trust — deterministic integrity demo.
   All logic is illustrative and runs entirely in this browser. No data leaves the page. */
(() => {
  "use strict";

  const KEY = "poctrust-demo-v1";
  const $ = (s, r = document) => r.querySelector(s);
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  const nowISO = () => new Date().toISOString();
  const fmt = (iso) => {
    const d = new Date(iso);
    return d.toLocaleString("en-ZA", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  };
  const uid = (p) => `${p}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

  const hash = (str) => {
    let h = 5381;
    for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
    return h.toString(16).padStart(8, "0");
  };

  const STATUS = { Trust: "trust", Review: "review", Verify: "verify" };
  const ACTION = {
    Trust: "Release the result to the clinical workflow under routine controls.",
    Review: "Hold the result for trained-operator review before it is used.",
    Verify: "Do not rely on this result. Repeat the test and investigate the failure.",
  };

  const defaultState = () => ({ assessments: [], audit: [], lastDecision: null, seeded: false });

  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return defaultState();
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) {} }

  /* ---------- deterministic rule engine ---------- */
  function evaluate(input) {
    const reasons = [];
    const rules = [];

    if (input.qcPassed !== "true") {
      rules.push("R-QC-01");
      reasons.push("Internal quality control did not pass for this run.");
    }
    if (input.calibrationDue) {
      const due = new Date(input.calibrationDue + "T23:59:59");
      if (due.getTime() < Date.now()) {
        rules.push("R-CAL-02");
        reasons.push("Device calibration was due before this assessment.");
      }
    } else {
      rules.push("R-CAL-02");
      reasons.push("No calibration record was supplied with the evidence bundle.");
    }
    if (input.reagentExpiry) {
      const exp = new Date(input.reagentExpiry + "T23:59:59");
      if (exp.getTime() < Date.now()) {
        rules.push("R-REA-03");
        reasons.push("The reagent lot expired before this run.");
      }
    } else {
      rules.push("R-REA-03");
      reasons.push("Reagent lot expiry is missing from the evidence bundle.");
    }
    const t = Number(input.temperatureC);
    const rh = Number(input.humidityPct);
    if (!Number.isFinite(t) || t < 18 || t > 28) {
      rules.push("R-ENV-04");
      reasons.push(`Ambient temperature ${Number.isFinite(t) ? t + " °C" : "(missing)"} is outside the supported 18–28 °C range.`);
    }
    if (!Number.isFinite(rh) || rh < 20 || rh > 80) {
      rules.push("R-ENV-04");
      reasons.push(`Humidity ${Number.isFinite(rh) ? rh + " %" : "(missing)"} is outside the supported 20–80 % range.`);
    }
    if (input.provenance !== "verified") {
      rules.push("R-PRV-05");
      reasons.push(input.provenance === "missing"
        ? "The evidence bundle has no provenance record."
        : "The evidence source could not be verified.");
    }
    if (input.connectivity === "offline") {
      rules.push("R-OFF-06");
      reasons.push("Submitted offline: the event is queued and must reconcile before reliance.");
    }

    let status = "Trust";
    if (rules.some((r) => ["R-QC-01", "R-CAL-02", "R-REA-03"].includes(r))) status = "Verify";
    else if (rules.length) status = "Review";
    else {
      rules.push("R-OK-07");
      reasons.push("All policy-required evidence domains are present and valid.");
    }

    const aiConsulted = Boolean(input.aiAdvisory);
    let ai = null;
    if (aiConsulted) {
      ai = {
        summary: status === "Trust"
          ? "Evidence is internally consistent. No anomaly detected across the supplied domains."
          : "The deterministic findings explain the disposition. Advisory text does not change it.",
        anomalies: status === "Verify" ? ["QC/calibration/reagent failure path"] : [],
        confidence: status === "Trust" ? 0.93 : 0.78,
        model: "advisory-demo-1",
      };
    }

    return {
      id: uid("AS"),
      result: input.result || "(unspecified)",
      testType: input.testType || "HbA1c",
      deviceId: input.deviceId || "DEV-0000",
      operatorId: input.operatorId || "OP-0000",
      initialStatus: status,
      finalStatus: status,
      reasons,
      ruleIds: [...new Set(rules)],
      action: ACTION[status],
      aiAssessment: ai,
      aiConsulted,
      decidedAtUtc: nowISO(),
      connectivity: input.connectivity,
      provenance: input.provenance,
      demo: true,
    };
  }

  function record(decision) {
    state.assessments.unshift(decision);
    state.assessments = state.assessments.slice(0, 24);
    const prev = state.audit[0]?.hash || "genesis";
    const entry = {
      id: state.audit.length + 1,
      assessmentId: decision.id,
      status: decision.finalStatus,
      action: decision.action,
      timestampUtc: decision.decidedAtUtc,
      prev,
    };
    entry.hash = hash(prev + entry.id + decision.id + decision.finalStatus + entry.timestampUtc);
    state.audit.unshift(entry);
    state.lastDecision = decision;
    save();
  }

  /* ---------- seed ---------- */
  const SEED = [
    { result: "HbA1c 6.4 %", testType: "HbA1c", deviceId: "DEV-0142", operatorId: "OP-2210", qcPassed: "true", operatorCompetent: "true", calibrationDue: "2027-02-01", reagentExpiry: "2027-03-01", temperatureC: "22.4", humidityPct: "48", provenance: "verified", connectivity: "online" },
    { result: "HIV rapid — reactive", testType: "HIV rapid", deviceId: "DEV-0117", operatorId: "OP-2081", qcPassed: "true", operatorCompetent: "true", calibrationDue: "2026-08-01", reagentExpiry: "2027-01-01", temperatureC: "31.2", humidityPct: "54", provenance: "unverified", connectivity: "online" },
    { result: "Malaria RDT — negative", testType: "Malaria RDT", deviceId: "DEV-0093", operatorId: "OP-1977", qcPassed: "false", operatorCompetent: "true", calibrationDue: "2027-01-10", reagentExpiry: "2027-04-01", temperatureC: "24.0", humidityPct: "60", provenance: "verified", connectivity: "offline" },
  ];

  function seed() {
    if (state.seeded && state.assessments.length) return;
    state = defaultState();
    SEED.slice().reverse().forEach((s) => record(evaluate(s)));
    state.seeded = true;
    save();
  }

  /* ---------- rendering ---------- */
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function counts() {
    const c = { Trust: 0, Review: 0, Verify: 0 };
    state.assessments.forEach((a) => { c[a.finalStatus] = (c[a.finalStatus] || 0) + 1; });
    return c;
  }

  function renderOverview() {
    const c = counts();
    $("#statTrust").textContent = c.Trust;
    $("#statReview").textContent = c.Review;
    $("#statVerify").textContent = c.Verify;
    const coverage = Math.round((c.Trust / Math.max(1, state.assessments.length)) * 100);
    $("#statCoverage").textContent = coverage + "%";
    $("#statCoverageNote").textContent = `${state.assessments.length} stored assessments`;

    const tbody = $("#recentRows");
    tbody.innerHTML = "";
    if (!state.assessments.length) {
      const tr = el("tr");
      const td = el("td", "muted", "No assessments yet.");
      td.colSpan = 4;
      tr.appendChild(td);
      tbody.appendChild(tr);
    }
    state.assessments.slice(0, 6).forEach((a) => {
      const tr = el("tr");
      tr.innerHTML = `<td>${esc(a.result)}</td><td class="mono">${esc(a.deviceId)}</td>
        <td><span class="badge ${STATUS[a.finalStatus]}">${a.finalStatus}</span></td>
        <td class="mono">${fmt(a.decidedAtUtc)}</td>`;
      tr.style.cursor = "pointer";
      tr.addEventListener("click", () => showDecision(a));
      tbody.appendChild(tr);
    });

    const seq = $("#sequence");
    seq.innerHTML = "";
    state.assessments.slice(0, 3).reverse().forEach((a, i) => {
      const d = el("div", "seq-step");
      d.innerHTML = `<div class="n">STEP ${i + 1}</div><b>${esc(a.result)}</b>
        <span class="badge ${STATUS[a.finalStatus]}">${a.finalStatus}</span>
        <small>${esc(a.reasons[0] || "No findings.")}</small>`;
      seq.appendChild(d);
    });
  }

  function showDecision(d) {
    $("#resultEmpty").classList.add("hidden");
    const body = $("#resultBody");
    body.classList.remove("hidden");
    body.innerHTML = `
      <div class="result-head">
        <div><h3>${esc(d.result)}</h3><div class="mono">${esc(d.id)} · ${esc(d.deviceId)} · ${fmt(d.decidedAtUtc)}</div></div>
        <span class="badge ${STATUS[d.finalStatus]}">${d.finalStatus}</span>
      </div>
      <div class="muted" style="margin-bottom:6px">Decision reasons</div>
      <ul class="reason-list">${d.reasons.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>
      <div class="rule-tags">${d.ruleIds.map((r) => `<code>${esc(r)}</code>`).join("")}</div>
      <div class="action-box"><strong>Operational action.</strong> ${esc(d.action)}</div>
      ${d.aiConsulted ? `<div class="ai-box"><strong>AI advisory (non-authoritative).</strong> ${esc(d.aiAssessment?.summary || "")}${d.aiAssessment?.confidence ? ` · confidence ${Math.round(d.aiAssessment.confidence * 100)}%` : ""}<br><span class="mono">VERIFY cannot be downgraded by this advisory.</span></div>` : `<div class="ai-box">AI advisory not requested. Deterministic rules alone produced this disposition.</div>`}
    `;
    document.querySelectorAll(".view").forEach((v) => v.classList.add("hidden"));
    $("#view-assess").classList.remove("hidden");
    setTitle("Assessment detail");
    document.querySelectorAll("#nav button").forEach((b) => b.classList.toggle("active", b.dataset.view === "assess"));
  }

  function renderAudit() {
    const tbody = $("#auditRows");
    tbody.innerHTML = "";
    if (!state.audit.length) {
      const tr = el("tr");
      const td = el("td", "muted", "No sealed entries yet.");
      td.colSpan = 6;
      tr.appendChild(td);
      tbody.appendChild(tr);
    }
    state.audit.slice(0, 30).forEach((a) => {
      const tr = el("tr");
      tr.innerHTML = `<td>${String(a.id).padStart(3, "0")}</td><td>${esc(a.assessmentId)}</td>
        <td><span class="badge ${STATUS[a.status]}">${a.status}</span></td>
        <td>${esc(a.action)}</td><td>${fmt(a.timestampUtc)}</td><td>${esc(a.hash)}</td>`;
      tbody.appendChild(tr);
    });
    $("#auditMeta").textContent = `${state.audit.length} entries · chain ${state.audit[0]?.hash || "—"}`;
  }

  const SCENARIOS = [
    { label: "Trusted result", note: "All evidence valid", input: SEED[0] },
    { label: "QC failure", note: "Verify · repeat the test", input: { ...SEED[0], qcPassed: "false" } },
    { label: "Expired reagent", note: "Verify · lot out of date", input: { ...SEED[0], reagentExpiry: "2026-01-01" } },
    { label: "Environment excursion", note: "Review · 31.2 °C", input: { ...SEED[0], temperatureC: "31.2" } },
    { label: "Offline field use", note: "Review · queued event", input: { ...SEED[0], connectivity: "offline", provenance: "unverified" } },
    { label: "AI advisory requested", note: "Advisory never decides", input: { ...SEED[0], aiAdvisory: true } },
  ];

  function renderScenarios() {
    const box = $("#scenarios");
    box.innerHTML = "";
    SCENARIOS.forEach((s) => {
      const b = el("button", "scenario");
      b.type = "button";
      b.innerHTML = `<span><b>${esc(s.label)}</b><small>${esc(s.note)}</small></span><span>→</span>`;
      b.addEventListener("click", () => {
        const d = evaluate({ ...s.input, aiAdvisory: Boolean(s.input.aiAdvisory) });
        record(d);
        renderAll();
        showDecision(d);
      });
      box.appendChild(b);
    });
  }

  function renderAll() { renderOverview(); renderAudit(); renderScenarios(); }

  function setTitle(t) { $("#pageTitle").textContent = t; }
  function go(view) {
    document.querySelectorAll(".view").forEach((v) => v.classList.add("hidden"));
    $("#view-" + view).classList.remove("hidden");
    document.querySelectorAll("#nav button").forEach((b) => b.classList.toggle("active", b.dataset.view === view));
    setTitle({ overview: "Overview", assess: "New assessment", audit: "Audit trail", policy: "Policy" }[view]);
  }

  /* ---------- form ---------- */
  function formToInput(form) {
    const fd = new FormData(form);
    const o = {};
    fd.forEach((v, k) => { o[k] = String(v); });
    o.aiAdvisory = form.querySelector('[name="aiAdvisory"]').checked;
    return o;
  }

  $("#assessForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = formToInput(form);
    if (input.calibrationDue === "") input.calibrationDue = null;
    if (input.reagentExpiry === "") input.reagentExpiry = null;
    const d = evaluate(input);
    record(d);
    renderAll();
    showDecision(d);
    form.reset();
  });

  document.querySelectorAll("#nav button").forEach((b) => b.addEventListener("click", () => go(b.dataset.view)));
  document.querySelectorAll("[data-goto]").forEach((b) => b.addEventListener("click", () => go(b.dataset.goto)));

  $("#resetBtn").addEventListener("click", () => {
    state = defaultState();
    localStorage.removeItem(KEY);
    seed();
    renderAll();
    go("overview");
  });

  function online() {
    $("#onlinePill").textContent = navigator.onLine ? "online" : "offline · queueing";
  }
  window.addEventListener("online", online);
  window.addEventListener("offline", online);

  seed();
  online();
  renderAll();
  go("overview");
})();
