import React, { useEffect } from 'react';
import { Typography, withStyles, makeStyles, Container } from "@material-ui/core"
import { Close, HelpOutline } from "@material-ui/icons"
import FadeIn from "react-fade-in"
/*global chrome*/
class SiteList extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            blackListSites: [],
            whiteListSites: [],
            isBlockerActive: false,
            statusChanged: false,
            displayedMode: "blacklist",
            fetchDone: false,
            correctPassword: "test",
            unlockMode: false,
            changePasswordMode: false,
            helpPopupActive:false,
        }
        this.passwordField = React.createRef()
        this.passwordFieldContainer = React.createRef()
        this.helpPopup = React.createRef()
    }
    componentDidMount() {
        let storageCache = {}
        const getData = new Promise((resolve, reject) => {
            chrome.storage.local.get(null, (items) => {
                Object.assign(storageCache, items)

                return resolve()
            })
        })
            .then(() => {
                this.setState({
                    blackListSites: storageCache.blackList,
                    whiteListSites: storageCache.whiteList,
                    fetchDone: true,
                    correctPassword: storageCache.password
                })
                if (storageCache.isBlockerActive) {
                    this.setState({ isBlockerActive: true })
                }
                this.setState({ displayedMode: storageCache.blockMode })
            })
    }
    componentDidUpdate() {
        if (this.state.fetchDone) {

            document.getElementById('addSite').addEventListener('click', (e) => {
                let siteList
                if (this.state.displayedMode == "whitelist") {
                    siteList = [...this.state.whiteListSites]
                }
                else {
                    siteList = [...this.state.blackListSites]
                }
                if (this.state.displayedMode != "whitelist" || !this.state.isBlockerActive) {
                    let websiteInput = document.getElementById("SiteInput").value
                    console.log(websiteInput)
                    console.log(siteList)

                    if (websiteInput.includes(/(https|http):[/][/]/)){
                        ;
                    }
                    fetch(`https://${websiteInput}`, { credentials: 'same-origin', headers: { "Content-Type": "application/json" } }) // returns a promise
                        .then(response => {
                            console.log(response)
                            let extractSiteNameFromURL = new RegExp('(?<=//).+?[.][a-zA-Z]+(?=/)', 'g')
                            let siteName = extractSiteNameFromURL.exec(response.url)[0]
                            if (!siteList.includes(siteName)) {
                                siteList.push(siteName)
                            }
                            if (this.state.displayedMode == "whitelist") {
                                let whiteList = siteList
                                chrome.storage.local.set({ whiteList })
                                this.setState({ whiteListSites: siteList })
                            }
                            else {
                                let blackList = siteList
                                chrome.storage.local.set({ blackList })
                                this.setState({ blackListSites: siteList })
                            }
                        })
                }
            })

            if (this.state.helpPopupActive) {
                document.getElementById("blocker").addEventListener("click", () => {
                    if (document.activeElement.id != "helpPopup" && document.activeElement.id != "helpIcon") {
                        this.setState({helpPopupActive:false})
                    }
                })
            }
        }
    }
    render() {
        const { classes } = this.props

        const setActive = () => {
            if (this.state.isBlockerActive) {
                this.setState({ unlockMode: true })
            }
            else {
                this.setState({ statusChanged: true })
                let isBlockerActive = true
                this.setState({ isBlockerActive: true })
                this.setState({ unlockMode: false })
                chrome.storage.local.set({ isBlockerActive })
                let blockMode
                if (this.state.displayedMode == "blacklist") {
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
        if (this.state.displayedMode == "blacklist") {
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
                        if (!this.state.isBlockerActive) {
                            if (this.state.displayedMode == "whitelist") {
                                siteList = [...this.state.whiteListSites]
                            }
                            else {
                                siteList = [...this.state.blackListSites]
                            }
                            let siteIndex = siteList.indexOf(site)
                            siteList.splice(siteIndex, 1)
                            if (this.state.displayedMode == "whitelist") {
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


        if (selectedSites.length == 0) {
            siteListJSX = [<Typography style={{ fontSize: "11px" }}>Add a website to get started...</Typography>]
        }

        const unlock = () => {
            if (this.passwordField.current.value == this.state.correctPassword) {
                this.setState({ statusChanged: true })
                this.setState({ unlockMode: false })
                this.setState({ isBlockerActive: false })
                let isBlockerActive = false
                chrome.storage.local.set({ isBlockerActive })
            }
            else {
                this.passwordField.current.focus()
                this.passwordField.current.style.border = "3px solid red"
                this.passwordField.current.addEventListener('blur', () => {
                    this.passwordField.current.style.border = "1px solid grey"
                })
            }
        }

        const setPassword = () => {
            let enteredPassword = this.passwordField.current.value
            let passwordLength = enteredPassword.length
            let upperSymbolCheck = new RegExp("&|%|#|`", 'g').exec(enteredPassword)
            let lowerSymbolCheck = new RegExp(",|.|/|'|;|[[]").exec(enteredPassword)
            if (upperSymbolCheck == null) {
                upperSymbolCheck = ""
            }
            if (lowerSymbolCheck == null) {
                lowerSymbolCheck = ""
            }
            if (passwordLength >= 10 && lowerSymbolCheck.length < 2 && upperSymbolCheck.length < 2) {
                this.setState({ correctPassword: this.passwordField.current.value })
                let password = this.passwordField.current.value
                chrome.storage.local.set({ password })
                this.setState({ changePasswordMode: false })
            }
        }

        const closePopup = () => {
            this.setState({changePasswordMode:false, unlockMode:false})
        }

        return (
            <div>
                {this.state.fetchDone ?
                    <div style={{ display: "flex", flexDirection: "column", rowGap: "20px", alignItems: "center" }} id="blocker">
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
                        <div style={{ display: "flex", flexDirection: "column", position: "relative", width: "100%" }}>
                            <div style={{display:"inline-flex", justifyContent:"center"}}>
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
                                {this.state.helpPopupActive ?
                                    <FadeIn>
                                        <div id="helpPopup" style={{
                                            backgroundColor: "#00E673",
                                            position: "absolute", top: "42px",
                                            width: "175px", borderRadius: "25px"
                                        }}
                                        >
                                            <Typography>You can't add websites to your whitelist or remove websites from the whitelist </Typography>
                                            <Typography>Don't put  </Typography>
                                        </div>
                                    </FadeIn>
                                    :
                                    null
                                }
                                </div>
                            <div style={{ display: "flex", flexDirection: "column", height: "175px", overflowY: "auto", paddingLeft:"50px" }}>
                                {siteListJSX}
                            </div>
                        </div>


                        <div style={{ display: "inline-flex"}}>
                            <input type="text" id="SiteInput" placeholder="Enter link to the website" style={{borderRadius:"3px", border:"1px solid grey"}}/>
                            <button id="addSite" style={{marginLeft:"15px", }}>Add website to list</button>
                        </div>

                        <div className={classes.buttonContainer}>
                            <Typography variant="h1" style={{ marginRight: "30px" }}>Blocker Status:</Typography>
                            {
                                !this.state.statusChanged && !this.state.isBlockerActive ?
                                    <div style={{ backgroundColor: "#FF0600" }}>
                                        <button onClick={() => { setActive() }}>Off</button>
                                    </div>
                                    :
                                    !this.state.statusChanged && this.state.isBlockerActive ?
                                        <div style={{ backgroundColor: "#00FF06", display: "flex", justifyContent: "flex-end" }}>
                                            <button onClick={() => { setActive() }}>On</button>
                                        </div>
                                        :
                                        this.state.isBlockerActive ?
                                            <div className={classes.blockOn}>
                                                <button onClick={() => { setActive() }}>On</button>
                                            </div>
                                            :
                                            <div className={classes.blockOff}>
                                                <button onClick={() => { setActive() }}>Off</button>
                                            </div>

                            }
                        </div>

                        <div style={{ marginTop: "-12px", width: "100%", display: "flex", justifyContent: "space-between" }}>
                            <button
                                onClick={() => {
                                    let blockMode
                                    if (!this.state.isBlockerActive) {
                                        if (this.state.displayedMode == "blacklist") {
                                            this.setState({ displayedMode: "whitelist" })
                                            blockMode = "whitelist"
                                        }
                                        else {
                                            this.setState({ displayedMode: "blacklist" })
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
                                >Switch to {this.state.displayedMode == "blacklist" ? "Whitelist" : "Blacklist"} Mode</Typography>
                            </button>
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

const PopupDisplay = (props) => {
    const { unlockMode, passwordFieldContainer, passwordField, unlock, setPassword, closePopup} = props

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
    }
    )
    const classes = popupStyle()

    useEffect(() => {
        passwordField.current.focus()
        document.getElementById("blocker").addEventListener('click', () => {
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
                {unlockMode ?
                    <Typography style={{ fontWeight: "bold" }} align="center">
                        Enter password to unlock blocker
                    </Typography>
                    :
                    <Typography style={{ fontWeight: "bold" }} align="center">
                        Change your password
                    </Typography>
                }
                <Close style={{
                    height: "15px", width: "15px", cursor: "pointer", position: "absolute", right: "11px",top: "3px" }} onClick={() => { closePopup() }}/>
            </div>

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