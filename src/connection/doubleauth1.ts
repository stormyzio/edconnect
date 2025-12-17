import { ED_VERSION } from "../constants.js";
import { setDefaultHeaders } from "../utils/headersAppending.js";

export async function doubleauth1(token: string, token2fa: string) {
  let myHeaders = new Headers();
  myHeaders = setDefaultHeaders(myHeaders);
  myHeaders.append("2fa-token", token2fa);
  myHeaders.append("x-token", token);

  const urlencoded = new URLSearchParams();
  urlencoded.append("data", "{}");

  const requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow",
  };

  let res = await fetch(`https://api.ecoledirecte.com/v3/connexion/doubleauth.awp?verbe=get&v=${ED_VERSION}`, requestOptions);
  return res;
}
