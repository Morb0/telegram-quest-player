const ELEMENT_NODE = 1;
const TEXT_NODE = 3;
const DOCUMENT_NODE = 9;

export function replaceTextInElement(
  elem: Element | ChildNode,
  pattern: RegExp,
  value: string,
): void {
  for (const node of elem.childNodes) {
    switch (node.nodeType) {
      case ELEMENT_NODE:
        replaceTextInElement(node, pattern, value);
        break;
      case TEXT_NODE:
        node.textContent = node.textContent.replace(pattern, value);
        break;
      case DOCUMENT_NODE:
        replaceTextInElement(node, pattern, value);
    }
  }
}
