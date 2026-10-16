/* ---------- storage: IndexedDB (falls back to localStorage, then memory) ---------- */
var DB={db:null};
function idbOpen(){return new Promise(function(res,rej){try{
  var rq=indexedDB.open('nest-ledger',1);
  rq.onupgradeneeded=function(){rq.result.createObjectStore('kv');};
  rq.onsuccess=function(){res(rq.result);}; rq.onerror=function(){rej(rq.error);}; rq.onblocked=function(){rej(new Error('blocked'));};
}catch(e){rej(e);}});}
function idbGet(k){return new Promise(function(res,rej){try{var r=DB.db.transaction('kv','readonly').objectStore('kv').get(k); r.onsuccess=function(){res(r.result);}; r.onerror=function(){rej(r.error);};}catch(e){rej(e);}});}
function idbSet(k,v){return new Promise(function(res,rej){try{var tx=DB.db.transaction('kv','readwrite'); tx.objectStore('kv').put(v,k); tx.oncomplete=function(){res();}; tx.onerror=function(){rej(tx.error);}; tx.onabort=function(){rej(tx.error||new Error('aborted'));};}catch(e){rej(e);}});}
function lsOk(){try{localStorage.setItem(KEY+':t','1'); localStorage.removeItem(KEY+':t'); return true;}catch(e){return false;}}
function legacyState(){try{var r=localStorage.getItem(KEY); return r?migrate(JSON.parse(r)):null;}catch(e){return null;}}
function save(){
  if(DB.db){
    idbSet('state',S).then(function(){if(!storageOk){storageOk=true; render();}},function(){if(storageOk){storageOk=false; render();}});
    return;
  }
  try{localStorage.setItem(KEY,JSON.stringify(S)); storageOk=true;}catch(e){storageOk=false;}
}
function boot(){
  var p;
  try{p=idbOpen().then(function(db){DB.db=db; return idbGet('state');}).then(function(v){return v?migrate(v):(legacyState()||defaults());});}catch(e){p=Promise.reject(e);}
  p.catch(function(){DB.db=null; return legacyState()||defaults();}).then(function(o){
    S=o; ready=true; storageOk=!!DB.db||lsOk(); syncCoins(true); render(); save();
    try{if(navigator.storage&&navigator.storage.persist) navigator.storage.persist();}catch(e){}
  });
}

var ui={page:'tracker',acct:'all',q:'',rpt:'daily',off:0,mtab:'chars',etask:'ark',ediff:'',macct:'',dlg:null,setup:{sel:{}}};
var pages=['dashboard','tracker','reports','manage'];
(function(){var h=(location.hash||'').replace('#',''); if(pages.indexOf(h)>=0) ui.page=h;})();

var WKS=weekStart(new Date()), WK=dateKey(WKS), IDX={};
function buildIdx(){
  IDX={};
  S.entries.forEach(function(e){if(e.week===WK){var k=e.charId+'|'+e.taskId;(IDX[k]=IDX[k]||[]).push(e);}});
}
function ents(c,t){return IDX[c+'|'+t]||[];}
function enabled(){return S.tasks.filter(function(t){return t.enabled;});}
function taskById(id){return S.tasks.find(function(t){return t.id===id;});}
function charById(id){return S.chars.find(function(c){return c.id===id;});}
function acctById(id){return S.accounts.find(function(a){return a.id===id;});}
function isDone(c,t){return ents(c,t).some(function(e){return !!e.diff;});}
/* Tasks that can hold several runs per week (ARK, EFM). */
function isMulti(t){return t.kind==='efm'||!!t.multi;}
function diffIndex(t,name){return t.difficulties.findIndex(function(d){return d.name===name;});}

function computeRewards(t,diff,tal){
  var d=t.difficulties.find(function(x){return x.name===diff;}); if(!d) return [];
  return d.rewards.map(function(r){
    var o={item:r.item,qty:Number(r.qty)||0}; if(r.qtyText)o.qtyText=r.qtyText;
    if(t.kind==='efm'&&tal&&r.item==='Gold') o.qty=Math.round(o.qty*(1+S.settings.talisman/100)*10000)/10000;
    return o;
  });
}
function snap(e,c,t){
  var a=acctById(c.accountId);
  e.ign=c.ign; e.acc=a?a.name:''; e.cls=c.cls||''; e.taskName=t.name;
}
function toast(m){var t=$('#toast'); if(!t)return; t.textContent=m; t.classList.add('on'); clearTimeout(toast.h); toast.h=setTimeout(function(){t.classList.remove('on');},2400);}
