import type { Authentifier } from "../../Authentifier.js";
import type { Fetcher } from "../../Fetcher.js";
import type { Notes, NotesOptions, NotesParams } from "../../types.js";
import { setDefaultHeaders } from "../../utils/headersAppending.js";
import { noteToFloat } from "../../utils/notes.js";
import { Mod } from "../types.js";
import type { NoteRoot } from "./NoteRoot.js";

export class NotesMod {
  static async getNotes(fetcher: Fetcher, _options: NotesOptions): Promise<Notes> {
    return NotesMod.clean(await fetcher.request<NoteRoot>({ anneeScolaire: "" }, "notes.awp", "notes", "eleves"));
  }

  static clean(notes: NoteRoot): Notes {
    return {
      getLastEntry(offset = 0) {
        return this.notes.sort((a, b) => b.dateEntry.getTime() - a.dateEntry.getTime())[offset];
      },
      getLast(offset = 0) {
        return this.notes.sort((a, b) => b.date.getTime() - a.date.getTime())[offset];
      },
      notes: notes.notes.map((n) => ({
        note: noteToFloat(n.valeur),
        noteOver: noteToFloat(n.noteSur),
        coef: noteToFloat(n.coef),
        date: new Date(n.date),
        dateEntry: new Date(n.dateSaisie),
        name: n.devoir,
        periodCode: n.codePeriode,
        significant: !n.nonSignificatif,
        subjectCode: n.codeMatiere,
        subjectName: notes.periodes.find((p) => p.codePeriode == n.codePeriode)?.ensembleMatieres.disciplines.find((s) => s.codeMatiere == n.codeMatiere)?.discipline || "",
        class: {
          classAvg: noteToFloat(n.moyenneClasse),
          classMin: noteToFloat(n.minClasse),
          classMax: noteToFloat(n.maxClasse),
        },
      })),
      periods: notes.periodes.map((p) => ({
        avg: noteToFloat(p.ensembleMatieres.moyenneGenerale || "0"),
        code: p.codePeriode,
        start: new Date(p.dateDebut),
        end: new Date(p.dateFin),
        name: p.periode,
        class: {
          classAvg: noteToFloat(p.ensembleMatieres.moyenneClasse || "0"),
          classMin: noteToFloat(p.ensembleMatieres.moyenneMin || "0"),
          classMax: noteToFloat(p.ensembleMatieres.moyenneMax || "0"),
        },
        subjects: p.ensembleMatieres.disciplines.map((s) => ({
          code: s.codeMatiere,
          name: s.discipline,

          coef: s.coef,

          nbStudents: s.effectif,

          avg: noteToFloat(s.moyenne || "0"),
          class: {
            classAvg: noteToFloat(s.moyenneClasse || "0"),
            classMin: noteToFloat(s.moyenneMin || "0"),
            classMax: noteToFloat(s.moyenneMax || "0"),
          },

          teachers: s.professeurs.map((t) => t.nom),
        })),
      })),
    };
  }
}
