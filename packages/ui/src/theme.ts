export const elementTheme = {
  wood: {
    strong: "bg-[#93d5b1] text-white border-[#7dc79f]",
    soft: "bg-[#a8dfbf] text-white border-[#8ecfaf]",
  },
  fire: {
    strong: "bg-[#e66d8f] text-white border-[#da5f82]",
    soft: "bg-[#e7849d] text-white border-[#da718c]",
  },
  earth: {
    strong: "bg-[#f0c969] text-white border-[#e2bb57]",
    soft: "bg-[#f2cf78] text-white border-[#e4c164]",
  },
  metal: {
    strong: "bg-[#fbfdff] text-[#67718e] border-[#afc9f2]",
    soft: "bg-[#ffffff] text-[#6f7894] border-[#bdd3f5]",
  },
  water: {
    strong: "bg-[#6d7591] text-white border-[#5e6785]",
    soft: "bg-[#77809a] text-white border-[#666f8b]",
  },
} as const;

export function getElementThemeKey(char: string): keyof typeof elementTheme {
  if (["甲", "乙", "寅", "卯"].includes(char)) {
    return "wood";
  }
  if (["丙", "丁", "巳", "午"].includes(char)) {
    return "fire";
  }
  if (["戊", "己", "辰", "戌", "丑", "未"].includes(char)) {
    return "earth";
  }
  if (["庚", "辛", "申", "酉"].includes(char)) {
    return "metal";
  }

  return "water";
}
