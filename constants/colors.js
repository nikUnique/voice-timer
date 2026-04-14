export const Colors = {
  primaryTint90: "#e7f1f3",
  primaryTint70: "#b6d5da",
  primaryTint40: "#6daab6",
  primaryTint8: "#0c8599",
  // cyan 9 is a primary color
  primary: "#0b7285",
  primaryShade30: "#08505d",
  whiteAlpha20: "rgba(255, 255, 255, 0.2)",
  whiteAlpha10: "rgba(255, 255, 255, 0.1)",
  blackAlpha20: "rgba(0, 0, 0, 0.3)",
  gray: "#343a40",
  grayShade20: "#2a2e33",
  grayShade30: "#24292d",
  grayTint10: "#484e53",
  grayTint20: "#5d6166",
  grayTint70: "#c2c4c6",

  // --- card backgrounds — maketintsandshades.com shade-75 of respective OC base ---
  // shade-75: color × 0.25

  // shade-75 of oc-cyan-5 #22b8cf → rgb(34×.25, 184×.25, 207×.25) = rgb(9,46,52)
  primaryShade50: "#092e34",

  // shade-75 of oc-yellow-7 #f59f00 → rgb(245×.25, 159×.25, 0×.25) = rgb(61,40,0)
  pausedShade: "#3d2800",

  // shade-75 of oc-teal-3 #63e6be → rgb(99×.25, 230×.25, 190×.25) = rgb(25,58,48)
  doneShade: "#193a30",

  // shade-75 of oc-indigo-3 #91a7ff → rgb(145×.25, 167×.25, 255×.25) = rgb(36,42,64)
  resetShade: "#242a40",

  // --- paused (amber) — oc-yellow-7 (#f59f00) ---
  // https://yeun.github.io/open-color (yellow, row 7)
  pausedColor: "#f59f00",
  pausedAlpha15: "rgba(245,159,0,0.15)",
  pausedAlpha20: "rgba(245,159,0,0.20)",

  // --- reset (indigo) — oc-indigo-3 (#91a7ff) ---
  // https://yeun.github.io/open-color (indigo, row 3)
  resetColor: "#91a7ff",
  resetAlpha15: "rgba(145,167,255,0.15)",

  // --- Danger (red) palette ---
  // oc-red-5 (#ff6b6b) — https://yeun.github.io/open-color
  dangerColor: "#ff6b6b",
  // oc-teal-3 @ 12% — maketintsandshades.com
  doneIconBg: "rgba(99,230,190,0.12)",
  // oc-red-5 at 12% opacity (icon box bg)
  dangerIconBg: "rgba(255,107,107,0.12)",
  // oc-red-7 (#e03131) at 20% opacity (confirm button bg)
  dangerBg: "rgba(224,49,49,0.20)",
  // oc-red-7 (#e03131) at 35% opacity (confirm button border)
  dangerBorder: "rgba(224,49,49,0.35)",

  // --- Overlay ---
  // black at 60% opacity — maketintsandshades.com base black
  blackAlpha60: "rgba(0,0,0,0.6)",
};
