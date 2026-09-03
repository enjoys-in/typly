import type { DeviceSync } from '../ports';
import { SYNC_OFF, type SyncState } from '@/core/sync/lan';

const noop = () => {};

/**
 * A browser tab cannot listen on a port, so there is nothing for another device
 * to connect to. Every call is inert and `available()` is false, which lets the
 * Settings card explain that this one needs the desktop app instead of
 * offering a button that could not work.
 */
export class BrowserDeviceSync implements DeviceSync {
  available(): boolean {
    return false;
  }
  start(): Promise<SyncState> {
    return Promise.resolve(SYNC_OFF);
  }
  stop(): Promise<void> {
    return Promise.resolve();
  }
  onState(): () => void {
    return noop;
  }
  onIncoming(): () => void {
    return noop;
  }
}
