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
  const ctx = canvas.getContext('2d');
  const colors = ['#FF0000', '#00FF00', '#0000FF'];

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Circle 1
  ctx.fillStyle = colors[0];
  ctx.beginPath();
  ctx.arc(15, 10, 8, 0, 2 * Math.PI);
  ctx.fill();

  // Circle 2
  ctx.fillStyle = colors[1];
  ctx.beginPath();
  ctx.arc(10, 20, 6, 0, 2 * Math.PI);
  ctx.fill();

  // Circle 3
  ctx.fillStyle = colors[2];
  ctx.beginPath();
  ctx.arc(20, 20, 4, 0, 2 * Math.PI);
  ctx.fill();

  if (renderer !== null) {
    const bitmapOne = canvas.transferToImageBitmap();
    renderer.transferFromImageBitmap(bitmapOne);
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