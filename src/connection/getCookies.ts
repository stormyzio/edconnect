import { ED_VERSION } from "../constants.js";
import { setDefaultHeaders } from "../utils/headersAppending.js";

export async function getCookies() {
  let myHeaders = new Headers();
  myHeaders = setDefaultHeaders(myHeaders);

  const requestOptions: RequestInit = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  let res = await fetch(`https://api.ecoledirecte.com/v3/login.awp?gtk=1&v=${ED_VERSION}`, requestOptions);

  return res;
}
