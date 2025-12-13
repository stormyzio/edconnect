# edconnect
Wrapper for Ecoledirecte API.
- Full **typescript support**.
- **ES6** and **commonjs** supported

## Installation
> WARNING : edconnect is not available on npm right now. It's in a beta state.
```bash
# Using npm
npm install edconnect

# Using pnpm
pnpm install edconnect
```

## Get Started
```ts
import { EDClient, Notes } from "edconnect";

// Initialize the client with your ecoledirecte credentials.
const client = new EDClient("your-username", "your-password");

try {
  // Simple login.
  await client.login();

  // Fetch user notes.
  const notes: Notes = await client.notes();

  console.log(notes);
  
} catch (error) {
  console.log(error)
  
}
```

## Advanced auth
Classic ecoledirecte auth is slow (6 steps connection). Also, it will always ask a security question before connection (doubleauth). If you want a faster authentication method and not having to anwser the security question, use the `autoAuth` method.
<br>
You, the client, will have to store 4 secrets somewhere (e.g localstorage for a browser, a json file for a CLI app...) that will be used for future connections. - <i>More infos about secrets below.</i>

```ts
import { EDClient, Notes, Secrets } from "edconnect";

// Initialize the client with your ecoledirecte credentials.
const client = new EDClient("your-username", "your-password");

// Whenever ecoledirecte secrets change, store them. In this case, in a file called secrets.json.
client.onSecretsChange(async (s: Secrets) => {
  await writeFile("./secrets.json", JSON.stringify(s));
}); 

try {
  // Advanced login. Take the secrets from the file.
  await client.autoAuth(JSON.parse(await readFile("./secrets.json", "utf-8")));

  // The rest is the same...
  
} catch (error) {
  console.log(error)
  
}
```
This method allows for a **much** faster login speed and the absence of the need to respond the doubleauth question.

## Notes
```ts
const notes = await client.notes()
```

## Homeworks
```ts
// Fetch all the future homeworks from today.
const homeworks = await client.homeworksFuture()
```
```ts
// Fetch all homeworks between two dates.
const homeworks = await client.homeworksInterval({
  // yyyy-mm-dd syntax
  from: "2025-12-18",
  to: "2025-12-31"
});

// Use the `dateToSDate` method to convert a Date object into this format.
console.log(dateToSDate(new Date(Date.now())))
```
<br>

---

<br>

More features to come... 