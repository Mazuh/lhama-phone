type ContactsAction = (
  | { type: 'SET_CONTACTS', state: ContactsState }
  | { type: 'ADD_CONTACT', contact: Contact }
  | { type: 'EDIT_CONTACT', contact: Contact }
  | { type: 'REMOVE_CONTACT', uuid: string }
);

export interface Contact {
  uuid: string;
  name: string;
  phone: string;
}

export function setContacts(state: ContactsState): ContactsAction {
  return { type: 'SET_CONTACTS', state };
}

export function addContact(contact: Contact): ContactsAction {
  return { type: 'ADD_CONTACT', contact };
}

export function editContact(contact: Contact): ContactsAction {
  return { type: 'EDIT_CONTACT', contact };
}

export function removeContact(contact: Contact): ContactsAction {
  return { type: 'REMOVE_CONTACT', uuid: contact.uuid };
}

export interface ContactsState {
  entries: Array<Contact>;
}

const initialState: ContactsState = {
  entries: [],
}

export default function (state = initialState, action: ContactsAction): ContactsState {
  switch (action.type) {
    case 'SET_CONTACTS':
      return { ...state, ...action.state };
    case 'ADD_CONTACT':
      return { ...state, entries: [ ...state.entries, action.contact ] };
    case 'EDIT_CONTACT':
      return {
        ...state,
        entries: state.entries.map(it => it.uuid === action.contact.uuid ? action.contact : it),
      };
    case 'REMOVE_CONTACT':
      return {
        ...state,
        entries: state.entries.filter(it => it.uuid !== action.uuid),
      };
    default:
      return state;
  }
}
