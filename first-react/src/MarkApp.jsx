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
      pointerCoordinates: [], // 存每個圖片的指針座標
      // discCoordinates: [], // 存每個圖片的圓盤座標
      scaleStartCoordinate: null, // 存圖片的起始座標
      scaleEndCoordinate: null, // 存圖片的結束座標
      scaleStartValue: null,
      scaleEndValue: null,
      markClass: null, // 存每個圖片的標記類別 (1:起始刻度, 2:結束刻度, 3:指針, 4:圓盤)
      discFrameClick: 1, //1為畫起始點，2為畫結束點
      discFrameStartCoordinates: [],
      discFrameEndCoordinates: [],
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
            // console.log(compressedImages);
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
  };

  handlePreviousImage = () => {
    const { currentImageIndex } = this.state;

    if (currentImageIndex > 0) {
      this.setState({ currentImageIndex: currentImageIndex - 1 });
    }
  };

  closeModal = () => {
    this.setState({
      compressedImages: [],
      currentImageIndex: 0,
      pointerCoordinates: [], // 存每個圖片的指針座標
      // discCoordinates: [], // 存每個圖片的圓盤座標
      scaleStartCoordinate: null, // 存圖片的起始座標
      scaleEndCoordinate: null, // 存圖片的結束座標
      markClass: null, // 存每個圖片的標記類別 (1:起始刻度, 2:結束刻度, 3:指針, 4:圓盤)
      discFrameClick: 1, //1為畫起始點，2為畫結束點
      discFrameStartCoordinates: [],
      discFrameEndCoordinates: [],
      isModalOpen: false,
    });
  };

  submitModal = () => {
    //上傳未完成

    this.closeModal();
  };

  handleImageClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const {
      pointerCoordinates,
      currentImageIndex,
      markClass,
      discFrameStartCoordinates,
      discFrameEndCoordinates,
    } = this.state;

    switch (markClass) {
      case 1:
        this.setState({ scaleStartCoordinate: { x: mouseX, y: mouseY } });
        break;
      case 2:
        this.setState({ scaleEndCoordinate: { x: mouseX, y: mouseY } });
        break;
      case 3:
        const updatedCoordinates = [...pointerCoordinates];
        updatedCoordinates[currentImageIndex] = [{ x: mouseX, y: mouseY }];
        this.setState({ pointerCoordinates: updatedCoordinates });
        break;
      case 4:
        if (this.state.discFrameClick === 1) {
          const updatedStartCoordinates = [...discFrameStartCoordinates];
          const updatedEndCoordinates = [...discFrameEndCoordinates];
          updatedStartCoordinates[currentImageIndex] = [
            { x: mouseX, y: mouseY },
          ];
          updatedEndCoordinates[currentImageIndex] = null;
          this.setState({
            discFrameStartCoordinates: updatedStartCoordinates,
            discFrameEndCoordinates: updatedEndCoordinates,
            discFrameClick: 2,
          });
        } else if (this.state.discFrameClick === 2) {
          const updatedEndCoordinates = [...discFrameEndCoordinates];
          updatedEndCoordinates[currentImageIndex] = [{ x: mouseX, y: mouseY }];
          this.setState({
            discFrameEndCoordinates: updatedEndCoordinates,
            discFrameClick: 1,
          });
        }
        break;
      default:
        break;
    }
  };

  handleDeleteCoordinate = (indexToDelete, deleteIndex) => {
    //deleteIndex=1:指針,2:圓盤全刪,3:圓盤結束刪

    const {
      pointerCoordinates,
      currentImageIndex,
      discFrameStartCoordinates,
      discFrameEndCoordinates,
    } = this.state;
    if (deleteIndex === 1) {
      const updatedCoordinates = [...pointerCoordinates];
      updatedCoordinates[currentImageIndex] = updatedCoordinates[
        currentImageIndex
      ].filter((_, index) => index !== indexToDelete);

      this.setState({ pointerCoordinates: updatedCoordinates });
    } else if (deleteIndex === 2) {
      const updatedStartCoordinates = [...discFrameStartCoordinates];
      const updatedEndCoordinates = [...discFrameEndCoordinates];
      updatedStartCoordinates[currentImageIndex] = updatedStartCoordinates[
        currentImageIndex
      ].filter((_, index) => index !== indexToDelete);
      updatedEndCoordinates[currentImageIndex] = updatedEndCoordinates[
        currentImageIndex
      ].filter((_, index) => index !== indexToDelete);
      this.setState({
        discFrameStartCoordinates: updatedStartCoordinates,
        discFrameEndCoordinates: updatedEndCoordinates,
        // discFrameClick: 1,
      });
    }
    if (deleteIndex === 3) {
      const updatedEndCoordinates = [...discFrameEndCoordinates];
      updatedEndCoordinates[currentImageIndex] = updatedEndCoordinates[
        currentImageIndex
      ].filter((_, index) => index !== indexToDelete);
      this.setState({
        discFrameEndCoordinates: updatedEndCoordinates,
        // discFrameClick: 1,
      });
    }
  };

  render() {
    const {
      // text,
      // images,
      isModalOpen,
      compressedImages,
      currentImageIndex,
      pointerCoordinates,
      // fileInputRef,
      scaleStartCoordinate,
      scaleEndCoordinate,
      scaleStartValue,
      scaleEndValue,
      discFrameStartCoordinates,
      discFrameEndCoordinates,
    } = this.state;
    const isFirstImage = currentImageIndex === 0;
    const isLastImage = currentImageIndex === compressedImages.length - 1;
    return (
      <div>
        <h1>標註系統</h1>
        <button onClick={this.label} className="button">
          標註系統
        </button>
        <input
          type="file"
          accept="image/*"
          onChange={this.handleFileChange}
          ref={this.fileInputRef}
          style={{ display: "none" }}
          multiple
        />
        <Modal
          isOpen={isModalOpen}
          onRequestClose={this.closeModal}
          ariaHideApp={false}
        >
          <div className="image-container">
            {compressedImages[currentImageIndex] && (
              <img
                src={compressedImages[currentImageIndex]}
                alt={`壓縮後 ${currentImageIndex}`}
                onClick={this.handleImageClick}
              />
            )}
            {currentImageIndex === 0 && scaleStartCoordinate && (
              <div
                className="dot red-dot"
                style={{
                  left: scaleStartCoordinate.x,
                  top: scaleStartCoordinate.y,
                }}
              ></div>
            )}
            {currentImageIndex === 0 && scaleEndCoordinate && (
              <div
                className="dot yellow-dot"
                style={{
                  left: scaleEndCoordinate.x,
                  top: scaleEndCoordinate.y,
                }}
              ></div>
            )}
            {discFrameStartCoordinates[currentImageIndex] &&
              !discFrameEndCoordinates[currentImageIndex] &&
              discFrameStartCoordinates[currentImageIndex].map(
                (coordinate, index) => (
                  <div
                    key={index}
                    className="dot blue-dot"
                    style={{
                      left: coordinate.x,
                      top: coordinate.y,
                    }}
                  ></div>
                )
              )}
            {discFrameStartCoordinates[currentImageIndex] &&
              discFrameEndCoordinates[currentImageIndex] &&
              //用兩座標畫出框
              discFrameStartCoordinates[currentImageIndex].map(
                (startCoordinate, startIndex) => (
                  <div>
                    {discFrameEndCoordinates[currentImageIndex] &&
                      discFrameEndCoordinates[currentImageIndex].map(
                        (endCoordinate, endIndex) => (
                          <div
                            className="draw-rect"
                            style={{
                              position: "absolute",
                              left: Math.min(
                                startCoordinate.x,
                                endCoordinate.x
                              ),
                              top: Math.min(startCoordinate.y, endCoordinate.y),
                              width: Math.abs(
                                endCoordinate.x - startCoordinate.x
                              ),
                              height: Math.abs(
                                endCoordinate.y - startCoordinate.y
                              ),
                              border: "2px solid blue",
                            }}
                          ></div>
                        )
                      )}
                  </div>
                )
              )}
            {pointerCoordinates[currentImageIndex] &&
              pointerCoordinates[currentImageIndex].map((coordinate, index) => (
                <div
                  key={index}
                  className="dot pink-dot"
                  style={{
                    left: coordinate.x,
                    top: coordinate.y,
                  }}
                ></div>
              ))}
          </div>
          <div>
            <button
              onClick={this.handlePreviousImage}
              className="button"
              disabled={isFirstImage}
            >
              前一張
            </button>
            <button
              onClick={this.handleNextImage}
              className="button"
              disabled={isLastImage}
            >
              下一張
            </button>
          </div>
          <div>
            {currentImageIndex === 0 && (
              <div>
                <div className="coordinates-display">
                  <button
                    onClick={() => this.setState({ markClass: 1 })}
                    className="button red-button "
                  >
                    標註起始刻度座標
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
                    標註結束刻度座標
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
            )}
            <div className="coordinates-display">
              <button
                onClick={() => this.setState({ markClass: 3 })}
                className="button pink-button "
              >
                標註指針座標
              </button>
              {pointerCoordinates[currentImageIndex] &&
                pointerCoordinates[currentImageIndex].map(
                  (coordinate, index) => (
                    <div key={index}>
                      X: {coordinate.x}, Y: {coordinate.y}
                      <button
                        onClick={() => {
                          this.handleDeleteCoordinate(index, 1);
                        }}
                        className="button"
                      >
                        删除
                      </button>
                    </div>
                  )
                )}
            </div>
            <div className="coordinates-display">
              <button
                onClick={() => this.setState({ markClass: 4 })}
                className="button blue-button"
              >
                兩點框出圓盤
              </button>
              {discFrameStartCoordinates[currentImageIndex] &&
                discFrameStartCoordinates[currentImageIndex].map(
                  (startCoordinate, startIndex) => (
                    <div key={startIndex}>
                      X: {startCoordinate.x}, Y:{startCoordinate.y}
                      <button
                        onClick={() => {
                          this.setState({
                            discFrameClick: 1,
                          });
                          this.handleDeleteCoordinate(startIndex, 2);
                        }}
                        className="button"
                      >
                        删除
                      </button>
                      {discFrameEndCoordinates[currentImageIndex] &&
                        discFrameEndCoordinates[currentImageIndex].map(
                          (endCoordinate, endIndex) => (
                            <div key={endIndex}>
                              X: {endCoordinate.x}, Y: {endCoordinate.y}
                              <button
                                onClick={() => {
                                  this.setState({
                                    discFrameClick: 2,
                                  });
                                  this.handleDeleteCoordinate(endIndex, 3);
                                }}
                                className="button"
                              >
                                删除
                              </button>
                            </div>
                          )
                        )}
                    </div>
                  )
                )}
            </div>
          </div>
          <button onClick={this.closeModal} className="button">
            關閉
          </button>
          <button onClick={this.submitModal} className="button">
            送出
          </button>
        </Modal>
      </div>
    );
  }
}

export default MarkApp;
