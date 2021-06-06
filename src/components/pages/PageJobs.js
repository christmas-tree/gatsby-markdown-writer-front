import Terminal from "../terminal/Terminal";
import styled from "styled-components";
import {useEffect, useRef, useState} from "react";
import {Alert, Button, Modal} from "react-bootstrap";
import socketIOClient from "socket.io-client";
import apiService from "../service/apiService";

const ENDPOINT = "http://127.0.0.1:5000";

const state = {
    INIT: '',
    CONNECTING: 'Connecting',
    CONNECTED: 'Connected',
    DISCONNECTED: 'Disconnected',
    CONNECT_ERROR: 'Connection error',
    RUNNING: 'Executing',
    ERROR: 'Error',
}

const TerminalContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh;
  font-family: monospace;
  flex-direction: column;
`;

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: center;
  height: 5vh;
  align-content: center;
  margin: 15px 0;
`

const PageJobs = () => {
    const [terminalText, setTerminalText] = useState('');
    const [connectStatus, setConnectStatus] = useState('Initializing');
    const [showModal, setShowModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const terminalElRef = useRef(null);
    const terminalValue = useRef('');

    useEffect(() => {
        const terminalEl = terminalElRef.current;
        terminalEl.scrollTop = terminalEl.scrollHeight;
    }, [terminalText]);

    useEffect(() => {
        setConnectStatus(state.CONNECTING);
        const socket = socketIOClient(ENDPOINT);

        const onReceiveTerminalText = (data) => {
            terminalValue.current = terminalValue.current + data + '\n';
            setTerminalText(terminalValue.current);
        }

        socket.on('connect', () => {
            setConnectStatus(state.CONNECTED);
        });
        socket.on('connect_error', () => {
            setConnectStatus(state.CONNECT_ERROR);
        });
        socket.on('disconnect', () => {
            setConnectStatus(state.DISCONNECTED);
        });
        socket.on("error", (data) => {
            setConnectStatus(state.ERROR);
        });
        socket.on("stdout", onReceiveTerminalText);
        socket.on("stderr", onReceiveTerminalText);
        socket.on("close", onReceiveTerminalText);

        return () => {
            console.log("Disconnecting");
            socket.disconnect();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleModalClose = () => {
        setShowModal(false);
    }

    const handleClearTerminal = () => {
        terminalValue.current = '';
        setTerminalText(terminalValue.current);
    }

    const handleCommand = (command) => {
        apiService.triggerJob(command)
            .then(({data}) => {
                if (data.error) {
                    throw new Error(data.error);
                }
            })
            .catch((e) => {
                setErrorMessage(e.toString());
                setShowModal(true);
            })
    }

    const handleDeploy = () => {
        handleCommand('deploy');
    }

    const handlePreview = () => {
        handleCommand('preview');
    }

    const handleClean = () => {
        handleCommand('clean');
    }

    const handleStop = () => {
        handleCommand('stop');
    }

    return (
        <>
            <div className='my-3'>
                <ButtonsContainer>
                    <Button className='mx-1' variant='success' onClick={handleDeploy}>Deploy</Button>
                    <Button className='mx-1' variant='info' onClick={handlePreview}>Preview</Button>
                    <Button className='mx-1' variant='danger' onClick={handleClean}>Clean</Button>
                    <Button className='mx-1' variant='dark' onClick={handleStop}>Stop</Button>
                    <Button className='mx-1' variant='outline-dark' onClick={handleClearTerminal}>Clear
                        Terminal</Button>
                </ButtonsContainer>
                <TerminalContainer>
                    <Terminal ref={terminalElRef} text={terminalText}/>
                    <p className='text-muted mt-3'>{connectStatus}</p>
                </TerminalContainer>
            </div>
            <Modal show={showModal} onHide={handleModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Error</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert variant="danger">
                        {errorMessage}
                    </Alert>
                </Modal.Body>
            </Modal>
        </>

    )
}

export default PageJobs;