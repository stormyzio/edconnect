export async function doubleauth1(token: string, token2fa: string) {
  const myHeaders = new Headers();
  myHeaders.append("2fa-token", token2fa);
  myHeaders.append("accept", "application/json, text/plain, */*");
  myHeaders.append("accept-language", "fr-FR,fr;q=0.9");
  myHeaders.append("content-type", "application/x-www-form-urlencoded");
  myHeaders.append("origin", "https://www.ecoledirecte.com");
  myHeaders.append("priority", "u=1, i");
  myHeaders.append("referer", "https://www.ecoledirecte.com/");
  myHeaders.append("sec-ch-ua", '"Chromium";v="142", "Brave";v="142", "Not_A Brand";v="99"');
  myHeaders.append("sec-ch-ua-mobile", "?0");
  myHeaders.append("sec-ch-ua-platform", '"macOS"');
  myHeaders.append("sec-fetch-dest", "empty");
  myHeaders.append("sec-fetch-mode", "cors");
  myHeaders.append("sec-fetch-site", "same-site");
  myHeaders.append("sec-gpc", "1");
  myHeaders.append("user-agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36");
  myHeaders.append("x-token", token);

  const urlencoded = new URLSearchParams();
  urlencoded.append("data", "{}");

  const requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow",
  };

  let res = await fetch("https://api.ecoledirecte.com/v3/connexion/doubleauth.awp?verbe=get&v=4.90.1", requestOptions);
  return res;
}
