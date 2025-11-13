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
  return {
    availHeight: window.screen.availHeight,
    availWidth: window.screen.availWidth,
    width: window.screen.width,
    height: window.screen.height,
    devicePixelRatio: window.devicePixelRatio,
    screenLeft: window.screenLeft,
    screenTop: window.screenTop,
    screenX: window.screenX,
    screenY: window.screenY,
    matchesMediaQuery: window.matchMedia('(min-width: ' + (window.innerWidth - 1) + 'px)').matches,
    protocolVersion: 1
  }
}
