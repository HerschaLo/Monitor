let website = null //Initialize variable for website name

window.addEventListener('load', () => {
    let unlockButton = document.getElementById('unlockButton') //Get unlockButton element
    let passwordField = document.getElementById('passwordField') //Get password field element
    unlockButton.addEventListener('click', () => {
        let storageCache = {} //Object to store data retrieved from chrome storage

        const getData = new Promise((resolve, reject) => {

            chrome.storage.local.get(null, (items) => {
                Object.assign(storageCache, items)

                return resolve()
            })
        })
            .then(async () => {
                console.log(passwordField.value)

                if (storageCache.password == passwordField.value) { //Execute code if user types in the right password
                    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true }) //get current tab

                    let websiteURL = storageCache.blockedTabIDsWithURLs[toString(tab.id)] //Get the URL that was blocked for the current blocked tab 

                    let websiteNameExtractor = new RegExp('(?<=//).+?[.][a-zA-Z]+(?=/)', 'g')
                    let websiteName = websiteNameExtractor.exec(websiteURL)

                    if (websiteName == null) {
                        websiteName = "null"
                    }

                    else {
                        websiteName = websiteName[0]
                    }

                    let blackList = storageCache.blackList

                    console.log(websiteName)

                    if (blackList.includes(websiteName)) {
                        let index = blackList.indexOf(websiteName)
                        blackList.splice(index, 1)
                    }

                    chrome.storage.local.set({ blackList }, () => {
                        window.location = `${websiteURL}`
                    })
                    
                }
            })
    })
})