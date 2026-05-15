import { Fragment } from 'react';

// Renders a parser node array [{ t: 'text'|'strong'|'em', v: string }]
// or a plain string. Only emits text/strong/em — no unsafe HTML.
export function RichText({ nodes }) {
  if (typeof nodes === 'string') return nodes;
  if (!Array.isArray(nodes) || nodes.length === 0) return null;
  return nodes.map((n, i) => {
    if (n.t === 'strong') return <strong key={i}>{n.v}</strong>;
    if (n.t === 'em') return <em key={i}>{n.v}</em>;
    return <Fragment key={i}>{n.v}</Fragment>;
  });
}

// Convert a node array (or string) to a plain string.
export function nodesToText(nodes) {
  if (typeof nodes === 'string') return nodes;
  if (!Array.isArray(nodes)) return String(nodes);
  return nodes.map((n) => n.v).join('');
}

// Convert a node array (or string) to a safe HTML string.
function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
export function nodesToHtml(nodes) {
  if (typeof nodes === 'string') return esc(nodes);
  if (!Array.isArray(nodes)) return esc(String(nodes));
  return nodes.map((n) => {
    if (n.t === 'strong') return `<strong>${esc(n.v)}</strong>`;
    if (n.t === 'em') return `<em>${esc(n.v)}</em>`;
    return esc(n.v);
  }).join('');
}
