//Initialize variables for chrome extension
chrome.runtime.onInstalled.addListener(() => {
    let siteTimes = {}
    let whiteList = []
    let blackList = ['youtube.fandom.com']
    let prevSites = ['null', 'null']
    let curTime = Date.now()
    let prevTime = Date.now()
    let procTime = 0
    let workTime = 25
    let breakTime = 5
    let workTimeSetting = 25
    let breakTimeSetting = 5
    let blockedTabIDsWithURLs = {}
    let pomodoroPaused = false
    let working = true
    let procSiteTimes = {}
    let procSessions = 0
    let blockMode = 'blacklist'
    let isBlockerActive = false
    let password="test"
    chrome.alarms.create("Pomodoro", { periodInMinutes: 0.1 })
    chrome.storage.local.set({ siteTimes })
    chrome.storage.local.set({ whiteList })
    chrome.storage.local.set({ blackList })
    chrome.storage.local.set({ prevSites })
    chrome.storage.local.set({ curTime })
    chrome.storage.local.set({ prevTime })
    chrome.storage.local.set({ procTime })
    chrome.storage.local.set({ procSiteTimes })
    chrome.storage.local.set({ procSessions })
    chrome.storage.local.set({ isBlockerActive })
    chrome.storage.local.set({ blockMode })
    chrome.storage.local.set({ breakTime })
    chrome.storage.local.set({password})
    chrome.storage.local.set({ workTime })
    chrome.storage.local.set({ working })
    chrome.storage.local.set({ pomodoroPaused })
    chrome.storage.local.set({ breakTimeSetting })
    chrome.storage.local.set({ workTimeSetting })
    chrome.storage.local.set({blockedTabIDsWithURLs})
})

//Pomodoro time keeper
chrome.alarms.onAlarm.addListener(() => {
    let storageCache = {}

    const getData = new Promise((resolve, reject) => {

        chrome.storage.local.get(null, (items) => {
            Object.assign(storageCache, items)

            return resolve()
        })
    })
        .then(() => {
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

                if (storageCache.breakTime == 0){
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

        storageCache.blackList.forEach((site) => {
            if (prevSite == site) {
                storageCache.procSessions += 1
                storageCache.procTime += (storageCache.curTime - storageCache.prevTime) / 1000

                if (typeof storageCache.procSiteTimes[prevSite] === 'undefined') {
                    storageCache.procSiteTimes[prevSite] = 0
                }
                storageCache.procSiteTimes[prevSite] += (storageCache.curTime - storageCache.prevTime) / 1000
            }
        })

        storageCache.prevTime = Date.now()

        console.log(storageCache.blackList)

        if ((storageCache.blackList.includes(curSite) && storageCache.blockMode == "blacklist" || !storageCache.whiteList.includes(curSite) && storageCache.blockMode == "whitelist" && curSite!="null") && storageCache.isBlockerActive) {
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

        console.log('time on procrastination sites:')

        console.log(storageCache.procSiteTimes)

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