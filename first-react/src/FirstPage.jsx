import React from 'react';
import { useState, useEffect } from 'react';

import A from "./a.jpg";


const FirstPage=()=>{
    const StyleSheet={
        width:"100vw",
        height:"100vh",
        backgroundColor:"#FF2E63",
        display: "flex",
        alignItems:"center",
        justifyContent:"center",
        flexDirection:"column"
    }
    const [device,setDevice]=useState(window.innerWidth);
    
    const handleRWD=()=>{
            setDevice(window.innerWidth);
    }

    useEffect(()=>{ 
        window.addEventListener('resize', handleRWD);
        handleRWD();
        return(()=>{
            window.removeEventListener('resize',handleRWD);
        })
    }, []);

    return(
        <div style={StyleSheet}>
            <h1 style={{ color: "white", fontFamily: "Microsoft JhengHei" }}>我是第一頁</h1>
            <img src={A} alt="a" width={device} />
            <div style={{ width: "100%" }}>
            <img src={A} alt="a" />
            </div>
            
            
        </div>
    )
}

export default FirstPage;