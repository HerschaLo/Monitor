//Initialize variables for chrome extension
chrome.runtime.onInstalled.addListener(() => {
    let siteTimes = {}
    let daySiteTimes = {}

    let whiteList = []
    let blackList = ['youtube.fandom.com']
    let prevSites = ['null', 'null']
    let blockMode = 'blacklist'
    let isBlockerOn = false
    let password = "test"
    let blockedTabIDsWithURLs = {}

    let curTime = Date.now()
    let prevTime = Date.now()
    let currentDate = new Date().getMonth() + "/" + new Date().getDate()

    
    let dayProcTime = 0
    let dayProcSessions = 0
    let dayProcSiteTimes = {}
    let totalProcTime = 0
    let totalProcSiteTimes = {}
    let totalProcSessions = 0

    let workTime = 25
    let breakTime = 5
    let workTimeSetting = 25
    let breakTimeSetting = 5
    let pomodoroPaused = false
    let working = true

    chrome.alarms.create("Pomodoro", { periodInMinutes: 0.1 })
    chrome.storage.local.set({ siteTimes })
    chrome.storage.local.set({daySiteTimes})

    chrome.storage.local.set({ whiteList })
    chrome.storage.local.set({ blackList })
    chrome.storage.local.set({ prevSites })
    chrome.storage.local.set({ blockedTabIDsWithURLs })
    chrome.storage.local.set({ isBlockerOn })
    chrome.storage.local.set({ blockMode })
    chrome.storage.local.set({ password })

    chrome.storage.local.set({ curTime })
    chrome.storage.local.set({ prevTime })
    chrome.storage.local.set({currentDate})

    chrome.storage.local.set({ totalProcTime })
    chrome.storage.local.set({ totalProcSiteTimes })
    chrome.storage.local.set({ totalProcSessions })
    chrome.storage.local.set({ dayProcTime })
    chrome.storage.local.set({ dayProcSiteTimes })
    chrome.storage.local.set({ dayProcSessions })

    chrome.storage.local.set({ breakTime })
    chrome.storage.local.set({ workTime })
    chrome.storage.local.set({ working })
    chrome.storage.local.set({ pomodoroPaused })
    chrome.storage.local.set({ breakTimeSetting })
    chrome.storage.local.set({ workTimeSetting })

})

//Pomodoro time keeper
chrome.alarms.onAlarm.addListener((alarm) => {
    let storageCache = {}

    const getData = new Promise((resolve, reject) => {

        chrome.storage.local.get(null, (items) => {
            Object.assign(storageCache, items)

            return resolve()
        })
    })
        .then(() => {
            if (alarm.name == "Pomodoro") {
                if (storageCache.paused) {
                    //wait
                    console.log('Paused')
                }
                else if (storageCache.working) {
                    storageCache.workTime -= 1
                    console.log(storageCache.workTime)
                    if (storageCache.workTime == 0) {
                        storageCache.working = false
                        storageCache.workTime = storageCache.workTimeSetting
                        console.log('Starting Break Time')
                        chrome.notifications.create('break', {
                            type: 'basic',
                            iconUrl: 'images/logo.png',
                            title: 'Time to Start Your Break!',
                            message: `Your next work session is in ${storageCache.breakTimeSetting} minutes`,
                            priority: 2
                        })
                        try {
                            setTimeout(() => {
                                chrome.notifications.clear("break")
                            }, 5000)
                        }
                        finally {

                        }
                    }
                } else {
                    // break time
                    storageCache.breakTime -= 1
                    console.log(storageCache.breakTime)

                    if (storageCache.breakTime == 0) {
                        storageCache.working = true
                        storageCache.breakTime = storageCache.breakTimeSetting
                        console.log('Starting Work Time')
                        chrome.notifications.create('work', {
                            type: 'basic',
                            iconUrl: 'images/logo.png',
                            title: 'Time to Start Working!',
                            message: `Your next break is in ${storageCache.workTimeSetting} minutes`,
                            priority: 2
                        })
                        try {
                            setTimeout(() => {
                                chrome.notifications.clear("work")
                            }, 5000)
                        }
                        finally {

                        }
                    }
                }

            }
            else {

            }
            chrome.storage.local.set(storageCache)
        })
})


function trackBrowsingTime() {
    let storageCache = {}

    const getData = new Promise((resolve, reject) => {

        chrome.storage.local.get(null, (items) => {
            Object.assign(storageCache, items)

            return resolve()
        })
    })
    .then(async () => {
        console.log(storageCache.prevSites)
        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
        let url
        try {
            url = tab.url
        }
        catch (e) {
            url = "null"
        }
        let curSiteExtractor = new RegExp('(?<=//).+?[.][a-zA-Z]+(?=/)', 'g')
        let curSite = curSiteExtractor.exec(url)
        if (curSite == null) {
            curSite = "null"
        }
        else {
            curSite = curSite[0]
        }
        storageCache.prevSites.push(curSite)
        storageCache.prevSites = storageCache.prevSites.slice(1)
        let prevSite = storageCache.prevSites[0]

        if (typeof storageCache.siteTimes[prevSite] === 'undefined') {
            storageCache.siteTimes[prevSite] = 0
        }

        storageCache.curTime = Date.now()

        storageCache.siteTimes[prevSite] += (storageCache.curTime - storageCache.prevTime) / 1000

        if (typeof storageCache.daySiteTimes[prevSite] === 'undefined') {
            storageCache.daySiteTimes[prevSite] = 0
        }

        storageCache.curTime = Date.now()

        storageCache.daySiteTimes[prevSite] += (storageCache.curTime - storageCache.prevTime) / 1000

        storageCache.blackList.forEach((site) => {
            if (prevSite == site) {
                storageCache.totalProcSessions += 1
                storageCache.totalProcTime += (storageCache.curTime - storageCache.prevTime) / 1000

                if (typeof storageCache.totalProcSiteTimes[prevSite] === 'undefined') {
                    storageCache.totalProcSiteTimes[prevSite] = 0
                }
                storageCache.totalProcSiteTimes[prevSite] += (storageCache.curTime - storageCache.prevTime) / 1000

                storageCache.dayProcSessions += 1
                storageCache.dayProcTime += (storageCache.curTime - storageCache.prevTime) / 1000

                if (typeof storageCache.dayProcSiteTimes[prevSite] === 'undefined') {
                    storageCache.dayProcSiteTimes[prevSite] = 0
                }
                storageCache.dayProcSiteTimes[prevSite] += (storageCache.curTime - storageCache.prevTime) / 1000
            }
        })

        storageCache.prevTime = Date.now()

        console.log(storageCache.blackList)

        if ((storageCache.blackList.includes(curSite) && storageCache.blockMode == "blacklist" || !storageCache.whiteList.includes(curSite) && storageCache.blockMode == "whitelist" && curSite!="null") && storageCache.isBlockerOn) {
            if (storageCache.blockMode == "blacklist") {
                chrome.tabs.update(tab.id, { url: "blackListBlock.html" })
            }
            else {
                chrome.tabs.update(tab.id, { url: "whiteListBlock.html" })
            }
            storageCache.blockedTabIDsWithURLs[toString(tab.id)] = url
        }
        console.log('time on websites:')

        console.log(storageCache.siteTimes)

        console.log('time on totalProcrastination sites:')

        console.log(storageCache.totalProcSiteTimes)

        chrome.storage.local.set(storageCache)

    })
}

//Switching tabs
chrome.tabs.onActivated.addListener(async () => {
    trackBrowsingTime()
})

//Resets time tracking for browsing when user opens chrome
chrome.windows.onCreated.addListener(function () {
    chrome.windows.getAll(function (windows) {
        console.log(windows.length)
        if (windows.length == 1) {

            chrome.alarms.create("Pomodoro", { periodInMinutes: 0.1 })
            console.log("browser started")

            let prevTime = Date.now()
            let curTime = Date.now()

            chrome.storage.local.set({ curTime })
            chrome.storage.local.set({ prevTime })

            let storageCache = {}

            const getData = new Promise((resolve, reject) => {

                chrome.storage.local.get(null, (items) => {
                    Object.assign(storageCache, items)

                    return resolve()
                })
            })
            .then(() => {
                let currentDate = new Date().getMonth() + "/" + new Date().getDate()
                if (storageCache.currentDate != currentDate && new Date().getHours() >= 6) {
                    let dayProcTime = 0
                    let dayProcSessions = 0
                    let dayProcSiteTimes = {}
                    let daySiteTimes = {}
                    chrome.storage.local.set({ dayProcTime })
                    chrome.storage.local.set({daySiteTimes})
                    chrome.storage.local.set({ dayProcSiteTimes })
                    chrome.storage.local.set({ dayProcSessions })
                    chrome.storage.local.set({ currentDate })
                }
            })
        }
    });
});

chrome.tabs.onUpdated.addListener(async () => {
   trackBrowsingTime()
})

chrome.windows.onFocusChanged.addListener(async () => {
    trackBrowsingTime()
})
chrome.windows.onRemoved.addListener(async () => {
    let windowCount;
    try {
        windowCount = await chrome.windows.getAll()
    }
    catch (e){
        console.log(e)
    }
    if (windowCount.length == 0) {
        await trackBrowsingTime()
        let prevSites = ['null', 'null']
        let blockedTabIDsWithURLs = {}
        chrome.storage.local.set({ prevSites })
        chrome.storage.local.set({blockedTabIDsWithURLs})
    }
})

