export function setDefaultHeaders(headers: Headers): Headers {
  const h = headers;

  h.append("host", "api.ecoledirecte.com");
  h.append("accept", "application/json, text/plain, */*");
  h.append("accept-language", "fr-FR,fr;q=0.9");
  h.append("accept-encoding", "gzip, deflate, br");
  h.append("connection", "keep-alive");

  h.append("sec-fetch-site", "cross-site");
  h.append("sec-fetch-dest", "empty");
  h.append("sec-fetch-mode", "cors");

  h.append("content-type", "application/x-www-form-urlencoded");
  h.append("origin", "ionic://ecoledirecte.com");

  h.append("user-agent", "Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148  EDMOBILE v7.7.6");

  return h;
}