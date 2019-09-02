import React from 'react';
import io from 'socket.io-client';
import injectStyle from './injectStyle';

class Chat extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      message: '',
      messages: [],
      touchDowns: [],
      drawarea1: {
        ...defaultStyle,
        top: '10rem',
        left: '10rem',
      },
      drawarea2: {
        ...defaultStyle,
        top: '20rem',
        left: '10rem',
      },
    };

    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onSocketMouse = this.onSocketMouse.bind(this);

    this.socket = io('localhost:9090');

    this.socket.on('RECEIVE_MOUSE_EVENT', this.onSocketMouse);
    injectStyle(keyframesStyle);
  }

  mouseDown(id) {
    this.socket.emit('SEND_MOUSE_EVENT', {
      mouse: 'down',
      id: id,
    });
  }

  mouseUp(id) {
    this.socket.emit('SEND_MOUSE_EVENT', {
      mouse: 'up',
      id: id,
    });
  }

  mouseMove(id, posX, posY) {
    this.socket.emit('SEND_MOUSE_EVENT', {
      mouse: 'move',
      id: id,
      posX: posX,
      posY: posY,
    });
  }

  onSocketMouse(data) {
    console.log(data);
    const downs = this.state.touchDowns;
    switch (data.mouse) {
      default:
      case 'up':
        delete downs[data.id];
        this.setState({
          [data.id]: {
            ...this.state[data.id],
            transition: 'all 300ms 0s ease',
            boxShadow: '',
          },
        });
        break;
      case 'down':
        downs[data.id] = data.id;
        this.setState({
          [data.id]: {
            ...this.state[data.id],
            boxShadow: '10px 10px 10px rgba(0,0,0,0.4)',
            transition: 'all 300ms 0s ease',
          },
        });
        break;
      case 'move':
        this.setState({
          [data.id]: {
            ...this.state[data.id],
            transition: '',
            top: data.posY - 2.5 * 16,
            left: data.posX - 2.5 * 16,
          },
        });
        break;
    }
  }

  onMouseDown(e) {
    console.log('onMouseDown()');
    console.log(e);
    console.log(e.target.id);
    console.log(e.clientX + '::' + e.clientY);
    console.log(e.clientX + '::' + e.clientY);
    console.log(e.screenX + '::' + e.screenY);
    console.log(e.moveMomentX + '::' + e.moveMomentY);
    this.mouseDown(e.target.id);
  }

  onMouseLeave(e) {
    console.log('onMouseLeave()');
    if (this.state.touchDowns[e.target.id]) {
      console.log('onMouseLeave but onMouseMove()');
      this.mouseMove(e.target.id, e.clientX, e.clientY);
    }
  }

  onMouseUp(e) {
    console.log('onMouseUp()');
    this.mouseUp(e.target.id);
  }

  onMouseMove(e) {
    console.log(e.target.id);
    console.log(this.state.touchDowns);
    for (let id in this.state.touchDowns) {
      console.log('onMouseMove()' + e.clientX + ':' + e.clientY);
      this.mouseMove(this.state.touchDowns[id], e.clientX, e.clientY);
    }
  }

  render() {
    return (
      <div
      style={{ width: '100vw', height: '100vh'}}
      onMouseMove={this.onMouseMove}
      onTouchMove={this.onMouseMove}
    >
      <div
        id="drawarea1"
        style={this.state['drawarea1']}
        onMouseDown={this.onMouseDown}
        onMouseUp={this.onMouseUp}
        onMouseLeave={this.onMouseLeave}
        onTouchStart={this.onMouseDown}
        onTouchEnd={this.onMouseUp}
      ></div>
      <div
        id="drawarea2"
        style={this.state['drawarea2']}
        onMouseDown={this.onMouseDown}
        onMouseUp={this.onMouseUp}
        onMouseLeave={this.onMouseLeave}
        onTouchStart={this.onMouseDown}
        onTouchEnd={this.onMouseUp}
      ></div>
    </div>
    );
  }
}

const defaultStyle = {
  position: 'absolute',
  width: '5rem',
  height: '5rem',
  background: 'green',
};

const keyframesStyle = `
@keyframes anime1{
  from {
    margin-left: 100%;
    width: 300%;
  }

  to {
    margin-left: 0%;
    width: 100%;
  }}`;

export default Chat;
