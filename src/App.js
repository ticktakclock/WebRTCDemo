import React, { useState, useEffect } from 'react';
import Room from './Room';
import Entrance from './Entrance';
import { AppBar, Toolbar, IconButton } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';

export const MenuContext = React.createContext(false);

const DEAULT_TITLE = 'WebRTC Sample';

const App = () => {
  const vh = window.innerHeight;
  document.documentElement.style.setProperty('--full-vh', `${vh}px`);
  navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    window.navigator.mozGetUserMedia;

  const [roomName, setRoomName] = useState('');
  const [isMenuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    if (!roomName) {
      setMenuOpen(false);
    }
  }, [roomName]);
  return (
    <>
      <MenuContext.Provider value={{ isMenuOpen, setMenuOpen, setRoomName }}>
        <AppBar position="fixed">
          <Toolbar>
            <IconButton
              color="inherit"
              disabled={!roomName}
              onClick={() => setMenuOpen(!isMenuOpen)}
            >
              <MenuIcon />
            </IconButton>
            <div style={titleStyle}>{roomName || DEAULT_TITLE}</div>
          </Toolbar>
        </AppBar>
        <div style={appStyle}>
          {roomName ? (
            <Room roomName={roomName} />
          ) : (
            <Entrance setRoomName={setRoomName} />
          )}
        </div>
      </MenuContext.Provider>
    </>
  );
};

const appStyle = {
  height: 'calc(var(--full-vh))',
  width: '100%',
  overflow: 'scroll',
  display: 'flex',
  justifyContent: 'center',
};

const titleStyle = {
  marginLeft: '1rem',
};

export default App;
