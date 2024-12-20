export function normalizeSlash(tag: { name: string }) {
  return tag.name.replaceAll("/", "|");
}
export function deNormalizeSlash(tagName: string) {
  return tagName.replaceAll("|", "/");
}
