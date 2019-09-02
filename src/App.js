import React, { Component, useState } from 'react';
import MultiVideoChat from './MultiVideoChat';
import Room from './Room';
import Entrance from './Entrance';
import { AppBar, Toolbar, IconButton } from '@material-ui/core';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';

const App = () => {
  const vh = window.innerHeight;
  document.documentElement.style.setProperty('--full-vh', `${vh}px`);

  const [roomName, setRoomName] = useState('');
  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          {roomName || 'WebRTC Sample'}
          {roomName ? (
            <IconButton
              color="inherit"
              style={{ marginLeft: 'auto' }}
              onClick={() => setRoomName('')}
            >
              <ExitToAppIcon />
            </IconButton>
          ) : null}
        </Toolbar>
      </AppBar>
      <div style={appStyle}>
        {roomName ? (
          <Room roomName={roomName} />
        ) : (
          <Entrance setRoomName={setRoomName} />
        )}
      </div>
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

export default App;
