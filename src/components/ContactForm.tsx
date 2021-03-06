import React from 'react';
import { Dispatch, AnyAction, bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import uuid from 'uuid';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { clearToAdd, findByPhone } from '../utils/contacts';
import { Contact, addContact, editContact, ContactsState } from '../redux/contacts';

interface ContactFormProps {
  editing?: boolean;
  contact?: Contact|null;
  onFinish: Function;
  contacts?: ContactsState;
  addContact: Function;
  editContact: Function;
}

const ContactForm: React.FC<ContactFormProps> = (props) => {
  const onSubmit  = (event: React.SyntheticEvent) => {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const name = clearToAdd(form.cname.value);
    const phone = clearToAdd(form.phone.value);
    if (!name || !phone) {
      return;
    }

    const existingWithEqualPhone = findByPhone(phone, props.contacts!.entries, true);
    if (existingWithEqualPhone) {
      alert(`This phone already exists for "${existingWithEqualPhone.name}".`);
      return;
    }

    const contact: Contact = {
      uuid: (props.contact && props.contact.uuid) || uuid.v4(),
      name,
      phone,
    };

    if (props.editing) {
      props.editContact(contact);
    } else {
      props.addContact(contact);
    }

    form.cname.value = '';
    form.phone.value = '';
    props.onFinish();
  };

  return (
    <Form
      className="mt-3 p-3 bg-secondary text-white fixed-bottom"
      onSubmit={onSubmit}
    >
      <Form.Group>
        <Form.Label className="d-flex flex-column justify-content-center">
          Name:
          <Form.Control
            type="text"
            name="cname"
            defaultValue={props.contact ? props.contact.name : ''}
            placeholder="Contact name or full name"
            maxLength={30}
            required
          />
        </Form.Label>
      </Form.Group>
      <Form.Group>
        <Form.Label className="d-flex flex-column justify-content-center">
          Phone:
          <Form.Control
            type="text"
            name="phone"
            defaultValue={props.contact ? props.contact.phone : ''}
            placeholder="Its phone number in any format"
            maxLength={50}
            required
          />
        </Form.Label>
      </Form.Group>
      <Form.Group className="d-flex">
        <Button variant='secondary' className="ml-auto" onClick={() => props.onFinish()}>
          Cancel
        </Button>
        <Button variant={props.editing ? 'info' : 'success'} type="submit" className="ml-2">
          {props.editing ? 'Edit contact' : 'Add contact' }
        </Button>
      </Form.Group>
    </Form>
  );
};

const mapStateToProps = ({ contacts }: any) => ({
  contacts,
});

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => bindActionCreators({
  addContact,
  editContact,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ContactForm);
