import type { FilePicker, PickedFile } from '../ports';
import { SourceType } from '@/core/constants';

const ACCEPT: Record<SourceType, string> = {
  [SourceType.Image]: 'image/png,image/jpeg,image/webp',
  [SourceType.Pdf]: 'application/pdf',
  [SourceType.Docx]: '.docx',
  [SourceType.Text]: '.txt,text/plain',
};

// File System Access is optional; fall back to a hidden <input type=file>.
export class BrowserFilePicker implements FilePicker {
  pick(kind: SourceType): Promise<PickedFile | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = ACCEPT[kind];
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return resolve(null);
        const bytes = new Uint8Array(await file.arrayBuffer());
        resolve({ name: file.name, bytes });
      };
      input.click();
    });
  }
}
