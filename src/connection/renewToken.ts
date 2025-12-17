import { setDefaultHeaders } from "../utils/headersAppending.js";

export async function renewToken(username: string, cookiesString: string, xToken: string, token2fa: string, accessToken: string, uuid: string) {
  let myHeaders = new Headers();
  myHeaders = setDefaultHeaders(myHeaders);
  myHeaders.append("X-Token", xToken);
  myHeaders.append("2FA-Token", token2fa);
  myHeaders.append("Cookie", cookiesString);

  const urlencoded = new URLSearchParams();
  urlencoded.append(
    "data",
    JSON.stringify({
      identifiant: username,
      motdepasse: "???",
      isReLogin: true,
      typeCompte: "E",
      uuid: uuid,
      accesstoken: accessToken,
    })
  );

  const requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow",
  };

  let res = await fetch("https://api.ecoledirecte.com/v3/login.awp?v=7.7.6", requestOptions);
  return res;
}
