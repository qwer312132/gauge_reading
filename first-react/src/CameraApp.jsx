import React, { Component } from 'react';

class CameraApp extends Component {
  constructor(props) {
    super(props);

    this.state = {
      cameraStream: null,
      intervalId: null,
      photos: [],
    };

    this.videoRef = React.createRef();
  }

  componentDidMount() {
    this.startCamera();
    this.startPhotoInterval();
  }

  componentWillUnmount() {
    this.stopCamera();
    this.stopPhotoInterval();
  }

  startCamera() {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(stream => {
        this.setState({ cameraStream: stream });
        if (this.videoRef.current) {
          this.videoRef.current.srcObject = stream;
        }
        console.log('Camera started!');
      })
      .catch(error => {
        console.error('Error accessing the camera:', error);
      });
  }

  stopCamera() {
    const { cameraStream } = this.state;
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
    }
  }

  startPhotoInterval() {
    const intervalId = setInterval(this.takePhoto, 10000); // 10 seconds
    this.setState({ intervalId });
  }

  stopPhotoInterval() {
    const { intervalId } = this.state;
    clearInterval(intervalId);
  }

  takePhoto = () => {
    const { cameraStream, photos } = this.state;

    if (cameraStream) {
      const video = this.videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

      const photoUrl = canvas.toDataURL('image/png');
      this.setState({ photos: [...photos, photoUrl] });
      console.log('photo:', photoUrl);
    }
  };

  render() {
    const { photos } = this.state;

    return (
      <div>
        <h1>Camera Capture</h1>
        <video ref={this.videoRef} autoPlay playsInline muted />
        <div>
          {photos.map((photo, index) => (
            <img key={index} src={photo} alt={`Photo ${index}`} />
          ))}
        </div>
      </div>
    );
  }
}

export default CameraApp;