import type { DeviceSync } from '../ports';
import type { BackupBundle } from '@/core/types';
import { isBackupBundle, isSyncState, SYNC_OFF, type SyncState } from '@/core/sync/lan';

const noop = () => {};

/**
 * Local-network sync, over the preload bridge.
 *
 * The bundle crosses to the main process as a string so it can be served
 * byte-for-byte, and everything coming back is re-validated here: the main
 * process is trusted, but what it forwards came off a network, and the renderer
 * is the side that would hand it to the database.
 */
export class ElectronDeviceSync implements DeviceSync {
  available(): boolean {
    return Boolean(window.bridge?.sync);
  }

  async start(bundle: BackupBundle, lang: string): Promise<SyncState> {
    const sync = window.bridge?.sync;
    if (!sync) return SYNC_OFF;
    const state = await sync.start(JSON.stringify(bundle), lang);
    return isSyncState(state) ? state : { kind: 'error', message: 'unavailable' };
  }

  async stop(): Promise<void> {
    await window.bridge?.sync?.stop();
  }

  onState(handler: (state: SyncState) => void): () => void {
    const sync = window.bridge?.sync;
    if (!sync) return noop;
    return sync.onState((state) => {
      if (isSyncState(state)) handler(state);
    });
  }

  onIncoming(handler: (bundle: BackupBundle) => void): () => void {
    const sync = window.bridge?.sync;
    if (!sync) return noop;
    return sync.onIncoming((bundle) => {
      if (isBackupBundle(bundle)) handler(bundle);
    });
  }
}
