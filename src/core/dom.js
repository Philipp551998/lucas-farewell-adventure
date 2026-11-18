/*
 * Winziger DOM-Helfer, damit wir ohne Framework lesbaren Code schreiben können.
 *
 *   h('button', { class: 'btn', onclick: fn }, 'Text')
 *   svg('path', { d: '...' })
 *
 * Texte werden immer als Text-Knoten eingefügt (nie als HTML) – damit werden die
 * Nachrichten garantiert unverändert dargestellt.
 */
const SVG_NS = 'http://www.w3.org/2000/svg';

function applyAttrs(node, attrs) {
  if (!attrs) return;
  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined || value === false) continue;

    if (key === 'style' && typeof value === 'object') {
      for (const [prop, val] of Object.entries(value)) {
        if (prop.startsWith('--')) node.style.setProperty(prop, val);
        else node.style[prop] = val;
      }
    } else if (key === 'dataset') {
      Object.assign(node.dataset, value);
    } else if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else {
      node.setAttribute(key, value === true ? '' : String(value));
    }
  }
}

function appendChildren(node, children) {
  for (const child of children.flat(Infinity)) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
}

function createFactory(namespace) {
  return (tag, attrs, ...children) => {
    const node = namespace
      ? document.createElementNS(namespace, tag)
      : document.createElement(tag);
    applyAttrs(node, attrs);
    appendChildren(node, children);
    return node;
  };
}

export const h = createFactory(null);
export const svg = createFactory(SVG_NS);
