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
  const canvasResults = getHashesForCanvas(canvas, false)

  const notSupportedMessage = -1
  let offscreenResults = {
    pixelSum: notSupportedMessage,
    rSum: notSupportedMessage,
    gSum: notSupportedMessage,
    bSum: notSupportedMessage,
    aSum: notSupportedMessage
  }
  try {
    const offscreenCanvas = document.createElement('canvas')
    offscreenCanvas.width = width
    offscreenCanvas.height = height
    offscreenResults = getHashesForCanvas(offscreenCanvas, true)
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
    protocolVersion: 1
  }
}

function renderOnCanvas (canvas, renderer) {
  var ctx = canvas.getContext('2d')

  // Define colors for the chessboard squares
  const colors = [
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
    '#FFA500', '#800080', '#008000', '#FFC0CB', '#A52A2A', '#808080',
    '#000080', '#800000', '#008080', '#C0C0C0', '#FFD700', '#DC143C',
    '#32CD32', '#4169E1', '#FF1493', '#00CED1', '#FF6347', '#9370DB',
    '#20B2AA', '#F0E68C', '#DDA0DD', '#98FB98', '#F5DEB3', '#CD853F'
  ]

  // Square size (odd number)
  const squareSize = 3
  const rows = Math.floor(canvas.height / squareSize)
  const cols = Math.floor(canvas.width / squareSize)

  // Fill canvas with chessboard pattern
  let colorIndex = 0
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Calculate position
      const x = col * squareSize
      const y = row * squareSize

      // Set color (cycle through colors array)
      ctx.fillStyle = colors[colorIndex % colors.length]

      // Draw square
      ctx.fillRect(x, y, squareSize, squareSize)

      // Move to next color
      colorIndex++
    }
  }

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
    aSum: sumAlpha
  }
}

function getHashesForCanvas (canvas, isOffscreen) {
  if (isOffscreen) {
    var offscreenCanvas = new OffscreenCanvas(canvas.width, canvas.height)
    renderOnCanvas(offscreenCanvas, null)
    return extractHashesFromCanvas(offscreenCanvas, null)
  } else {
    renderOnCanvas(canvas, null)
    return extractHashesFromCanvas(canvas, null)
  }
}
