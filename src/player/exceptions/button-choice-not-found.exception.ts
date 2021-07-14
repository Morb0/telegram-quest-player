export class ButtonChoiceNotFoundException extends Error {
  constructor(text: string) {
    super(`Button choice with text "${text}" not exist.`);
  }
}
