import React from "react";
import { useState, useRef, useEffect } from "react";
import Button from "react-bootstrap/Button";
import "bootstrap/dist/css/bootstrap.min.css";

const App3 = () => {
  const [text, setText] = useState(null);
  const [images, setImages] = useState(null);
  const imageElements = [];

  const postMessage = () => {
    fetch("http://127.0.0.1:8000/api/MyData/", {
      method: "POST",
      headers: {
        // 'X-CSRFToken': 'SDJpbMYXkmiDwhVWP7agkbo4dDVzNdIe',
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: text,
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

  const postImage = () => {
    const formData = new FormData();
    formData.append("data", text)
    for (let i = 0; i < images?.length; i++) {
      formData.append("image", images[i].file);
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

  const handleUpload = (e) => {
    const images = [...e.target.files].map((file) => {
      return {
        name: file.name,
        url: URL.createObjectURL(file),
        file:file,
      };
    });
    setImages(images);
  };

  // const handleRemove = () => {
  //   URL.revokeObjectURL(images?.url);
  //   setImages(null);
  //   if (inputRef.current) {
  //     inputRef.current.value = "";
  //   }
  // };

  // useEffect(() => {
  //   if (images?.length === 0) {
  //     if (inputRef.current) {
  //       inputRef.current.value = "";
  //     }
  //   }
  // }, [images]);

  for (let i = 0; i < images?.length; i++) {
    imageElements.push(
      <img
        src={images[i].url}
        alt=""
        style={{
          width: "100px",
        }}
      />
    );
  }
  return (
    <div>
      <h1>Hello</h1>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
      ></input>
      <Button onClick={postMessage}>post</Button>
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
            onChange={handleUpload}
            style={{ display: "none" }}
          />
          <Button as="span">Upload Images</Button>
          {/* <Button as="span" style={{ display: "inline" }} onClick={handleRemove}>
          Remove Images
        </Button> */}
          <div>{imageElements}</div>
        </label>
      </div>
      <Button onClick={postImage}>Submit</Button>
    </div>
  );
};
export default App3;
