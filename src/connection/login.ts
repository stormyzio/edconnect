import { ED_VERSION } from "../constants.js";
import type { Cookie } from "../types.js";
import { setDefaultHeaders } from "../utils/headersAppending.js";

export async function login(cookies: Cookie[], cookiesString: string, username: string, password: string, uuid: string) {
  let myHeaders = new Headers();
  myHeaders = setDefaultHeaders(myHeaders);
  myHeaders.append("x-gtk", cookies.find((c) => c.name == "GTK")?.value || "");
  myHeaders.append("Cookie", cookiesString);

  const urlencoded = new URLSearchParams();
  urlencoded.append(
    "data",
    JSON.stringify({
      identifiant: username,
      motdepasse: password,
      isReLogin: false,
      sesouvenirdemoi: true,
      uuid: uuid,
      fa: [],
    })
  );

  const requestOptions2: RequestInit = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow",
  };

  let res = await fetch(`https://api.ecoledirecte.com/v3/login.awp?v=${ED_VERSION}`, requestOptions2);
  return res;
}
