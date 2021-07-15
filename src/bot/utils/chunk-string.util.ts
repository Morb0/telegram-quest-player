export function chunkString(str: string, chunkSize: number): string[] {
  const chunks = [];
  while (str) {
    if (str.length < chunkSize) {
      chunks.push(str);
      break;
    } else {
      chunks.push(str.substr(0, chunkSize));
      str = str.substr(chunkSize);
    }
  }
  return chunks;
}
