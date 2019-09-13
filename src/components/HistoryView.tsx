import React from 'react';
import { connect } from 'react-redux';
import { AnyAction, Dispatch, bindActionCreators } from 'redux';
import MaterialIcon from '@material/react-material-icon';
import ListGroup from 'react-bootstrap/ListGroup';
import { CallLog, CallDirection, clearCallHistory, CallOutcome } from '../redux/history';
import Phone from './Phone';

interface HistoryViewProps {
  logs?: Array<CallLog>;
  clearCallHistory?: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = (props) => {
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
          {props.logs.map(({ uuid, direction, outcome, number, startedAt }) => (
            <ListGroup.Item key={uuid} role="row">
              <span className="d-flex align-items-center">
                {direction === CallDirection.Inbound && (
                  outcome === CallOutcome.Completed ? (
                    <MaterialIcon icon="call_received" title="Received (inbound)" />
                  ) : (
                    <MaterialIcon icon="call_missed" title="Received (inbound) but missed" />
                  )
                )}
                {direction === CallDirection.Outbound && (
                  outcome === CallOutcome.Completed ? (
                    <MaterialIcon icon="call_made" title="Made (outbound)" />
                  ) : (
                    <MaterialIcon icon="call_missed_outgoing" title="Made (outbound) but missed" />
                  )
                )}
                <Phone>{number}</Phone>
              </span>
              <small>at {startedAt.toLocaleString()}</small>
            </ListGroup.Item>
          ))}
        </ListGroup>
      ) : (
        <p>
          Empty call history.
        </p>
      )}
    </section>
  );
};

const mapStateToProps = ({ history }: any): any => ({
  logs: history.logs,
});

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => {
  return bindActionCreators({
    clearCallHistory,
  }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(HistoryView);
