import React, { Component } from "react";
import Modal from "react-modal";

class CameraApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isModalOpen: false,
      image: null,
      showImage: null,
      scaleStartCoordinate: null,
      scaleEndCoordinate: null,
      scaleStartValue: null,
      scaleEndValue: null,
      markClass: null, // 存每個圖片的標記類別 (1:起始刻度, 2:結束刻度
      discCenterCoordinate: null,
      cameraStream: null,
      intervalId: null,
      gaugeData: "尚未取得資料",
      photoNum: 0,
      processedImage: null,
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

  label = () => {
    if (this.fileInputRef.current) {
      // 觸發文件選擇操作
      this.fileInputRef.current.click();
    } else {
      console.error("獲取後端數據時出錯：");
    }
  };

  handleFileChange = (event) => {
    const files = event.target.files;
    this.setState({ image: files });
    // 遍歷每個文件並進行處理
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      let showImage = null;
      //直接上傳原圖
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          // 將畫布等比例縮放 寬為400
          const targetSize = 400;
          const aspectRatio = img.width / img.height;
          canvas.width = targetSize;
          canvas.height = targetSize / aspectRatio;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          showImage = canvas.toDataURL("image/png");
          this.setState({ showImage, isModalOpen: true });
        };
      };
      reader.readAsDataURL(file);
    }
  };
  handleImageClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const { markClass } = this.state;
    switch (markClass) {
      case 1:
        this.setState({ scaleStartCoordinate: { x: mouseX, y: mouseY } });
        break;
      case 2:
        this.setState({ scaleEndCoordinate: { x: mouseX, y: mouseY } });
        break;
      case 3:
        this.setState({ discCenterCoordinate: { x: mouseX, y: mouseY } });
        break;
      default:
        break;
    }
  };
  closeModal = () => {
    this.setState({
      showImages: null,
      scaleStartCoordinate: null, // 存圖片的起始座標
      scaleEndCoordinate: null, // 存圖片的結束座標
      scaleStartValue: null,
      scaleEndValue: null,
      markClass: null, // 存每個圖片的標記類別 (1:起始刻度, 2:結束刻度, 3:指針, 4:圓盤)
      isModalOpen: false,
      discCenterCoordinate: null,
    });
  };
  submitModal = () => {
    const {
      image,
      scaleStartCoordinate,
      scaleEndCoordinate,
      scaleStartValue,
      scaleEndValue,
      discCenterCoordinate,
    } = this.state;
    //上傳的資料型態
    const formData = new FormData();
    formData.append("operation", "reference");
    formData.append("image", image[0]);
    formData.append(
      "scaleStartCoordinate",
      JSON.stringify(scaleStartCoordinate)
    );
    formData.append("scaleEndCoordinate", JSON.stringify(scaleEndCoordinate));
    formData.append("scaleStartValue", scaleStartValue);
    formData.append("scaleEndValue", scaleEndValue);
    formData.append(
      "discCenterCoordinate",
      JSON.stringify(discCenterCoordinate)
    );
    fetch("http://127.0.0.1:8000/api/MyData/", {
      method: "POST",
      headers: {},
      body: formData,
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        this.setState({ getImage: data.image });
        alert("上傳成功");
      })
      .catch((error) => {
        console.error("Error:", error);
      });
    this.closeModal();
  };
  //視訊鏡頭
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
            return response.json();
          })
          .then((data) => {
            console.log("收到處理過的照片");
            this.setState({ photoNum: photoNum + 1 });
            this.setState({
              gaugeData: data.message,
              processedImage: data.image,
            });
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
      isModalOpen,
      showImage,
      scaleStartCoordinate,
      scaleEndCoordinate,
      scaleStartValue,
      scaleEndValue,
      discCenterCoordinate,
      // compressedImages,
      // currentImageIndex,
      processedImage,
    } = this.state;
    return (
      <div>
        <h1>偵測辨別系統</h1>
        <p>
          說明：
          <br />
          選擇一張圖片，標記起始與結束的刻度座標和大小，決定刻度計算方式。
        </p>
        <button onClick={this.label} className="button">
          標註刻度
        </button>
        <input
          type="file"
          accept="image/*"
          onChange={this.handleFileChange}
          ref={this.fileInputRef}
          style={{ display: "none" }}
        />
        <p>
          說明：
          <br />
          每10秒透過視訊鏡頭拍一張照片，並進行指針偵測及刻度辨識。
        </p>
        <div>
          <p>目前的資料為：{gaugeData}</p>
        </div>
        <video ref={this.videoRef} autoPlay alt="沒有鏡頭" />
        <img src={`data:image/jpeg;base64,${processedImage}`} alt="沒有處理過的照片" />
        <Modal
          isOpen={isModalOpen}
          onRequestClose={this.closeModal}
          ariaHideApp={false}
          className="no-wrap"
        >
          <div>
            <div className="image-container ">
              {showImage && (
                <img
                  src={showImage}
                  alt={`壓縮後 `}
                  onClick={this.handleImageClick}
                />
              )}
              {scaleStartCoordinate && (
                <div
                  className="dot red-dot"
                  style={{
                    left: scaleStartCoordinate.x,
                    top: scaleStartCoordinate.y,
                  }}
                ></div>
              )}
              {scaleEndCoordinate && (
                <div
                  className="dot yellow-dot"
                  style={{
                    left: scaleEndCoordinate.x,
                    top: scaleEndCoordinate.y,
                  }}
                ></div>
              )}
              {discCenterCoordinate && (
                <div
                  className="dot blue-dot"
                  style={{
                    left: discCenterCoordinate.x,
                    top: discCenterCoordinate.y,
                  }}
                ></div>
              )}
            </div>
            <div>
              <button onClick={this.closeModal} className="button">
                關閉
              </button>
              <button onClick={this.submitModal} className="button">
                送出
              </button>
            </div>
          </div>
          <div>
            {
              <div>
                <div className="coordinates-display">
                  <button
                    onClick={() => this.setState({ markClass: 3 })}
                    className="button blue-button "
                  >
                    一點標註圓盤中心座標
                  </button>
                  {discCenterCoordinate && (
                    <div>
                      X: {discCenterCoordinate.x}, Y: {discCenterCoordinate.y}
                      <button
                        onClick={() =>
                          this.setState({ discCenterCoordinate: null })
                        }
                        className="button "
                      >
                        删除
                      </button>
                    </div>
                  )}
                </div>
              </div>
            }
            {
              <div>
                <div className="coordinates-display">
                  <button
                    onClick={() => this.setState({ markClass: 1 })}
                    className="button red-button "
                  >
                    一點標註起始刻度座標
                  </button>
                  {scaleStartCoordinate && (
                    <div>
                      X: {scaleStartCoordinate.x}, Y: {scaleStartCoordinate.y}
                      {scaleStartCoordinate && (
                        <div>
                          <input
                            type="number"
                            placeholder="輸入起始刻度值"
                            onChange={(e) =>
                              this.setState({
                                scaleStartValue: e.target.value,
                              })
                            }
                          />
                          <div>起始刻度值: {scaleStartValue}</div>
                        </div>
                      )}
                      <button
                        onClick={() =>
                          this.setState({ scaleStartCoordinate: null })
                        }
                        className="button "
                      >
                        删除
                      </button>
                    </div>
                  )}
                </div>
                <div className="coordinates-display">
                  <button
                    onClick={() => this.setState({ markClass: 2 })}
                    className="button yellow-button"
                  >
                    一點標註結束刻度座標
                  </button>
                  {scaleEndCoordinate && (
                    <div>
                      X: {scaleEndCoordinate.x}, Y: {scaleEndCoordinate.y}
                      {scaleEndCoordinate && (
                        <div>
                          <input
                            type="number"
                            placeholder="輸入結束刻度值"
                            onChange={(e) =>
                              this.setState({
                                scaleEndValue: e.target.value,
                              })
                            }
                          />
                          {/* {scaleEndValue !== null && { scaleEndValue }} */}
                          <div>結束刻度值: {scaleEndValue}</div>
                        </div>
                      )}
                      <button
                        onClick={() =>
                          this.setState({ scaleEndCoordinate: null })
                        }
                        className="button "
                      >
                        删除
                      </button>
                    </div>
                  )}
                </div>
              </div>
            }
          </div>
        </Modal>
      </div>
    );
  }
}

export default CameraApp;
