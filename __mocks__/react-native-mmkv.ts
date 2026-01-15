// src/lib/__mocks__/react-native-mmkv.ts - Manual mock for MMKV

export class MMKV {
  private storage = new Map<string, string>();

  constructor(config?: { id?: string; encryptionKey?: string }) {
    // No-op en tests
  }

  set(key: string, value: string | number | boolean): void {
    this.storage.set(key, String(value));
  }

  getString(key: string): string | undefined {
    return this.storage.get(key);
  }

  getNumber(key: string): number | undefined {
    const value = this.storage.get(key);
    return value !== undefined ? Number(value) : undefined;
  }

  getBoolean(key: string): boolean {
    return this.storage.get(key) === 'true';
  }

  delete(key: string): void {
    this.storage.delete(key);
  }

  getAllKeys(): string[] {
    return Array.from(this.storage.keys());
  }

  clearAll(): void {
    this.storage.clear();
  }

  contains(key: string): boolean {
    return this.storage.has(key);
  }
}
