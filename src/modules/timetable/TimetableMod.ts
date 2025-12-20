import type { Fetcher } from "../../Fetcher.js";
import type { HexColor, SDate, SDateAndHour, Timetable, TimetableClass, TimetableOptions } from "../../types.js";
import { type TimetableRoot } from "./TimetableRoot.js";

export class TimetableMod {

  static async getTimetable(fetcher: Fetcher, options: TimetableOptions): Promise<Timetable> {
    let data = await fetcher.request<TimetableRoot>(
      {
        avecTrous: false,
        dateDebut: options.from,
        dateFin: options.to,
      },
      "emploidutemps.awp",
      "timetable",
      "E"
    );

    return TimetableMod.clean(data)
  }

  static clean(data: TimetableRoot): Timetable {
    return {
      classes: data.map<TimetableClass>(c => ({
        cancelled: c.isAnnule,
        color: c.color as HexColor,
        endDate: c.end_date as SDateAndHour,
        startDate: c.start_date as SDateAndHour,
        flexible: c.isFlexible,
        id: c.id,
        modified: c.isModifie,
        name: c.text,
        subject: {
          code: c.codeMatiere,
          name: c.matiere,
          teacher: c.prof
        }
      })).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    }
  }

}