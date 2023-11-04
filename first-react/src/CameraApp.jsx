import React, { Component } from "react";

class CameraApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cameraStream: null,
      intervalId: null,
      gaugeData: "尚未取得資料",
      photoNum: 0,
      processedImage: null,
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
    const intervalId = setInterval(this.takePhoto, 10000); // 10 seconds !!可以改
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
                console.log(data);
                // data = JSON.stringify(data)
                console.log(data);
                //在這裡接收資料
                this.setState({
                  gaugeData: data.message,
                  processedImage: data.image,
                });
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
  render() {
    const {
      gaugeData,
      // isModalOpen,
      // compressedImages,
      // currentImageIndex,
      processedImage,
    } = this.state;
    return (
      <div>
        <h1>偵測辨別系統</h1>
        <p>說明：每10秒透過視訊鏡頭拍一張照片，並進行指針偵測及刻度辨識。</p>
        <div>
          <p>目前的資料為：{gaugeData}</p>
        </div>
        <video ref={this.videoRef} autoPlay alt="沒有鏡頭" />
        <img src={processedImage} alt="沒有處理過的照片" />
      </div>
    );
  }
}

export default CameraApp;
