/*
# Aura-wasm

Copyright © 2025 Litebrowsers
Licensed under a Proprietary License

This software is the confidential and proprietary information of Litebrowsers
Unauthorized copying, redistribution, or use is prohibited.
For licensing inquiries, contact:
vera cohopie at gmail dot com
thor vancet at gmail dot com
*/

export default function () {
    const windowKeys = Object.keys(window)
    const consoleKeys = Object.keys(console)
    const navigatorKeys = []
    for (const i in navigator) {
        navigatorKeys.push(navigator[i])
    }
    const iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    iframe.src = 'www.google.com'
    document.body.appendChild(iframe)

    const iContentWindow = enumerate(iframe.contentWindow, Object.keys(iframe.contentWindow))
    document.body.removeChild(iframe)
    return {
        window: enumerate(window, windowKeys),
        console: enumerate(console, consoleKeys),
        navigator: enumerateNavigator(),
        icontentWindow: iContentWindow,
        version: 1
    }
}

function enumerateNavigator () {
    let countOfObjects = 0
    let countOfStrings = 0
    let countOfBooleans = 0
    let countOfNumbers = 0
    let countOfFunctions = 0
    let countOfUncertainties = 0
    let countOfUnknowns = 0
    for (const i in navigator) {
        switch (typeof navigator[i]) {
            case 'object':
                countOfObjects += 1
                break
            case 'string':
                countOfStrings += 1
                break
            case 'boolean':
                countOfBooleans += 1
                break
            case 'number':
                countOfNumbers += 1
                break
            case 'function':
                countOfFunctions += 1
                break
            case 'undefined':
                countOfUncertainties += 1
                break
            default:
                countOfUnknowns += 1
        }
    }
    return {
        objects: countOfObjects,
        strings: countOfStrings,
        booleans: countOfBooleans,
        numbers: countOfNumbers,
        functions: countOfFunctions,
        uncertainties: countOfUncertainties,
        unknowns: countOfUnknowns
    }
}

function enumerate (parent, fields) {
    let countOfObjects = 0
    let countOfStrings = 0
    let countOfBooleans = 0
    let countOfNumbers = 0
    let countOfFunctions = 0
    let countOfUncertainties = 0
    let countOfUnknowns = 0
    for (let i = 0; i < fields.length; i++) {
        switch (typeof parent[fields[i]]) {
            case 'object':
                countOfObjects += 1
                break
            case 'string':
                countOfStrings += 1
                break
            case 'boolean':
                countOfBooleans += 1
                break
            case 'number':
                countOfNumbers += 1
                break
            case 'function':
                countOfFunctions += 1
                break
            case 'undefined':
                countOfUncertainties += 1
                break
            default:
                countOfUnknowns += 1
        }
    }
    return {
        objects: countOfObjects,
        strings: countOfStrings,
        booleans: countOfBooleans,
        numbers: countOfNumbers,
        functions: countOfFunctions,
        uncertainties: countOfUncertainties,
        unknowns: countOfUnknowns
    }
}
