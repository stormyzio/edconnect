import chalk from "chalk";
import { Authentifier } from "./Authentifier.js";
import type { ClientOptions, Doubleauth, FutureHomeworksOptions, Homeworks, Message, MessageContentOptions, MessagesList, MessagesListOptions, Notes, NotesOptions, RangeHomeworksOptions, Secrets, Timetable, TimetableOptions } from "./types.js";
import { ClientDebugger } from "./ClientDebugger.js";
import { Fetcher } from "./Fetcher.js";
import { NotesMod } from "./modules/notes/NotesMod.js";
import { HomeworksMod } from "./modules/homeworks/HomeworksMod.js";
import { MessagesMod } from "./modules/messages/MessagesMod.js";
import { TimetableMod } from "./modules/timetable/TimetableMod.js";

export class EDClient {
  private authentifier: Authentifier;
  private fetcher: Fetcher;
  private debugger: ClientDebugger | null = null;

  constructor(username: string, options?: ClientOptions) {
    this.debugger = new ClientDebugger(options?.debug || false);
    this.authentifier = new Authentifier(username, this.debugger);
    this.fetcher = new Fetcher(this.authentifier);
  }

  async login(password: string | null, secrets?: Secrets): Promise<Doubleauth | null> {
    return await this.authentifier!.logg2(password, secrets);
  }

  async resolveDoubleauth(answer: string) {
    return await this.authentifier!.resolveDoubleauth(answer);
  }

  async onSecretsChange(callback: (s: Secrets) => void) {
    this.authentifier!.onSecretsChange(callback);
  }

  async notes(): Promise<Notes> {
    return await this.fetcher.requestWrapper<Notes, NotesOptions>(NotesMod.getNotes, {});
  }

  async futureHomeworks(): Promise<Homeworks> {
    return await this.fetcher.requestWrapper<Homeworks, FutureHomeworksOptions>(HomeworksMod.getFutureHomeworks, {});
  }

  async rangeHomeworks(options: RangeHomeworksOptions): Promise<Homeworks> {
    return await this.fetcher.requestWrapper<Homeworks, RangeHomeworksOptions>(HomeworksMod.getRangeHomeworks, options);
  }

  async messagesList(options?: MessagesListOptions): Promise<MessagesList> {
    return await this.fetcher.requestWrapper<MessagesList, MessagesListOptions | undefined>(MessagesMod.getMessagesList, options)
  }

  async messageContent(options: MessageContentOptions): Promise<Message> {
    return await this.fetcher.requestWrapper<Message, MessageContentOptions>(MessagesMod.getMessageContent, options);
  }

  async timetable(options: TimetableOptions): Promise<Timetable> {
    return await this.fetcher.requestWrapper<Timetable, TimetableOptions>(TimetableMod.getTimetable, options)
  }
}
