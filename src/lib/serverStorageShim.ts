const memoryStorage = new Map<string, string>();

function createStorageShim(): Storage {
  return {
    get length() {
      return memoryStorage.size;
    },
    clear() {
      memoryStorage.clear();
    },
    getItem(key: string) {
      return memoryStorage.get(String(key)) ?? null;
    },
    key(index: number) {
      return Array.from(memoryStorage.keys())[index] ?? null;
    },
    removeItem(key: string) {
      memoryStorage.delete(String(key));
    },
    setItem(key: string, value: string) {
      memoryStorage.set(String(key), String(value));
    },
  };
}

function hasUsableLocalStorage(): boolean {
  try {
    return (
      typeof globalThis.localStorage !== 'undefined' &&
      typeof globalThis.localStorage.getItem === 'function' &&
      typeof globalThis.localStorage.setItem === 'function' &&
      typeof globalThis.localStorage.removeItem === 'function'
    );
  } catch {
    return false;
  }
}

if (typeof window === 'undefined' && !hasUsableLocalStorage()) {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: createStorageShim(),
  });
}
