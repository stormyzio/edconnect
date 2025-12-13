import chalk from "chalk";
import { doubleauth1 } from "./connection/doubleauth1.js";
import { doubleauth2 } from "./connection/doubleauth2.js";
import { login1 } from "./connection/login1.js";
import { login2 } from "./connection/login2.js";
import { login3 } from "./connection/login3.js";
import { prelogin3 } from "./connection/prelogin3.js";
import { cleanNotes, fetchNotes } from "./modules/notes/notes.js";
import type { FinalConnectionSecret, Secrets, Notes, NotesOptions, SDate, HomeworksOptionsStrict, DayHomeworks, HomeworksOptionsIntervalStrict, HomeworksOptionsInterval, HomeworksOptionsFuture, Homeworks, ClientOptions } from "./types.js";
import { parseCookies } from "./utils/cookies.js";
import { doubleauthresolver } from "./utils/doubleauthResolver.js";
import type { HomeworksRoot } from "./modules/homeworks/HomeworksRoot.js";
import { fetchHomeworks } from "./modules/homeworks/homeworks.js";

export class EDClient {
  xToken: string = "";
  token2fa: string = "";
  cn: string = "";
  cv: string = "";

  username: string = "";
  password: string = "";

  authLogs: boolean = false;

  onSecretsChangeCallback: (s: Secrets) => void = () => {};

  constructor(username: string, password: string, options?: ClientOptions) {
    this.username = username;
    this.password = password;

    this.authLogs = options?.authLogs || this.authLogs;
  }

  /**
   * Login to the account using the provided credentials.
   * **Slow method** - will ask for the doubleauth question.
   * Consider using `autoAuth` instead.
   */
  async login(): Promise<void> {
    try {
      if (this.authLogs) console.log(chalk.green("✔︎"), "Connecting...");

      const username = this.username;
      const password = this.password;

      const login1_res = await login1();
      const rawCookies = login1_res.headers.get("set-cookie")!;
      const cookies = parseCookies(rawCookies);

      const cookie1 = `${cookies[0]!.name}=${cookies[0]!.value}`;
      const cookie2 = `${cookies[1]!.name}=${cookies[1]!.value}`;
      const cookiesString = `${cookie1};${cookie2}`;

      if (this.authLogs) console.log(chalk.green("✔︎"), "Step 1");

      const login2_res = await login2(cookies, cookiesString, username, password);
      this.token2fa = login2_res.headers.get("2fa-Token")!;
      this.xToken = login2_res.headers.get("X-Token")!;

      if (this.authLogs) console.log(chalk.green("✔︎"), "Step 2");

      const doubleauth1_res = await doubleauth1(this.xToken, this.token2fa);
      const doubleauth1_data = await doubleauth1_res.json();

      if (this.authLogs) console.log(chalk.green("✔︎"), "Step 3");

      const doubleauthResponse = doubleauthresolver(doubleauth1_data)!;

      const doubleauth2_res = await doubleauth2(this.xToken, this.token2fa, doubleauthResponse);
      const doubleauth2_data = await doubleauth2_res.json();

      const cn = doubleauth2_data.data.cn;
      const cv = doubleauth2_data.data.cv;

      if (this.authLogs) console.log(chalk.green("✔︎"), "Step 4");

      await this.skipDoubleAuth({
        cn,
        cv,
      });
    } catch (error) {
      if (this.authLogs) console.log(chalk.red("✖︎"), "Failed");

      throw new Error("Failed to connect.");
    }
  }

  /**
   * Register a callback to be called when the secrets change (after re-authentication).
   * Allows you to save the new secrets for future use (`autoAuth`).
   * @param callback What to do when secrets change.
   */
  onSecretsChange(callback: (s: Secrets) => void) {
    this.onSecretsChangeCallback = callback;
  }

  private async skipDoubleAuth(secret: FinalConnectionSecret): Promise<void> {
    const username = this.username;
    const password = this.password;

    this.cn = secret.cn;
    this.cv = secret.cv;

    const prelogin3_res = await prelogin3(this.xToken, this.token2fa);
    const prelogin3_rawCookies = prelogin3_res.headers.get("set-cookie")!;
    const prelogin3_cookies = parseCookies(prelogin3_rawCookies);
    const prelogin3_cookiesString = `${prelogin3_cookies[0]!.name}=${prelogin3_cookies[0]!.value};${prelogin3_cookies[1]!.name}=${prelogin3_cookies[1]!.value}`;

    if (this.authLogs) console.log(chalk.green("✔︎"), "Step 5");

    const login3_res = await login3(prelogin3_cookies, prelogin3_cookiesString, this.cn, this.cv, username, password);

    this.xToken = login3_res.headers.get("X-Token")!;
    this.token2fa = login3_res.headers.get("2fa-Token")!;

    let data = await login3_res.json();
    if (data.code == 250) {
      // Expired token
      await this.login();
    } else if (data.code == 505) {
      // Invalid credentials
      if (this.authLogs) console.log(chalk.red("✖︎"), "Failed");
      throw new Error("Failed to connect.");
    } else {
      if (this.authLogs) console.log(chalk.green("✔︎"), "Step 6");
      return this.skipAuth({ ...secret, xToken: this.xToken, token2fa: this.token2fa });
    }
  }

  private skipAuth(secret: Secrets): void {
    this.cn = secret.cn;
    this.cv = secret.cv;

    this.xToken = secret.xToken;
    this.token2fa = secret.token2fa;

    this.onSecretsChangeCallback(this.getSecret());
  }

  /**
   * Login using saved secrets.
   * Allow for automatic re-authentication and faster login.
   * Use `onSecretsChange` to get updated secrets after re-authentication.
   * @param secret Secrets object containing cn, cv, xToken and token2fa.
   */
  async autoAuth(secret: Secrets): Promise<void> {
    if (secret.cn && secret.cv && secret.xToken && secret.token2fa) {
      this.skipAuth({
        cn: secret.cn,
        cv: secret.cv,
        xToken: secret.xToken,
        token2fa: secret.token2fa,
      });
    } else if (secret.cn && secret.cv) {
      await this.skipDoubleAuth({
        cn: secret.cn,
        cv: secret.cv,
      });
    } else {
      await this.login();
    }
  }

  private getSecret(): Secrets {
    return {
      cn: this.cn,
      cv: this.cv,
      xToken: this.xToken,
      token2fa: this.token2fa,
    };
  }

  private async fetchWrapper<T, O>(f: (xToken: string, token2fa: string, options: O) => Promise<T>, options: O, iteration: number): Promise<T> {
    try {
      const data = await f(this.xToken, this.token2fa, options);

      this.onSecretsChangeCallback(this.getSecret());
      return data;
    } catch (error) {
      if (this.authLogs) console.log(chalk.yellow("↻"), "Re-authenticating...");

      if (iteration == 1) {
        throw error;
      }

      await this.skipDoubleAuth({
        cn: this.cn,
        cv: this.cv,
      });
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
