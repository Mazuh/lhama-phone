const loggedInStorageKey = 'logged in';

export function persistLogin(): void {
  sessionStorage.setItem(loggedInStorageKey, Date.now().toString());
}

export function persistLogout(): void {
  sessionStorage.removeItem(loggedInStorageKey);
}

export function retrieveIsLoggedIn(): boolean {
  return !!sessionStorage.getItem(loggedInStorageKey);
}
