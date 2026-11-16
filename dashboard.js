(function () {
  'use strict';
  var D = window.DASH, B = D.before, A = D.after, R = D.rules, ART = window.ART;
  var CH = ['Paid_Social', 'Influencer', 'Farmers_Market', 'Word_of_Mouth', 'Unattributed'], TR = CH.slice(0, 4);
  var NAME = { Paid_Social: 'Paid Social', Influencer: 'Influencer', Farmers_Market: 'Farmers Market', Word_of_Mouth: 'Word of Mouth', Unattributed: 'Unattributed' };
  var BEFORE = '#b7cdf1', AFTER = '#0f3d91', ACC = '#e4572e', NEUTRAL = '#c3c9d6';
  function fmt(n, d) { return Number(n).toLocaleString('en-US', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); }
  function usd(n, d) { return '$' + fmt(n, d === undefined ? 0 : d); }
  function pct(n) { return fmt(n, 1) + '%'; } function xr(n) { return fmt(n, 2) + 'x'; }
  function best(list, f, hi) { return list.slice().sort(function (a, b) { return hi === false ? f(a) - f(b) : f(b) - f(a); })[0]; }
  var roiCh = ['Paid_Social', 'Influencer', 'Farmers_Market'];
  var bestRoiA = best(roiCh, function (c) { return A.ch[c].roi; }), worstRoiA = best(roiCh, function (c) { return A.ch[c].roi; }, false);
  var topGiveA = best(TR, function (c) { return A.ch[c].give; });
  var bestPpoA = best(TR, function (c) { return A.ch[c].ppo; }), bestRepA = best(TR, function (c) { return A.ch[c].repeat; });
  var tb = B.total, ta = A.total;
  function tile(n, t, now, was, sub, hot) { return '<div class="kpi' + (hot ? ' hot' : '') + '"><span class="kn">KPI ' + n + '</span><div class="k">' + t + '</div><div class="vals"><span class="now">' + now + '</span><span class="was" title="Before">' + was + '</span></div><div class="d">' + sub + '</div></div>'; }
  var html = '<div class="brandrow"><span class="logo"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12V4h8l10 10-8 8L3 12z"/><circle cx="7.5" cy="8.5" r="1.4" fill="#fff"/></svg></span> TrueSource</div>' +
    '<div class="banner2"><div><div class="eyebrow">BEFORE VS AFTER TRUESOURCE</div><h1>Revenue with no known channel falls from <b>' + pct(tb.unattr_rev_pct) + '</b> to <b>' + pct(ta.unattr_rev_pct) + '</b>, and profit rises <b>' + usd(ta.profit - tb.profit) + '</b>.</h1>' +
    '<p>Two versions of the same 2,500-order hot sauce business. Before is the current data (Dataset 1). After is the data as TrueSource would record it (Dataset 2, a modelled scenario).</p>' +
    '<div class="badges"><span class="badge"><b>Before</b> Dataset 1, current state</span><span class="badge"><b>After</b> Dataset 2, with TrueSource</span></div></div>' +
    '</div>' +
    '<div class="grid g5">' +
    tile(1, 'Unattributed Revenue Rate', pct(ta.unattr_rev_pct), pct(tb.unattr_rev_pct), 'of net revenue has no channel', true) +
    tile(2, 'Channel Profit Efficiency', usd(ta.ppo, 2), usd(tb.ppo, 2), 'profit per order, all orders') +
    tile(3, 'Marketing Return on Spend', xr(A.ch[bestRoiA].roi), xr(B.ch[bestRoiA].roi), '<b>' + NAME[bestRoiA] + '</b>. Paid Social: ' + xr(A.ch.Paid_Social.roi) + ' (was ' + xr(B.ch.Paid_Social.roi) + ')') +
    tile(4, 'Discount Give-Away Rate', pct(ta.give), pct(tb.give), 'of gross revenue given as discounts') +
    tile(5, 'Repeat Customer Rate', pct(ta.repeat), pct(tb.repeat), 'of orders from returning customers') + '</div>' +
    '<div class="card block"><h2>What the founder should do</h2><p class="cap">Plain rules read the numbers. These are suggestions, not guaranteed results.</p><div class="grid g3">' +
    '<div class="dec go"><div class="dn">1</div><b>Spend more where it pays</b><p>Test a larger budget on <b>' + NAME[bestRoiA] + '</b> (' + xr(A.ch[bestRoiA].roi) + ' return) before adding to <b>' + NAME[worstRoiA] + '</b> (' + xr(A.ch[worstRoiA].roi) + ').</p></div>' +
    '<div class="dec"><div class="dn">2</div><b>Review the biggest discount</b><p><b>' + NAME[topGiveA] + '</b> still gives away ' + pct(A.ch[topGiveA].give) + ' (was ' + pct(B.ch[topGiveA].give) + ') and repeats ' + pct(A.ch[topGiveA].repeat) + '. Keep watching the repeat rate after the cap.</p></div>' +
    '<div class="dec hot"><div class="dn">3</div><b>Close the blind spot</b><p>' + pct(ta.unattr_rev_pct) + ' of revenue is still unattributed because ' + fmt(30) + '% of those customers answer "not sure". Keep tags, codes and the checkout question on.</p></div></div></div>' +
    '<div class="grid g3 block">' +
    '<div class="card"><h2><span class="kn">KPI 1</span> Unattributed Revenue Rate</h2><p class="cap"><span class="key"><span><i class="sw b"></i>Before</span><span><i class="sw h"></i>After</span></span></p><div class="chartbox"><canvas id="k1"></canvas></div></div>' +
    cardH(2, 'Channel Profit Efficiency', 'k2', 'Profit per order. Orange = best tracked channel after TrueSource') +
    cardH(3, 'Marketing Return on Spend', 'k3', 'Profit per $1 of marketing. Orange = best return') +
    cardH(4, 'Discount Give-Away Rate', 'k4', 'Orange = highest give-away, review first') +
    cardH(5, 'Repeat Customer Rate', 'k5', 'Orange = most loyal tracked channel') +
    '<div class="card"><h2>Orders by channel</h2><p class="cap"><span class="key"><span><i class="sw b"></i>Before</span><span><i class="sw a"></i>After</span></span></p><div class="chartbox"><canvas id="k6"></canvas></div></div></div>' +
    '<div class="card block"><h2>Unattributed orders by month</h2><p class="cap">Share of each month\'s orders with no known channel.</p><div class="chartbox"><canvas id="k7"></canvas></div></div>';
  function cardH(n, t, id, cap) { return '<div class="card"><h2><span class="kn">KPI ' + n + '</span> ' + t + '</h2><p class="cap">' + cap + '</p><div class="key"><span><i class="sw b"></i>Before</span><span><i class="sw a"></i>After</span><span><i class="sw h"></i>Highlight</span></div><div class="chartbox"><canvas id="' + id + '"></canvas></div></div>'; }
  var rows = CH.map(function (c) {
    function cell(b, a, f, lower) { var good = lower ? a < b : a > b; return '<td>' + f(b) + '</td><td class="' + (Math.abs(a - b) < 0.005 ? '' : good ? 'up' : 'dn2') + '">' + f(a) + '</td>'; }
    var b = B.ch[c], a = A.ch[c];
    return '<tr><td><b>' + NAME[c] + '</b></td>' + cell(b.orders, a.orders, fmt, c === 'Unattributed') + cell(b.ppo, a.ppo, function (v) { return usd(v, 2); }) +
      (b.roi == null ? '<td>n/a</td><td>n/a</td>' : cell(b.roi, a.roi, xr)) + cell(b.give, a.give, pct, true) + cell(b.repeat, a.repeat, pct) + '</tr>'; }).join('');
  html += '<div class="card block"><h2>Channel scorecard</h2><p class="cap">The numbers behind the charts. Green is better, red is worse. ROI is n/a where marketing cost is $0.</p><div class="tablewrap"><table class="t"><thead><tr><th></th><th>Orders before</th><th>after</th><th>Profit/order before</th><th>after</th><th>ROI before</th><th>after</th><th>Give-away before</th><th>after</th><th>Repeat before</th><th>after</th></tr></thead><tbody>' + rows + '</tbody></table></div></div>' +
    '<div class="card block"><h2>How Dataset 2 was built</h2><p class="cap">Dataset 2 is not collected data. It is Dataset 1 with three documented rules applied, using a fixed random seed (2025) so it can be rebuilt exactly.</p><div class="grid g3">' +
    '<div class="rule"><h3><b class="id">R1</b>Recover the unattributed orders</h3><p>TrueSource captures UTM links, promo codes, QR scans and a one-question checkout survey. Of the ' + R.unattr_before + ' orders with no source, 70% (' + R.recovered + ' orders) get a channel from the survey.</p><p>They are assigned in proportion to the online attributed mix (Paid Social 52%, Influencer 28%, Word of Mouth 20%). The other 30% stay Unattributed ("not sure").</p></div>' +
    '<div class="rule"><h3><b class="id">R2</b>Move spend to what works</h3><p>The Budget Advisor flags Paid Social as the biggest cost with the lowest profit per order. The ' + R.k + ' least profitable Paid Social orders (10%) are removed, freeing ' + usd(R.freed) + ' of ad spend.</p><p>' + R.k + ' extra Farmers Market orders are added at that channel\'s own cost, ' + usd(R.spent) + '.</p></div>' +
    '<div class="rule"><h3><b class="id">R3</b>Cap discounts at 15%</h3><p>The Advisor\'s limit is 15%. Word of Mouth codes REFER20 and FRIEND20 become REFER15 and FRIEND15 (' + R.disc_capped + ' orders). Net revenue is recalculated.</p><p>Order volume is assumed unchanged, which is optimistic.</p></div></div>' +
    '<div class="note"><b>Honest limits.</b> Dataset 2 is a modelled scenario, not measured results. The 70% recovery rate is our assumption, and R2 and R3 assume order volume holds. Blended return falls from ' + fmt(tb.blended_roi, 2) + ' to ' + fmt(ta.blended_roi, 2) + ' only because ad cost that Dataset 1 left uncharged is now assigned to channels (' + usd(tb.mkt) + ' to ' + usd(ta.mkt) + '). Every channel with spend improves on its own.</div></div>' +
    '<footer>All data is synthetic and built for a class project.</footer>';
  document.getElementById('root').innerHTML = html;

  Chart.defaults.font.family = 'system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif'; Chart.defaults.font.size = 12; Chart.defaults.color = '#1b2f5e';
  var vl = { id: 'vl', afterDatasetsDraw: function (ch) { var ctx = ch.ctx; ch.data.datasets.forEach(function (ds, di) { if (!ds.fmt) return; ch.getDatasetMeta(di).data.forEach(function (bar, i) { var v = ds.data[i]; if (v == null) return; ctx.save(); ctx.fillStyle = '#0b2a66'; ctx.font = '700 11px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText(ds.fmt(v), bar.x, bar.y - 5); ctx.restore(); }); }); } };
  function pair(id, labs, getB, getA, f, hi, max) {
    new Chart(document.getElementById(id), { type: 'bar', plugins: [vl], data: { labels: labs.map(function (c) { return NAME[c]; }), datasets: [
      { label: 'Before', data: labs.map(getB), backgroundColor: BEFORE, borderRadius: 6, fmt: null },
      { label: 'After', data: labs.map(getA), backgroundColor: labs.map(function (c) { return c === hi ? ACC : c === 'Unattributed' ? NEUTRAL : AFTER; }), borderRadius: 6, fmt: f }] },
      options: { responsive: true, maintainAspectRatio: false, layout: { padding: { top: 20 } }, categoryPercentage: .8, barPercentage: .92, plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (x) { return x.dataset.label + ': ' + f(x.parsed.y); } } } },
        scales: { y: { beginAtZero: true, suggestedMax: max, grid: { color: '#e8edf6' }, border: { display: false }, ticks: { callback: function (v) { return f(v); } } }, x: { grid: { display: false }, ticks: { maxRotation: 40, minRotation: 0 } } } } });
  }
  new Chart(document.getElementById('k1'), { type: 'bar', plugins: [vl], data: { labels: ['Before (Dataset 1)', 'After (Dataset 2)'], datasets: [{ data: [tb.unattr_rev_pct, ta.unattr_rev_pct], backgroundColor: [BEFORE, ACC], borderRadius: 10, maxBarThickness: 90, fmt: pct }] }, options: { responsive: true, maintainAspectRatio: false, layout: { padding: { top: 24 } }, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, suggestedMax: 30, grid: { color: '#e8edf6' }, border: { display: false }, ticks: { callback: function (v) { return v + '%'; } } }, x: { grid: { display: false } } } } });
  pair('k2', CH, function (c) { return +B.ch[c].ppo.toFixed(2); }, function (c) { return +A.ch[c].ppo.toFixed(2); }, function (v) { return usd(v, 2); }, bestPpoA, 26);
  pair('k3', roiCh, function (c) { return B.ch[c].roi; }, function (c) { return A.ch[c].roi; }, xr, bestRoiA, 19);
  pair('k4', CH, function (c) { return B.ch[c].give; }, function (c) { return A.ch[c].give; }, pct, topGiveA, 26);
  pair('k5', CH, function (c) { return B.ch[c].repeat; }, function (c) { return A.ch[c].repeat; }, pct, bestRepA, 75);
  pair('k6', CH, function (c) { return B.ch[c].orders; }, function (c) { return A.ch[c].orders; }, fmt, null);
  var ms = B.monthly.months.map(function (m) { return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(m.slice(5), 10) - 1]; });
  new Chart(document.getElementById('k7'), { type: 'line', data: { labels: ms, datasets: [{ label: 'Before', data: B.monthly.unattr_pct, borderColor: '#7fa6e6', backgroundColor: '#7fa6e6', borderDash: [6, 4], borderWidth: 2.5, tension: .3, pointRadius: 3 }, { label: 'After', data: A.monthly.unattr_pct, borderColor: ACC, backgroundColor: ACC, borderWidth: 3, tension: .3, pointRadius: 3.5 }] },
    options: { responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false }, plugins: { legend: { position: 'bottom' }, tooltip: { callbacks: { label: function (x) { return x.dataset.label + ': ' + fmt(x.parsed.y, 1) + '%'; } } } }, scales: { y: { beginAtZero: true, grid: { color: '#e8edf6' }, border: { display: false }, ticks: { callback: function (v) { return v + '%'; } } }, x: { grid: { display: false } } } } });
})();
