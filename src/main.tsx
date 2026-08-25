import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { PlatformProvider } from './platform/PlatformContext';
import { createBrowserPlatform } from './platform/browser';
import { createElectronPlatform } from './platform/electron';
import { isElectron } from './platform/detect';
import { registerAssetCache } from './platform/browser/assetCache';
import { applyBranding } from './config/appConfig';
import { initTheme } from './store/themeStore';
import { watchSystemTheme } from './store/themeMode';
import { hydrateSettings } from './store/settingsStore';
import { ConfirmProvider } from './ui/Confirm';
import './styles/index.css';

applyBranding();
initTheme();
watchSystemTheme();
registerAssetCache();

const platform = isElectron() ? createElectronPlatform() : createBrowserPlatform();

// Preferences live in IndexedDB. Hydration is not awaited: an IndexedDB read
// would delay first paint, and nothing on the first screen depends on these
// values. Writes only start once the read lands, so no clobbering.
void hydrateSettings(platform.repo);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PlatformProvider platform={platform}>
      <ConfirmProvider>
        <App />
      </ConfirmProvider>
    </PlatformProvider>
  </StrictMode>,
);
