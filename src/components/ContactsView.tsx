import React from 'react';
import { Dispatch, AnyAction, bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ListGroup from 'react-bootstrap/ListGroup';
import { ContactsState, Contact, removeContact } from '../redux/contacts';
import IconButton from './dumb/IconButton';
import ContactForm from './ContactForm';

interface ContactsViewProps {
  contacts: ContactsState;
  removeContact: Function;
}

const ContactsView: React.FC<ContactsViewProps> = (props) => {
  const [uuidForVisibleOps, setUuidForVisibleOps] = React.useState<string|null>(null);
  const [isFormVisible, setFormVisible] = React.useState<boolean>(false);
  const [editing, setEditing] = React.useState<Contact|null>(null);
  const [removing, setRemoving] = React.useState<Contact|null>(null);

  const onClickToEnableOpsFn = (contact: Contact) => () => {
    setUuidForVisibleOps(contact.uuid === uuidForVisibleOps ? null : contact.uuid);
    setEditing(null);
    setFormVisible(false);
  };

  const tryRemovalFn = (contact: Contact) => () => {
    setUuidForVisibleOps(null);
    setRemoving(contact);
    setTimeout(() => {
      if (window.confirm(`Remove "${contact.name}"?`)) {
        props.removeContact(contact);
      }
    }, 500);
  };

  const enableEditionFn = (contact: Contact) => () => {
    setUuidForVisibleOps(null);
    setEditing(contact);
    setFormVisible(true);
  };

  const enableCreation = () => {
    setEditing(null);
    setFormVisible(true);
  };

  const disableForm = () => {
    setEditing(null);
    setFormVisible(false);
  };

  const contactBgClass = (contact: Contact): string => {
    if (editing && editing.uuid === contact.uuid) {
      return 'bg-warning text-dark';
    }

    if (removing && removing.uuid === contact.uuid) {
      return 'bg-danger text-white';
    }

    if (uuidForVisibleOps && uuidForVisibleOps === contact.uuid) {
      return 'bg-info text-white';
    }

    return 'text-dark';
  };

  return (
    <div>
      {props.contacts.entries.length === 0 ? (
        <p className="mt-5 text-center">
          No contacts yet.
          <br />
          <br />
          Use that button at the bottom to add a new one.
        </p>
      ) : (
        <ListGroup>
        {props.contacts.entries.map(contact => (
          <ListGroup.Item
            key={contact.uuid}
            className={`d-flex align-items-center ${contactBgClass(contact)}`}
          >
            <span
              className="flex-grow-1 pb-2 pt-2 pointer"
              role="button"
              onClick={onClickToEnableOpsFn(contact)}
            >
              {contact.name} <small>{contact.phone}</small>
            </span>
            <div
              className={uuidForVisibleOps === contact.uuid ? 'flex-shrink-0 ml-auto' : 'd-none'}
            >
              <IconButton
                icon="edit"
                onClick={enableEditionFn(contact)}
                variant="outline-light"
              />
              <IconButton
                icon="remove"
                onClick={tryRemovalFn(contact)}
                variant="danger"
                className="ml-1"
              />
            </div>
          </ListGroup.Item>
        ))}
        </ListGroup>
      )}
      {isFormVisible ? (
        <ContactForm
          contact={editing}
          editing={!!editing}
          onFinish={disableForm}
        />
      ) : (
        <IconButton
          icon="add"
          className="fixed-bottom ml-auto mr-2 mb-2"
          title="Add a new contact"
          onClick={enableCreation}
        />
      )}
    </div>
  );
};

const mapStateToProps = ({ contacts }: any) => ({
  contacts,
});

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => bindActionCreators({
  removeContact,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ContactsView);
