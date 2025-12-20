type MessagePerson = {
  nom: string;
  prenom: string;
  particule: string;
  civilite: string;
  role: string;
  listeRouge: boolean;
  id: number;
  read: boolean;
  fonctionPersonnel: string;
}

export type MessageRoot = {
  id: number;
  responseId: number;
  forwardId: number;
  mtype: string;
  read: boolean;
  idDossier: number;
  idClasseur: number;
  transferred: boolean;
  answered: boolean;
  to_cc_cci: string;
  brouillon: boolean;
  canAnswer: boolean;
  subject: string;
  content: string;
  date: string;
  from: MessagePerson;
  to: Array<MessagePerson>;
  files: Array<{
    id: number;
    libelle: string;
    date: string;
    type: string;
    signatureDemandee: boolean;
    etatSignatures: Array<any>;
    signature: {};
  }>;
};

export type MessagesRoot = {
  classeurs: Array<any>;
  messages: {
    received: Array<MessageRoot>;
    sent: Array<MessageRoot>;
    draft: Array<MessageRoot>;
    archived: Array<MessageRoot>;
  };
  parametrage: {
    isActif: boolean;
    canParentsLireMessagesEnfants: boolean;
    destAdmin: boolean;
    destEleve: boolean;
    destFamille: boolean;
    destProf: boolean;
    destEspTravail: boolean;
    disabledNotification: boolean;
    notificationEmailEtablissement: boolean;
    choixMailNotification: number;
    autreMailNotification: string;
    mailPro: string;
    mailPerso: string;
    messagerieApiVersion: string;
    blackListProfActive: boolean;
    estEnBlackList: boolean;
    afficherToutesLesClasses: boolean;
  };
  pagination: {
    messagesRecusCount: number;
    messagesEnvoyesCount: number;
    messagesArchivesCount: number;
    messagesRecusNotReadCount: number;
    messagesDraftCount: number;
  };
};
