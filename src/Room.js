import React, { Component, useState } from 'react';
import MultiVideoChat from './MultiVideoChat';

const Room = ({ roomName }) => {
  return (
    <div style={pageStyle}>
      <MultiVideoChat roomName={roomName} />
    </div>
  );
};

const pageStyle = {
  paddingTop: '6rem',
  height: '100%',
  width: '100%',
  overflow: 'scroll',
  display: 'flex',
  justifyContent: 'center',
};
export default Room;
