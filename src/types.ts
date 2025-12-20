// GLOBAL -----------------------------------------------

export type SDate = `${number}-${number}-${number}`;

export type SDateAndHour = `${SDate} ${number}:${number}:${number}`

export type HexColor = `#${string}`

export interface ClientOptions {
  /**
   * Enable authentication logs in the console.
   */
  debug?: boolean;
}

// AUTH -----------------------------------------------

export interface Cookie {
  name: string;
  value: string;
}

export interface DoubleauthSecrets {
  cn: string;
  cv: string;
}

export interface Doubleauth {
  question: string;
  propositions: string[];
}

export interface Secrets {
  /**
   * Connection secret cn - for double authentication.
   */
  cn?: string;
  /**
   * Connection secret cv - for double authentication.
   */
  cv?: string;
  /**
   * X-Token for requests.
   */
  xToken?: string;
  /**
   * 2fa-Token for requests.
   */
  token2fa?: string;
  /**
   * UUID used during the login process - for renewed sessions.
   */
  uuid?: string;
  /**
   * Access token during the login process - for renewed sessions.
   */
  accessToken?: string;
  /**
   * Id used for data fetching requests
   */
  id?: string;
}

// NOTES -----------------------------------------------

export interface NotesOptions {}
export interface NotesParams {}

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

export interface RangeHomeworksOptions {
  from: SDate;
  to: SDate;
}
export interface FutureHomeworksOptions {}

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
  day: SDate;
}

export interface Homeworks {
  days: DayHomeworks[];
}

// MESSAGES -----------------------------------------------

export type MessageFolder = "received" | "sent" | "draft" | "archived"

export interface MessagesListOptions {
  folder?: MessageFolder,
  page?: number
}

export interface MessageContentOptions {
  id: number;
}

export interface MessagePerson {
  prefix: string;
  firstName: string;
  name: string;
}

export interface MessageFile {
  id: number;
  name: string;
  date: SDate;
}

export interface Message {
  answered: boolean;
  draft: boolean;
  canAnwser: boolean;
  date: SDateAndHour;
  from: MessagePerson;
  to: MessagePerson[];
  id: number;
  read: boolean;
  subject: string;
  transferred: boolean;
  files: MessageFile[];

  content: string;
}

export interface MessagesList {
  messages: Message[]
}

// TIMETABLE -----------------------------------------------

export interface TimetableOptions {
  from: SDate;
  to: SDate;
}

export interface TimetableSubject {
  code: string;
  name: string;
  teacher: string;
}

export interface TimetableClass {
  id: number;
  name: string;
  color: HexColor;

  cancelled: boolean;
  modified: boolean;
  flexible: boolean;

  subject: TimetableSubject;
  
  startDate: SDateAndHour;
  endDate: SDateAndHour;
}

export interface Timetable {
  classes: TimetableClass[]
}