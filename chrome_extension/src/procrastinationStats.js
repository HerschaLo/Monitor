import React, { useState, useEffect} from 'react';
import { Typography } from "@material-ui/core"
/*global chrome*/
const ProcrastinationStats = () => {
    const [procSessions, setProcSessions] = useState(0)
    const [sites, setSites] = useState([])
    const [procSites, setProcSites] = useState([])
    useEffect(() => {
        let storageCache = {}
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
                setProcSites(storageCache.procSiteTimes)
                setSites(storageCache.siteTimes)
                setProcSessions(storageCache.procSessions)
            })
    }, [])
    let totalTime = 0
    let procTime = 0
    Object.values(sites).forEach((time) => {
        totalTime += time
    })
    Object.values(procSites).forEach((time) => {
        procTime += time
    })
    let procPercent = (procTime / totalTime * 100).toFixed(1)
    let procAverage
    if (procSessions == 0) {
        procAverage = 0
    }
    else {
        procAverage = (procTime / 60 / procSessions).toFixed(1)
    }
    console.log(procSessions)
    console.log(procTime)
    return (
        <div style={{ display: "flex", alignItems: "center", flexDirection: "column" }}>
            <div><Typography variant="h1" alltimes>Overall Browsing Habit Stats</Typography>
                <Typography>Time spent Procrastinating</Typography></div>
            <Typography style={{ fontSize: "35px", fontWeight: "bold" }}>{Math.floor(procTime / 3600)}h {((procTime - Math.floor(procTime / 3600) * 3600) / 60).toFixed(1)}m</Typography>
            <Typography>Percentage of time spent procrastinating:</Typography>
            <Typography style={{ fontSize: "35px", fontWeight: "bold" }}>{procPercent}%</Typography>
            <Typography>Average time per procrastination session:</Typography>
            <Typography style={{ fontSize: "35px", fontWeight: "bold" }}>{procAverage}m</Typography>
            <Typography>Websites which count towards procrastination are based off the list of blacklisted sites</Typography>
        </div>
    )
}

export default ProcrastinationStats