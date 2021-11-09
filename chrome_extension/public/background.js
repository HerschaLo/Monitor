//Initialize variables for chrome extension
chrome.runtime.onInstalled.addListener(() => {
    let siteTimes = {} //Websites user has visited and amount of time user has spent on them starting from when they downloaded the extension. I didn't change it to totalSiteTimes because that 
    let daySiteTimes = {} //Websites user has visited and amount of time user has spent on them during the current day

    let whiteList = []
    let blackList = ['youtube.fandom.com']
    let prevSites = ['null', 'null'] //Holds the last two sites you've visited, including the site you're currently on 
    let blockMode = 'blacklist'
    let isBlockerOn = false
    let password = "test"
    let blockedTabIDsWithURLs = {} //IDs of tabs with websites that have been blocked + URL of blocked site

    let curTime = Date.now() //Timestamp for when user switches to a different website
    let prevTime = Date.now() //Timestamp for when user visited a website before switching
    let currentDate = new Date().getMonth() + "/" + new Date().getDate() 

    
    let dayProcTime = 0
    let dayProcSessions = 0 //Number of times user has procrastinated today
    let dayProcSiteTimes = {} //Time user has spent on different procrastination websites today
    let totalProcTime = 0 //Total time user has spent procrastinating 
    let totalProcSiteTimes = {} //Total time user has spent on different procrastination websites 
    let totalProcSessions = 0 //Number of times user has procrastinated total

    let workTime = 25
    let breakTime = 5
    let workTimeSetting = 25
    let breakTimeSetting = 5
    let pomodoroPaused = false
    let working = true


    chrome.alarms.create("Pomodoro", { periodInMinutes: 0.1 }) //Initialize pomodoro timer

    //Initialize all the above variables
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
chrome.alarms.onAlarm.addListener(() => {
    let storageCache = {} //Object to store data retrieved from chrome storage

    const getData = new Promise((resolve, reject) => {

        chrome.storage.local.get(null, (items) => {
            Object.assign(storageCache, items)

            return resolve()
        })
    })
        .then(() => {
            if (storageCache.paused) {
                console.log('Paused')
            }
            else if (storageCache.working) {
                storageCache.workTime -= 1 //Reduce counter for amount of time left for working
                console.log(storageCache.workTime)

                if (storageCache.workTime == 0) {//Switch timer to display counter for time left for break and reset counter for work time

                    storageCache.working = false
                    storageCache.workTime = storageCache.workTimeSetting
                    console.log('Starting Break Time')

                    chrome.notifications.create('break', { //Create notification when break starts
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
                storageCache.breakTime -= 1 //Reduce counter for amount of time left for working
                console.log(storageCache.breakTime)

                if (storageCache.breakTime == 0) {//Switch timer to display counter for time left for work and reset counter for break time 
                    storageCache.working = true
                    storageCache.breakTime = storageCache.breakTimeSetting
                    console.log('Starting Work Time')

                    chrome.notifications.create('work', {//Create notification when work starts
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

`Records the amount of time you've spent on a website after you leave it.
Chrome Manifest V3 doesn't allow you to just run a timer in the background that ticks up every second while you're on a site.
Manifest V3 disables background scripts after a few seconds. Instead, I get a timestamp for when the user vists
and exits a website, and subtract the difference to get the time.`
function trackBrowsingTime() { 

    let storageCache = {} //Object to store data retrieved from chrome storage

    const getData = new Promise((resolve, reject) => {

        chrome.storage.local.get(null, (items) => {
            Object.assign(storageCache, items)

            return resolve()
        })
    })
    .then(async () => {
        console.log(storageCache.prevSites)

        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true }) //Get current active tab of the user

        let url

        //Get tab URL if possible
        try {
            url = tab.url
        }
        catch (e) {
            url = "null"
        }

        //Using a regular expression to extract name of a website from the tab url
        let curSiteExtractor = new RegExp('(?<=//).+?[.][a-zA-Z]+(?=/)', 'g') 
        let curSite = curSiteExtractor.exec(url)
        if (curSite == null) {
            curSite = "null"
        }
        else {
            curSite = curSite[0]
        }

        
        storageCache.prevSites.push(curSite)//Add current site to list of last two sites visited, 
        storageCache.prevSites = storageCache.prevSites.slice(1) //remove the 3rd last visited site

        let prevSite = storageCache.prevSites[0] //Get 2nd last site visited 

        if (typeof storageCache.totalSiteTimes[prevSite] === 'undefined') { //Adds current site to list of total websites and time on each site if it's not already on the list 
            storageCache.totalSiteTimes[prevSite] = 0
        }

        storageCache.curTime = Date.now()

        storageCache.totalSiteTimes[prevSite] += (storageCache.curTime - storageCache.prevTime) / 1000 //Adds time spent on current site to total list of website and times on them 

        //Doing the same as above except for daily data
        if (typeof storageCache.daySiteTimes[prevSite] === 'undefined') {
            storageCache.daySiteTimes[prevSite] = 0
        }

        storageCache.curTime = Date.now()

        storageCache.daySiteTimes[prevSite] += (storageCache.curTime - storageCache.prevTime) / 1000

         //If the site you just left was one you blacklisted, it marks that as time you spent procrastinating 
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

        //If blocker is in whitelist mode, block all sites not on whitelist. If blocker is in blacklist mode, block all sites on the blacklist
        if ((storageCache.blackList.includes(curSite) && storageCache.blockMode == "blacklist" || !storageCache.whiteList.includes(curSite) && storageCache.blockMode == "whitelist" && curSite!="null") && storageCache.isBlockerOn) {
            if (storageCache.blockMode == "blacklist") {
                chrome.tabs.update(tab.id, { url: "blackListBlock.html" }) //Popup when blocking a blacklisted site
            }
            else {
                chrome.tabs.update(tab.id, { url: "whiteListBlock.html" }) //Popup when blocking a whitelisted site 
            }
            storageCache.blockedTabIDsWithURLs[toString(tab.id)] = url //Add tab ID of current tab to list of tabs with a blocked website
        }

        console.log('time on websites:')

        console.log(storageCache.totalSiteTimes)

        console.log('time on totalProcrastination sites:')

        console.log(storageCache.totalProcSiteTimes)

        chrome.storage.local.set(storageCache)

    })
}

//Record browsing time for previous website when user switches tab
chrome.tabs.onActivated.addListener(async () => {
    trackBrowsingTime()
})

//Resets time tracking for browsing and pomodoro timer when user opens chrome
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
//Record browsing time for previous website when user changes current tab URL
chrome.tabs.onUpdated.addListener(async () => {
   trackBrowsingTime()
})
//Record browsing time for previous website when user changes windows
chrome.windows.onFocusChanged.addListener(async () => {
    trackBrowsingTime()
})//Record browsing time for last visited website when user exits chrome 
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

