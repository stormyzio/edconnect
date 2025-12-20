import type { Authentifier } from "./Authentifier.js";
import { ED_VERSION } from "./constants.js";
import { NotesMod } from "./modules/notes/NotesMod.js";
import type { NoteRoot } from "./modules/notes/NoteRoot.js";
import type { Mod } from "./modules/types.js";
import type { Notes, NotesOptions, NotesParams } from "./types.js";
import { setDefaultHeaders } from "./utils/headersAppending.js";

export class Fetcher {
  authentifier: Authentifier;

  API: string = "https://api.ecoledirecte.com/v3";

  constructor(authentifier: Authentifier) {
    this.authentifier = authentifier;
  }

  /**
   * 
   * @param body Some params that have to be put in the body
   * @param path path in url, containing query params
   * @param content what have been fetched? to say "failed to fetch ..."
   * @param apiSuffix different for each request, nobody know why...
   * @returns directly the json data
   */
  async request<R>(body: object, path: string, content: string, apiSuffix: "Eleves" | "eleves" | "E" = "Eleves"): Promise<R> {
    let myHeaders = new Headers();
    myHeaders = setDefaultHeaders(myHeaders);
    myHeaders.append("2fa-token", this.authentifier.token2fa);
    myHeaders.append("x-token", this.authentifier.xToken);

    const urlencoded = new URLSearchParams();
    urlencoded.append(
      "data",
      JSON.stringify({
        ...body,
      })
    );

    const requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: urlencoded,
      redirect: "follow",
    };

    let res = await fetch(`${this.API}/${apiSuffix}/${this.authentifier.id}/${path}${path.includes("?") ? "&" : "?"}verbe=get&v=${ED_VERSION}`, requestOptions);
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
        throw error;
      }

      this.authentifier.debugger?.log("retry", "Re-authenticating...");

      await this.authentifier!.renewToken();
      const res = await this.requestWrapper<T, O>(f, options, iteration + 1);
      return res;
    }
  }
}
