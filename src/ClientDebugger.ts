import chalk from "chalk";

export class ClientDebugger {
  private enabled: boolean;

  constructor(enabled: boolean = false) {
    this.enabled = enabled;
  }

  log(type: "retry" | "success" | "error", message: any) {
    if (this.enabled) {
      let picto;
      switch (type) {
        case "retry":
          picto = chalk.yellow("↻");
          break;
        case "success":
          picto = chalk.green("✔︎");
          break;
        case "error":
          picto = chalk.red("✘");
          break;
        default:
          picto = "";
      }
      console.log(`${picto}`, message);
    }
  }
}