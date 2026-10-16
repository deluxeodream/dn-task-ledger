/* ---------- aggregation ---------- */
function isGoldItem(name){return name==='Gold'||name==='Hero Coin';}
function goldOf(rewards){return rewards.reduce(function(s,r){return s+(isGoldItem(r.item)?Number(r.qty)||0:0);},0);}
function aggregate(list){
  var A={clears:0,gold:0,coinGold:0,coins:0,items:{},byTask:{},byChar:{}};
  list.forEach(function(e){
    if(!e.diff) return;
    A.clears++;
    var g=goldOf(e.rewards||[]); A.gold+=g;
    if(e.coinSold){A.coins+=e.coinSold; A.coinGold+=e.coinSold*(e.coinRate||0);}
    (e.rewards||[]).forEach(function(r){
     var nm=isGoldItem(r.item)?'Gold':r.item;
var it=A.items[nm]||(A.items[nm]={item:nm,qty:0,ranged:false}); it.qty+=Number(r.qty)||0;
 if(r.qtyText)it.ranged=true;
    });
    var bt=A.byTask[e.taskName||e.taskId]||(A.byTask[e.taskName||e.taskId]={name:e.taskName||e.taskId,n:0,gold:0}); bt.n++; bt.gold+=g;
    var ck=(e.acc||'')+'|'+(e.ign||'');
    var bc=A.byChar[ck]||(A.byChar[ck]={ign:e.ign||'Removed character',acc:e.acc||'',n:0,gold:0}); bc.n++; bc.gold+=g;
  });
  return A;
}
function inRange(a,b){return S.entries.filter(function(e){return e.diff&&e.ts>=a.getTime()&&e.ts<b.getTime();});}
function period(kind,off){
  var now=new Date(), s,e,label;
  if(kind==='daily'){s=new Date(now.getFullYear(),now.getMonth(),now.getDate()+off);e=new Date(s.getFullYear(),s.getMonth(),s.getDate()+1);label=fmtDay(s);}
  else if(kind==='weekly'){s=addDays(weekStart(now),off*7);e=addDays(s,7);label=fmtShort(s)+' 09:00 to '+fmtShort(e)+' 09:00';}
  else {s=new Date(now.getFullYear(),now.getMonth()+off,1);e=new Date(s.getFullYear(),s.getMonth()+1,1);label=MON[s.getMonth()]+' '+s.getFullYear();}
  return {s:s,e:e,label:label};
}
function shortLabel(kind,p){return kind==='daily'?DOW[p.s.getDay()]+' '+p.s.getDate():(kind==='weekly'?fmtShort(p.s):MON[p.s.getMonth()]);}
function series(kind,off,n){
  var out=[],i;
  for(i=off-n+1;i<=off;i++){var p=period(kind,i); out.push({label:shortLabel(kind,p),value:aggregate(inRange(p.s,p.e)).gold,cur:i===off});}
  return out;
}
