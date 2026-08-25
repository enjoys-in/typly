import { BrowserWindow } from 'electron';

const SPLASH_HTML = `<!doctype html><html><head><meta charset="utf-8"><style>
  html,body{margin:0;height:100%;display:flex;align-items:center;justify-content:center;
    background:#0b0b0f;color:#fff;font-family:-apple-system,system-ui,sans-serif;overflow:hidden}
  .box{text-align:center;animation:fade .5s ease}
  .logo{font-size:36px;font-weight:800;letter-spacing:-.02em;
    background:linear-gradient(135deg,#22c55e,#f97316);-webkit-background-clip:text;
    -webkit-text-fill-color:transparent;animation:pulse 1.4s ease-in-out infinite}
  .sub{margin-top:10px;font-size:11px;color:#8b8b95;letter-spacing:.16em;text-transform:uppercase}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
  @keyframes fade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
</style></head><body><div class="box">
  <div class="logo">Typly</div><div class="sub">Exam practice</div>
</div></body></html>`;

// Frameless splash shown immediately while the main window loads, then destroyed.
export function createSplash(): BrowserWindow {
  const splash = new BrowserWindow({
    width: 340,
    height: 220,
    frame: false,
    resizable: false,
    center: true,
    backgroundColor: '#0b0b0f',
    webPreferences: { contextIsolation: true, nodeIntegration: false },
  });
  void splash.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(SPLASH_HTML));
  return splash;
}
