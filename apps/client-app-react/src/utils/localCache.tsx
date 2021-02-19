

  export function fetchAdtUrl(): string {
    const stringValue: any =
      localStorage.getItem("adtUrl") !== null
        ? localStorage.getItem("adtUrl")
        : null;

    return stringValue;
  };

  export function storeAdtUrl(url: string): void {
    localStorage.setItem("adtUrl", url);
  };



