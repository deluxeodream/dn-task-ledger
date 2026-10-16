/* ---------- icons ---------- */
var IC={
  dash:'<path d="M4 4h7v7H4zM13 4h7v4h-7zM13 11h7v9h-7zM4 14h7v6H4z"/>',
  list:'<path d="M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/>',
  chart:'<path d="M4 20V11M10 20V4M16 20v-7M22 20H2"/>',
  sliders:'<path d="M4 7h8M16 7h4M4 17h4M12 17h8"/><circle cx="14" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  trash:'<path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/>',
  x:'<path d="M6 6l12 12M18 6L6 18"/>',
  check:'<path d="M5 12l4 4 10-10"/>',
  down:'<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
  up:'<path d="M12 16V5M7 9l5-5 5 5M5 20h14"/>',
  clock:'<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
  left:'<path d="M15 5l-7 7 7 7"/>',
  right:'<path d="M9 5l7 7-7 7"/>',
  users:'<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6M17 5a3 3 0 010 6M21 20c0-2.5-1.3-4.5-3.5-5.5"/>',
  coin:'<circle cx="12" cy="12" r="8"/><path d="M12 8v8M9.5 10.5c0-1 1-1.5 2.5-1.5s2.5.6 2.5 1.7-1 1.5-2.5 1.8-2.5.7-2.5 1.8 1 1.7 2.5 1.7 2.5-.6 2.5-1.5"/>',
  target:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/>'
};
function ico(n){return '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">'+IC[n]+'</svg>';}
