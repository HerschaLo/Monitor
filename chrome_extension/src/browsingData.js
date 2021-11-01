import React, { useState, useEffect } from 'react';
import { Typography, makeStyles } from "@material-ui/core"
import { Close } from "@material-ui/icons"
/*global chrome*/
const BrowsingData = () => {
    const [mode, setMode] = useState("top")
    const [prevMode, setPrevMode] = useState("top")
    const [rawData, setRawData] = useState([])
    const [websitesJSX, setWebsitesJSX] = useState([])
    const timeStyle = makeStyles({
        settingStyles: {
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-around",
            alignItems: "center",
            height: "350px",
            width: "350px",
            '& button': {
                width:"125px"
            }
        }
    })
    const classes=timeStyle()
    useEffect(() => {
        let storageCache = {}
        var sites = []
        let sitesSorted = []
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
                            <div style={{ display: "flex", marginBottom: "15px" }}>
                                <div style={{ width: "200px", display: "inline-flex", justifyContent: "flex-start", paddingLeft: "15px" }}>
                                    <div style={{ width: "13px", marginRight: "10px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                        <img src={`https://s2.googleusercontent.com/s2/favicons?domain_url=${site[1]}`} />
                                    </div>
                                    <Typography style={{ fontSize: "11px" }}>{site[1]}:</Typography>
                                </div>
                                <div style={{ display: "flex", justifyContent: "flex-start", width: "125px" }}>
                                    <Typography style={{ fontWeight: "bold" }}>
                                        {Math.floor(site[0] / 3600)}h {Math.floor((site[0] - Math.floor(site[0] / 3600) * 3600) / 60)}m {Math.floor(site[0] - Math.floor(site[0] / 60) * 60)}s
                                    </Typography>
                                </div>
                            </div>
                        )
                    }
                })
                setWebsitesJSX(sitesSorted)
                setRawData(sites)
            })
    }, [])
    let displaySites=websitesJSX
    if (mode == "top") {
        displaySites=websitesJSX.slice(0,5)
    }
    return (
        <div>
            <div style={{height:"100%"}}>
                {
                mode == "settings" ?
                        <div className={classes.settingStyles}>
                            <div style={{display:"flex", justifyContent:"flex-end", marginBottom:"75px", width:"100%"}}>
                                <Close onClick={() => { setMode(prevMode) }} style={{cursor:"pointer"}}/>
                            </div>
                            <Typography variant="h1" style={{marginBottom:"25px"}}>Modes</Typography>
                            <button onClick={() => {
                                    setMode('all')
                                    setPrevMode('all')
                            }}>
                                Display browsing time for all websites
                            </button>
                            <button onClick={() => {
                                    setMode('top')
                                    setPrevMode('top')
                            }}>
                                Display browsing time for top 5 websites
                            </button>
                    </div>
                    :
                    mode == "all" ?
                            <AllTimes websites={displaySites} />
                        :
                            <TopTimes websites={displaySites}/>
                    }
                </div>
            <Typography variant="body2" onClick={() => {
                if (mode == "top" || mode == "all") {
                    setMode('settings')
                }
                else {
                    setMode(prevMode)
                }

            }}
                align="center"
                style={{ cursor: "pointer", marginTop: "15px" }}>
                Change mode</Typography>
        </div>
    )
}
const AllTimes = (props) => {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Typography variant="h1" alltimes>Website Time Tracker</Typography>
            <Typography variant="h5">Data for all websites</Typography>
            <div style={{ height: "250px", overflowY: "scroll", display: "flex", flexDirection: "column", alignItems: "center" }}>
                {props.websites}
            </div>
        </div>
    )
}

const TopTimes = (props) => {
    return (
        <div style={{ display: "inline-flex" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Typography variant="h1" alltimes>Website Time Tracker</Typography>
                <Typography variant="h5" align="center">Top 5 websites by time spent</Typography>
                {props.websites}
            </div>
        </div>
    )
}
export default BrowsingData