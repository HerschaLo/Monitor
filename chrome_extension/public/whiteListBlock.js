

let website = null
window.addEventListener('load', () => {
    let unlockButton = document.getElementById('unlockButton')
    let passwordField = document.getElementById('passwordField')
    unlockButton.addEventListener('click', () => {
        let storageCache = {}

        const getData = new Promise((resolve, reject) => {

            chrome.storage.local.get(null, (items) => {
                Object.assign(storageCache, items)

                return resolve()
            })
        })
            .then(async () => {
                console.log(passwordField.value)

                if (storageCache.password == passwordField.value) {
                    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

                    let websiteURL = storageCache.blockedTabIDsWithURLs[toString(tab.id)]

                    let websiteNameExtractor = new RegExp('(?<=//).+?[.][a-zA-Z]+(?=/)', 'g')
                    let websiteName = websiteNameExtractor.exec(websiteURL)

                    if (websiteName == null) {
                        websiteName = "null"
                    }

                    else {
                        websiteName = websiteName[0]
                    }

                    let whiteList = storageCache.whiteList

                    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

                    console.log(websiteName)

                    if (!whiteList.includes(websiteName)) {
                        whiteList.push(websiteName)
                    }
                    chrome.storage.local.set({ whiteList }, () => {
                        window.location = `${websiteURL}`
                    })
                }
            })
    })
})