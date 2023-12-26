import React, { useEffect } from "react";
import { socket } from "../utils/socket";


import logo from '../logo.svg';
const Home = () => {
    useEffect(() => {
        socket.connect();
        
    }, []);
    return(
        <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    );
}

export default Home;