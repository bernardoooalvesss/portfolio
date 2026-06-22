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
          v.dataset.loaded='1'; v.load();
        }
        if(v.querySelector('source')){t.classList.add('playing');var p=v.play();if(p)p.catch(function(){});}
      } else {
        t.classList.remove('playing'); v.pause();
      }
    });
  },{rootMargin:'100px',threshold:.1});

  tiles.forEach(function(t){ io.observe(t); });

  /* ---- Click preview overlay: the video at its native aspect ratio (no black
     bars, no crop) with the project info beside it. Opens on click/tap, closes
     on the backdrop, the close button or Esc. Always fitted to the viewport and
     never upscaled beyond native size. ---- */
  var pv=document.getElementById('preview');
  if(pv){
    var pVideo=pv.querySelector('video'),
        pImg=pv.querySelector('img'),
        pMedia=pv.querySelector('.preview-media'),
        pCard=pv.querySelector('.preview-card'),
        pTag=pv.querySelector('.p-tag'),
        pTitle=pv.querySelector('.p-title'),
        pNote=pv.querySelector('.p-note-text'),
        pRole=pv.querySelector('.p-role'),
        current=null, hideT=0;

    function nativeOf(t){
      var v=t.querySelector('video');
      if(v && v.videoWidth) return {w:v.videoWidth, h:v.videoHeight};
      var im=t.querySelector('img.poster');
      if(im && im.naturalWidth) return {w:im.naturalWidth, h:im.naturalHeight};
      return {w:1920, h:1200};
    }
    function sizeMedia(n){
      var vw=window.innerWidth, vh=window.innerHeight, pad=48, infoW=300;
      var aspect=n.w/n.h;
      var maxH=Math.min(vh-pad*2, Math.round(vh*0.7), 660);    // keep the overlay compact
      var mh=Math.min(maxH, (vw-pad*2-infoW)/aspect, n.h);     // fit viewport, never upscale
      pMedia.style.width=Math.round(mh*aspect)+'px';
      pMedia.style.height=Math.round(mh)+'px';
    }
    function openPreview(t){
      clearTimeout(hideT); current=t;
      pTag.textContent=t.dataset.tag||'';
      pTitle.textContent=t.dataset.title||'';
      pNote.textContent=t.dataset.note||'';
      if(pRole) pRole.textContent=t.dataset.role||'—';
      var hasVideo=!!(t.dataset.srcMp4||t.dataset.srcWebm);
      if(hasVideo){
        pImg.style.display='none'; pVideo.style.display='';
        var src=t.dataset.srcMp4||t.dataset.srcWebm;
        if(pVideo.getAttribute('src')!==src){ pVideo.setAttribute('src',src); }
        var sv=t.querySelector('video'); if(sv) pVideo.poster=sv.poster;
        var p=pVideo.play(); if(p)p.catch(function(){});
      } else {
        pVideo.style.display='none'; pImg.style.display='';
        pImg.src=t.dataset.img||t.dataset.poster||'';
      }
      sizeMedia(nativeOf(t));
      pv.classList.add('open'); pv.setAttribute('aria-hidden','false');
      document.body.classList.add('no-scroll');
    }
    function closePreview(){
      if(!pv.classList.contains('open')) return;
      pv.classList.remove('open'); pv.setAttribute('aria-hidden','true');
      document.body.classList.remove('no-scroll'); current=null;
      hideT=setTimeout(function(){ try{pVideo.pause();}catch(e){} },340);
    }

    tiles.forEach(function(t){
      t.style.cursor='pointer';
      t.setAttribute('tabindex','0');
      t.setAttribute('role','button');
      t.addEventListener('click',function(){ openPreview(t); });
      t.addEventListener('keydown',function(e){
        if(e.key==='Enter'||e.key===' '){ e.preventDefault(); openPreview(t); }
      });
    });

    // close on backdrop click (outside the card), close button, or Esc
    pv.addEventListener('click',function(e){ if(!pCard.contains(e.target)) closePreview(); });
    var closeBtn=document.getElementById('preview-close');
    if(closeBtn) closeBtn.addEventListener('click',closePreview);
    document.addEventListener('keydown',function(e){ if(e.key==='Escape') closePreview(); });
    window.addEventListener('resize',function(){ if(current) sizeMedia(nativeOf(current)); },{passive:true});
  }

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

  /* ---- Living 3D blob (corner widget, follows the whole page) ----
     A cloud of points spread over a sphere (Fibonacci distribution), whose
     radius churns with layered sine "noise" — a round, organic, breathing
     blob. No wireframe lines: just dots + a soft glowing core. ---- */
  (function(){
    var cv=document.getElementById('solid');
    if(!cv) return;
    var ctx=cv.getContext('2d');
    var dpr=Math.min(window.devicePixelRatio||1,2);
    var SIZE=(window.matchMedia('(max-width:640px)').matches)?38:46;
    cv.width=SIZE*dpr; cv.height=SIZE*dpr;

    var N=170, GA=Math.PI*(3-Math.sqrt(5)), dirs=[];
    for(var k=0;k<N;k++){
      var y=1-2*(k+0.5)/N, rr=Math.sqrt(Math.max(0,1-y*y)), ph=k*GA;
      dirs.push([rr*Math.cos(ph), y, rr*Math.sin(ph)]);
    }

    var EMBER=[127,184,216], R=SIZE*0.24*dpr, CX=cv.width/2, CY=cv.height/2;

    function blobR(p,t){
      return 1
        + 0.24*Math.sin(2.0*p[0] + t*1.3)
        + 0.22*Math.sin(1.9*p[1] + t*1.6 + 1.7)
        + 0.18*Math.sin(2.3*p[2] + t*1.1 + 3.1)
        + 0.12*Math.sin(3.4*(p[0]+p[1]) - t*1.9)
        + 0.10*Math.sin(3.1*(p[1]+p[2]) + t*2.2);
    }

    function render(t,ax,ay){
      var cosx=Math.cos(ax),sinx=Math.sin(ax),cosy=Math.cos(ay),siny=Math.sin(ay);
      var pts=dirs.map(function(d){
        var r=blobR(d,t), x=d[0]*r, y=d[1]*r, z=d[2]*r;
        var x1=x*cosy+z*siny, z1=-x*siny+z*cosy;
        var y2=y*cosx-z1*sinx, z2=y*sinx+z1*cosx;
        return [CX+x1*R, CY-y2*R, z2];
      });
      pts.sort(function(a,b){return a[2]-b[2];});   // back-to-front
      ctx.clearRect(0,0,cv.width,cv.height);
      // soft core for body
      var core=ctx.createRadialGradient(CX,CY,0,CX,CY,R*1.25);
      core.addColorStop(0,'rgba('+EMBER[0]+','+EMBER[1]+','+EMBER[2]+',0.16)');
      core.addColorStop(1,'rgba('+EMBER[0]+','+EMBER[1]+','+EMBER[2]+',0)');
      ctx.fillStyle=core;
      ctx.beginPath();ctx.arc(CX,CY,R*1.25,0,6.2832);ctx.fill();
      // dots
      pts.forEach(function(p){
        var depth=(p[2]+1.4)/2.8; if(depth<0)depth=0; if(depth>1)depth=1;
        var rad=(0.7+1.5*depth)*dpr, a=0.18+0.72*depth;
        ctx.fillStyle='rgba('+EMBER[0]+','+EMBER[1]+','+EMBER[2]+','+a.toFixed(3)+')';
        ctx.beginPath();ctx.arc(p[0],p[1],rad,0,6.2832);ctx.fill();
      });
    }

    if(reduceMotion){
      render(0,0.5,0.6);
    } else {
      (function frame(now){
        var sy=window.scrollY||0;
        var t=now*0.0016;
        var ay=now*0.00045 + sy*0.003;
        var ax=0.45 + Math.sin(now*0.0003)*0.18 + sy*0.0005;
        render(t,ax,ay);
        requestAnimationFrame(frame);
      })(performance.now());
    }

    // the "scroll" hint only makes sense at the top — fade it once we move down
    var label=document.querySelector('#scrollcue .slate');
    if(label) window.addEventListener('scroll',function(){
      label.style.opacity=(window.scrollY>180)?'0':'0.7';
    },{passive:true});
  })();

  /* ---- Email compose chooser ----
     A visitor's webmail can't be detected, so any mailto link opens a small
     menu instead: pick Gmail / Outlook / the default mail app, and a new
     message — already addressed to me — opens in that service. ---- */
  (function(){
    var ADDR='bernardoalves3d@gmail.com';
    var compose={
      gmail:'https://mail.google.com/mail/?view=cm&fs=1&to='+encodeURIComponent(ADDR),
      outlook:'https://outlook.office.com/mail/deeplink/compose?to='+encodeURIComponent(ADDR),
      app:'mailto:'+ADDR
    };
    var menu=null, anchorEl=null;
    function close(){
      if(!menu) return;
      menu.classList.remove('open');
      var m=menu; menu=null; anchorEl=null;
      setTimeout(function(){ if(m&&m.parentNode) m.parentNode.removeChild(m); },180);
      document.removeEventListener('keydown',onKey,true);
    }
    function onKey(e){ if(e.key==='Escape') close(); }
    function place(){
      if(!menu||!anchorEl) return;
      var r=anchorEl.getBoundingClientRect(), mw=menu.offsetWidth, mh=menu.offsetHeight, pad=12;
      var left=Math.max(pad, Math.min(r.left, window.innerWidth-mw-pad));
      var top=r.bottom+8;
      if(top+mh>window.innerHeight-pad) top=Math.max(pad, r.top-mh-8);
      menu.style.left=Math.round(left)+'px';
      menu.style.top=Math.round(top)+'px';
    }
    function open(anchor){
      close(); anchorEl=anchor;
      menu=document.createElement('div');
      menu.className='mail-menu'; menu.setAttribute('role','menu');
      menu.innerHTML=
        '<span class="mail-menu-h">Open a new email to me</span>'+
        '<a role="menuitem" href="'+compose.gmail+'" target="_blank" rel="noopener">Gmail</a>'+
        '<a role="menuitem" href="'+compose.outlook+'" target="_blank" rel="noopener">Outlook</a>'+
        '<a role="menuitem" href="'+compose.app+'">Default mail app</a>'+
        '<button role="menuitem" type="button" data-copy>Copy address</button>';
      document.body.appendChild(menu);
      place();
      requestAnimationFrame(function(){ if(menu) menu.classList.add('open'); });
      var copyBtn=menu.querySelector('[data-copy]');
      copyBtn.addEventListener('click',function(e){
        e.stopPropagation();
        var ok=function(){ copyBtn.textContent='Copied ✓'; setTimeout(close,750); };
        if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(ADDR).then(ok,ok); }
        else { ok(); }
      });
      menu.querySelectorAll('a').forEach(function(a){ a.addEventListener('click',function(){ setTimeout(close,0); }); });
      document.addEventListener('keydown',onKey,true);
    }
    document.addEventListener('click',function(e){
      var a=e.target.closest&&e.target.closest('a[href^="mailto:"]');
      if(a){ e.preventDefault(); open(a); return; }
      if(menu && !menu.contains(e.target)) close();
    },false);
    window.addEventListener('resize',place,{passive:true});
    window.addEventListener('scroll',function(){ if(menu) close(); },{passive:true});
  })();

  document.getElementById('yr').textContent=new Date().getFullYear();
})();
