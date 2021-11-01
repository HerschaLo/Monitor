import React from 'react';
import './index.css';
import { Typography,  withStyles } from "@material-ui/core"
import { Add, Remove } from "@material-ui/icons"
/*global chrome*/
class PomodoroTimer extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            workTimeSetting: 1,
            breakTimeSetting: 1,
            breakTime: 0,
            workTime: 0,
            paused: null,
            working: null,
        }
        this.changeBreakTime = this.changeBreakTime.bind(this)
        this.changeWorkTime = this.changeWorkTime.bind(this)

    }
    changeBreakTime(event) {
        if (event.target.value == '') {
            event.target.value = 0
        }
        try {
            this.setState({ breakTimeSetting: parseInt(event.target.value) })
            let breakTimeSetting = parseInt(event.target.value)
            chrome.storage.local.set({ breakTimeSetting })
        }
        catch {

        }
    }
    changeWorkTime(event) {
        if (event.target.value == '') {
            event.target.value = 0
        }
        try {
            this.setState({ workTimeSetting: parseInt(event.target.value) })
            let workTimeSetting = parseInt(event.target.value)
            chrome.storage.local.set({ workTimeSetting })
        }
        catch {

        }
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
                    workTimeSetting: storageCache.workTimeSetting,
                    breakTimeSetting: storageCache.breakTimeSetting,
                    breakTime: storageCache.breakTime,
                    workTime: storageCache.workTime,
                    paused: storageCache.paused,
                    working: storageCache.working
                })
            })

        chrome.alarms.onAlarm.addListener(() => {
            let storageCache = {}
            const getData = new Promise((resolve, reject) => {
                chrome.storage.local.get(null, (items) => {
                    Object.assign(storageCache, items)

                    return resolve()
                })
            })
                .then(() => {
                    this.setState({
                        workTimeSetting: storageCache.workTimeSetting,
                        breakTimeSetting: storageCache.breakTimeSetting,
                        breakTime: storageCache.breakTime,
                        workTime: storageCache.workTime,
                        paused: storageCache.paused,
                        working: storageCache.working
                    })
                })
        })
    }
    render() {
        const { classes } = this.props
        let time = 0
        let msg = ''
        if (this.state.working) {
            time = this.state.workTime
            msg = 'Your next break is in:'
        }
        else {
            time = this.state.breakTime
            msg = 'Your remaining break time:'
        }
        return (
            <div style={{
                display: "flex", flexDirection: "column", justifyContent: "space-around", alignItems: "center", height: "100%"
            }}>
                <Typography variant="h5">
                    {msg}
                </Typography>
                <Typography style={{ fontSize: "50px", fontWeight: "bold" }}>{time}m</Typography>
                <div className={classes.setMode}>
                    <button onClick={() => {
                        this.setState({ breakTime: this.state.breakTimeSetting, workTime: this.state.workTimeSetting })
                        let breakTime = this.state.breakTimeSetting
                        let workTime = this.state.workTimeSetting

                        chrome.storage.local.set({ breakTime })
                        chrome.storage.local.set({ workTime })
                    }}>
                        Reset
                    </button>
                    <button onClick={() => {
                        this.setState({ working: true, workTime: this.state.workTimeSetting, breakTime: this.state.breakTimeSetting })
                        let working = true
                        let workTime = this.state.workTimeSetting
                        chrome.storage.local.set({ workTime })
                        chrome.storage.local.set({ working })
                    }}>
                        Start Work
                    </button>
                    <button onClick={() => {
                        this.setState({ working: false, workTime: this.state.workTimeSetting, breakTime: this.state.breakTimeSetting })
                        let working = false
                        let breakTime = this.state.breakTimeSetting
                        chrome.storage.local.set({ breakTime })
                        chrome.storage.local.set({ working })
                    }}>
                        Start Break
                    </button>
                </div>
                <Typography variant="h5">
                    Settings:
                </Typography>
                <div className={classes.adjustTime}>
                    <button onClick={(e) => {
                        this.setState({ breakTimeSetting: this.state.breakTimeSetting + 1 })
                        let breakTimeSetting = this.state.breakTimeSetting + 1
                        chrome.storage.local.set({ breakTimeSetting })
                    }}><Add /></button>
                    <span>Break time:</span>
                    <input type="text" value={this.state.breakTimeSetting}
                        onChange={this.changeBreakTime} />
                    <span>m</span>
                    <button onClick={(e) => {
                        this.setState({ breakTimeSetting: this.state.breakTimeSetting - 1 })
                        let breakTimeSetting = this.state.breakTimeSetting - 1
                        chrome.storage.local.set({ breakTimeSetting })
                    }}><Remove /></button>
                </div>
                <br />
                <div className={classes.adjustTime}>
                    <button onClick={(e) => {
                        this.setState({ workTimeSetting: this.state.workTimeSetting + 1 })
                        let workTimeSetting = this.state.workTimeSetting + 1
                        chrome.storage.local.set({ workTimeSetting })
                    }}><Add /></button>
                    <span>Work time:</span>
                    <input type="text" value={this.state.workTimeSetting}
                        onChange={this.changeWorkTime} />
                    <span>m</span>
                    <button onClick={(e) => {
                        this.setState({ workTimeSetting: this.state.workTimeSetting - 1 })
                        let workTimeSetting = this.state.workTimeSetting - 1
                        chrome.storage.local.set({ workTimeSetting })
                    }}><Remove /></button>
                </div>
            </div>
        )
    }
}

const StyledPomodoroTimer = withStyles({
    setMode: {
        display: "inline-flex",
        flexDirection: "row",
        columnGap: "15px",
        '& button': {
            width: "90px"
        }
    },
    adjustTime: {
        display: "inline-flex",
        '& button': {
            margin: "0px 10px 0px 10px",
            padding: "auto",
            height: "18px",
            width: "18px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        }
    }
})(PomodoroTimer)

export default StyledPomodoroTimer