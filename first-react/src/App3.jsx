import React from 'react';
import { BrowserRouter, Link,Navigate, Route,Routes} from 'react-router-dom'
import { useState } from 'react';

const App3 = () => {

  const [text, setText] = useState(null);

  const postMessage = () => {
    fetch('http://127.0.0.1:8000/backend/my-view/', {
      method: 'POST',
      headers: {
        // 'X-CSRFToken': 'SDJpbMYXkmiDwhVWP7agkbo4dDVzNdIe',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
       'data': text
      }),
    })
      .then(response => response.json())  // 解析响应数据为JSON
      .then(data => {
        console.log(data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
}
  
  return( 
    <div >
      <h1>Hello</h1>
      <input type="text" value={text} onChange={(e)=>setText(e.target.value)} ></input>
      <button onClick={postMessage}>post</button>
    <div className="data-display">
            {(text===null)?"目前還有沒有資料":"目前輸入的資料為 "+ text}
      </div>  
    </div>
  );
}
export default App3;