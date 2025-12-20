# edconnect

Wrapper for Ecoledirecte API.
- Full **typescript support**.
- **ESM** and **CommonJS** supported.
- **Persistent** authentication

## Installation

> [!WARNING]
> edconnect is not available on npm right now. It's in a beta state.

## Get Started
```ts
import { EDClient, Notes } from "edconnect";
import inquirer from "inquirer";

// Initialize the client with your ecoledirecte credentials.
const client = new EDClient("your-username");

try {
  // Simple login.
  const auth = await client.login("your-password");

  if (auth) {
    
    // Ask the doubleauth ecoledirecte question.
    let password = await inquirer.prompt({
      type: "password",
      name: "password",
      message: "What's your password?",
      mask: "*",
    });
  
    // Once the user answered it, pass it.
    await client.resolveDoubleauth(password.password);
  }

  // Fetch user notes.
  const notes: Notes = await client.notes();

  console.log(notes);
  
} catch (error) {
  // Every step above will produce an error. Catch it here.
  console.log(error)
  
}
```

## Advanced auth
Classic ecoledirecte auth is slow (5-steps authentication flow). Also, it will always ask a security question before connection (doubleauth). If you want a faster authentication method and not having to answer the security question, use the secrets.
<br>
You, the client, will have to store 7 secrets entries somewhere (e.g localstorage for a browser, a json file for a CLI app...) that will be used for future connections. - <i>More infos about secrets below.</i>

```ts
import { EDClient, Secrets } from "edconnect";
import { readFile, writeFile } from "fs/promises";

// Initialize the client with your ecoledirecte credentials.
const client = new EDClient("your-username");

// Whenever ecoledirecte secrets change, store them. In this case, in a file called secrets.json.
client.onSecretsChange(async (s: Secrets) => {
  await writeFile("./secrets.json", JSON.stringify(s));
}); 

try {
  // Advanced login. Take the secrets from the file. Put 'null' for the password.
  await client.login(null, JSON.parse(await readFile("./secrets.json", "utf-8")));

  // The rest is the same...
  
} catch (error) {
  console.log(error)
  
}
```
This method allows for a **much** faster login speed and the absence of the need to answer the doubleauth question. Even if the user password has expired, it will automatically be renewed.

## Notes
```ts
const notes: Notes = await client.notes();

const lastNoteEntered: Note = notes.getLastEntry(); // Last note that was added to ecoledirecte

const lastNote: Note = notes.getLast(); // Last note by the date of the exam

const firstNoteEntered: Note = notes.getLastEntry(notes.notes.length - 1); // You can use an offset. Works for .getLast() too
```

## Homeworks
```ts
// Fetch all the future homeworks from today.
const homeworks: Homeworks = await client.futureHomeworks();
```
```ts
// Fetch all homeworks between two dates.
const homeworks: Homeworks = await client.rangeHomeworks({
  // yyyy-mm-dd syntax
  from: "2025-12-18",
  to: "2025-12-31"
});

// Use the `dateToSDate` method to convert a Date object into this format.
console.log(dateToSDate(new Date(Date.now())))
```

## Messages
```ts
const messages: Messages = await client.messages();

const messages: Messages = await client.messages({
  folder: "received", // "received" (default), "sent", "draft" or "archived"
  page: 0 // Controls pagination, with page: 0 returning the first 100 messages, page: 1 the next 100, and so on
});
```

## Timetable
```ts
const timetable: Timetable = await client.timetable({
  from: "2025-12-15",
  to: "2025-12-20"
});
```

## Additional infos
When fetching for data, if tokens have expired, it will automatically renew them.
<br>
If it can't renew tokens because secrets have been obstructed, it will throw an error.

Check [examples](https://github.com/stormyzio/edconnect/examples/) if you need to.

## Secrets
The `Secrets` object contains 7 properties :
- `cn` and `cv` are for doubleauth bypass. Once they're stored, you won't have to answer the doubleauth question ever again.
- `xToken` and `2fa_Token` are for the account. Once they're stored, you don't have to put your username and password. However they expire pretty quickly.
- `uuid` and `accessToken` are for the permanent connection. They're used to renew the user token when expired. It's using the ecoledirecte mobile app method.
- `id` is a public user id, used for fetching data requests.

<br>

---

<br>

More features to come... 