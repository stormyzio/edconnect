import type { Fetcher } from "../../Fetcher.js";
import type { DayHomeworks, FutureHomeworksOptions, Homeworks, RangeHomeworksOptions, SDate } from "../../types.js";
import { bdecode } from "../../utils/base64.js";
import { getIntermediaryDates } from "../../utils/dates.js";
import type { HomeworksRoot } from "./HomeworksRoot.js";

export class HomeworksMod {
  private static async getDayHomeworks(fetcher: Fetcher, day: SDate): Promise<DayHomeworks> {
    return this.cleanDayHomeworks(await fetcher.request<HomeworksRoot>({ anneeScolaire: "2025-2026" }, `cahierdetexte/${day}.awp`, `homeworks for day ${day}`));
  }

  static async getFutureHomeworks(fetcher: Fetcher, _options: FutureHomeworksOptions): Promise<Homeworks> {
    let data = await fetcher.request<Record<string, unknown>>({ anneeScolaire: "2025-2026" }, "cahierdetexte.awp", "future homeworks");
    let dates = Object.keys(Object.fromEntries(Object.entries(data).filter(([key, _]) => new Date(key).getTime() > new Date(Date.now()).getTime() - 1000 * 60 * 60 * 24))) as SDate[];
    return {
      days: await Promise.all(dates.map((d) => HomeworksMod.getDayHomeworks(fetcher, d))),
    };
  }

  static async getRangeHomeworks(fetcher: Fetcher, options: RangeHomeworksOptions) {
    let dates = getIntermediaryDates(options.from, options.to);
    return {
      days: await Promise.all(dates.map((d) => HomeworksMod.getDayHomeworks(fetcher, d))),
    };
  }

  static cleanDayHomeworks(dayHomeworks: HomeworksRoot): DayHomeworks {
    return {
      day: dayHomeworks.date,
      todo: dayHomeworks.matieres
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
      content: dayHomeworks.matieres
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
    };
  }
}
