import React from "react"
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

class About extends React.Component{
    render(){
        return (
            <div>
                <p>這邊是關於我們</p>

            <Link to="/title"> <button >Title</button></Link>
            <Link to="/"> <button >Home</button></Link>
            </div>
        )
    }
}
export {About}