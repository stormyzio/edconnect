import type { Authentifier } from "../../Authentifier.js";
import { ED_VERSION } from "../../constants.js";
import type { SDate } from "../../types.js";
import { setDefaultHeaders } from "../../utils/headersAppending.js";

export async function fetchFutureHomeworks(auth: Authentifier): Promise<SDate[]> {
  let myHeaders = new Headers();
  myHeaders = setDefaultHeaders(myHeaders);
  myHeaders.append("2fa-token", auth.token2fa);
  myHeaders.append("x-token", auth.xToken);

  const urlencoded = new URLSearchParams();
  urlencoded.append("data", "{}");

  const requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow",
  };

  let res = await fetch(`https://api.ecoledirecte.com/v3/Eleves/${auth.id}/cahierdetexte.awp?verbe=get&v=${ED_VERSION}`, requestOptions);
  let data = await res.json();
  if (data.code == 200) {
    return Object.keys(Object.fromEntries(
      Object.entries(data.data).filter(([key, _]) => new Date(key).getTime() > new Date(Date.now()).getTime() - 1000*60*60*24)
    )) as SDate[];
  } else {
    throw new Error("Failed to fetch homeworks.");
  }
}
