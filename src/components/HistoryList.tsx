import React from 'react';
import { connect } from 'react-redux';
import { AnyAction, Dispatch, bindActionCreators } from 'redux';
import MaterialIcon from '@material/react-material-icon';
import ListGroup from 'react-bootstrap/ListGroup';
import { CallLog, CallDirection, clearCallHistory } from '../redux/history';

interface HistoryListProps {
  logs?: Array<CallLog>,
  clearCallHistory?: () => void,
}

const HistoryList: React.FC<HistoryListProps> = (props) => {
  const tryClearHistory = (event: React.SyntheticEvent) => {
    event.preventDefault();

    if (window.confirm('Are you sure you want to clear all call logs?')) {
      props.clearCallHistory!();
    }
  };

  return (
    <section className="history-list">
      <header className="d-flex justify-content-between">
        <strong>Logs:</strong>
        <a href="/" role="button" onClick={tryClearHistory}>
          <MaterialIcon icon="delete_sweep" title="Clear history" className="text-danger" />
        </a>
      </header>
      {props.logs && props.logs.length ? (
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
      ) : (
        <p>
          <small>Empty call history.</small>
        </p>
      )}
    </section>
  );
};


const mapStateToProps = ({ history }: any): any => {
  return {
    ...history,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => {
  return bindActionCreators({
    clearCallHistory,
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(HistoryList);
