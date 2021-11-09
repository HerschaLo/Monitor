//Makes error message show up for background script
try {
    importScripts('background.js')
}
catch (e) {
    console.log(e)
}