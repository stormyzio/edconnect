import { bdecode } from "./base64.js";

export function doubleauthParser(doubleauth: any) {
  let q: string = doubleauth.data.question;
  let props: string[] = doubleauth.data.propositions;

  return {
    question: bdecode(q),
    propositions: props.map((p: string) => bdecode(p)),
  };
}
