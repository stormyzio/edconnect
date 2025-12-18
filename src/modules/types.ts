export abstract class Mod<T, R, O, P> {
  abstract params: string;
  abstract content: string;
  abstract fromOptions(options: O): P;

}
