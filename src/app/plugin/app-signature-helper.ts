// app-signature-helper.ts
import { registerPlugin } from '@capacitor/core';

export interface AppSignatureHelperPlugin {
  getAppSignatures(): Promise<{ hashes: string[] }>;
}

const AppSignatureHelper = registerPlugin<AppSignatureHelperPlugin>('AppSignatureHelper');

export default AppSignatureHelper;
