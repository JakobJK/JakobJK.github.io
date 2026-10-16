---
layout: post.njk
title: 'Overlapping UVs in USD'
date: 2023-08-29T01:49:27.339Z
excerpt: 'A CLI tool that finds overlapping UVs across meshes in a USD file, by rasterizing each face into a per-UDIM buffer.'
draft: false
tags: ['openusd', 'python']
---

![](/blog/overlappingUVsinUsd.webp)

A CLI tool that detects overlapping UVs across meshes in a USD file. I wrote it as a proof of concept to learn the [OpenUSD](https://openusd.org/) API. The code is on [GitHub](https://github.com/JakobJK/uvOverlapsinUSD).

Overlapping UVs make two meshes paint onto the same texels, so a bake overwrites one with the other. A quick check on the scene graph catches them early.

The method:

1. Create a buffer for each UDIM.
2. Rasterize every face into its UDIM's buffer. If two meshes write to the same position, their UVs overlap.

Two assumptions limit the tool:

- **Starlike faces**: I extract triangles with a simple fan. It fails on faces where the first vertex cannot see every other vertex, such as non-starlike faces.
- **One UDIM per face**: All UVs of a face stay within one UDIM. This is common practice in feature film and animation.

The steps:

- [1. Traverse the USD scene graph](#1-traverse-the-usd-scene-graph)
- [2. Accumulate faces and corresponding UVs](#2-accumulate-faces-and-corresponding-uvs)
- [3. Associate faces with their UDIM](#3-associate-faces-with-their-udim)
- [4. Normalize UV values](#4-normalize-uv-values)
- [5. Triangulate faces with a fan](#5-triangulate-faces-with-a-fan)
- [6. Rasterize triangles onto the buffer](#6-rasterize-triangles-onto-the-buffer)
- [7. Detect overlaps in the buffer](#7-detect-overlaps-in-the-buffer)

## 1. Traverse the USD scene graph

USD calls the scene graph a stage. It holds prims. I need the ones of type `UsdGeom.Mesh`, because they carry the UVs.

Install the [USD Python API](https://pypi.org/project/usd-core/) with pip. Then open the stage and filter its prims:

```python
from pxr import Usd

usdPath = "C:/sceneGraph.usd"
Usd.Stage.Open(usdPath)

meshPrims = [x for x in self.stage.Traverse() if x.IsA(UsdGeom.Mesh)]
```

## 2. Accumulate faces and corresponding UVs

`UsdGeom.PrimvarsAPI` queries primvars on a mesh. UVs conventionally live in the `st` primvar:

```python
uvPrimvar = UsdGeom.PrimvarsAPI(mesh).GetPrimvar("st")
```

USD stores time-sampled data, so `Get` needs a time. `Usd.TimeCode.Default()` returns the static value:

```python
uvVals = uvPrimvar.Get(Usd.TimeCode.Default())
```

To map UVs onto faces, I need the vertex count of each face and the UV index of each face vertex:

```python
faceVertCount = mesh.GetFaceVertexCountsAttr().Get()
UVidx = uvPrimvar.GetIndices(Usd.TimeCode.Default())
```

`faceVertCount` holds the number of vertices per face. `UVidx` maps each face vertex to a UV. Together they give the UVs of each face:

```python
faceUVs = []
faceUVs.append(uvVals[UVidx[index]])
```

The result is a list with one entry of UVs per face.

## 3. Associate faces with their UDIM

I assume all UVs of a face sit in one UDIM, so the first UV decides it.

UDIM 1001 is the tile at the origin. Each tile to the right adds 1, up to 10 tiles. Each row up adds 10:

$$
\text{UDIM} = 1001 + \lfloor v \rfloor \times 10 + \lfloor u \rfloor
$$

I ignore faces where:

$$
U < 0, \ U > 10, \ \text{or} \ V < 0
$$

```python
def _getUDIMfromUV(self, UV):
    u, v = UV
    if u < 0 or u > 10 or v < 0:
        return -1

    return 1001 + int(v) * 10 + int(u)

udim = self._getUDIMfromUV(faceUVs[0])
```

If no buffer exists for that UDIM, I create one. UV space is square, so one `size` sets both width and height:

```python
def _createBuffer(self):
    return [None] * self.size * self.size

if udim not in self.buffers:
    self.buffers[udim] = _createBuffer()
```

## 4. Normalize UV values

The buffer position needs UVs between 0 and 1. I keep only the fractional part of each coordinate, in a copy, so every UV lands in the 0 to 1 range of its UDIM and the originals stay untouched:

```python
normalizedUVs = [(uv[0] - int(uv[0]), uv[1] - int(uv[1])) for uv in faceUVs]
```

## 5. Triangulate faces with a fan

The Maya API has [getTriangles](https://help.autodesk.com/cloudhelp/2022/ENU/Maya-SDK/py_ref/class_open_maya_1_1_m_it_mesh_polygon.html#acdbc2bbb128b3af3ab1eaf6229fbc7ff). USD has no such method, so I split the polygons myself. Triangles make rasterizing simple.

A fan connects the first vertex to each of the other vertices. A quad becomes two triangles. A fan is fast, but it breaks on non-starlike faces. Starting the fan from a different UV sometimes fixes it. [Earcut](https://github.com/mapbox/earcut.hpp) handles every case, at the cost of more code.

The diagram compares three triangulation approaches on three topologies: clean, non-starlike and messy. The first row shows the faces as they appear in `faceUVs`. The rows below show each approach.

![](/blog/triangulization.webp)

I will switch to earcut after the prototype. The fan is good enough for now:

```python
def _dumbestFanAlgorithmEver(self, UVs):
    output = []
    first = UVs[0]
    for i in range(1, len(UVs)- 1):
        output.append([first, UVs[i], UVs[i+1]])
    return output
```

## 6. Rasterize triangles onto the buffer

I split each triangle into a top half with a flat bottom and a bottom half with a flat top. A simple scanline loop fills each half.

![](/blog/triangle_rasterization.webp)

**Top half**

`a`, `b` and the horizontal line through `b` bound the top half. For each scanline `y` from `a` to `b`:

$$
xStart = b[0] + (y - b[1]) \times \text{invTSlope1}
$$

`invTSlope1` is the inverse slope of the edge from `a` to `b`:

$$
\text{invTSlope1} = \frac{b[0] - a[0]}{b[1] - a[1]}
$$

$$
xEnd = a[0] + (y - a[1]) \times \text{invTSlope2}
$$

`invTSlope2` is the inverse slope of the edge from `a` to `c`.

**Bottom half**

`b`, `c` and the horizontal line through `b` bound the bottom half. For each scanline `y` from `b` to `c`:

$$
xStart = b[0] + (y - b[1]) \times \text{invBSlope1}
$$

`invBSlope1` is the inverse slope of the edge from `b` to `c`:

$$
\text{invBSlope1} = \frac{c[0] - b[0]}{c[1] - b[1]}
$$

$$
xEnd = a[0] + (y - a[1]) \times \text{invBSlope2}
$$

`invBSlope2` equals `invTSlope2`, the inverse slope of the edge from `a` to `c`.

On each scanline, I swap `xStart` and `xEnd` if `xStart` is on the right. `_fillBuffer` then fills the range between them.

```python
def _paintTriangle(self, UVs, buffer, faceIndex, primName):
    a, b, c = UVs
    invTSlope1, invTSlope2 = 0.0, 0.0
    invBSlope1, invBSlope2 = 0.0, 0.0

    if (a[1] != b[1]):
        invTSlope1 = (b[0] - a[0]) / abs(b[1] - a[1])

    if (a[1] != c[1]):
        invTSlope2 = float(c[0] - a[0]) / abs(c[1] - a[1])
        invBSlope2 = invTSlope2

    if (c[1] != b[1]):
        invBSlope1 = (c[0] - b[0]) / abs(c[1] - b[1])

    if a[1] != b[1]:
        for y in range(int(a[1] * self.size), int(b[1] * self.size)):
            xStart = (b[0] * self.size) + (y - (b[1] * self.size)) * invTSlope1
            xEnd = (a[0] * self.size) + (y - (a[1] * self.size)) * invTSlope2
            if xEnd < xStart: xEnd, xStart = xStart, xEnd
            self._fillBuffer(y, xStart, xEnd, buffer, faceIndex, primName)

    if b[1] != c[1]:
        for y in range(int(b[1] * self.size), int(c[1] * self.size)):
            xStart = b[0] * self.size + (y - b[1] * self.size) * invBSlope1
            xEnd = a[0] * self.size + (y - a[1] * self.size) * invBSlope2
            if xEnd < xStart: xEnd, xStart = xStart, xEnd
            self._fillBuffer(y, xStart, xEnd, buffer, faceIndex, primName)
```

## 7. Detect overlaps in the buffer

A pixel at `(x, y)` lives at index `y * size + x`. Before writing, I check whether the pixel already holds a value. If it does, and the stored mesh name differs from the current one, the UVs overlap. I add both faces to the `overlaps` set.

The tool only reports overlaps between different meshes. Adjacent triangles of one mesh can hit the same pixel, and I ignore that.

```python
position = buffer[x + y * self.size]
if position and position[0] != primName:
    self.overlaps.add((primName, faceIndex))
    self.overlaps.add((position[0], position[1]))
else:
    buffer[x + y * self.size] = (primName, faceIndex)
```
