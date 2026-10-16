/* --- dashboard --- */
function nmCard(){
  var t=taskById('nm'); if(!t||!t.enabled) return '';
  var es=S.entries.filter(function(e){return e.week===WK&&e.taskId==='nm'&&e.diff&&diffIndex(t,e.diff)>=0;}), top=-1;
  es.forEach(function(e){var i=diffIndex(t,e.diff); if(i>top)top=i;});
  var head='<div class="card-h"><h2>NM highest clear</h2><span class="sub">This week</span></div>';
  if(top<0) return '<section class="card" style="margin-bottom:12px">'+head+'<div class="card-b sub">No NM clears recorded this week.</div></section>';
  var w=es.filter(function(e){return diffIndex(t,e.diff)===top;}), name=t.difficulties[top].name;
  var rw=(w[0].rewards&&w[0].rewards.length)?w[0].rewards:computeRewards(t,name,false);
  var who=w.map(function(e){return '<span class="badge" style="font-size:12.5px"><b>'+esc(e.ign||'Removed character')+'</b>'+(e.acc?' &middot; '+esc(e.acc):'')+'</span>';}).join(' ');
  var items=rw.map(function(r){return '<span class="badge" style="font-size:12.5px">'+esc(r.item)+' <b class="num">'+esc(fmtQty(r))+'</b></span>';}).join(' ');
  return '<section class="card" style="margin-bottom:12px">'+head+'<div class="card-b" style="display:grid;gap:12px"><div><div class="sub">Highest floor cleared</div><div style="font-family:var(--f-display);font-size:20px;font-weight:600">'+esc(name)+'</div></div>'+
    '<div><div class="sub" style="margin-bottom:6px">Cleared by</div><div class="chips">'+who+'</div></div>'+
    '<div><div class="sub" style="margin-bottom:6px">Rewards</div><div class="chips">'+(items||'<span class="sub">No rewards set for this floor.</span>')+'</div></div></div></section>';
}
function coinCtl(st){
  var w=coinWeek(); if(!w.total) return '';
  var rate=Number(S.settings.coinRate)||0;
  return '<label class="coin" title="Convert all Shiny Hero Coins this week to gold at '+rate.toLocaleString('en-US')+'g each"><span>Shiny Hero Coins</span><b class="num">&times;'+w.total+'</b><input type="checkbox" id="cn-all" data-act="coin-all"'+(w.all?' checked':'')+(w.some?' data-partial="1"':'')+'></label>'+
    (w.sold?'<div class="sub num">incl. '+fmtGold(st.A.coinGold,false)+' from '+w.sold+' coin'+(w.sold===1?'':'s')+' converted</div>':'<div class="sub num">Worth '+fmtGold(w.total*rate,false)+' if converted</div>');
}
function dashboard(){
  var st=weekStats(), h='<div class="kpis">'+
    kpi('target','Weekly progress',st.pct+'<small>%</small>',meter(st.pct))+
    kpi('check','Clears this week',st.A.clears+'<small>'+st.done+' of '+st.total+' tasks</small>')+
    kpi('coin','Gold this week',fmtGold(st.gold,false),coinCtl(st))+
    kpi('clock','Resets in','<span id="cd2">'+countdown()+'</span>','<div class="sub">Saturday 09:00</div>')+'</div>';
  if(!S.chars.length) return h+'<div class="card empty"><h3>Nothing to show yet</h3><span>Add characters and tick off tasks. Totals, gold and trends appear here.</span><button class="btn primary" data-act="nav" data-p="tracker">Open tracker</button></div>';
  var taskBars=st.ts.map(function(t){
    var n=S.chars.filter(function(c){return isDone(c.id,t.id);}).length, p=S.chars.length?Math.round(n/S.chars.length*100):0;
    return '<div class="hbar"><span class="t" title="'+esc(t.name)+'">'+esc(t.name)+'</span>'+meter(p)+'<span class="num">'+n+'/'+S.chars.length+'</span></div>';
  }).join('')||'<div class="sub">No tasks selected.</div>';
  var acctRows=S.accounts.map(function(a){
    var cs=S.chars.filter(function(c){return c.accountId===a.id;}), tot=cs.length*st.ts.length, d=0;
    cs.forEach(function(c){st.ts.forEach(function(t){if(isDone(c.id,t.id))d++;});});
    var p=tot?Math.round(d/tot*100):0;
    return '<div class="hbar"><span class="t" title="'+esc(a.name)+'">'+esc(a.name)+'</span>'+meter(p)+'<span class="num">'+d+'/'+tot+'</span></div>';
  }).join('');
  var recent=S.entries.filter(function(e){return e.diff;}).sort(function(a,b){return b.ts-a.ts;}).slice(0,8);
  var feed=recent.length?'<ul>'+recent.map(function(e){var g=goldOf(e.rewards||[]);
    return '<li><div class="m"><b>'+esc(e.ign||'Removed character')+'</b> cleared '+esc(e.taskName||e.taskId)+'<div>'+(e.diff==='Done'?'':esc(e.diff)+' &middot; ')+esc(e.acc||'')+'</div></div><div style="text-align:right;flex:none">'+(g>0?'<span class="gold">'+fmtGold(g,false)+'</span><br>':'')+'<span class="sub">'+rel(e.ts)+'</span></div></li>';}).join('')+'</ul>':'<div class="sub">No clears recorded yet.</div>';
  return h+nmCard()+'<div class="cols"><div class="stack">'+
    '<section class="card"><div class="card-h"><h2>Gold per game week</h2><span class="sub">Last 8 weeks</span></div><div class="card-b">'+barChart(series('weekly',0,8))+'</div></section>'+
    '<section class="card"><div class="card-h"><h2>Recent activity</h2></div><div class="card-b feed">'+feed+'</div></section></div>'+
    '<div class="stack"><section class="card"><div class="card-h"><h2>Clears by task</h2><span class="sub">Characters done</span></div><div class="card-b bars">'+taskBars+'</div></section>'+
    '<section class="card"><div class="card-h"><h2>Account progress</h2></div><div class="card-b bars">'+acctRows+'</div></section></div></div>';
}
