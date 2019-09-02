import React from 'react';
import io from 'socket.io-client';
import injectStyle from './injectStyle';

class Like extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hearts: {},
    };

    this.onMouseDown = this.onMouseDown.bind(this);
    this.onSocketMouse = this.onSocketMouse.bind(this);
    this.onAnimationEnd = this.onAnimationEnd.bind(this);

    this.socket = io('localhost:9090');

    this.socket.on('RECEIVE_MOUSE_EVENT', this.onSocketMouse);
    injectStyle(keyframesStyle);
  }

  mouseDown(ratioX, ratioY) {
    this.socket.emit('SEND_MOUSE_EVENT', {
      mouse: 'down',
      ratioX: ratioX,
      ratioY: ratioY,
    });
  }

  onSocketMouse(data) {
    console.log('receive mouse event');
    switch (data.mouse) {
      default:
        break;
      case 'down':
        const heart = {
          key: Math.random()
            .toString(36)
            .substring(2),
          style: {
            position: 'absolute',
            width: '5rem',
            height: '5rem',
            top: data.ratioY * window.innerHeight,
            left: data.ratioX * window.innerWidth,
            transform: 'scale(2)',
            opacity: '0',
            animation: 'anime1 1s ease-in reverse',
          },
        };
        const newHearts = JSON.parse(JSON.stringify(this.state.hearts));
        newHearts[
          Math.random()
            .toString(36)
            .substring(2)
        ] = heart;
        this.setState({ hearts: newHearts });
        break;
    }
  }

  onMouseDown(e) {
    console.log('onMouseDown()');
    this.mouseDown(
      e.clientX / window.innerWidth,
      e.clientY / window.innerHeight
    );
  }

  onAnimationEnd(e) {
    console.log('animation ended id:' + e.target.id);
    const newHearts = JSON.parse(JSON.stringify(this.state.hearts));
    delete newHearts[e.target.id];
    this.setState({ hearts: newHearts });
  }

  render() {
    return (
      <div
        style={{
          position: 'absolute',
          top: '0',
          width: '100vw',
          height: '100vh',
        }}
        onMouseDown={this.onMouseDown}
      >
        {Object.keys(this.state.hearts).map(key => {
          return (
            <div
              id={key}
              className="heart"
              key={key}
              style={this.state.hearts[key].style}
              onAnimationEnd={this.onAnimationEnd}
            />
          );
        })}
      </div>
    );
  }
}

const keyframesStyle = `
@keyframes anime1{
  0% {
    transform: scale(2);
    opacity: 0;
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }}`;

export default Like;
