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
  const navigatorLocale = (navigator.languages && navigator.languages.length) ? navigator.languages : navigator.language
  const intlLocale = new Intl.NumberFormat().resolvedOptions()
  return {
    navigatorLanguages: navigatorLocale,
    locale: intlLocale.locale,
    protocolVersion: 1
  }
}