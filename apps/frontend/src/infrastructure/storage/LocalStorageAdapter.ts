export class LocalStorageAdapter {
  private static isClient(): boolean {
    return typeof window !== 'undefined';
  }

  static setItem(key: string, value: unknown): void {
    if (!this.isClient()) return;
    
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  static getItem<T>(key: string, defaultValue?: T): T | null {
    if (!this.isClient()) return defaultValue || null;
    
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue || null;
    }
  }

  static removeItem(key: string): void {
    if (!this.isClient()) return;
    
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }

  static clear(): void {
    if (!this.isClient()) return;
    
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  static exists(key: string): boolean {
    if (!this.isClient()) return false;
    
    return localStorage.getItem(key) !== null;
  }
}
