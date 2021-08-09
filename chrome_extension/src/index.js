import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
/*global chrome*/
class Renderer extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            mode:'pomodoro'
        }
    }
    render() {
        let app
        if (this.state.mode == 'top sites') {
            app = (<Times />)
        }
        else if (this.state.mode == 'all sites') {
            app = (<AllTimes />)
        }
        else if (this.state.mode == 'pomodoro') {
            app = (<PomodoroTimer />)
        }
        const buttonStyle = { backgroundColor: "white", border: "6px solid #00e6e6" }
        return (
            <div style={{ width: "500px", height: "500px", display: "flex", alignItems: "center", justifyContent:"center", flexDirection: "column", backgroundColor:"#008080" }}>
                <div style={{ border: "12px solid #00e6e6", display: "flex", justifyContent: "space-around", alignItems:"center", flexDirection:"column", borderRadius: "20px", width:"450px", height:"450px", padding:"20px"}}>
                {app}
                <div style={{display:"flex", justifyContent:"space-around", flexDirection:"row"}}>
                        <button onClick={(e) => { this.setState({ mode: 'top sites' }) }}>Display browsing time for top 5 sites</button>
                        <button onClick={(e) => { this.setState({ mode: 'all sites' }) }}>Display browsing time for all sites</button>
                        <button onClick={(e) => { this.setState({ mode: 'pomodoro' }) }}>Show pomodoro timer</button>
                    </div>
                </div>
            </div>
        )
    }
}
class PomodoroTimer extends React.Component {
    constructor(props) {
        super(props)
        let storageCache = {}
        this.state = {
            workTimeSetting: 1,
            breakTimeSetting: 1,
            breakTime: 0,
            workTime: 0,
            paused: null,
            working:null,
        }
        this.changeBreakTime = this.changeBreakTime.bind(this)
        this.changeWorkTime = this.changeWorkTime.bind(this)
        const getData = new Promise((resolve, reject) => {
            chrome.storage.local.get(null, (items) => {
                Object.assign(storageCache, items)

                return resolve()
            })
        })
            .then(() => {
                this.setState({
                    workTimeSetting: storageCache.workTimeSetting,
                    breakTimeSetting: storageCache.breakTimeSetting,
                    breakTime: storageCache.breakTime,
                    workTime: storageCache.workTime,
                    paused: storageCache.paused,
                    working:storageCache.working
                })
            })

    }
    changeBreakTime(event) {
        if (event.target.value == '') {
            event.target.value = 0
        }
        this.setState({ breakTimeSetting: parseInt(event.target.value) })
        let breakTimeSetting = parseInt(event.target.value)
        chrome.storage.local.set({breakTimeSetting})
    }
    changeWorkTime(event) {
        if (event.target.value == '') {
            event.target.value=0
        }
        this.setState({ workTimeSetting: parseInt(event.target.value) })
        let workTimeSetting = parseInt(event.target.value)
        chrome.storage.local.set({ workTimeSetting })
    }
    render() {
        chrome.alarms.onAlarm.addListener(() => {
            let storageCache = {}
            const getData = new Promise((resolve, reject) => {
                chrome.storage.local.get(null, (items) => {
                    Object.assign(storageCache, items)

                    return resolve()
                })
            })
                .then(() => {
                    this.setState({
                        workTimeSetting: storageCache.workTimeSetting,
                        breakTimeSetting: storageCache.breakTimeSetting,
                        breakTime: storageCache.breakTime,
                        workTime: storageCache.workTime,
                        paused: storageCache.paused,
                        working: storageCache.working
                    })
                })
        })
        let time = 0
        let msg=''
        if (this.state.working) {
            time = this.state.workTime
            msg='Your next break is in:'
        }
        else {
            time = this.state.breakTime
            msg='Your remaining break time:'
        }
        return (
            <div style={{display:"flex", flexDirection:"column", justifyContent:"space-around", alignItems:"center"}}>
                <h2>
                    {msg}
                </h2>
                <p style={{ fontSize: "50px", fontWeight: "bold" }}>{time}m</p>
                <button onClick={() => {
                    this.setState({ breakTime: this.state.breakTimeSetting, workTime:this.state.workTimeSetting})
                    let breakTime = this.state.breakTimeSetting
                    let workTime = this.state.workTimeSetting
                    chrome.storage.local.set({ breakTime })
                    chrome.storage.local.set({ workTime })
                }}>
                    Reset
                </button>
                <h2>
                    Settings:
                </h2>
                <div style={{ display: "inline" }}>
                    <button onClick={(e)=>{
                        this.setState({ breakTimeSetting: this.state.breakTimeSetting + 1 })
                        let breakTimeSetting = this.state.breakTimeSetting+1
                        chrome.storage.local.set({breakTimeSetting})
                    }}>+</button>
		     <span>Break time:</span>
                     <input type="text" value={this.state.breakTimeSetting}
                        onChange={this.changeBreakTime} />
                    <span>m</span>
                    <button onClick={(e) => {
                        this.setState({ breakTimeSetting: this.state.breakTimeSetting - 1 })
                        let breakTimeSetting = this.state.breakTimeSetting-1
                        chrome.storage.local.set({ breakTimeSetting })
                    }}>-</button>
                </div>
                <br />
                <div style={{ display: "inline" }}>
                    <button onClick={(e) => {
                        this.setState({ workTimeSetting: this.state.workTimeSetting + 1 })
                        let workTimeSetting = this.state.workTimeSetting+1
                        chrome.storage.local.set({ workTimeSetting })
                    }}>+</button>
		    <span>Work time:</span>
                    <input type="text" value={this.state.workTimeSetting}
                        onChange={this.changeWorkTime} />
                    <span>m</span>
                    <button onClick={(e) => {
                        this.setState({ workTimeSetting: this.state.workTimeSetting - 1 })
                        let workTimeSetting = this.state.workTimeSetting-1
                        chrome.storage.local.set({ workTimeSetting })
                    }}>-</button>
                </div>
            </div>
            )
    }
}
class AllTimes extends React.Component {
    constructor(props) {
        super(props)
        let storageCache = {}
        var sites = []
        var sitesSorted = [<div><h1>Website Time Tracker</h1>
            <h2>Data for all websites</h2></div>]
        this.state = {
            websites: sitesSorted
        }
        const getData = new Promise((resolve, reject) => {
            chrome.storage.local.get(null, (items) => {
                Object.assign(storageCache, items)

                return resolve()
            })
        })
            .then(() => {
                let curSite = storageCache.prevSites[1]

                if (typeof storageCache.siteTimes[curSite] === 'undefined') {
                    storageCache.siteTimes[curSite] = 0
                }

                storageCache.curTime = Date.now()

                storageCache.siteTimes[curSite] += (storageCache.curTime - storageCache.prevTime) / 1000

                storageCache.blackList.forEach((site) => {
                    if (curSite == site) {
                        storageCache.procTime += (storageCache.curTime - storageCache.prevTime) / 1000

                        if (typeof storageCache.procSiteTimes[curSite] === 'undefined') {
                            storageCache.procSiteTimes[curSite] = 0
                        }
                        storageCache.procSiteTimes[curSite] += (storageCache.curTime - storageCache.prevTime) / 1000
                    }
                })

                storageCache.prevTime = Date.now()
                chrome.storage.local.set(storageCache)
                Object.keys(storageCache.siteTimes).forEach((site) => {
                    sites.push(
                        [storageCache.siteTimes[site], site]
                    )
                })
                sites.sort((a, b) => a[0] - b[0]).reverse()
                sites.forEach((site) => {
                    if (site[1] != 'null') {
                        sitesSorted.push(
                            <p>{site[1]}: <span style={{ fontWeight: "bold" }}>{Math.floor(site[0] / 3600)}h {Math.floor((site[0] - Math.floor(site[0] / 3600) * 3600) / 60)}m {Math.floor(site[0] - Math.floor(site[0] / 60) * 60)}s</span></p>)
                    }
                })
                this.setState({ websites: sitesSorted })
            })
    }
    render() {
        return (
            <div>
                {this.state.websites}
            </div>
        )
    }
}
class Times extends React.Component {
    constructor(props) {
        super(props)
        let storageCache = {}
        var sites = []
        var sitesSorted = [<div><h1>Website Time Tracker</h1>
            <h2>Top 5 websites by time spent</h2></div>]
        this.state = {
            websites: sitesSorted
        }
        const getData = new Promise((resolve, reject) => {
            chrome.storage.local.get(null, (items) => {
                Object.assign(storageCache, items)

                return resolve()
            })
        })
            .then(() => {
             let curSite = storageCache.prevSites[1]

            if (typeof storageCache.siteTimes[curSite] === 'undefined') {
                storageCache.siteTimes[curSite] = 0
            }

            storageCache.curTime = Date.now()

            storageCache.siteTimes[curSite] += (storageCache.curTime - storageCache.prevTime) / 1000

            storageCache.blackList.forEach((site) => {
                if (curSite == site) {
                    storageCache.procTime += (storageCache.curTime - storageCache.prevTime) / 1000

                    if (typeof storageCache.procSiteTimes[curSite] === 'undefined') {
                        storageCache.procSiteTimes[curSite]=0
                    }
                    storageCache.procSiteTimes[curSite] += (storageCache.curTime - storageCache.prevTime) / 1000
                }
            })
   
            storageCache.prevTime = Date.now()
            chrome.storage.local.set(storageCache)
            Object.keys(storageCache.siteTimes).forEach((site) => {
                sites.push(
                    [storageCache.siteTimes[site], site]
                )
            })
                sites.sort((a, b) => a[0] - b[0]).reverse()
                let counter=0
                sites.forEach((site) => {
                    if (counter < 5 && site[1]!='null') {
                        sitesSorted.push(
                            <p>{site[1]}: <span style={{ fontWeight: "bold" }}>{Math.floor(site[0] / 3600)}h {Math.floor((site[0] - Math.floor(site[0] / 3600) * 3600) / 60)}m {Math.floor(site[0] - Math.floor(site[0] / 60) * 60)}s</span></p>)
                    }
                    counter+=1
                })
            this.setState({websites:sitesSorted})
        })
    }
    render() {
        return (
            <div>
                {this.state.websites}
            </div>
        )
    }
}
ReactDOM.render(
  <React.StrictMode>
    <Renderer />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA