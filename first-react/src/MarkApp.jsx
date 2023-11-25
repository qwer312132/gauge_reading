import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Modal from "react-modal";

class MarkApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: null,
      images: [], //原圖 File格式
      isModalOpen: false,
      showImages: [], // url儲存的圖片 用來顯示在前端
      currentImageIndex: 0, // 當前圖片索引
      pointerCoordinates: [], // 存每個圖片的指針座標
      // scaleStartCoordinate: null, // 存圖片的起始座標
      // scaleEndCoordinate: null, // 存圖片的結束座標
      // scaleStartValue: null,
      // scaleEndValue: null,
      markClass: null, // 存每個圖片的標記類別 (1:起始刻度, 2:結束刻度, 3:指針, 4:圓盤中心)
      discFrameClick: 1, //1為畫起始點，2為畫結束點
      // discFrameStartCoordinates: [],
      // discFrameEndCoordinates: [],

      getImage: [],
      correctImageIndexs: [], //儲存 正確的SAM候選圖片 的索引 !!未重製!!
    };
    this.videoRef = React.createRef();
    this.fileInputRef = React.createRef();
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

    // console.log("傳的images:", files[0]);

    // for (let i = 0; i < files.length; i++) {
    //   const targetSize = 400;
    //   const aspectRatio = files[i].width / files[i].height;
    //   files[i].width = targetSize;
    //   files[i].height = targetSize / aspectRatio;
    // }
    // console.log("直接壓縮 傳的images:", files[0].width); //感覺是錯的

    this.setState({ images: files });
    // 遍歷每個文件並進行處理
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      const reader = new FileReader();
      const { showImages } = this.state;

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

          //原尺寸!
          // canvas.width = img.width;
          // canvas.height = img.height;
          // 在畫布上繪製壓縮後的圖像
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // 將壓縮後的圖像數據添加到數組中
          // showImages.push(canvas.toDataURL("image/jpeg"));
          //改成png;base64
          showImages.push(canvas.toDataURL("image/png"));
          // 如果處理完所有文件，將圖像數組存儲在狀態中並打開模態框
          if (showImages.length === files.length) {
            this.setState({ showImages, isModalOpen: true });
            // console.log("showImages:", showImages);
          }
        };
      };
      reader.readAsDataURL(file);
    }
  };

  handleNextImage = () => {
    const { currentImageIndex, showImages } = this.state;
    if (currentImageIndex < showImages.length - 1) {
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
      showImages: [],
      currentImageIndex: 0,
      pointerCoordinates: [], // 存每個圖片的指針座標
      // scaleStartCoordinate: null, // 存圖片的起始座標
      // scaleEndCoordinate: null, // 存圖片的結束座標
      // scaleStartValue: null,
      // scaleEndValue: null,
      // discCenterCoordinate: null,
      markClass: null, // 存每個圖片的標記類別 (1:起始刻度, 2:結束刻度, 3:指針, 4:圓盤)
      discFrameClick: 1, //1為畫起始點，2為畫結束點
      // discFrameStartCoordinates: [],
      // discFrameEndCoordinates: [],
      isModalOpen: false,
    });
  };

  submitModal = () => {
    const {
      showImages,
      images,
      pointerCoordinates,
      // scaleStartCoordinate,
      // scaleEndCoordinate,
      // scaleStartValue,
      // scaleEndValue,
      // discFrameStartCoordinates,
      // discFrameEndCoordinates,
      // discCenterCoordinate,
    } = this.state;
    //上傳的資料型態
    const formData = new FormData();
    formData.append("operation", "mark");
    formData.append("imageLength", showImages.length);

    // formData.append("image", images[0]);
    for (let i = 0; i < showImages?.length; i++) {
      formData.append(`image${i}`, images[i]);
      console.log(`image${i}:`, images[i]);
    }
    // for (let i = 0; i < pointerCoordinates?.length; i++) {
    //   formData.append(`pointerCoordinates${i}`, pointerCoordinates[i]);
    // }
    // formData.append(
    //   "scaleStartCoordinate",
    //   JSON.stringify(scaleStartCoordinate)
    // );
    // formData.append("scaleEndCoordinate", JSON.stringify(scaleEndCoordinate));
    // formData.append("scaleStartValue", scaleStartValue);
    // formData.append("scaleEndValue", scaleEndValue);
    formData.append("pointerCoordinates", JSON.stringify(pointerCoordinates));
    // formData.append(
    //   "discFrameStartCoordinates",
    //   JSON.stringify(discFrameStartCoordinates)
    // );
    // formData.append(
    //   "discFrameEndCoordinates",
    //   JSON.stringify(discFrameEndCoordinates)
    // );
    // formData.append(
    //   "discCenterCoordinate",
    //   JSON.stringify(discCenterCoordinate)
    // );
    // for (let i = 0; i < discFrameStartCoordinates?.length; i++) {
    //   formData.append(
    //     `discFrameStartCoordinates${i}`,
    //     discFrameStartCoordinates[i]
    //   );
    // }
    // for (let i = 0; i < discFrameEndCoordinates?.length; i++) {
    //   formData.append(
    //     `discFrameEndCoordinates${i}`,
    //     discFrameEndCoordinates[i]
    //   );
    // }
    // console.log("formdata:", formData);
    fetch("http://127.0.0.1:8000/api/MyData/", {
      method: "POST",
      headers: {
        // 這裡需要設置 Content-Type 為 undefined，以便自動生成 multipart/form-data
        // "Content-Type": undefined,
      },
      body: formData,
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        // console.log("data:", data);
        this.setState({ getImage: data.image });
        // console.log("getImage length:", this.state.getImage.length);
        // console.log("getImage:", this.state.getImage);
        alert("上傳成功");
        console.log("get image num:", data.image.size);
        // 遍歷 FormData
        for (let pair of formData.entries()) {
          console.log(pair[0] + ": " + pair[1]);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });

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
      // discFrameStartCoordinates,
      // discFrameEndCoordinates,
    } = this.state;

    switch (markClass) {
      // case 1:
      //   this.setState({ scaleStartCoordinate: { x: mouseX, y: mouseY } });
      //   break;
      // case 2:
      //   this.setState({ scaleEndCoordinate: { x: mouseX, y: mouseY } });
      //   break;
      case 3:
        const updatedCoordinates = [...pointerCoordinates];
        updatedCoordinates[currentImageIndex] = [{ x: mouseX, y: mouseY }];
        this.setState({ pointerCoordinates: updatedCoordinates });
        break;
      // case 4:
      // if (this.state.discFrameClick === 1) {
      //   const updatedStartCoordinates = [...discFrameStartCoordinates];
      //   const updatedEndCoordinates = [...discFrameEndCoordinates];
      //   updatedStartCoordinates[currentImageIndex] = [
      //     { x: mouseX, y: mouseY },
      //   ];
      //   updatedEndCoordinates[currentImageIndex] = null;
      //   this.setState({
      //     discFrameStartCoordinates: updatedStartCoordinates,
      //     discFrameEndCoordinates: updatedEndCoordinates,
      //     discFrameClick: 2,
      //   });
      // } else if (this.state.discFrameClick === 2) {
      //   const updatedEndCoordinates = [...discFrameEndCoordinates];
      //   updatedEndCoordinates[currentImageIndex] = [{ x: mouseX, y: mouseY }];
      //   this.setState({
      //     discFrameEndCoordinates: updatedEndCoordinates,
      //     discFrameClick: 1,
      //   });
      // }
      // break;
      // this.setState({ discCenterCoordinate: { x: mouseX, y: mouseY } });
      // break;
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
  handleCorrectImageIndexs = (e) => {
    const { correctImageIndexs } = this.state;
    const index = e.target.innerHTML - 1;
    //每三個只能選一個
    //如果correctImageIndexs裡面的值沒有index，就放進去
    if (!correctImageIndexs.includes(index)) {
      var indexToDelete = parseInt(index / 3);
      for (let i = 0; i < correctImageIndexs.length; i++) {
        if (
          correctImageIndexs[i] === 3 * indexToDelete ||
          correctImageIndexs[i] === 3 * indexToDelete + 1 ||
          correctImageIndexs[i] === 3 * indexToDelete + 2
        ) {
          correctImageIndexs.splice(i, 1);
        }
      }
      correctImageIndexs.push(index);
      // e.target.style.backgroundColor = "red";
    } else {
      //如果有，就刪掉
      const indexToDelete = correctImageIndexs.indexOf(index);
      correctImageIndexs.splice(indexToDelete, 1);
      // e.target.style.backgroundColor = "#f0f0f0";
    }
    //分類
    correctImageIndexs.sort((a, b) => a - b);
    this.setState({
      correctImageIndexs: correctImageIndexs,
    });
  };

  chooseBest = () => {
    const { correctImageIndexs } = this.state;
    const formData = new FormData();
    formData.append("operation", "choose_best");
    formData.append("correctImageIndexs", correctImageIndexs);
    //!!未放API!!
    fetch("http://127.0.0.1:8000/api/MyData/", {
      method: "POST",
      headers: {},
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("data:", data);
        alert("上傳成功");
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  render() {
    const {
      // text,
      // images,
      isModalOpen,
      showImages,
      currentImageIndex,
      pointerCoordinates,
      // fileInputRef,
      // scaleStartCoordinate,
      // scaleEndCoordinate,
      // scaleStartValue,
      // scaleEndValue,
      // discFrameStartCoordinates,
      // discFrameEndCoordinates,
      // discCenterCoordinate,
      getImage,
      correctImageIndexs,
    } = this.state;
    const isFirstImage = currentImageIndex === 0;
    const isLastImage = currentImageIndex === showImages.length - 1;
    return (
      <div>
        <h1>標示訓練系統</h1>
        <p>
          說明：
          選擇多張圖片開始進行標註，第一張圖片需要標示指針座標、圓盤座標、起始和結束刻度座標，
          <br />
          並填入起始和結束刻度大小，其餘只要標示指針座標和圓盤座標。送出後，選擇正確的候選圖片。
        </p>
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
        {
          //如果correctImageIndexs有不是空的
          correctImageIndexs.length > 0 && (
            <div>
              我覺得{" "}
              {
                //  把correctImageIndexs拿出來用逗號隔開 及時更新
                correctImageIndexs.map((index) => index + 1).join(",")
              }{" "}
              張圖片是最好的
              <button className="button" onClick={this.chooseBest}>
                確認
              </button>
            </div>
          )
        }
        <div className="wrap-3">
          {getImage &&
            getImage.map((image, index) => (
              //每三個一排
              <div key={index} className="wrap-3">
                <button
                  onClick={this.handleCorrectImageIndexs}
                  className={`button ${
                    correctImageIndexs.includes(index)
                      ? "white-blue-background"
                      : ""
                  }`}
                >
                  {index + 1}
                </button>
                <img src={`data:image/jpeg;base64,${image}`} alt="getImage們" />
              </div>
            ))}
        </div>
        <Modal
          isOpen={isModalOpen}
          onRequestClose={this.closeModal}
          ariaHideApp={false}
          className="no-wrap"
        >
          <div>
            <div className="image-container ">
              {showImages[currentImageIndex] && (
                <img
                  src={showImages[currentImageIndex]}
                  alt={`壓縮後 ${currentImageIndex}`}
                  onClick={this.handleImageClick}
                />
              )}
              {/* {currentImageIndex === 0 && scaleStartCoordinate && (
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
                                top: Math.min(
                                  startCoordinate.y,
                                  endCoordinate.y
                                ),
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
                )} */}

              {pointerCoordinates[currentImageIndex] &&
                pointerCoordinates[currentImageIndex].map(
                  (coordinate, index) => (
                    <div
                      key={index}
                      className="dot pink-dot"
                      style={{
                        left: coordinate.x,
                        top: coordinate.y,
                      }}
                    ></div>
                  )
                )}
            </div>
            <div>
              <button
                onClick={this.handlePreviousImage}
                className="button"
                disabled={isFirstImage}
              >
                上一張
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
              <button onClick={this.closeModal} className="button">
                關閉
              </button>
              <button onClick={this.submitModal} className="button">
                送出
              </button>
            </div>
          </div>
          <div>
            {/* {currentImageIndex === 0 && (
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
                          //{scaleEndValue !== null && { scaleEndValue }}
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
            )} */}

            <div className="coordinates-display">
              <button
                onClick={() => this.setState({ markClass: 3 })}
                className="button pink-button "
              >
                一點標註指針座標
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
            {/* <div className="coordinates-display">
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
            </div> */}
          </div>
        </Modal>
      </div>
    );
  }
}

export default MarkApp;
