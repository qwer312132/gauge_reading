import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Modal from "react-modal";

class MarkApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: null,
      images: null,
      isModalOpen: false,
      compressedImages: [], // 存壓縮後的圖片
      currentImageIndex: 0, // 當前圖片索引
      mouseCoordinates: [], // 存每個圖片的座標
    };
    this.videoRef = React.createRef();
    this.fileInputRef = React.createRef();
  }

  postImage = () => {
    const formData = new FormData();
    formData.append("data", this.text);
    for (let i = 0; i < this.images?.length; i++) {
      formData.append("image", this.images[i].file);
    }
    fetch("http://127.0.0.1:8000/api/MyData/", {
      method: "POST",
      // headers: {
      //   "Content-Type": "multipart/form-data",
      // },
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

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

    // 遍歷每個文件並進行處理
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      const { compressedImages } = this.state;

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
            console.log(compressedImages);
          }
        };
      };
      reader.readAsDataURL(file);
    }
  };

  handleNextImage = () => {
    const { currentImageIndex, compressedImages } = this.state;
    if (currentImageIndex < compressedImages.length - 1) {
      this.setState({ currentImageIndex: currentImageIndex + 1 });
    }
    console.log(this.state.currentImageIndex);
  };

  handlePreviousImage = () => {
    const { currentImageIndex } = this.state;

    if (currentImageIndex > 0) {
      this.setState({ currentImageIndex: currentImageIndex - 1 });
    }
    console.log(this.state.currentImageIndex);
  };

  closeModal = () => {
    this.setState({ compressedImages: [] });
    // 關閉模態框
    this.setState({ isModalOpen: false });
  };

  handleImageClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const { mouseCoordinates, currentImageIndex } = this.state;
    const updatedCoordinates = [...mouseCoordinates];
    if (!updatedCoordinates[currentImageIndex]) {
      updatedCoordinates[currentImageIndex] = [];
    }
    updatedCoordinates[currentImageIndex].push({ x: mouseX, y: mouseY });

    this.setState({ mouseCoordinates: updatedCoordinates });
  };

  handleDeleteCoordinate = (indexToDelete) => {
    const { mouseCoordinates, currentImageIndex } = this.state;
    const updatedCoordinates = [...mouseCoordinates];
    updatedCoordinates[currentImageIndex] = updatedCoordinates[
      currentImageIndex
    ].filter((_, index) => index !== indexToDelete);

    this.setState({ mouseCoordinates: updatedCoordinates });
  };

  render() {
    const {
      // text,
      // images,
      isModalOpen,
      compressedImages,
      currentImageIndex,
      mouseCoordinates,
      // fileInputRef,
    } = this.state;
    return (
      <div>
        <h1>標註系統</h1>
        <button onClick={this.label}>標註系統</button>
        <input
          type="file"
          accept="image/*"
          onChange={this.handleFileChange}
          ref={this.fileInputRef}
          style={{ display: "none" }}
          multiple // 允許選擇多個文件
        />
        {/* 模態框 */}
        <Modal
          isOpen={isModalOpen}
          onRequestClose={this.closeModal}
          ariaHideApp={false}
        >
          {/* 顯示當前索引的壓縮圖像 */}
          <div className="image-container">
            {compressedImages[currentImageIndex] && (
              <img
                src={compressedImages[currentImageIndex]}
                alt={`壓縮後 ${currentImageIndex}`}
                onClick={this.handleImageClick}
              />
            )}
            {mouseCoordinates[currentImageIndex] &&
              mouseCoordinates[currentImageIndex].map((coordinate, index) => (
                <div
                  key={index}
                  className="red-dot"
                  style={{
                    left: coordinate.x,
                    top: coordinate.y,
                  }}
                ></div>
              ))}
          </div>

          {/* 添加“下一張”和“前一張”按鈕 */}
          <div>
            <button onClick={this.handlePreviousImage}>前一張</button>
            <button onClick={this.handleNextImage}>下一張</button>
          </div>
          <div className="coordinates-display">
            {mouseCoordinates[currentImageIndex] &&
              mouseCoordinates[currentImageIndex].map((coordinate, index) => (
                <div key={index}>
                  X: {coordinate.x}, Y: {coordinate.y}
                  <button onClick={() => this.handleDeleteCoordinate(index)}>
                    删除
                  </button>
                </div>
              ))}
          </div>
          <button onClick={this.closeModal}>關閉</button>
        </Modal>
      </div>
    );
  }
}

export default MarkApp;
