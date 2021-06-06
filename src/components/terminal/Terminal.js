import React, {forwardRef} from 'react';
import styled, {keyframes} from 'styled-components';

const TerminalBox = styled.div`
  width: 98%;
  height: 98%;
  box-shadow: 2px 4px 10px rgba(0, 0, 0, .5);

  @media (max-width: 600px) {
    max-height: 90%;
    width: 95%;
  }
`

const TerminalBody = styled.div`
  background: rgba(5, 37, 47, 0.9);
  height: 100%;
  padding: 5px;
  overflow-y: scroll;
`

const TerminalText = styled.p`
  white-space: pre-line;
  margin-block-start: 0em;
  margin-block-end: 0em;
  color: #ddd;
`

const blink = keyframes`
  0% {
    opacity: 0
  }
  49% {
    opacity: 0
  }
  50% {
    opacity: 1
  }
`;

const TerminalCursor = styled.span`
  height: 17px;
  width: 8px;
  background: white;
  display: block;
  animation: 1s infinite ${blink};
`

const Terminal = forwardRef((props, ref) => {
    const {text} = props;
    return (
        <TerminalBox>
            <TerminalBody ref={ref}>
                <TerminalText>{text}</TerminalText>
                <TerminalCursor/>
            </TerminalBody>
        </TerminalBox>
    )
});

export default Terminal;