/* ==========================================================================
   Azentio Finance — shared interactions / micro-interactions
   ========================================================================== */

function goBack(){ history.length>1 ? history.back() : (location.href='index.html'); }

/* ---------- ripple effect on buttons ---------- */
function initRipple(){
  document.querySelectorAll('.btn, .icon-btn, .keypad button, .list-item, .card.tappable').forEach(el=>{
    el.addEventListener('click', function(e){
      const r = document.createElement('span');
      r.className='ripple';
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      r.style.width = r.style.height = size+'px';
      r.style.left = (e.clientX - rect.left - size/2)+'px';
      r.style.top = (e.clientY - rect.top - size/2)+'px';
      this.style.position = this.style.position || 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(r);
      setTimeout(()=>r.remove(), 600);
    });
  });
}

/* ---------- page transition on internal nav links ---------- */
function initPageTransitions(){
  document.querySelectorAll('a[data-nav], .btn[data-href], .bottom-nav a').forEach(el=>{
    el.addEventListener('click', function(e){
      const href = this.getAttribute('href') || this.dataset.href;
      if(!href || href.startsWith('#')) return;
      e.preventDefault();
      const proceed = ()=>{
        const page = document.querySelector('.page');
        if(page){ page.classList.add('page-exit'); }
        setTimeout(()=>{ location.href = href; }, 180);
      };
      const confirmMsg = this.dataset.confirm;
      if(confirmMsg){
        showConfirmDialog(confirmMsg, this.dataset.confirmLabel).then(ok=>{ if(ok) proceed(); });
      } else {
        proceed();
      }
    });
  });
}

/* ---------- in-app confirm dialog (replaces native browser confirm()) ---------- */
function showConfirmDialog(message, confirmLabel){
  return new Promise(resolve=>{
    const host = document.querySelector('.screen') || document.body;
    const backdrop = document.createElement('div');
    backdrop.className = 'confirm-backdrop';
    backdrop.innerHTML = `
      <div class="confirm-card">
        <div class="confirm-title">Are you sure?</div>
        <div class="confirm-msg">${message}</div>
        <div class="confirm-actions">
          <button type="button" class="confirm-btn-danger" data-confirm-ok>${confirmLabel || 'Continue'}</button>
          <button type="button" class="confirm-btn-cancel" data-confirm-cancel>Cancel</button>
        </div>
      </div>`;
    host.appendChild(backdrop);
    requestAnimationFrame(()=> backdrop.classList.add('open'));
    function cleanup(result){
      backdrop.classList.remove('open');
      setTimeout(()=> backdrop.remove(), 200);
      resolve(result);
    }
    backdrop.querySelector('[data-confirm-ok]').addEventListener('click', ()=> cleanup(true));
    backdrop.querySelector('[data-confirm-cancel]').addEventListener('click', ()=> cleanup(false));
    backdrop.addEventListener('click', e=>{ if(e.target===backdrop) cleanup(false); });
  });
}

/* ---------- floating select / chip groups ---------- */
function initChips(){
  document.querySelectorAll('.chip-group').forEach(group=>{
    group.querySelectorAll('.chip').forEach(chip=>{
      chip.addEventListener('click', ()=>{
        group.querySelectorAll('.chip').forEach(c=>c.classList.remove('on'));
        chip.classList.add('on');
      });
    });
  });
}

/* ---------- custom checkbox rows ---------- */
function initCheckRows(){
  document.querySelectorAll('.check-row').forEach(row=>{
    row.addEventListener('click', (e)=>{
      row.classList.toggle('checked');
      updateContinueState();
    });
  });
}
function updateContinueState(){
  const requireAll = document.querySelectorAll('.check-row[data-required]');
  if(!requireAll.length) return;
  const btn = document.querySelector('[data-requires-consent]');
  if(!btn) return;
  const allChecked = Array.from(requireAll).every(r=>r.classList.contains('checked'));
  btn.toggleAttribute('disabled', !allChecked);
}

/* ---------- iOS-style switch + conditional reveal ---------- */
function initSwitches(){
  document.querySelectorAll('[data-switch]').forEach(sw=>{
    sw.addEventListener('click', ()=>{
      const on = !sw.classList.contains('on');
      sw.classList.toggle('on', on);
      sw.setAttribute('aria-checked', on ? 'true' : 'false');
      const key = sw.dataset.switch;
      const reveal = document.querySelector(`[data-reveal="${key}"]`);
      if(reveal) reveal.classList.toggle('open', on);
    });
  });
}

/* ---------- numeric stepper (+/-) ---------- */
function initNumericSteppers(){
  document.querySelectorAll('[data-stepper]').forEach(wrap=>{
    const valEl = wrap.querySelector('[data-step-value]');
    const min = Number(wrap.dataset.min ?? 0);
    const max = Number(wrap.dataset.max ?? 99);
    let value = Number(wrap.dataset.value ?? 0);
    const minusBtn = wrap.querySelector('[data-step="-1"]');
    const plusBtn = wrap.querySelector('[data-step="1"]');
    function render(){
      valEl.textContent = value;
      minusBtn.disabled = value<=min;
      plusBtn.disabled = value>=max;
    }
    wrap.querySelectorAll('button[data-step]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        value = Math.min(max, Math.max(min, value + Number(btn.dataset.step)));
        render();
      });
    });
    render();
  });
}

/* ---------- PIN keypad ---------- */
function isWeakPin(digits){
  if(digits.every(d=>d===digits[0])) return true; // e.g. 000000
  const nums = digits.map(Number);
  let ascending = true, descending = true;
  for(let i=1;i<nums.length;i++){
    if(nums[i] !== nums[i-1]+1) ascending = false;
    if(nums[i] !== nums[i-1]-1) descending = false;
  }
  return ascending || descending; // e.g. 123456 or 654321
}

function initPin(){
  const pad = document.querySelector('.keypad');
  const dotsWrap = document.querySelector('.pin-dots');
  const status = document.querySelector('[data-pin-status]');
  if(!pad || !dotsWrap) return;
  const dots = Array.from(dotsWrap.querySelectorAll('span'));
  const nextHref = pad.dataset.next;
  const isConfirm = pad.dataset.confirm === '1';
  const isLogin = pad.dataset.confirm === 'login';
  let val = [];
  let locked = false;

  function setStatus(msg, isError){
    if(!status) return;
    status.textContent = msg || '';
    status.classList.toggle('error', !!isError);
  }

  function resetPin(){
    val = [];
    dots.forEach(d=> d.classList.remove('filled'));
  }

  function shakeAndReset(msg){
    locked = true;
    setStatus(msg, true);
    dotsWrap.classList.add('shake');
    dots.forEach(d=> d.classList.add('error'));
    setTimeout(()=>{
      dotsWrap.classList.remove('shake');
      dots.forEach(d=> d.classList.remove('error'));
      resetPin();
      locked = false;
    }, 500);
  }

  pad.querySelectorAll('button').forEach(b=>{
    b.addEventListener('click', ()=>{
      if(locked) return;
      const key = b.dataset.key;
      if(key==='back'){ val.pop(); setStatus(''); }
      else if(key!==''){ if(val.length<dots.length) val.push(key); }
      dots.forEach((d,i)=> d.classList.toggle('filled', i<val.length));
      if(val.length===dots.length){
        if(isConfirm){
          const original = sessionStorage.getItem('azf_pin_tmp') || '';
          if(val.join('') !== original){
            setTimeout(()=> shakeAndReset("PINs don't match. Try again."), 150);
            return;
          }
          sessionStorage.removeItem('azf_pin_tmp');
          setStatus('PIN confirmed', false);
        } else if(isLogin){
          setStatus('PIN verified', false);
        } else if(isWeakPin(val)){
          setTimeout(()=> shakeAndReset('Avoid easy-to-guess PINs like 123456 or 000000.'), 150);
          return;
        } else {
          sessionStorage.setItem('azf_pin_tmp', val.join(''));
        }
        setTimeout(()=>{
          if(nextHref){
            const page = document.querySelector('.page');
            if(page) page.classList.add('page-exit');
            setTimeout(()=> location.href = nextHref, 220);
          }
        }, 350);
      }
    });
  });
}

/* ---------- biometric login (tap-to-scan simulation) ---------- */
function initBiometricLogin(){
  const trigger = document.querySelector('[data-biometric-trigger]');
  if(!trigger) return;
  const ring = document.querySelector('[data-scan-ring]');
  const title = document.querySelector('[data-scan-title]');
  const sub = document.querySelector('[data-scan-sub]');
  const nextHref = trigger.dataset.next;
  const checkIcon = '<svg viewBox="0 0 24 24" width="42" height="42" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path class="check-draw" d="M5 13l4 4 10-10"/></svg>';
  let done = false;

  trigger.addEventListener('click', ()=>{
    if(done) return;
    done = true;
    trigger.classList.add('scanning');
    if(sub) sub.textContent = 'Scanning…';
    setTimeout(()=>{
      trigger.classList.remove('scanning');
      trigger.classList.add('scan-success');
      trigger.innerHTML = checkIcon;
      if(ring) ring.classList.remove('scan');
      if(title) title.textContent = 'Fingerprint recognized!';
      if(sub) sub.textContent = 'Redirecting…';
      setTimeout(()=>{
        if(nextHref){
          const page = document.querySelector('.page');
          if(page) page.classList.add('page-exit');
          setTimeout(()=> location.href = nextHref, 220);
        }
      }, 500);
    }, 900);
  });
}

/* ---------- OTP code input (auto-advance, paste support, auto-verify) ---------- */
function initOtpInputs(){
  const wrap = document.querySelector('[data-otp]');
  if(!wrap) return;
  const boxes = Array.from(wrap.querySelectorAll('.otp-box'));
  const status = document.querySelector('[data-otp-status]');
  const nextHref = wrap.dataset.next;
  let verifying = false;

  function goNext(){
    if(!nextHref || verifying) return;
    verifying = true;
    if(status){ status.textContent = 'Verifying…'; status.classList.remove('error'); }
    setTimeout(()=>{
      const page = document.querySelector('.page');
      if(page) page.classList.add('page-exit');
      setTimeout(()=> location.href = nextHref, 220);
    }, 500);
  }

  function checkComplete(){
    if(boxes.every(b=>b.value)) goNext();
  }

  boxes.forEach((box,i)=>{
    box.addEventListener('input', ()=>{
      box.value = box.value.replace(/\D/g,'').slice(-1);
      box.classList.toggle('filled', !!box.value);
      if(box.value && boxes[i+1]) boxes[i+1].focus();
      checkComplete();
    });
    box.addEventListener('keydown', e=>{
      if(e.key==='Backspace' && !box.value && boxes[i-1]){ boxes[i-1].focus(); }
    });
    box.addEventListener('paste', e=>{
      e.preventDefault();
      const digits = (e.clipboardData.getData('text')||'').replace(/\D/g,'').slice(0,boxes.length);
      digits.split('').forEach((d,idx)=>{ if(boxes[idx]){ boxes[idx].value=d; boxes[idx].classList.add('filled'); } });
      const last = boxes[Math.min(digits.length,boxes.length)-1];
      if(last) last.focus();
      checkComplete();
    });
  });

  if(boxes[0]) boxes[0].focus();
}

/* ---------- countdown timers (with resend / expiry fallback) ---------- */
function initCountdowns(){
  document.querySelectorAll('[data-countdown]').forEach(el=>{
    let [m,s] = el.dataset.countdown.split(':').map(Number);
    let total = m*60+s;
    const fallback = el.dataset.expiredText || 'Code expired — please request a new one';
    const timer = setInterval(()=>{
      total--;
      if(total<=0){
        clearInterval(timer);
        el.innerHTML = `<span style="color:var(--danger)">${fallback}</span> <button class="btn-link" style="display:inline;padding:0;" onclick="location.reload()">Resend</button>`;
        return;
      }
      const mm = String(Math.floor(total/60)).padStart(2,'0');
      const ss = String(total%60).padStart(2,'0');
      el.querySelector('.cd-time') ? el.querySelector('.cd-time').textContent = `${mm}:${ss}` : el.textContent = `${mm}:${ss}`;
    },1000);
  });
}

/* ---------- sequential skeleton / processing reveal ---------- */
function initProcessing(){
  const rows = document.querySelectorAll('.skel-row[data-delay]');
  if(!rows.length) return;
  rows.forEach(row=>{
    const delay = Number(row.dataset.delay);
    setTimeout(()=>{
      const check = row.querySelector('.skel-check');
      const txt = row.querySelector('.skel-txt');
      check.classList.remove('pending'); check.classList.add('active');
      check.innerHTML = '<span class="spinner" style="width:10px;height:10px;border-width:2px;"></span>';
      setTimeout(()=>{
        check.classList.remove('active'); check.classList.add('done');
        check.innerHTML = '✓';
        txt.classList.add('done');
      }, 900);
    }, delay);
  });
  const autoNext = document.querySelector('[data-auto-continue]');
  if(autoNext){
    const total = Math.max(...Array.from(rows).map(r=>Number(r.dataset.delay))) + 1100;
    setTimeout(()=>{ autoNext.removeAttribute('disabled'); autoNext.classList.add('pulse-ready'); }, total);
  }
}

/* ---------- toast ---------- */
function showToast(msg){
  let t = document.querySelector('.toast');
  if(!t){
    t = document.createElement('div');
    t.className='toast';
    document.querySelector('.screen').appendChild(t);
  }
  t.textContent = msg;
  requestAnimationFrame(()=> t.classList.add('show'));
  setTimeout(()=> t.classList.remove('show'), 2400);
}

/* ---------- input masks (live formatting as you type) ---------- */
function applyMask(inp){
  const mask = inp.dataset.mask;
  if(mask==='mobile-sa'){
    let digits = inp.value.replace(/\D/g,'');
    if(digits.startsWith('966')) digits = digits.slice(3);
    if(digits.startsWith('0')) digits = digits.slice(1);
    digits = digits.slice(0,9);
    let out = '+966';
    if(digits.length) out += ' ' + digits.slice(0,2);
    if(digits.length>2) out += ' ' + digits.slice(2,5);
    if(digits.length>5) out += ' ' + digits.slice(5,9);
    inp.value = out;
  } else if(mask==='iban-sa'){
    let chars = inp.value.toUpperCase().replace(/[^A-Z0-9]/g,'');
    if(!chars.startsWith('SA')) chars = 'SA' + chars.replace(/^SA/,'');
    chars = chars.slice(0,24);
    inp.value = chars.replace(/(.{4})/g,'$1 ').trim();
  } else if(mask==='digits'){
    const max = Number(inp.dataset.maxlen)||10;
    inp.value = inp.value.replace(/\D/g,'').slice(0,max);
  } else if(mask==='phone-local'){
    let digits = inp.value.replace(/\D/g,'').slice(0,10);
    let out = '';
    if(digits.length) out += digits.slice(0,2);
    if(digits.length>2) out += ' ' + digits.slice(2,5);
    if(digits.length>5) out += ' ' + digits.slice(5,10);
    inp.value = out;
  }
}
function initMasks(){
  document.querySelectorAll('[data-mask]').forEach(inp=>{
    inp.addEventListener('input', ()=> applyMask(inp));
    inp.addEventListener('focus', ()=>{ if(inp.dataset.mask==='mobile-sa' && !inp.value) inp.value='+966 '; });
  });
}

/* ---------- field-level validation with specific messages ---------- */
const VALIDATORS = {
  'email': { test:v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), msg:'Enter a valid email address' },
  'saudi-id': { test:v=>/^\d{10}$/.test(v.replace(/\D/g,'')) && /^[12]/.test(v.replace(/\D/g,'')), msg:'Enter a valid 10-digit ID / Iqama number' },
  'mobile-sa': { test:v=>/^\+966 \d{2} \d{3} \d{4}$/.test(v), msg:'Enter a complete Saudi mobile number' },
  'phone-local': { test:v=>v.replace(/\D/g,'').length>=7, msg:'Enter a complete mobile number' },
  'iban-sa': { test:v=>v.replace(/\s/g,'').length===24, msg:'Saudi IBAN must be 24 characters (incl. SA)' },
};
function checkFieldValidity(inp){
  const field = inp.closest('.field');
  if(!field) return true;
  const type = inp.dataset.validate;
  const required = inp.hasAttribute('required');
  const val = inp.value.trim();
  if(!val){
    field.classList.toggle('error', required);
    if(required) field.querySelector('.error-msg').textContent = 'This field is required';
    return !required;
  }
  if(type && VALIDATORS[type]){
    const ok = VALIDATORS[type].test(val);
    field.classList.toggle('error', !ok);
    if(!ok) field.querySelector('.error-msg').textContent = VALIDATORS[type].msg;
    return ok;
  }
  field.classList.remove('error');
  return true;
}
function initFieldValidation(){
  document.querySelectorAll('.field .input[data-validate], .field .input[required]').forEach(inp=>{
    inp.addEventListener('blur', ()=> checkFieldValidity(inp));
    inp.addEventListener('input', ()=> inp.closest('.field').classList.remove('error'));
  });
}

/* ---------- form submit guard ---------- */
function initValidation(){
  document.querySelectorAll('form[data-validate]').forEach(form=>{
    form.addEventListener('submit', e=>{
      let ok = true;
      form.querySelectorAll('.input').forEach(inp=>{
        if(!checkFieldValidity(inp)) ok = false;
      });
      if(!ok) e.preventDefault();
    });
  });
}

/* ---------- password strength meter ---------- */
function initPasswordStrength(){
  const inp = document.querySelector('[data-role="password-primary"]');
  const bar = document.querySelector('[data-pw-bar]');
  const label = document.querySelector('[data-pw-label]');
  const rules = document.querySelectorAll('.pw-rules li[data-rule]');
  if(!inp || !bar) return;

  function evaluate(){
    const v = inp.value;
    const checks = {
      len: v.length>=8,
      num: /[0-9]/.test(v),
      sym: /[^A-Za-z0-9]/.test(v),
      case: /[A-Z]/.test(v) && /[a-z]/.test(v),
    };
    let score = 0;
    Object.values(checks).forEach(pass=>{ if(pass) score++; });

    rules.forEach(li=>{
      const key = li.dataset.rule;
      const pass = !!checks[key];
      li.classList.toggle('met', pass);
      const ico = li.querySelector('.rule-ico');
      if(ico) ico.textContent = pass ? '✓' : '○';
    });

    const levels = [
      {w:'8%', c:'var(--line)', t:''},
      {w:'30%', c:'var(--danger)', t:'Weak'},
      {w:'55%', c:'var(--warning)', t:'Fair'},
      {w:'80%', c:'var(--primary)', t:'Good'},
      {w:'100%', c:'var(--success)', t:'Strong'},
    ];
    const lvl = levels[v.length===0?0:score];
    bar.style.width = lvl.w;
    bar.style.background = lvl.c;
    if(label) label.textContent = v.length===0 ? '' : lvl.t;
  }

  inp.addEventListener('input', evaluate);
  inp.addEventListener('focus', evaluate);
  evaluate();
}

/* ---------- password show/hide toggle ---------- */
const ICON_EYE = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>';
const ICON_EYE_OFF = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l18 18"/><path d="M10.6 5.2A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a17.7 17.7 0 0 1-3.6 4.6M6.6 6.6C4 8.3 2 12 2 12s3.5 7 10 7c1.7 0 3.2-.4 4.5-1.1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>';
function initPasswordToggle(){
  document.querySelectorAll('[data-pw-toggle]').forEach(btn=>{
    const wrap = btn.closest('.input-wrap');
    const inp = wrap && wrap.querySelector('.input');
    if(!inp) return;
    btn.addEventListener('click', ()=>{
      const showing = inp.type === 'text';
      inp.type = showing ? 'password' : 'text';
      btn.classList.toggle('on', !showing);
      btn.innerHTML = !showing ? ICON_EYE_OFF : ICON_EYE;
      btn.setAttribute('aria-label', !showing ? 'Hide password' : 'Show password');
      inp.focus({preventScroll:true});
    });
  });
}

/* ---------- progress stepper reveal ---------- */
function initStepper(){
  document.querySelectorAll('.stepper').forEach(st=>{
    const total = Number(st.dataset.total);
    const current = Number(st.dataset.current);
    st.innerHTML = '';
    for(let i=1;i<=total;i++){
      const seg = document.createElement('div');
      seg.className='seg';
      st.appendChild(seg);
    }
    const segs = Array.from(st.children);
    segs.forEach((seg,i)=>{
      if(i < current-1){
        setTimeout(()=> seg.classList.add('done'), i*80);
      } else if(i === current-1){
        setTimeout(()=> seg.classList.add('active'), (current-1)*80);
      }
    });
  });
}

/* ---------- phone field: country code picker ---------- */
const COUNTRIES = [
  ['+93','Afghanistan','🇦🇫'],['+355','Albania','🇦🇱'],['+213','Algeria','🇩🇿'],['+1684','American Samoa','🇦🇸'],
  ['+376','Andorra','🇦🇩'],['+244','Angola','🇦🇴'],['+54','Argentina','🇦🇷'],['+374','Armenia','🇦🇲'],
  ['+61','Australia','🇦🇺'],['+43','Austria','🇦🇹'],['+994','Azerbaijan','🇦🇿'],['+973','Bahrain','🇧🇭'],
  ['+880','Bangladesh','🇧🇩'],['+375','Belarus','🇧🇾'],['+32','Belgium','🇧🇪'],['+501','Belize','🇧🇿'],
  ['+229','Benin','🇧🇯'],['+975','Bhutan','🇧🇹'],['+591','Bolivia','🇧🇴'],['+387','Bosnia and Herzegovina','🇧🇦'],
  ['+267','Botswana','🇧🇼'],['+55','Brazil','🇧🇷'],['+673','Brunei','🇧🇳'],['+359','Bulgaria','🇧🇬'],
  ['+226','Burkina Faso','🇧🇫'],['+257','Burundi','🇧🇮'],['+855','Cambodia','🇰🇭'],['+237','Cameroon','🇨🇲'],
  ['+1','Canada','🇨🇦'],['+235','Chad','🇹🇩'],['+56','Chile','🇨🇱'],['+86','China','🇨🇳'],
  ['+57','Colombia','🇨🇴'],['+269','Comoros','🇰🇲'],['+242','Congo','🇨🇬'],['+506','Costa Rica','🇨🇷'],
  ['+385','Croatia','🇭🇷'],['+53','Cuba','🇨🇺'],['+357','Cyprus','🇨🇾'],['+420','Czech Republic','🇨🇿'],
  ['+45','Denmark','🇩🇰'],['+253','Djibouti','🇩🇯'],['+1','Dominican Republic','🇩🇴'],['+593','Ecuador','🇪🇨'],
  ['+20','Egypt','🇪🇬'],['+503','El Salvador','🇸🇻'],['+372','Estonia','🇪🇪'],['+251','Ethiopia','🇪🇹'],
  ['+679','Fiji','🇫🇯'],['+358','Finland','🇫🇮'],['+33','France','🇫🇷'],['+241','Gabon','🇬🇦'],
  ['+220','Gambia','🇬🇲'],['+995','Georgia','🇬🇪'],['+49','Germany','🇩🇪'],['+233','Ghana','🇬🇭'],
  ['+30','Greece','🇬🇷'],['+502','Guatemala','🇬🇹'],['+224','Guinea','🇬🇳'],['+509','Haiti','🇭🇹'],
  ['+504','Honduras','🇭🇳'],['+852','Hong Kong','🇭🇰'],['+36','Hungary','🇭🇺'],['+354','Iceland','🇮🇸'],
  ['+91','India','🇮🇳'],['+62','Indonesia','🇮🇩'],['+98','Iran','🇮🇷'],['+964','Iraq','🇮🇶'],
  ['+353','Ireland','🇮🇪'],['+972','Israel','🇮🇱'],['+39','Italy','🇮🇹'],['+1876','Jamaica','🇯🇲'],
  ['+81','Japan','🇯🇵'],['+962','Jordan','🇯🇴'],['+7','Kazakhstan','🇰🇿'],['+254','Kenya','🇰🇪'],
  ['+965','Kuwait','🇰🇼'],['+996','Kyrgyzstan','🇰🇬'],['+856','Laos','🇱🇦'],['+371','Latvia','🇱🇻'],
  ['+961','Lebanon','🇱🇧'],['+266','Lesotho','🇱🇸'],['+231','Liberia','🇱🇷'],['+218','Libya','🇱🇾'],
  ['+423','Liechtenstein','🇱🇮'],['+370','Lithuania','🇱🇹'],['+352','Luxembourg','🇱🇺'],['+853','Macau','🇲🇴'],
  ['+261','Madagascar','🇲🇬'],['+265','Malawi','🇲🇼'],['+60','Malaysia','🇲🇾'],['+960','Maldives','🇲🇻'],
  ['+223','Mali','🇲🇱'],['+356','Malta','🇲🇹'],['+222','Mauritania','🇲🇷'],['+230','Mauritius','🇲🇺'],
  ['+52','Mexico','🇲🇽'],['+373','Moldova','🇲🇩'],['+377','Monaco','🇲🇨'],['+976','Mongolia','🇲🇳'],
  ['+382','Montenegro','🇲🇪'],['+212','Morocco','🇲🇦'],['+258','Mozambique','🇲🇿'],['+95','Myanmar','🇲🇲'],
  ['+264','Namibia','🇳🇦'],['+977','Nepal','🇳🇵'],['+31','Netherlands','🇳🇱'],['+64','New Zealand','🇳🇿'],
  ['+505','Nicaragua','🇳🇮'],['+227','Niger','🇳🇪'],['+234','Nigeria','🇳🇬'],['+389','North Macedonia','🇲🇰'],
  ['+47','Norway','🇳🇴'],['+968','Oman','🇴🇲'],['+92','Pakistan','🇵🇰'],['+970','Palestine','🇵🇸'],
  ['+507','Panama','🇵🇦'],['+675','Papua New Guinea','🇵🇬'],['+595','Paraguay','🇵🇾'],['+51','Peru','🇵🇪'],
  ['+63','Philippines','🇵🇭'],['+48','Poland','🇵🇱'],['+351','Portugal','🇵🇹'],['+974','Qatar','🇶🇦'],
  ['+40','Romania','🇷🇴'],['+7','Russia','🇷🇺'],['+250','Rwanda','🇷🇼'],['+966','Saudi Arabia','🇸🇦'],
  ['+221','Senegal','🇸🇳'],['+381','Serbia','🇷🇸'],['+248','Seychelles','🇸🇨'],['+232','Sierra Leone','🇸🇱'],
  ['+65','Singapore','🇸🇬'],['+421','Slovakia','🇸🇰'],['+386','Slovenia','🇸🇮'],['+252','Somalia','🇸🇴'],
  ['+27','South Africa','🇿🇦'],['+82','South Korea','🇰🇷'],['+211','South Sudan','🇸🇸'],['+34','Spain','🇪🇸'],
  ['+94','Sri Lanka','🇱🇰'],['+249','Sudan','🇸🇩'],['+597','Suriname','🇸🇷'],['+46','Sweden','🇸🇪'],
  ['+41','Switzerland','🇨🇭'],['+963','Syria','🇸🇾'],['+886','Taiwan','🇹🇼'],['+992','Tajikistan','🇹🇯'],
  ['+255','Tanzania','🇹🇿'],['+66','Thailand','🇹🇭'],['+228','Togo','🇹🇬'],['+216','Tunisia','🇹🇳'],
  ['+90','Turkey','🇹🇷'],['+993','Turkmenistan','🇹🇲'],['+256','Uganda','🇺🇬'],['+380','Ukraine','🇺🇦'],
  ['+971','United Arab Emirates','🇦🇪'],['+44','United Kingdom','🇬🇧'],['+1','United States','🇺🇸'],
  ['+598','Uruguay','🇺🇾'],['+998','Uzbekistan','🇺🇿'],['+58','Venezuela','🇻🇪'],['+84','Vietnam','🇻🇳'],
  ['+967','Yemen','🇾🇪'],['+260','Zambia','🇿🇲'],['+263','Zimbabwe','🇿🇼'],
];
function initPhoneField(){
  document.querySelectorAll('[data-phone-field]').forEach(field=>{
    const toggle = field.querySelector('[data-country-toggle]');
    const flagEl = field.querySelector('[data-country-flag]');
    const codeEl = field.querySelector('[data-country-code]');
    const listEl = field.querySelector('[data-country-list]');
    const searchEl = field.querySelector('[data-country-search]');
    if(!toggle || !listEl) return;

    function render(filter){
      const f = (filter||'').trim().toLowerCase();
      const matches = f ? COUNTRIES.filter(c=> c[1].toLowerCase().includes(f) || c[0].includes(f)) : COUNTRIES;
      listEl.innerHTML = matches.length ? matches.map(c=>
        `<div class="country-item${c[0]===codeEl.textContent && c[2]===flagEl.textContent?' selected':''}" data-code="${c[0]}" data-name="${c[1]}" data-flag="${c[2]}"><span class="flag">${c[2]}</span><span class="name">${c[1]}</span><span class="code">${c[0]}</span></div>`
      ).join('') : `<div class="no-results">No countries found</div>`;
    }

    function open(){
      field.classList.add('open');
      if(searchEl) searchEl.value = '';
      render();
      listEl.scrollTop = 0;
      if(searchEl) setTimeout(()=> searchEl.focus(), 50);
    }
    function close(){ field.classList.remove('open'); }

    toggle.addEventListener('click', e=>{
      e.preventDefault();
      field.classList.contains('open') ? close() : open();
    });
    if(searchEl) searchEl.addEventListener('input', ()=> render(searchEl.value));
    listEl.addEventListener('click', e=>{
      const item = e.target.closest('.country-item');
      if(!item) return;
      flagEl.textContent = item.dataset.flag;
      codeEl.textContent = item.dataset.code;
      close();
      const numInput = field.querySelector('.phone-number-input');
      if(numInput) numInput.focus();
    });
    document.addEventListener('click', e=>{
      if(!field.contains(e.target)) close();
    });
    render();
  });
}

/* ---------- date of birth bottom sheet ---------- */
function initDatePicker(){
  const field = document.querySelector('[data-date-field]');
  const sheet = document.querySelector('[data-date-sheet]');
  if(!field || !sheet) return;
  const display = field.querySelector('[data-date-display]');
  const daySel = sheet.querySelector('[data-day]');
  const monthSel = sheet.querySelector('[data-month]');
  const yearSel = sheet.querySelector('[data-year]');
  const confirmBtn = sheet.querySelector('[data-date-confirm]');
  const warn = sheet.querySelector('.sheet-age-warn');
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  if(!daySel.children.length){
    for(let d=1;d<=31;d++) daySel.appendChild(new Option(d,d));
    months.forEach((m,i)=> monthSel.appendChild(new Option(m,i+1)));
    const nowY = new Date().getFullYear();
    for(let y=nowY-18; y>=nowY-80; y--) yearSel.appendChild(new Option(y,y));
    daySel.value = 15; monthSel.value = 6; yearSel.value = nowY-25;
  }

  function open(){ sheet.classList.add('open'); }
  function close(){ sheet.classList.remove('open'); }

  field.addEventListener('click', open);
  sheet.addEventListener('click', e=>{ if(e.target===sheet) close(); });
  sheet.querySelector('[data-date-cancel]').addEventListener('click', close);

  confirmBtn.addEventListener('click', ()=>{
    const d = Number(daySel.value), m = Number(monthSel.value), y = Number(yearSel.value);
    const dob = new Date(y, m-1, d);
    const age = (Date.now()-dob.getTime())/ (1000*60*60*24*365.25);
    if(age < 18){
      warn.classList.add('show');
      return;
    }
    warn.classList.remove('show');
    display.value = `${String(d).padStart(2,'0')} ${months[m-1].slice(0,3)} ${y}`;
    display.classList.add('filled');
    close();
  });
}

/* ---------- highlight active bottom-nav tab based on current file ---------- */
function initBottomNavActive(){
  const current = location.pathname.split('/').pop();
  document.querySelectorAll('.bottom-nav a').forEach(a=>{
    const href = a.getAttribute('href');
    a.classList.toggle('active', href===current);
  });
}

/* ---------- amount stepper (finance offer screen) ---------- */
function updateRangeFill(range){
  const min = Number(range.min) || 0;
  const max = Number(range.max) || 100;
  const pct = ((Number(range.value) - min) / (max - min)) * 100;
  range.style.background = `linear-gradient(to right, var(--primary) ${pct}%, var(--slider-track) ${pct}%)`;
}
function initAmountSync(){
  const range = document.querySelector('[data-amount-range]');
  const out = document.querySelector('[data-amount-out]');
  const display = document.querySelector('[data-amount-display]');
  const tenorSelect = document.querySelector('[data-tenor-select]');
  const installmentOut = document.querySelector('[data-installment-out]');
  const contractOut = document.querySelector('[data-contract-out]');
  const profitOut = document.querySelector('[data-profit-out]');
  const feeOut = document.querySelector('[data-fee-out]');
  const aprOut = document.querySelector('[data-apr-out]');
  const profitPctOut = document.querySelector('[data-profitpct-out]');
  if(!range || !out) return;

  const ANNUAL_RATE = 0.09;
  const FEE_RATE = 0.01;
  const money = n => 'SAR ' + n.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2});

  function recalc(){
    const principal = Number(range.value);
    const months = tenorSelect ? Number(tenorSelect.value) : 24;
    const totalProfit = principal * ANNUAL_RATE * (months / 12);
    const fee = principal * FEE_RATE;
    const contractValue = principal + totalProfit;
    const monthly = contractValue / months;
    const apr = (2 * 12 * totalProfit) / (principal * (months + 1)) * 100;
    const profitPct = ANNUAL_RATE * 100;

    out.textContent = money(principal);
    if(display) display.value = principal.toLocaleString('en-US', {minimumFractionDigits:2});
    if(installmentOut) installmentOut.textContent = money(monthly);
    if(contractOut) contractOut.textContent = money(contractValue);
    if(profitOut) profitOut.textContent = money(totalProfit);
    if(feeOut) feeOut.textContent = money(fee);
    if(aprOut) aprOut.textContent = apr.toFixed(2) + '%';
    if(profitPctOut) profitPctOut.textContent = profitPct.toFixed(2) + '%';
  }

  updateRangeFill(range);
  recalc();
  range.addEventListener('input', ()=>{
    updateRangeFill(range);
    recalc();
  });
  if(tenorSelect){
    tenorSelect.addEventListener('change', recalc);
  }
}

/* ---------- select field: reveal "please specify" on Other ---------- */
function initOtherReveal(){
  document.querySelectorAll('select[data-has-other]').forEach(select=>{
    const reveal = select.closest('.select-field')?.nextElementSibling;
    if(!reveal || !reveal.matches('[data-other-reveal]')) return;
    const sync = ()=>{
      const isOther = select.value.trim().toLowerCase() === 'other';
      reveal.classList.toggle('hidden', !isOther);
    };
    select.addEventListener('change', sync);
    sync();
  });
}

/* ---------- bank details: add / remove a second account ---------- */
function initAddAccount(){
  const addBtn = document.querySelector('[data-add-account]');
  const extra = document.querySelector('[data-account-group-extra]');
  const removeBtn = document.querySelector('[data-remove-account]');
  if(!addBtn || !extra) return;

  addBtn.addEventListener('click', ()=>{
    extra.classList.remove('hidden');
    addBtn.classList.add('hidden');
    const firstInput = extra.querySelector('select, input');
    if(firstInput) firstInput.focus();
  });

  if(removeBtn){
    removeBtn.addEventListener('click', ()=>{
      extra.classList.add('hidden');
      addBtn.classList.remove('hidden');
      extra.querySelectorAll('input').forEach(inp=>{ inp.value=''; inp.classList.remove('valid','invalid'); });
      extra.querySelectorAll('select').forEach(sel=>{ sel.selectedIndex = 0; });
      extra.querySelectorAll('.error-msg').forEach(e=> e.textContent='');
    });
  }
}

/* ---------- onboarding carousel (swipe, dots, autoplay, drag) ---------- */
function initCarousel(){
  const car = document.querySelector('[data-carousel]');
  if(!car) return;
  const slides = Array.from(car.querySelectorAll('.onb-slide'));
  const dotsWrap = document.querySelector('[data-dots]');
  const dots = dotsWrap ? Array.from(dotsWrap.querySelectorAll('span')) : [];
  const prevBtn = document.querySelector('[data-onb-prev]');
  const nextBtn = document.querySelector('[data-onb-next]');
  let autoplayTimer = null;

  function goToSlide(i, smooth){
    i = Math.max(0, Math.min(slides.length-1, i));
    car.scrollTo({ left: i * car.clientWidth, behavior: smooth===false ? 'auto' : 'smooth' });
  }
  function setActive(i){
    dots.forEach((d,idx)=> d.classList.toggle('on', idx===i));
    if(prevBtn) prevBtn.disabled = i===0;
    if(nextBtn) nextBtn.disabled = i===slides.length-1;
  }
  function currentIndex(){
    return Math.round(car.scrollLeft / car.clientWidth);
  }

  let scrollRaf = null;
  car.addEventListener('scroll', ()=>{
    if(scrollRaf) return;
    scrollRaf = requestAnimationFrame(()=>{
      setActive(currentIndex());
      scrollRaf = null;
    });
  });

  dots.forEach((d,i)=> d.addEventListener('click', ()=>{ stopAutoplay(); goToSlide(i); restartAutoplayLater(); }));
  if(prevBtn) prevBtn.addEventListener('click', ()=>{ stopAutoplay(); goToSlide(currentIndex()-1); restartAutoplayLater(); });
  if(nextBtn) nextBtn.addEventListener('click', ()=>{ stopAutoplay(); goToSlide(currentIndex()+1); restartAutoplayLater(); });

  /* mouse drag-to-scroll for desktop/trackpad testing */
  let isDown=false, startX=0, startScroll=0;
  car.addEventListener('mousedown', e=>{
    isDown=true; car.classList.add('dragging'); startX=e.pageX; startScroll=car.scrollLeft; stopAutoplay();
  });
  window.addEventListener('mouseup', ()=>{ if(isDown){ isDown=false; car.classList.remove('dragging'); snapToNearest(); restartAutoplayLater(); } });
  window.addEventListener('mousemove', e=>{
    if(!isDown) return;
    car.scrollLeft = startScroll - (e.pageX - startX);
  });
  car.addEventListener('touchstart', stopAutoplay, {passive:true});
  car.addEventListener('touchend', restartAutoplayLater, {passive:true});
  function snapToNearest(){ goToSlide(currentIndex()); }

  function startAutoplay(){
    autoplayTimer = setInterval(()=>{
      const next = (currentIndex()+1) % slides.length;
      goToSlide(next);
    }, 4200);
  }
  function stopAutoplay(){ if(autoplayTimer){ clearInterval(autoplayTimer); autoplayTimer=null; } }
  function restartAutoplayLater(){ stopAutoplay(); setTimeout(startAutoplay, 5000); }

  /* one-time "nudge" hint so first-time users notice the illustration is swipeable */
  function nudgeHint(){
    if(slides.length<2) return;
    const start = car.scrollLeft;
    setTimeout(()=>{
      car.scrollTo({ left:start+26, behavior:'smooth' });
      setTimeout(()=> car.scrollTo({ left:start, behavior:'smooth' }), 420);
    }, 900);
  }

  setActive(0);
  startAutoplay();
  nudgeHint();
}

/* ---------- language switch (visual toggle only — does not change page orientation) ---------- */
function initLangSwitch(){
  document.querySelectorAll('[data-lang-switch]').forEach(sw=>{
    const btns = sw.querySelectorAll('button');
    btns.forEach(b=>{
      b.addEventListener('click', ()=>{
        btns.forEach(x=>x.classList.remove('on'));
        b.classList.add('on');
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', ()=>{
  initRipple();
  initPageTransitions();
  initChips();
  initCheckRows();
  initSwitches();
  initNumericSteppers();
  initPin();
  initBiometricLogin();
  initOtpInputs();
  initCountdowns();
  initProcessing();
  initMasks();
  initFieldValidation();
  initValidation();
  initPasswordStrength();
  initPasswordToggle();
  initStepper();
  initDatePicker();
  initPhoneField();
  initCarousel();
  initBottomNavActive();
  initAmountSync();
  initOtherReveal();
  initAddAccount();
  initLangSwitch();
  updateContinueState();
});
