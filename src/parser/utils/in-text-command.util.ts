export function makeInTextCommand(idx: number): string {
  return `/_${idx}`;
}

export function isInTextCommand(value: string): boolean {
  return value.startsWith('/_');
}
