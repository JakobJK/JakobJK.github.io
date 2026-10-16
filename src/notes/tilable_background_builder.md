---
layout: post.njk
title: 'Tilable Background Builder'
date: 2022-06-03T12:00:00.000Z
excerpt: 'A paint app for tilable backgrounds that moves the seam to the middle with a wrap-around shift.'
draft: true
tags: ['javascript', 'react']
---

![](/blog/tilable_background_demo.webp)

I built this prototype during a company hackathon at Mighty: a paint app for tilable backgrounds. The code is on [GitHub](https://github.com/JakobJK/tilable-background-builder).

## The problem

A tile repeats, so its left edge must meet its right edge. The canvas cuts off a stroke near an edge, and nothing continues on the other side. You cannot paint across a seam.

## The idea

Shift the picture with wrap-around, so the seam moves to the middle of the canvas. Paint over it there. Pixels that leave one edge re-enter on the opposite edge, so the picture still tiles after every shift.

The app is one 1000 x 1000 canvas with two modes.

## Painting mode

On each mouse move I draw a line from the last pen position to the current one. Segments keep the stroke continuous when the mouse moves fast. Round caps and joins make it smooth.

```js
ctx.beginPath();
ctx.moveTo(penPosition.x, penPosition.y);
ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
ctx.stroke();
```

The eraser uses the composite operation `destination-out`, which removes pixels instead of painting them:

```js
ctx.globalCompositeOperation = erase ? "destination-out" : "source-over";
```

## Moving mode

When I enter moving mode, I save the canvas with `toDataURL()` and show it as the CSS background of a `div` on top of the canvas. A CSS background repeats by default, so the browser tiles the picture. While I drag, I only change the background position. I touch no pixels, and I see the seams live.

```js
backgroundPosition: `right ${offset.x}px bottom ${offset.y}px`
```

The drag sets the offset from where the mouse went down, wrapped to the canvas size:

```js
x: (startPosition.x - e.nativeEvent.offsetX) % 1000,
```

## Applying the shift

When I go back to painting mode, `shiftDrawing` applies the offset to the canvas. It does not loop over pixels. The nine-argument form of `drawImage` copies one rectangle of the source to a position on the canvas. I cut the picture at the wrap line and move the four pieces:

```js
const toMoveX = x < 0 ? 1000 + x : x
const shiftX = 1000 - toMoveX
// same for y

ctx.drawImage(newImg, shiftX, shiftY, toMoveX, toMoveY, 0, 0, toMoveX, toMoveY)
ctx.drawImage(newImg, 0, shiftY, shiftX, toMoveY, toMoveX, 0, shiftX, toMoveY)
ctx.drawImage(newImg, shiftX, 0, toMoveX, shiftY, 0, toMoveY, toMoveX, shiftY)
ctx.drawImage(newImg, 0, 0, shiftX, shiftY, toMoveX, toMoveY, shiftX, shiftY)
```

`toMoveX` is the width of the strip that wraps around. A negative shift becomes `1000 + x`, so every shift is a move in the positive direction. `shiftX` is where the cut falls. The four calls move the pieces like this:

| Source piece | Goes to |
| --- | --- |
| bottom right | top left |
| bottom left | top right |
| top right | bottom left |
| top left | bottom right |

Each pixel ends up at `(x + dx) mod 1000`, `(y + dy) mod 1000`.

## Limits

I hard coded 1000 as the size throughout the prototype.
