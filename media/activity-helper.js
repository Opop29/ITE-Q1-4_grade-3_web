(function(){
  // Activity helper: adds Set Activity UI, persists to localStorage, and makes final Next proceed to activity
  function findQ(){ if(typeof window.Q==='number') return window.Q; for(const s of document.scripts){ const m = s.textContent && s.textContent.match(/\bconst\s+Q\s*=\s*(\d+)/); if(m) return Number(m[1]); } return 1; }
  const Q = findQ();
  function activityKey(i){return `science-q${Q}-comp-${i}-activity`;}
  let activityCurrentComp = null;

  function ensureUI(){
    const modal = document.getElementById('modal'); if(!modal) return;
    const deck = modal.querySelector('.deck'); if(!deck) return;
    if(!document.getElementById('activityForm')){
      const form = document.createElement('div');
      form.id='activityForm'; form.style.display='none'; form.style.padding='24px'; form.style.overflow='auto';
      form.innerHTML = `
        <h2 style="margin-top:0">Set Activity</h2>
        <label style="display:block;margin:8px 0;font-weight:900">Title
          <input id="activityTitle" style="width:100%;padding:10px;margin-top:6px;border:2px solid #111;border-radius:8px">
        </label>
        <label style="display:block;margin:8px 0;font-weight:900">Description
          <textarea id="activityDesc" rows="6" style="width:100%;padding:10px;margin-top:6px;border:2px solid #111;border-radius:8px"></textarea>
        </label>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px;">
          <button id="cancelActivity" style="padding:8px 12px;border:2px solid #111;border-radius:8px;background:#fff">Cancel</button>
          <button id="saveActivity" style="padding:8px 12px;border:2px solid #111;border-radius:8px;background:#4bd86b;font-weight:900">Save Activity</button>
        </div>`;
      deck.appendChild(form);
      form.querySelector('#cancelActivity').addEventListener('click', ()=>{ form.style.display='none'; const slides=document.getElementById('slides'); if(slides) slides.style.display='block'; const f=document.querySelector('.footer'); if(f) f.style.display='flex'; });
      form.querySelector('#saveActivity').addEventListener('click', ()=>{ const t = (document.getElementById('activityTitle')||{value:''}).value.trim(); const d = (document.getElementById('activityDesc')||{value:''}).value.trim(); if(!t && !d){ alert('Please enter title or description'); return; } localStorage.setItem(activityKey(activityCurrentComp), JSON.stringify({title:t,desc:d,ts:Date.now()})); openActivityView(); });
    }
    if(!document.getElementById('activityView')){
      const view = document.createElement('div'); view.id='activityView'; view.style.display='none'; view.style.padding='24px'; view.style.overflow='auto';
      view.innerHTML = `
        <h2 id="activityViewTitle" style="margin-top:0"></h2>
        <div id="activityViewDesc" style="white-space:pre-wrap;margin-top:8px"></div>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px;">
          <button id="backToSlides" style="padding:8px 12px;border:2px solid #111;border-radius:8px;background:#fff;font-weight:900">Back to Slides</button>
        </div>`;
      deck.appendChild(view);
      view.querySelector('#backToSlides').addEventListener('click', ()=>{ view.style.display='none'; const slides=document.getElementById('slides'); if(slides) slides.style.display='block'; const f=document.querySelector('.footer'); if(f) f.style.display='flex'; });
    }

    const footer = deck.querySelector('.footer') || deck.querySelector('.footer'); // some pages place footer inside .deck
    const footerElem = document.querySelector('.footer') || footer;
    if(footerElem){
      const controls = footerElem.querySelector('.controls'); if(!controls) return;
      if(!document.getElementById('nextBtn')){
        const next = document.createElement('button'); next.id='nextBtn'; next.textContent='Next →'; next.addEventListener('click', ()=>{ handleNextClick(); }); controls.appendChild(next);
      }
      if(!document.getElementById('setActivityBtn')){
        const setBtn = document.createElement('button'); setBtn.id='setActivityBtn'; setBtn.style.marginLeft='8px'; setBtn.style.padding='6px 8px'; setBtn.style.border='2px solid #111'; setBtn.style.borderRadius='8px'; setBtn.style.background='#fff'; setBtn.style.fontWeight='900'; setBtn.textContent='Set Activity'; setBtn.addEventListener('click', ()=>{ if(activityCurrentComp===null) return; openActivityForm(activityCurrentComp); }); controls.appendChild(setBtn);
      }
    }
  }

  function findActiveIndex(){ const nodes = document.querySelectorAll('#slides .slide'); for(let i=0;i<nodes.length;i++){ if(nodes[i].classList.contains('active')) return i; } return 0; }

  function updateNextButton(){ const nextBtn = document.getElementById('nextBtn'); const nodes=document.querySelectorAll('#slides .slide'); if(!nextBtn || nodes.length===0) return; const idx = findActiveIndex(); if(idx===nodes.length-1) nextBtn.textContent='Proceed to Activity'; else nextBtn.textContent='Next →'; }

  function handleNextClick(){ const nodes=document.querySelectorAll('#slides .slide'); if(nodes.length===0){ if(typeof window.nextSlide==='function') window.nextSlide(); return; } const idx=findActiveIndex(); if(idx < nodes.length-1){ if(typeof window.nextSlide==='function') window.nextSlide(); } else { // last slide
      if(activityExists(activityCurrentComp)){ openActivityView(); } else { openActivityForm(activityCurrentComp); }
    } }

  function activityExists(i){ return !!localStorage.getItem(activityKey(i)); }
  function loadActivity(i){ const raw = localStorage.getItem(activityKey(i)); if(!raw) return null; try{ return JSON.parse(raw);}catch(e){return null;} }

  function openActivityForm(i){ activityCurrentComp = i; ensureUI(); document.getElementById('activityForm').style.display='block'; document.getElementById('activityView') && (document.getElementById('activityView').style.display='none'); document.getElementById('slides') && (document.getElementById('slides').style.display='none'); document.querySelector('.footer') && (document.querySelector('.footer').style.display='none'); const raw = loadActivity(i); if(raw){ document.getElementById('activityTitle').value = raw.title||''; document.getElementById('activityDesc').value = raw.desc||''; } else { document.getElementById('activityTitle').value=''; document.getElementById('activityDesc').value=''; } }

  function openActivityView(){ ensureUI(); const raw = loadActivity(activityCurrentComp); if(!raw){ openActivityForm(activityCurrentComp); return; } document.getElementById('activityForm') && (document.getElementById('activityForm').style.display='none'); document.getElementById('slides') && (document.getElementById('slides').style.display='none'); document.querySelector('.footer') && (document.querySelector('.footer').style.display='none'); document.getElementById('activityViewTitle').textContent = raw.title||'Activity'; document.getElementById('activityViewDesc').textContent = raw.desc||''; document.getElementById('activityView').style.display='block'; }

  // intercept openDeck to capture current competency
  function wrapOpenDeck(){ if(typeof window.openDeck !== 'function') return; const orig = window.openDeck; window.openDeck = function(i){ activityCurrentComp = i; orig(i); ensureUI(); updateNextButton(); }; }

  // observe slide changes
  function observeSlides(){ const slidesRoot = document.getElementById('slides'); if(!slidesRoot) return; const mo = new MutationObserver(()=>{ updateNextButton(); }); mo.observe(slidesRoot, {attributes:true, childList:true, subtree:true}); // also track class changes
  }

  function attachToExistingOpenButtons(){ document.querySelectorAll('.competency').forEach((el,i)=>{ const open = el.querySelector('.open'); if(open){ open.addEventListener('click', (e)=>{ activityCurrentComp = i; setTimeout(()=>{ ensureUI(); updateNextButton(); },50); }); } }); }
  // expose functions for inline handlers
  window.openActivityForm = function(i){ if(typeof i === 'undefined' || i === null){ i = window.currentComp || activityCurrentComp; } return openActivityForm(i); };
  window.openActivityView = function(){ return openActivityView(); };
  window.activityExists = function(i){ return activityExists(i); };
  window.activityHelperEnsureUI = function(){ ensureUI(); };
  window.closeActivityForm = function(){ const f = document.getElementById('activityForm'); if(f) f.style.display='none'; const slides=document.getElementById('slides'); if(slides) slides.style.display='block'; const foot=document.querySelector('.footer'); if(foot) foot.style.display='flex'; };
  window.backToSlides = function(){ const v = document.getElementById('activityView'); if(v) v.style.display='none'; const slides=document.getElementById('slides'); if(slides) slides.style.display='block'; const foot=document.querySelector('.footer'); if(foot) foot.style.display='flex'; };

  document.addEventListener('DOMContentLoaded', ()=>{ ensureUI(); wrapOpenDeck(); attachToExistingOpenButtons(); observeSlides(); setTimeout(()=>{ ensureUI(); wrapOpenDeck(); },300); });
})();
