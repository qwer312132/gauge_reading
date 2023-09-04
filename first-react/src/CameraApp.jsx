import React, { Component } from "react";
import Modal from 'react-modal';

class CameraApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cameraStream: null,
      intervalId: null,
      gaugeData: "尚未取得資料",
      photoNum: 0,
      isModalOpen: false,
      compressedImages: [], // 用于存储多张压缩后的图片
      currentImageIndex: 0, // 用于跟踪当前显示的图片
    };
    this.videoRef = React.createRef();
    this.fileInputRef = React.createRef();
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

  label = () => {
    if (this.fileInputRef.current) {
      // 觸發文件選擇操作
      this.fileInputRef.current.click();
    }
    else{
      console.error("獲取後端數據時出錯：");
    }
  }

  handleFileChange = (event) => {
    const files = event.target.files;
    const compressedImages = [];

    // 遍歷每個文件並進行處理
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // 將畫布大小設置為 200x200 像素
          const targetSize = 400;
          const aspectRatio = img.width / img.height;
          canvas.width = targetSize;
          canvas.height = targetSize / aspectRatio;

          // 在畫布上繪製壓縮後的圖像
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // 將壓縮後的圖像數據添加到數組中
          compressedImages.push(canvas.toDataURL("image/jpeg"));

          // 如果處理完所有文件，將圖像數組存儲在狀態中並打開模態框
          if (compressedImages.length === files.length) {
            this.setState({ compressedImages, isModalOpen: true });
          }
        };
      };
      reader.readAsDataURL(file);
    }
  }

  handleNextImage = () => {
    const { currentImageIndex, compressedImages } = this.state;
    if (currentImageIndex < compressedImages.length - 1) {
      this.setState({ currentImageIndex: currentImageIndex + 1 });
    }
  }

  handlePreviousImage = () => {
    const { currentImageIndex, compressedImages } = this.state;
    if (currentImageIndex > 0) {
      this.setState({ currentImageIndex: currentImageIndex - 1 });
    }
  }

  closeModal = () => {
    // 關閉模態框
    this.setState({ isModalOpen: false });
  }

  render() {
    const { gaugeData, isModalOpen, compressedImages, currentImageIndex } = this.state;
    return (
      <div>
        <h1>相機拍照</h1>
        <div>
          <button onClick={this.getData}>獲取數據</button>
          <a>{gaugeData}</a>
          <button onClick={this.label}>標註系統</button>
          <input
            type="file"
            accept="image/*"
            onChange={this.handleFileChange}
            ref={this.fileInputRef}
            style={{ display: 'none' }}
            multiple // 允許選擇多個文件
          />
        </div>
        <video ref={this.videoRef} autoPlay />

        {/* 模態框 */}
        <Modal
          isOpen={isModalOpen}
          onRequestClose={this.closeModal}
        >
          {/* 顯示當前索引的壓縮圖像 */}
          {compressedImages[currentImageIndex] && (
            <img src={compressedImages[currentImageIndex]} alt={`壓縮後 ${currentImageIndex}`} />
          )}

          {/* 添加“下一張”和“前一張”按鈕 */}
          <div>
            <button onClick={this.handlePreviousImage}>前一張</button>
            <button onClick={this.handleNextImage}>下一張</button>
          </div>

          <button onClick={this.closeModal}>關閉</button>
        </Modal>
      </div>
    );
  }
}

export default CameraApp;
