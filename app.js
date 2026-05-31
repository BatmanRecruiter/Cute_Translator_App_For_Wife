/* Crystyl Translator — vanilla JS, no storage */
(function () {
  'use strict';

  // ---------- DOM ----------
  const inputEl   = document.getElementById('input-text');
  const outputEl  = document.getElementById('output-text');
  const detEl     = document.getElementById('detected');
  const statusEl  = document.getElementById('status');
  const btnT      = document.getElementById('btn-translate');
  const btnC      = document.getElementById('btn-copy');
  const btnX      = document.getElementById('btn-clear');
  const quoteText = document.getElementById('quote-text');
  const quoteCite = document.getElementById('quote-cite');

  // Ensure input is blank on every open (no persistence anyway).
  inputEl.value = '';
  outputEl.dataset.text = '';

  // ---------- Random quote on each open ----------
  function pickQuote() {
    const list = window.CRYSTYL_QUOTES || [];
    if (!list.length) return;
    const q = list[Math.floor(Math.random() * list.length)];
    quoteText.textContent = `“${q.text}”`;
    quoteCite.textContent = '— ' + q.cite;
  }
  pickQuote();

  // ---------- Language detection ----------
  // Heuristic: presence of Spanish-specific characters / diacritics / words.
  const SPANISH_CHARS = /[ñáéíóúüÑÁÉÍÓÚÜ¿¡]/;
  const SPANISH_WORDS = new Set([
    'el','la','los','las','un','una','unos','unas',
    'y','o','pero','porque','que','qué','como','cómo','cuando','cuándo',
    'donde','dónde','quien','quién',
    'es','soy','eres','somos','son','está','estoy','estás','estamos','están',
    'estuve','estuvo','fue','fui','fueron',
    'no','sí','muy','más','menos','también','tambien','tanto','solo','sólo',
    'me','te','se','le','les','nos','mi','tu','su','sus','tus','mis',
    'mucho','mucha','muchos','muchas','poco','poca','pocos','pocas',
    'hola','gracias','amor','cariño','carino','linda','hermosa','bella','preciosa',
    'guapa','bonita','quiero','quieres','quiere','quieren','besos','abrazo','abrazos',
    'extraño','extrano','de','del','con','sin','para','por','en','al',
    'hoy','mañana','manana','ayer','ahora','siempre','nunca',
    'gracias','buenos','buenas','noche','noches','dia','día','días','dias',
    'voy','vas','va','vamos','van','tengo','tienes','tiene','tenemos','tienen',
    'hacer','hago','haces','hace','hacemos','hacen','puedo','puedes','puede',
  ]);
  const ENGLISH_WORDS = new Set([
    'the','a','an','and','or','but','because','that','what','how','when',
    'where','who','is','am','are','was','were','be','been','being',
    'i','you','he','she','we','they','it','my','your','his','her','our','their',
    'me','him','us','them',
    'not','no','yes','very','more','less','also','too','so','only',
    'much','many','few','little',
    'hello','hi','hey','thanks','thank','love','baby','beautiful','pretty','smart',
    'miss','want','need','have','has','had','do','does','did','will','would',
    'can','could','should','today','tomorrow','yesterday','now','always','never',
    'good','morning','night','day','goodnight','goodmorning',
    'go','going','went','make','made','get','got','take','took',
  ]);

  function detectLang(text) {
    const t = (text || '').trim();
    if (!t) return null;
    if (SPANISH_CHARS.test(t)) return 'es';
    const tokens = t.toLowerCase().match(/[a-záéíóúüñ']+/gi) || [];
    let es = 0, en = 0;
    for (const tok of tokens) {
      if (SPANISH_WORDS.has(tok)) es++;
      if (ENGLISH_WORDS.has(tok)) en++;
    }
    if (es === 0 && en === 0) return 'en'; // safe default for short greetings
    return es > en ? 'es' : 'en';
  }

  function updateDetected() {
    const lang = detectLang(inputEl.value);
    if (!lang) { detEl.textContent = ''; return; }
    detEl.textContent = lang === 'es'
      ? 'Detected: Spanish → English'
      : 'Detected: English → Mexican Spanish';
  }
  inputEl.addEventListener('input', updateDetected);

  // ---------- Translation via MyMemory (free, no auth, CORS) ----------
  // Docs: https://mymemory.translated.net/doc/spec.php
  // We use es-MX <-> en-US to bias toward Mexican Spanish.
  async function translate(text, source, target) {
    const url = new URL('https://api.mymemory.translated.net/get');
    url.searchParams.set('q', text);
    url.searchParams.set('langpair', `${source}|${target}`);
    // de=<email> raises the free quota; optional. Omit to keep things anonymous.

    const res = await fetch(url.toString(), { method: 'GET' });
    if (!res.ok) throw new Error('Network error (' + res.status + ')');
    const data = await res.json();
    if (data.responseStatus && Number(data.responseStatus) >= 400) {
      throw new Error(data.responseDetails || 'Translation failed');
    }
    const out = (data.responseData && data.responseData.translatedText) || '';
    if (!out) throw new Error('Empty translation');
    // MyMemory sometimes returns HTML-escaped text; decode common entities.
    return decodeEntities(out);
  }

  function decodeEntities(s) {
    const txt = document.createElement('textarea');
    txt.innerHTML = s;
    return txt.value;
  }

  // ---------- UI handlers ----------
  function setStatus(msg, kind) {
    statusEl.textContent = msg || '';
    statusEl.classList.remove('error', 'success');
    if (kind) statusEl.classList.add(kind);
  }

  function setOutput(text) {
    outputEl.dataset.text = text || '';
    if (!text) {
      outputEl.innerHTML = '<span class="placeholder">Your translation will appear here ✨</span>';
      btnC.disabled = true;
    } else {
      outputEl.textContent = text;
      btnC.disabled = false;
    }
  }

  async function onTranslate() {
    const text = inputEl.value.trim();
    if (!text) {
      setStatus('Type something first ✨', 'error');
      inputEl.focus();
      return;
    }
    const lang = detectLang(text);
    const source = lang === 'es' ? 'es-MX' : 'en-US';
    const target = lang === 'es' ? 'en-US' : 'es-MX';

    btnT.classList.add('is-loading');
    btnT.disabled = true;
    setStatus('Translating…');
    try {
      const out = await translate(text, source, target);
      setOutput(out);
      setStatus(lang === 'es'
        ? 'Translated to casual English'
        : 'Translated to Mexican Spanish', 'success');
    } catch (err) {
      console.error(err);
      setOutput('');
      setStatus('Could not translate — check your connection and try again.', 'error');
    } finally {
      btnT.classList.remove('is-loading');
      btnT.disabled = false;
    }
  }

  async function onCopy() {
    const text = outputEl.dataset.text || '';
    if (!text) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older iOS Safari / non-secure contexts
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      btnC.classList.remove('copied-flash');
      // re-trigger animation
      void btnC.offsetWidth;
      btnC.classList.add('copied-flash');
      setStatus('Copied — paste it in iMessage 💛', 'success');
    } catch (err) {
      console.error(err);
      setStatus('Copy failed — long-press the text to copy manually.', 'error');
    }
  }

  function onClear() {
    inputEl.value = '';
    setOutput('');
    setStatus('');
    detEl.textContent = '';
    inputEl.focus();
  }

  btnT.addEventListener('click', onTranslate);
  btnC.addEventListener('click', onCopy);
  btnX.addEventListener('click', onClear);

  // Cmd/Ctrl+Enter to translate
  inputEl.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      onTranslate();
    }
  });
})();
