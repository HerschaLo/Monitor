import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
/*global chrome*/
class Renderer extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            mode:'top sites'
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
        const buttonStyle = { backgroundColor: "white", border: "6px solid #00e6e6" }
        return (
            <div style={{ width: "500px", height: "500px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", backgroundColor:"#008080" }}>
                <div style={{ border: "12px solid #00e6e6", display: "flex", justifyContent: "center", alignItems:"center", borderRadius: "20px", width:"450px", height:"450px"}}>
                {app}
                <div style={{display:"flex", flexDirection:"row", justifyContent:"center"}}>
                        <button onClick={(e) => { this.setState({ mode: 'top sites' }) }} style={{marginRight:"30px"}}>Display data for top 5 sites</button>
                    <button onClick={(e) => { this.setState({ mode: 'all sites' }) }}>Display data for all sites</button>
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
            workTimeSetting: 0,
            breakTimeSetting: 0,
            breakTime: 0,
            workTime: 0,
            paused: null,
            working:null,
        }
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
                    workTime: storageCache.workTimeSetting,
                    paused: storageCache.paused,
                    working:storageCache.working
                })
            })

    }
    render() {
        let time=[]
        if (this.state.working) {
            time.push(<p></p>)
        }
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
                    if (site != 'null') {
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
                    if (counter < 5 && site!='null') {
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