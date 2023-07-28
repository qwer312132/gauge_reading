import React from "react"
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

class Title extends React.Component {
    render(){
        return (
            <div>
                Title
            <Link to="/about"> <button >About</button></Link>
            <Link to="/"> <button >Home</button></Link>
            </div>
        )
    }
}
export {Title}