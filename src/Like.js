import React from 'react';
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

    this.props.socket.on('RECEIVE_MOUSE_EVENT', this.onSocketMouse);
    injectStyle(keyframesStyle);
  }

  onSocketMouse(data) {
    console.log('receive mouse event');
    switch (data.mouse) {
      default:
        break;
      case 'down':
        if (!this.likeArea) return;
        const { offsetWidth, offsetHeight } = this.likeArea;
        const heart = {
          style: heartStyle(
            data.ratioX * offsetWidth,
            data.ratioY * offsetHeight
          ),
        };
        const newHearts = JSON.parse(JSON.stringify(this.state.hearts));
        newHearts[generateKey()] = heart;
        this.setState({ hearts: newHearts });
        break;
    }
  }

  onMouseDown(e) {
    console.log('onMouseDown()');
    if (!this.likeArea) return;

    const rect = this.likeArea.getBoundingClientRect();
    const { offsetWidth, offsetHeight } = this.likeArea;
    const { clientX, clientY } = e;
    this.props.socket.emit('SEND_MOUSE_EVENT', {
      mouse: 'down',
      ratioX: (clientX - rect.left) / offsetWidth,
      ratioY: (clientY - rect.top) / offsetHeight,
    });
  }

  onAnimationEnd(e) {
    console.log('animation ended id:' + e.target.id);
    const newHearts = JSON.parse(JSON.stringify(this.state.hearts));
    delete newHearts[e.target.id];
    this.setState({ hearts: newHearts });
  }

  render() {
    return (
      <>
        {this.props.children}
        <div
          style={likeStyle}
          onMouseDown={this.onMouseDown}
          ref={likeArea => (this.likeArea = likeArea)}
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
      </>
    );
  }
}

const generateKey = () =>
  Math.random()
    .toString(36)
    .substring(2);

const likeStyle = {
  position: 'absolute',
  top: '0',
  width: '100%',
  height: '100%',
};

const heartStyle = (x, y) => {
  return {
    position: 'absolute',
    width: '5rem',
    height: '5rem',
    top: y,
    left: x,
    transform: 'scale(2)',
    opacity: '0',
    animation: 'anime1 1s ease-in reverse',
  };
};

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
