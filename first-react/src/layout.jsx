import React from 'react';

const Layout=(props)=>{
    const navStyle={
        position:"fixed",
        top:"0",
        left:"0",
        width:"100%",
        height:"43px",
        backgroundColor:"rgb(66, 103, 178)",
        display:"flex",
        alignItems:"center"
    };
    const iconStyle={
        marginLeft:"10%",
        height:"25px",
        width:"25px",
        borderRadius:"1px",
        backgroundColor:"white"
    };
    const inputStyle={
        marginLeft:"5px",
        padding:"0px 7px",
        height:"25px",
        width:"28%",
        borderRadius:"2px",
        border:"none",
        backgroundImage:"url('https://cdn1.iconfinder.com/data/icons/hawcons/32/698627-icon-111-search-512.png')",
        backgroundPosition:"97% 50%",
        backgroundSize:"auto 80%",
        backgroundRepeat:"no-repeat"
    };
    return(
      <div>
          <div className="nav-bar" style={navStyle}>
            <div  className="icon" style={iconStyle}>
                <img style={{height:"120%"}} src="https://www.logospng.com/images/48/facebook-logo-fb-sketched-sketch-icon-48978.png" alt="icon"/>
            </div>
            <input placeholder="搜尋" style={inputStyle}/>
          </div>
          <div className="index-container" style={{marginTop:"43px"}}>
              {props.children}
          </div>
      </div>
    );
}
export default Layout;