/* ---------- events ---------- */
function armed(b){
  if(!b.dataset.arm) return true;
  if(b.dataset.armed) return true;
  b.dataset.armed='1'; b.dataset.orig=b.innerHTML; b.classList.add('armed'); b.textContent='Confirm?';
  setTimeout(function(){if(b.isConnected&&b.dataset.armed){delete b.dataset.armed;b.classList.remove('armed');b.innerHTML=b.dataset.orig;}},3000);
  return false;
}
function getEntry(id){return S.entries.find(function(e){return e.id===id;});}

document.addEventListener('click',function(ev){
  var b=ev.target.closest('[data-act]'); if(!b) return;
  if(b.matches('select,input,textarea')||b.tagName==='LABEL') return;
  var a=b.dataset.act;
  if(b.dataset.arm&&!armed(b)) return;
  var t,c,e;
  switch(a){
    case 'nav': ui.page=b.dataset.p; if(b.dataset.t)ui.mtab=b.dataset.t; try{history.replaceState(null,'','#'+ui.page);}catch(x){} render(); window.scrollTo(0,0); break;
    case 'toggle-done': t=taskById(b.dataset.t); mutate(function(){upsertSingle(b.dataset.c,t,isDone(b.dataset.c,t.id)?'':'Done');}); break;
    case 'run-add': t=taskById(b.dataset.t); c=charById(b.dataset.c); mutate(function(){var e2={id:uid(),week:WK,charId:c.id,taskId:t.id,diff:'',talisman:false,ts:Date.now(),rewards:[]}; snap(e2,c,t); S.entries.push(e2);}); break;
    case 'run-del': mutate(function(){S.entries=S.entries.filter(function(x){return x.id!==b.dataset.e;});}); break;
    case 'mtab': ui.mtab=b.dataset.k; render(); break;
    case 'rpt-kind': ui.rpt=b.dataset.k; ui.off=0; render(); break;
    case 'rpt-prev': ui.off--; render(); break;
    case 'rpt-next': if(ui.off<0){ui.off++; render();} break;
    case 'task-pick': ui.etask=b.dataset.id; ui.ediff=''; render(); break;
    case 'acct-del': mutate(function(){S.accounts=S.accounts.filter(function(x){return x.id!==b.dataset.id;}); S.chars=S.chars.filter(function(x){return x.accountId!==b.dataset.id;}); if(ui.acct===b.dataset.id)ui.acct='all';}); toast('Account deleted'); break;
    case 'char-del': mutate(function(){S.chars=S.chars.filter(function(x){return x.id!==b.dataset.id;});}); toast('Character deleted'); break;
    case 'cls-del': mutate(function(){S.classes=S.classes.filter(function(x){return x!==b.dataset.old;}); S.chars.forEach(function(x){if(x.cls===b.dataset.old)x.cls='';});}); toast('Class deleted'); break;
    case 'rew-add': t=taskById(ui.etask); mutate(function(){var d=t.difficulties.find(function(x){return x.name===ui.ediff;}); if(d)d.rewards.push({item:'New reward',qty:1});}); break;
    case 'rew-del': t=taskById(ui.etask); mutate(function(){var d=t.difficulties.find(function(x){return x.name===ui.ediff;}); d.rewards.splice(Number(b.dataset.i),1);}); break;
    case 'diff-del': t=taskById(ui.etask); mutate(function(){t.difficulties=t.difficulties.filter(function(x){return x.name!==ui.ediff;}); ui.ediff='';}); break;
    case 'task-restore': t=taskById(ui.etask); mutate(function(){var def=defaultTasks().find(function(x){return x.id===t.id;}); if(def){t.difficulties=def.difficulties;} ui.ediff='';}); toast('Defaults restored'); break;
    case 'export': ui.dlg={msg:''}; render(); break;
    case 'exp-rewards-json': exportTable('rewards','json'); break;
    case 'exp-rewards-csv': exportTable('rewards','csv'); break;
    case 'exp-classes-json': exportTable('classes','json'); break;
    case 'exp-classes-csv': exportTable('classes','csv'); break;
    case 'dlg-close': ui.dlg=null; render(); break;
    case 'dlg-dl': downloadBackup(); break;
    case 'dlg-copy': copyText(exportData(),$('#bk-text')).then(function(ok){toast(ok?'JSON copied to clipboard':'Copy is blocked here. The text is selected, copy it by hand.'); if(!ok){var bt=$('#bk-text'); if(bt){bt.focus(); bt.select();}}}); break;
    case 'copy-json': copyJson(); break;
    case 'import-text': doImport($('#imp-text').value); break;
    case 'clear-hist': mutate(function(){S.entries=[];}); toast('History cleared'); break;
    case 'reset-all': try{localStorage.removeItem(KEY);}catch(x){} S=defaults(); ui.setup={sel:{}}; ui.page='tracker'; save(); render(); break;
    case 'su-all': S.tasks.forEach(function(x){ui.setup.sel[x.id]=true;}); render(); break;
    case 'su-none': ui.setup.sel={}; render(); break;
  }
});
document.addEventListener('keydown',function(ev){
  if((ev.key==='Enter'||ev.key===' ')&&ev.target.matches('.trow')){ev.preventDefault(); ev.target.click();}
});
document.addEventListener('change',function(ev){
  var b=ev.target.closest('[data-act]'); if(!b||!b.matches('select,input,textarea')) return;
  var a=b.dataset.act, v=b.value, t, c, e;
  switch(a){
    case 'f-acct': ui.acct=v; render(); break;
    case 'm-acct': ui.macct=v; render(); break;
    case 'set-diff':
      t=taskById(b.dataset.t); c=b.dataset.c;
      if(t.kind==='nm'){var cur=ents(c,t.id)[0]; if(cur&&cur.diff&&v&&diffIndex(t,v)<diffIndex(t,cur.diff)){toast('NM keeps the highest difficulty cleared'); render(); break;}}
      mutate(function(){upsertSingle(c,t,v);}); break;
    case 'run-diff': e=getEntry(b.dataset.e); t=taskById(e.taskId); mutate(function(){e.diff=v; e.rewards=computeRewards(t,v,e.talisman); e.ts=Date.now(); snap(e,charById(e.charId)||{ign:e.ign,accountId:'',cls:e.cls},t);}); break;
    case 'run-tal': e=getEntry(b.dataset.e); t=taskById(e.taskId); mutate(function(){e.talisman=b.checked; e.rewards=computeRewards(t,e.diff,e.talisman);}); break;
    case 'char-ign': c=charById(b.dataset.id); if(!v.trim()){render();break;} mutate(function(){c.ign=v.trim();}); break;
    case 'char-cls': c=charById(b.dataset.id); mutate(function(){c.cls=ensureClass(v);}); break;
    case 'char-acct': c=charById(b.dataset.id); mutate(function(){c.accountId=v;}); break;
    case 'acct-ren': mutate(function(){var a2=acctById(b.dataset.id); if(v.trim())a2.name=v.trim();}); break;
    case 'cls-ren': mutate(function(){var nn=v.trim(), old=b.dataset.old; if(!nn||nn===old)return; var i=S.classes.indexOf(old); S.classes[i]=nn; S.chars.forEach(function(x){if(x.cls===old)x.cls=nn;});}); break;
    case 'task-en': t=taskById(b.dataset.id); mutate(function(){t.enabled=b.checked;}); break;
    case 'diff-pick': ui.ediff=v; render(); break;
    case 'diff-ren': t=taskById(ui.etask); mutate(function(){var d=t.difficulties.find(function(x){return x.name===ui.ediff;}); var nn=v.trim(); if(nn&&!t.difficulties.some(function(x){return x.name===nn;})){d.name=nn; ui.ediff=nn;}}); break;
    case 'diff-copy': if(!v)break; t=taskById(ui.etask); mutate(function(){var src=t.difficulties.find(function(x){return x.name===v;}), d=t.difficulties.find(function(x){return x.name===ui.ediff;}); d.rewards=JSON.parse(JSON.stringify(src.rewards));}); toast('Rewards copied'); break;
    case 'rew-item': case 'rew-qty': case 'rew-txt':
      t=taskById(ui.etask); mutate(function(){var d=t.difficulties.find(function(x){return x.name===ui.ediff;}), r=d.rewards[Number(b.dataset.i)];
        if(a==='rew-item') r.item=v.trim()||r.item; else if(a==='rew-qty') r.qty=Number(v)||0; else {if(v.trim())r.qtyText=v.trim(); else delete r.qtyText;}}); break;
    case 'coin-all': mutate(function(){coinWeek().list.forEach(function(e){setCoin(e,b.checked);});}); toast(b.checked?'All Shiny Hero Coins converted to gold':'Shiny Hero Coins restored'); break;
    case 'coin-sell': e=getEntry(b.dataset.e); mutate(function(){setCoin(e,b.checked);}); toast(b.checked?'Shiny Hero Coins converted to gold':'Shiny Hero Coins restored'); break;
    case 'set-coin': mutate(function(){var n=Number(v); S.settings.coinRate=isFinite(n)&&n>=0?Math.round(n):10000;}); break;
    case 'set-tal': mutate(function(){var n=Number(v); S.settings.talisman=isFinite(n)&&n>=0?n:30;}); break;
    case 'imp-rewards': readPicked(b,importRewards); break;
    case 'imp-classes': readPicked(b,importClasses); break;
    case 'import-file': var f=b.files&&b.files[0]; if(f){var rd=new FileReader(); rd.onload=function(){doImport(String(rd.result)); b.value='';}; rd.onerror=function(){toast('Could not read that file'); b.value='';}; rd.readAsText(f);} break;
    case 'su-pick': ui.setup.sel[b.dataset.id]=b.checked; var n2=Object.keys(ui.setup.sel).filter(function(k){return ui.setup.sel[k];}).length; $('#su-n').textContent=n2+' selected'; $('#su-go').disabled=!n2; break;
  }
});
document.addEventListener('input',function(ev){
  if(ev.target.id==='f-q'){ui.q=ev.target.value; refreshGrid();}
});
document.addEventListener('submit',function(ev){
  var f=ev.target.closest('[data-form]'); if(!f) return; ev.preventDefault();
  var k=f.dataset.form, fd=new FormData(f), g=function(n){return String(fd.get(n)||'').trim();}, aid;
  if(k==='setup'){
    mutate(function(){
      S.tasks.forEach(function(t){t.enabled=!!ui.setup.sel[t.id];});
      var an=g('acct'), ig=g('ign'), cl=g('cls');
      if(an){var a=S.accounts.find(function(x){return x.name.toLowerCase()===an.toLowerCase();}); if(!a){a={id:uid(),name:an};S.accounts.push(a);} if(ig)S.chars.push({id:uid(),accountId:a.id,ign:ig,cls:ensureClass(cl)});}
      S.setupDone=true;
    });
  } else if(k==='quick-add'){
    mutate(function(){var an=g('acct'), a=S.accounts.find(function(x){return x.name.toLowerCase()===an.toLowerCase();}); if(!a){a={id:uid(),name:an};S.accounts.push(a);} S.chars.push({id:uid(),accountId:a.id,ign:g('ign'),cls:ensureClass(g('cls'))});});
  } else if(k==='acct-add'){
    mutate(function(){var na={id:uid(),name:g('name')}; S.accounts.push(na); ui.macct=na.id;});
  } else if(k==='char-add'){
    aid=f.dataset.id; mutate(function(){S.chars.push({id:uid(),accountId:aid,ign:g('ign'),cls:ensureClass(g('cls'))});}); toast('Character added');
  } else if(k==='cls-add'){
    mutate(function(){ensureClass(g('name'));});
  } else if(k==='diff-add'){
    var t=taskById(ui.etask), nm=g('name'); if(!nm||t.difficulties.some(function(x){return x.name===nm;})){toast('Use a new difficulty name');return;}
    mutate(function(){t.difficulties.push({name:nm,rewards:[]}); ui.ediff=nm;});
  }
});
