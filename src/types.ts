// GLOBAL -----------------------------------------------

export type SDate = `${number}-${number}-${number}`;

export interface ClientOptions {
  /**
   * Enable authentication logs in the console.
   */
  authLogs?: boolean;
}

// AUTH -----------------------------------------------

export interface Cookie {
  name: string;
  value: string;
}

export interface FinalConnectionSecret {
  cn: string;
  cv: string;
}

export interface Secrets {
  /**
   * Connection secret cn - for double authentication.
   */
  cn: string;
  /**
   * Connection secret cv - for double authentication.
   */
  cv: string;
  /**
   * X-Token for requests.
   */
  xToken: string;
  /**
   * 2fa-Token for requests.
   */
  token2fa: string;
}

// NOTES -----------------------------------------------

export interface NotesOptions {}

export interface NoteClassData {
  classMin: number;
  classMax: number;
  classAvg: number;
}

export interface Note {
  name: string;
  date: Date;
  dateEntry: Date;

  subjectCode: string;
  subjectName: string;

  periodCode: string;

  significant: boolean;

  note: number;
  class: NoteClassData;

  coef: number;
  noteOver: number;
}

export interface NoteSubject {
  code: string;
  name: string;

  coef: number;

  nbStudents: number;

  avg: number;
  class: NoteClassData;

  teachers: string[];
}

export interface NotePeriod {
  code: string;
  name: string;

  start: Date;
  end: Date;

  avg: number;
  class: NoteClassData;

  subjects: NoteSubject[];
}

export interface Notes {
  /**
   *
   * @param offset Optional - takes the n last note.
   * @returns the last note or the note corresponding to the offset sorted by dateEntry descending.
   */
  getLastEntry: (offset?: number) => Note | undefined;
  /**
   *
   * @param offset Optional - takes the n last note.
   * @returns the last note or the note corresponding to the offset sorted by date descending.
   */
  getLast: (offset?: number) => Note | undefined;
  notes: Note[];
  periods: NotePeriod[];
}

// HOMEWORKS -----------------------------------------------

export interface HomeworksOptionsIntervalStrict {
  type: "interval";
  from: SDate;
  to: SDate;
}
export interface HomeworksOptionsFutureStrict {
  type: "future";
}
export type HomeworksOptionsStrict = HomeworksOptionsIntervalStrict | HomeworksOptionsFutureStrict;

export interface HomeworksOptionsInterval extends Omit<HomeworksOptionsIntervalStrict, "type"> {}
export interface HomeworksOptionsFuture extends Omit<HomeworksOptionsFutureStrict, "type"> {}
export type HomeworksOptions = HomeworksOptionsInterval | HomeworksOptionsFuture;

export interface HomeworkSubject {
  code: string;
  name: string;
  teacher: string;
}

export interface HomeworkTodo {
  subject: HomeworkSubject;

  content: string;
  givenDate: Date;
}

export interface HomeworkContent {
  subject: HomeworkSubject;

  content: string;
}

export interface DayHomeworks {
  todo: HomeworkTodo[];
  content: HomeworkContent[];
  date: SDate;
}

export interface Homeworks {
  days: DayHomeworks[];
}