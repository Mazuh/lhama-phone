import React from 'react';
import chunk from 'lodash.chunk';
import { Dispatch, bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { sendDTMF } from '../redux/telephony';

const digitsPerRow = chunk([
  '1', '2', '3',
  '4', '5', '6',
  '7', '8', '9',
  '*', '0', '#',
], 3);

type DialpadProps = { sendDTMF: (digit: string) => void };
const Dialpad: React.FC<DialpadProps> = (props) => {
  return (
    <div className="dialpad mt-4">
      {digitsPerRow.map((digits, digitsIndex) => (
        <Row key={digitsIndex}>
          {digits.map((digit, digitIndex) => (
            <Col
              className="dialpad__digit c-pointer p-3 pl-4 pr-4"
              onClick={() => props.sendDTMF(digit)}
              key={digitIndex}
            >
              <span>{digit}</span>
            </Col>
          ))}
        </Row>
      ))}
    </div>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
  sendDTMF,
}, dispatch);
export default connect(null, mapDispatchToProps)(Dialpad);
