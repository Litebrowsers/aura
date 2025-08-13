/*
# Aura

Copyright © 2025 Litebrowsers
Licensed under a Proprietary License

This software is the confidential and proprietary information of Litebrowsers
Unauthorized copying, redistribution, or use is prohibited.
For licensing inquiries, contact:
vera cohopie at gmail dot com
thor betson at gmail dot com
*/

export default function () {
    const connection = navigator.connection
    if (connection !== undefined) {
        return {
            effectiveType: connection.effectiveType,
            rtt: connection.rtt,
            downlink: connection.downlink,
            pi: 1
        }
    } else {
        return {
            effectiveType: "",
            rtt: 0,
            downlink: 0.0,
            pi: 1
        }
    }
}