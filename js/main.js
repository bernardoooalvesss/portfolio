/* =================================================================
   Bernardo Alves — portfolio behaviour
   Vanilla JS, no dependencies. Runs after the DOM is parsed (defer).
   ================================================================= */
(function(){
  "use strict";

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Generated SVG poster (fallback before a real still exists) ---- */
  function genPoster(seed){
    var hues=[[18,30,42],[14,24,34],[20,34,46],[16,26,36],[22,36,48],[12,22,32]];
    var c=hues[seed%hues.length];
    var svg="<svg xmlns='http://www.w3.org/2000/svg' width='800' height='500'>"
      +"<defs><radialGradient id='g' cx='42%' cy='40%' r='80%'>"
      +"<stop offset='0' stop-color='rgb("+(c[0]+22)+","+(c[1]+12)+","+(c[2]+6)+")'/>"
      +"<stop offset='.55' stop-color='rgb("+c[0]+","+c[1]+","+c[2]+")'/>"
      +"<stop offset='1' stop-color='#0a0e13'/></radialGradient></defs>"
      +"<rect width='800' height='500' fill='url(#g)'/></svg>";
    return "data:image/svg+xml,"+encodeURIComponent(svg);
  }

  function addSrc(video,src,type){var s=document.createElement('source');s.src=src;s.type=type;video.appendChild(s);}

  /* ---- Build tiles ---- */
  var grid=document.getElementById('grid');
  var tiles=Array.prototype.slice.call(grid.querySelectorAll('.tile'));
  document.getElementById('work-count').textContent='// '+String(tiles.length).padStart(2,'0')+' projects';

  tiles.forEach(function(t,i){
    var posterFallback=genPoster(i);
    var poster=t.dataset.poster||posterFallback;
    var hasVideo=!!(t.dataset.srcMp4||t.dataset.srcWebm);
    var expandIco='<svg viewBox="0 0 12 12"><path d="M1 1h4v1.6H2.6V5H1zM7 1h4v4H9.4V2.6H7zM2.6 7v2.4H5V11H1V7zM9.4 7H11v4H7V9.4h2.4z"/></svg>';
    var playIco='<svg viewBox="0 0 12 12"><path d="M2 1l9 5-9 5z"/></svg>';
    t.innerHTML=
      '<div class="tile-frame">'+
        '<img class="poster" alt="'+t.dataset.title+'" loading="lazy" src="'+poster+'" onerror="this.onerror=null;this.src=\''+posterFallback+'\'">'+
        (hasVideo?'<video muted loop playsinline preload="none" poster="'+posterFallback+'"></video>':'')+
      '</div>'+
      '<span class="tile-tag">'+t.dataset.tag+'</span>'+
      '<span class="play-dot" aria-hidden="true">'+(hasVideo?playIco:expandIco)+'</span>'+
      '<div class="tile-body">'+
        '<h3>'+t.dataset.title+'</h3>'+
        '<div class="row">'+
          '<span class="slate">'+t.dataset.soft+'</span>'+
          '<span class="slate">'+t.dataset.role+'</span>'+
        '</div>'+
      '</div>';
  });

  /* ---- Category filter (derived from data-tag) ---- */
  var filters=document.getElementById('filters');
  var cats=['All'].concat(tiles.map(function(t){return t.dataset.tag;})
    .filter(function(v,i,a){return a.indexOf(v)===i;}));
  cats.forEach(function(cat,i){
    var b=document.createElement('button');
    b.type='button'; b.textContent=cat;
    b.setAttribute('aria-pressed', i===0?'true':'false');
    b.addEventListener('click',function(){
      filters.querySelectorAll('button').forEach(function(x){x.setAttribute('aria-pressed','false');});
      b.setAttribute('aria-pressed','true');
      tiles.forEach(function(t){
        t.classList.toggle('hidden', cat!=='All' && t.dataset.tag!==cat);
      });
      gridEqual();   // recompute rows/height after the visible set changes
    });
    filters.appendChild(b);
  });

  /* ---- Lazy-load + autoplay tile loops while on screen ---- */
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      var t=e.target, v=t.querySelector('video');
      if(!v) return;
      if(e.isIntersecting){
        if(!v.dataset.loaded){
          if(t.dataset.srcWebm) addSrc(v,t.dataset.srcWebm,'video/webm');
          if(t.dataset.srcMp4)  addSrc(v,t.dataset.srcMp4,'video/mp4');
          v.dataset.loaded='1';
          v.addEventListener('loadedmetadata',function(){ if(v.videoHeight>v.videoWidth*1.05){ t.dataset.orient='portrait'; } },{once:true});
          v.load();
        }
        if(v.querySelector('source')){t.classList.add('playing');var p=v.play();if(p)p.catch(function(){});}
      } else {
        t.classList.remove('playing'); v.pause();
      }
    });
  },{rootMargin:'100px',threshold:.1});

  tiles.forEach(function(t){
    io.observe(t);
    t.addEventListener('click',function(){openLB(t);});
    t.addEventListener('keydown',function(ev){if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();openLB(t);}});
  });

  /* ---- Expanding grid (desktop hover, organic push) ---- */
  var RATIO=0.625;   // 16:10 cells at rest
  var gridActive=false;
  function rand(a,b){ return a+Math.random()*(b-a); }
  function gridDesktop(){ return window.matchMedia('(min-width:1101px) and (hover:hover) and (pointer:fine)').matches; }
  function visTiles(){ return tiles.filter(function(t){return !t.classList.contains('hidden');}); }
  function gridGap(){ return parseFloat(getComputedStyle(grid).columnGap)||0; }
  function setGridHeight(r){
    var gap=gridGap();
    var colW=(grid.clientWidth-gap*2)/3;
    var rowH=colW*RATIO;
    grid.style.height=(r*rowH+(r-1)*gap)+'px';
  }
  function gridEqual(){
    if(!gridActive) return;
    var r=Math.max(1,Math.ceil(visTiles().length/3));
    grid.style.gridTemplateColumns='1fr 1fr 1fr';
    grid.style.gridTemplateRows=new Array(r).fill('1fr').join(' ');
    setGridHeight(r);
  }
  function gridExpand(t){
    if(!gridActive) return;
    var vis=visTiles(), vi=vis.indexOf(t);
    if(vi<0) return;
    var r=Math.max(1,Math.ceil(vis.length/3));
    var col=vi%3, row=Math.floor(vi/3), i, ct=[], rt=[];
    var portrait=(t.dataset.orient==='portrait');
    // Hovered cell: wide+short for landscape, tall+narrow for portrait media.
    // The other tracks are randomised so neighbours shrink to varied sizes
    // (fr normalises to the fixed grid box, so the whole set keeps its space).
    var Hc=portrait?0.95:2.20, Hr=portrait?3.40:1.35;
    var oc=portrait?[0.60,0.85]:[0.55,0.90];   // other columns
    var orow=portrait?[0.45,0.72]:[0.70,1.15]; // other rows
    for(i=0;i<3;i++) ct.push((i===col?Hc:rand(oc[0],oc[1])).toFixed(3)+'fr');
    for(i=0;i<r;i++) rt.push((i===row?Hr:rand(orow[0],orow[1])).toFixed(3)+'fr');
    grid.style.gridTemplateColumns=ct.join(' ');
    grid.style.gridTemplateRows=rt.join(' ');
  }
  function gridSync(){
    var want=gridDesktop();
    if(want&&!gridActive){ gridActive=true; grid.classList.add('expandable'); gridEqual(); }
    else if(!want&&gridActive){ gridActive=false; grid.classList.remove('expandable'); grid.style.gridTemplateColumns=''; grid.style.gridTemplateRows=''; grid.style.height=''; }
    else if(want&&gridActive){ gridEqual(); }
  }
  tiles.forEach(function(t){ t.addEventListener('mouseenter',function(){ gridExpand(t); }); });
  grid.addEventListener('mouseleave',gridEqual);
  var resizeT;
  window.addEventListener('resize',function(){ clearTimeout(resizeT); resizeT=setTimeout(gridSync,150); },{passive:true});
  gridSync();
  window.addEventListener('load',gridSync);
  if(document.fonts && document.fonts.ready){ document.fonts.ready.then(gridSync); }

  /* ---- Hero video lazy load ---- */
  var hv=document.getElementById('hero-video');
  var hio=new IntersectionObserver(function(en){
    en.forEach(function(e){
      if(e.isIntersecting && !hv.dataset.loaded){
        if(hv.dataset.srcWebm) addSrc(hv,hv.dataset.srcWebm,'video/webm');
        if(hv.dataset.srcMp4)  addSrc(hv,hv.dataset.srcMp4,'video/mp4');
        hv.dataset.loaded='1';
        if(hv.querySelector('source')){hv.load();var p=hv.play();if(p)p.catch(function(){});}
      }
    });
  });
  hio.observe(hv);

  /* ---- Lightbox ---- */
  var lb=document.getElementById('lb'), lbv=document.getElementById('lb-video'), lbi=document.getElementById('lb-img');
  function openLB(t){
    document.getElementById('lb-title').textContent=t.dataset.title;
    document.getElementById('lb-soft').textContent=t.dataset.soft;
    document.getElementById('lb-role').textContent=t.dataset.role;
    var hasVideo=!!(t.dataset.srcMp4||t.dataset.srcWebm);
    lbv.innerHTML='';
    if(hasVideo){
      lbi.style.display='none'; lbv.style.display='';
      if(t.dataset.srcWebm) addSrc(lbv,t.dataset.srcWebm,'video/webm');
      if(t.dataset.srcMp4)  addSrc(lbv,t.dataset.srcMp4,'video/mp4');
      var tv=t.querySelector('video'); if(tv) lbv.poster=tv.poster;
      lbv.load();
    } else {
      lbv.style.display='none'; lbi.style.display='';
      lbi.src=t.dataset.img||t.dataset.poster||''; lbi.alt=t.dataset.title;
    }
    lb.classList.add('open');document.body.style.overflow='hidden';
    document.getElementById('lb-close').focus();
  }
  function closeLB(){lb.classList.remove('open');lbv.pause();lbi.removeAttribute('src');document.body.style.overflow='';}
  document.getElementById('lb-close').addEventListener('click',closeLB);
  lb.addEventListener('click',function(e){if(e.target===lb)closeLB();});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&lb.classList.contains('open'))closeLB();});

  /* ---- Nav scroll state ---- */
  var nav=document.getElementById('nav');
  window.addEventListener('scroll',function(){nav.classList.toggle('scrolled',window.scrollY>40);},{passive:true});

  /* ---- Active nav link (scroll spy) ---- */
  var navLinks=Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));
  var spyTargets=['work','about','contact'].map(function(id){return document.getElementById(id);}).filter(Boolean);
  if(spyTargets.length){
    var spy=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(e.isIntersecting){
          navLinks.forEach(function(a){ a.classList.toggle('active', a.getAttribute('href')==='#'+e.target.id); });
        }
      });
    },{rootMargin:'-45% 0px -50% 0px',threshold:0});
    spyTargets.forEach(function(s){ spy.observe(s); });
  }

  /* ---- Scroll reveal (sections + staggered tiles) ----
     Elements opt in with [data-reveal] in the HTML; tiles are staggered.
     The hidden state lives in CSS under html.js, so it never flashes. */
  var revealEls=Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  tiles.forEach(function(t,i){ t.style.transitionDelay=((i%3)*70)+'ms'; });
  if(reduceMotion){
    revealEls.forEach(function(el){ el.classList.add('in'); });
  } else {
    var rio=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(e.isIntersecting){
          var el=e.target;
          el.classList.add('in');
          setTimeout(function(){ el.style.transitionDelay=''; },1000);
          rio.unobserve(el);
        }
      });
    },{rootMargin:'0px 0px -8% 0px',threshold:.08});
    revealEls.forEach(function(el){ rio.observe(el); });
  }

  document.getElementById('yr').textContent=new Date().getFullYear();
})();
