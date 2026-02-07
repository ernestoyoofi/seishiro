export default function formatKey(strkey: string = ""): string {
  const keyStr = String(strkey || "")
    .trim()
    .replace(/[^a-zA-Z0-9-.:]/g, "");
  return String(keyStr || "");
}
