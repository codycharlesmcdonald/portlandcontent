/* Portland Content proposals, made in /builder (Cody, Nov 25, Lead Gen to-do 10548649218: "A seems great!").
   A published proposal is a small page holding its data in <script id="proposal-data" type="application/json">.
   This file draws it in the pitch page look (Hardstyle, Vivian Lee) and runs the picks, the total, the calendar and the send form.
   The builder calls PCProposal.render(data, el) for its live preview, and PCProposal.shell(data) for the page it publishes. */
(function (root) {
  'use strict';

  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var FONTS = {
    serif: { link: 'family=DM+Serif+Display:ital@0;1&family=Figtree:wght@400;500;600', display: '"DM Serif Display", Georgia, "Times New Roman", serif', body: '"Figtree", "Helvetica Neue", Arial, sans-serif' },
    bodoni: { link: 'family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..700;1,6..96,400..600&family=Hanken+Grotesk:wght@400;500;600', display: '"Bodoni Moda", Didot, Georgia, serif', body: '"Hanken Grotesk", "Helvetica Neue", Arial, sans-serif' },
    fraunces: { link: 'family=Fraunces:ital,opsz,wght@0,9..144,400..600;1,9..144,400..600&family=Instrument+Sans:wght@400;500;600', display: '"Fraunces", Georgia, serif', body: '"Instrument Sans", "Helvetica Neue", Arial, sans-serif' }
  };
  /* MOCKUP-RULES: these near-blacks never go on a brand page */
  var BANNED = ['#100f0e', '#0e0d0b', '#16140f', '#15140f', '#16120a'];

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  /* *word* in a heading becomes the accent word */
  function em(s) { return esc(s).replace(/\*([^*]+)\*/g, '<em>$1</em>'); }
  function money(n) { return '$' + Math.round(n).toLocaleString('en-US'); }
  function ten(n) { return Math.round(n / 10) * 10; }
  function hex(c, d) { c = String(c || '').trim(); return /^#[0-9a-f]{6}$/i.test(c) && BANNED.indexOf(c.toLowerCase()) < 0 ? c : d; }
  function list(a) { return Array.isArray(a) ? a : []; }
  function joinAnd(a) { return a.length < 2 ? (a[0] || '') : a.slice(0, -1).join(', ') + (a.length > 2 ? ',' : '') + ' and ' + a[a.length - 1]; }

  /* vimeo.com/ID/HASH, vimeo.com/ID?h=HASH or player.vimeo.com/video/ID?h=HASH */
  function vimeo(url) {
    var m = String(url || '').match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/([0-9a-f]+))?(?:[^#]*[?&]h=([0-9a-f]+))?/i);
    if (!m) return null;
    var h = m[2] || m[3] || '';
    return { id: m[1], h: h, page: 'https://vimeo.com/' + m[1] + (h ? '/' + h : ''), player: 'https://player.vimeo.com/video/' + m[1] + '?' + (h ? 'h=' + h + '&' : '') };
  }

  function defaults(d) {
    d = d || {};
    d.client = d.client || {}; d.brand = d.brand || {}; d.title = d.title || {}; d.lede = d.lede || {};
    d.picks = d.picks || {}; d.calendar = d.calendar || {}; d.close = d.close || {}; d.send = d.send || {};
    return d;
  }

  function priced(it, plan) { return Math.round((Number(it.price) || 0) * (plan ? Number(plan.factor) || 1 : 1)); }
  function count(it) { return it.type === 'fixed' ? 1 : it.type === 'qty' ? (Number(it.val) || 0) : (it.val ? 1 : 0); }

  /* ---------- the page ---------- */
  function render(data, el) {
    var d = defaults(JSON.parse(JSON.stringify(data)));
    var b = d.brand, f = FONTS[b.fonts] || FONTS.serif;
    var bg = hex(b.bg, '#0B0B0B'), ink = hex(b.ink, '#F4F2EE'), acc = hex(b.accent, '#EE1D52'), acc2 = hex(b.accent2, '#D9B45A');
    var items = list(d.picks.items).filter(function (it) { return it && it.name; });
    items.forEach(function (it, i) { it.id = it.id || 'p' + i; if (it.type === 'qty') { it.min = Number(it.min) || 0; it.max = Math.max(it.min, Number(it.max) || 10); it.val = Math.min(it.max, Math.max(it.min, Number(it.val) || 0)); it.def = it.val || 1; } else if (it.type === 'on') { it.def = 1; } });
    var BY = {}; items.forEach(function (it) { BY[it.id] = it; });
    var plans = list(d.picks.plans).filter(function (p) { return p && p.label; });
    if (!plans.length) plans = [{ label: '', factor: 1, note: '' }];
    var pk = d.packages || {}, packs = list(pk.items).filter(function (x) { return x && x.name; });
    var S = { plan: 0, pack: packs.length ? Math.min(Math.max(0, Number(pk.pick) || 0), packs.length - 1) : -1 };
    var sections = list(d.sections).filter(function (x) { return x && (x.heading || x.text); });
    var cal = d.calendar, calItems = list(cal.items).filter(function (c) { return c && c.title; });
    var films = list(d.films).filter(function (x) { return x && (x.title || x.vimeo); });
    var ideas = list(d.ideas).filter(function (x) { return x && x.title; });
    var qs = list(d.questions).filter(function (q) { return q && String(q).trim(); });
    var name = d.client.name || 'Your proposal';

    var css = ':root{--bg:' + bg + ';--ink:' + ink + ';--accent:' + acc + ';--accent-2:' + acc2 + ';--display:' + f.display + ';--body:' + f.body + '}';
    var h = [];
    h.push('<style>' + css + '</style>');
    h.push('<header class="wrap mast"><span>' + (b.logo ? '<img class="logo" src="' + esc(b.logo) + '" alt="' + esc(name) + ' logo">' : '') + '<b>' + esc(d.studio || 'Portland Content') + '</b> for ' + esc(name) + '</span>' + (d.client.prepared ? '<span>' + esc(d.client.prepared) + '</span>' : '') + '</header>');
    h.push('<section class="wrap title">' + (d.title.kicker ? '<p class="for">' + esc(d.title.kicker) + '</p>' : '') + '<h1>' + em(d.title.name || name) + '</h1></section>');
    if (b.image) h.push('<div class="art"><div class="still"><img src="' + esc(b.image) + '" alt="' + esc(b.imageAlt || '') + '"></div></div>');

    var jumps = [];
    if (ideas.length) jumps.push(['ideas', d.ideasLabel || 'Ideas for the year']);
    if (cal.mode && cal.mode !== 'none' && calItems.length) jumps.push(['year', cal.label || (cal.mode === 'year' ? 'How the year runs' : 'The calendar')]);
    if (items.length || packs.length) jumps.push(['build', d.picks.label || 'Build your year']);
    if (films.length) jumps.push(['films', d.filmsLabel || 'Films we made']);
    jumps.push(['talk', 'Book a time to talk']);
    h.push('<nav class="jump" aria-label="On this page"><div class="wrap">' + jumps.map(function (j) { return '<a href="#' + j[0] + '">' + esc(j[1]) + '</a>'; }).join('') + '</div></nav>');

    h.push('<main><article class="wrap view">');
    if (d.lede.headline || list(d.lede.paras).length) {
      h.push('<div class="lede"><h2>' + em(d.lede.headline || '') + '</h2><div>' + list(d.lede.paras).filter(Boolean).map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') + '</div></div>');
    }

    var duo = ideas.length && cal.mode === 'year' && calItems.length;
    if (duo) h.push('<div class="duo">');
    if (ideas.length) {
      h.push('<section class="sec" id="ideas"><p class="label">' + esc(d.ideasLabel || 'Ideas for the year') + '</p><ol class="ideas">' + ideas.map(function (x, i) {
        return '<li><span class="n">' + (i + 1) + '</span><h3>' + esc(x.title) + '</h3><p>' + esc(x.text || '') + '</p></li>';
      }).join('') + '</ol></section>');
    }
    if (cal.mode === 'year' && calItems.length) {
      h.push('<section class="sec" id="year"><p class="label">' + esc(cal.label || 'How the year runs') + '</p><div class="cal12" id="cal12"></div>' +
        '<p class="calkey"><span class="e shoot">Shoots</span><span class="e batch">Deliveries</span><span class="p"><i></i>Posts</span><span class="e out">Not in your plan yet</span>' + (items.length ? '<span class="hint">Tap anything to add it or take it out.</span>' : '') + '</p>' +
        '<p class="calnote" id="caladd" aria-live="polite"></p>' + (cal.note ? '<p class="calnote">' + esc(cal.note) + '</p>' : '') + '</section>');
    }
    if (duo) h.push('</div>');
    if (cal.mode === 'dates' && calItems.length) {
      h.push('<section class="sec" id="year"><p class="label">' + esc(cal.label || 'The calendar') + '</p><ol class="line" id="line"></ol>' + (cal.note ? '<p class="calnote">' + esc(cal.note) + '</p>' : '') + '</section>');
    }

    sections.forEach(function (x) {
      h.push('<section class="sec">' + (x.heading ? '<p class="label">' + esc(x.heading) + '</p>' : '') + '<div class="prose">' + String(x.text || '').split(/\n\s*\n/).filter(function (t) { return t.trim(); }).map(function (t) { return '<p>' + esc(t.trim()) + '</p>'; }).join('') + '</div></section>');
    });
    if (items.length || packs.length) {
      h.push('<section class="sec" id="build"><p class="label">' + esc(d.picks.label || 'Build your year') + '</p>');
      if (plans.length > 1) {
        h.push('<div class="plan" role="radiogroup" aria-label="Plan">' + plans.map(function (p, i) {
          return '<label><input type="radio" name="plan" value="' + i + '"' + (i === 0 ? ' checked' : '') + '><span>' + esc(p.label) + '</span></label>';
        }).join('') + '</div><p class="save" id="save" aria-live="polite"></p>');
      }
      h.push('<div class="bgrid"><div class="picks"><div class="fbar" aria-hidden="true"><span class="k">' + esc(d.picks.totalLabel || 'Your total') + '</span><span class="fs" id="fsum"></span><span class="fm" id="fmo"></span></div>');
      if (packs.length) {
        h.push((pk.label ? '<p class="sub">' + esc(pk.label) + '</p>' : '') + '<div class="packs" role="radiogroup" aria-label="' + esc(pk.label || 'Packages') + '" style="--n:' + packs.length + '">' + packs.map(function (x, i) {
          var dl = String(x.deliverables || '').split(/\n/).map(function (t) { return t.trim(); }).filter(Boolean);
          return '<label class="pack"><input type="radio" name="pack" value="' + i + '"' + (i === S.pack ? ' checked' : '') + '><span class="pk"><span class="pn">' + esc(x.name) + (x.recommended ? ' <span class="tag">Recommended</span>' : '') + '</span><span class="pp" data-pp="' + i + '"></span>' +
            '<span class="pd">' + (dl.length ? '<ul>' + dl.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' : '') + '</span><span class="pnote">' + esc(x.note || '') + '</span></span></label>';
        }).join('') + '</div>' + (items.length ? '<p class="sub">' + esc(d.picks.addLabel || 'Add to the year') + '</p>' : ''));
      }
      h.push('<ul class="pick" id="pick">');
      items.forEach(function (it) {
        var ctl = it.type === 'fixed' ? '<span class="inc">Included</span>'
          : it.type === 'qty' ? '<span class="step"><button type="button" data-d="-1" aria-label="Fewer: ' + esc(it.name) + '">&minus;</button><output aria-live="polite">' + it.val + '</output><button type="button" data-d="1" aria-label="More: ' + esc(it.name) + '">+</button></span>'
          : '<input class="sw" type="checkbox" role="switch" aria-label="' + esc(it.name) + '"' + (it.val ? ' checked' : '') + '>';
        h.push('<li id="r-' + esc(it.id) + '" data-id="' + esc(it.id) + '"><div class="txt"><h3>' + esc(it.name) + '</h3>' + (it.desc || it.type === 'qty' ? '<p class="d">' + esc(it.desc || '') + (it.type === 'qty' ? ' <span class="each"></span>' : '') + '</p>' : '') + '</div><div class="ctl">' + ctl + '</div><div class="amt"></div></li>');
      });
      h.push('</ul></div><aside class="total" aria-live="polite"><div><div class="k">' + esc(d.picks.totalLabel || 'Your total') + '</div><p class="what" id="what"></p></div><div><div class="sum" id="sum"></div><span class="mo" id="mo"></span></div><p class="notes" id="pay"></p></aside></div>');
      h.push(sendForm(d, qs));
      h.push('</section>');
    } else if (qs.length) {
      h.push('<section class="sec" id="build">' + sendForm(d, qs) + '</section>');
    }

    if (films.length) {
      h.push('<section class="sec" id="films"><p class="label">' + esc(d.filmsLabel || 'Films we made') + '</p><div class="films">' + films.map(function (x) {
        var v = vimeo(x.vimeo), href = v ? v.page : (x.vimeo || '#');
        return '<figure><a class="v" ' + (v ? 'data-embed="' + esc(v.player) + '" data-vid="' + esc(v.id) + '" ' : '') + 'href="' + esc(href) + '" target="_blank" rel="noopener">' +
          '<img src="' + esc(x.thumb || '') + '" alt="' + esc(x.alt || x.title || '') + '" loading="lazy"' + (x.thumb ? '' : ' data-auto="1"') + '></a>' +
          '<figcaption><h3>' + esc(x.title || '') + '</h3>' + (x.text ? '<p>' + esc(x.text) + '</p>' : '') + '<a class="watch" href="' + esc(href) + '" target="_blank" rel="noopener">Watch the film</a></figcaption></figure>';
      }).join('') + '</div></section>');
    }
    if (d.delivery) h.push('<section class="sec"><p class="label">' + esc(d.deliveryLabel || 'How you get everything') + '</p><p class="terms">' + esc(d.delivery) + '</p></section>');
    h.push('</article></main>');

    var c = d.close, phone = c.phone || '(503) 568-1199', mail = c.email || 'cody@macfilmproductions.com';
    h.push('<section class="close" id="talk"><div class="wrap"><div><h2>' + em(c.heading || 'Let’s grab a coffee and talk through the year') + '</h2>' + (c.text ? '<p>' + esc(c.text) + '</p>' : '') + '</div>' +
      '<div class="contact">' + (c.calendly ? '<a class="btn" href="' + esc(c.calendly) + '" target="_blank" rel="noopener">Book a time to talk</a>' : '') +
      '<span class="line2">' + esc(c.name || 'Cody McDonald') + ', ' + esc(phone) + '</span><span class="line2"><a href="mailto:' + esc(mail) + '">' + esc(mail) + '</a></span></div>' +
      (c.calendly ? '<div class="cal" id="calendly"></div>' : '') + '</div></section>');
    h.push('<footer class="wrap foot"><span>' + esc(d.studio || 'Portland Content') + ', Portland, Oregon</span><span>' + esc(d.studioSite || 'portlandcontent.com') + '</span></footer>');

    el.innerHTML = h.join('');
    el.classList.add('pcp');
    wire(el, d, items, BY, plans, calItems, cal, qs, mail, S, packs);
  }

  function sendForm(d, qs) {
    return '<form class="send" id="send" novalidate>' + (qs.length ? '<p class="qhead">' + esc(d.questionsLabel || 'Questions that shape the plan') + '</p>' : '') +
      qs.map(function (q, i) { return '<label class="q">' + esc(q) + '<textarea name="q' + (i + 1) + '" rows="2"></textarea></label>'; }).join('') +
      '<div class="who"><label>Your name<input type="text" name="name" autocomplete="name" required></label><label>Your email<input type="email" name="email" autocomplete="email" required></label></div>' +
      '<button class="btn" type="submit">' + esc(d.send.button || 'Send me your picks') + '</button><p class="sent" id="sent" aria-live="polite"></p></form>';
  }

  /* ---------- what moves ---------- */
  function wire(el, d, items, BY, plans, calItems, cal, qs, mail, S, packs) {
    function $(id) { return el.querySelector('#' + id); }
    function getPlan() { return S.plan; }
    function plan() { return plans[S.plan] || plans[0]; }
    function pack() { return S.pack > -1 ? packs[S.pack] : null; }
    function total(p) { var k = pack(); return (k ? priced(k, p) : 0) + items.reduce(function (s, it) { return s + count(it) * priced(it, p); }, 0); }
    function fill(s, t, p) {
      return String(s || '').replace(/\{total\}/g, money(t)).replace(/\{month\}/g, money(ten(t / (Number(p.months) || 12)))).replace(/\{hold\}/g, d.picks.hold || '');
    }

    function paint() {
      var p = plan(), t = total(p);
      items.forEach(function (it) {
        var li = $('r-' + it.id); if (!li) return;
        var n = count(it), u = priced(it, p);
        li.classList.toggle('off', n === 0);
        li.querySelector('.amt').textContent = n ? money(n * u) : money(0);
        if (it.type === 'qty') {
          li.querySelector('output').textContent = it.val;
          li.querySelector('[data-d="-1"]').disabled = it.val <= it.min;
          li.querySelector('[data-d="1"]').disabled = it.val >= it.max;
          var e = li.querySelector('.each'); if (e) e.textContent = money(u) + ' ' + (it.unit ? 'per ' + it.unit : 'each') + '.';
        }
        var sw = li.querySelector('.sw'); if (sw) sw.checked = !!it.val;
      });
      [].forEach.call(el.querySelectorAll('[data-pp]'), function (x) { x.textContent = money(priced(packs[Number(x.getAttribute('data-pp'))], p)); });
      var names = items.filter(function (it) { return count(it) > 0; }).map(function (it) { return it.type === 'qty' ? it.val + ' × ' + it.name.toLowerCase() : it.name.toLowerCase(); });
      if (pack()) names.unshift(pack().name);
      if ($('what')) $('what').textContent = names.length ? 'This includes ' + joinAnd(names) + '.' : 'Pick anything above to build the plan.';
      if ($('sum')) $('sum').textContent = money(t);
      if ($('fsum')) $('fsum').textContent = money(t);
      var mo = Number(p.months) > 1 ? 'About ' + money(ten(t / Number(p.months))) + ' a month' : '';
      if ($('mo')) $('mo').textContent = mo;
      if ($('fmo')) $('fmo').textContent = mo;
      if ($('pay')) $('pay').textContent = fill(p.note, t, p);
      if ($('save')) {
        var best = total(plans[0]), cur = t;
        $('save').textContent = getPlan() === 0 && plans.length > 1 ? (total(plans[1]) > best ? 'You save ' + money(total(plans[1]) - best) + ' with the ' + plans[0].label.toLowerCase() + '.' : '') : (cur > best ? 'The ' + plans[0].label.toLowerCase() + ' saves ' + money(cur - best) + '.' : '');
      }
      calendar();
    }

    function inPlan(c) { var it = c.pick && BY[c.pick]; return !it || count(it) > 0; }
    function calendar() {
      var box = $('cal12');
      if (box) {
        var out = '';
        for (var m = 1; m <= 12; m++) {
          var here = calItems.filter(function (c) { return Number(c.month) === m; });
          var s = '', dl = '', po = '';
          here.forEach(function (c) {
            var on = inPlan(c), it = c.pick && BY[c.pick], tap = it && it.type !== 'fixed';
            var label = esc(c.title), cls;
            if (c.kind === 'post') { cls = on ? 'p' : 'p out'; label = on ? '<i></i>' + label : label; }
            else if (c.kind === 'delivery') cls = on ? 'bi' : 'e out';
            else cls = on ? 'e shoot' : 'e out';
            var tag = tap ? '<button type="button" class="' + cls + ' tog" data-tog="' + esc(c.pick) + '">' + label + '</button>' : '<span class="' + cls + '">' + label + '</span>';
            if (c.kind === 'post') po += tag; else if (c.kind === 'delivery' && on) dl += tag; else s += tag;
          });
          out += '<div class="m"><span class="mn">' + MONTHS[m - 1] + '</span>' + s + (dl ? '<span class="e batch">' + dl + '</span>' : '') + (po ? '<span class="posts">' + po + '</span>' : '') + '</div>';
        }
        box.innerHTML = out;
      }
      var line = $('line');
      if (line) {
        line.innerHTML = calItems.filter(inPlan).map(function (c) {
          return '<li' + (c.kind === 'shoot' || c.key ? ' class="key"' : '') + '><span class="d">' + esc(c.when || '') + '</span><span class="t">' + esc(c.title) + '</span>' + (c.text ? '<span class="x">' + esc(c.text) + '</span>' : '') + '</li>';
        }).join('');
      }
    }

    el.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b || !el.contains(b)) return;
      var li = b.closest('#pick > li');
      if (li && b.hasAttribute('data-d')) { var it = BY[li.getAttribute('data-id')]; it.val = Math.min(it.max, Math.max(it.min, it.val + Number(b.getAttribute('data-d')))); paint(); return; }
      if (b.hasAttribute('data-tog')) {
        var t = BY[b.getAttribute('data-tog')]; if (!t) return;
        var was = count(t) > 0;
        if (t.type === 'qty') t.val = was ? t.min : Math.max(t.def, t.min || 1); else t.val = !was;
        paint();
        var note = $('caladd');
        if (note) note.innerHTML = (was ? 'Took out ' : 'Added ') + esc(t.name) + '. Your total is now ' + money(total(plan())) + '. <a href="#build">See your picks</a>';
      }
    });
    el.addEventListener('change', function (e) {
      var x = e.target;
      if (x.classList.contains('sw')) { BY[x.closest('li').getAttribute('data-id')].val = x.checked; paint(); }
      if (x.name === 'plan') { S.plan = Number(x.value); paint(); }
      if (x.name === 'pack') { S.pack = Number(x.value); paint(); }
    });

    var form = $('send');
    if (form) form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fd = new FormData(form), p = plan();
      if (!fd.get('name') || !fd.get('email')) { $('sent').textContent = 'Add your name and email, and I’ll write back.'; return; }
      var lines = ['Hi Cody,', '', 'Here are my picks' + (p.label ? ' (' + p.label + ')' : '') + ':'];
      if (pack()) lines.push('- ' + pack().name + ': ' + money(priced(pack(), p)));
      items.forEach(function (it) { var n = count(it); if (n) lines.push('- ' + (it.type === 'qty' ? n + ' × ' : '') + it.name + ': ' + money(n * priced(it, p))); });
      if (items.length) lines.push('', 'Total: ' + money(total(p)));
      qs.forEach(function (q, i) { var a = String(fd.get('q' + (i + 1)) || '').trim(); if (a) lines.push('', q, a); });
      lines.push('', fd.get('name') + ', ' + fd.get('email'));
      location.href = 'mailto:' + mail + '?subject=' + encodeURIComponent((d.client.name || 'Proposal') + ' | My picks') + '&body=' + encodeURIComponent(lines.join('\n'));
      $('sent').textContent = 'Your email app should open with your picks. If it doesn’t, write to ' + mail + ' and they’ll come straight to me.';
    });

    /* thumbnails: Vimeo's own still when none is set, and a muted preview on hover or in view on touch */
    [].forEach.call(el.querySelectorAll('.films img[data-auto]'), function (img) {
      var a = img.closest('a'); if (!a || !a.getAttribute('data-vid')) return;
      fetch('https://vimeo.com/api/oembed.json?width=1280&url=' + encodeURIComponent(a.href)).then(function (r) { return r.json(); }).then(function (j) { if (j.thumbnail_url) img.src = j.thumbnail_url; }).catch(function () {});
    });
    var touch = root.matchMedia && root.matchMedia('(hover: none)').matches;
    [].forEach.call(el.querySelectorAll('.films a.v[data-embed]'), function (a) {
      function on() { if (a.querySelector('iframe')) return; var f = document.createElement('iframe'); f.src = a.getAttribute('data-embed') + 'background=1&muted=1&dnt=1'; f.title = 'Preview'; f.allow = 'autoplay'; f.onload = function () { f.classList.add('on'); }; a.appendChild(f); }
      function off() { var f = a.querySelector('iframe'); if (f) f.remove(); }
      if (touch && 'IntersectionObserver' in root) new IntersectionObserver(function (es) { es.forEach(function (x) { x.isIntersecting ? on() : off(); }); }, { threshold: 0.6 }).observe(a);
      else { a.addEventListener('mouseenter', on); a.addEventListener('mouseleave', off); }
    });

    /* the booking calendar shows inline where Calendly can load (MOCKUP-RULES) */
    var cbox = $('calendly');
    if (cbox && d.close.calendly) {
      var url = d.close.calendly + (d.close.calendly.indexOf('?') < 0 ? '?' : '&') + 'hide_gdpr_banner=1';
      var go = function () { try { root.Calendly.initInlineWidget({ url: url, parentElement: cbox }); el.querySelector('.close').classList.add('cal-on'); } catch (x) {} };
      if (root.Calendly) go();
      else { var s = document.createElement('script'); s.src = 'https://assets.calendly.com/assets/external/widget.js'; s.async = true; s.onload = go; document.head.appendChild(s); }
    }

    paint();
  }

  /* ---------- the page the builder publishes ---------- */
  function shell(data) {
    var d = defaults(JSON.parse(JSON.stringify(data)));
    var f = FONTS[d.brand.fonts] || FONTS.serif, name = d.client.name || 'Proposal';
    var title = d.pageTitle || name, desc = d.description || ('A plan for ' + name + ' from ' + (d.studio || 'Portland Content') + '.');
    var json = JSON.stringify(data, null, 1).replace(/</g, '\\u003c');
    var img = d.brand.image && /^https?:/.test(d.brand.image) ? d.brand.image : (d.brand.image ? 'https://portlandcontent.com/' + d.brand.image.replace(/^\//, '') : '');
    return '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n' +
      '<title>' + esc(title) + '</title>\n<meta name="robots" content="noindex,nofollow">\n<meta name="description" content="' + esc(desc) + '">\n' +
      '<meta property="og:title" content="' + esc(title) + '">\n<meta property="og:description" content="' + esc(desc) + '">\n<meta property="og:type" content="website">\n' +
      (img ? '<meta property="og:image" content="' + esc(img) + '">\n<meta name="twitter:card" content="summary_large_image">\n' : '') +
      '<meta name="theme-color" content="' + esc(hex(d.brand.bg, '#0B0B0B')) + '">\n<meta name="generator" content="Portland Content proposal builder">\n' +
      '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
      '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?' + f.link + '&display=swap">\n<link rel="stylesheet" href="/proposal.css">\n</head>\n<body>\n' +
      '<div id="proposal"><noscript><p style="padding:24px">This proposal needs JavaScript. Write to cody@macfilmproductions.com and I’ll send it another way.</p></noscript></div>\n' +
      '<script type="application/json" id="proposal-data">\n' + json + '\n</script>\n<script src="/proposal.js"></script>\n</body>\n</html>\n';
  }

  root.PCProposal = { render: render, shell: shell, vimeo: vimeo, fonts: FONTS, banned: BANNED };

  /* a published page draws itself */
  if (typeof document !== 'undefined') {
    var go = function () {
      var host = document.getElementById('proposal'), src = document.getElementById('proposal-data');
      if (host && src) { try { render(JSON.parse(src.textContent), host); } catch (e) { host.textContent = 'This proposal could not load. Write to cody@macfilmproductions.com.'; } }
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
  }
})(typeof window !== 'undefined' ? window : this);
