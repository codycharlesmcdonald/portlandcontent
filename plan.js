/* Plan pages: ticks build "Your plan", the chosen service shows on the right, and Book a time to talk carries the list into Calendly (or an email). Labels come from the ladder, so the plan always matches the page.
   Running total (2026-11-03, waits on prices): give a service input data-price (dollars) and data-per (once, mo or each; each also takes data-unit like "listing" and an optional data-qty, default 1). With no data-price on the page nothing changes. Unpriced picks show "On the call". data-price-from on the main adds "From" to every figure. */
(function(){
  document.querySelectorAll('[data-plan]').forEach(function(main){
  var CAL='https://calendly.com/portlandcontent/call', MAIL='cody@portlandcontent.com';
  var who=main.getAttribute('data-who')||'', subject=main.getAttribute('data-subject')||'Content plan';
  var inputs=[].slice.call(main.querySelectorAll('input[data-s]'));
  var ids=inputs.map(function(i){return i.getAttribute('data-s')});
  var cur=ids[0];
  function label(id){var b=main.querySelector('[data-label="'+id+'"]');return b?b.textContent.trim():id}
  function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;')}
  function picked(){return inputs.filter(function(i){return i.checked}).map(function(i){return i.getAttribute('data-s')})}
  function links(){
    var L=picked().map(label), t=who+' plan: '+(L.length?L.join('; '):'nothing picked yet');
    return {cal:CAL+'?a1='+encodeURIComponent(t),mail:'mailto:'+MAIL+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent('Hi Cody,\n\nHere is what I picked:\n- '+L.join('\n- ')+'\n')};
  }
  var priced=inputs.some(function(i){return i.hasAttribute('data-price')}), from=main.hasAttribute('data-price-from')?'From ':'';
  var qty={}; inputs.forEach(function(i){qty[i.getAttribute('data-s')]=Math.max(1,parseInt(i.getAttribute('data-qty')||'1',10)||1)});
  function inp(id){return main.querySelector('input[data-s="'+id+'"]')}
  function money(n){return '$'+Math.round(n).toLocaleString('en-US')}
  function cost(id){var i=inp(id); if(!i||!i.hasAttribute('data-price')) return null; var n=parseFloat(i.getAttribute('data-price'))||0, per=i.getAttribute('data-per')||'once'; return {per:per, amt:per==='each'?n*qty[id]:n, unit:i.getAttribute('data-unit')||'each', each:n}}
  function priceCell(id){
    var c=cost(id); if(!priced) return '';
    if(!c) return '<span class="amt muted">On the call</span>';
    if(c.per==='each') return '<span class="amt"><span class="qty"><button type="button" data-q="'+id+'" data-d="-1" aria-label="One fewer">&minus;</button><b>'+qty[id]+'</b> '+esc(c.unit)+(qty[id]===1?'':'s')+'<button type="button" data-q="'+id+'" data-d="1" aria-label="One more">+</button></span>'+from+money(c.amt)+'</span>';
    return '<span class="amt">'+from+money(c.amt)+(c.per==='mo'?' a month':'')+'</span>';
  }
  function totals(P){
    var once=0, mo=0, open=0; P.forEach(function(id){var c=cost(id); if(!c){open++;return} if(c.per==='mo') mo+=c.amt; else once+=c.amt});
    if(!P.length) return '';
    var rows=[]; if(once) rows.push('<div><span>One time</span><b>'+from+money(once)+'</b></div>'); if(mo) rows.push('<div><span>Monthly</span><b>'+from+money(mo)+'</b></div>'); if(mo) rows.push('<div class="yr"><span>First year</span><b>'+from+money(once+12*mo)+'</b></div>');
    return rows.join('')+(open?'<p>'+open+' more '+(open===1?'is':'are')+' scoped on the call.</p>':'');
  }
  if(priced){main.querySelectorAll('[data-plan-list]').forEach(function(el){if(!el.nextElementSibling||!el.nextElementSibling.hasAttribute('data-plan-total')){var t=document.createElement('div');t.className='plan-total';t.setAttribute('data-plan-total','');t.setAttribute('aria-live','polite');el.parentNode.insertBefore(t,el.nextSibling)}})}
  function render(){
    var P=picked(), h=links();
    var list=P.length?'<ol'+(priced?' class="priced"':'')+'>'+P.map(function(id,i){return '<li><span class="num">'+(i<9?'0':'')+(i+1)+'</span><span>'+esc(label(id))+'</span>'+priceCell(id)+'<button type="button" data-rm="'+id+'" aria-label="Remove '+esc(label(id))+'">Remove</button></li>'}).join('')+'</ol>':'<p class="empty">Nothing picked yet. Tick a service to start your plan.</p>';
    main.querySelectorAll('[data-plan-list]').forEach(function(el){el.innerHTML=list});
    main.querySelectorAll('[data-plan-total]').forEach(function(el){el.innerHTML=totals(P)});
    main.querySelectorAll('[data-plan-count]').forEach(function(el){el.textContent=P.length+' of '+ids.length+' picked. We scope the rest together on the call.'});
    main.querySelectorAll('[data-plan-acts]').forEach(function(el){el.innerHTML='<a class="btn" data-plan-book href="'+h.cal+'" target="_blank" rel="noopener">Book a time to talk</a><a class="mail" href="'+h.mail+'">Email it to '+MAIL+'</a>'});
    main.querySelectorAll('[data-plan-dockn]').forEach(function(el){el.textContent=P.length+' in your plan'});
    main.querySelectorAll('.rung').forEach(function(r){r.classList.toggle('cur',r.getAttribute('data-cur')===cur)});
    main.querySelectorAll('[data-stage]').forEach(function(s){s.hidden=s.getAttribute('data-stage')!==cur});
  }
  main.addEventListener('change',function(e){var t=e.target; if(t.matches&&t.matches('input[data-s]')){cur=t.getAttribute('data-s'); render();}});
  main.addEventListener('click',function(e){
    var q=e.target.closest('[data-q]');
    if(q){var k=q.getAttribute('data-q'); qty[k]=Math.max(1,qty[k]+parseInt(q.getAttribute('data-d'),10)); render(); return;}
    var rm=e.target.closest('[data-rm]');
    if(rm){var i=main.querySelector('input[data-s="'+rm.getAttribute('data-rm')+'"]'); if(i) i.checked=false; render(); return;}
    var r=e.target.closest('.rung');
    if(r && !e.target.closest('label')){cur=r.getAttribute('data-cur'); render();}
  });
  render();
  });
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a[data-plan-book]'); if(!a||!window.Calendly) return;
    e.preventDefault(); e.stopPropagation();
    window.Calendly.initPopupWidget({url:a.href+'&hide_gdpr_banner=1'});
  },true);
})();
