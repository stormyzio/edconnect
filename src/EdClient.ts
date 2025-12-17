import chalk from "chalk";
import { Authentifier } from "./Authentifier.js";
import { fetchHomeworks } from "./modules/homeworks/homeworks.js";
import { fetchNotes } from "./modules/notes/notes.js";
import type { ClientOptions, Doubleauth, Homeworks, HomeworksOptionsFuture, HomeworksOptionsInterval, HomeworksOptionsStrict, Notes, NotesOptions, Secrets } from "./types.js";
import { ClientDebugger } from "./ClientDebugger.js";

export class EDClient {
  private authentifier: Authentifier | null;

  private debugger: ClientDebugger | null = null;

  async login(password: string | null, secrets?: Secrets): Promise<Doubleauth | null> {
    return await this.authentifier!.login(password, secrets);
  }

  async resolveDoubleauth(answer: string) {
    return await this.authentifier!.resolveDoubleauth(answer);
  }

  async onSecretsChange(callback: (s: Secrets) => void) {
    this.authentifier!.onSecretsChange(callback);
  }

  constructor(username: string, options?: ClientOptions) {
    this.debugger = new ClientDebugger(options?.debug || false);
    this.authentifier = new Authentifier(username, this.debugger);
  }

  private async fetchWrapper<T, O>(f: (auth: Authentifier, options: O) => Promise<T>, options: O, iteration: number): Promise<T> {
    try {
      const data = await f(this.authentifier!, options);
      this.authentifier!.onSecretsChangeCallback(this.authentifier!.getSecret());
      return data;
    } catch (error) {
      if (iteration == 1) {
        this.authentifier!.onSecretsChangeCallback({});
        throw new Error("Failed to renew token after re-authentication.");
      }

      this.debugger?.log("retry", "Re-authenticating...");

      await this.authentifier!.renewToken();
      const res = await this.fetchWrapper(f, options, iteration + 1);
      return res;
    }
  }

  async notes(): Promise<Notes> {
    const res = await this.fetchWrapper<Notes, NotesOptions>(fetchNotes, {}, 0);
    return res;
  }

  async homeworksInterval(options: HomeworksOptionsInterval): Promise<Homeworks> {
    const res = await this.fetchWrapper<Homeworks, HomeworksOptionsStrict>(fetchHomeworks, { ...options, type: "interval" }, 0);
    return res;
  }
  async homeworksFuture(options?: HomeworksOptionsFuture): Promise<Homeworks> {
    const res = await this.fetchWrapper<Homeworks, HomeworksOptionsStrict>(fetchHomeworks, { ...options, type: "future" }, 0);
    return res;
  }
}
