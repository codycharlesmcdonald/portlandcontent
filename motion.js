/* Scroll reveals: key elements fade and rise once as they enter view, rows stagger. Content stays visible if this never runs. */
(function(){
  if(!('IntersectionObserver' in window)) return;
  if(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var sel='h1,h2,.hero-full .lede,.hero-full .cred,.hero-full .btn,.showcase .frame,.showcase .item,.studio .still,.who .still,.studios .st,.svc li,.steps li,.why .row,.svc-item,.feature,.mini,.reel-strip a,.logos div,.madefor li,.cta-row .btn,.who .btn,.studio .btn,.contact .row,.case .hero-still';
  var all=[].slice.call(document.querySelectorAll(sel)).filter(function(e){return !e.closest('header,footer,.calendly-inline-widget,.notice,.editbar')});
  var els=all.filter(function(e){return !all.some(function(a){return a!==e&&a.contains(e)})});
  if(!els.length) return;
  document.documentElement.classList.add('motion');
  els.forEach(function(e){
    var sibs=[].filter.call(e.parentElement.children,function(c){return els.indexOf(c)>-1});
    e.style.setProperty('--rv-d',Math.min(sibs.indexOf(e),8)*70+'ms');
    e.classList.add('rv');
  });
  function done(e){e.classList.remove('rv','rv-in');e.style.removeProperty('--rv-d')}
  var io=new IntersectionObserver(function(list){
    list.forEach(function(x){
      if(!x.isIntersecting) return;
      var e=x.target; io.unobserve(e); e.classList.add('rv-in');
      setTimeout(function(){done(e)},700+(parseInt(e.style.getPropertyValue('--rv-d'))||0));
    });
  },{rootMargin:'0px 0px -6% 0px',threshold:0.1});
  els.forEach(function(e){io.observe(e)});
})();
