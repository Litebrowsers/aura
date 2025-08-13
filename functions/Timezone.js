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
  const systemTime = new Date()
  let systemTimeTitle = ''
  const matches = systemTime.toString().match(/\((.*?)\)/)
  if (matches) {
    systemTimeTitle = matches[1]
  }
  const timezoneOffset = (-1) * systemTime.getTimezoneOffset()
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const toLocaleDataString = systemTime.toLocaleDateString()
  const toLocalTimeString = systemTime.toLocaleTimeString()
  return {
    systemTimeString: systemTime.toString(),
    systemTimeTitle: systemTimeTitle,
    timezoneOffset: timezoneOffset,
    timezone: timezone,
    localeTimeString: toLocalTimeString,
    localeDateString: toLocaleDataString,
    protocolVersion: 1
  }
}