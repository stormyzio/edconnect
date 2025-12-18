import "dotenv/config";
import { EDClient, Secrets } from "../dist/index.mjs";
import { readFile, writeFile } from "fs/promises";
import path from "path";

// We are using inquirer for cli controlling.
import inquirer from "inquirer";

const __dirname = import.meta.dirname;

// Init the client.
const edclient = new EDClient("[your username]", {
  debug: true,
});

// When the client secrets change, update them in the secrets.json file.
edclient.onSecretsChange(async (s: Secrets) => {
  await writeFile(path.resolve(__dirname, "./secrets.json"), JSON.stringify(s));
});

async function askPassword() {
  let password = await inquirer.prompt({
    type: "password",
    name: "password",
    message: "What's your password?",
    mask: "*",
  });

  // Login with the user password.
  const auth = await edclient.login(password.password);

  // If doubleauth is needed, ask it
  if (auth) {
    const answer = await inquirer.prompt({
      type: "input",
      name: "answer",
      message: auth.question,
    });

    // Answer the doubleauth.
    await edclient.resolveDoubleauth(answer.answer);
  }
}

// Read the secrets.json file. No try-catch here, if the file can't be read, stop the program.
const secretsFile = await readFile(path.resolve(__dirname, "./secrets.json"), "utf-8");

try {
  // Try to login without password but secrets.
  await edclient.login(null, JSON.parse(secretsFile));
} catch (error) {
  // If there are no secrets, .login() will throw an erro. Let's ask the user password first and login with the password.
  await askPassword();
}

type Choice = "lastnote" | "homeworks"

async function ask() {
  try {
    const choice = await inquirer.prompt<{ choice: Choice }>({
      type: "rawlist",
      name: "choice",
      message: "What do you want?",
      choices: [
        {
          name: "Last note",
          value: "lastnote",
        },
        {
          name: "Homeworks",
          value: "homeworks",
        },
      ],
    });

    if (choice.choice === "lastnote") {
      // Fetch last entered note.
      console.log((await edclient.notes()).getLastEntry());
    } else if (choice.choice === "homeworks") {
      // Fetch future homeworks.
      console.log((await edclient.futureHomeworks()).days);
    }
  } catch (error) {
    // If there's an error (obstructed secrets), ask the password and ask again what the user wants.
    // It shouldn't go here if the secrets aren't obstructed, because even if the token expired, it's automatically renewed.
    await askPassword();
    await ask();
  }
}

// Ask one time the user.
await ask();
