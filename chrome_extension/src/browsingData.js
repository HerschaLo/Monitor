import React, { useState, useEffect } from 'react';
import { Typography, makeStyles } from "@material-ui/core"
import { Close } from "@material-ui/icons"
/*global chrome*/
const BrowsingData = () => {
    const [mode, setMode] = useState("top")
    const [prevMode, setPrevMode] = useState("top")
    const [storageData, setStorageData] = useState([])
    const [allTimeWebsitesJSX, setAllTimeWebsitesJSX] = useState([])
    const [dailyWebsitesJSX, setDailyWebsitesJSX] = useState([])
    const [timeFrame, setTimeFrame] = useState("daily")
    const timeStyle = makeStyles({
        settingStyles: {
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "center",
            height: "375px",
            width: "375px",
            rowGap: "20px",
            '& button': {
                width: "175px",
                height:"65px"
            }
        }
    })
    const classes=timeStyle()
    useEffect(() => {
        let storageCache = {}
        var allTimeSites = []
        var dailyTimeSites = []
        const getData = new Promise((resolve, reject) => {
            chrome.storage.local.get(null, (items) => {
                Object.assign(storageCache, items)

                return resolve()
            })
        })
            .then(() => {
                let curSite = storageCache.prevSites[1]

                if (typeof storageCache.totalSiteTimes[curSite] === 'undefined') {
                    storageCache.totalSiteTimes[curSite] = 0
                }

                storageCache.curTime = Date.now()

                storageCache.totalSiteTimes[curSite] += (storageCache.curTime - storageCache.prevTime) / 1000

                storageCache.daySiteTimes[curSite] += (storageCache.curTime - storageCache.prevTime) / 1000
                storageCache.blackList.forEach((site) => {
                    if (curSite == site) {
                        storageCache.totalProcTime += (storageCache.curTime - storageCache.prevTime) / 1000

                        if (typeof storageCache.totalProcSiteTimes[curSite] === 'undefined') {
                            storageCache.totalProcSiteTimes[curSite] = 0
                        }
                        storageCache.totalProcSiteTimes[curSite] += (storageCache.curTime - storageCache.prevTime) / 1000

                        storageCache.dayProcTime += (storageCache.curTime - storageCache.prevTime) / 1000

                        if (typeof storageCache.dayProcSiteTimes[curSite] === 'undefined') {
                            storageCache.dayProcSiteTimes[curSite] = 0
                        }
                        storageCache.dayProcSiteTimes[curSite] += (storageCache.curTime - storageCache.prevTime) / 1000
                    }
                })

                storageCache.prevTime = Date.now()
                chrome.storage.local.set(storageCache)

                Object.keys(storageCache.totalSiteTimes).forEach((site) => {

                    allTimeSites.push(
                        [storageCache.totalSiteTimes[site], site]
                    )
                })

                Object.keys(storageCache.daySiteTimes).forEach((site) => {

                    dailyTimeSites.push(
                        [storageCache.daySiteTimes[site], site]
                    )
                })

                allTimeSites.sort((a, b) => a[0] - b[0]).reverse()
                dailyTimeSites.sort((a, b) => a[0] - b[0]).reverse()

                function createJSX(websiteData, timeSpan) {
                    let sitesSorted=[]
                    websiteData.forEach((site) => {
                        if (site[1] != 'null') {
                            let totalTime = site[0]
                            let hourCount = Math.floor(totalTime / 3600)
                            let minuteCount = Math.floor((totalTime - Math.floor(totalTime / 3600) * 3600) / 60)
                            let secondCount = Math.floor(totalTime - Math.floor(totalTime / 60) * 60)

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
                                            {hourCount}h {minuteCount}m {secondCount}s
                                        </Typography>
                                    </div>
                                </div>
                            )
                        }
                    })
                    if (timeSpan == "all") {
                        setAllTimeWebsitesJSX(sitesSorted)
                    }
                    else {
                        setDailyWebsitesJSX(sitesSorted)
                    }
                }
                createJSX(allTimeSites, "all")
                createJSX(dailyTimeSites, "today")
                setStorageData(storageCache)
            })
    }, [])

    let displaySites

    if (timeFrame == "daily") {
        displaySites = dailyWebsitesJSX
    }

    else {
        displaySites = allTimeWebsitesJSX
    }

    if (mode == "top") {
        displaySites=allTimeWebsitesJSX.slice(0,5)
    }
    console.log(displaySites)
    return (
        <div>
            <div style={{height:"100%", width:"100%"}}>
                {
                mode == "settings" ?
                        <div className={classes.settingStyles}>
                            <div style={{display:"flex", justifyContent:"flex-end", width:"100%"}}>
                                <Close onClick={() => { setMode(prevMode) }} style={{cursor:"pointer"}}/>
                            </div>
                            <Typography variant="h1">Modes</Typography>
                            <div style={{height:"100%", display:"flex", columnGap:"20px", alignItems:"center"}}>
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
            <button onClick={() => {
                if (timeFrame == "daily") {
                    setTimeFrame("all")
                }
                else {
                    setTimeFrame("daily")
                }
            }}>
                {mode == "daily" ?
                    <span>Display browsing data for today</span>
                    :
                    <span>Display browsing data for all time</span>
                }
            </button>
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