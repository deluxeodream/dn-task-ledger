/* ---------- clock: countdown + automatic weekly reset ---------- */
setInterval(function(){
  var k=dateKey(weekStart(new Date()));
  if(k!==WK){render(); toast('Weekly reset. A new week has started.'); return;}
  var a=$('#cd'), b=$('#cd2'); if(a)a.textContent=countdown(); if(b)b.textContent=countdown();
},30000);

boot();
