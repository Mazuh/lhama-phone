import reduce from 'lodash.reduce';
import { HistoryState } from "../redux/history";
import { PreferencesState } from "../redux/preferences";
import { ContactsState } from '../redux/contacts';

const profilesStorageKey = 'profiles';

export interface ProfileContent {
  history: HistoryState;
  preferences: PreferencesState;
  contacts: ContactsState;
}

function getStorageKey(profile: string): string {
  return `profile: ${profile}`;
}

export function retrieveProfileList(): Array<string> {
  console.log('[profiles] Retrieving list using key', profilesStorageKey);
  const serialized = localStorage.getItem(profilesStorageKey);
  if (!serialized) {
    return [];
  }

  const parsed = JSON.parse(serialized);
  if (!Array.isArray(parsed) || !parsed.length) {
    return [];
  }

  return parsed;
}

export function persistProfileList(profiles: Array<string>): void {
  console.log('[profiles] Storing list at key', profilesStorageKey);
  const serialized = JSON.stringify(profiles);
  localStorage.setItem(profilesStorageKey, serialized);
}

export function retrieveProfileContent(profile: string): ProfileContent|null {
  const storageKey = getStorageKey(profile); 
  console.log('[profiles] Retrieving from key', storageKey);

  const serialized = localStorage.getItem(storageKey);
  if (!serialized) {
    return null;
  }

  const parsed = JSON.parse(serialized);
  const parsedWithDateTypes = reduce(parsed, (acc, data, key) => {
    if (key === 'history') {
      return {
        ...acc,
        [key]: {
          ...data,
          logs: data.logs.map((log: any) => ({ ...log, startedAt: new Date(log.startedAt) })),
        },
      };
    }

    return { ...acc, [key]: data };
  }, {});
  return parsedWithDateTypes as ProfileContent;
}

export function persistProfileContent(content: ProfileContent): void {
  const profile = content.preferences.name;
  const storageKey = getStorageKey(profile);
  console.log('[profiles] Storing at key', storageKey);

  const serialized = JSON.stringify(content);
  localStorage.setItem(storageKey, serialized);
}

export function purgePersistedProfile(profile: string): void {
  const profiles = retrieveProfileList();
  const updatedProfiles = profiles.filter(it => it !== profile);
  console.log('[profiles] About to persist updated list without profile', profile);
  persistProfileList(updatedProfiles);

  const storageKey = getStorageKey(profile);
  console.log('[profiles] Removing profile by key', storageKey);
  localStorage.removeItem(storageKey);
}
