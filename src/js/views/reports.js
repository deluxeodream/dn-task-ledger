/* --- reports --- */
function arkMats(list){
  var M={jade:0,pouch:0,byChar:{}};
  list.forEach(function(e){
    if(!e.diff||e.taskId!=='ark') return;
    var j=0,p=0;
    (e.rewards||[]).forEach(function(r){var q=Number(r.qty)||0; if(/jade fragment/i.test(r.item)) j+=q; else if(/pouch/i.test(r.item)) p+=q;});
    M.jade+=j; M.pouch+=p;
    var k=(e.acc||'')+'|'+(e.ign||''), c=M.byChar[k]||(M.byChar[k]={ign:e.ign||'Removed character',acc:e.acc||'',n:0,jade:0,pouch:0});
    c.n++; c.jade+=j; c.pouch+=p;
  });
  return M;
}
function arkCard(p){
  var t=taskById('ark'), cur=arkMats(inRange(p.s,p.e)), all=arkMats(S.entries);
  if(!t||(!t.enabled&&!all.jade&&!all.pouch)) return '';
  var rows=Object.keys(cur.byChar).map(function(k){return cur.byChar[k];}).sort(function(a,b){return (b.jade+b.pouch)-(a.jade+a.pouch);});
  var n=function(v){return v.toLocaleString('en-US');};
  var stat=function(label,v,a){return '<div class="kpi"><div class="k">'+esc(label)+'</div><div class="v num">'+n(v)+'</div><div class="sub num">All time '+n(a)+'</div></div>';};
  var tbl=rows.length?'<div class="scroll"><table class="tbl"><thead><tr><th>Character</th><th>Account</th><th class="r">Jade fragments</th><th class="r">Pouches</th></tr></thead><tbody>'+rows.map(function(c){return '<tr><td>'+esc(c.ign)+'</td><td>'+esc(c.acc)+'</td><td class="r num">'+n(c.jade)+'</td><td class="r num">'+n(c.pouch)+'</td></tr>';}).join('')+'</tbody></table></div>':'<div class="empty" style="padding:18px">No ARK clears in this period.</div>';
  return '<section class="card"><div class="card-h"><h2>ARK materials</h2><span class="sub">Jade fragments and pouches from weekly chests</span></div><div class="card-b" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px">'+stat('Jade fragments',cur.jade,all.jade)+stat('Pouches',cur.pouch,all.pouch)+'</div>'+tbl+'</section>';
}
function reports(){
  var kind=ui.rpt, p=period(kind,ui.off), A=aggregate(inRange(p.s,p.e));
  var n={daily:7,weekly:8,monthly:6}[kind];
  var items=Object.keys(A.items).map(function(k){return A.items[k];}).sort(function(a,b){if(a.item==='Gold')return -1;if(b.item==='Gold')return 1;return b.qty-a.qty;});
  var anyRanged=items.some(function(i){return i.ranged;});
  var itemTbl=items.length?'<div class="scroll"><table class="tbl"><thead><tr><th>Reward</th><th class="r">Total</th></tr></thead><tbody>'+items.map(function(i){
    return '<tr><td>'+(i.item==='Gold'?'<span class="gold">Gold</span>':esc(i.item))+'</td><td class="r num">'+(i.item==='Gold'?fmtGold(i.qty,true):i.qty.toLocaleString('en-US')+(i.ranged?'*':''))+'</td></tr>';}).join('')+'</tbody></table></div>'+(anyRanged?'<div class="card-b sub">* Items with a range are counted at their lower value.</div>':''):'<div class="empty">No rewards in this period.</div>';
  var tasks=Object.keys(A.byTask).map(function(k){return A.byTask[k];}).sort(function(a,b){return b.n-a.n;});
  var taskTbl=tasks.length?'<div class="scroll"><table class="tbl"><thead><tr><th>Task</th><th class="r">Clears</th><th class="r">Gold</th></tr></thead><tbody>'+tasks.map(function(t){return '<tr><td>'+esc(t.name)+'</td><td class="r num">'+t.n+'</td><td class="r num">'+(t.gold?fmtGold(t.gold,false):'-')+'</td></tr>';}).join('')+'</tbody></table></div>':'<div class="empty">No clears in this period.</div>';
  var chars=Object.keys(A.byChar).map(function(k){return A.byChar[k];}).sort(function(a,b){return b.n-a.n;});
  var charTbl=chars.length?'<div class="scroll"><table class="tbl"><thead><tr><th>Character</th><th>Account</th><th class="r">Clears</th><th class="r">Gold</th></tr></thead><tbody>'+chars.map(function(c){return '<tr><td>'+esc(c.ign)+'</td><td>'+esc(c.acc)+'</td><td class="r num">'+c.n+'</td><td class="r num">'+(c.gold?fmtGold(c.gold,false):'-')+'</td></tr>';}).join('')+'</tbody></table></div>':'<div class="empty">No clears in this period.</div>';
  return '<div class="toolbar" style="justify-content:space-between"><div class="seg" role="group" aria-label="Report period">'+
    ['daily','weekly','monthly'].map(function(k){return '<button data-act="rpt-kind" data-k="'+k+'" aria-pressed="'+(kind===k)+'">'+k[0].toUpperCase()+k.slice(1)+'</button>';}).join('')+'</div>'+
    '<div class="toolbar"><button class="ib" data-act="rpt-prev" aria-label="Previous period">'+ico('left')+'</button><b class="num" style="min-width:150px;text-align:center">'+esc(p.label)+'</b><button class="ib" data-act="rpt-next" aria-label="Next period"'+(ui.off>=0?' disabled style="opacity:.3;cursor:default"':'')+'>'+ico('right')+'</button></div></div>'+
    '<div class="kpis">'+kpi('check','Clears',A.clears)+kpi('coin','Gold earned',fmtGold(A.gold,false),'<div class="sub num">'+fmtGold(A.gold,true)+'</div>')+kpi('list','Reward types',items.length)+kpi('users','Characters active',chars.length)+'</div>'+
    arkCard(p)+'<section class="card"><div class="card-h"><h2>Gold trend</h2><span class="sub">'+(kind==='daily'?'Last 7 days':(kind==='weekly'?'Last 8 game weeks':'Last 6 months'))+'</span></div><div class="card-b">'+barChart(series(kind,ui.off,n))+'</div></section>'+
    '<div class="cols"><section class="card"><div class="card-h"><h2>Rewards earned</h2></div>'+itemTbl+'</section><div class="stack"><section class="card"><div class="card-h"><h2>By task</h2></div>'+taskTbl+'</section><section class="card"><div class="card-h"><h2>By character</h2></div>'+charTbl+'</section></div></div>';
}
