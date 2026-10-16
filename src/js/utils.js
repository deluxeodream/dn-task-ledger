/* ---------- helpers ---------- */
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function uid(){return Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-4);}
function $(s){return document.querySelector(s);}
function pad(n){return (n<10?'0':'')+n;}
function dateKey(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());}
var MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var DOW=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
function fmtDay(d){return DOW[d.getDay()]+' '+d.getDate()+' '+MON[d.getMonth()]+' '+d.getFullYear();}
function fmtShort(d){return MON[d.getMonth()]+' '+d.getDate();}
function fmtGold(q,full){
  var cp=Math.round((Number(q)||0)*10000), g=Math.floor(cp/10000), s=Math.floor((cp%10000)/100), c=cp%100;
  return full ? g.toLocaleString('en-US')+'g '+pad(s)+'s '+pad(c)+'c' : g.toLocaleString('en-US')+'g';
}
function fmtCompact(n){
  if(n>=1e9) return (n/1e9).toFixed(n%1e9?1:0)+'B';
  if(n>=1e6) return (n/1e6).toFixed(n%1e6?1:0)+'M';
  if(n>=1e3) return (n/1e3).toFixed(n%1e3?1:0)+'k';
  return String(n);
}
function fmtQty(r){
  if(r.item==='Gold') return fmtGold(r.qty,true);
  return r.qtyText ? r.qtyText : Number(r.qty).toLocaleString('en-US');
}
function rel(ts){
  var m=Math.round((Date.now()-ts)/60000);
  if(m<1) return 'just now'; if(m<60) return m+' min ago';
  var h=Math.round(m/60); if(h<24) return h+' h ago';
  var d=Math.round(h/24); return d+' d ago';
}

/* ---------- weekly reset: Saturday 09:00 local time ---------- */
function weekStart(d){
  var x=new Date(d), back=(x.getDay()-6+7)%7;
  var s=new Date(x.getFullYear(),x.getMonth(),x.getDate()-back,9,0,0,0);
  if(s>x) s=new Date(s.getFullYear(),s.getMonth(),s.getDate()-7,9,0,0,0);
  return s;
}
function addDays(d,n){return new Date(d.getFullYear(),d.getMonth(),d.getDate()+n,d.getHours(),d.getMinutes(),0,0);}
