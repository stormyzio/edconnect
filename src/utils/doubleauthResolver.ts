const PAIRS: {
  [q: string]: string;
} = {
  "UXVlbGxlIGVzdCB2b3RyZSBjbGFzc2UgPw==": "MiAxMQ==",
  "UXVlbCBlc3Qgdm90cmUgbW9pcyBkZSBuYWlzc2FuY2UgPw==": "bWFycw==",
  "UXVlbGxlIGVzdCB2b3RyZSBhbm7DqWUgZGUgbmFpc3NhbmNlID8=": "MjAxMA==",
  "UXVlbCBlc3QgbGUgbm9tIGRlIGZhbWlsbGUgZGUgdm90cmUgcHJvZmVzc2V1ciBwcmluY2lwYWwgPw==": "REVHT1NTRSBMLg==",
  "UXVlbCBlc3Qgdm90cmUgam91ciBkZSBuYWlzc2FuY2UgPw==": "MjY=",
};

export function doubleauthresolver(doubleauth: any) {
  let q: string = doubleauth.data.question;
  let props: string[] = doubleauth.data.propositions;

  if (PAIRS[q]) {
    // console.log("Automatically resolved doubleauth!");
    // console.log("Question was " + atob(q));
    // console.log("Response was " + atob(PAIRS[q]));
    return PAIRS[q];
  } else {
    console.log(atob(q));
    console.log(props.map((p) => atob(p)));
    console.log("--");
    console.log(q, props);
    return null;
  }
}
