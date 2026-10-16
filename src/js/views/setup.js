/* --- first-run dialog --- */
function setupHtml(){
  var diff=S.tasks.filter(function(t){return t.kind!=='done';}), done=S.tasks.filter(function(t){return t.kind==='done';});
  function chip(t){return '<label class="chip"><input type="checkbox" id="su-'+t.id+'" data-act="su-pick" data-id="'+t.id+'"'+(ui.setup.sel[t.id]?' checked':'')+'>'+esc(t.name)+'</label>';}
  var n=Object.keys(ui.setup.sel).filter(function(k){return ui.setup.sel[k];}).length;
  return '<div class="scrim"><form class="dlg" data-form="setup" role="dialog" aria-modal="true" aria-labelledby="su-h"><div><h2 id="su-h">Choose your weekly tasks</h2><p class="sub" style="margin:6px 0 0">Pick what you want to track each week. You can change this later in Manage.</p></div>'+
    '<div class="grp"><h3>Tracked by difficulty</h3><div class="chips">'+diff.map(chip).join('')+'</div></div>'+
    '<div class="grp"><h3>Tracked as done</h3><div class="chips">'+done.map(chip).join('')+'</div></div>'+
    '<div class="toolbar"><button type="button" class="btn sm" data-act="su-all">Select all</button><button type="button" class="btn sm" data-act="su-none">Clear</button></div>'+
    '<div class="grp"><h3>First account (optional)</h3><div class="form-row"><label class="field"><span>Account</span><input class="in" id="su-acct" name="acct"></label><label class="field"><span>IGN</span><input class="in" id="su-ign" name="ign"></label><label class="field"><span>Class</span>'+classSelect('su-cls','cls','',false)+'</label></div></div>'+
    '<div class="dlg-f"><span class="sub num" id="su-n">'+n+' selected</span><button class="btn primary" type="submit" id="su-go"'+(n?'':' disabled')+'>Start tracking</button></div></form></div>';
}
