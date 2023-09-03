import React, { Component } from "react";

class CameraApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cameraStream: null,
      intervalId: null,
      gaugeData: "尚未取得資料",
      photoNum: 0,
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
    const { cameraStream, photoNum } = this.state;
    if (cameraStream) {
      const video = this.videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas
        .getContext("2d")
        .drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        const imageFile = new File(
          [blob],
          "frame_" + photoNum.toString() + ".jpg",
          {
            type: "image/jpeg",
          }
        );
        console.log(imageFile);
        const formData = new FormData();
        formData.append("data", "frame_" + photoNum.toString());
        formData.append("image", imageFile);
        fetch("http://127.0.0.1:8000/api/MyData/", {
          method: "POST",
          body: formData,
        })
          .then((response) => {
            if (response.ok) {
              console.log("upload photo success");
              this.setState({ photoNum: photoNum + 1 });
              response.json().then((data) => {
                console.log(data)
                // this.setState({ gaugeData: data });
              });
            } else {
              console.error("upload photo failed");
            }
          })
          .catch((error) => {
            console.error("Error uploading photo:", error);
          });
      }, "image/jpeg");
    }
  };

  getData = () => {
    fetch("http://127.0.0.1:8000/api/MyData/")
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        this.setState({ gaugeData: data.data });
      })
      .catch((error) => {
        console.error("Error getting backend data:", error);
      });
  };

  render() {
    const { gaugeData } = this.state;
    return (
      <div>
        <h1>Camera Capture</h1>
        <div>
          <button onClick={this.getData}>Get Data</button>
          <a>{gaugeData}</a>
        </div>
        <video ref={this.videoRef} autoPlay playsInline muted />
      </div>
    );
  }
}

export default CameraApp;
