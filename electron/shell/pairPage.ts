import { BACKUP_PATH, TOKEN_PARAM } from '../../src/core/sync/lan';

/**
 * The page the other device sees after scanning the QR code.
 *
 * It is served by the desktop app itself over the local network, so it has to
 * be self-contained: no fonts, no scripts, no images from anywhere else. Two
 * things to do — take this device's data, or hand it some — and enough words to
 * make clear which direction each one is.
 */

type Key =
  | 'title'
  | 'lead'
  | 'pull'
  | 'pullHint'
  | 'push'
  | 'pushHint'
  | 'send'
  | 'sending'
  | 'sent'
  | 'failed'
  | 'expiry';

const COPY: Record<string, Record<Key, string>> = {
  en: {
    title: 'Typly · connected',
    lead: 'You are talking to Typly on the local network. Nothing here leaves your Wi-Fi.',
    pull: 'Download the data',
    pullHint:
      "Saves a backup of the other device's tests, paragraphs and settings. Open Typly here, then use Settings → Restore to bring it in.",
    push: 'Send data to that device',
    pushHint: 'Pick a Typly backup file and it will be restored on the device showing the QR code.',
    send: 'Send',
    sending: 'Sending…',
    sent: 'Sent — check the other device, it will say what was restored.',
    failed: 'That did not go through. Make sure it is a Typly backup file, then try again.',
    expiry: 'This link stops working when the pairing window closes.',
  },
  hi: {
    title: 'Typly · जुड़ गया',
    lead: 'आप स्थानीय नेटवर्क पर Typly से जुड़े हैं। यहाँ का डेटा आपके Wi-Fi से बाहर नहीं जाता।',
    pull: 'डेटा डाउनलोड करें',
    pullHint:
      'दूसरे डिवाइस के टेस्ट, अनुच्छेद और सेटिंग्स का बैकअप सहेजता है। यहाँ Typly खोलें, फिर सेटिंग्स → पुनर्स्थापित करें से इसे लाएँ।',
    push: 'उस डिवाइस पर डेटा भेजें',
    pushHint: 'कोई Typly बैकअप फ़ाइल चुनें — वह QR कोड दिखा रहे डिवाइस पर पुनर्स्थापित हो जाएगी।',
    send: 'भेजें',
    sending: 'भेजा जा रहा है…',
    sent: 'भेज दिया गया — दूसरा डिवाइस देखें, वहाँ बताया जाएगा कि क्या पुनर्स्थापित हुआ।',
    failed: 'यह नहीं भेजा जा सका। पक्का करें कि यह Typly बैकअप फ़ाइल है, फिर दोबारा कोशिश करें।',
    expiry: 'पेयरिंग विंडो बंद होते ही यह लिंक काम करना बंद कर देगा।',
  },
};

function copyFor(lang: string): Record<Key, string> {
  return COPY[lang] ?? (COPY.en as Record<Key, string>);
}

const STYLE = `
  :root { color-scheme: dark }
  * { box-sizing: border-box }
  body { margin: 0; padding: 28px 20px 48px; background: #0b0b0f; color: #fff;
    font: 15px/1.55 -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif }
  main { max-width: 30rem; margin: 0 auto }
  h1 { font-size: 19px; margin: 0 0 6px }
  p.lead { color: #a1a1aa; margin: 0 0 26px }
  section { border: 1px solid #26262d; border-radius: 14px; padding: 18px; margin-bottom: 16px;
    background: #12131a }
  h2 { font-size: 15px; margin: 0 0 6px }
  p.hint { color: #8b8b95; font-size: 13px; margin: 0 0 14px }
  a.action, button { display: block; width: 100%; padding: 13px 16px; border: 0; cursor: pointer;
    border-radius: 10px; background: linear-gradient(135deg, #22c55e, #0d9488); color: #fff;
    font: inherit; font-weight: 600; text-align: center; text-decoration: none }
  button[disabled] { opacity: .6 }
  input[type=file] { width: 100%; margin-bottom: 12px; color: #a1a1aa; font: inherit; font-size: 13px }
  p.state { margin: 12px 0 0; font-size: 13px; color: #a1a1aa; min-height: 1.2em }
  footer { color: #6f7280; font-size: 12px; text-align: center; margin-top: 26px }
`;

/** The pairing page, with the token carried into both actions. */
export function pairPageHtml(token: string, lang: string): string {
  const t = copyFor(lang);
  const endpoint = `${BACKUP_PATH}?${TOKEN_PARAM}=${encodeURIComponent(token)}`;

  return `<!doctype html>
<html lang="${lang === 'hi' ? 'hi' : 'en'}"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Typly</title>
<style>${STYLE}</style>
</head><body><main>
  <h1>${t.title}</h1>
  <p class="lead">${t.lead}</p>

  <section>
    <h2>${t.pull}</h2>
    <p class="hint">${t.pullHint}</p>
    <a class="action" href="${endpoint}" download>${t.pull}</a>
  </section>

  <section>
    <h2>${t.push}</h2>
    <p class="hint">${t.pushHint}</p>
    <input type="file" id="file" accept="application/json">
    <button type="button" id="send">${t.send}</button>
    <p class="state" id="state" role="status"></p>
  </section>

  <footer>${t.expiry}</footer>
<script>
  // Posted with fetch rather than as a form: a form would have to encode the
  // file into a field, and the server only ever wants the JSON itself.
  const file = document.getElementById('file');
  const send = document.getElementById('send');
  const state = document.getElementById('state');
  send.addEventListener('click', async () => {
    const picked = file.files && file.files[0];
    if (!picked) return;
    send.disabled = true;
    state.textContent = ${JSON.stringify(t.sending)};
    try {
      const response = await fetch(${JSON.stringify(endpoint)}, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: await picked.text(),
      });
      state.textContent = response.ok ? ${JSON.stringify(t.sent)} : ${JSON.stringify(t.failed)};
    } catch {
      state.textContent = ${JSON.stringify(t.failed)};
    }
    send.disabled = false;
  });
</script>
</main></body></html>`;
}
