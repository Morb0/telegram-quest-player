export class ActionNotFoundException extends Error {
  constructor() {
    super('Action not found');
  }
}
