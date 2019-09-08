import React from 'react';
import {
  Button,
  Grid,
  Dialog,
  IconButton,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import io from 'socket.io-client';
import Like from './Like';
import Drawer from './CustomDrawer';

class MultVideoChat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      room: props.roomName,
      myVideo: null,
      peers: {},
      count: 0,
      socketId: '',
      videoStyle: videoStyle,
      fullScreenId: '',
      error: '',
    };

    this.onReceiveSdp = this.onReceiveSdp.bind(this);
    this.onReceiveCall = this.onReceiveCall.bind(this);
    this.onReceiveCandidate = this.onReceiveCandidate.bind(this);
    this.onReceiveLeave = this.onReceiveLeave.bind(this);
    this.onReceiveFullScreen = this.onReceiveFullScreen.bind(this);
    this.onOffer = this.onOffer.bind(this);
    this.onAnswer = this.onAnswer.bind(this);
    this.onAddStream = this.onAddStream.bind(this);
    this.onRemoveStream = this.onRemoveStream.bind(this);
    this.onIceCandidate = this.onIceCandidate.bind(this);
    this.makeOffer = this.makeOffer.bind(this);
    this.makeAnswer = this.makeAnswer.bind(this);
    this.sendCall = this.sendCall.bind(this);
    this.sendSdp = this.sendSdp.bind(this);
    this.sendIceCandidate = this.sendIceCandidate.bind(this);
    this.onDisconnect = this.onDisconnect.bind(this);
    this.onVideoStart = this.onVideoStart.bind(this);
    this.onCaptureStart = this.onCaptureStart.bind(this);
    this.onVideoStop = this.onVideoStop.bind(this);
    this.onClickCall = this.onClickCall.bind(this);
    this.onClickBye = this.onClickBye.bind(this);
    this.onVideoMute = this.onVideoMute.bind(this);
    this.onFullScreen = this.onFullScreen.bind(this);
    this.isFullScreen = this.isFullScreen.bind(this);
    this.setError = this.setError.bind(this);
    this.videos = {};
    this.senders = {};

    this.socket = io('localhost:9090');
    this.socket.on('RECEIVE_CONNECTED', data => {
      console.log('socket.io connected. id=' + data.id);
      this.setState({ socketId: data.id });
      this.socket.emit('SEND_ENTER', this.state.room);
    });
    this.socket.on('RECEIVE_SDP', this.onReceiveSdp);
    this.socket.on('RECEIVE_CALL', this.onReceiveCall);
    this.socket.on('RECEIVE_CANDIDATE', this.onReceiveCandidate);
    this.socket.on('RECEIVE_LEAVE', this.onReceiveLeave);
    this.socket.on('RECEIVE_FULLSCREEN', this.onReceiveFullScreen);
  }

  componentWillUnmount() {
    this.onClickBye();
  }

  onReceiveSdp(sdp) {
    console.log('receive sdp :' + sdp.type);
    switch (sdp.type) {
      case 'offer':
        this.onOffer(sdp);
        break;
      case 'answer':
        this.onAnswer(sdp);
        break;
      default:
        console.log('unkown sdp...');
        break;
    }
  }

  onReceiveLeave(data) {
    console.log('receive leave from :' + data.id);
    this.onDisconnect(data.id);
  }

  onReceiveFullScreen(data) {
    console.log('receive full screen from :' + data.id);
    const id = data.id;
    if (this.isFullScreen(id)) {
      this.setState({ fullScreenId: '' });
    } else {
      this.setState({ fullScreenId: id });
    }
  }

  async onReceiveCall(data) {
    console.log('receive call. from:' + data.id);
    await this.makeOffer(data.id);
  }

  onReceiveCandidate(ice) {
    console.log('receive candidate:' + ice.id);
    const peer = this.state.peers[ice.id];
    if (!peer) return;

    const candidate = new RTCIceCandidate(ice);
    console.log(candidate);
    peer.addIceCandidate(candidate);
  }

  async onOffer(sdp) {
    console.log('receive sdp offer from:' + sdp.id);

    const peer = this.state.peers[sdp.id] || this.prepareNewConnection(sdp.id);
    if (this.senders[sdp.id]) {
      this.senders[sdp.id].forEach(sender => {
        peer.removeTrack(sender);
      });
    }
    this.senders[sdp.id] = [];
    const canvas = document.createElement('canvas');
    const stream = this.video.srcObject || canvas.captureStream(10);
    stream.getTracks().forEach(track => {
      this.senders[sdp.id].push(peer.addTrack(track, stream));
    });
    console.log(peer);
    if (!this.state.peers[sdp.id]) {
      console.log('add peer :' + sdp.id);
      this.state.peers[sdp.id] = peer;
      await this.setState({ peers: this.state.peers });
    }

    const offer = new RTCSessionDescription(sdp);
    await peer.setRemoteDescription(offer);
    this.makeAnswer(sdp.id);
  }

  async onAnswer(sdp) {
    console.log('receive sdp answer from:' + sdp.id);
    const peer = this.state.peers[sdp.id];
    if (!peer) return;
    const answer = new RTCSessionDescription(sdp);
    await peer.setRemoteDescription(answer);
  }

  async onAddStream(id, stream) {
    console.log('onAddStream:' + id + ', stream.id:' + stream.id);
    const video = this.videos[id];
    console.log(id);
    console.log(video);
    try {
      if (video) {
        video.pause();
        video.srcObject = stream;
        await video.play();
      }
    } catch (e) {
      console.log(e);
    }
  }

  onRemoveStream(id) {
    console.log('onRemoveStream:' + id);
  }

  onIceCandidate(id, icecandidate) {
    console.log('onIceCandidate:' + id);
    if (icecandidate) {
      // Trickle ICE
      this.sendIceCandidate(id, icecandidate);
    } else {
      // Vanilla ICE
      console.log('empty ice event');
    }
  }

  async makeOffer(id) {
    const peer = this.state.peers[id] || this.prepareNewConnection(id);
    console.log(peer);
    if (this.senders[id]) {
      this.senders[id].forEach(sender => {
        peer.removeTrack(sender);
      });
    }
    this.senders[id] = [];
    const canvas = document.createElement('canvas');
    const stream = this.video.srcObject || canvas.captureStream(10);
    stream.getTracks().forEach(track => {
      this.senders[id].push(peer.addTrack(track, stream));
    });
    if (!this.state.peers[id]) {
      this.state.peers[id] = peer;
      await this.setState({ peers: this.state.peers });
    }

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    this.sendSdp(id, peer.localDescription);
  }

  async makeAnswer(id) {
    const peer = this.state.peers[id];
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    this.sendSdp(id, peer.localDescription);
  }

  sendCall() {
    console.log('sending CALL');
    if (Object.keys(this.state.peers).length === 0) {
      this.socket.emit('SEND_ENTER', this.state.room);
      return;
    }
    this.socket.emit('SEND_CALL');
  }

  sendIceCandidate(id, iceCandidate) {
    if (!this.state.peers[id]) return;
    console.log('sending CANDIDATE=' + iceCandidate);
    this.socket.emit('SEND_CANDIDATE', { target: id, ice: iceCandidate });
  }

  sendSdp(id, sdp) {
    console.log('sending SDP:' + sdp.type + ', to:' + id);
    this.socket.emit('SEND_SDP', { target: id, sdp: sdp });
  }

  prepareNewConnection(id) {
    console.log('establish connection to:' + id);
    const config = { iceServers: [] };
    const peer = new RTCPeerConnection(config);
    peer.ontrack = event => {
      this.onAddStream(id, event.streams[0]);
    };
    peer.onremovestream = event => {
      this.onRemoveStream(id);
    };
    peer.onicecandidate = event => {
      this.onIceCandidate(id, event.candidate);
    };
    peer.oniceconnectionstatechange = event => {
      if (peer.iceConnectionState === 'disconnected') {
        console.log('state disconnected to: ' + id);
        this.onDisconnect(id);
      }
    };
    peer.onnegotiationneeded = event => {
      console.log('onnegotiationneeded');
    };
    peer.onconnectionstatechange = event => {
      console.log('onconnectionstatechange: ' + peer.connectionState);
    };

    return peer;
  }

  onDisconnect(id) {
    // 全体から切断
    const peer = this.state.peers[id];
    if (peer) {
      peer.close();
      delete this.state.peers[id];
      delete this.senders[id];
      this.setState({ peers: this.state.peers });
    }
  }

  async onVideoStart() {
    if (!navigator.getUserMedia) {
      this.setError('webカメラ機能は本端末では非対応となります。');
      return;
    }
    // webカメラ
    navigator.getUserMedia(
      { video: true, audio: false },
      async stream => {
        this.onVideoStop();
        this.video.srcObject = stream;
        await this.video.play();
        if (Object.keys(this.state.peers).length > 0) {
          this.sendCall();
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  async onCaptureStart() {
    if (!navigator.getUserMedia) {
      this.setError('画面キャプチャ機能は本端末では非対応となります。');
      return;
    }
    // 画面キャプチャ
    navigator.mediaDevices
      .getDisplayMedia({ video: true, audio: false })
      .then(async stream => {
        this.onVideoStop();
        this.video.srcObject = stream;
        await this.video.play();
        console.log(this.state.peers);
        if (Object.keys(this.state.peers).length > 0) {
          this.sendCall();
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  onVideoStop() {
    // 事前にmuteしておく
    this.onVideoMute();
    // 映像停止
    let stream = this.video.srcObject;
    if (!stream) return;
    const tracks = stream.getTracks();

    tracks.forEach(track => track.stop());
    stream = null;
  }

  onClickCall() {
    this.sendCall();
  }

  onClickBye() {
    console.log('sending LEAVE');
    // 事前に映像を止めておく
    this.onVideoStop();
    this.socket.emit('SEND_LEAVE');
    Object.keys(this.state.peers).forEach(key => {
      this.onDisconnect(key);
    });
  }

  onVideoMute() {
    if (this.video.srcObject) {
      const videoTrack = this.video.srcObject.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
    }
  }

  onFullScreen(element) {
    this.socket.emit('SEND_FULLSCREEN', {});
  }

  isFullScreen(id) {
    return this.state.fullScreenId === id;
  }

  setError(message) {
    this.setState({
      error: message,
    });
  }

  render() {
    return (
      <>
        <Dialog
          open={this.state.error !== ''}
          onClose={() => this.setError('')}
        >
          <DialogTitle>非対応機能です</DialogTitle>
          <DialogContent>
            <DialogContentText>{this.state.error}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button color="secondary" onClick={() => this.setError('')}>
              OK
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          maxWidth="xl"
          fullScreen
          open={this.state.fullScreenId !== ''}
          onClose={this.onFullScreen}
        >
          <Like socket={this.socket}>
            <video
              style={fullScreenStyle}
              autoPlay="1"
              playsInline
              ref={video => {
                const fullScreen =
                  this.videos[this.state.fullScreenId] || this.video;
                if (video && fullScreen) {
                  video.srcObject = fullScreen.srcObject;
                }
              }}
            />
          </Like>
          <IconButton
            style={closeButtonStyle}
            color="primary"
            onClick={this.onFullScreen}
          >
            <CloseIcon />
          </IconButton>
        </Dialog>
        <div style={{ flexGrow: '1', padding: '1rem' }}>
          <Grid container spacing={4} justify="center" alignItems="flex-start">
            <Grid item md={4} sm={6} xs={12}>
              <video
                id={this.state.socketId}
                style={videoStyle}
                autoPlay="1"
                playsInline
                ref={video => {
                  this.video = video;
                }}
              />
            </Grid>
            {Object.keys(this.state.peers).map(key => {
              return (
                <Grid item md={4} sm={6} xs={12} key={key}>
                  <video
                    id={key}
                    key={key}
                    style={videoStyle}
                    autoPlay="1"
                    playsInline
                    ref={video => {
                      this.videos[key] = video;
                    }}
                  />
                </Grid>
              );
            })}
          </Grid>
          <Drawer
            onCaptureStart={this.onCaptureStart}
            onCameraStart={this.onVideoStart}
            onVideoStop={this.onVideoStop}
            onCall={this.onClickCall}
            onBye={this.onClickBye}
            onMute={this.onVideoMute}
            onFullScreen={this.onFullScreen}
          />
        </div>
      </>
    );
  }
}

const videoStyle = {
  alignSelf: 'center',
  width: '100%',
  background: 'black',
};

const closeButtonStyle = {
  position: 'absolute',
  right: '1rem',
  top: '1rem',
  background: 'rgba(204, 204, 204, 0.21)',
};

const fullScreenStyle = {
  width: '100%',
  height: '100%',
  background: 'black',
};

export default MultVideoChat;
