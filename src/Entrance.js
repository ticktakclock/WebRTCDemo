import React, { useState } from 'react';
import {
  Card,
  Button,
  TextField,
  CardContent,
  CardActions,
} from '@material-ui/core';

const Entrance = ({ setRoomName }) => {
  const [roomName, onChangeRoomName] = useState('');
  return (
    <Card style={cardStyle}>
      <CardContent>
        <TextField
          fullWidth
          placeholder="testroom"
          value={roomName}
          onChange={e => onChangeRoomName(e.target.value)}
        />
      </CardContent>
      <CardActions>
        <Button
          color="primary"
          variant="contained"
          style={{ marginLeft: 'auto' }}
          onClick={() => setRoomName(roomName)}
        >
          enter room
        </Button>
      </CardActions>
    </Card>
  );
};

const cardStyle = {
  width: '50%',
  maxWidth: '30rem',
  alignSelf: 'center',
};

export default Entrance;
