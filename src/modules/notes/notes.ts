import type { Authentifier } from "../../Authentifier.js";
import { ED_VERSION } from "../../constants.js";
import type { NotesOptions, Notes } from "../../types.js";
import { setDefaultHeaders } from "../../utils/headersAppending.js";
import { noteToFloat } from "../../utils/notes.js";
import type { RootNote } from "./RootNote.js";

export async function fetchNotes(auth: Authentifier, options: NotesOptions): Promise<Notes> {
  let myHeaders = new Headers();
  myHeaders = setDefaultHeaders(myHeaders);
  myHeaders.append("2fa-token", auth.token2fa);
  myHeaders.append("x-token", auth.xToken);

  const urlencoded = new URLSearchParams();
  urlencoded.append("data", '{\n    "anneeScolaire": "2025-2026"\n}');

  const requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow",
  };

  let res = await fetch(`https://api.ecoledirecte.com/v3/eleves/${auth.id}/notes.awp?verbe=get&v=${ED_VERSION}`, requestOptions);
  let data = await res.json();
  if (data.code == 200) {
    return cleanNotes(data.data);
  } else {
    throw new Error("Failed to fetch notes.");
  }
}

export function cleanNotes(notes: RootNote): Notes {
  return {
    getLastEntry(offset = 0) {
      return this.notes.sort((a, b) => b.dateEntry.getTime() - a.dateEntry.getTime())[offset];
    },
    /**
     *
     * @param offset Optional - takes the n last note.
     * @returns the last note or the note corresponding to the offset sorted by date descending.
     */
    getLast(offset = 0) {
      return this.notes.sort((a, b) => b.date.getTime() - a.date.getTime())[offset];
    },
    /**
     * Mapping notes and periods
     */
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
