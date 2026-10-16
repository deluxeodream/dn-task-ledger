/* ---------- backup ---------- */
function exportData(){return JSON.stringify(Object.assign({app:'task-ledger',exportedAt:new Date().toISOString()},S),null,2);}
function copyText(txt,ta){
  function legacy(){
    try{
      var t=ta, tmp=false;
      if(!t){t=document.createElement('textarea'); t.value=txt; t.setAttribute('readonly',''); t.style.cssText='position:fixed;top:0;left:0;opacity:0'; document.body.appendChild(t); tmp=true;}
      t.focus(); t.select(); if(t.setSelectionRange) t.setSelectionRange(0,t.value.length);
      var ok=document.execCommand('copy'); if(tmp) t.remove(); return !!ok;
    }catch(e){return false;}
  }
  try{ if(navigator.clipboard&&navigator.clipboard.writeText) return navigator.clipboard.writeText(txt).then(function(){return true;},function(){return legacy();}); }catch(e){}
  return Promise.resolve(legacy());
}
function copyJson(){
  copyText(exportData()).then(function(ok){
    if(ok){toast('JSON copied to clipboard');}
    else{ui.dlg={msg:'Copying is blocked in this view. The text is selected below: copy it by hand, or use Download file.',sel:true}; render();}
  });
}
function saveFile(name,data,mime){
  var cl=window.claude;
  function anchor(){
    try{
      var u=URL.createObjectURL(new Blob([data],{type:mime||'application/octet-stream'})), a=document.createElement('a');
      a.href=u; a.download=name; document.body.appendChild(a); a.click();
      setTimeout(function(){a.remove(); URL.revokeObjectURL(u);},1500);
      toast('Download started. If nothing happens, copy the text instead.');
    }catch(e){toast('Download is blocked here. Copy the text instead.');}
  }
  if(cl&&cl.use){
    cl.use('downloads').then(function(d){
      if(!d){anchor(); return;}
      return d.save({filename:name,data:data}).then(function(){toast('Export saved');},function(err){if(!err||err.code!=='declined')anchor();});
    }).catch(anchor);
  }else anchor();
}
function downloadBackup(){saveFile('task-ledger-'+dateKey(new Date())+'.json',exportData(),'application/json');}
function dlgHtml(){
  if(!ui.dlg) return '';
  return '<div class="scrim"><div class="dlg" role="dialog" aria-modal="true" aria-labelledby="bk-h"><div><h2 id="bk-h">Backup JSON</h2><p class="sub" style="margin:6px 0 0">'+esc(ui.dlg.msg||'Download the file, or copy the text and keep it somewhere safe. To restore, use Import in Manage, Settings & data.')+'</p></div>'+
    '<textarea class="in" id="bk-text" rows="10" readonly style="font-family:monospace;font-size:12px;width:100%">'+esc(exportData())+'</textarea>'+
    '<div class="toolbar"><button class="btn primary" data-act="dlg-dl">'+ico('down')+'Download file</button><button class="btn" data-act="dlg-copy">Copy JSON</button><button class="btn" data-act="dlg-close">Close</button></div></div></div>';
}
function doImport(txt){
  try{
    if(!String(txt||'').trim()){toast('Paste the exported JSON first'); return;}
    var o=JSON.parse(txt);
    if(!o||!Array.isArray(o.tasks)||!Array.isArray(o.chars)) throw new Error('shape');
    S=migrate(o); S.setupDone=true; save(); render(); toast('Backup imported');
  }catch(e){toast('That file is not a Task Ledger backup');}
}
