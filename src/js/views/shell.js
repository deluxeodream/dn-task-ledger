/* ---------- views ---------- */
function acctOptions(selected,withAll){
  var o=withAll?'<option value="all"'+(selected==='all'?' selected':'')+'>All accounts</option>':'';
  return o+S.accounts.map(function(a){return '<option value="'+a.id+'"'+(a.id===selected?' selected':'')+'>'+esc(a.name)+'</option>';}).join('');
}
function weekStats(){
  var ts=enabled(), total=S.chars.length*ts.length, done=0;
  S.chars.forEach(function(c){ts.forEach(function(t){if(isDone(c.id,t.id))done++;});});
  var list=S.entries.filter(function(e){return e.week===WK&&e.diff;}), A=aggregate(list);
  return {total:total,done:done,pct:total?Math.round(done/total*100):0,gold:A.gold,A:A,ts:ts};
}
function countdown(){
  var ms=addDays(WKS,7).getTime()-Date.now(); if(ms<0)ms=0;
  var m=Math.floor(ms/60000), d=Math.floor(m/1440), h=Math.floor((m%1440)/60), mm=m%60;
  return d+'d '+h+'h '+pad(mm)+'m';
}
function kpi(icon,label,val,extra){return '<div class="kpi"><div class="k">'+ico(icon)+esc(label)+'</div><div class="v num">'+val+'</div>'+(extra||'')+'</div>';}
function meter(p){return '<div class="meter"><i style="width:'+Math.max(0,Math.min(100,p))+'%"></i></div>';}

function shell(){
  var titles={dashboard:'Dashboard',tracker:'Weekly Tracker',reports:'Reports',manage:'Manage'};
  var nav=[['dashboard','dash','Dashboard'],['tracker','list','Weekly Tracker'],['reports','chart','Reports'],['manage','sliders','Manage']];
  var rail='<aside class="rail"><div class="brand"><span>Task Ledger</span></div>'+
    '<nav class="nav" aria-label="Sections"><div class="nav-label">Workspace</div>'+
    nav.map(function(n){return '<button data-act="nav" data-p="'+n[0]+'"'+(ui.page===n[0]?' aria-current="page"':'')+'>'+ico(n[1])+n[2]+'</button>';}).join('')+'</nav>'+
    '<div class="reset-card"><div class="k">Weekly reset</div><div class="v num" id="cd">'+countdown()+'</div><div class="s">Saturday 09:00, local time. Week of '+fmtShort(WKS)+'.</div></div></aside>';
  var warn=storageOk?'':'<div class="note">This browser blocked saving. Use Manage, Settings &amp; data, Export to keep a copy.</div>';
  return '<div class="shell">'+rail+'<main class="work"><header class="top"><div><div class="crumb">Task Ledger / '+titles[ui.page]+'</div><h1>'+titles[ui.page]+'</h1></div><div class="top-actions">'+topActions()+'</div></header>'+warn+'<div class="page">'+pageHtml()+'</div></main></div>';
}
function topActions(){
  if(ui.page==='tracker') return '<button class="btn" data-act="nav" data-p="manage">'+ico('plus')+'Add character</button>';
  return '';
}
function pageHtml(){
  if(ui.page==='dashboard') return dashboard();
  if(ui.page==='reports') return reports();
  if(ui.page==='manage') return manage();
  return tracker();
}
