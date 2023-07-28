import React from "react"
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

class Home extends React.Component{
    render() {
        return (
            <div>
                <p>這裡是首頁</p>

                <button to="/about"> About</button>
                <button to="/title">Title</button>
            </div>
        )
    }
}
export {Home}