import type { SDate } from "../../types.js";

export type HomeworksRoot = {
  date: SDate;
  matieres: Array<{
    entityCode: string;
    entityLibelle: string;
    entityType: string;
    matiere: string;
    codeMatiere: string;
    nomProf: string;
    contenuDeSeance?: {
      idDevoir: number;
      contenu: string;
      documents: Array<any>;
      commentaires: Array<any>;
      elementsProg: Array<any>;
      liensManuel: Array<any>;
    };
    id: number;
    interrogation: boolean;
    blogActif: boolean;
    nbJourMaxRenduDevoir: number;
    aFaire?: {
      idDevoir: number;
      contenu: string;
      rendreEnLigne: boolean;
      donneLe: string;
      effectue: boolean;
      ressource: string;
      documentsRendusDeposes: boolean;
      ressourceDocuments: Array<any>;
      documents: Array<any>;
      commentaires: Array<any>;
      elementsProg: Array<any>;
      liensManuel: Array<any>;
      documentsRendus: Array<any>;
      tags: Array<any>;
      cdtPersonnalises: Array<any>;
      contenuDeSeance: {
        contenu: string;
        documents: Array<any>;
        commentaires: Array<any>;
      };
    };
  }>;
};
