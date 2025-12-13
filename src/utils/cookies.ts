import type { Cookie } from "../types.js";

export function parseCookies(raw: string) {
  let splittedCookies = raw.split(", ");
  let cookies: Cookie[] = splittedCookies.map((c) => ({
    name: c.split("=")[0] || "",
    value: c.split("=")[1]?.split(";")[0] || "",
  }));
  return cookies;
}
