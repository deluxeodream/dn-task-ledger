/* ---------- seed data (from patch 180, patch 197 and rcr_rewards) ---------- */
var FLOORS=(function(){
  var a=['Ascension 1F','Ascension 2F','Ascension 3F'],i;
  for(i=1;i<=8;i++)a.push('Ascension 3-'+i+'F');
  a.push('Ascension 4F'); for(i=1;i<=5;i++)a.push('Ascension 4-'+i+'F');
  a.push('Ascension 5F'); for(i=1;i<=5;i++)a.push('Ascension 5-'+i+'F');
  a.push('Ascension 6F','Ascension 6-1F','Ascension 6-2F');
  for(i=1;i<=10;i++)a.push('Dimension '+i+'F');
  return a;
})();
var HAM1='Heroic Lunar Eclipse Dragon Jade +1 Enhancement Hammer (+0 to +14) (Untradable)';
var HAM5='Heroic Lunar Eclipse Dragon Jade +5 Enhancement Hammer (+0 to +14) (Untradable)';
/* Weekly Conquest (Nightmare / Deep Abyss), patch 197: [Shiny Hero Coin, Superb Ancient Wisdom, +1 Hammer, +5 Hammer] */
var NMDATA=[[1,100,1,0],[1,100,1,0],[1,150,2,0],[1,150,2,0],[1,150,3,0],[1,150,3,0],[1,150,4,0],[1,150,4,0],[1,150,5,0],[1,150,5,0],[1,150,1,1],
 [2,165,1,1],[2,165,2,1],[2,165,2,1],[2,165,3,1],[2,165,3,1],[2,165,4,1],
 [3,180,4,1],[3,180,5,1],[3,180,5,1],[3,180,1,2],[3,180,1,2],[3,180,2,2],
 [4,200,2,2],[4,200,3,2],[4,200,3,2],
 [4,250,4,2],[4,250,4,2],[4,250,5,2],[5,250,5,2],[5,250,1,3],[5,250,1,3],[5,250,2,3],[5,250,2,3],[5,250,3,3],[5,250,3,3]];
/* Erosion rewards, patch 180: [gold, silver, copper] for Ascension 3-1F to 6-2F; Erosion Fragment 128 on every floor */
var EFMGOLD=[[27500,0,0],[27775,0,0],[28052,75,0],[28333,27,75],[28616,61,3],[28902,77,64],[29191,80,41],[29483,72,22],
 [29778,55,94],[30076,34,50],[30377,10,84],[30680,87,95],[30987,68,83],[31297,56,52],
 [31610,54,9],[31926,64,63],[32245,91,27],[32568,37,19],[32894,5,56],[33222,99,61],
 [33555,22,61],[33890,77,84],[34229,68,61]];
/* Royal Castle Ruins EX Nest, rcr_rewards: Ascension 3F to Dimension 10F fragment quantity */
var RCRFRAG=[5,6,7,8,9,10,11,12,13,15,16,17,18,19,20,10,10,13,13,14,15,16,17,18,19,20,25,10,12,14,15,21,27,32];

/* Selectable classes, in game order (grouped by job family). */
var CLASSLIST=['Inquisitor','Saint','Crusader','Guardian','Arch Heretic',
 'Sniper','Artillery','Tempest','Windwalker','Silver Hunter',
 'Moonlord','Gladiator','Barbarian','Destroyer','Mystic Knight','Grandmaster','Dark Avenger',
 'Saleana','Elestra','Smasher','Majesty','Black Mara',
 'Adept','Physician','Shooting Star','Gear Master','Ray Mechanic',
 'Ripper','Raven','Abyss Walker','Light Fury','Bleed Phantom',
 'Impactor','Luster','Defensio','Ruina','Beastia Reina',
 'Randgrid','Avalanche','Flurry','Sting Breezer','Vena Plaga',
 'Spirit Dancer','Blade Dancer','Soul Eater','Dark Summoner','Oracle Elder',
 'Duelist','Trickster','Maverick','Revenant','Lux Ascendant',
 'Ringmaster'];
function R(item,qty,qtyText){var o={item:item,qty:qty}; if(qtyText)o.qtyText=qtyText; return o;}
function emptyDiffs(){return FLOORS.map(function(n){return {name:n,rewards:[]};});}
function doneDiff(rewards){return [{name:'Done',rewards:rewards||[]}];}

/* ARK weekly clear rewards, patch 199 (Ark of Transcendence [Past] 1F-50F). Per floor: flat [itemIndex, qty, ...] */
var ARKITEMS=["Lunar Eclipse Fragment (6 Types)", "Ancient Broken Dragon Jade Fragment", "Ark Stone Fragment", "High Grade Lunar Eclipse Fragment (6 Types)", "Ancients' Blueprint Fragment", "Hero Coin", "Shiny Hero Coin", "High Purity Core Selection Pouch"];
var ARKDATA=[[0,150,1,5,2,1],[0,225,1,5,2,1],[0,300,1,5,2,1],[0,375,1,5,2,1],[0,450,1,8,2,1],[0,525,1,8,2,1],[0,600,1,8,2,1],[0,675,1,8,2,1],[0,750,1,8,2,1],[0,825,1,15,2,1],[0,900,1,15,2,1],[0,975,1,15,2,1],[0,1050,1,15,2,1],[0,1125,1,15,2,1],[3,45,1,23,2,1,4,45],[3,45,1,23,2,1,4,45],[3,45,1,23,2,1,4,45],[3,45,1,23,2,1,4,45],[3,45,1,23,2,1,4,45],[3,75,1,38,2,1,4,60],[3,75,1,38,2,1,4,60],[3,75,1,38,2,1,4,60],[3,75,1,38,2,1,4,60],[3,75,1,38,2,1,4,60],[3,150,1,45,2,1,4,75],[3,151,1,46,2,1,4,75,5,10000],[3,152,1,47,2,1,4,75,5,10000],[3,153,1,48,2,1,4,75,5,10000],[3,154,1,49,2,1,4,75,5,10000],[3,155,1,50,2,1,4,90,5,15000],[3,156,1,51,2,1,4,90,5,15000],[3,157,1,52,2,1,4,90,5,15000],[3,158,1,53,2,1,4,90,5,15000],[3,159,1,54,2,1,4,90,5,15000],[3,160,1,55,2,1,4,105,6,2],[3,161,1,56,2,1,4,105,6,2],[3,162,1,57,2,1,4,105,6,2],[3,163,1,58,2,1,4,105,6,2],[3,164,1,59,2,1,4,105,6,2],[3,165,1,60,2,1,4,120,6,3],[3,166,1,61,2,1,4,120,6,3],[3,167,1,62,2,1,4,120,6,3],[3,168,1,63,2,1,4,120,6,3],[3,169,1,64,2,1,4,120,6,3],[3,170,1,65,2,1,4,135,6,4,7,1],[3,171,1,66,2,1,4,135,6,4,7,1],[3,172,1,67,2,1,4,135,6,4,7,1],[3,173,1,68,2,1,4,135,6,4,7,1],[3,174,1,69,2,1,4,135,6,4,7,1],[3,175,1,70,2,1,4,150,6,5,7,1]];
function arkDiffs(){return ARKDATA.map(function(d,i){var rw=[];for(var k=0;k<d.length;k+=2)rw.push(R(ARKITEMS[d[k]],d[k+1]));return {name:'Ark of Transcendence [Past] '+(i+1)+'F',rewards:rw};});}

/* Decaying Root Cave chest selection (DNSEA Apr 2026), Ascension 1F to Dimension 4F.
   Groups of consecutive floors sharing one row: [floor count, [golden low, golden high, Twisted Root, Contaminated Will, silver low, silver high]].
   The fragment amount is a random range (low - high; the low value is counted in totals). Contaminated Will is a chance drop, so it counts as 0.
   Golden and silver are separate choices, so each floor has one entry per chest. */
var ROOTFRAG='Deeply Rooted Fragment of Longing';
var ROOTGROUPS=[[1,[3,9,0,0,1,0]],[1,[4,12,0,0,1,0]],[9,[5,15,0,0,2,0]],[6,[6,18,0,0,2,0]],[6,[8,24,2,1,2,7]],[3,[9,27,3,1,3,8]],
 [1,[10,30,3,1,3,9]],[1,[12,36,4,1,4,11]],[1,[13,39,4,1,4,12]],[1,[15,45,5,1,5,14]]];
function rootDiffs(){
  var gold=[], silver=[], idx=0;
  ROOTGROUPS.forEach(function(g){
    var v=g[1];
    for(var k=0;k<g[0];k++){
      var f=FLOORS[idx++], gr=[R(ROOTFRAG,v[0],v[0]+' - '+v[1])], sr=[v[5]?R(ROOTFRAG,v[4],v[4]+' - '+v[5]):R(ROOTFRAG,v[4])];
      if(v[2])gr.push(R('Twisted Root',v[2]));
      if(v[3])gr.push(R('Contaminated Will',0,v[3]+' (probability)'));
      gold.push({name:'Golden \u00b7 '+f,rewards:gr});
      silver.push({name:'Silver \u00b7 '+f,rewards:sr});
    }
  });
  return gold.concat(silver);
}

function defaultTasks(){
  var i0=FLOORS.indexOf('Ascension 3-1F'), i1=FLOORS.indexOf('Ascension 6-2F'), r0=FLOORS.indexOf('Ascension 3F');
  var efm=FLOORS.slice(i0,i1+1).map(function(n,i){var g=EFMGOLD[i];return {name:n,rewards:[R('Gold',g[0]+g[1]/100+g[2]/10000),R('Erosion Fragment',128)]};});
  var nm=FLOORS.map(function(n,i){var d=NMDATA[i],rw=[R('Shiny Hero Coin',d[0]),R('Superb Ancient Wisdom',d[1]),R(HAM1,d[2])]; if(d[3])rw.push(R(HAM5,d[3])); return {name:n,rewards:rw};});
  var rcr=FLOORS.slice(r0).map(function(n,i){
    var rw=[R(i<15?'Destroyed Ruins Fragment':(i<27?'Ruins Fragment':'Refined Ruins Fragment'),RCRFRAG[i])];
    if(i>=9&&i<=14) rw.push(R('Incomplete Royal Castle Heraldry',1));
    else if(i>=24&&i<=30) rw.push(R('Royal Castle Heraldry',1,'1~2'));
    else if(i>=31) rw.push(R('Royal Castle Heraldry',0,'1~2 (probability)'));
    return {name:n,rewards:rw};
  });
  function T(id,name,kind,sub,diffs){return {id:id,name:name,kind:kind,sub:sub||'',enabled:false,difficulties:diffs};}
  var ark=T('ark','ARK','diff','Weekly clear rewards by floor (patch 199). Multiple runs',arkDiffs()); ark.multi=true;
  return [
    ark,
    T('efm','EFM','efm','Fission Maze, Erosion rewards. Multiple runs',efm),
    T('nm','NM','nm','Nightmare (Deep Abyss). Highest clear counts',nm),
    T('rcr','RCR','diff','Royal Castle Ruins EX Nest',rcr),
    T('cube','Cube Awaken','diff','Difficulty',emptyDiffs()),
    T('root','Decaying Root','diff','Decaying Root Cave chest selection (DNSEA Apr 2026)',rootDiffs()),
    T('pfdl','Paradox FrDN L','done','Paradox Frozen Dragon Nest, Light',doneDiff([R('Awakened Mana Egg',200,'200 - 1000'),R('Paradox Vitality Recovery Potion',20)])),
    T('pfdn','Paradox FrDN N','done','Paradox Frozen Dragon Nest, Normal',doneDiff([R('Awakened Mana Egg',400,'400 - 2000'),R('Afterimage Record',45),R('Paradox Vitality Recovery Potion',20)])),
    T('godnz','GoDNZ','done','',doneDiff()),
    T('godn','GoDN','done','',doneDiff()),
    T('godnhc','GoDN HC','done','',doneDiff()),
    T('bonel','Bone L','done','',doneDiff()),
    T('bonen','Bone N','done','',doneDiff()),
    T('bonehc','Bone HC','done','',doneDiff()),
    T('bdnl','BDN L','done','',doneDiff()),
    T('bdnhc','BDN HC','done','',doneDiff()),
    T('ddn','DDN','done','',doneDiff()),
    T('gudnhc','GUDN HC','done','',doneDiff())
  ];
}
