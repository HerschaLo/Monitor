import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { makeStyles } from "@material-ui/core"
import ProcrastinationStats from "./procrastinationStats.js"
import PomodoroTimer from "./pomodoroTimer.js"
import BrowsingData from "./browsingData.js"
import BlackList from "./blockers.js"
/*global chrome*/

const Frame = () => {
    const [mode, setMode] = useState('pomodoro') //Controls which tool shows up e.g. pomodoro timer, website blocker
    const frameStyle = makeStyles({
        frame: {
            width: "560px",
            height: "560px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
            flexDirection: "column",
            backgroundColor: "#0073e6",
            padding: "20px",
            '& button': {
                borderRadius: "12px",
                border: "0",
                outline: "0",
                filter: "drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))",
                background: "#00E673",
                transition: "0.2s ease-in -out all",
            },
            '& button:hover': {
                transition: "0.2s ease-in -out all",
                cursor: "pointer",
                background: "#5cffad",
            },
            '& h1': {
                fontSize:"40px"
            }
        },
        frameButtons: {
            display: "inline-flex",
            justifyContent: "center",
            marginTop: "20px",
            flexWrap: "wrap",
            columnGap: "12px",
            '& button': {
                width: "100px",
                fontSize: "11px",
                height: "45px",
            }
        }
    })
        const classes = frameStyle()
        let app = [] 
        if (mode == 'browsingData') {
            app=(<BrowsingData />)
        }
        else if (mode == 'pomodoro') {
            app=(<PomodoroTimer />)
        }
        else if (mode == 'proc') {
            app=(<ProcrastinationStats />)
        }
        else if (mode == 'blacklist') {
            app=(<BlackList />)
        }
        return (
            <div className={classes.frame} id="frame">
                <div style={{ border: "12px solid #00e6e6", display: "flex", justifyContent: "space-around", alignItems:"center", flexDirection:"column", borderRadius: "20px", width:"500px", height:"500px", padding:"15px"}}>
                    <div style={{height:"400px"}}>
                        {app}
                    </div>
                    <div className={classes.frameButtons}>
                        <button onClick={(e) => { setMode('browsingData') }}>Display browsing data</button>
                        <button onClick={(e) => { setMode('proc') }}>Overall browsing habit data</button>
                        <button onClick={(e) => { setMode('pomodoro') }}>Show pomodoro timer</button>
                        <button onClick={(e) => { setMode('blacklist') }}>Block websites</button>
                    </div>
                </div>
            </div>
        )
}
ReactDOM.render(
  <React.StrictMode>
    <Frame/>
  </React.StrictMode>,
  document.getElementById('root')
);