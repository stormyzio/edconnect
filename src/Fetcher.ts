import type { Authentifier } from "./Authentifier.js";
import { ED_VERSION } from "./constants.js";
import { NotesMod } from "./modules/notes/NotesMod.js";
import type { NoteRoot } from "./modules/notes/NoteRoot.js";
import type { Mod } from "./modules/types.js";
import type { Notes, NotesOptions, NotesParams } from "./types.js";
import { setDefaultHeaders } from "./utils/headersAppending.js";

export class Fetcher {
  authentifier: Authentifier;

  API: string = "https://api.ecoledirecte.com/v3/Eleves";

  constructor(authentifier: Authentifier) {
    this.authentifier = authentifier;
  }

  async request<R>(body: object, path: string, content: string): Promise<R> {
    let myHeaders = new Headers();
    myHeaders = setDefaultHeaders(myHeaders);
    myHeaders.append("2fa-token", this.authentifier.token2fa);
    myHeaders.append("x-token", this.authentifier.xToken);

    const urlencoded = new URLSearchParams();
    urlencoded.append(
      "data",
      JSON.stringify({
        anneeScolaire: "2025-2026",
        ...body,
      })
    );

    const requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded,
      redirect: "follow",
    };

    let res = await fetch(`${this.API}/${this.authentifier.id}/${path}?verbe=get&v=${ED_VERSION}`, requestOptions);
    let data = await res.json();

    if (data.code == 200) {
      return data.data;
    } else {
      throw new Error(`Failed to fetch ${content}.`);
    }
  }

  async requestWrapper<T, O>(f: (fetcher: Fetcher, options: O) => Promise<T>, options: O, iteration: number = 0): Promise<T> {
    try {
      const data = await f(this, options);
      this.authentifier!.onSecretsChangeCallback(this.authentifier!.getSecret());
      return data;
    } catch (error) {
      if (iteration == 1) {
        // this.authentifier!.onSecretsChangeCallback({});
        throw new Error("Failed to renew token after re-authentication.");
      }

      this.authentifier.debugger?.log("retry", "Re-authenticating...");

      await this.authentifier!.renewToken();
      const res = await this.requestWrapper<T, O>(f, options, iteration + 1);
      return res;
    }
  }
}
