/* --- manage --- */
function manage(){
  var tabs=[['accts','Accounts'],['chars','Characters'],['classes','Classes'],['tasks','Tasks &amp; rewards'],['data','Settings &amp; data']];
  return '<div class="card"><div class="tabs" role="tablist">'+tabs.map(function(t){return '<button role="tab" data-act="mtab" data-k="'+t[0]+'" aria-selected="'+(ui.mtab===t[0])+'">'+t[1]+'</button>';}).join('')+'</div><div class="card-b">'+
    (ui.mtab==='accts'?mAccts():ui.mtab==='chars'?mChars():ui.mtab==='classes'?mClasses():ui.mtab==='tasks'?mTasks():mData())+'</div></div>';
}
function macct(){
  if(!S.accounts.length) return '';
  if(!S.accounts.some(function(a){return a.id===ui.macct;})) ui.macct=S.accounts[0].id;
  return ui.macct;
}
function acctPicker(){
  return '<label class="field" style="max-width:340px;margin-bottom:14px"><span>Account</span><select class="sel" id="m-acctsel" data-act="m-acct" aria-label="Choose account">'+acctOptions(macct(),false)+'</select></label>';
}
function mAccts(){
  var h='<form data-form="acct-add" class="form-row" style="margin-bottom:16px"><label class="field"><span>New account</span><input class="in" id="m-acct" name="name" placeholder="Account name" required></label><button class="btn primary" type="submit">'+ico('plus')+'Add account</button></form>';
  if(!S.accounts.length) return h+'<div class="empty"><h3>No accounts yet</h3><span>Create an account, then add its characters in the Characters tab.</span></div>';
  var a=acctById(macct()), cs=S.chars.filter(function(c){return c.accountId===a.id;});
  return h+acctPicker()+'<section class="card acct-card"><div class="card-h"><div class="toolbar"><input class="in" id="an-'+a.id+'" value="'+esc(a.name)+'" data-act="acct-ren" data-id="'+a.id+'" aria-label="Account name"><span class="badge">'+cs.length+' character'+(cs.length===1?'':'s')+'</span></div>'+
    '<button class="btn sm danger" data-act="acct-del" data-id="'+a.id+'" data-arm="1">'+ico('trash')+'Delete account</button></div>'+
    '<div class="card-b"><div class="sub">'+(cs.length?'Characters: '+cs.map(function(c){return esc(c.ign);}).join(', '):'No characters on this account yet.')+'</div>'+
    '<div style="margin-top:10px"><button class="btn sm" data-act="mtab" data-k="chars">Manage characters</button></div></div></section>'+
    '<div class="sub">Deleting an account also deletes its characters. Past rewards stay in the reports.</div>';
}
function mChars(){
  if(!S.accounts.length) return '<div class="empty"><h3>No accounts yet</h3><span>Create an account first, then add its characters.</span><button class="btn primary" data-act="mtab" data-k="accts">Go to Accounts</button></div>';
  var a=acctById(macct()), cs=S.chars.filter(function(c){return c.accountId===a.id;});
  var rows=cs.map(function(c){
    return '<tr><td><input class="in sm" id="ci-'+c.id+'" value="'+esc(c.ign)+'" data-act="char-ign" data-id="'+c.id+'" aria-label="IGN"></td>'+
      '<td>'+classSelect('cc-'+c.id,'',c.cls||'',false,{sm:true,attrs:'data-act="char-cls" data-id="'+c.id+'"'})+'</td>'+
      '<td><select class="sel sm" id="ca-'+c.id+'" data-act="char-acct" data-id="'+c.id+'" aria-label="Move to account">'+acctOptions(c.accountId,false)+'</select></td>'+
      '<td class="r"><button class="ib" data-act="char-del" data-id="'+c.id+'" data-arm="1" aria-label="Delete character">'+ico('trash')+'</button></td></tr>';}).join('');
  return acctPicker()+'<section class="card acct-card"><div class="card-h"><h2>'+esc(a.name)+'</h2><span class="badge">'+cs.length+' character'+(cs.length===1?'':'s')+'</span></div>'+
    (cs.length?'<div class="scroll"><table class="tbl"><thead><tr><th>IGN</th><th>Class</th><th>Account</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>':'<div class="empty" style="padding:18px">No characters on this account.</div>')+
    '<form data-form="char-add" data-id="'+a.id+'" class="form-row card-b" style="border-top:1px solid var(--line)"><label class="field"><span>IGN</span><input class="in" id="nc-'+a.id+'" name="ign" required></label><label class="field"><span>Class</span>'+classSelect('nk-'+a.id,'cls','',true)+'</label><button class="btn sm primary" type="submit">'+ico('plus')+'Add character</button></form></section>'+
    '<div class="sub">Deleting a character keeps its past rewards in the reports. Use the Account column to move a character to another account.</div>';
}
function mClasses(){
  var h=transferBar('classes')+'<form data-form="cls-add" class="form-row" style="margin-bottom:16px"><label class="field"><span>New class</span><input class="in" id="m-cls" name="name" required></label><button class="btn primary" type="submit">'+ico('plus')+'Add class</button></form>';
  if(!S.classes.length) return h+'<div class="empty"><h3>No classes yet</h3><span>Add a class above, or import a list.</span></div>';
  return h+'<div class="scroll"><table class="tbl"><thead><tr><th>Class</th><th class="r">Characters</th><th></th></tr></thead><tbody>'+S.classes.map(function(c,i){
    var n=S.chars.filter(function(x){return x.cls===c;}).length;
    return '<tr><td><input class="in sm" id="cl-'+i+'" value="'+esc(c)+'" data-act="cls-ren" data-old="'+esc(c)+'" aria-label="Class name"></td><td class="r num">'+n+'</td><td class="r"><button class="ib" data-act="cls-del" data-old="'+esc(c)+'" data-arm="1" aria-label="Delete class">'+ico('trash')+'</button></td></tr>';}).join('')+'</tbody></table></div>';
}
function mTasks(){
  var t=taskById(ui.etask)||S.tasks[0]; ui.etask=t.id;
  if(!t.difficulties.some(function(d){return d.name===ui.ediff;})) ui.ediff=t.difficulties[0]?t.difficulties[0].name:'';
  var d=t.difficulties.find(function(x){return x.name===ui.ediff;});
  var list=S.tasks.map(function(x){
    return '<div class="trow" role="button" tabindex="0" data-act="task-pick" data-id="'+x.id+'" aria-current="'+(x.id===t.id)+'"><div class="n"><b>'+esc(x.name)+'</b><span>'+esc(x.sub||(x.kind==='done'?'Done only':'Difficulty'))+'</span></div><label class="switch" title="Track this task"><input type="checkbox" id="en-'+x.id+'" data-act="task-en" data-id="'+x.id+'"'+(x.enabled?' checked':'')+' aria-label="Track '+esc(x.name)+'"></label></div>';}).join('');
  var rows=d?d.rewards.map(function(r,i){
    return '<tr><td><input class="in sm" id="ri-'+i+'" value="'+esc(r.item)+'" data-act="rew-item" data-i="'+i+'" aria-label="Reward item"></td>'+
      '<td><input class="in sm num" id="rq-'+i+'" type="number" step="any" min="0" value="'+esc(r.qty)+'" data-act="rew-qty" data-i="'+i+'" style="width:110px" aria-label="Quantity"></td>'+
      '<td><input class="in sm" id="rx-'+i+'" value="'+esc(r.qtyText||'')+'" placeholder="optional, e.g. 1~2" data-act="rew-txt" data-i="'+i+'" style="width:140px" aria-label="Display text"></td>'+
      '<td class="r"><button class="ib" data-act="rew-del" data-i="'+i+'" aria-label="Delete reward">'+ico('trash')+'</button></td></tr>';}).join(''):'';
  var diffCtl=t.kind==='done'?'':
    '<div class="form-row" style="margin-bottom:12px"><label class="field"><span>Difficulty</span><select class="sel" id="e-diff" data-act="diff-pick">'+t.difficulties.map(function(x){return '<option value="'+esc(x.name)+'"'+(x.name===ui.ediff?' selected':'')+'>'+esc(x.name)+'</option>';}).join('')+'</select></label>'+
    '<label class="field"><span>Rename</span><input class="in" id="e-ren" value="'+esc(ui.ediff)+'" data-act="diff-ren"></label>'+
    '<label class="field"><span>Copy rewards from</span><select class="sel" id="e-copy" data-act="diff-copy"><option value="">Choose difficulty</option>'+t.difficulties.filter(function(x){return x.name!==ui.ediff;}).map(function(x){return '<option value="'+esc(x.name)+'">'+esc(x.name)+'</option>';}).join('')+'</select></label>'+
    '<button class="btn sm danger" data-act="diff-del" data-arm="1">'+ico('trash')+'Delete difficulty</button></div>';
  var addDiff=t.kind==='done'?'':'<form data-form="diff-add" class="form-row" style="margin-top:14px;border-top:1px solid var(--line);padding-top:14px"><label class="field"><span>New difficulty</span><input class="in" id="e-newd" name="name" required></label><button class="btn sm" type="submit">'+ico('plus')+'Add difficulty</button></form>';
  var tal=t.kind==='efm'?'<div class="sub" style="margin-bottom:10px">Runs with the talisman box ticked earn Gold +'+S.settings.talisman+'%. Change the percentage in Settings &amp; data.</div>':'';
  return transferBar('rewards')+'<div class="editor"><div class="card" style="background:var(--surface-2)"><div class="tasklist">'+list+'</div></div><div class="card"><div class="card-h"><h2>'+esc(t.name)+' rewards</h2><button class="btn sm danger" data-act="task-restore" data-arm="1">Restore patch defaults</button></div><div class="card-b">'+tal+diffCtl+
    (d?'<div class="scroll"><table class="tbl"><thead><tr><th>Reward</th><th>Qty</th><th>Display text</th><th></th></tr></thead><tbody>'+(rows||'<tr><td colspan="4" class="sub">No rewards set for '+esc(d.name)+'. Add the first one below.</td></tr>')+'</tbody></table></div><div style="margin-top:12px"><button class="btn sm" data-act="rew-add">'+ico('plus')+'Add reward</button></div>':'<div class="empty">No difficulties. Add one below.</div>')+addDiff+
    '<div class="sub" style="margin-top:12px">Gold is entered in gold units. Use decimals for silver and copper, for example 28333.2775 is 28,333g 27s 75c. Changes apply to new clears. Past clears keep the rewards they were saved with.</div></div></div></div>';
}
function mData(){
  return '<div class="stack" style="max-width:720px">'+
    '<section class="card"><div class="card-h"><h2>Talisman bonus</h2></div><div class="card-b form-row"><label class="field"><span>EFM gold bonus (%)</span><input class="in" id="s-tal" type="number" min="0" step="1" value="'+S.settings.talisman+'" data-act="set-tal"></label></div></section>'+
    '<section class="card"><div class="card-h"><h2>Shiny Hero Coin</h2></div><div class="card-b form-row"><label class="field"><span>Gold per Shiny Hero Coin</span><input class="in" id="s-coin" type="number" min="0" step="1" value="'+S.settings.coinRate+'" data-act="set-coin"></label><div class="sub" style="align-self:end">Used when you tick the Shiny Hero Coin box in the tracker. Coins already converted keep the rate they were converted at.</div></div></section>'+
    '<section class="card"><div class="card-h"><h2>Backup</h2></div><div class="card-b" style="display:grid;gap:12px"><div class="sub">Data is saved in this browser (IndexedDB). Export a JSON file to keep a copy or move to another device.</div>'+
    '<div class="toolbar"><button class="btn" data-act="export">'+ico('down')+'Export JSON</button><button class="btn" data-act="copy-json">Copy JSON</button><label class="btn" for="imp-file" style="cursor:pointer">'+ico('up')+'Import file</label><input id="imp-file" type="file" accept=".json,application/json" data-act="import-file" hidden></div>'+
    '<label class="field"><span>Or paste exported JSON</span><textarea class="in" id="imp-text" rows="4" style="font-family:monospace;font-size:12px"></textarea></label><div><button class="btn sm" data-act="import-text">Import pasted JSON</button></div></div></section>'+
    '<section class="card"><div class="card-h"><h2>Rewards table &amp; classes</h2></div><div class="card-b" style="display:grid;gap:12px"><div class="sub">Export as JSON or CSV to edit in a spreadsheet or share, then import the file back. Importing a rewards file replaces the floors and rewards of every task in the file that matches by task id or name. Export a backup first if you are unsure.</div>'+transferBar('rewards')+transferBar('classes')+'</div></section>'+
    '<section class="card"><div class="card-h"><h2>Danger zone</h2></div><div class="card-b toolbar"><button class="btn danger" data-act="clear-hist" data-arm="1">Clear reward history</button><button class="btn danger" data-act="reset-all" data-arm="1">Reset everything</button></div></section></div>';
}
