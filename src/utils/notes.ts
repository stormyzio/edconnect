export function noteToFloat(n: string): number {
  return parseFloat(n.replaceAll(",", "."));
}
