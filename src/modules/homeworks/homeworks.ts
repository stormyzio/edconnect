import type { DayHomeworks, Homeworks, HomeworksOptionsStrict, HomeworkTodo, SDate } from "../../types.js";
import { getIntermediaryDates } from "../../utils/dates.js";
import { fetchFutureHomeworks } from "./fetchFutureHomeworks.js";
import type { HomeworksRoot } from "./HomeworksRoot.js";

export async function fetchHomeworks(xToken: string, token2fa: string, options: HomeworksOptionsStrict): Promise<Homeworks> {
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
  myHeaders.append("x-token", xToken);

  const urlencoded = new URLSearchParams();
  urlencoded.append("data", "{}");

  const requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow",
  };

  let data = [];

  let range: SDate[];

  if (options.type == "future") {
    range = await fetchFutureHomeworks(xToken, token2fa);
  } else if (options.type == "interval") {
    range = getIntermediaryDates(options.from, options.to);
  } else {
    throw new Error("Invalid homeworks options.");
  }

  for (const sd of range) {
    let res = await fetch(`https://api.ecoledirecte.com/v3/Eleves/9064/cahierdetexte/${sd}.awp?verbe=get&v=4.91.0`, requestOptions);
    let d = await res.json();
    if (d.code == 200) {
      data.push(d.data);
    } else {
      throw new Error("Failed to fetch notes.");
    }
  }

  let homeworks = cleanHomeworks(data)

  return homeworks;
}

export function cleanHomeworks(homeworks: HomeworksRoot[]): Homeworks {
  return {
    days: homeworks.map(hw => ({
      date: hw.date,
      todo: hw.matieres
        .map((m) =>
          m.aFaire
            ? {
                subject: {
                  code: m.codeMatiere,
                  name: m.matiere,
                  teacher: m.nomProf,
                },
                content: atob(m.aFaire.contenu),
                givenDate: new Date(m.aFaire.donneLe),
              }
            : null
        )
        .filter((h) => h != null),
      content: hw.matieres
        .map((m) =>
          m.contenuDeSeance
            ? {
                subject: {
                  code: m.codeMatiere,
                  name: m.matiere,
                  teacher: m.nomProf,
                },
                content: atob(m.contenuDeSeance.contenu),
              }
            : null
        )
        .filter((h) => h != null),
    }))
  };
}
