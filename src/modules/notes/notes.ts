import type { NotesOptions, Notes } from "../../types.js";
import { noteToFloat } from "../../utils/notes.js";
import type { RootNote } from "./RootNote.js";

export async function fetchNotes(xToken: string, token2fa: string, options: NotesOptions): Promise<Notes> {
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
  urlencoded.append("data", '{\n    "anneeScolaire": ""\n}');

  const requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow",
  };

  let res = await fetch("https://api.ecoledirecte.com/v3/eleves/9064/notes.awp?verbe=get&v=4.90.1", requestOptions);
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
