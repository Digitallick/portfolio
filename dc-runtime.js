/* Tiny runtime for shanymo.com pages.
   Renders the page template (holes {{x}}, <template sc-for>, <template sc-if>)
   from a Component's renderVals(), patches the DOM in place, and delegates events. */
(function () {
  'use strict';

  class DCLogic {
    constructor(props) { this.props = props || {}; this.state = {}; }
    setState(patch) {
      const next = typeof patch === 'function' ? patch(this.state, this.props) : patch;
      Object.assign(this.state, next || {});
      if (this.__schedule) this.__schedule();
    }
  }
  window.DCLogic = DCLogic;

  const HOLE = /^\{\{\s*([^}]+?)\s*\}\}$/;
  const HOLES = /\{\{\s*([^}]+?)\s*\}\}/g;
  const BOOL_ATTRS = { disabled: 1, checked: 1, hidden: 1, selected: 1, readonly: 1, required: 1, autoplay: 1, muted: 1, loop: 1, playsinline: 1 };
  const NON_BUBBLING = { mouseenter: 1, mouseleave: 1, pointerenter: 1, pointerleave: 1, focus: 1, blur: 1, load: 1, error: 1 };

  function lookup(path, scope) {
    path = path.trim();
    if (path === 'true') return true;
    if (path === 'false') return false;
    let v = scope;
    for (const p of path.split('.')) { if (v == null) return undefined; v = v[p]; }
    return v;
  }
  function fill(str, scope) {
    return str.replace(HOLES, (_, p) => { const v = lookup(p, scope); return v == null || v === false ? '' : String(v); });
  }

  // ---------- build a virtual tree from the template ----------
  function build(node, scope, ctx, out) {
    if (node.nodeType === 3) { out.push({ t: fill(node.nodeValue, scope) }); return; }
    if (node.nodeType !== 1) return;
    const tag = node.localName;
    if (tag === 'template' && node.hasAttribute('sc-for')) {
      const m = HOLE.exec(node.getAttribute('list') || '');
      const list = m ? lookup(m[1], scope) : null;
      const as = node.getAttribute('as') || 'item';
      if (Array.isArray(list)) list.forEach((item) => {
        const sc = Object.create(scope); sc[as] = item;
        node.content.childNodes.forEach((c) => build(c, sc, ctx, out));
      });
      return;
    }
    if (tag === 'template' && node.hasAttribute('sc-if')) {
      const m = HOLE.exec(node.getAttribute('value') || '');
      const v = m ? lookup(m[1], scope) : false;
      if (v) node.content.childNodes.forEach((c) => build(c, scope, ctx, out));
      return;
    }
    const v = { tag, ns: node.namespaceURI, a: {}, c: [], ref: null };
    for (const at of node.attributes) {
      const name = at.name, val = at.value;
      if (name.indexOf('hint-') === 0) continue;
      const m = HOLE.exec(val);
      if (name.length > 2 && name.indexOf('on') === 0 && m) {
        const fn = lookup(m[1], scope);
        if (typeof fn === 'function') { const id = ctx.handlers.push(fn) - 1; v.a['data-dc-on-' + name.slice(2).toLowerCase()] = String(id); }
        continue;
      }
      if (name === 'ref' && m) { const fn = lookup(m[1], scope); if (typeof fn === 'function') v.ref = fn; continue; }
      if (m) {
        const x = lookup(m[1], scope);
        if (BOOL_ATTRS[name]) { if (x && x !== 'false') v.a[name] = ''; continue; }
        if (x == null || x === false) { if (name.indexOf('aria-') === 0 && x === false) v.a[name] = 'false'; continue; }
        v.a[name] = String(x);
        continue;
      }
      v.a[name] = val.indexOf('{{') >= 0 ? fill(val, scope) : val;
    }
    if (tag === 'template') { node.content.childNodes.forEach((c) => build(c, scope, ctx, v.c)); }
    else node.childNodes.forEach((c) => build(c, scope, ctx, v.c));
    out.push(v);
  }

  // ---------- patch the real DOM ----------
  function create(v, refs) {
    if (v.t !== undefined) { const t = document.createTextNode(v.t); t.__dc = { t: v.t }; return t; }
    const el = v.ns && v.ns !== 'http://www.w3.org/1999/xhtml' ? document.createElementNS(v.ns, v.tag) : document.createElement(v.tag);
    el.__dc = { a: {} };
    setAttrs(el, v.a);
    v.c.forEach((c) => el.appendChild(create(c, refs)));
    if (v.ref) refs.push([el, v.ref]);
    return el;
  }
  function setAttrs(el, a) {
    const prev = el.__dc.a;
    for (const k in a) {
      if (prev[k] === a[k]) continue;
      if (k === 'value' && ('value' in el)) { if (el.value !== a[k]) el.value = a[k]; el.setAttribute('value', a[k]); }
      else el.setAttribute(k, a[k]);
      if (k === 'muted') el.muted = true;
    }
    for (const k in prev) if (!(k in a)) el.removeAttribute(k);
    el.__dc.a = a;
  }
  function same(n, v) {
    if (!n.__dc) return false;
    if (v.t !== undefined) return n.nodeType === 3;
    return n.nodeType === 1 && n.localName === v.tag;
  }
  function patch(parent, vlist, refs) {
    const managed = Array.from(parent.childNodes).filter((n) => n.__dc);
    let i = 0;
    for (; i < vlist.length; i++) {
      const v = vlist[i], n = managed[i];
      if (n && same(n, v)) {
        if (v.t !== undefined) { if (n.__dc.t !== v.t) { n.nodeValue = v.t; n.__dc.t = v.t; } }
        else { setAttrs(n, v.a); patch(n, v.c, refs); if (v.ref) refs.push([n, v.ref]); }
      } else {
        const fresh = create(v, refs);
        if (n) parent.replaceChild(fresh, n); else parent.appendChild(fresh);
        managed[i] = fresh;
      }
    }
    for (; i < managed.length; i++) managed[i].remove();
  }

  // ---------- events ----------
  let current = null;
  function wrap(e, el, flag) {
    return new Proxy(e, {
      get(t, p) {
        if (p === 'currentTarget') return el;
        if (p === 'stopPropagation') return () => { flag.stop = true; t.stopPropagation(); };
        const v = t[p];
        return typeof v === 'function' ? v.bind(t) : v;
      }
    });
  }
  function listen(type) {
    document.addEventListener(type, (e) => {
      if (!current) return;
      const attr = 'data-dc-on-' + type, flag = { stop: false };
      if (NON_BUBBLING[type]) {
        const el = e.target;
        if (el && el.getAttribute && el.hasAttribute(attr)) { const fn = current.handlers[+el.getAttribute(attr)]; if (fn) fn(wrap(e, el, flag)); }
        return;
      }
      let el = e.target && e.target.nodeType === 3 ? e.target.parentElement : e.target;
      while (el && el !== document && !flag.stop) {
        if (el.getAttribute && el.hasAttribute(attr)) { const fn = current.handlers[+el.getAttribute(attr)]; if (fn) fn(wrap(e, el, flag)); }
        el = el.parentElement;
      }
    }, true);
  }
  ['click', 'input', 'change', 'keydown', 'keyup', 'submit', 'mousemove', 'mousedown', 'mouseup', 'pointerdown', 'pointermove', 'pointerup',
    'mouseenter', 'mouseleave', 'pointerenter', 'pointerleave', 'focus', 'blur', 'load', 'error'].forEach(listen);

  // ---------- mount ----------
  window.DC = {
    mount(Component, propsSpec) {
      const tpl = document.getElementById('dc-tpl');
      const root = document.getElementById('dc-root');
      const props = {};
      for (const k in propsSpec || {}) if (k.charAt(0) !== '$' && propsSpec[k] && 'default' in propsSpec[k]) props[k] = propsSpec[k].default;
      const c = new Component(props);
      let queued = false, mounted = false;
      const render = () => {
        queued = false;
        const ctx = { handlers: [] }, out = [], refs = [];
        const vals = c.renderVals();
        tpl.content.childNodes.forEach((n) => build(n, vals, ctx, out));
        current = ctx;
        patch(root, out, refs);
        refs.forEach(([el, fn]) => { try { fn(el); } catch (err) { console.error(err); } });
        if (!mounted) { mounted = true; if (c.componentDidMount) setTimeout(() => c.componentDidMount(), 0); }
      };
      c.__schedule = () => { if (!queued) { queued = true; Promise.resolve().then(render); } };
      render();
      window.__dc = c;
    }
  };
})();
