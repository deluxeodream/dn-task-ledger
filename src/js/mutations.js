/* ---------- mutations ---------- */
function ensureClass(name){
  name=(name||'').trim(); if(!name) return '';
  var f=S.classes.find(function(c){return c.toLowerCase()===name.toLowerCase();});
  if(f) return f; S.classes.push(name); return name;
}
function upsertSingle(cid,t,diff){
  var c=charById(cid), list=ents(cid,t.id), e=list[0];
  if(!diff){ S.entries=S.entries.filter(function(x){return !(x.week===WK&&x.charId===cid&&x.taskId===t.id);}); return; }
  if(!e){e={id:uid(),week:WK,charId:cid,taskId:t.id,diff:'',talisman:false,ts:Date.now(),rewards:[]}; S.entries.push(e);}
  var keep=!!e.coinSold, kr=e.coinRate; e.diff=diff; e.rewards=computeRewards(t,diff,false); e.ts=Date.now(); snap(e,c,t);
  if(keep){delete e.coinSold; e.coinRate=kr; setCoin(e,true);}
}
function coinsIn(e){return (e.rewards||[]).reduce(function(s,r){return s+(r.item==='Shiny Hero Coin'?Number(r.qty)||0:0);},0);}
function coinsOf(e){return e.coinSold||coinsIn(e);}
function setCoin(e,on){
  var rate=e.coinRate!=null?e.coinRate:(Number(S.settings.coinRate)||0);
  var q=e.coinSold||coinsIn(e);
  e.rewards=(e.rewards||[]).filter(function(r){return !r.coinConv&&r.item!=='Shiny Hero Coin';});
  if(on&&q>0){e.coinSold=q; e.coinRate=rate; e.rewards.push({item:'Gold',qty:q*rate,coinConv:true});}
  else{ if(q>0)e.rewards.unshift({item:'Shiny Hero Coin',qty:q}); delete e.coinSold; delete e.coinRate; }
}
function coinWeek(){
  var l=S.entries.filter(function(e){return e.week===WK&&e.diff&&coinsOf(e)>0;}), tot=0, sold=0, n=0;
  l.forEach(function(e){var q=coinsOf(e); tot+=q; if(e.coinSold){sold+=q; n++;}});
  return {list:l,total:tot,sold:sold,all:l.length>0&&n===l.length,some:n>0&&n<l.length};
}
function mutate(fn){fn(); save(); render();}
