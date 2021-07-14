export class CommandChoiceNotFoundException extends Error {
  constructor(command: string) {
    super(`Command "${command}" choice not exist.`);
  }
}
