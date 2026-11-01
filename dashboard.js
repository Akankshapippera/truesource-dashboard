(function () {
  'use strict';
  var D = window.DASH, B = D.before, A = D.after, R = D.rules;
  var CH = ['Paid_Social', 'Influencer', 'Farmers_Market', 'Word_of_Mouth', 'Unattributed'];
  var NAME = { Paid_Social: 'Paid Social', Influencer: 'Influencer', Farmers_Market: 'Farmers Market', Word_of_Mouth: 'Word of Mouth', Unattributed: 'Unattributed' };
  var VAR = { Paid_Social: '--c-paid', Influencer: '--c-inf', Farmers_Market: '--c-fm', Word_of_Mouth: '--c-wom', Unattributed: '--c-un' };
  var charts = [];

  function $(id) { return document.getElementById(id); }
  function css(v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); }
  function fmt(n, d) { return Number(n).toLocaleString('en-US', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); }
  function usd(n, d) { return (n < 0 ? '-$' : '$') + fmt(Math.abs(n), d === undefined ? 0 : d); }
  function sgn(n, d, suf) { return (n > 0 ? '+' : n < 0 ? '−' : '') + fmt(Math.abs(n), d) + (suf || ''); }
  function mix(hex, a) { var h = hex.replace('#', ''); return 'rgba(' + parseInt(h.slice(0, 2), 16) + ',' + parseInt(h.slice(2, 4), 16) + ',' + parseInt(h.slice(4, 6), 16) + ',' + a + ')'; }
  function monthLabel(m) { return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(m.slice(5), 10) - 1]; }

  /* ---------- headline ---------- */
  var tb = B.total, ta = A.total;
  $('headline').innerHTML = 'Unattributed orders drop from <b>' + tb.unattr_orders_pct + '%</b> to <b>' + ta.unattr_orders_pct +
    '%</b>, and profit rises <b>' + usd(ta.profit - tb.profit) + '</b> (' + sgn((ta.profit / tb.profit - 1) * 100, 1, '%') + ') across 2,500 orders in each dataset.';

  /* ---------- KPI tiles ---------- */
  var KP = [
    { l: 'Orders with no known source', b: tb.unattr_orders_pct, a: ta.unattr_orders_pct, f: function (v) { return fmt(v, 1) + '%'; }, up: false, u: ' pts', d: 1 },
    { l: 'Revenue with no known source', b: tb.unattr_rev_pct, a: ta.unattr_rev_pct, f: function (v) { return fmt(v, 1) + '%'; }, up: false, u: ' pts', d: 1 },
    { l: 'Profit per order', b: tb.ppo, a: ta.ppo, f: function (v) { return usd(v, 2); }, up: true, u: '', d: 2, money: true },
    { l: 'Total profit', b: tb.profit, a: ta.profit, f: function (v) { return usd(v); }, up: true, u: '', d: 0, money: true },
    { l: 'Repeat customer rate', b: tb.repeat, a: ta.repeat, f: function (v) { return fmt(v, 1) + '%'; }, up: true, u: ' pts', d: 1 },
    { l: 'Discount give-away', b: tb.give, a: ta.give, f: function (v) { return fmt(v, 1) + '%'; }, up: false, u: ' pts', d: 1 }
  ];
  $('kpis').innerHTML = KP.map(function (k) {
    var diff = k.a - k.b, good = k.up ? diff > 0 : diff < 0, cls = Math.abs(diff) < 0.005 ? 'neutral' : good ? 'good' : 'bad';
    var txt = (k.money ? (diff < 0 ? '−$' : '+$') + fmt(Math.abs(diff), k.d) : sgn(diff, k.d, k.u)) + (good ? ' better' : ' worse');
    return '<div class="kpi"><div class="lab">' + k.l + '</div><div class="row"><span class="now">' + k.f(k.a) + '</span><span class="was" title="Before">' + k.f(k.b) + '</span></div><div class="delta ' + cls + '">' + (diff > 0 ? '▲ ' : '▼ ') + txt + '</div></div>';
  }).join('');

  /* ---------- scorecard ---------- */
  function cell(b, a, d, up, money, suf) {
    var diff = a - b, good = up ? diff > 0 : diff < 0, c = Math.abs(diff) < 0.005 ? '' : good ? 'up' : 'down';
    var f = function (v) { return (money ? usd(v, d) : fmt(v, d)) + (suf || ''); };
    return '<td>' + f(b) + '</td><td>' + f(a) + '</td><td class="' + c + '">' + (Math.abs(diff) < 0.005 ? '·' : (diff > 0 ? '+' : '−') + (money ? '$' : '') + fmt(Math.abs(diff), d) + (suf || '')) + '</td>';
  }
  var rows = CH.map(function (c) {
    var b = B.ch[c], a = A.ch[c];
    return '<tr><td><span class="dot" style="background:var(' + VAR[c] + ')"></span>' + NAME[c] + '</td>' +
      cell(b.orders, a.orders, 0, c !== 'Unattributed') + cell(b.profit, a.profit, 0, true, true) + cell(b.ppo, a.ppo, 2, true, true) + cell(b.repeat, a.repeat, 1, true, false, '%') + '</tr>';
  }).join('');
  rows += '<tr style="font-weight:700"><td>All orders</td>' + cell(tb.orders, ta.orders, 0, true) + cell(tb.profit, ta.profit, 0, true, true) + cell(tb.ppo, ta.ppo, 2, true, true) + cell(tb.repeat, ta.repeat, 1, true, false, '%') + '</tr>';
  $('score').innerHTML = '<thead><tr class="g"><th></th><th colspan="3">Orders</th><th colspan="3">Profit</th><th colspan="3">Profit per order</th><th colspan="3">Repeat rate</th></tr><tr><th>Channel</th>' +
    ['Before', 'After', 'Change', 'Before', 'After', 'Change', 'Before', 'After', 'Change', 'Before', 'After', 'Change'].map(function (h) { return '<th>' + h + '</th>'; }).join('') + '</tr></thead><tbody>' + rows + '</tbody>';

  /* ---------- rules ---------- */
  var disc = A.ch.Word_of_Mouth;
  $('rules').innerHTML =
    '<div class="rule"><h3><b class="id">R1</b>Recover the unattributed orders</h3><p>TrueSource captures UTM links, promo codes, QR scans and a one-question checkout survey. Of the <span class="num">' + R.unattr_before + '</span> orders with no source, <span class="num">70%</span> (' + R.recovered + ' orders) get a channel from the survey.</p><p>Each is assigned in proportion to how online orders were attributed in Dataset 1 (Paid Social 52%, Influencer 28%, Word of Mouth 20%). The remaining 30% stay Unattributed because the customer answered "not sure".</p><p>Each recovered order now carries that channel\'s average marketing cost from Dataset 1.</p></div>' +
    '<div class="rule"><h3><b class="id">R2</b>Move spend to what works</h3><p>The Budget Advisor flags Paid Social as the biggest cost with the lowest profit per order. The <span class="num">' + R.k + '</span> least profitable Paid Social orders (10%) are removed, which frees <span class="num">' + usd(R.freed) + '</span> of ad spend.</p><p><span class="num">' + R.k + '</span> extra Farmers Market orders are added at that channel\'s own cost, <span class="num">' + usd(R.spent) + '</span>. Order count stays at 2,500.</p></div>' +
    '<div class="rule"><h3><b class="id">R3</b>Cap discounts at 15%</h3><p>The Advisor\'s discount limit is 15%. Word of Mouth codes REFER20 and FRIEND20 become REFER15 and FRIEND15 (<span class="num">' + R.disc_capped + '</span> orders). Net revenue is recalculated.</p><p>Order volume is assumed unchanged, which is an optimistic assumption.</p></div>';
  $('roinote').innerHTML = '<b>Why blended return on spend falls from ' + fmt(tb.blended_roi, 2) + ' to ' + fmt(ta.blended_roi, 2) + ':</b> in Dataset 1 the ad cost behind unattributed orders was not charged to any channel. After R1 it is, so counted marketing cost rises from ' + usd(tb.mkt) + ' to ' + usd(ta.mkt) + '. That is the old data hiding cost, not new spending. Every channel with spend improves on its own (see the return chart).';

  /* ---------- charts ---------- */
  function base() {
    var ink = css('--ink'), ink2 = css('--ink2'), grid = css('--grid');
    Chart.defaults.font.family = 'system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif';
    Chart.defaults.font.size = 12;
    Chart.defaults.color = ink2;
    return { ink: ink, ink2: ink2, grid: grid, surface: css('--surface') };
  }
  var labelPlugin = {
    id: 'endlabels',
    afterDatasetsDraw: function (chart, args, opts) {
      if (!opts || !opts.fmt) return;
      var ctx = chart.ctx; ctx.save(); ctx.font = '12px system-ui,sans-serif'; ctx.fillStyle = opts.color; ctx.textBaseline = 'middle';
      chart.data.datasets.forEach(function (ds, i) {
        chart.getDatasetMeta(i).data.forEach(function (bar, j) {
          var v = ds.data[j]; if (v === null || v === undefined) return;
          ctx.fillText(opts.fmt(v), bar.x + 6, bar.y);
        });
      });
      ctx.restore();
    }
  };
  function hbar(id, getB, getA, labs, f, c) {
    var t = base(), cols = labs.map(function (k) { return css(VAR[k]); });
    return new Chart($(id), {
      type: 'bar', plugins: [labelPlugin],
      data: { labels: labs.map(function (k) { return NAME[k]; }), datasets: [
        { label: 'Before', data: labs.map(getB), backgroundColor: cols.map(function (c) { return mix(c, 0.3); }), borderColor: cols, borderWidth: 1.5, borderRadius: { topRight: 4, bottomRight: 4 }, borderSkipped: false },
        { label: 'After', data: labs.map(getA), backgroundColor: cols, borderColor: cols, borderWidth: 1.5, borderRadius: { topRight: 4, bottomRight: 4 }, borderSkipped: false }
      ] },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false, animation: { duration: 400 },
        layout: { padding: { right: 56 } }, categoryPercentage: 0.82, barPercentage: 0.9,
        scales: { x: { beginAtZero: true, grid: { color: t.grid }, border: { display: false }, ticks: { callback: function (v) { return c ? c(v) : v; } } }, y: { grid: { display: false }, border: { color: t.grid }, ticks: { color: t.ink } } },
        plugins: { legend: { display: false }, endlabels: { fmt: f, color: t.ink }, tooltip: { callbacks: { label: function (x) { return x.dataset.label + ': ' + f(x.parsed.x); } } } }
      }
    });
  }
  function line() {
    var t = base(), ms = B.monthly.months.map(monthLabel);
    return new Chart($('c2'), {
      type: 'line',
      data: { labels: ms, datasets: [
        { label: 'Before', data: B.monthly.unattr_pct, borderColor: css('--before-line'), backgroundColor: css('--before-line'), borderDash: [6, 4], borderWidth: 2, pointRadius: 3, pointHoverRadius: 6, tension: 0.25 },
        { label: 'After', data: A.monthly.unattr_pct, borderColor: css('--after-line'), backgroundColor: css('--after-line'), borderWidth: 2.5, pointRadius: 3.5, pointHoverRadius: 6, tension: 0.25 }
      ] },
      options: {
        responsive: true, maintainAspectRatio: false, animation: { duration: 400 }, interaction: { mode: 'index', intersect: false },
        scales: { y: { beginAtZero: true, grid: { color: t.grid }, border: { display: false }, ticks: { callback: function (v) { return v + '%'; } }, title: { display: true, text: '% of orders' } }, x: { grid: { display: false }, border: { color: t.grid } } },
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (x) { return x.dataset.label + ': ' + fmt(x.parsed.y, 1) + '%'; } } } }
      }
    });
  }
  function draw() {
    charts.forEach(function (c) { c.destroy(); }); charts = [];
    charts.push(hbar('c1', function (k) { return B.ch[k].orders; }, function (k) { return A.ch[k].orders; }, CH, function (v) { return fmt(v); }));
    charts.push(line());
    charts.push(hbar('c3', function (k) { return B.ch[k].ppo; }, function (k) { return A.ch[k].ppo; }, CH, function (v) { return usd(v, 2); }, function (v) { return '$' + v; }));
    var paid = ['Paid_Social', 'Influencer', 'Farmers_Market'];
    charts.push(hbar('c4', function (k) { return B.ch[k].roi; }, function (k) { return A.ch[k].roi; }, paid, function (v) { return fmt(v, 2) + '×'; }, function (v) { return v + '×'; }));
  }
  draw();
  if (window.matchMedia) { try { window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', draw); } catch (e) {} }
})();
