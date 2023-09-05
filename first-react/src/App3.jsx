import React, { Component } from "react";
import { useState, useRef, useEffect } from "react";
import Button from "react-bootstrap/Button";
import "bootstrap/dist/css/bootstrap.min.css";
import Modal from "react-modal";

class MarkApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: null,
      images: null,
      imageElements: [],
      isModalOpen: false,
      compressedImages: [], // 用于存储多张压缩后的图片
      currentImageIndex: 0, // 用于跟踪当前显示的图片
    };
    this.videoRef = React.createRef();
    this.fileInputRef = React.createRef();
  }

  postMessage = () => {
    fetch("http://127.0.0.1:8000/api/MyData/", {
      method: "POST",
      headers: {
        // 'X-CSRFToken': 'SDJpbMYXkmiDwhVWP7agkbo4dDVzNdIe',
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: this.text,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

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

  handleUpload = (e) => {
    const images = [...e.target.files].map((file) => {
      return {
        name: file.name,
        url: URL.createObjectURL(file),
        file: file,
      };
    });
    this.setState({ images: images });
    for (let i = 0; i < images?.length; i++) {
      this.imageElements.push(
        <img
          src={images[i].url}
          alt=""
          style={{
            width: "100px",
          }}
        />
      );
    }
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
    console.log(currentImageIndex);
  };

  handlePreviousImage = () => {
    const { currentImageIndex, compressedImages } = this.state;

    if (currentImageIndex > 0) {
      this.setState({ currentImageIndex: currentImageIndex - 1 });
    }
    console.log(currentImageIndex);
  };

  closeModal = () => {
    this.setState({ compressedImages: [] });
    // 關閉模態框
    this.setState({ isModalOpen: false });
  };

  render() {
    const {
      text,
      images,
      imageElements,
      isModalOpen,
      compressedImages,
      currentImageIndex,
      fileInputRef,
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
        <input
          type="text"
          value={text}
          onChange={(e) => this.setState({ text: e.target.value })}
        ></input>
        <Button onClick={this.postMessage}>post</Button>
        <div className="data-display">
          {text === null ? "目前還有沒有資料" : "目前輸入的資料為 " + text}
        </div>
        <div>
          <label htmlFor="file-input">
            <input
              type="file"
              multiple
              id="file-input"
              accept="image/*"
              onChange={this.handleUpload}
              style={{ display: "none" }}
            />
            <Button as="span">Upload Images</Button>
            {/* <Button as="span" style={{ display: "inline" }} onClick={handleRemove}>
          Remove Images
        </Button> */}
            <div>{imageElements}</div>
          </label>
        </div>
        <Button onClick={this.postImage}>Submit</Button>
        {/* 模態框 */}
        <Modal isOpen={isModalOpen} onRequestClose={this.closeModal}>
          {/* 顯示當前索引的壓縮圖像 */}
          {compressedImages[currentImageIndex] && (
            <img
              src={compressedImages[currentImageIndex]}
              alt={`壓縮後 ${currentImageIndex}`}
            />
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

export default MarkApp;
