import React, { Component } from "react";

class CameraApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cameraStream: null,
      intervalId: null,
      photos: [],
      gaugeData: "尚未取得資料",
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
      .then((stream) => {
        this.setState({ cameraStream: stream });
        if (this.videoRef.current) {
          this.videoRef.current.srcObject = stream;
        }
        console.log("Camera started!");
      })
      .catch((error) => {
        console.error("Error accessing the camera:", error);
      });
  }

  stopCamera() {
    const { cameraStream } = this.state;
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
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
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas
        .getContext("2d")
        .drawImage(video, 0, 0, canvas.width, canvas.height);

      const photoUrl = canvas.toDataURL("image/png");
      this.setState({ photos: [...photos, photoUrl] });
      console.log("photo:", photoUrl);
      this.postPhoto(photoUrl);
    }
  };

  postPhoto = (photo) => {
    const formData = new FormData();
    formData.append("photo", photo);

    fetch("http://localhost:3000/", {
      //等API做好 要改
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((success) => {
        console.log("Upload photo to backend success:", success);
      })
      .catch((error) => {
        console.error("Error uploading photo to backend :", error);
      });
  };

  getData = () => {
    fetch("http://127.0.0.1:8000/api/MyData/") //等API做好 要改
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        // this.gaugeData = data.data;
        this.setState({ gaugeData: data.data });
      })
      .catch((error) => {
        console.error("Error getting backend data:", error);
      });
  };

  render() {
    const { photos, gaugeData } = this.state;
    return (
      <div>
        <h1>Camera Capture</h1>
        <button onClick={this.getData}>Get Data</button>
        <a>{gaugeData}</a>
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
