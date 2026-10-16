/* ---------- charts ---------- */
function barChart(data){
  var max=0; data.forEach(function(d){if(d.value>max)max=d.value;});
  if(max<=0) return '<div class="empty" style="padding:28px 12px"><span>No gold recorded in this range yet.</span></div>';
  var p=Math.pow(10,Math.floor(Math.log10(max))), step=p/2, top=Math.ceil(max/step)*step;
  var W=560,H=200,pl=46,pr=10,pt=20,pb=28, iw=W-pl-pr, ih=H-pt-pb, band=iw/data.length, bw=Math.min(54,band*.62), s='';
  [0,top/2,top].forEach(function(t){var y=pt+ih-(t/top)*ih; s+='<line class="g" x1="'+pl+'" x2="'+(W-pr)+'" y1="'+y+'" y2="'+y+'"/><text x="'+(pl-6)+'" y="'+(y+4)+'" text-anchor="end">'+fmtCompact(Math.round(t))+'</text>';});
  data.forEach(function(d,i){
    var h=(d.value/top)*ih, x=pl+band*i+(band-bw)/2, y=pt+ih-h;
    s+='<rect class="b'+(d.cur?' cur':'')+'" x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+Math.max(h,0).toFixed(1)+'" rx="4"/>';
    if(d.value>0&&data.length<=8) s+='<text class="vl" x="'+(x+bw/2).toFixed(1)+'" y="'+(y-5).toFixed(1)+'" text-anchor="middle">'+fmtCompact(Math.round(d.value))+'</text>';
    s+='<text x="'+(x+bw/2).toFixed(1)+'" y="'+(H-8)+'" text-anchor="middle">'+esc(d.label)+'</text>';
  });
  return '<svg class="chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Gold earned per period">'+s+'</svg>';
}
