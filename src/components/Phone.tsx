import React from 'react';
import { connect } from 'react-redux';
import { findByPhone } from '../utils/contacts';
import { ContactsState } from '../redux/contacts';

interface PhoneProps {
  children: string;
  contacts?: ContactsState;
}

const Phone: React.FC<PhoneProps> = ({ children, contacts }) => {
  const original = children;
  const contact = findByPhone(original, contacts!.entries);
  const name = contact ? contact.name : '';
  const phone = contact ? contact.phone : '';
  const description = contact ? (
    `Phone found as "${phone}" of "${name || '?'}", but originally: ${original}`
  ) : (
    'No assigned contact'
  );

  return (
    <span title={description}>
      {name || phone || original}<br />{(name || phone) && `(${original})`}
    </span>
  );
};

const mapStateToProps = ({ contacts }: any): any => {
  return {
    contacts,
  };
};

export default connect(mapStateToProps)(Phone);
