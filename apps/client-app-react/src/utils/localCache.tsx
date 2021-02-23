  export function fetch(key: string): any {
    const value: any =
      localStorage.getItem(key) !== null
        ? localStorage.getItem(key)
        : null;

    return value;
  };

  export function store(key: string, value: string): void {
    localStorage.setItem(key, value);
  };

  export function clear(key: string): void {
    localStorage.removeItem(key);
  }