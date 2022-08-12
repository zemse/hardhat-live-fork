export function hexValue(hex: string) {
  if (hex.startsWith("0x")) {
    hex = hex.substring(2);
  }

  let i = 0;
  for (; i < hex.length; i++) {
    if (hex[i] != "0") {
      break;
    }
  }
  hex = hex.slice(i);
  return "0x" + (hex || "0");
}
