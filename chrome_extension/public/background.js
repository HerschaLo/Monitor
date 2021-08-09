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
	            chrome.tabs.create({ url: "break.html" })
		    .then((tab)=>{
                        setTimeout(()=>{
			chrome.tabs.remove(tab.id)}
			,7000)
			})
                }
            } else {
                // break time
                storageCache.breakTime -= 1
                console.log(storageCache.breakTime)

                if (storageCache.breakTime == 0){
                    storageCache.working = true
                    storageCache.breakTime = storageCache.breakTimeSetting
                    console.log('Starting Work Time')
		    chrome.tabs.create({url:"work.html"})
		    .then((tab)=>{
                        setTimeout(()=>{
			chrome.tabs.remove(tab.id)}
			,7000)
			})
                }
            }
            chrome.storage.local.set(storageCache)
        })
})





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
    let paused = false
    let working = true
    let procSiteTimes = {}
    let procSessions = 0
    let mode = 'blacklist'
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
    chrome.storage.local.set({ mode })
    chrome.storage.local.set({ breakTime })
    chrome.storage.local.set({ workTime })
    chrome.storage.local.set({working})
    chrome.storage.local.set({ paused })
    chrome.storage.local.set({ breakTimeSetting })
    chrome.storage.local.set({workTimeSetting})
})
chrome.tabs.onActivated.addListener(async () => {
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
            catch(e) {
                url = "null"
            }
            let curSiteExtractor = new RegExp('(?<=//).*[.][a-zA-Z]+(?=/)', 'g')
            let curSite = curSiteExtractor.exec(url)

            if (curSite == null) {
                curSite = "null"
            }
            else {
                curSite=curSite[0]
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
                    storageCache.procTime += (storageCache.curTime - storageCache.prevTime) / 1000

                    if (typeof storageCache.procSiteTimes[prevSite] === 'undefined') {
                        storageCache.procSiteTimes[prevSite]=0
                    }
                    storageCache.procSiteTimes[prevSite] += (storageCache.curTime - storageCache.prevTime) / 1000
                }
            })

            storageCache.prevTime = Date.now()

            console.log('time on websites:')

            console.log(storageCache.siteTimes)

            console.log('time on procrastination sites:')

            console.log(storageCache.procSiteTimes)

            chrome.storage.local.set(storageCache)

        })
})
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
            catch(e) {
                url="null"
            }
            let curSiteExtractor = new RegExp('(?<=//).*[.][a-zA-Z]+(?=/)', 'g')
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
                    storageCache.procTime += (storageCache.curTime - storageCache.prevTime) / 1000

                    if (typeof storageCache.procSiteTimes[prevSite] === 'undefined') {
                        storageCache.procSiteTimes[prevSite] = 0
                    }
                    storageCache.procSiteTimes[prevSite] += (storageCache.curTime - storageCache.prevTime) / 1000
                }
            })

            storageCache.prevTime = Date.now()

            console.log('time on websites:')

            console.log(storageCache.siteTimes)

            console.log('time on procrastination sites:')

            console.log(storageCache.procSiteTimes)

            chrome.storage.local.set(storageCache)

        })
})
chrome.windows.onFocusChanged.addListener(async () => {
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
            catch(e) {
                url = "null"
            }
            let curSiteExtractor = new RegExp('(?<=//).*[.][a-zA-Z]+(?=/)', 'g')
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
                    storageCache.procTime += (storageCache.curTime - storageCache.prevTime) / 1000

                    if (typeof storageCache.procSiteTimes[prevSite] === 'undefined') {
                        storageCache.procSiteTimes[prevSite] = 0
                    }
                    storageCache.procSiteTimes[prevSite] += (storageCache.curTime - storageCache.prevTime) / 1000
                }
            })

            storageCache.prevTime = Date.now()

            console.log('time on websites:')

            console.log(storageCache.siteTimes)

            console.log('time on procrastination sites:')

            console.log(storageCache.procSiteTimes)

            chrome.storage.local.set(storageCache)

        })
})
chrome.windows.onRemoved.addListener(async () => {
    let storageCache = {}

    const getData = new Promise((resolve, reject) => {

        chrome.storage.local.get(null, (items) => {
            Object.assign(storageCache, items)

            return resolve()
        })
    })
        .then(async () => {
            let windowCount;
            try {
                windowCount = await chrome.windows.getAll()
            }
            catch {
                ;
            }
            if (windowCount.length == 0) {
                console.log("browser off")
                console.log(storageCache.prevSites[1])
                let prevSite = storageCache.prevSites[1]

                if (typeof storageCache.siteTimes[prevSite] === 'undefined') {
                    storageCache.siteTimes[prevSite] = 0
                }

                storageCache.curTime = Date.now()

                storageCache.siteTimes[prevSite] += (storageCache.curTime - storageCache.prevTime) / 1000

                storageCache.blackList.forEach((site) => {
                    if (prevSite == site) {
                        storageCache.procTime += (storageCache.curTime - storageCache.prevTime) / 1000

                        if (typeof storageCache.procSiteTimes[prevSite] === 'undefined') {
                            storageCache.procSiteTimes[prevSite] = 0
                        }
                        storageCache.procSiteTimes[prevSite] += (storageCache.curTime - storageCache.prevTime) / 1000
                    }
                })

                storageCache.prevTime = Date.now()

                storageCache.prevSites=['null', 'null']

                console.log('time on websites:')

                console.log(storageCache.siteTimes)

                console.log('time on procrastination sites:')

                console.log(storageCache.procSiteTimes)
                storage
                chrome.storage.local.set(storageCache)
            }

        })
})