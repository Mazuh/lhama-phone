import { Contact } from "../redux/contacts";

const rNotAlphaNumeric = /[^a-z0-9]/g;
const rQuotes = /['"]/g;

const clearPhone = (phone: string): string => phone.replace(rNotAlphaNumeric, '');

export function findByPhone(phone: string,
                            contacts: Array<Contact>,
                            forceEqual: boolean = false): Contact|null {
  const clearedSearch = clearPhone(phone);
  if (!clearedSearch) {
    return null;
  }

  const canBeJustSimilar = !forceEqual && clearedSearch.length > 6;
  return contacts.find((it) => {
    const clearedTarget = clearPhone(it.phone);
    if (!clearedTarget) {
      return false;
    }

    const isEqual = clearedSearch === clearedTarget;
    if (isEqual) {
      return true;
    }

    if (!canBeJustSimilar) {
      return isEqual;
    }

    const sizeDiff = Math.abs(clearedTarget.length - clearedSearch.length);
    const isSimilarSize = sizeDiff > 1 && sizeDiff < 6;
    const isSimilarEnd = clearedSearch.endsWith(clearedTarget) ||
                         clearedTarget.endsWith(clearedSearch);
    const isSimilar = isSimilarSize && isSimilarEnd;
    return isSimilar;
  }) || null;
}

export function clearToAdd(phoneOrName: string): string {
  return phoneOrName.trim().replace(rQuotes, '');
}
