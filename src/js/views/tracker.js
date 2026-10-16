/* --- tracker --- */
function trackerStrip(){
  var st=weekStats();
  return '<div class="kpis">'+
    kpi('target','Done this week',st.done+'<small>of '+st.total+'</small>',meter(st.pct))+
    kpi('coin','Gold this week',fmtGold(st.gold,false),(st.A.coins?'<div class="sub num">incl. '+fmtGold(st.A.coinGold,false)+' from '+st.A.coins+' Shiny Hero Coin'+(st.A.coins===1?'':'s')+'</div>':''))+
    kpi('users','Characters',S.chars.length+'<small>'+S.accounts.length+' account'+(S.accounts.length===1?'':'s')+'</small>')+
    kpi('clock','Resets in','<span id="cd2">'+countdown()+'</span>')+'</div>';
}
function tracker(){
  var h=trackerStrip();
  if(!S.accounts.length||!S.chars.length){
    return h+'<div class="card empty"><h3>Add your first character</h3><span>Characters belong to an account. Add an account, then its characters.</span>'+quickAddForm()+'</div>';
  }
  if(!enabled().length){
    return h+'<div class="card empty"><h3>No weekly tasks selected</h3><span>Turn on the tasks you want to track.</span><button class="btn primary" data-act="nav" data-p="manage" data-t="tasks">Choose tasks</button></div>';
  }
  h+='<div class="toolbar"><label class="field"><span>Account</span><select class="sel" id="f-acct" data-act="f-acct">'+acctOptions(ui.acct,true)+'</select></label>'+
     '<label class="field"><span>Find character</span><input class="in" id="f-q" type="search" placeholder="IGN or class" value="'+esc(ui.q)+'" data-act="f-q"></label></div>';
  return h+'<div class="gridwrap" id="gridwrap">'+gridHtml()+'</div>';
}
function quickAddForm(){
  return '<form data-form="quick-add" class="form-row" style="width:100%;max-width:640px;text-align:left">'+
    '<label class="field"><span>Account name</span><input class="in" id="qa-acct" name="acct" required value="'+esc(S.accounts[0]?S.accounts[0].name:'')+'"></label>'+
    '<label class="field"><span>IGN</span><input class="in" id="qa-ign" name="ign" required></label>'+
    '<label class="field"><span>Class</span>'+classSelect('qa-cls','cls','',true)+'</label>'+
    '<button class="btn primary" type="submit">'+ico('plus')+'Add</button></form>';
}
/* Class dropdown. A character's saved class is kept as an option even if it is no longer in the list. */
function classOpts(cur){
  var has=!cur||S.classes.some(function(c){return c===cur;});
  return '<option value="">Select class</option>'+(has?'':'<option value="'+esc(cur)+'" selected>'+esc(cur)+'</option>')+
    S.classes.map(function(c){return '<option value="'+esc(c)+'"'+(c===cur?' selected':'')+'>'+esc(c)+'</option>';}).join('');
}
function classSelect(id,name,cur,required,extra){
  return '<select class="sel'+(extra&&extra.sm?' sm':'')+'" id="'+id+'"'+(name?' name="'+name+'"':'')+(required?' required':'')+(extra&&extra.attrs?' '+extra.attrs:'')+' aria-label="Class">'+classOpts(cur)+'</select>';
}

function gridHtml(){
  var ts=enabled(), q=ui.q.trim().toLowerCase(), cols=ts.length+1;
  var head='<thead><tr><th class="sticky">Character</th>'+ts.map(function(t){
    var sub=t.kind==='done'?'Done':(isMulti(t)?'Runs':(t.kind==='nm'?'Highest':'Difficulty'));
    return '<th><span class="tn">'+esc(t.name)+'</span>'+sub+'</th>';}).join('')+'</tr></thead>';
  var body='', any=false;
  S.accounts.forEach(function(a){
    if(ui.acct!=='all'&&ui.acct!==a.id) return;
    var cs=S.chars.filter(function(c){return c.accountId===a.id&&(!q||c.ign.toLowerCase().indexOf(q)>=0||(c.cls||'').toLowerCase().indexOf(q)>=0);});
    if(!cs.length) return; any=true;
    var done=0; cs.forEach(function(c){ts.forEach(function(t){if(isDone(c.id,t.id))done++;});});
    body+='<tr class="acct"><td class="sticky">'+esc(a.name)+'</td><td colspan="'+ts.length+'"><span class="num">'+done+' / '+cs.length*ts.length+' done</span></td></tr>';
    cs.forEach(function(c){
      var n=0; ts.forEach(function(t){if(isDone(c.id,t.id))n++;});
      var p=ts.length?Math.round(n/ts.length*100):0;
      body+='<tr><td class="sticky"><div class="who"><b>'+esc(c.ign)+'</b><span class="cls">'+esc(c.cls||'No class')+' &middot; <span class="num">'+n+'/'+ts.length+'</span></span>'+meter(p)+'</div></td>'+
        ts.map(function(t){return cell(c,t);}).join('')+'</tr>';
    });
  });
  if(!any) body='<tr><td colspan="'+cols+'"><div class="empty">No characters match this filter.</div></td></tr>';
  return '<table class="grid">'+head+'<tbody>'+body+'</tbody></table>';
}
function diffOpts(t,cur,blank){
  var legacy=(cur&&!t.difficulties.some(function(d){return d.name===cur;}))?'<option value="'+esc(cur)+'" selected>'+esc(cur)+' (old)</option>':'';
  return '<option value="">'+blank+'</option>'+legacy+t.difficulties.map(function(d){return '<option value="'+esc(d.name)+'"'+(d.name===cur?' selected':'')+'>'+esc(d.name)+'</option>';}).join('');
}
function cell(c,t){
  var es=ents(c.id,t.id);
  if(t.kind==='done'){
    var on=es.some(function(e){return !!e.diff;});
    return '<td><button class="pill'+(on?' ok':'')+'" data-act="toggle-done" data-c="'+c.id+'" data-t="'+t.id+'" aria-pressed="'+on+'">'+(on?ico('check')+'Done':'Not yet')+'</button></td>';
  }
  if(isMulti(t)){
    var gold=0, hasTal=t.kind==='efm';
    var runs=es.map(function(e,i){
      gold+=goldOf(e.rewards||[]);
      return '<div class="run"><span class="rn num">#'+(i+1)+'</span><select class="sel sm state'+(e.diff?' set':'')+'" id="rd-'+e.id+'" data-act="run-diff" data-e="'+e.id+'" aria-label="Run '+(i+1)+' difficulty">'+diffOpts(t,e.diff,'Not yet')+'</select>'+
        (hasTal?'<label class="tal" title="Gold +'+S.settings.talisman+'% from talisman"><input type="checkbox" id="rt-'+e.id+'" data-act="run-tal" data-e="'+e.id+'"'+(e.talisman?' checked':'')+'>+'+S.settings.talisman+'%</label>':'')+
        '<button class="ib" data-act="run-del" data-e="'+e.id+'" aria-label="Remove run '+(i+1)+'">'+ico('x')+'</button></div>';
    }).join('');
    return '<td><div class="runs">'+runs+'</div><div style="display:flex;gap:10px;align-items:center"><button class="link" data-act="run-add" data-c="'+c.id+'" data-t="'+t.id+'">'+ico('plus')+'Add run</button>'+(gold>0?'<span class="gold">'+fmtGold(gold,false)+'</span>':'')+'</div></td>';
  }
  var cur=es[0]&&es[0].diff||'';
  return '<td><select class="sel state'+(cur?' set':'')+'" id="d-'+c.id+'-'+t.id+'" data-act="set-diff" data-c="'+c.id+'" data-t="'+t.id+'" aria-label="'+esc(t.name)+' for '+esc(c.ign)+'">'+diffOpts(t,cur,'Not yet')+'</select></td>';
}
