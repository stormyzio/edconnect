import type { Authentifier } from "../../Authentifier.js";
import type { DayHomeworks, Homeworks, HomeworksOptionsStrict, HomeworkTodo, SDate } from "../../types.js";
import { bdecode } from "../../utils/base64.js";
import { getIntermediaryDates } from "../../utils/dates.js";
import { setDefaultHeaders } from "../../utils/headersAppending.js";
import { fetchFutureHomeworks } from "./fetchFutureHomeworks.js";
import type { HomeworksRoot } from "./HomeworksRoot.js";

export async function fetchHomeworks(auth: Authentifier, options: HomeworksOptionsStrict): Promise<Homeworks> {
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

  let data = [];

  let range: SDate[];

  if (options.type == "future") {
    range = await fetchFutureHomeworks(auth);
  } else if (options.type == "interval") {
    range = getIntermediaryDates(options.from, options.to);
  } else {
    throw new Error("Invalid homeworks options.");
  }

  for (const sd of range) {
    let res = await fetch(`https://api.ecoledirecte.com/v3/Eleves/${auth.id}/cahierdetexte/${sd}.awp?verbe=get&v=4.91.0`, requestOptions);
    let d = await res.json();
    if (d.code == 200) {
      data.push(d.data);
    } else {
      throw new Error("Failed to fetch homeworks.");
    }
  }

  let homeworks = cleanHomeworks(data);

  return homeworks;
}

export function cleanHomeworks(homeworks: HomeworksRoot[]): Homeworks {
  return {
    days: homeworks.map((hw) => ({
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
                content: bdecode(m.aFaire.contenu),
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
                content: bdecode(m.contenuDeSeance.contenu),
              }
            : null
        )
        .filter((h) => h != null),
    })),
  };
}
