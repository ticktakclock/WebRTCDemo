import React, { useContext } from 'react';
import {
  Divider,
  Drawer,
  Fab,
  Grid,
  Dialog,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@material-ui/core';
import { MenuContext } from './App';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import CallIcon from '@material-ui/icons/Call';
import CallEndIcon from '@material-ui/icons/CallEnd';
import VideocamIcon from '@material-ui/icons/Videocam';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import ScreenShareIcon from '@material-ui/icons/ScreenShare';
import StopIcon from '@material-ui/icons/Stop';

const CustomDrawer = ({
  onCaptureStart,
  onCameraStart,
  onVideoStop,
  onCall,
  onBye,
  onMute,
  onFullScreen,
}) => {
  const { isMenuOpen, setMenuOpen, setRoomName } = useContext(MenuContext);
  const menu = {
    'Exit room': [
      <ExitToAppIcon />,
      () => {
        console.log('gege');
        setRoomName('');
      },
    ],
    'Stream cam': [<VideocamIcon />, onCameraStart],
    'Stream screen': [<ScreenShareIcon />, onCaptureStart],
    'Stop Stream': [<StopIcon />, onVideoStop],
    'Full screen': [<FullscreenIcon />, onFullScreen],
    Mute: [<VideocamOffIcon />, onMute],
    Call: [<CallIcon />, onCall],
    Bye: [<CallEndIcon />, onBye],
  };
  const getIcon = text => (menu[text] ? menu[text][0] : <div />);

  const getMethod = text => (menu[text] ? menu[text][1] : () => {});

  const onClickItem = text => {
    setMenuOpen(!isMenuOpen);
    getMethod(text).apply();
  };

  return (
    <Drawer open={isMenuOpen} onClose={() => setMenuOpen(!isMenuOpen)}>
      <div style={{ marginLeft: 'auto' }}>
        <IconButton onClick={() => setMenuOpen(!isMenuOpen)}>
          <ChevronLeftIcon />
        </IconButton>
      </div>
      <Divider />
      <List>
        {[
          'Stream cam',
          'Stream screen',
          'Stop Stream',
          'Full screen',
          'Mute',
          'Call',
          'Bye',
        ].map(text => (
          <ListItem button key={text} onClick={() => onClickItem(text)}>
            <ListItemIcon>{getIcon(text)}</ListItemIcon>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {['Exit room'].map(text => (
          <ListItem button key={text} onClick={onClickItem}>
            <ListItemIcon>{getIcon(text)}</ListItemIcon>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

const fabStyle = {
  display: 'block',
  position: 'absolute',
  bottom: '1rem',
  right: '1rem',
  width: '4rem',
  height: '4rem',
  background: '#03a9f4',
  textAlign: 'center',
  borderRadius: '50%',
  boxShadow: '0 2px 2px 0 rgba(0,0,0,.12), 0 2px 2px 0 rgba(0,0,0,.24)',
  cursor: 'pointer',
};

const muiFabStyle = {
  position: 'absolute',
  bottom: '2rem',
  right: '2rem',
};

export default CustomDrawer;
