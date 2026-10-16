/* ---------- state ---------- */
function defaults(){return {v:1,setupDone:false,settings:{talisman:30,coinRate:10000},accounts:[],chars:[],classes:CLASSLIST.slice(),cv:1,tasks:defaultTasks(),entries:[]};}
function migrate(o){
  var d=defaults();
  if(!o||typeof o!=='object') return d;
  o.settings=Object.assign({},d.settings,o.settings||{}); if(o.settings.coinRate===5000)o.settings.coinRate=10000;
  ['accounts','chars','classes','entries'].forEach(function(k){if(!Array.isArray(o[k]))o[k]=[];});
  if(!Array.isArray(o.tasks)||!o.tasks.length) o.tasks=d.tasks;
  d.tasks.forEach(function(t){if(!o.tasks.some(function(x){return x.id===t.id;}))o.tasks.push(t);});
  var ak=o.tasks.find(function(x){return x.id==='ark';}), ad=d.tasks.find(function(x){return x.id==='ark';});
  if(ak&&ad&&Array.isArray(ak.difficulties)&&ak.difficulties.every(function(x){return !(x.rewards&&x.rewards.length)&&FLOORS.indexOf(x.name)>=0;})){ak.difficulties=ad.difficulties; ak.sub=ad.sub;}
  var rk=o.tasks.find(function(x){return x.id==='root';}), rd=d.tasks.find(function(x){return x.id==='root';});
  if(rk&&rd&&Array.isArray(rk.difficulties)){
    var rEmpty=rk.difficulties.every(function(x){return !(x.rewards&&x.rewards.length)&&FLOORS.indexOf(x.name)>=0;});
    var rOld=rk.difficulties.some(function(x){return (x.rewards||[]).some(function(r){return r.item===ROOTFRAG+' (Low)';});});
    if(rEmpty||rOld){
      rk.difficulties=rd.difficulties; rk.sub=rd.sub;
      o.entries.forEach(function(e){
        if(e.taskId!=='root'||!(e.rewards||[]).some(function(r){return r.item===ROOTFRAG+' (Low)';})) return;
        var nd=rd.difficulties.find(function(x){return x.name===e.diff;});
        e.rewards=nd?nd.rewards.map(function(r){var q={item:r.item,qty:r.qty}; if(r.qtyText)q.qtyText=r.qtyText; return q;}):[];
      });
    }
  }
  if(ak){ak.multi=true; if(ak.sub==='Weekly clear rewards by floor (patch 199)') ak.sub=ad.sub;}
  if(!o.cv){ /* one-time: start from the official class list, keep any custom classes after it */
    var extra=o.classes.filter(function(c){return CLASSLIST.every(function(x){return x.toLowerCase()!==String(c).toLowerCase();});});
    o.classes=CLASSLIST.concat(extra); o.cv=1;
  }
  o.setupDone=!!o.setupDone; o.v=1;
  return o;
}
var S=defaults(), ready=false, storageOk=true;
