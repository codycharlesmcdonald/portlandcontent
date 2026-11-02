/* Plan pages: ticks build "Your plan", the chosen service shows on the right, and Book a time to talk carries the list into Calendly (or an email). Labels come from the ladder, so the plan always matches the page. */
(function(){
  var main=document.querySelector('[data-plan]'); if(!main) return;
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
  function render(){
    var P=picked(), h=links();
    var list=P.length?'<ol>'+P.map(function(id,i){return '<li><span class="num">'+(i<9?'0':'')+(i+1)+'</span><span>'+esc(label(id))+'</span><button type="button" data-rm="'+id+'" aria-label="Remove '+esc(label(id))+'">Remove</button></li>'}).join('')+'</ol>':'<p class="empty">Nothing picked yet. Tick a service to start your plan.</p>';
    main.querySelectorAll('[data-plan-list]').forEach(function(el){el.innerHTML=list});
    main.querySelectorAll('[data-plan-count]').forEach(function(el){el.textContent=P.length+' of '+ids.length+' picked. We scope the rest together on the call.'});
    main.querySelectorAll('[data-plan-acts]').forEach(function(el){el.innerHTML='<a class="btn" data-plan-book href="'+h.cal+'" target="_blank" rel="noopener">Book a time to talk</a><a class="mail" href="'+h.mail+'">Email it to '+MAIL+'</a>'});
    main.querySelectorAll('[data-plan-dockn]').forEach(function(el){el.textContent=P.length+' in your plan'});
    main.querySelectorAll('.rung').forEach(function(r){r.classList.toggle('cur',r.getAttribute('data-cur')===cur)});
    main.querySelectorAll('[data-stage]').forEach(function(s){s.hidden=s.getAttribute('data-stage')!==cur});
  }
  main.addEventListener('change',function(e){var t=e.target; if(t.matches&&t.matches('input[data-s]')){cur=t.getAttribute('data-s'); render();}});
  main.addEventListener('click',function(e){
    var rm=e.target.closest('[data-rm]');
    if(rm){var i=main.querySelector('input[data-s="'+rm.getAttribute('data-rm')+'"]'); if(i) i.checked=false; render(); return;}
    var r=e.target.closest('.rung');
    if(r && !e.target.closest('label')){cur=r.getAttribute('data-cur'); render();}
  });
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a[data-plan-book]'); if(!a||!window.Calendly) return;
    e.preventDefault(); e.stopPropagation();
    window.Calendly.initPopupWidget({url:a.href+'&hide_gdpr_banner=1'});
  },true);
  render();
})();
