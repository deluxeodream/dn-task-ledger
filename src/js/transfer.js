/* ---------- rewards table and classes: import / export (JSON, CSV) ---------- */

/* --- CSV helpers (RFC 4180 style: quotes, escaped quotes, CRLF or LF, comma or semicolon) --- */
function csvCell(v){
  v=v==null?'':String(v);
  return /[",;\r\n]/.test(v)||/^\s|\s$/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;
}
function toCsv(rows){return rows.map(function(r){return r.map(csvCell).join(',');}).join('\r\n')+'\r\n';}
function parseCsv(text){
  text=String(text).replace(/^\uFEFF/,'');
  var first=text.split(/\r?\n/)[0]||'', delim=(first.split(';').length>first.split(',').length)?';':',';
  var rows=[], row=[], f='', q=false, i, ch;
  for(i=0;i<text.length;i++){
    ch=text[i];
    if(q){ if(ch==='"'){ if(text[i+1]==='"'){f+='"'; i++;} else q=false; } else f+=ch; }
    else if(ch==='"') q=true;
    else if(ch===delim){row.push(f); f='';}
    else if(ch==='\n'||ch==='\r'){ if(ch==='\r'&&text[i+1]==='\n')i++; row.push(f); f=''; rows.push(row); row=[]; }
    else f+=ch;
  }
  if(f!==''||row.length){row.push(f); rows.push(row);}
  return rows.filter(function(r){return r.some(function(c){return String(c).trim()!=='';});});
}

/* --- export --- */
function rewardsPayload(){
  return {app:'task-ledger',type:'rewards',version:1,exportedAt:new Date().toISOString(),
    tasks:S.tasks.map(function(t){
      return {id:t.id,name:t.name,kind:t.kind,sub:t.sub||'',difficulties:t.difficulties.map(function(d){
        return {name:d.name,rewards:(d.rewards||[]).map(function(r){var o={item:r.item,qty:Number(r.qty)||0}; if(r.qtyText)o.qtyText=r.qtyText; return o;})};
      })};
    })};
}
function rewardsCsv(){
  var rows=[['task_id','task','difficulty','item','qty','qty_text']];
  S.tasks.forEach(function(t){t.difficulties.forEach(function(d){
    if(!(d.rewards||[]).length) rows.push([t.id,t.name,d.name,'','','']);
    else d.rewards.forEach(function(r){rows.push([t.id,t.name,d.name,r.item,r.qty,r.qtyText||'']);});
  });});
  return toCsv(rows);
}
function classesPayload(){return {app:'task-ledger',type:'classes',version:1,exportedAt:new Date().toISOString(),classes:S.classes.slice()};}
function classesCsv(){return toCsv([['class']].concat(S.classes.map(function(c){return [c];})));}

function exportTable(kind,fmt){
  var data, name='task-ledger-'+kind+'-'+dateKey(new Date())+'.'+fmt;
  if(fmt==='json') data=JSON.stringify(kind==='rewards'?rewardsPayload():classesPayload(),null,2);
  else data='\uFEFF'+(kind==='rewards'?rewardsCsv():classesCsv());
  saveFile(name,data,fmt==='json'?'application/json':'text/csv');
}

/* --- import: shared --- */
function readPicked(input,cb){
  var f=input.files&&input.files[0]; if(!f) return;
  var rd=new FileReader();
  rd.onload=function(){cb(String(rd.result),f.name); input.value='';};
  rd.onerror=function(){toast('Could not read that file'); input.value='';};
  rd.readAsText(f);
}
function looksJson(text,name){return /\.json$/i.test(name||'')||/^\s*[\[{]/.test(text);}
function parseJsonText(text){
  try{return JSON.parse(text);}catch(e){throw new Error('That file is not valid JSON');}
}
function colIndex(header,names){
  for(var i=0;i<names.length;i++){var k=header.indexOf(names[i]); if(k>=0) return k;}
  return -1;
}

/* --- import: rewards --- */
function rewardsFromCsv(text){
  var rows=parseCsv(text); if(rows.length<2) throw new Error('The CSV has no data rows');
  var h=rows[0].map(function(c){return String(c).trim().toLowerCase().replace(/[\s-]+/g,'_');});
  var ti=colIndex(h,['task_id','id']), tn=colIndex(h,['task','task_name','name']),
      di=colIndex(h,['difficulty','floor']), ii=colIndex(h,['item','reward']),
      qi=colIndex(h,['qty','quantity','amount']), xi=colIndex(h,['qty_text','display_text','text']);
  if((ti<0&&tn<0)||di<0||ii<0) throw new Error('CSV needs the columns task_id (or task), difficulty, item, qty and qty_text');
  var tasks=[], byKey={};
  rows.slice(1).forEach(function(r,n){
    var id=ti>=0?String(r[ti]||'').trim():'', name=tn>=0?String(r[tn]||'').trim():'', key=(id||name).toLowerCase(), dn=String(r[di]||'').trim();
    if(!key||!dn) return;
    var t=byKey[key]; if(!t){t=byKey[key]={id:id,name:name,difficulties:[],_d:{}}; tasks.push(t);}
    var d=t._d[dn]; if(!d){d=t._d[dn]={name:dn,rewards:[]}; t.difficulties.push(d);}
    var item=String(r[ii]||'').trim(); if(!item) return;
    var qraw=qi>=0?String(r[qi]||'').trim():'', q=qraw===''?0:Number(qraw);
    if(!isFinite(q)||q<0) throw new Error('Row '+(n+2)+': qty "'+qraw+'" is not a number');
    var o={item:item,qty:q}, tx=xi>=0?String(r[xi]||'').trim():''; if(tx)o.qtyText=tx;
    d.rewards.push(o);
  });
  return tasks;
}
function normalizeTask(x,n){
  if(!x||typeof x!=='object') throw new Error('Task #'+(n+1)+' is not an object');
  var id=String(x.id||'').trim(), name=String(x.name||x.task||'').trim();
  if(!id&&!name) throw new Error('Task #'+(n+1)+' needs an id or a name');
  if(!Array.isArray(x.difficulties)) throw new Error('Task "'+(id||name)+'" needs a difficulties list');
  var seen={};
  var diffs=x.difficulties.map(function(d){
    var dn=String(d&&d.name||'').trim();
    if(!dn) throw new Error('Task "'+(id||name)+'" has a difficulty without a name');
    if(seen[dn]) throw new Error('Task "'+(id||name)+'" lists "'+dn+'" twice');
    seen[dn]=1;
    var rw=Array.isArray(d.rewards)?d.rewards:[];
    return {name:dn,rewards:rw.map(function(r){
      var item=String(r&&r.item||'').trim(), q=Number(r&&r.qty);
      if(!item) throw new Error('"'+dn+'" has a reward without an item name');
      if(r.qty===undefined||r.qty===''||r.qty===null) q=0;
      if(!isFinite(q)||q<0) throw new Error('"'+dn+'", "'+item+'": qty is not a valid number');
      var o={item:item,qty:q}; if(r.qtyText&&String(r.qtyText).trim())o.qtyText=String(r.qtyText).trim(); return o;
    })};
  });
  return {id:id,name:name,difficulties:diffs};
}
function importRewards(text,fname){
  try{
    if(!String(text||'').trim()) throw new Error('That file is empty');
    var list;
    if(looksJson(text,fname)){
      var o=parseJsonText(text); list=Array.isArray(o)?o:(o&&o.tasks);
      if(!Array.isArray(list)) throw new Error('No "tasks" list found in that file');
    } else list=rewardsFromCsv(text);
    list=list.map(normalizeTask);
    var plan=[], skipped=0;
    list.forEach(function(x){
      var t=(x.id&&S.tasks.find(function(y){return y.id===x.id;}))||(x.name&&S.tasks.find(function(y){return y.name.toLowerCase()===x.name.toLowerCase();}));
      if(t) plan.push([t,x.difficulties]); else skipped++;
    });
    if(!plan.length) throw new Error('No task in the file matches your task ids or names');
    var floors=0;
    mutate(function(){plan.forEach(function(p){p[0].difficulties=p[1]; floors+=p[1].length;}); ui.ediff='';});
    toast('Rewards imported: '+plan.length+' task'+(plan.length===1?'':'s')+', '+floors+' floor'+(floors===1?'':'s')+(skipped?' ('+skipped+' skipped, no match)':''));
  }catch(e){toast(e&&e.message?e.message:'Could not import that file');}
}

/* --- import: classes --- */
function importClasses(text,fname){
  try{
    if(!String(text||'').trim()) throw new Error('That file is empty');
    var raw;
    if(looksJson(text,fname)){
      var o=parseJsonText(text); raw=Array.isArray(o)?o:(o&&o.classes);
      if(!Array.isArray(raw)) throw new Error('No "classes" list found in that file');
      raw=raw.map(function(c){return typeof c==='string'?c:(c&&c.name)||'';});
    } else {
      var rows=parseCsv(text); raw=rows.map(function(r){return r[0];});
      if(raw.length&&/^(class|classes|name)$/i.test(String(raw[0]).trim())) raw.shift();
    }
    var list=[];
    raw.forEach(function(c){c=String(c||'').trim(); if(c&&!list.some(function(x){return x.toLowerCase()===c.toLowerCase();})) list.push(c);});
    if(!list.length) throw new Error('No class names found in that file');
    var kept=0;
    mutate(function(){
      S.chars.forEach(function(ch){
        if(!ch.cls) return;
        var m=list.find(function(x){return x.toLowerCase()===ch.cls.toLowerCase();});
        if(m){ch.cls=m;} else {list.push(ch.cls); kept++;}   /* keep classes that characters still use */
      });
      S.classes=list;
    });
    toast('Classes imported: '+list.length+(kept?' ('+kept+' kept because characters use them)':''));
  }catch(e){toast(e&&e.message?e.message:'Could not import that file');}
}

/* --- UI: export / import buttons --- */
function transferBar(kind){
  var label=kind==='rewards'?'Rewards table':'Classes';
  return '<div class="xfer"><span class="sub"><b>'+label+'</b></span>'+
    '<button class="btn sm" data-act="exp-'+kind+'-json">'+ico('down')+'JSON</button>'+
    '<button class="btn sm" data-act="exp-'+kind+'-csv">'+ico('down')+'CSV</button>'+
    '<label class="btn sm" for="imp-'+kind+'" style="cursor:pointer">'+ico('up')+'Import</label>'+
    '<input id="imp-'+kind+'" type="file" accept=".json,.csv,.txt,application/json,text/csv,text/plain" data-act="imp-'+kind+'" hidden></div>';
}
