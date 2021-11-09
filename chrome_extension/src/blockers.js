import React, { useEffect } from 'react';
import { Typography, withStyles, makeStyles, Container } from "@material-ui/core"
import { Close, HelpOutline } from "@material-ui/icons"
import FadeIn from "react-fade-in"
/*global chrome*/
class SiteList extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            blackListSites: [], //list of blacklisted sites

            whiteListSites: [], //list of whitelisted sites

            isBlockerOn: false, //Is the blocker on or off. 

            statusChanged: false, //Check if the blocker has been made on or off. 

            blockMode: "blacklist", //Current mode of the blocker (whitelisting certain sites or blacklisting certain sites)

            fetchDone: false, //Check whether the data is done being fetched from the chrome storage

            correctPassword: "", //The password for unlocking the blocker

            unlockMode: false, //When this is true, show the popup for unlocking

            changePasswordMode: false, //When this is true, show the popup for changing the password to lock the website

            helpPopupActive: false, //When this is true, show the helpful tips popup 
        }

        this.passwordField = React.createRef()

        this.passwordFieldContainer = React.createRef()

        this.helpPopup = React.createRef() 
    }
    componentDidMount() {
        let storageCache = {} //Object to store fetched data from chrome storage
        const getData = new Promise((resolve, reject) => {
            chrome.storage.local.get(null, (items) => {
                Object.assign(storageCache, items)

                return resolve()
            })
        }) //Promise fetches data
            .then(() => {

                //Set state to the data fetched from the chrome storage
                this.setState({
                    blackListSites: storageCache.blackList,
                    whiteListSites: storageCache.whiteList,
                    fetchDone: true,
                    correctPassword: storageCache.password
                })
                if (storageCache.isBlockerOn) {
                    this.setState({ isBlockerOn: true })
                }
                this.setState({ blockMode: storageCache.blockMode })
            })
    }
    componentDidUpdate() {
        if (this.state.fetchDone) {

            //Code for adding a website to the blacklist or whitelist
            document.getElementById('addSite').addEventListener('click', (e) => {
                let siteList //Variable to store list from blacklist/whitelist depending on mode

                //Set list of sites to add to as current whitelist/blacklist, depending on the blocker's current mode 
                if (this.state.blockMode == "whitelist") {
                    siteList = [...this.state.whiteListSites]
                }

                else {
                    siteList = [...this.state.blackListSites]
                }

                //Allow users to only add sites to the whitelist by clicking the button when the blocker is turned off. Sites can be added to the blacklist regardless if the blocker is on or off.
                if (this.state.blockMode != "whitelist" || !this.state.isBlockerOn) {
                    let websiteInput = document.getElementById("SiteInput").value
                    console.log(websiteInput)
                    console.log(siteList)


                    //Validate if the website the user enters in is valid by checking if fetching data from the website's corresponding URL returns an error 
                    fetch(`https://${websiteInput}`, { credentials: 'same-origin', headers: { "Content-Type": "application/json" } }) 
                        .then(response => {
                            console.log(response)

                            //Regular expression to get website name from URL (www.(website-name).domain or (website-name).domain) portion of URL)
                            let extractSiteNameFromURL = new RegExp('(?<=//).+?[.][a-zA-Z]+(?=/)', 'g') 

                            let siteName = extractSiteNameFromURL.exec(response.url)[0]

                            //Check if website is already present on the whitelist/blacklist, depending on the blocker's current mode
                            if (!siteList.includes(siteName)) {
                                siteList.push(siteName)

                                //Adds the site to the whitelist/blacklist, depending on the blocker's current mode
                                if (this.state.blockMode == "whitelist") {
                                    let whiteList = siteList
                                    chrome.storage.local.set({ whiteList })
                                    this.setState({ whiteListSites: siteList })
                                }

                                else {
                                    let blackList = siteList
                                    chrome.storage.local.set({ blackList })
                                    this.setState({ blackListSites: siteList })
                                }
                            }
                        })
                }
            })

            //Adds the site to the whitelist/blacklist, depending on the blocker's current mode
            if (this.state.helpPopupActive) {
                document.getElementById("frame").addEventListener("click", () => {
                    if (document.activeElement.id != "helpPopup" && document.activeElement.id != "helpIcon") {
                        this.setState({helpPopupActive:false})
                    }
                })
            }
        }
    }
    render() {
        const { classes } = this.props

        //Code to handle turning the blocker on and off
        const setActive = () => {

            if (this.state.isBlockerOn) { //If blocker is on, ask user to enter the password 
                this.setState({ unlockMode: true })
            }

            else { //Turn blocker on
                this.setState({ statusChanged: true })
                let isBlockerOn = true
                this.setState({ isBlockerOn: true })
                this.setState({ unlockMode: false })
                chrome.storage.local.set({ isBlockerOn })
                let blockMode
                if (this.state.blockMode == "blacklist") {
                    blockMode = "blacklist"
                }
                else {
                    blockMode = "whitelist"
                }
                chrome.storage.local.set({ blockMode })
            }
        }


        let siteListJSX = []
        let selectedSites = []

        if (this.state.blockMode == "blacklist") {
            selectedSites = this.state.blackListSites
        }

        else {
            selectedSites = this.state.whiteListSites
        }


        selectedSites.forEach((site) => {
            console.log(site)
            siteListJSX.push(
                <div style={{ width: "200px", display: "inline-flex", justifyContent: "flex-start", alignItems: "center", marginBottom: "15px", paddingLeft: "15px" }}>
                    <Close onClick={() => {
                        let siteList
                        if (!this.state.isBlockerOn) {
                            if (this.state.blockMode == "whitelist") {
                                siteList = [...this.state.whiteListSites]
                            }

                            else {
                                siteList = [...this.state.blackListSites]
                            }

                            let siteIndex = siteList.indexOf(site)
                            siteList.splice(siteIndex, 1)

                            if (this.state.blockMode == "whitelist") {
                                let whiteList = siteList
                                this.setState({ whiteListSites: siteList })
                                chrome.storage.local.set({ whiteList })
                            }

                            else {
                                let blackList = siteList
                                this.setState({ blackListSites: siteList })
                                chrome.storage.local.set({ blackList })
                            }
                        }
                    }} style={{ marginRight: "10px", color: "red", cursor: "pointer", filter: "drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))", }} />
                    <div style={{ width: "13px", marginRight: "10px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <img src={`https://s2.googleusercontent.com/s2/favicons?domain_url=${site}`} />
                    </div>
                    <Typography style={{ fontSize: "11px" }}>{site}:</Typography>
                </div>
            )
        })

        //Message to be shown in DOM if there are no websites being whitelisted/blacklisted, depending on the mode of the blocker
        if (selectedSites.length == 0) {
            siteListJSX = [<Typography style={{ fontSize: "11px" }}>Add a website to get started...</Typography>]
        }

        //Function for validating whether the user has correctly entered the password to unlock the blocker
        const unlock = () => {

            //
            if (this.passwordField.current.value == this.state.correctPassword) {

                this.setState({ statusChanged: true }) //Tells the extension to play the animation for the status of the blocker (either on or off) being changed
                this.setState({ unlockMode: false }) //Makes popup disappear 
                this.setState({ isBlockerOn: false }) //Turning off the blocker
                chrome.storage.local.set({isBlockerOn:false}) //Storing status of blocker in chrome storage

            }

            //Adds red outline to password field if the entered password is incorrect, which disappears when the password field loses focus
            else {
                this.passwordField.current.focus()
                this.passwordField.current.style.border = "3px solid red"
                this.passwordField.current.addEventListener('blur', () => {
                    this.passwordField.current.style.border = "1px solid grey"
                })
            }
        }

        //Function for validating whether a newly chosen password meets the various requirements and accepting the password if it is valid. 
        const setPassword = () => {
            let enteredPassword = this.passwordField.current.value
            let passwordLength = enteredPassword.length

            let upperSymbolCheck = new RegExp("&|%|#|`", 'g').exec(enteredPassword) //Checks for number characters of this set (&, ` and #) in the password. 
            let lowerSymbolCheck = new RegExp(",|.|/|'|;|[[]").exec(enteredPassword) //Checks for number characters of this set (., /, ', ; and [) in the password.

            if (upperSymbolCheck == null) {
                upperSymbolCheck = ""
            }

            if (lowerSymbolCheck == null) {
                lowerSymbolCheck = ""
            }

            //Checks if length of password is at least 10 characters and if it has at least two characters from each of these sets :(&, ` and #) and (., /, ', ; and [). 
            if (passwordLength >= 10 && lowerSymbolCheck.length < 2 && upperSymbolCheck.length < 2) {
                this.setState({ correctPassword: this.passwordField.current.value })
                let password = this.passwordField.current.value
                chrome.storage.local.set({ password })
                this.setState({ changePasswordMode: false })
            }
        }

        //Closes popup for changing password and unlocking blocker
        const closePopup = () => {
            this.setState({changePasswordMode:false, unlockMode:false})
        }

        return (
            <div>
                {this.state.fetchDone ?
                    <div style={{ display: "flex", flexDirection: "column", rowGap: "20px", alignItems: "center" }} id="blocker">

                        {/*Code for popup*/}
                        {
                            this.state.unlockMode || this.state.changePasswordMode ?
                                <PopupDisplay unlock={unlock} setPassword={setPassword}
                                    unlockMode={this.state.unlockMode}
                                    correctPassword={this.state.correctPassword}
                                    passwordFieldContainer={this.passwordFieldContainer}
                                    closePopup={closePopup}
                                    passwordField={this.passwordField} />
                                :
                                null
                        }

                        
                        <div style={{ display: "flex", flexDirection: "column", width: "100%", position:"relative" }}>
                            <div style={{ display: "inline-flex", justifyContent: "center" }}>
                                {/*Headers*/}
                                {this.state.blockMode == "blacklist" ?
                                    <Typography variant="h1" style={{ marginBottom: "25px" }}>Blacklisted sites</Typography>
                                    :
                                    <Typography variant="h1" style={{ marginBottom: "25px" }}>Whitelisted sites</Typography>
                                }
                                <HelpOutline style={{ position: "absolute", right: "10px", top: "10px", cursor: "pointer" }}
                                    onClick={() => {
                                        this.setState({ helpPopupActive: true })
                                    }}
                                    id="helpIcon"
                                    ref={this.helpPopup}
                                />
                                {/*Code to display help popup*/}
                                {this.state.helpPopupActive ?
                                    <div style={{position:"absolute", top:"0px", left:"0px", width:"100%", zIndex:2, height:"100%"}}>
                                        <FadeIn style={{ position: "absolute", top: "42px"}}>
                                            <div id="helpPopup" style={{
                                                backgroundColor: "#00E673",
                                                position: "absolute", top: "42px",
                                                width: "130px", borderRadius: "25px",
                                                padding: "10px",
                                                right:"-65px"
                                            }}
                                            tabIndex={0}
                                            >
                                                <Typography>You can't add websites to your whitelist or remove websites from the blacklist when the blocker is active.</Typography>
                                            </div>
                                        </FadeIn>
                                    </div>
                                    :
                                    null
                                }
                            </div>
                            {/*Code to display whitelisted/blacklisted sites*/}
                            <div style={{ display: "flex", flexDirection: "column", height: "175px", overflowY: "auto", paddingLeft:"50px" }}>
                                {siteListJSX}
                            </div>
                        </div>

                        {/*Button to add website to blacklist/whitelist*/}
                        <div style={{ display: "inline-flex"}}>
                            <input type="text" id="SiteInput" placeholder="Enter link to the website" style={{borderRadius:"3px", border:"1px solid grey"}}/>
                            <button id="addSite" style={{marginLeft:"15px", }}>Add website to list</button>
                        </div>

                        <div className={classes.buttonContainer}>
                            <Typography variant="h1" style={{ marginRight: "30px" }}>Blocker Status:</Typography>
                            {
                                !this.state.statusChanged && !this.state.isBlockerOn ?
                                    <div style={{ backgroundColor: "#FF0600" }}>
                                        <button onClick={setActive}>Off</button>
                                    </div>
                                    :
                                    !this.state.statusChanged && this.state.isBlockerOn ?
                                        <div style={{ backgroundColor: "#00FF06", display: "flex", justifyContent: "flex-end" }}>
                                            <button onClick={setActive}>On</button>
                                        </div>
                                        :
                                        this.state.isBlockerOn ?
                                            <div className={classes.blockOn}>
                                                <button onClick={setActive}>On</button>
                                            </div>
                                            :
                                            <div className={classes.blockOff}>
                                                <button onClick={setActive}>Off</button>
                                            </div>

                            }
                        </div>

                        <div style={{ marginTop: "-12px", width: "100%", display: "flex", justifyContent: "space-between" }}>
                            {/*Button to switch between blacklist and whitelist mode*/}
                            <button 
                                onClick={() => { 
                                    let blockMode
                                    if (!this.state.isBlockerOn) {
                                        if (this.state.blockMode == "blacklist") {
                                            this.setState({ blockMode: "whitelist" })
                                            blockMode = "whitelist"
                                        }
                                        else {
                                            this.setState({ blockMode: "blacklist" })
                                            blockMode = "blacklist"
                                        }
                                        this.setState({ statusChanged: false })
                                        chrome.storage.local.set({ blockMode })
                                    }
                                    else {
                                        this.setState({ unlockMode: true })
                                    }
                                }}
                            >
                                <Typography variant="body2"
                                >Switch to {this.state.blockMode == "blacklist" ? "Whitelist" : "Blacklist"} Mode</Typography>
                            </button>
                            {/*Button to change password*/}
                            <button
                                onClick={() => {
                                    this.setState({ changePasswordMode: true })
                                }}
                            >
                                <Typography variant="body2"
                                >Change password</Typography>
                            </button>
                        </div>
                    </div>
                    :
                    null
                }
            </div>
        )
    }
}
//Stylesheet for the website blocker
const StyledSiteList = withStyles({
    "@keyframes on": {
        to: {
            transform: "translateX(50px)"
        }
    },
    "@keyframes off": {
        from: {
            transform: "translateX(50px)"
        },
        to: {
            transform: "translateX(0px)"
        }
    },
    buttonContainer: {
        display: "flex",
        justifyContent: "center",
        '& div': {
            height: "50px",
            borderRadius: "25px",
            width: "100px",
            display: "flex",
            justifyContent: "flex-start",
            '& button': {
                height: "50px",
                width: "50px",
                borderRadius: "50%",
            },
        },
    },
    blockOn: {
        backgroundColor: "#00FF06",
        '& button': {
            animationName: "$on",
            animationFillMode: "forwards",
            animationDuration: "0.35s"
        }
    },
    blockOff: {
        backgroundColor: "#FF0600",
        '& button': {
            animationName: "$off",
            animationFillMode: "forwards",
            animationDuration: "0.35s"
        }
    },
})(SiteList)

//Code for popup that appears when changing password or unlocking blocker
const PopupDisplay = (props) => {
    const { unlockMode, passwordFieldContainer, passwordField, unlock, setPassword, closePopup} = props

    //Stylesheet for popup
    let popupStyle = makeStyles({
        passwordPopup: {
            width: "360px",
            minHeight:"110px",
            backgroundColor: "white",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "center",
            borderRadius: "10px",
            '& input:focus': {
                outline: 'none !important'
            }
        },
    })
    const classes = popupStyle()


    useEffect(() => {
        passwordField.current.focus()

        //Close popup when user clicks outside of the popup
        document.getElementById("frame").addEventListener('click', () => {

             //Check if active element is not the password entry field, the password submit button, or the popup surrounding them
            if (document.activeElement.id != "passwordPopup" && document.activeElement.id != "password" && document.activeElement.id != "submitPassword") {
                closePopup()
            }
        })
    })

    return(
    <div style={{ height: "100%", width: "100%", position: "absolute", left: "0px", top: "0px", display: "flex", justifyContent: "center", alignItems: "center", background: "rgba(0,0,0,0.5)" }} ref={passwordFieldContainer}>

            <div id="passwordPopup" tabIndex={0} className={classes.passwordPopup}>
            <div style={{
                width: "100%",
                height: "30px",
                filter: "drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.4))",
                background: "#aaaaab",
                marginBottom: "15px",
                borderRadius: "10px 10px 0px 0px",
                position: "relative",
            }}>
                {unlockMode ? //Unlock mode means the popup will have the UI for unlocking the blocker. Otherwise, the popup will display the UI for changing the blocker's password. 
                    <Typography style={{ fontWeight: "bold" }} align="center">
                        Enter password to unlock blocker
                    </Typography>
                    :
                    <Typography style={{ fontWeight: "bold" }} align="center">
                        Change your password
                    </Typography>
                }
                <Close style={{
                    height: "15px", width: "15px", cursor: "pointer", position: "absolute", right: "11px",top: "3px" }} onClick={closePopup}/>
                </div>

                {/*Password input field*/}
            <input type="text" id="password" ref={passwordField} />
            <button
                onPaste={() => {
                    return false
                }}
                onClick={() => {
                    if (unlockMode) {
                        unlock()
                    }
                    else {
                        setPassword()
                    }
                }}
                id="submitPassword"
                style={{
                    filter: "drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.4))",
                    marginTop: "4px",
                    height: "20px",
                    background: "#aaaaab"
                }}
            >
                {unlockMode ?
                        <p style={{margin:"0px"}}>Turn off Blocker </p>
                    :
                        <p style={{ margin: "0px"}}>Change password </p>
                }
                </button>

                {!unlockMode ?
                    <Typography style={{fontSize:"13px", marginTop:"10px", marginBottom:"10px"}} align="justify">When creating a password, it has be at least 10 characters long, and must contain a minimum of two of these characters: &, ` and #.
                        The password also needs a minimum of two of the following characters: ., /, ', ; and ["</Typography>
                    :
                    null
                }
        </div>
    </div>
    )
}
export default StyledSiteList