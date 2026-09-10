/* Static site generator for Azentio Finance modern UI prototype.
   Produces one real .html file per screen (no client-side router). */
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, '..');
const BUILD_VERSION = Date.now();

/* ---------------- icons (24x24; solid fill for icon-circle glyphs, line icons elsewhere) ---------------- */
function icon(name, size){
  size = size || 24;
  const solidSet = new Set(['doc','txn','edit','alert','bank','card','apple','phone','calendar','shield','plus','settings']);
  const I = {
    back:'<path d="M15 5l-7 7 7 7" />',
    close:'<path d="M6 6l12 12M18 6L6 18" />',
    home:'<path d="M4 11.5 12 4l8 7.5" /><path d="M6 10v9h5v-5h2v5h5v-9" />',
    loans:'<rect x="3" y="7" width="18" height="12" rx="2"/><path d="M3 10h18"/><path d="M7 15h4"/>',
    pay:'<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18"/><path d="M7 15h3"/>',
    more:'<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
    doc:'<path d="M6 2h8l6 6v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"/><path d="M14 2v6h6" fill-opacity=".35"/>',
    txn:'<path d="M3 8h10v-3l7 5-7 5v-3H3z"/><path d="M21 16H11v-3L4 18l7 5v-3h10z"/>',
    edit:'<path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>',
    alert:'<path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>',
    chev:'<path d="M9 5l7 7-7 7"/>',
    'arrow-right':'<path d="M5 12h14M13 6l6 6-6 6"/>',
    bank:'<path d="M12 2 2 8v2h20V8z"/><rect x="4" y="11" width="3" height="7"/><rect x="10.5" y="11" width="3" height="7"/><rect x="17" y="11" width="3" height="7"/><rect x="2" y="19" width="20" height="2" rx="1"/>',
    card:'<rect x="2" y="5" width="20" height="14" rx="2.5"/><rect x="2" y="9" width="20" height="3" fill-opacity=".35"/>',
    apple:'<path d="M15.5 3c.1 1.1-.3 2.2-1 3-.7.8-1.9 1.5-3 1.4-.1-1.1.4-2.3 1.1-3C13.3 3.6 14.5 3 15.5 3zM18.8 17.4c-.5 1.1-.8 1.6-1.5 2.6-1 1.4-2.3 3.1-4 3.1-1.5 0-1.9-1-3.9-1s-2.5 1-4 1c-1.7 0-2.9-1.6-3.9-3-2-2.9-3.2-8.1-1.3-11.6.9-1.7 2.6-2.9 4.4-2.9 1.5 0 2.4 1 3.9 1s2.2-1 3.9-1c1.6 0 3.3.9 4.3 2.4-3.8 2.1-3.2 7.5 1.1 9.4z"/>',
    phone:'<path d="M6 3h4l1 5-2.5 1.5a12 12 0 0 0 6 6L16 13l5 1v4a2 2 0 0 1-2 2C10.6 20 4 13.4 4 5a2 2 0 0 1 2-2z"/>',
    location:'<path d="M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="9" r="2.6"/>',
    calendar:'<rect x="4" y="5" width="16" height="15" rx="3"/><rect x="7" y="2" width="2" height="4" rx="1"/><rect x="15" y="2" width="2" height="4" rx="1"/>',
    id:'<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="11" r="2"/><path d="M6 16c.5-1.5 2-2 2.5-2s2 .5 2.5 2M14 9h4M14 13h4"/>',
    fingerprint:'<path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/><path d="M14 13.12c0 2.38 0 6.38-1 8.88"/><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/><path d="M2 12a10 10 0 0 1 18-6"/><path d="M2 16h.01"/><path d="M21.8 16c.2-2 .131-5.354 0-6"/><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"/><path d="M8.65 22c.21-.66.45-1.32.57-2"/><path d="M9 6.8a6 6 0 0 1 9 5.2v2"/>',
    eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3"/>',
    upload:'<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
    download:'<path d="M12 4v12M7 11l5 5 5-5"/><path d="M4 20h16"/>',
    check:'<path class="check-draw" d="M5 13l4 4 10-10"/>',
    plus:'<path fill-rule="evenodd" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 5v4h4v2h-4v4h-2v-4H7v-2h4V7h2z"/>',
    shield:'<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/>',
    'clipboard-check':'<path d="M9 3h6a1 1 0 0 1 1 1v1h1.5A1.5 1.5 0 0 1 19 6.5v13a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19.5v-13A1.5 1.5 0 0 1 6.5 5H8V4a1 1 0 0 1 1-1z"/><path d="M9 12l2 2 4-4"/>',
    'user-check':'<circle cx="9" cy="8" r="3.2"/><path d="M4 20c.6-3.3 2.7-5 5-5s3.7 1.2 4.4 3"/><path d="M15.5 15.5l1.8 1.8L21 13.5"/>',
    lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    bulb:'<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.44 1 1.15 1 1.93V16h5v-.17c0-.78.4-1.49 1-1.93A6 6 0 0 0 12 3z"/>',
    bell:'<path d="M6 8a6 6 0 0 1 12 0c0 3 1 4.5 2 6H4c1-1.5 2-3 2-6z"/><path d="M9.5 18a2.5 2.5 0 0 0 5 0"/>',
    'help-circle':'<circle cx="12" cy="12" r="9"/><path d="M9.3 9.2a2.6 2.6 0 1 1 3.9 2.5c-.8.4-1.2.9-1.2 1.8v.3"/><path d="M12 17h.01"/>',
    logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>',
    settings:'<path d="M19.4 13a7.6 7.6 0 0 0 .1-1 7.6 7.6 0 0 0-.1-1l2.1-1.6a.5.5 0 0 0 .1-.6l-2-3.5a.5.5 0 0 0-.6-.2l-2.5 1a7.4 7.4 0 0 0-1.7-1l-.4-2.6a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 0-.5.5l-.4 2.6a7.4 7.4 0 0 0-1.7 1l-2.5-1a.5.5 0 0 0-.6.2l-2 3.5a.5.5 0 0 0 .1.6L4.6 11a7.6 7.6 0 0 0 0 2l-2.1 1.6a.5.5 0 0 0-.1.6l2 3.5a.5.5 0 0 0 .6.2l2.5-1c.5.4 1.1.75 1.7 1l.4 2.6a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5l.4-2.6c.6-.25 1.2-.6 1.7-1l2.5 1a.5.5 0 0 0 .6-.2l2-3.5a.5.5 0 0 0-.1-.6L19.4 13zM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" fill-opacity=".9"/>',
  };
  if(solidSet.has(name)){
    return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="currentColor" stroke="none">${I[name]||''}</svg>`;
  }
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${I[name]||''}</svg>`;
}

/* ---------------- shared fragments ---------------- */
const statusIcons = `<div class="icons">
  <svg class="icon-signal" viewBox="0 0 18 12" width="18" height="12" fill="currentColor"><rect x="0" y="7" width="3" height="5" rx=".5"/><rect x="5" y="5" width="3" height="7" rx=".5"/><rect x="10" y="3" width="3" height="9" rx=".5"/><rect x="15" y="0" width="3" height="12" rx=".5"/></svg>
  <svg class="icon-battery" viewBox="0 0 25 12" width="22" height="11" fill="none"><rect x="0.5" y="0.5" width="20" height="11" rx="2.5" stroke="currentColor"/><rect x="2" y="2" width="17" height="8" rx="1" fill="currentColor"/><rect x="21.5" y="4" width="2" height="4" rx="1" fill="currentColor"/></svg>
</div>`;
const statusbar = `<div class="notch"></div><div class="statusbar"><span>9:41</span>${statusIcons}</div>`;

function langSwitch(){
  return `<div class="lang-switch" data-lang-switch>
    <button type="button" class="on" data-lang="en">EN</button>
    <button type="button" data-lang="ar">العربية</button>
  </div>`;
}

function header(title, backType, backHref, actions){
  const btn = backType==='none' ? '' : `<a class="icon-btn" href="${backHref||'#'}" ${backType==='close'?'':'onclick="return true"'}>${icon(backType==='close'?'close':'back')}</a>`;
  return `<div class="app-header">${btn}<div class="title">${title||''}</div>${actions?`<div class="header-actions">${actions}</div>`:''}</div>`;
}
function headerActions(){
  return `<a class="icon-btn" href="notifications.html" data-nav>${icon('bell',18)}<span class="dot"></span></a><a class="icon-btn" href="faq.html" data-nav>${icon('help-circle',18)}</a><a class="icon-btn" href="logout.html" data-nav>${icon('logout',18)}</a>`;
}

function bottomNav(active){
  const tabs = [
    ['home.html','home','Home'],
    ['loans.html','loans','My Loans'],
    ['payments.html','pay','Payments'],
    ['more.html','more','More'],
  ];
  return `<div class="bottom-nav">` + tabs.map(t=>
    `<a href="${t[0]}" class="${t[1]===active?'active':''}">${icon(t[1])}<span>${t[2]}</span></a>`
  ).join('') + `</div>`;
}

function page({title, back, backHref, body, footer, nav, extraClass, actions}){
  return `${statusbar}
  <div class="page ${extraClass||''}">
    ${header(title, back, backHref, actions)}
    <div class="body">${body}</div>
    ${footer ? `<div class="footer">${footer}</div>` : ''}
    ${nav ? bottomNav(nav) : ''}
  </div>
  <div class="home-indicator"></div>`;
}

function shell(innerHtml, docTitle){
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${docTitle} — Azentio Finance</title>
<link rel="stylesheet" href="css/styles.css?v=${BUILD_VERSION}">
</head>
<body>
<div class="device">
  <div class="screen">
${innerHtml}
  </div>
</div>
<script src="js/app.js"></script>
</body>
</html>
`;
}

function btn(label, href, cls, extraAttr){ return `<a class="btn ${cls||'btn-primary'}" href="${href}" data-nav ${extraAttr||''}><span class="label">${label}</span><span class="spinner"></span></a>`; }
function link(label, href, extra){ return `<a class="btn-link" href="${href}" data-nav ${extra||''}>${label}</a>`; }
function field(label, placeholder, type, extra){
  if(type==='password'){
    return `<div class="field"><div class="input-wrap"><input class="input" type="password" placeholder="${placeholder}" ${extra||''}><button type="button" class="pw-toggle" data-pw-toggle tabindex="-1" aria-label="Show password">${icon('eye',18)}</button></div><label>${label}</label><div class="error-msg"></div></div>`;
  }
  return `<div class="field"><input class="input" type="${type||'text'}" placeholder="${placeholder}" ${extra||''}><label>${label}</label><div class="error-msg"></div></div>`;
}
function selectField(label, options, otherReveal){
  const hasOther = otherReveal ? ' data-has-other' : '';
  const reveal = otherReveal ? `<div class="field other-reveal-field hidden" data-other-reveal><input class="input" type="text" placeholder="Please specify"><label>Please specify</label></div>` : '';
  return `<div class="select-field"><label>${label}</label><select${hasOther}>${options.map(o=>`<option>${o}</option>`).join('')}</select></div>${reveal}`;
}
function phoneField(label){
  return `<div class="field phone-field" data-phone-field>
    <label>${label}</label>
    <div class="phone-input-row">
      <button type="button" class="country-select" data-country-toggle aria-label="Select country code">
        <span class="flag" data-country-flag>🇸🇦</span><span class="dial-code" data-country-code>+966</span>${icon('chev',12)}
      </button>
      <div class="divider"></div>
      <input class="input phone-number-input" type="tel" inputmode="numeric" required data-mask="phone-local" data-validate="phone-local">
    </div>
    <div class="error-msg"></div>
    <div class="country-dropdown" data-country-dropdown>
      <div class="country-search"><input type="text" placeholder="Search country" data-country-search></div>
      <div class="country-list" data-country-list></div>
    </div>
  </div>`;
}
function stepper(current, total, label){
  return `<div class="stepper-wrap">
    <div class="stepper" data-current="${current}" data-total="${total}"></div>
    <div class="step-label"><span>Step <b>${current}</b> of ${total}</span><span>${label}</span></div>
  </div>`;
}
function dateField(label){
  return `<div class="field date-field" data-date-field>
    <input class="input" data-date-display readonly placeholder="${label}">
    <label>${label}</label>
    <div class="suffix-icon icon-accent">${icon('calendar',16)}</div>
    <div class="error-msg"></div>
  </div>
  <div class="sheet-backdrop" data-date-sheet>
    <div class="sheet-panel">
      <div class="sheet-handle"></div>
      <div class="sheet-title">Select your date of birth</div>
      <div class="sheet-sub">You must be 18 or older to apply.</div>
      <div class="date-select-row">
        <select data-day></select>
        <select data-month></select>
        <select data-year></select>
      </div>
      <div class="sheet-age-warn">You must be at least 18 years old to continue.</div>
      <a class="btn btn-primary" data-date-confirm><span class="label">Confirm</span></a>
      <a class="btn btn-ghost" data-date-cancel style="margin-top:4px;"><span class="label">Cancel</span></a>
    </div>
  </div>`;
}
function row(l,v){ return `<div class="row"><span class="lbl">${l}</span><span class="val">${v}</span></div>`; }
function listItem(iconName, t1, t2, href, meta){
  return `<a class="list-item" href="${href||'#'}" ${href?'data-nav':''}><div class="icon-circle">${icon(iconName)}</div><div class="grow"><div class="t1">${t1}</div>${t2?`<div class="t2">${t2}</div>`:''}</div>${meta?`<div class="val">${meta}</div>`:`<div class="chev">${icon('chev',18)}</div>`}</a>`;
}
function checkRow(text, required){ return `<div class="check-row" ${required?'data-required':''}><div class="check-box">${icon('check',13)}</div><div class="txt">${text}</div></div>`; }
function switchRow(label, on, key){
  return `<div class="switch-row"><span class="lbl">${label}</span><button type="button" class="ios-switch ${on?'on':''}" data-switch="${key}" role="switch" aria-checked="${on?'true':'false'}"><span class="knob"></span></button></div>`;
}
function sarField(label){
  return `<div class="field">
    <label>${label}</label>
    <div class="sar-input-row">
      <span class="sar-prefix"><span class="code">SAR</span></span>
      <div class="divider"></div>
      <input class="input sar-number-input" type="number" inputmode="decimal" placeholder="0.00">
    </div>
  </div>`;
}
function numericStepper(label, value, min, max){
  return `<div class="numeric-row"><span class="lbl">${label}</span><div class="numeric-stepper" data-stepper data-value="${value}" data-min="${min}" data-max="${max}">
    <button type="button" data-step="-1" aria-label="Decrease">−</button>
    <span class="val" data-step-value>${value}</span>
    <button type="button" data-step="1" aria-label="Increase">+</button>
  </div></div>`;
}

/* ================================================================
   SCREEN DEFINITIONS
   ================================================================ */
const S = {};

function onbSlide(img, tag, h1, p){
  return `<div class="onb-slide">
    <img src="${img}" class="illustration" alt="">
    <div class="tag-line">${tag}</div>
    <div class="h1">${h1}</div>
    <div class="p">${p}</div>
  </div>`;
}

S.index = page({
  title:'', back:'none',
  body:`
    <div class="brand-top">
      <img src="images/logo.svg" alt="Azentio Finance" class="brand-logo">
      ${langSwitch()}
    </div>
    <div class="hero-section">
      <img src="images/hero-bg-circle.png" alt="" class="hero-bg-circle">
      <div class="hero-eyebrow">Azentio Finance</div>
      <div class="hero-title">Smarter loans.<br>Stronger <span class="accent">tomorrow</span>.</div>
      <div class="hero-sub">Apply in minutes and get a decision the same day — fully digital, no paperwork.</div>
      <div class="hero-illustration">
        <div class="journey-card">
          <div class="journey-badge">${icon('clipboard-check',20)}</div>
          <div class="journey-title">Your journey, simplified</div>
          <div class="journey-row"><div class="icon-circle sm">${icon('user-check',16)}</div><div><div class="jr-t">Quick &amp; easy</div><div class="jr-d">Simple steps, instant progress</div></div></div>
          <div class="journey-row"><div class="icon-circle sm">${icon('lock',16)}</div><div><div class="jr-t">Secure &amp; private</div><div class="jr-d">Your data is safe with us</div></div></div>
          <div class="journey-row"><div class="icon-circle sm">${icon('bulb',16)}</div><div><div class="jr-t">Smart decisions</div><div class="jr-d">Personalized offers that fit you</div></div></div>
        </div>
      </div>
    </div>
    <div class="trust-strip">
      <div class="trust-item">${icon('shield',14)}<span>SAMA regulated</span></div>
      <div class="trust-item">${icon('check',14)}<span>Shariah compliant</span></div>
      <div class="trust-item"><span class="trust-star">★ 4.8</span><span>App rating</span></div>
    </div>
    <div class="mini-steps">
      <span class="ms-item"><span class="ms-num">1</span>Verify mobile</span>
      <span class="ms-sep">›</span>
      <span class="ms-item"><span class="ms-num">2</span>Add details</span>
      <span class="ms-sep">›</span>
      <span class="ms-item"><span class="ms-num">3</span>Get funded</span>
    </div>`,
  footer: `${btn(`Get Started <span class="btn-icon">${icon('arrow-right',16)}</span>`,'sign-up.html')}<a class="link-cta" href="biometric-login.html" data-nav><span>Already have an account?</span><b>Login</b></a>`
});

S['login'] = page({
  title:'Login', back:'back', backHref:'index.html',
  body:`
    <div class="h2">Welcome back</div>
    <div class="p">Log in with your mobile number and password to continue.</div>
    <form data-validate>
      ${phoneField('Mobile number')}
      ${field('Password','••••••••','password','required')}
    </form>
    <div class="small" style="margin-top:4px;"><a href="#" style="color:var(--primary-dark);font-weight:700;">Forgot password?</a></div>`,
  footer: btn('Login','home.html') + link('Use biometric login instead','biometric-login.html') + link("Don't have an account? Sign up",'sign-up.html')
});

S['biometric-login'] = page({
  title:'', back:'back', backHref:'index.html',
  body:`
    <div class="center" style="padding-top:40px;">
      <div style="position:relative;width:88px;height:88px;margin:0 auto 24px;">
        <div class="pulse-ring scan" data-scan-ring></div>
        <div class="icon-circle hero" data-biometric-trigger data-next="home.html">${icon('fingerprint',42)}</div>
      </div>
      <div class="h2" data-scan-title>Login with fingerprint</div>
      <div class="p center" data-scan-sub>Tap the sensor above to continue as Tameer.</div>
    </div>`,
  footer: btn('Use PIN instead','pin-login.html','btn-secondary') + link('Use password instead','login.html')
});

S['sign-up'] = page({
  title:'Sign Up', back:'back', backHref:'index.html',
  body:`
    ${stepper(1,3,'Mobile Number')}
    <div class="icon-circle" style="width:64px;height:64px;border-radius:20px;margin:4px auto 18px;">${icon('phone',28)}</div>
    <div class="h2 center">Let's verify your number</div>
    <div class="p center">Enter your mobile number and we'll send you a one-time code to get started.</div>
    <form data-validate>
      ${phoneField('Mobile number')}
    </form>`,
  footer: btn('Send verification code','sign-up-otp.html') + `<a class="link-cta" href="login.html" data-nav><span>Already have an account?</span><b>Log in</b></a>`
});

S['sign-up-otp'] = page({
  title:'Verify Code', back:'back', backHref:'sign-up.html',
  body:`
    ${stepper(2,3,'Verify Code')}
    <div class="icon-circle" style="width:64px;height:64px;border-radius:20px;margin:4px auto 18px;">${icon('phone',28)}</div>
    <div class="h2 center">Enter verification code</div>
    <div class="p center">We've sent a 6-digit code via SMS to <b>+966 5X XXX XXXX</b>.</div>
    <div class="otp-row" data-otp data-next="sign-up-otp-success.html">
      ${'<input class="otp-box" type="tel" inputmode="numeric" maxlength="1" autocomplete="one-time-code">'.repeat(6)}
    </div>
    <div class="otp-status" data-otp-status></div>
    <div class="center" style="margin-top:18px;">
      <div class="countdown" data-countdown="00:45" data-expired-text="Code expired">⏱ <span class="cd-time">00:45</span></div>
    </div>`,
  footer: `<a class="link-cta" href="sign-up.html" data-nav><span>Wrong number?</span><b>Edit</b></a>`
});

S['sign-up-otp-success'] = page({
  title:'', back:'none',
  body:`
    <div class="status-icon success lg" style="position:relative;"><div class="pulse-ring lg"></div>${icon('check',56)}</div>
    <div class="h2 center" style="margin-top:6px;font-size:24px;">Number verified!</div>
    <div class="p center" style="font-size:15.5px;line-height:1.6;">Your mobile number has been successfully verified. Take a look around, or finish setting up your account now.</div>`,
  footer: btn('Explore products','explore-products.html') + link('Complete your profile','sign-up-details.html')
});

S['sign-up-details'] = page({
  title:'Your Details', back:'back', backHref:'sign-up-otp-success.html',
  body:`
    ${stepper(3,3,'Your Details')}
    <div class="h2">Complete your profile</div>
    <div class="p">Almost there — just a few more details to register.</div>
    <form data-validate>
      ${field('ID number','National / Iqama ID','text','required data-mask="digits" data-maxlen="10" data-validate="saudi-id" inputmode="numeric"')}
      ${dateField('Date of birth')}
      ${field('Email address (optional)','name@email.com','email','data-validate="email"')}
    </form>`,
  footer: btn('Create account','terms-conditions.html')
});

S['terms-conditions'] = page({
  title:'', back:'close', backHref:'sign-up-details.html', extraClass:'terms-page',
  body:`
    <div class="h2">Terms &amp; conditions</div>
    <div class="p">Please review and accept before continuing. Required items are marked — optional marketing consent is separate.</div>
    <div class="h3" style="margin-top:4px;">Required</div>
    ${checkRow('I have read and accept the <a href="#">Azentio Finance Terms &amp; Conditions</a>', true)}
    ${checkRow('I have read and accept the <a href="#">Privacy Policy</a>', true)}
    ${checkRow('I confirm I am <b>not</b> a Politically Exposed Person (PEP), nor related to one', true)}
    <div class="h3">Optional</div>
    ${checkRow('Authorize Azentio Finance to share my data across group entities for tailored offers')}
    ${checkRow('Send me promotional offers and updates by SMS / email')}
  `,
  footer: btn('Continue','nafath-verification.html','btn-primary','disabled data-requires-consent')
});

S['nafath-verification'] = page({
  title:'Nafath Verification', back:'back', backHref:'terms-conditions.html',
  body:`
    <div class="center" style="padding-top:6px;">
      <img src="images/illustration-nafath.svg" style="width:150px;height:150px;" alt="">
      <div class="h2">Confirm it's you</div>
      <div class="p">Open the Nafath app and select the number shown below to verify your identity.</div>
      <div class="card center" style="padding:26px 0;">
        <div class="big-amount">25</div>
        <div class="small" style="margin-top:8px;">This code is only valid for a short time</div>
        <div class="countdown" style="margin-top:10px;" data-countdown="01:53" data-expired-text="Code expired">⏱ <span class="cd-time">01:53</span></div>
      </div>
    </div>`,
  footer: btn('Open Nafath app','nafath-success.html') + link("Didn't get it? Restart verification",'nafath-verification.html')
});

S['nafath-success'] = page({
  title:'', back:'none',
  body:`
    <div class="status-icon success lg" style="position:relative;"><div class="pulse-ring lg"></div>${icon('check',56)}</div>
    <div class="h2 center" style="margin-top:6px;font-size:24px;">Nafath verification successful</div>
    <div class="p center" style="font-size:15.5px;line-height:1.6;">Your identity has been verified. Let's secure your account with a password.</div>`,
  footer: btn('Create password','create-password.html')
});

S['create-password'] = page({
  title:'Create Password', back:'back', backHref:'nafath-success.html',
  body:`
    <div class="h2">Create a password</div>
    <div class="p">Use at least 8 characters, with a number and a symbol.</div>
    <form data-validate>
      ${field('Password','••••••••','password','required data-role="password-primary"')}
      <div class="pw-strength"><div class="progress" style="flex:1;margin:0 10px 0 0;"><div data-pw-bar style="width:8%;background:var(--line);"></div></div><span class="small" data-pw-label></span></div>
      <ul class="pw-rules">
        <li data-rule="len"><span class="rule-ico">○</span>At least 8 characters</li>
        <li data-rule="num"><span class="rule-ico">○</span>Contains a number</li>
        <li data-rule="sym"><span class="rule-ico">○</span>Contains a symbol</li>
        <li data-rule="case"><span class="rule-ico">○</span>Upper &amp; lowercase letters</li>
      </ul>
      ${field('Confirm password','••••••••','password','required')}
    </form>`,
  footer: btn('Continue','create-pin.html')
});

function pinPage(id, title, next, backHref, confirm, footer){
  const isLogin = confirm === 'login';
  const heading = isLogin ? 'Enter your PIN' : (confirm ? 'Confirm your PIN' : 'Create your PIN');
  const sub = isLogin ? 'Enter your 6-digit PIN to continue as Tameer.' : (confirm ? 'Re-enter the 6-digit PIN to confirm.' : "You'll use this PIN for quick, secure access.");
  return page({
    title, back:'back', backHref, footer,
    body:`
      <div class="center" style="padding-top:10px;">
        <div class="h2">${heading}</div>
        <div class="p">${sub}</div>
      </div>
      <div class="pin-dots">${'<span></span>'.repeat(6)}</div>
      <div class="pin-status" data-pin-status></div>
      <div class="keypad" data-next="${next}" data-confirm="${confirm===true?'1':(isLogin?'login':'0')}">
        ${[1,2,3,4,5,6,7,8,9].map(n=>`<button data-key="${n}">${n}</button>`).join('')}
        <button class="ghost" data-key=""></button>
        <button data-key="0">0</button>
        <button data-key="back">⌫</button>
      </div>`,
  });
}
S['create-pin'] = pinPage('create-pin','Create PIN','confirm-pin.html','create-password.html', false);
S['confirm-pin'] = pinPage('confirm-pin','Confirm PIN','quick-login.html','create-pin.html', true);
S['pin-login'] = pinPage('pin-login','Enter PIN','home.html','biometric-login.html', 'login', link('Use biometric login instead','biometric-login.html'));

S['quick-login'] = page({
  title:'Quick Login Setup', back:'back', backHref:'confirm-pin.html',
  body:`
    <div class="center" style="padding-top:6px;">
      <div class="icon-circle hero" style="margin:0 auto 18px;">${icon('fingerprint',42)}</div>
    </div>
    <div class="h2 center">Set up quick login</div>
    <div class="p center">Use Face ID or fingerprint for faster, secure access — you can change this anytime in Settings.</div>
    <ul style="list-style:none;padding:0;margin:16px 0;">
      <li class="check-row" style="border:none;"><div class="icon-circle" style="width:34px;height:34px;border-radius:11px;">${icon('shield',17)}</div><div class="txt" style="padding-top:6px;">Enhanced security for your account</div></li>
      <li class="check-row" style="border:none;"><div class="icon-circle" style="width:34px;height:34px;border-radius:11px;">${icon('fingerprint',17)}</div><div class="txt" style="padding-top:6px;">Log in with a glance or a touch</div></li>
    </ul>`,
  footer: btn('Enable biometric login','onboarded.html') + link('Not now','onboarded.html')
});

S['onboarded'] = page({
  title:'', back:'none',
  body:`
    <div class="status-icon success lg" style="position:relative;"><div class="pulse-ring lg"></div>${icon('check',56)}</div>
    <div class="h2 center" style="margin-top:6px;font-size:24px;">You're all set, Tameer!</div>
    <div class="p center" style="font-size:15.5px;line-height:1.6;">Your account is ready. Start exploring financing options tailored for you.</div>`,
  footer: btn('Continue','location-permission.html')
});

S['location-permission'] = page({
  title:'', back:'none',
  body:`
    <div class="center" style="padding-top:20px;">
      <img src="images/illustration-location.svg" style="width:150px;height:150px;" alt="">
      <div class="h2">Enable location access</div>
      <div class="p">We use your location only to confirm eligibility in your region — never shared or sold.</div>
    </div>`,
  footer: btn('Allow location access','home-new.html') + link('Skip for now','home-new.html')
});

/* ---------------- Home & products ---------------- */
function productCards(){
  return `
  <div class="product-card pf">
    <div class="ptitle">Personal finance</div>
    <div class="pdesc">Get quick access and flexible financing for your personal needs.</div>
    ${btn('Apply now','apply-disclaimer.html')}
  </div>
  <div class="product-card cf">
    <div class="ptitle">Consumer finance</div>
    <div class="pdesc">Buy now, pay later on electronics, furniture and more.</div>
    ${btn('Apply now','apply-disclaimer.html','btn-secondary')}
  </div>
  <div class="product-card rf">
    <div class="ptitle">Real estate finance</div>
    <div class="pdesc">Shariah-compliant home financing plans.</div>
    ${btn('Apply now','apply-disclaimer.html','btn-secondary')}
  </div>`;
}

S['home-new'] = page({
  title:'My Account', back:'none', actions: headerActions(),
  body:`
    <div class="greet"><div class="avatar">T</div><div><div class="name">Hello, Tameer</div><div class="sub">Loan applicant</div></div></div>
    <div class="h3">Financing products</div>
    ${productCards()}`,
  nav:'home'
});

S['notifications'] = page({
  title:'Notifications', back:'back', backHref:'home-new.html',
  body:`
    ${listItem('bank','Application update','Your personal finance application is being reviewed.','#')}
    ${listItem('card','Payment reminder','Your installment of SAR 590.00 is due in 3 days.','#')}
    ${listItem('shield','Security','A new device signed in to your account.','#')}
    ${listItem('bulb','Offer for you','You may be eligible for additional financing.','#')}`,
  footer: link('Back to home','home-new.html')
});

S['faq'] = page({
  title:'FAQ', back:'back', backHref:'home-new.html',
  body:`
    <div class="h2">Frequently asked questions</div>
    <div class="p" style="margin-bottom:14px;">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua — here are a few things customers often ask before applying.</div>
    <div class="card">
      <div><div class="lbl" style="font-weight:700;color:var(--ink);">How is my financing amount decided?</div><div class="p" style="margin-top:4px;">Your maximum finance amount depends on your verified income, expenses and credit profile. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.</div></div>
    </div>
    <div class="card">
      <div class="row-stack"><div class="lbl" style="font-weight:700;color:var(--ink);">Is this Shariah-compliant?</div><div class="p" style="margin-top:4px;">Yes, all Azentio Finance products are structured to be Shariah-compliant. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</div></div>
    </div>
    <div class="card">
      <div class="row-stack"><div class="lbl" style="font-weight:700;color:var(--ink);">How long does approval take?</div><div class="p" style="margin-top:4px;">Most applications receive a decision the same day, fully digitally. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</div></div>
    </div>
    <div class="card">
      <div class="row-stack"><div class="lbl" style="font-weight:700;color:var(--ink);">Can I pay off my loan early?</div><div class="p" style="margin-top:4px;">Yes, early settlement is available at any time from the Payments tab. Duis aute irure dolor in reprehenderit in voluptate velit esse.</div></div>
    </div>
    <div class="card">
      <div><div class="lbl" style="font-weight:700;color:var(--ink);">What documents do I need?</div><div class="p" style="margin-top:4px;">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Excepteur sint occaecat cupidatat non proident.</div></div>
    </div>`,
  footer: link('Back to home','home-new.html')
});

S['logout'] = page({
  title:'', back:'none',
  body:`
    <div class="status-icon" style="background:var(--bg);color:var(--body-text);">${icon('logout',40)}</div>
    <div class="h2 center">You've been logged out</div>
    <div class="p center">Thanks for using Azentio Finance. See you again soon.</div>`,
  footer: btn('Back to login','login.html')
});

S['home'] = page({
  title:'My Account', back:'none', actions: headerActions(),
  body:`
    <div class="greet"><div class="avatar">T</div><div><div class="name">Hello, Tameer</div><div class="sub">1 active loan</div></div></div>
    <div class="card card-highlight">
      <div class="row"><span class="lbl">Personal finance</span><span class="val">SAR 0.00 due</span></div>
      <div class="progress"><div style="width:15%"></div></div>
      <div class="row" style="border:none;padding-top:2px;"><span class="small">SAR 2,180.00 paid</span><span class="small">SAR 15,000.00 limit</span></div>
      ${btn('Pay now','payment-method.html')}
    </div>
    <div class="h3">Explore more</div>
    <div class="product-card cf">
      <div class="ptitle">Personal finance</div>
      <div class="pdesc">You're eligible for additional financing of up to SAR 15,000.</div>
      ${btn('Apply now','apply-disclaimer.html','btn-secondary')}
    </div>`,
  nav:'home'
});

/* ---------------- Guest product exploration (pre-signup) ---------------- */
function exploreCards(){
  return `
  <div class="product-card pf">
    <div class="ptitle">Personal finance</div>
    <div class="pdesc">Get quick access and flexible financing for your personal needs.</div>
    ${btn('Explore Now','explore-detail.html')}
  </div>
  <div class="product-card cf">
    <div class="ptitle">Consumer finance</div>
    <div class="pdesc">Buy now, pay later on electronics, furniture and more.</div>
    ${btn('Explore Now','explore-detail.html','btn-secondary')}
  </div>
  <div class="product-card rf">
    <div class="ptitle">Real estate finance</div>
    <div class="pdesc">Shariah-compliant home financing plans.</div>
    ${btn('Explore Now','explore-detail.html','btn-secondary')}
  </div>`;
}

S['explore-products'] = page({
  title:'', back:'back', backHref:'sign-up-otp-success.html',
  body:`
    <div class="h2">Explore financing products</div>
    <div class="p">Take a look around — no commitment yet. Pick a product to see a rough estimate.</div>
    ${exploreCards()}`
});

S['explore-detail'] = page({
  title:'Estimate', back:'back', backHref:'explore-products.html',
  body:`
    <div class="h3">Maximum finance amount</div>
    <div class="big-amount" data-amount-out>SAR 12,000.00</div>
    <div class="field">
      <div class="sar-input-row">
        <span class="sar-prefix"><span class="code">SAR</span></span>
        <input class="input sar-number-input" type="text" data-amount-display readonly value="12,000.00">
      </div>
      <div class="hint">Drag the slider below to see how the numbers change</div>
    </div>
    <input type="range" min="2000" max="15000" step="500" value="12000" data-amount-range style="width:100%;margin:6px 0 4px;">
    <div class="range-minmax"><span>SAR 2,000</span><span>SAR 15,000</span></div>
    <div class="select-field"><label>Tenor</label><select data-tenor-select><option value="12">12 months</option><option value="24" selected>24 months</option><option value="36">36 months</option></select></div>
    <div class="card">
      <div class="row row-emphasis"><span class="lbl">Estimated monthly installment</span><span class="val val-lg" data-installment-out>SAR 590.00</span></div>
      ${row('Estimated total contract value', `<span data-contract-out>SAR 14,160.00</span>`)}
      ${row('Estimated APR', `<span data-apr-out>17.28%</span>`)}
    </div>
    <div class="hint card-hint">This is a rough estimate only. Your actual offer depends on your verified details and credit profile.</div>`,
  footer: btn('Continue to apply','sign-up-details.html') + link('Back to products','explore-products.html')
});

/* ---------------- Personal finance application ---------------- */
S['apply-disclaimer'] = page({
  title:'', back:'close', backHref:'home-new.html',
  body:`
    <div class="h2">Easy financing, done right</div>
    <div class="p">Get an instant decision and flexible repayment terms.</div>
    <ul style="list-style:none;padding:0;">
      <li class="check-row" style="border:none;pointer-events:none;"><div class="icon-circle" style="width:30px;height:30px;border-radius:10px;">${icon('check',15)}</div><div class="txt" style="padding-top:4px;">Instant approval — a decision in minutes</div></li>
      <li class="check-row" style="border:none;pointer-events:none;"><div class="icon-circle" style="width:30px;height:30px;border-radius:10px;">${icon('check',15)}</div><div class="txt" style="padding-top:4px;">Up to SAR 150,000 in financing</div></li>
      <li class="check-row" style="border:none;pointer-events:none;"><div class="icon-circle" style="width:30px;height:30px;border-radius:10px;">${icon('check',15)}</div><div class="txt" style="padding-top:4px;">Shariah compliant, fully transparent pricing</div></li>
      <li class="check-row" style="border:none;pointer-events:none;"><div class="icon-circle" style="width:30px;height:30px;border-radius:10px;">${icon('check',15)}</div><div class="txt" style="padding-top:4px;">Up to 60 months repayment</div></li>
    </ul>
    <div class="small" style="margin-top:8px;"><a href="#" style="color:var(--primary-dark);font-weight:700;">View full eligibility criteria &amp; pricing example →</a></div>`,
  footer: btn('I Accept','apply-family-info.html') + link('Decline','home-new.html')
});

S['apply-family-info'] = page({
  title:'Family Information', back:'back', backHref:'apply-disclaimer.html',
  body:`
    ${stepper(1,7,'Family Info')}
    <div class="h2">Family information</div>
    ${selectField('Residential status',['Own','Rent','Family-owned'])}
    ${selectField('Marital status',['Single','Married'])}
    ${switchRow('Are you the primary income earner in your household?', false, 'breadwinner')}
    <div class="reveal-wrap" data-reveal="breadwinner">
      ${numericStepper('Number of dependents', 0, 0, 20)}
      ${numericStepper('Domestic workers', 0, 0, 10)}
      ${numericStepper('Private school dependents', 0, 0, 10)}
    </div>`,
  footer: btn('Continue','apply-expenses.html')
});

S['apply-expenses'] = page({
  title:'Expenses', back:'back', backHref:'apply-family-info.html',
  body:`
    ${stepper(2,7,'Expenses')}
    <div class="h2">Expenses</div>
    <div class="p">This helps us tailor an offer you can comfortably afford.</div>
    ${sarField('Food and beverage')}
    ${sarField('Education')}
    ${sarField('Housing')}
    ${sarField('Healthcare &amp; Insurance')}
    ${sarField('Telecom')}
    ${sarField('Expected future expenses')}
    ${sarField('Other expenses')}
    ${sarField('Average monthly rent')}`,
  footer: btn('Continue','apply-processing.html')
});

S['apply-processing'] = page({
  title:'', back:'none',
  body:`
    <div class="center" style="padding-top:26px;">
      <div class="icon-circle" style="width:70px;height:70px;border-radius:22px;margin:0 auto 18px;"><span class="spinner dark" style="width:26px;height:26px;"></span></div>
      <div class="h2">We're processing your request</div>
      <div class="p">This usually takes less than a minute.</div>
    </div>
    <div class="card">
      <div class="skel-row" data-delay="0"><div class="skel-check pending">○</div><div class="skel-txt">Verifying your data</div></div>
      <div class="skel-row" data-delay="900"><div class="skel-check pending">○</div><div class="skel-txt">Verifying income</div></div>
      <div class="skel-row" data-delay="1800"><div class="skel-check pending">○</div><div class="skel-txt">Pulling credit report</div></div>
      <div class="skel-row" data-delay="2700"><div class="skel-check pending">○</div><div class="skel-txt">Checking eligibility</div></div>
    </div>`,
  footer: btn('Proceed','apply-offer.html','btn-primary','disabled data-auto-continue')
});

S['apply-offer'] = page({
  title:'Financing Offer', back:'back', backHref:'apply-processing.html',
  body:`
    ${stepper(3,7,'Your Offer')}
    <div class="h3">Maximum finance amount</div>
    <div class="big-amount" data-amount-out>SAR 12,000.00</div>
    <div class="field">
      <div class="sar-input-row">
        <span class="sar-prefix"><span class="code">SAR</span></span>
        <input class="input sar-number-input" type="text" data-amount-display readonly value="12,000.00">
      </div>
      <div class="hint">Drag the slider below to adjust your amount</div>
    </div>
    <input type="range" min="2000" max="15000" step="500" value="12000" data-amount-range style="width:100%;margin:6px 0 4px;">
    <div class="range-minmax"><span>SAR 2,000</span><span>SAR 15,000</span></div>
    <div class="select-field"><label>Tenor</label><select data-tenor-select><option value="12">12 months</option><option value="24" selected>24 months</option><option value="36">36 months</option></select></div>
    ${selectField('Purpose of finance',['Home improvement','Education','Medical expenses','Other'], true)}
    <div class="card">
      <div class="row row-emphasis"><span class="lbl">Monthly installment</span><span class="val val-lg" data-installment-out>SAR 590.00</span></div>
      ${row('Total contract value', `<span data-contract-out>SAR 14,160.00</span>`)}
      ${row('Total profit', `<span data-profit-out>SAR 2,160.00</span>`)}
      ${row('Processing fee', `<span data-fee-out>SAR 120.00</span>`)}
      ${row('APR (Annual Percentage Rate)', `<span data-apr-out>17.28%</span>`)}
      ${row('Profit %', `<span data-profitpct-out>9.00%</span>`)}
    </div>
    <div class="hint card-hint">APR reflects the effective annual cost of financing, including profit and fees.</div>`,
  footer: btn('Continue','apply-review-offer.html')
});

S['apply-review-offer'] = page({
  title:'Review Final Offer', back:'back', backHref:'apply-offer.html',
  body:`
    ${stepper(4,7,'Review')}
    <div class="h2">Review your offer</div>
    <div class="p">Please review the details below before you accept.</div>
    <div class="card">
      <div class="row row-emphasis"><span class="lbl">Installment amount</span><span class="val val-lg">SAR 590.00</span></div>
      ${row('Offer reference','PF20250417')}
      ${row('Tenor','24 months')}
      ${row('First payment date','14 May 2025')}
      ${row('Financing rate (APR)','15.4%')}
      ${row('Total payable','SAR 14,160.00')}
      ${row('Admin fee incl. VAT','SAR 138.00')}
    </div>
    <div class="hint card-hint">This offer is valid for 48 hours from when it was issued.</div>`,
  footer: btn('Accept offer','apply-bank-details.html') + link('Decline','home-new.html','data-confirm="Decline this offer and exit your application?" data-confirm-label="Decline"')
});

S['apply-bank-details'] = page({
  title:'Bank Details', back:'back', backHref:'apply-review-offer.html',
  body:`
    ${stepper(5,7,'Bank Details')}
    <div class="h2">Where should we send the funds?</div>
    <div class="account-group" data-account-group>
      <div class="account-group-head">Account 1</div>
      ${selectField('Bank',['Al Rajhi Bank','Saudi National Bank','Riyad Bank','Alinma Bank'])}
      ${field('IBAN number','SA00 0000 0000 0000 0000 0000','text','data-mask="iban-sa" required')}
    </div>
    <div class="hint hint-strong">Funds will only be disbursed to a bank account held in your own name.</div>
    <div class="account-group hidden" data-account-group-extra>
      <div class="account-group-head"><span>Account 2</span><button type="button" class="icon-btn-sm" data-remove-account aria-label="Remove account">${icon('close',14)}</button></div>
      ${selectField('Bank',['Al Rajhi Bank','Saudi National Bank','Riyad Bank','Alinma Bank'])}
      ${field('IBAN number','SA00 0000 0000 0000 0000 0000','text','data-mask="iban-sa"')}
    </div>
    <button type="button" class="add-account-btn" data-add-account><span class="add-account-icon">${icon('plus',14)}</span>Add another account</button>`,
  footer: btn('Continue','apply-call-verification.html')
});

S['apply-call-verification'] = page({
  title:'Call Verification', back:'back', backHref:'apply-bank-details.html',
  body:`
    ${stepper(6,7,'Verification')}
    <div class="center" style="padding-top:10px;">
      <div class="icon-circle" style="width:70px;height:70px;border-radius:22px;margin:0 auto 18px;">${icon('phone',30)}</div>
      <div class="h2">Quick call to confirm</div>
      <div class="p">We need a quick call to verify a few details before finalizing your application.</div>
      <div class="badge badge-brand">Typical wait time: under 5 minutes</div>
    </div>`,
  footer: btn('Call us now','apply-call-complete.html') + link('Decline','home-new.html')
});

S['apply-call-complete'] = page({
  title:'', back:'none',
  body:`
    <div class="status-icon success lg" style="position:relative;"><div class="pulse-ring lg"></div>${icon('check',56)}</div>
    <div class="h2 center" style="margin-top:6px;font-size:24px;">Call verification complete</div>
    <div class="p center" style="font-size:15.5px;line-height:1.6;">Confirmation successful — you can proceed with your application.</div>`,
  footer: btn('Proceed','apply-sign-contract.html')
});

S['apply-sign-contract'] = page({
  title:'Sign Contract', back:'back', backHref:'apply-call-complete.html',
  body:`
    ${stepper(7,7,'Sign & Finalize')}
    <div class="h2">Review &amp; sign</div>
    <div class="p">Please review the contract terms before signing.</div>
    <div class="card" style="max-height:200px;overflow:hidden;position:relative;">
      <div style="height:8px;background:var(--line);border-radius:4px;width:95%;margin:8px 0;"></div>
      <div style="height:8px;background:var(--line);border-radius:4px;width:88%;margin:8px 0;"></div>
      <div style="height:8px;background:var(--line);border-radius:4px;width:92%;margin:8px 0;"></div>
      <div style="height:8px;background:var(--line);border-radius:4px;width:80%;margin:8px 0;"></div>
      <div style="height:8px;background:var(--line);border-radius:4px;width:90%;margin:8px 0;"></div>
      <div style="position:absolute;bottom:0;left:0;right:0;height:28px;background:var(--surface);border-top:1px solid var(--line);"></div>
    </div>
    <a class="btn-link" href="#" style="text-align:left;">View full contract PDF →</a>
    ${checkRow('I have read and agree to the terms and conditions of this financing contract', true)}`,
  footer: btn('Sign contract','apply-promissory-note.html','btn-primary','disabled data-requires-consent') + link('Decline','home-new.html')
});

S['apply-promissory-note'] = page({
  title:'Promissory Note', back:'back', backHref:'apply-sign-contract.html',
  body:`
    ${stepper(7,7,'Sign & Finalize')}
    <div class="h2">Promissory note</div>
    <div class="p">Please review and sign the promissory note to complete disbursement.</div>
    <div class="doc-preview">${icon('doc',34)}<span class="small">Document preview</span></div>
    <div class="center" style="margin-top:14px;">
      <div class="countdown" data-countdown="15:36" data-expired-text="Session expired — please restart signing">⏱ <span class="cd-time">15:36</span> remaining to sign</div>
      <div class="small" style="margin-top:8px;">If time runs out, you can safely restart — none of your progress on the loan itself is lost.</div>
    </div>`,
  footer: btn('Proceed','apply-success.html') + link('Decline','home-new.html')
});

S['apply-success'] = page({
  title:'', back:'close', backHref:'home.html',
  body:`
    <div class="status-icon success" style="position:relative;"><div class="pulse-ring"></div>${icon('check',40)}</div>
    <div class="h2 center">Successful disbursement!</div>
    <div class="p center">Your financing has been approved and funds are on their way.</div>
    <div class="card">
      ${row('Amount disbursed','SAR 12,000.00')}
      ${row('First installment date','14 May 2025')}
      ${row('Monthly installment','SAR 590.00')}
      ${row('Tenor','24 months')}
      ${row('Contract number','TJR20250417')}
    </div>`,
  footer: btn('View repayment schedule','repayment-schedule.html') + btn('Done','home.html','btn-secondary')
});

/* ---------------- Loan management ---------------- */
S['loans'] = page({
  title:'My Loans', back:'close', backHref:'home.html',
  body:`
    <div class="card">
      <div class="row"><span style="font-weight:700;">Personal finance</span><span class="badge badge-success">Disbursed</span></div>
      <div class="big-amount" style="font-size:22px;margin:8px 0;">SAR 2,180.00</div>
      <div class="row" style="border:none;padding-top:0;"><span class="small">Disbursed 14 Nov 2025</span><span class="small">Due 14 Dec 2025</span></div>
      ${btn('View details','repayment-schedule.html','btn-secondary')}
    </div>`,
  nav:'loans'
});

S['payments'] = page({
  title:'Upcoming Payments', back:'close', backHref:'home.html', extraClass:'page-payments',
  body:`
    ${listItem('calendar','Installment — Dec 2025','Due 14 Dec 2025', null, 'SAR 590.00')}
    ${listItem('calendar','Installment — Jan 2026','Due 14 Jan 2026', null, 'SAR 590.00')}
    ${listItem('calendar','Installment — Feb 2026','Due 14 Feb 2026', null, 'SAR 590.00')}
    <div style="margin-top:16px;">${btn('Pay next installment','payment-method.html')}</div>`,
  nav:'pay'
});

S['payment-method'] = page({
  title:'', back:'close', backHref:'payments.html',
  body:`
    <div class="h2">Choose payment method</div>
    ${listItem('bank','Bank transfer','Pay via bank transfer')}
    ${listItem('card','Debit / credit card','Pay online instantly')}
    ${listItem('apple','Apple Pay','Pay with one tap')}`,
  footer: btn('Pay SAR 590.00','payment-success.html')
});

S['payment-success'] = page({
  title:'', back:'none',
  body:`
    <div class="status-icon success" style="position:relative;"><div class="pulse-ring"></div>${icon('check',40)}</div>
    <div class="h2 center">Payment completed!</div>
    <div class="card">
      ${row('Amount','SAR 590.00')}
      ${row('Payment date','14 Dec 2025')}
      ${row('Payment method','Debit card')}
      ${row('Operation number','TXN10493')}
    </div>`,
  footer: btn('Done','home.html')
});

S['repayment-schedule'] = page({
  title:'Repayment Schedule', back:'back', backHref:'loans.html',
  body:`
    <div class="h2">Repayment schedule</div>
    ${[1,2,3,4,5].map(i=>listItem('calendar', `Installment ${i}`, 'Due 14 '+['Dec 2025','Jan 2026','Feb 2026','Mar 2026','Apr 2026'][i-1], null, i===1?'<span class="badge badge-success">Paid</span>':'<span class="badge badge-neutral">Upcoming</span>')).join('')}`,
  footer: link('Back to my loans','loans.html')
});

S['more'] = page({
  title:'', back:'close', backHref:'home.html',
  body:`
    <div class="h2">More</div>
    ${listItem('doc','Documents', null, 'documents.html')}
    ${listItem('txn','Transactions', null, 'transactions.html')}
    ${listItem('edit','Requests', null, 'submit-request.html')}
    ${listItem('alert','Complaints', null, 'submit-complaint.html')}
    ${listItem('settings','Settings', null, 'settings.html')}`,
  nav:'more'
});

S['settings'] = page({
  title:'Settings', back:'back', backHref:'more.html',
  body:`
    <div class="card">
      ${switchRow('Push notifications', true, 'notif-push')}
      ${switchRow('Email alerts', true, 'notif-email')}
      ${switchRow('Biometric login', false, 'settings-biometric')}
    </div>
    <div class="h3">Language</div>
    ${langSwitch()}`,
  nav:'more'
});

S['documents'] = page({
  title:'Documents', back:'back', backHref:'more.html',
  body:`
    ${listItem('doc','Contract',null,'#','⬇')}
    ${listItem('doc','VAT on fees',null,'#','⬇')}`,
  footer: link('Back to menu','more.html')
});

S['transactions'] = page({
  title:'Transaction History', back:'back', backHref:'more.html',
  body:`
    ${[1,2,3].map(i=>listItem('txn','Installment payment','14 '+['Dec 2025','Nov 2025','Oct 2025'][i-1],'transaction-details.html','SAR 590.00')).join('')}`,
  footer: link('Back to menu','more.html')
});

S['transaction-details'] = page({
  title:'', back:'close', backHref:'transactions.html',
  body:`
    <div class="h2">Payment details</div>
    <div class="card">
      ${row('Payment reference','TXN10493')}
      ${row('Amount','SAR 590.00')}
      ${row('Payment method','Card')}
      ${row('Date','14 Dec 2025')}
    </div>`,
  footer: btn('Download receipt','transaction-details.html','btn-secondary')
});

S['submit-request'] = page({
  title:'', back:'back', backHref:'more.html',
  body:`
    <div class="h2">Loan requests</div>
    ${selectField('Category',['Statement','Settlement letter','Amendment','Other'], true)}
    ${selectField('Sub-category',['General','Urgent'])}
    ${selectField('Reason',['Rescheduling','Documentation','Other'], true)}
    ${field('Description (optional)','Add more details')}`,
  footer: btn('Submit','more.html')
});

S['submit-complaint'] = page({
  title:'', back:'back', backHref:'more.html',
  body:`
    <div class="h2">Submit a complaint</div>
    ${selectField('Category',['Service','Payments','App issue','Other'], true)}
    ${field('Description','Describe the issue','text','required')}`,
  footer: btn('Submit','more.html')
});

/* ================================================================
   WRITE FILES
   ================================================================ */
const titles = {
  index:'Welcome', login:'Login', 'sign-up':'Sign Up', 'sign-up-otp':'Verify Code', 'sign-up-otp-success':'Verified', 'sign-up-details':'Your Details', 'terms-conditions':'Terms & Conditions',
  'nafath-verification':'Nafath Verification', 'nafath-success':'Verified', 'create-password':'Create Password',
  'create-pin':'Create PIN', 'confirm-pin':'Confirm PIN', 'quick-login':'Quick Login', 'onboarded':'Onboarded',
  'biometric-login':'Biometric Login', 'pin-login':'Enter PIN',
  'location-permission':'Location', 'home-new':'Home', 'home':'Home', 'explore-products':'Explore', 'explore-detail':'Estimate', 'apply-disclaimer':'Apply',
  'notifications':'Notifications', 'faq':'FAQ', 'logout':'Log Out',
  'apply-family-info':'Family Info', 'apply-expenses':'Expenses', 'apply-processing':'Processing',
  'apply-offer':'Offer', 'apply-review-offer':'Review Offer', 'apply-bank-details':'Bank Details',
  'apply-call-verification':'Call Verification', 'apply-call-complete':'Call Complete',
  'apply-sign-contract':'Sign Contract', 'apply-promissory-note':'Promissory Note', 'apply-success':'Success',
  'loans':'My Loans', 'payments':'Payments', 'payment-method':'Payment Method', 'payment-success':'Payment Success',
  'repayment-schedule':'Repayment Schedule', 'more':'More', 'settings':'Settings', 'documents':'Documents', 'transactions':'Transactions',
  'transaction-details':'Transaction Details', 'submit-request':'Submit Request', 'submit-complaint':'Submit Complaint',
};

let count = 0;
for(const key of Object.keys(S)){
  const html = shell(S[key], titles[key]||key);
  fs.writeFileSync(path.join(OUT, key+'.html'), html);
  count++;
}
console.log('Generated', count, 'pages');
console.log(Object.keys(S).sort().join('\n'));
