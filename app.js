/* Bliss Narrower — English → Blissymbols with plain-language disambiguation.
   No build step, no dependencies. Data: data/bliss.json (built by tools/build.py). */
(() => {
'use strict';

// ---------- constants ----------
const IND = { now: 8993, past: 9004, future: 8999, cond: 8995, cmd: 24670, plural: 9011, thingPlural: 9010, thing: 9009 };
const KIND = {
  RED:    { k: 'action',   label: 'A doing word',            ex: w => `to ${w} — something you do` },
  YELLOW: { k: 'thing',    label: 'A thing or idea',         ex: w => `a ${w} / the ${w}` },
  BLUE:   { k: 'person',   label: 'A person or people',      ex: w => `a ${w} — someone` },
  GREEN:  { k: 'describe', label: 'A describing word',       ex: w => `very ${w} — says what something is like` },
  WHITE:  { k: 'small',    label: 'A small linking word',    ex: w => `"${w}" joins or points (like in, to, this)` },
  GRAY:   { k: 'small',    label: 'A greeting or expression', ex: w => `"${w}" said on its own` },
};
const KIND_NAME = { RED: 'action', YELLOW: 'thing', BLUE: 'person', GREEN: 'describing word', WHITE: 'small word', GRAY: 'expression / indicator' };

// pronoun symbol table: [form][person][number] -> id or {n,f,m}
const PRON = {
  subj: {
    1: { one: { n: 14916, f: 14917, m: 14918 }, many: { n: 18212, f: 18210, m: 18211 } },
    2: { one: { n: 18465, f: 18299, m: 18301 }, many: { n: 18302, f: 18298, m: 18300 } },
    3: { one: { n: 14688, f: 16949, m: 14687 }, many: { n: 17713, f: 17714, m: 17715 } },
    t: { one: 14960, many: 17712 },
  },
  poss: {
    1: { one: { n: 15686, f: 15687, m: 15688 }, many: { n: 15941, f: 15939, m: 15940 } },
    2: { one: { n: 18473, f: 18469, m: 18471 }, many: { n: 18472, f: 18468, m: 18470 } },
    3: { one: { n: 14716, f: 14707, m: 14715 }, many: { n: 17701, f: 17703, m: 17704 } },
    t: { one: 14962, many: 17702 },
  },
};
// word -> pronoun facts (p = person 1/2/3, t = things)
const PRON_WORDS = {
  i: { p: 1, num: 'one' }, me: { p: 1, num: 'one' }, myself: { p: 1, num: 'one' },
  we: { p: 1, num: 'many' }, us: { p: 1, num: 'many' }, ourselves: { p: 1, num: 'many' },
  my: { p: 1, poss: 1, num: 'one' }, mine: { p: 1, poss: 1, num: 'one' },
  our: { p: 1, poss: 1, num: 'many' }, ours: { p: 1, poss: 1, num: 'many' },
  you: { p: 2 }, yourself: { p: 2, num: 'one' }, yourselves: { p: 2, num: 'many' },
  your: { p: 2, poss: 1 }, yours: { p: 2, poss: 1 },
  he: { p: 3, num: 'one', g: 'm', pt: 'people' }, him: { p: 3, num: 'one', g: 'm', pt: 'people' }, himself: { p: 3, num: 'one', g: 'm', pt: 'people' },
  she: { p: 3, num: 'one', g: 'f', pt: 'people' }, herself: { p: 3, num: 'one', g: 'f', pt: 'people' },
  her: { p: 3, num: 'one', g: 'f', pt: 'people' }, // possessive decided by context
  his: { p: 3, poss: 1, num: 'one', g: 'm', pt: 'people' }, hers: { p: 3, poss: 1, num: 'one', g: 'f', pt: 'people' },
  it: { p: 3, num: 'one', pt: 'things' }, itself: { p: 3, num: 'one', pt: 'things' }, its: { p: 3, poss: 1, num: 'one', pt: 'things' },
  they: { p: 3, num: 'many' }, them: { p: 3, num: 'many' }, themselves: { p: 3, num: 'many' },
  their: { p: 3, poss: 1, num: 'many' }, theirs: { p: 3, poss: 1, num: 'many' },
};
const CONTRACTIONS = [
  [/\bcan't\b/g, 'can not'], [/\bwon't\b/g, 'will not'], [/\bshan't\b/g, 'shall not'],
  [/n't\b/g, ' not'], [/'ll\b/g, ' will'], [/'re\b/g, ' are'], [/'ve\b/g, ' have'],
  [/\bi'm\b/g, 'i am'], [/'d\b/g, ' would'], [/\b(it|he|she|that|what|there|who)'s\b/g, '$1 is'],
];
const IRREG_VERB = {
  ate:'eat',eaten:'eat',went:'go',gone:'go',saw:'see',seen:'see',had:'have',did:'do',done:'do',made:'make',said:'say',came:'come',
  took:'take',taken:'take',gave:'give',given:'give',got:'get',gotten:'get',knew:'know',known:'know',thought:'think',felt:'feel',
  found:'find',told:'tell',left:'leave',ran:'run',sat:'sit',slept:'sleep',drank:'drink',drunk:'drink',wrote:'write',written:'write',
  bought:'buy',brought:'bring',built:'build',caught:'catch',taught:'teach',fought:'fight',sang:'sing',sung:'sing',swam:'swim',
  began:'begin',begun:'begin',broke:'break',broken:'break',chose:'choose',chosen:'choose',drove:'drive',driven:'drive',fell:'fall',
  fallen:'fall',flew:'fly',flown:'fly',forgot:'forget',forgotten:'forget',grew:'grow',grown:'grow',heard:'hear',held:'hold',kept:'keep',
  lost:'lose',met:'meet',paid:'pay',rode:'ride',sold:'sell',sent:'send',spoke:'speak',spoken:'speak',spent:'spend',stood:'stand',
  stole:'steal',threw:'throw',thrown:'throw',understood:'understand',woke:'wake',won:'win',wore:'wear',became:'become',blew:'blow',
  drew:'draw',hid:'hide',shook:'shake',shot:'shoot',sought:'seek',meant:'mean',lent:'lend',led:'lead',fed:'feed',dug:'dig',hung:'hang',
  bit:'bite',bitten:'bite',froze:'freeze',frozen:'freeze',forgave:'forgive',lit:'light',slid:'slide',stuck:'stick',swept:'sweep',wept:'weep',
};
const PAST_OF = {}; for (const [k, v] of Object.entries(IRREG_VERB)) if (!PAST_OF[v] && !/(en|wn|ne|un)$/.test(k)) PAST_OF[v] = k;
Object.assign(PAST_OF, { be: 'was', see: 'saw', go: 'went', have: 'had', do: 'did', leave: 'left', lie: 'lay' });
const IRREG_NOUN = { children:'child', men:'man', women:'woman', feet:'foot', teeth:'tooth', mice:'mouse', geese:'goose',
  people:'person', leaves:'leaf', knives:'knife', wives:'wife', lives:'life', wolves:'wolf', halves:'half', shelves:'shelf', loaves:'loaf' };
const BE = { am: 'now', is: 'now', are: 'now', be: 'now', been: 'past', being: 'now', was: 'past', were: 'past' };
const DETERMINERS = new Set('a an the my your his her its our their this that these those some many few one two three several every each no any much more most another other'.split(' '));
const SUBJECTS = new Set('i you we they he she it who'.split(' '));
const VERB_CUES = new Set('to will would shall can could must should might may not please let do does did'.split(' '));
const DESC_CUES = new Set('very so too quite really am is are was were be been more most less'.split(' '));
const PUNCT = { '.': 8486, ',': 8487, '!': 8483, '?': 8485 };

// ---------- state ----------
let DATA = [], BYID = new Map(), INDEX = new Map(), PHRASE_MAX = 1;
let slots = [];
const answers = new Map();   // key `${i}|${word}` -> {kind, sense, num, time, pt, gender}
let askGender = false;

const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ---------- lexicon ----------
function cleanSyn(s) {
  return s.replace(/-\(to\)/g, '').replace(/[_-]?\([^)]*\)/g, '').replace(/\(s\)/g, '').replace(/_/g, ' ').trim().toLowerCase();
}
function isRetired(e) { return /\(OLD\)|_OLD\b/.test(e.en) || /SUPERSEDED/.test(e.der); }
function prettyName(e) {
  const verb = /-\(to\)/.test(e.en);
  const parts = e.en.split(',').map(s => s.replace(/-\(to\)/g, '').replace(/_/g, ' ').replace(/-\(/g, ' (').trim());
  let main = parts[0];
  if (verb) main = 'to ' + main;
  return { main, all: parts.join(', ') + (verb ? ' (to …)' : '') };
}
function plainExplain(e) {
  let d = e.der || '';
  d = d.replace(/\s*-\s*Character.*$/i, '').replace(/\s*SUPERSEDED.*$/i, '').replace(/\s*(Preferred )?NEW SYNONYM.*$/i, '')
       .replace(/\s*SYMBOL SYNONYM.*$/i, '').replace(/\(See Note[^)]*\)/g, '').replace(/See also:.*$/i, '').trim();
  d = d.replace(/^\(/, '').replace(/\)\s*$/, '');
  return d;
}
function buildIndex() {
  for (const e of DATA) {
    BYID.set(e.id, e);
    if (/^indicator_/.test(e.en)) continue;
    e.retired = isRetired(e);
    const quals = (e.en.match(/\(([^)]*)\)/g) || []).join(' ');
    if (/lowercase|uppercase|index_number/.test(quals)) continue;
    for (const raw of e.en.split(',')) {
      const w = cleanSyn(raw);
      if (!w) continue;
      if (!INDEX.has(w)) INDEX.set(w, []);
      const arr = INDEX.get(w);
      if (!arr.includes(e)) arr.push(e);
      PHRASE_MAX = Math.max(PHRASE_MAX, Math.min(5, w.split(' ').length));
    }
  }
}
function lookup(w) { return (INDEX.get(w) || []).filter(e => !e.retired); }

function lemmas(w) {
  const out = [{ l: w, infl: null }];
  if (IRREG_VERB[w]) out.push({ l: IRREG_VERB[w], infl: 'past' });
  if (IRREG_NOUN[w]) out.push({ l: IRREG_NOUN[w], infl: 'plural' });
  const add = (l, infl) => { if (l.length > 1) out.push({ l, infl }); };
  if (/ies$/.test(w)) add(w.slice(0, -3) + 'y', 's');
  if (/(s|x|z|ch|sh|o)es$/.test(w)) add(w.slice(0, -2), 's');
  if (/[^s]s$/.test(w)) add(w.slice(0, -1), 's');
  if (/ied$/.test(w)) add(w.slice(0, -3) + 'y', 'past');
  if (/ed$/.test(w)) { add(w.slice(0, -2), 'past'); add(w.slice(0, -1), 'past');
    if (/([^aeiou])\1ed$/.test(w)) add(w.slice(0, -3), 'past'); }
  if (/ing$/.test(w)) { add(w.slice(0, -3), 'ing'); add(w.slice(0, -3) + 'e', 'ing');
    if (/([^aeiou])\1ing$/.test(w)) add(w.slice(0, -4), 'ing'); }
  return out;
}
function findCands(w) {
  const seen = new Set(), cands = [];
  for (const { l, infl } of lemmas(w)) {
    for (const e of lookup(l)) {
      if (seen.has(e.id)) continue;
      // an "-s" on a describing/small word is not an inflection we can use
      if (infl === 'past' && e.pos !== 'RED' && l !== w) continue;
      if (infl === 'ing' && e.pos !== 'RED') continue;
      seen.add(e.id);
      cands.push({ e, infl, lemma: l });
    }
  }
  // exact first-synonym matches first, then by how "plain" the entry is
  const score = c => (cleanSyn(c.e.en.split(',')[0]) === c.lemma ? 0 : 1) + (c.e.en.includes('(') ? 0.5 : 0) + (c.infl ? 0.2 : 0);
  cands.sort((a, b) => score(a) - score(b));
  return cands;
}

// ---------- sentence → slots ----------
function tokenize(text) {
  let t = ' ' + text.toLowerCase().replace(/[’‘]/g, "'") + ' ';
  for (const [re, rep] of CONTRACTIONS) t = t.replace(re, rep);
  return t.match(/#\d+|[a-z0-9]+(?:'[a-z]+)?|[.,!?]/g) || [];
}

function buildSlots(text) {
  const toks = tokenize(text);
  const out = [];
  let pendingTime = null;
  for (let i = 0; i < toks.length; i++) {
    const w = toks[i], next = toks[i + 1], prev = toks[i - 1];
    const key = `${i}|${w}`;
    if (PUNCT[w]) { out.push({ type: 'punct', src: w, id: PUNCT[w], key }); continue; }
    if (/^#\d+$/.test(w)) {
      const e = BYID.get(+w.slice(1));
      if (e) { out.push(symSlot(key, w, [{ e, infl: null, lemma: prettyName(e).main }], prev, pendingTime)); pendingTime = null; }
      continue;
    }
    // multi-word phrases (thank you, good morning …)
    let matched = false;
    for (let n = Math.min(PHRASE_MAX, toks.length - i); n >= 2; n--) {
      const phrase = toks.slice(i, i + n).join(' ');
      const hits = lookup(phrase);
      if (hits.length) {
        out.push(symSlot(`${i}|${phrase}`, phrase, hits.map(e => ({ e, infl: null, lemma: phrase })), prev, null));
        i += n - 1; matched = true; break;
      }
    }
    if (matched) continue;

    if (w === 'a' || w === 'an' || w === 'the') { out.push({ type: 'skip', src: w, key, why: 'Bliss usually leaves out "a", "an" and "the".' }); continue; }
    if (w === 'will' || w === 'shall') { pendingTime = 'future'; out.push({ type: 'skip', src: w, key, why: 'Shown as the "future" mark on the next action instead.' }); continue; }
    if (w === 'would' || w === 'could' || w === 'might') { pendingTime = 'cond'; out.push({ type: 'skip', src: w, key, why: 'Shown as the "would / might" mark on the next action instead.' }); continue; }
    if ((w === 'did' || w === 'do' || w === 'does') && next && next !== '.' && next !== '?') {
      if (w === 'did') pendingTime = 'past';
      out.push({ type: 'skip', src: w, key, why: w === 'did' ? 'Shown as the "already happened" mark on the next action.' : 'A helper word that Bliss doesn\'t need here.' });
      continue;
    }
    if (w === 'to' && next && findCands(next).some(c => c.e.pos === 'RED') && !DETERMINERS.has(next)) {
      out.push({ type: 'skip', src: w, key, why: 'In "want to eat", the action mark on "eat" already means "to".' }); continue;
    }
    if (PRON_WORDS[w]) {
      const f = { ...PRON_WORDS[w] };
      if (w === 'her' && next && !PUNCT[next] && !PRON_WORDS[next] && !['to', 'and', 'with', 'for', 'from', 'in', 'on', 'at', 'a', 'the', 'not'].includes(next)) f.poss = 1;
      out.push({ type: 'pron', src: w, key, f });
      continue;
    }
    if (BE[w]) {
      const s = symSlot(key, w, [{ e: BYID.get(12639), infl: BE[w] === 'past' ? 'past' : null, lemma: 'be' }], prev, pendingTime);
      out.push(s); pendingTime = null; continue;
    }
    const cands = findCands(w);
    if (!cands.length) { out.push({ type: 'unk', src: w, key }); continue; }
    const s = symSlot(key, w, cands, prev, pendingTime, next);
    if (s.cands.some(c => c.e.pos === 'RED')) pendingTime = null;
    out.push(s);
  }
  // possessive "her" next to "his/her" style, already handled; attach saved answers
  for (const s of out) s.ans = answers.get(s.key) || (answers.set(s.key, {}), answers.get(s.key));
  return out;
}

function symSlot(key, src, cands, prev, ctxTime, next) {
  // guess the kind of word from its neighbour
  let kindGuess = null, why = '';
  const kinds = new Set(cands.map(c => c.e.pos));
  if (kinds.size > 1 && prev) {
    if (DETERMINERS.has(prev) || PRON_WORDS[prev]?.poss) { kindGuess = kinds.has('YELLOW') ? 'YELLOW' : kinds.has('BLUE') ? 'BLUE' : null; why = `comes after "${prev}"`; }
    else if (SUBJECTS.has(prev) || VERB_CUES.has(prev)) { kindGuess = kinds.has('RED') ? 'RED' : null; why = `comes after "${prev}"`; }
    if (DESC_CUES.has(prev) && kinds.has('GREEN')) { kindGuess = 'GREEN'; why = `comes after "${prev}"`; }
    // "a cold drink": determiner + this word + a thing → describing word
    if (DETERMINERS.has(prev) && kinds.has('GREEN') && next && !PUNCT[next] && findCands(next).some(c => c.e.pos === 'YELLOW' || c.e.pos === 'BLUE')) {
      kindGuess = 'GREEN'; why = `sits between "${prev}" and "${next}"`;
    }
    // "cold drink": after a describing word → a thing
    if (!kindGuess && !PRON_WORDS[prev] && kinds.has('YELLOW')) {
      const pk = findCands(prev).map(c => c.e.pos);
      if (pk.length && pk.includes('GREEN')) { kindGuess = 'YELLOW'; why = `comes after the describing word "${prev}"`; }
    }
  }
  if (kinds.size > 1 && !kindGuess) {
    const infl = cands.find(c => c.infl)?.infl;
    if ((infl === 'past' || infl === 'ing') && kinds.has('RED')) { kindGuess = 'RED'; why = `ends in "-${infl === 'past' ? 'ed' : 'ing'}"`; }
  }
  return { type: 'sym', src, key, cands, kindGuess, kindWhy: why, ctxTime };
}

// ---------- resolving a slot (applying answers + guesses) ----------
function kindOptions(s) { return [...new Set(s.cands.map(c => c.e.pos))]; }
function resolveSym(s) {
  const a = s.ans, qs = [];
  const kinds = kindOptions(s);
  let pool = s.cands;
  let total = 0;
  for (const c of s.cands) total += c.e.pos === 'RED' ? 4 : (c.e.pos === 'YELLOW' || c.e.pos === 'BLUE') ? 2 : 1;

  // Q1: what kind of word
  if (kinds.length > 1) {
    const val = a.kind || s.kindGuess || null;
    qs.push({ key: 'kind', title: `Is "${s.src}" …`, value: val, guessed: !a.kind && !!s.kindGuess, guessNote: s.kindWhy,
      options: kinds.map(k => ({ v: k, label: KIND[k].label, ex: KIND[k].ex(s.cands.find(c => c.e.pos === k).lemma), dot: k })) });
    if (val) pool = pool.filter(c => c.e.pos === val);
  }
  // Q2: which meaning
  let chosen = null;
  const kindOpen = kinds.length > 1 && !(a.kind || s.kindGuess);
  if (pool.length > 1 && !kindOpen) {
    const ids = pool.map(c => c.e.id);
    const main = pool.filter(c => cleanSyn(c.e.en.split(',')[0]) === c.lemma && !/\(/.test(c.e.en.split(',')[0]));
    const g = main.length === 1 ? main[0].e.id : null;
    const val = ids.includes(a.sense) ? a.sense : g;
    qs.push({ key: 'sense', title: `Which meaning of "${s.src}"?`, value: val, pictures: true, guessed: !ids.includes(a.sense) && !!g,
      guessNote: g ? 'the most common meaning' : '',
      options: pool.slice(0, 10).map(c => ({ v: c.e.id, label: prettyName(c.e).all, ex: plainExplain(c.e), e: c.e })) });
    chosen = pool.find(c => c.e.id === val) || null;
  } else chosen = pool[0] || null;

  const preview = chosen || pool[0];
  let ind = null, extra = '';
  if (preview) {
    const e = preview.e, lemma = preview.lemma;
    if (e.pos === 'YELLOW' || e.pos === 'BLUE') {
      const g = preview.infl === 'plural' || preview.infl === 's' ? 'many' : 'one';
      const val = a.num || g;
      const w1 = lemma, wN = pluralOf(lemma);
      qs.push({ key: 'num', title: 'How many?', value: val, guessed: !a.num, optional: true,
        guessNote: g === 'many' ? `"${s.src}" sounds like more than one` : `"${s.src}" sounds like just one`,
        options: [
          { v: 'one', label: 'Just one', ex: `one ${w1}`, pic: '●' },
          { v: 'many', label: 'More than one', ex: `lots of ${wN}`, pic: '●●●' }] });
      if (val === 'many') { ind = e.top ? IND.thingPlural : IND.plural; extra = 'many'; }
    }
    if (e.pos === 'RED') {
      const g = s.ctxTime || (preview.infl === 'past' ? 'past' : 'now');
      const val = a.time || g;
      const base = lemma.replace(/^to /, ''), past = pastOf(base), isBe = e.id === 12639;
      const gn = s.ctxTime ? `from "${{ future: 'will', cond: 'would', past: 'did' }[s.ctxTime]}" before it`
               : preview.infl === 'past' ? `"${s.src}" is a past form` : 'no time words, so "now"';
      qs.push({ key: 'time', title: 'When does it happen?', value: val, guessed: !a.time, optional: true, guessNote: gn,
        options: [
          { v: 'now', label: 'Now, or usually', ex: isBe ? 'I am (today)' : `I ${base} (today / every day)`, pic: '◉' },
          { v: 'past', label: 'Already happened', ex: isBe ? 'I was (yesterday)' : `I ${past} (yesterday)`, pic: '◀' },
          { v: 'future', label: 'Will happen', ex: `I will ${base} (tomorrow)`, pic: '▶' },
          { v: 'cond', label: 'Might / would happen', ex: `I would ${base} (if …)`, pic: '?' },
          { v: 'cmd', label: 'Telling someone to do it', ex: `${cap(base)}! (a command)`, pic: '!' }] });
      ind = IND[val]; extra = { now: '', past: 'past', future: 'future', cond: 'would', cmd: 'command' }[val];
    }
  }
  const open = qs.filter(q => !q.optional && !q.value);
  const remaining = open.reduce((n, q) => n * q.options.length, 1) * (chosen || pool.length <= 1 ? 1 : 1);
  const e = preview?.e || null;
  return { qs, e, ind, extra, open: open.length, total: Math.max(total, 1), remaining };
}

function resolvePron(s) {
  const f = s.f, a = s.ans, qs = [];
  const thingsPossible = f.p === 3 && !f.g;
  const ptVal = f.pt || a.pt || null;
  if (thingsPossible && !f.pt) {
    qs.push({ key: 'pt', title: `"${s.src}" means …`, value: ptVal,
      options: [
        { v: 'people', label: 'People', ex: `${cap(s.src)} (my friends) laughed.`, pic: '🧍' },
        { v: 'things', label: 'Things', ex: `${cap(s.src)} (the boxes) fell over.`, pic: '📦' }] });
  }
  const numVal = a.num || f.num || null;
  const ex = {
    1: [['Just me', f.poss ? 'my bag — it belongs to me' : 'I am hungry.', '🧍'], ['Me and others (a group)', f.poss ? 'our bag — it belongs to all of us' : 'We are hungry.', '🧍🧍🧍']],
    2: [['One person', f.poss ? 'Sam, is this your coat?' : 'Sam, are you coming?', '🧍'], ['More than one person', f.poss ? 'Is this your (all of yours) classroom?' : 'Are you all coming?', '🧍🧍🧍']],
    3: ptVal === 'things'
      ? [['One thing', f.poss ? 'its lid' : 'It is broken.', '📦'], ['More than one thing', f.poss ? 'their lids (the jars\')' : 'They (the cups) are broken.', '📦📦📦']]
      : [['One person', f.poss ? 'her / his coat' : 'She is here. / He is here.', '🧍'], ['A group of people', f.poss ? 'their coats' : 'They are here.', '🧍🧍🧍']],
  }[f.p];
  const who = { 1: 'Who do you mean?', 2: 'How many people are you talking to?', 3: 'How many?' }[f.p];
  qs.push({ key: 'num', title: who, value: numVal, guessed: !a.num && !!f.num,
    guessNote: f.num ? `"${s.src}" is ${f.num === 'one' ? 'singular (one)' : 'plural (more than one)'} in English` : '',
    options: [{ v: 'one', label: ex[0][0], ex: ex[0][1], pic: ex[0][2] }, { v: 'many', label: ex[1][0], ex: ex[1][1], pic: ex[1][2] }] });

  if (ptVal !== 'things' && (askGender || f.g)) {
    const gVal = a.gender || f.g || 'n';
    qs.push({ key: 'gender', title: 'Show if it\'s female or male?', value: gVal, guessed: !a.gender && !!f.g, optional: true,
      guessNote: f.g ? `"${s.src}" is ${f.g === 'f' ? 'female' : 'male'} in English` : 'most Bliss users leave this out',
      options: [{ v: 'n', label: 'Don\'t show (usual)', ex: 'person, any gender', pic: '◯' },
                { v: 'f', label: 'Female', ex: 'she / her', pic: '♀' }, { v: 'm', label: 'Male', ex: 'he / him', pic: '♂' }] });
  }
  // pick the symbol
  const form = f.poss ? 'poss' : 'subj';
  const num = numVal || 'one';
  let id;
  if (ptVal === 'things') id = PRON[form].t[num];
  else {
    const g = (askGender || f.g) ? (a.gender || f.g || 'n') : 'n';
    id = PRON[form][f.p][num][g];
  }
  const open = qs.filter(q => !q.optional && !q.value);
  const total = (thingsPossible && !f.pt ? 4 : 2) * (askGender || f.g ? 3 : 1);
  const remaining = open.reduce((n, q) => n * q.options.length, 1);
  return { qs, e: BYID.get(id), ind: null, extra: '', open: open.length, total, remaining };
}

function resolve(s) {
  if (s.type === 'sym') return resolveSym(s);
  if (s.type === 'pron') return resolvePron(s);
  if (s.type === 'punct') return { qs: [], e: BYID.get(s.id), open: 0, total: 1, remaining: 1 };
  if (s.type === 'unk') return { qs: [], e: null, open: 0, total: 1, remaining: 1 };
  return null;
}

function pluralOf(w) {
  if (/\s/.test(w)) return w;
  for (const [p, sg] of Object.entries(IRREG_NOUN)) if (sg === w) return p;
  if (/(s|x|z|ch|sh)$/.test(w)) return w + 'es';
  if (/[^aeiou]y$/.test(w)) return w.slice(0, -1) + 'ies';
  return w + 's';
}
function pastOf(w) {
  if (PAST_OF[w]) return PAST_OF[w];
  if (/e$/.test(w)) return w + 'd';
  if (/[^aeiou]y$/.test(w)) return w.slice(0, -1) + 'ied';
  return w + 'ed';
}
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

// ---------- SVG rendering ----------
const VB_Y = 44, VB_H = 256;
function symInner(e, indId) {
  let body = e.svg;
  if (indId) {
    const ind = BYID.get(indId);
    const cx = e.top ? e.tx : e.w / 2;
    const dx = Math.round((cx - ind.w / 2) * 10) / 10;
    body += `<g transform="translate(${dx} 0)" stroke-width="${ind.sw}">${ind.svg}</g>`;
  } else if (e.top) body += e.top;
  return body;
}
function symSVG(e, indId, cls = '') {
  if (!e) return '';
  return `<svg class="${cls}" viewBox="0 ${VB_Y} ${e.w} ${VB_H}" style="aspect-ratio:${e.w}/${VB_H}" overflow="visible" role="img" aria-label="${esc(prettyName(e).main)}">` +
    `<g fill="none" stroke="#000" stroke-width="${e.sw}" stroke-linecap="round" stroke-linejoin="round">${symInner(e, indId)}</g></svg>`;
}

// ---------- UI: translate ----------
let resolved = [], popKey = null;
const userChose = s => Object.keys(s.ans || {}).length > 0;
function stateOf(s, r) {
  if (s.type === 'punct') return 'punct';
  if (s.type === 'unk' || r.open) return 'red';
  if (userChose(s)) return 'green';
  return 'yellow';
}
function render() {
  resolved = slots.map(s => ({ s, r: resolve(s) }));
  const visible = resolved.filter(x => x.r);
  $('#resultWrap').hidden = !visible.length;

  // strip: red = program could not decide, yellow = auto-filled, green = set by the user
  $('#strip').innerHTML = visible.map(({ s, r }) => {
    const st = stateOf(s, r);
    const sel = s.key === popKey ? ' sel' : '';
    if (s.type === 'unk') return `<button class="tok text ${st}${sel}" data-key="${esc(s.key)}" aria-haspopup="dialog"><span class="raw">${esc(s.src)}</span><span class="gl">no symbol yet</span></button>`;
    const gl = s.type === 'punct' ? '' : glossFor(s, r);
    return `<button class="tok ${s.type === 'punct' ? 'punct' : ''} ${st}${sel}" data-key="${esc(s.key)}" aria-haspopup="dialog" title="${esc(gl)}">${symSVG(r.e, r.ind)}<span class="gl">${esc(gl) || '&nbsp;'}</span></button>`;
  }).join('');

  // funnel
  const total = visible.reduce((n, x) => n * x.r.total, 1);
  const remaining = visible.reduce((n, x) => n * x.r.remaining, 1);
  const reds = visible.filter(x => stateOf(x.s, x.r) === 'red').length;
  const yellows = visible.filter(x => stateOf(x.s, x.r) === 'yellow').length;
  const fmt = n => n > 1e6 ? 'over a million' : n.toLocaleString();
  $('#funnel').innerHTML = `<span>From <b>${fmt(total)}</b> possible meaning${total === 1 ? '' : 's'}</span><span>→</span>` +
    (remaining === 1 && !reds ? `<span class="pill done">exactly 1 ✓</span>` : `<span class="pill">${reds} red word${reds === 1 ? '' : 's'}<span class="long"> to tap</span></span>`) +
    (yellows ? `<span class="pill auto">${yellows} auto-filled</span>` : '');

  const skipped = resolved.filter(x => x.s.type === 'skip');
  $('#skipped').innerHTML = skipped.length ? '<b>Left out:</b> ' + skipped.map(x => `<i title="${esc(x.s.why)}">${esc(x.s.src)}</i>`).join(', ') + ' <span class="why">— Bliss shows these with marks on other symbols, or leaves them out.</span>' : '';
  $('#actions').hidden = !visible.length;
  renderExportPreview();
  renderPop();
}

// ---------- pop-up for one word ----------
function openPop(key) { popKey = key; render(); }
function closePop() {
  popKey = null; $('#pop').hidden = true;
  document.querySelectorAll('.tok.sel').forEach(t => t.classList.remove('sel'));
}
function nextRedKey(fromKey) {
  const order = resolved.map(x => x.s.key);
  const reds = resolved.filter(x => x.r && stateOf(x.s, x.r) === 'red').map(x => x.s.key).filter(k => k !== fromKey);
  if (!reds.length) return null;
  const i = order.indexOf(fromKey);
  return reds.find(k => order.indexOf(k) > i) || reds[0];
}
function renderPop() {
  const pop = $('#pop');
  const x = resolved.find(x => x.s.key === popKey);
  if (!x || !x.r) { pop.hidden = true; popKey = null; return; }
  const { s, r } = x;
  const st = stateOf(s, r);
  const next = nextRedKey(s.key);
  let body;
  if (s.type === 'unk') {
    const stem = lemmas(s.src).map(v => v.l).pop();
    body = `<p class="popnote">No Bliss symbol is called exactly “${esc(s.src)}”. Search for a close word and tap one — or close this to leave it as text.</p>
      <div class="findbox"><input type="search" data-find="${esc(s.key)}" value="${esc(stem)}" placeholder="Try a similar word…" aria-label="Find a symbol for ${esc(s.src)}"><div class="findres" data-findres="${esc(s.key)}">${findHTML(stem, s.key)}</div></div>`;
  } else if (!r.qs.length) {
    body = `<p class="popnote">Nothing to choose here — this word has only one meaning.</p>`;
  } else {
    body = r.qs.map(q => qHTML(s, q)).join('');
  }
  pop.innerHTML = `<div class="pophead">${r.e ? symSVG(r.e, r.ind) : ''}<div class="ph-t"><div class="word">${esc(s.src)}</div><div class="chosen">${esc(r.e ? glossFor(s, r) : 'no symbol yet')}</div></div>
      <span class="state ${st}">${st === 'red' ? 'program couldn\'t tell' : st === 'green' ? 'set by you ✓' : st === 'yellow' ? 'auto-filled' : ''}</span>
      <button class="x" type="button" data-close aria-label="Close">×</button></div>
    <div class="popbody">${body}</div>
    <div class="popfoot">${st === 'yellow' ? `<button type="button" class="ok" data-confirm="${esc(s.key)}">Looks right ✓</button>` : ''}${next ? `<button type="button" class="primary" data-next="${esc(next)}">Next red word ›</button>` : ''}<button type="button" data-close>${st === 'red' ? 'Later' : 'Close'}</button></div>`;
  pop.hidden = false;
  placePop();
}
function placePop() {
  const pop = $('#pop'), t = document.querySelector(`.tok[data-key="${CSS.escape(popKey || '')}"]`);
  if (!t || pop.hidden) return;
  if (window.innerWidth <= 600) { pop.classList.add('sheet'); pop.style.left = pop.style.top = ''; return; }
  pop.classList.remove('sheet');
  const rc = t.getBoundingClientRect(), w = pop.offsetWidth;
  const left = Math.max(8, Math.min(window.innerWidth - w - 8, rc.left + rc.width / 2 - w / 2));
  pop.style.left = left + window.scrollX + 'px';
  pop.style.top = rc.bottom + window.scrollY + 10 + 'px';
  pop.style.setProperty('--arrow', (rc.left + rc.width / 2 - left) + 'px');
}

function glossFor(s, r) {
  if (!r.e) return s.src;
  if (s.type === 'pron') {
    const f = s.f, num = s.ans.num || f.num, pt = f.pt || s.ans.pt;
    if (f.p === 3 && !f.g && !pt) return (f.poss ? 'their' : (num === 'many' ? 'they' : 'it / they')) + ' — people or things?';
    const n = num === 'many' ? (f.p === 1 ? 'we (group)' : f.p === 2 ? 'you (group)' : pt === 'things' ? 'they (things)' : 'they (people)')
                             : (f.p === 1 ? 'I (just me)' : f.p === 2 ? 'you (one)' : pt === 'things' ? 'it' : 'he / she');
    const base = prettyName(r.e).main.replace(/-?\(.*\)$/, '').trim();
    return f.poss ? `${base}${num === 'many' ? ' (group)' : ''}` : n + (!num ? ' ?' : '');
  }
  const nm = prettyName(r.e).main;
  return r.extra ? `${nm} (${r.extra})` : nm;
}

function qHTML(s, q) {
  const guess = q.guessed && q.value ? `<span class="guess" title="${esc(q.guessNote || '')}">guessed</span>` : '';
  const opts = q.options.map(o => {
    const pressed = String(q.value) === String(o.v);
    const pic = o.e ? symSVG(o.e) : o.dot ? `<span class="pic"><span class="dot" style="background:var(--c-${o.dot});width:16px;height:16px"></span></span>` : `<span class="pic">${esc(o.pic || '')}</span>`;
    return `<button class="o" aria-pressed="${pressed}" data-key="${esc(s.key)}" data-q="${q.key}" data-v="${esc(o.v)}">${pic}<span><span class="ol">${esc(o.label)}</span><span class="oe">${esc(o.ex || '')}</span></span>${pressed ? guess : ''}</button>`;
  }).join('');
  const note = q.guessed && q.value && q.guessNote ? ` <span class="opt">(guessed: ${esc(q.guessNote)})</span>` : q.optional ? '' : '';
  return `<div class="q ${!q.optional && !q.value ? 'open' : ''} ${q.pictures ? 'pics' : 'compact'}"><div class="qt">${esc(q.title)}${note}</div><div class="opts row">${opts}</div></div>`;
}

function search(q, limit = 60) {
  q = q.trim().toLowerCase().replace(/^to /, '');
  if (!q) return [];
  const exact = [], starts = [], has = [];
  for (const e of DATA) {
    if (e.retired || /^indicator_/.test(e.en)) continue;
    const syns = e.en.split(',').map(cleanSyn);
    if (syns.includes(q)) exact.push(e);
    else if (syns.some(x => x.startsWith(q))) starts.push(e);
    else if (e.en.toLowerCase().replace(/_/g, ' ').includes(q)) has.push(e);
  }
  return [...exact, ...starts, ...has].slice(0, limit);
}
function findHTML(q, key) {
  const res = search(q, 24);
  if (!res.length) return `<span class="skipped">Nothing found for "${esc(q)}".</span>`;
  return res.map(e => `<button class="o" data-pick="${e.id}" data-key="${esc(key)}">${symSVG(e)}<span>${esc(prettyName(e).main)}</span></button>`).join('');
}

function translate() {
  const text = $('#src').value;
  slots = buildSlots(text);
  if (popKey && !slots.some(x => x.key === popKey)) popKey = null;
  $('#status').hidden = true;
  render();
}

// ---------- UI: dictionary ----------
function renderGrid() {
  const q = $('#q').value;
  const res = q.trim() ? search(q, 240) : DATA.filter(e => !e.retired && !/^indicator_|lowercase|uppercase|index_number/.test(e.en) && e.pos !== 'WHITE').slice(0, 120);
  $('#grid').innerHTML = res.map(e => `<button class="cell" data-id="${e.id}" style="border-top-color:var(--c-${e.pos})">${symSVG(e)}<span>${esc(prettyName(e).main)}</span></button>`).join('')
    || `<p class="skipped">No symbols match "${esc(q)}".</p>`;
}
function showDetail(id) {
  const e = BYID.get(id), d = $('#detail'), p = prettyName(e);
  d.innerHTML = `${symSVG(e, null, 'big')}
    <h3 style="margin:0">${esc(p.all)}</h3>
    <p style="margin:4px 0;color:var(--muted)"><span class="dot" style="background:var(--c-${e.pos})"></span>${KIND_NAME[e.pos] || ''} · BCI-AV #${e.id}</p>
    <p><b>Built from:</b> ${esc(plainExplain(e)) || '—'}</p>
    <div class="row"><button type="button" data-close>Close</button><button type="button" class="primary" data-add="${e.id}">Add to my sentence</button></div>`;
  d.showModal();
}

// ---------- export ----------
// ---------- 1-bit raster → ASCII art ----------
// Each symbol is drawn on a small canvas (supersampled), every text cell is marked filled if
// enough of it is inked, then filled cells become the fill character and empty ones a space.
// Text cells are about twice as tall as they are wide, so a cell covers (h/2) x h symbol units.
function symParts(e, indId) {
  const parts = [{ m: e.svg, dx: 0 }];
  if (indId) {
    const ind = BYID.get(indId);
    const cx = e.top ? e.tx : e.w / 2;
    parts.push({ m: ind.svg, dx: Math.round((cx - ind.w / 2) * 10) / 10 });
  } else if (e.top) parts.push({ m: e.top, dx: 0 });
  return parts;
}
const attr = (s, k) => { const m = s.match(new RegExp('\\b' + k + '="([^"]*)"')); return m ? m[1] : null; };
let rasterCanvas = null;
function rasterSymbol(e, ind, rows) {
  const SS = 6;                                  // supersamples per cell edge
  const cellH = VB_H / rows, cellW = cellH / 2;
  const cols = Math.max(1, Math.ceil(e.w / cellW));
  const W = cols * SS, H = rows * SS;
  const cv = rasterCanvas || (rasterCanvas = document.createElement('canvas'));
  cv.width = W; cv.height = H;
  const g = cv.getContext('2d', { willReadFrequently: true });
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
  // pen: thinner than the printed stroke so neighbouring lines stay apart, but never thinner than ~0.55 of a cell
  const lw = Math.max(cellH * 0.55, Math.min(e.sw, cellH * 0.8));
  g.strokeStyle = '#000'; g.fillStyle = '#000'; g.lineCap = 'round'; g.lineJoin = 'round';
  for (const { m, dx } of symParts(e, ind)) {
    g.setTransform(SS / cellW, 0, 0, SS / cellH, dx * SS / cellW, -VB_Y * SS / cellH);
    g.lineWidth = lw;
    for (const [, tag, a, txt] of m.matchAll(/<(path|circle|text)\b([^>]*?)\/?>(?:([^<]*)<\/text>)?/g)) {
      if (tag === 'path') {
        const d = attr(a, 'd');
        g.stroke(new Path2D(d));
        // zero-length segments are dots (full stop, decimal point…): canvas skips them, so draw them
        for (const [, x, y] of d.matchAll(/M(-?[\d.]+) (-?[\d.]+)L\1 \2(?![\d.])/g)) {
          g.beginPath(); g.ellipse(+x, +y, Math.max(e.sw / 2, cellW * 0.7), Math.max(e.sw / 2, cellH * 0.4), 0, 0, Math.PI * 2); g.fill();
        }
      }
      else if (tag === 'circle') {
        const cx = +attr(a, 'cx'), cy = +attr(a, 'cy'), r = +attr(a, 'r');
        g.beginPath();
        if (attr(a, 'fill')) { g.ellipse(cx, cy, Math.max(r, cellW * 0.7), Math.max(r, cellH * 0.4), 0, 0, Math.PI * 2); g.fill(); }
        else { g.arc(cx, cy, r, 0, Math.PI * 2); g.stroke(); }
      } else if (tag === 'text') {
        g.font = `bold ${attr(a, 'font-size') || 16}px Arial, sans-serif`;
        g.fillText(txt || '', +attr(a, 'x'), +attr(a, 'y'));
      }
    }
  }
  const px = g.getImageData(0, 0, W, H).data;
  const grid = [];
  for (let r = 0; r < rows; r++) {
    let line = '';
    for (let c = 0; c < cols; c++) {
      let ink = 0;
      for (let y = 0; y < SS; y++) for (let x = 0; x < SS; x++) if (px[((r * SS + y) * W + c * SS + x) * 4] < 128) ink++;
      line += ink / (SS * SS) >= 0.22 ? '1' : '0';
    }
    grid.push(line);
  }
  return grid;   // array of '0'/'1' strings
}
function trimCols(grid) {
  const cols = grid[0].length;
  let l = 0, r = cols - 1;
  while (l < r && grid.every(row => row[l] === '0')) l++;
  while (r > l && grid.every(row => row[r] === '0')) r--;
  return grid.map(row => row.slice(l, r + 1));
}
const center = (t, w) => { t = t.length > w ? t.slice(0, w) : t; const p = w - t.length, a = Math.floor(p / 2); return ' '.repeat(a) + t + ' '.repeat(p - a); };
function asciiArt(o = exportOpts()) {
  const ch = o.fill || 'o';
  const items = resolved.filter(x => x.r && x.r.e && (o.style !== 'boxes' || x.s.type !== 'punct'));
  if (!items.length) return '';
  let syms = items.map(({ s, r }) => ({ grid: trimCols(rasterSymbol(r.e, r.ind, o.rows)), label: s.type === 'punct' ? '' : glossFor(s, r) }));
  // trim blank rows shared by every symbol so the baseline stays aligned
  const rows = o.rows;
  let top = 0, bot = rows - 1;
  const blankRow = i => syms.every(x => !x.grid[i].includes('1'));
  while (top < bot && blankRow(top)) top++;
  while (bot > top && blankRow(bot)) bot--;
  syms = syms.map(x => ({ ...x, grid: x.grid.slice(top, bot + 1).map(row => row.replace(/1/g, ch).replace(/0/g, ' ')) }));
  const withLabel = o.label !== 'none';
  return o.style === 'boxes' ? asciiBoxes(syms, o, withLabel) : asciiStrip(syms, o, withLabel);
}
function asciiStrip(syms, o, withLabel) {
  const gap = '   ', maxW = 100, out = [];
  // each slot is as wide as the symbol or (shortened) label, whichever is wider
  const slots = syms.map(x => {
    const lab = withLabel ? x.label.slice(0, 24) : '';
    const w = Math.max(x.grid[0].length, lab.length);
    return { lines: x.grid.map(row => center(row, w)), lab: center(lab, w), w };
  });
  let band = [];
  const flush = () => {
    if (!band.length) return;
    const art = band[0].lines.map((_, i) => band.map(sl => sl.lines[i]).join(gap));
    const labs = band.map(sl => sl.lab).join(gap);
    const block = withLabel ? (o.label === 'above' ? [labs, ...art] : [...art, labs]) : art;
    out.push(block.map(l => l.replace(/\s+$/, '')).join('\n'));
    band = [];
  };
  let used = 0;
  for (const sl of slots) {
    if (band.length && used + gap.length + sl.w > maxW) { flush(); used = 0; }
    used += (band.length ? gap.length : 0) + sl.w; band.push(sl);
  }
  flush();
  return out.join('\n\n') + '\n';
}
function asciiBoxes(syms, o, withLabel) {
  const labW = 18;
  const innerW = Math.max(...syms.map(x => x.grid[0].length), withLabel ? Math.min(labW, Math.max(...syms.map(x => x.label.length))) : 0) + 2;
  const artH = syms[0].grid.length;
  const cols = Math.min(o.perRow, syms.length);
  const cell = x => {
    const art = x.grid.map(row => center(row, innerW));
    const lab = center(x.label.slice(0, innerW - 2), innerW);
    const blank = ' '.repeat(innerW);
    if (!withLabel) return [blank, ...art, blank];
    return o.label === 'above' ? [lab, blank, ...art, blank] : [blank, ...art, blank, lab];
  };
  const border = n => '+' + Array(n).fill('-'.repeat(innerW)).join('+') + '+';
  const out = [];
  for (let i = 0; i < syms.length; i += cols) {
    const row = syms.slice(i, i + cols).map(cell);
    if (i === 0) out.push(border(row.length));
    for (let k = 0; k < row[0].length; k++) out.push('|' + row.map(c => c[k]).join('|') + '|');
    out.push(border(row.length));
  }
  return out.join('\n') + '\n';
}

// ---------- Sigil art ----------
// Uses only symbols drawn entirely with straight lines (no curves, circles or letters),
// stacks them top-to-bottom in sentence order, overlaps them, and optionally mirrors them.
let sigilSnapshot = null;   // symbols captured when "Make sigil" was pressed
function isStraight(e, ind) {
  return symParts(e, ind).every(p => !/A|<circle|<text/.test(p.m));
}
function segmentsOf(e, ind) {
  const segs = [];
  for (const { m, dx } of symParts(e, ind)) {
    for (const [, d] of m.matchAll(/<path d="([^"]*)"/g)) {
      for (const [, x1, y1, x2, y2] of d.matchAll(/M(-?[\d.]+) (-?[\d.]+)L(-?[\d.]+) (-?[\d.]+)/g)) {
        if (x1 === x2 && y1 === y2) continue;            // a dot, not a line
        segs.push([+x1 + dx, +y1, +x2 + dx, +y2]);
      }
    }
  }
  return segs;
}
function takeSigilSnapshot() {
  const items = resolved.filter(x => x.r && x.r.e && x.s.type !== 'punct');
  sigilSnapshot = items.map(({ s, r }) => ({
    e: r.e, ind: r.ind, label: glossFor(s, r), straight: isStraight(r.e, r.ind),
  }));
}
function sigilOpts() {
  return {
    overlap: +$('#sgOverlap').value / 100,
    mirror: $('#sgMirror').checked,
    spine: $('#sgSpine').checked,
    ends: $('#sgEnds').checked,
    weight: +$('#sgWeight').value,
    perCol: Math.max(0, +$('#sgPerCol').value || 0),
  };
}
// one column of the sigil, centred on x = 0, starting at y = 0
function sigilColumn(used, o, first, last) {
  let y = 0, segs = [];
  for (const u of used) {
    const ss = segmentsOf(u.e, u.ind);
    if (!ss.length) continue;
    const xs = ss.flatMap(s => [s[0], s[2]]), ys = ss.flatMap(s => [s[1], s[3]]);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const cx = (minX + maxX) / 2, h = Math.max(maxY - minY, 16);
    for (const s of ss) segs.push([s[0] - cx, s[1] - minY + y, s[2] - cx, s[3] - minY + y]);
    y += h * (1 - o.overlap) + (o.overlap >= 1 ? 0 : 8);
  }
  if (!segs.length) return null;
  if (o.mirror) segs = segs.concat(segs.map(s => [-s[0], s[1], -s[2], s[3]]));
  const ys = segs.flatMap(s => [s[1], s[3]]);
  let top = Math.min(...ys), bot = Math.max(...ys);
  const ext = o.ends ? 24 : 0;
  if (o.spine) segs.push([0, top - ext, 0, bot + ext]);
  if (o.ends) {
    const t = top - 24, b = bot + 24, r = 9;
    if (first) segs.push([0, t - r, r, t], [r, t, 0, t + r], [0, t + r, -r, t], [-r, t, 0, t - r]);   // start: diamond
    else segs.push([-9, t - 9, 0, t], [0, t, 9, t - 9]);                                              // continued from the left: v
    if (last) segs.push([-18, b, 18, b]);                                                               // end: crossbar
    else segs.push([-9, b - 9, 0, b], [0, b, 9, b - 9]);                                              // continues to the right: v
    top = t - (first ? r : 9); bot = b;
  }
  const half = Math.max(...segs.flatMap(s => [Math.abs(s[0]), Math.abs(s[2])]), 20);
  return { segs, half, top, bot };
}
function sigilSVG(o = sigilOpts(), scale = 1) {
  const used = (sigilSnapshot || []).filter(x => x.straight && segmentsOf(x.e, x.ind).length);
  if (!used.length) return '';
  const per = o.perCol > 0 ? o.perCol : used.length;
  const groups = [];
  for (let i = 0; i < used.length; i += per) groups.push(used.slice(i, i + per));
  const cols = groups.map((g, i) => sigilColumn(g, o, i === 0, i === groups.length - 1)).filter(Boolean);
  // lay columns out left to right, tops aligned
  const gapX = 40, pad = 24 + o.weight;
  const top = Math.min(...cols.map(c => c.top)), bot = Math.max(...cols.map(c => c.bot));
  let x = pad, all = [];
  for (const c of cols) {
    const ox = x + c.half, oy = pad - top;
    for (const s of c.segs) all.push([s[0] + ox, s[1] + oy, s[2] + ox, s[3] + oy]);
    x += c.half * 2 + gapX;
  }
  // drop duplicate lines (same ends, either direction)
  const seen = new Set();
  all = all.filter(s => {
    const a = `${Math.round(s[0])},${Math.round(s[1])}`, b = `${Math.round(s[2])},${Math.round(s[3])}`;
    const k = a < b ? a + '|' + b : b + '|' + a;
    if (seen.has(k)) return false; seen.add(k); return true;
  });
  const W = x - gapX + pad, H = bot - top + pad * 2;
  const d = all.map(s => `M${s[0].toFixed(1)} ${s[1].toFixed(1)}L${s[2].toFixed(1)} ${s[3].toFixed(1)}`).join('');
  // explicit width/height so every browser (Safari included) knows how big to draw it
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(W * scale)}" height="${Math.round(H * scale)}" viewBox="0 0 ${W.toFixed(1)} ${H.toFixed(1)}"><rect width="100%" height="100%" fill="#fff"/>` +
    `<path d="${d}" fill="none" stroke="#000" stroke-width="${o.weight}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
function renderSigil() {
  const box = $('#sgPreview'), list = $('#sgList');
  if (!sigilSnapshot) { box.innerHTML = '<p class="skipped">Press <b>Make sigil</b> to build one from your current sentence.</p>'; list.innerHTML = ''; return; }
  const svg = sigilSVG();
  // shown as an <img> of the SVG: sized reliably in every browser
  box.innerHTML = svg ? `<img class="sgimg" alt="Sigil made from your sentence" src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}">` : '<p class="skipped">None of these symbols are made only of straight lines, so there is nothing to build from. Try words like <i>I</i>, <i>we</i>, <i>person</i>, <i>house</i>, <i>big</i> or <i>work</i>.</p>';
  list.innerHTML = sigilSnapshot.map((x, i) =>
    `<span class="sgi ${x.straight ? 'use' : 'skip'}" title="${x.straight ? 'used' : 'skipped: has curves'}">${i + 1}. ${esc(x.label)}${x.straight ? '' : ' (curved, skipped)'}</span>`).join('');
  $('#sgDl').hidden = !svg;
}
function svgToPNG(svg, name) {
  const img = new Image();
  img.onload = () => {
    const k = 2, c = document.createElement('canvas'); c.width = img.width * k; c.height = img.height * k;
    const g = c.getContext('2d'); g.scale(k, k); g.drawImage(img, 0, 0);
    c.toBlob(b => download(name, b), 'image/png');
  };
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

// BCI word-type colours, as light tints for box backgrounds
const BOX_FILL = { YELLOW: '#fff1b8', RED: '#ffd9d4', GREEN: '#d8f0da', BLUE: '#d6e6fb', WHITE: '#ffffff', GRAY: '#eceef2' };
function exportOpts() {
  return {
    style: $('#exStyle').value,
    label: $('#exLabel').value,            // above | below | none
    colour: $('#exColour').checked,
    perRow: Math.max(1, Math.min(30, +$('#exPerRow').value || 8)),
    rows: +$('#exRows').value || 32,
    fill: $('#exFill').value || 'o',
    view: document.querySelector('input[name=exView]:checked')?.value || 'image',
  };
}
function symG(e, ind, x, y, scale) {
  return `<g transform="translate(${x} ${y}) scale(${scale}) translate(0 ${-VB_Y})"><g fill="none" stroke="#000" stroke-width="${e.sw}" stroke-linecap="round" stroke-linejoin="round">${symInner(e, ind)}</g></g>`;
}
function wrapLabel(t, maxChars) {
  const words = t.split(' '), lines = [''];
  for (const w of words) {
    const cur = lines[lines.length - 1];
    if (!cur || (cur + ' ' + w).length <= maxChars) lines[lines.length - 1] = cur ? cur + ' ' + w : w;
    else lines.push(w);
  }
  if (lines.length > 2) { lines.length = 2; lines[1] = lines[1].slice(0, maxChars - 1) + '…'; }
  return lines;
}
function sentenceSVG(o = exportOpts()) {
  return o.style === 'boxes' ? boxesSVG(o) : stripSVG(o);
}
function stripSVG(o) {
  const items = resolved.filter(x => x.r && x.r.e);
  const withGloss = o.label !== 'none';
  const scale = 0.5, gap = 14, pad = 20, symH = VB_H * scale, glH = withGloss ? 22 : 0;
  const top = o.label === 'above' ? glH : 0;
  let x = pad; const parts = [];
  for (const { s, r } of items) {
    const w = r.e.w * scale;
    parts.push(symG(r.e, r.ind, x, pad + top, scale));
    if (withGloss && s.type !== 'punct') {
      const ty = o.label === 'above' ? pad + 12 : pad + symH + 16;
      parts.push(`<text x="${x + w / 2}" y="${ty}" font-family="Arial,Helvetica,sans-serif" font-size="12" fill="#333" text-anchor="middle">${esc(glossFor(s, r))}</text>`);
    }
    x += w + gap;
  }
  const W = Math.max(x - gap + pad, 100), H = pad * 2 + symH + glH;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="100%" height="100%" fill="#fff"/>${parts.join('')}</svg>`;
}
// communication-board style: equal square boxes, word label, optional word-type colour
function boxesSVG(o) {
  const items = resolved.filter(x => x.r && x.r.e && x.s.type !== 'punct');
  const S = 140, gap = 6, pad = 16, inner = 12;
  const hasLabel = o.label !== 'none', fs = 13, lineH = 15;
  const cols = Math.min(o.perRow, Math.max(items.length, 1)), rows = Math.ceil(items.length / cols) || 1;
  const parts = [];
  items.forEach(({ s, r }, i) => {
    const cx = pad + (i % cols) * (S + gap), cy = pad + Math.floor(i / cols) * (S + gap);
    const fill = o.colour ? (BOX_FILL[r.e.pos] || '#fff') : '#fff';
    parts.push(`<rect x="${cx}" y="${cy}" width="${S}" height="${S}" rx="6" fill="${fill}" stroke="#222" stroke-width="1.5"/>`);
    const lines = hasLabel ? wrapLabel(glossFor(s, r), 17) : [];
    const labH = hasLabel ? lines.length * lineH + 6 : 0;
    const availW = S - inner * 2, availH = S - inner * 2 - labH;
    const scale = Math.min(availW / r.e.w, availH / VB_H);
    const sw = r.e.w * scale, sh = VB_H * scale;
    const sx = cx + (S - sw) / 2;
    const sy = o.label === 'above' ? cy + inner + labH + (availH - sh) / 2 : cy + inner + (availH - sh) / 2;
    parts.push(symG(r.e, r.ind, sx, sy, scale));
    lines.forEach((ln, k) => {
      const ty = o.label === 'above' ? cy + inner + fs + k * lineH - 2 : cy + S - inner - (lines.length - 1 - k) * lineH - 3;
      parts.push(`<text x="${cx + S / 2}" y="${ty}" font-family="Arial,Helvetica,sans-serif" font-size="${fs}" font-weight="600" fill="#1d2330" text-anchor="middle">${esc(ln)}</text>`);
    });
  });
  const W = pad * 2 + cols * S + (cols - 1) * gap, H = pad * 2 + rows * S + (rows - 1) * gap;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="100%" height="100%" fill="#fff"/>${parts.join('')}</svg>`;
}
function renderExportPreview() {
  const box = $('#exPreview'); if (!box) return;
  const o = exportOpts();
  $('#exBoxOpts').hidden = o.style !== 'boxes';
  $('#exTextOpts').hidden = o.view !== 'text';
  const has = resolved.some(x => x.r && x.r.e);
  if (o.view === 'text') {
    const t = has ? asciiArt(o) : '';
    box.innerHTML = `<pre class="ascii">${esc(t)}</pre>`;
  } else box.innerHTML = has ? sentenceSVG(o) : '';
}
function download(name, blob) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
function toPNG() {
  const svg = sentenceSVG();
  const img = new Image();
  img.onload = () => {
    const k = 3, c = document.createElement('canvas'); c.width = img.width * k; c.height = img.height * k;
    const g = c.getContext('2d'); g.scale(k, k); g.drawImage(img, 0, 0);
    c.toBlob(b => download(exportOpts().style === 'boxes' ? 'bliss-boxes.png' : 'bliss-sentence.png', b), 'image/png');
  };
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

// ---------- events ----------
function bind() {
  let timer;
  $('#inputForm').addEventListener('submit', ev => { ev.preventDefault(); translate(); });
  $('#src').addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(translate, 450); });
  document.querySelectorAll('.ex').forEach(b => b.addEventListener('click', () => { $('#src').value = b.textContent; translate(); }));
  document.querySelectorAll('.tabs button').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('.tabs button').forEach(x => x.setAttribute('aria-selected', x === b));
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('on', t.id === 'tab-' + b.dataset.tab));
    if (b.dataset.tab === 'browse') renderGrid();
  }));
  $('#optGender').addEventListener('change', e => { askGender = e.target.checked; render(); });

  $('#strip').addEventListener('click', ev => {
    const t = ev.target.closest('.tok'); if (!t) return;
    ev.stopPropagation();
    if (t.dataset.key === popKey) closePop(); else openPop(t.dataset.key);
  });
  $('#pop').addEventListener('click', ev => {
    ev.stopPropagation();
    if (ev.target.closest('[data-close]')) { closePop(); return; }
    const nx = ev.target.closest('[data-next]'); if (nx) { openPop(nx.dataset.next); return; }
    const ok = ev.target.closest('[data-confirm]');
    if (ok) {   // user agrees with the program's guess → green
      const s = slots.find(x => x.key === ok.dataset.confirm);
      if (s) s.ans.ok = 1;
      closePop(); render(); return;
    }
    const o = ev.target.closest('.o'); if (!o) return;
    const s = slots.find(x => x.key === o.dataset.key); if (!s) return;
    if (o.dataset.pick) { replaceWord(s, +o.dataset.pick); return; }
    const q = o.dataset.q; let v = o.dataset.v;
    if (q === 'sense') v = +v;
    s.ans[q] = v;
    if (q === 'kind') delete s.ans.sense;
    if (q === 'pt') delete s.ans.gender;
    render();
  });
  $('#pop').addEventListener('input', ev => {
    const k = ev.target.dataset.find; if (!k) return;
    document.querySelector(`[data-findres="${CSS.escape(k)}"]`).innerHTML = findHTML(ev.target.value, k);
  });
  document.addEventListener('click', ev => { if (popKey && !ev.target.closest('#pop') && !ev.target.closest('.tok')) closePop(); });
  document.addEventListener('keydown', ev => { if (ev.key === 'Escape' && popKey) closePop(); });
  window.addEventListener('resize', () => placePop());
  $('#dlSvg').addEventListener('click', () => download(exportOpts().style === 'boxes' ? 'bliss-boxes.svg' : 'bliss-sentence.svg', new Blob([sentenceSVG()], { type: 'image/svg+xml' })));
  $('#dlPng').addEventListener('click', toPNG);
  ['exStyle', 'exLabel', 'exColour', 'exPerRow', 'exRows', 'exFill'].forEach(id => $('#' + id).addEventListener('input', renderExportPreview));
  document.querySelectorAll('input[name=exView]').forEach(r => r.addEventListener('change', renderExportPreview));
  $('#sgMake').addEventListener('click', () => { takeSigilSnapshot(); renderSigil(); });
  ['sgOverlap', 'sgMirror', 'sgSpine', 'sgEnds', 'sgWeight', 'sgPerCol'].forEach(id => $('#' + id).addEventListener('input', renderSigil));
  $('#sgSvg').addEventListener('click', () => download('bliss-sigil.svg', new Blob([sigilSVG(sigilOpts(), 1.5)], { type: 'image/svg+xml' })));
  $('#sgPng').addEventListener('click', () => svgToPNG(sigilSVG(sigilOpts(), 1.5), 'bliss-sigil.png'));
  $('#dlTxt').addEventListener('click', () => {
    const o = exportOpts();
    download(o.style === 'boxes' ? 'bliss-boxes.txt' : 'bliss-sentence.txt', new Blob([asciiArt(o)], { type: 'text/plain;charset=utf-8' }));
  });
  $('#copyTxt').addEventListener('click', async () => {
    const t = asciiArt();
    try { await navigator.clipboard.writeText(t); $('#copyTxt').textContent = 'Copied!'; setTimeout(() => $('#copyTxt').textContent = 'Copy text art', 1400); }
    catch { const ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
  });
  $('#copyGloss').addEventListener('click', async () => {
    const txt = resolved.filter(x => x.r && x.r.e && x.s.type !== 'punct').map(x => glossFor(x.s, x.r)).join(' · ');
    try { await navigator.clipboard.writeText(txt); $('#copyGloss').textContent = 'Copied!'; setTimeout(() => $('#copyGloss').textContent = 'Copy word-by-word meaning', 1400); } catch { prompt('Copy this:', txt); }
  });

  $('#q').addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(renderGrid, 200); });
  $('#grid').addEventListener('click', ev => { const c = ev.target.closest('.cell'); if (c) showDetail(+c.dataset.id); });
  $('#detail').addEventListener('click', ev => {
    if (ev.target.matches('[data-close]') || ev.target === $('#detail')) $('#detail').close();
    const add = ev.target.closest('[data-add]');
    if (add) {
      $('#detail').close();
      $('#src').value = ($('#src').value.trim() + ' #' + add.dataset.add).trim();
      document.querySelector('.tabs button[data-tab=translate]').click();
      translate();
    }
  });
  // legend
  $('#legend').innerHTML = Object.entries(KIND_NAME).map(([k, v]) => `<span><span class="dot" style="background:var(--c-${k})"></span>${v}</span>`).join('');
}

// swap an unknown (or any) word in the input for a picked symbol id, keeping other answers
function replaceWord(s, id) {
  const toks = tokenize($('#src').value);
  const i = +s.key.split('|')[0];
  toks[i] = '#' + id;
  $('#src').value = toks.join(' ').replace(/\s+([.,!?])/g, '$1');
  answers.set(`${i}|#${id}`, { picked: id });
  popKey = null;
  translate();
}

// ---------- boot ----------
async function boot() {
  bind();
  $('#status').hidden = false; $('#status').textContent = 'Loading 6,000+ symbols…';
  try {
    // single-file build embeds the data in the page; otherwise load it from data/bliss.json
    const embedded = document.getElementById('bliss-data');
    if (embedded) DATA = JSON.parse(embedded.textContent);
    else DATA = await (await fetch('data/bliss.json')).json();
    buildIndex();
    $('#status').hidden = true;
    const qp = new URLSearchParams(location.search).get('q');
    if (qp) { $('#src').value = qp; translate(); }
  } catch (err) {
    $('#status').textContent = 'Could not load the symbol data. If you opened index.html straight from your computer, run a small local server instead (see README).';
  }
}
boot();
// exposed for testing
window.__bliss = { sigilSVG, takeSigilSnapshot, get sigilSnapshot() { return sigilSnapshot; }, buildSlots: t => buildSlots(t), resolve, get slots() { return slots; }, rasterSymbol, BYID: () => BYID, asciiArt };
})();
