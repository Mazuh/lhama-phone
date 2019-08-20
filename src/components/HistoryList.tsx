import React from 'react';
import MaterialIcon from '@material/react-material-icon';
import ListGroup from 'react-bootstrap/ListGroup';
import { CallLog, CallDirection } from '../redux/history';
import { connect } from 'react-redux';

interface HistoryListProps {
  logs?: Array<CallLog>,
}

const HistoryList: React.FC<HistoryListProps> = (props) => {
  if (!props.logs || !props.logs.length) {
    return (
      <div>
        <p>
          <small>Empty call history.</small>
        </p>
      </div>
    );
  }

  return (
    <div>
      <ListGroup>
        {props.logs.map(({ uuid, direction, number, startedAt }) => (
          <ListGroup.Item key={uuid} className="d-flex align-items-center p-1">
              {direction === CallDirection.Inbound && (
                <MaterialIcon icon="call_received" title="Received (Inbound)" />
              )}
              {direction === CallDirection.Outbound && (
                <MaterialIcon icon="call_made" title="Made (Outbound)" />
              )}
              <span>{number}</span>
              <small className="ml-1">at {startedAt.toLocaleString()}</small>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
};


const mapStateToProps = ({ history }: any): any => {
  return {
    ...history,
  };
};

export default connect(mapStateToProps)(HistoryList);
