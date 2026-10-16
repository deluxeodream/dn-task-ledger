/* ---------- render ---------- */
function render(){
  if(!ready) return;
  WKS=weekStart(new Date()); WK=dateKey(WKS); buildIdx();
  var gw=$('#gridwrap'), sl=gw?gw.scrollLeft:0, sy=window.scrollY;
  $('#app').innerHTML=shell()+(S.setupDone?'':setupHtml())+dlgHtml();
  if(ui.dlg&&ui.dlg.sel){var bt=$('#bk-text'); if(bt){bt.focus(); bt.select();} ui.dlg.sel=false;}
  Array.prototype.forEach.call(document.querySelectorAll('input[data-partial]'),function(i){i.indeterminate=true;});
  var g2=$('#gridwrap'); if(g2) g2.scrollLeft=sl;
  window.scrollTo(0,sy);
}
function refreshGrid(){var g=$('#gridwrap'); if(g){var sl=g.scrollLeft; g.innerHTML=gridHtml(); g.scrollLeft=sl;}}
