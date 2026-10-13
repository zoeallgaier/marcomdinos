/* —— Letter-by-letter headings ——
   Wraps each character of a .split element in an indexed span so CSS can
   stagger it in. Spans stay inline, so the text shapes as one run and
   kerning survives. */

function splitLetters(root = document) {
  for (const el of root.querySelectorAll('.split:not([data-split])')) {
    el.dataset.split = '';
    el.setAttribute('aria-label', el.textContent.trim());

    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    let i = 0;
    for (const node of nodes) {
      const frag = document.createDocumentFragment();
      for (const ch of node.textContent) {
        if (/\s/.test(ch)) {
          frag.append(ch);
          continue;
        }
        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = ch;
        span.setAttribute('aria-hidden', 'true');
        span.style.setProperty('--i', i++);
        frag.append(span);
      }
      node.replaceWith(frag);
    }
  }
}
