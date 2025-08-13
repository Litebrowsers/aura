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
  const width = 30
  const height = 30
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  // Generate random color in hex format (#FF0000)
  const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase()

  const canvasResults = getHashesForCanvas(canvas, randomColor, false)

  const notSupportedMessage = -1
  let offscreenResults = {
    pixelSum: notSupportedMessage,
    rSum: notSupportedMessage,
    gSum: notSupportedMessage,
    bSum: notSupportedMessage,
    aSum: notSupportedMessage,
    color: notSupportedMessage
  }
  try {
    const offscreenCanvas = document.createElement('canvas')
    offscreenCanvas.width = width
    offscreenCanvas.height = height
    offscreenResults = getHashesForCanvas(offscreenCanvas, randomColor, true)
  } catch (error) {
  }
  const offWorks = canvasResults.rSum === offscreenResults.rSum &&
      canvasResults.gSum === offscreenResults.gSum &&
      canvasResults.bSum === offscreenResults.bSum &&
      canvasResults.aSum === offscreenResults.aSum
  return {
    rSum: canvasResults.rSum,
    gSum: canvasResults.gSum,
    bSum: canvasResults.bSum,
    aSum: canvasResults.aSum,
    pixelSum: canvasResults.pixelSum,
    offWorks: offWorks,
    color: randomColor,
    protocolVersion: 1
  }
}

function renderOnCanvas (canvas, renderer, color) {
  var ctx = canvas.getContext('2d')

  // Square size (even number)
  const squareSize = 18
  // Set the random color
  ctx.fillStyle = color
  // Draw square
  ctx.fillRect(5, 5, squareSize, squareSize)

  if (renderer !== null) {
    var bitmapOne = canvas.transferToImageBitmap()
    renderer.transferFromImageBitmap(bitmapOne)
  }
}

function extractHashesFromCanvas(canvasElement, canvasObject) {
  let ctx = null
  if (canvasObject === null) {
    ctx = canvasElement.getContext('2d')
  } else {
    ctx = canvasObject.getContext('2d')
  }
  const buffer = ctx.getImageData(0, 0, canvasElement.width, canvasElement.height).data.buffer
  var sumPixels = 0
  var sumRed = 0
  var sumGreen = 0
  var sumBlue = 0
  var sumAlpha = 0
  var pixels = new Uint8Array(buffer)
  for (var i = 0; i < pixels.length;) {
    sumRed += pixels[i]
    sumGreen += pixels[i + 1]
    sumBlue += pixels[i + 2]
    sumAlpha += pixels[i + 3]
    sumPixels += pixels[i] + pixels[i+1] + pixels[i+2] + pixels[i+3]
    i = i + 4
  }
  return {
    pixelSum: sumPixels,
    rSum: sumRed,
    gSum: sumGreen,
    bSum: sumBlue,
    aSum: sumAlpha,
  }
}

function getHashesForCanvas (canvas, color, isOffscreen) {
  if (isOffscreen) {
    var offscreenCanvas = new OffscreenCanvas(canvas.width, canvas.height)
    renderOnCanvas(offscreenCanvas, null, color)
    return extractHashesFromCanvas(offscreenCanvas, null)
  } else {
    renderOnCanvas(canvas, null, color)
    return extractHashesFromCanvas(canvas, null)
  }
}
