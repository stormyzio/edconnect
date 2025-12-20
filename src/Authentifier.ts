import chalk from "chalk";
import { doubleauth1 } from "./connection/doubleauth1.js";
import { doubleauth2 } from "./connection/doubleauth2.js";
import { getCookies } from "./connection/getCookies.js";
import { login } from "./connection/login.js";
import { login2 } from "./connection/login2.js";
import type { ClientOptions, Cookie, Doubleauth, DoubleauthSecrets, Secrets } from "./types.js";
import { parseCookies } from "./utils/cookies.js";
import { doubleauthParser } from "./utils/doubleauthResolver.js";
import { v4 as uuidv4 } from "uuid";
import { renewToken } from "./connection/renewToken.js";
import type { ClientDebugger } from "./ClientDebugger.js";

export class Authentifier {
  xToken: string = "";
  token2fa: string = "";
  cn: string = "";
  cv: string = "";

  username: string = "";
  password: string = "";

  uuid: string = "";
  accessToken: string = "";

  cookies: Cookie[] = [];
  cookiesString: string = "";

  id: string = "";

  debugger: ClientDebugger | null = null;

  private async fetchCookies() {
    if (this.cookies && this.cookiesString) return;

    const cookies_res = await getCookies();
    const rawCookies = cookies_res.headers.get("set-cookie")!;
    const cookies = parseCookies(rawCookies);

    const cookie1 = `${cookies[0]!.name}=${cookies[0]!.value}`;
    const cookie2 = `${cookies[1]!.name}=${cookies[1]!.value}`;
    const cookiesString = `${cookie1};${cookie2}`;

    this.cookies = cookies;
    this.cookiesString = cookiesString;
  }

  onSecretsChangeCallback: (s: Secrets) => void = () => {};

  constructor(username: string, debuggerInstance?: ClientDebugger) {
    this.username = username;

    this.debugger = debuggerInstance || null;
  }

  /**
   * Login to the account using the provided credentials or secrets.
   */
  async logg2(password: string | null, secrets?: Secrets): Promise<Doubleauth | null> {
    try {
      this.debugger?.log("success", "Connecting...");

      const username = this.username;

      if (!password) {
        if (!secrets) {
          this.debugger?.log("error", "Password or secrets must be provided for login.");
          throw new Error("Password or secrets must be provided for login.");
        }

        await this.autoAuth(secrets);

        return null;
      }

      this.password = password;

      this.uuid = uuidv4();

      await this.fetchCookies();

      this.debugger?.log("success", "Step 1");

      const login_res = await login(this.cookies, this.cookiesString, username, password, this.uuid);
      this.token2fa = login_res.headers.get("2fa-Token")!;
      this.xToken = login_res.headers.get("X-Token")!;

      this.debugger?.log("success", "Step 2");

      const doubleauth1_res = await doubleauth1(this.xToken, this.token2fa);
      const doubleauth1_data = await doubleauth1_res.json();

      this.debugger?.log("success", "Step 3");

      const doubleauth = doubleauthParser(doubleauth1_data);

      return doubleauth;
    } catch (error) {
      this.debugger?.log("error", "Failed.");
      throw new Error("Failed to connect.");
    }
  }

  async resolveDoubleauth(res: string): Promise<void> {
    const doubleauth2_res = await doubleauth2(this.xToken, this.token2fa, btoa(res));
    const doubleauth2_data = await doubleauth2_res.json();

    if (doubleauth2_data.code != 200) {
      this.debugger?.log("error", "Failed.");
      throw new Error("Failed to connect.");
    }

    const cn = doubleauth2_data.data.cn;
    const cv = doubleauth2_data.data.cv;

    this.debugger?.log("success", "Step 4");

    await this.afterDoubleauth({
      cn,
      cv,
    });
  }

  /**
   * Register a callback to be called when the secrets change (after re-authentication).
   * Allows you to save the new secrets for future use (`autoAuth`).
   * @param callback What to do when secrets change.
   */
  onSecretsChange(callback: (s: Secrets) => void) {
    this.onSecretsChangeCallback = callback;
  }

  async renewToken(): Promise<any> {
    await this.fetchCookies();

    const res = await renewToken(this.username, this.cookiesString, this.xToken, this.token2fa, this.accessToken, this.uuid);
    const data = await res.json();

    if (data.code != 200) {
      this.debugger?.log("error", "Failed to renew token.");
      throw new Error("Failed to renew token.");
    }

    this.debugger?.log("success", "Token renewed.");

    this.xToken = res.headers.get("X-Token")!;
    this.token2fa = res.headers.get("2fa-Token")!;
  }

  async afterDoubleauth(secrets: DoubleauthSecrets): Promise<void> {
    const username = this.username;
    const password = this.password;

    if (!password) {
      this.debugger?.log("error", "Password required if no tokens.");
      throw new Error("Password required if no tokens.");
    }

    this.cn = secrets.cn;
    this.cv = secrets.cv;

    await this.fetchCookies();

    const next = (data: any) => {
      this.debugger?.log("success", "Step 5");
      this.accessToken = data.data.accounts[0].accessToken;
      this.id = data.data.accounts[0].id.toString();

      return this.skipAuth(this.getSecret());
    };

    if (!password) {
      let res = await this.renewToken();
      let data = await res.json();
      next(data);
    } else {
      const login2_res = await login2(this.cookies, this.cookiesString, this.cn, this.cv, username, password, this.uuid);

      this.xToken = login2_res.headers.get("X-Token")!;
      this.token2fa = login2_res.headers.get("2fa-Token")!;

      let data = await login2_res.json();

      if (data.code != 200) {
        this.debugger?.log("error", "Failed.");
        throw new Error("Failed to connect.");
      } else {
        next(data);
        return this.skipAuth(this.getSecret());
      }
    }
  }

  private skipAuth(secrets: Secrets): void {
    this.cn = secrets.cn || "";
    this.cv = secrets.cv || "";

    this.xToken = secrets.xToken || "";
    this.token2fa = secrets.token2fa || "";

    this.uuid = secrets.uuid || "";
    this.accessToken = secrets.accessToken || "";

    this.id = secrets.id || "";

    this.onSecretsChangeCallback(this.getSecret());
  }

  private async autoAuth(secrets: Secrets): Promise<any> {
    if (secrets.cn && secrets.cv && secrets.xToken && secrets.token2fa && secrets.uuid && secrets.accessToken) {
      this.skipAuth(secrets);
    } else if (secrets.cn && secrets.cv) {
      await this.afterDoubleauth({
        cn: secrets.cn,
        cv: secrets.cv,
      });
    } else {
      this.debugger?.log("error", "Not enough secrets provided.");
      throw new Error("Not enough secrets provided.");
    }
  }

  getSecret(): Secrets {
    return {
      cn: this.cn,
      cv: this.cv,
      xToken: this.xToken,
      token2fa: this.token2fa,
      uuid: this.uuid,
      accessToken: this.accessToken,
      id: this.id,
    };
  }
}
