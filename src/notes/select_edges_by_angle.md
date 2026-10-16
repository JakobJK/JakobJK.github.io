---
layout: post.njk
title: 'Select edges by angle in Maya'
date: 2026-10-15T12:00:00.000Z
excerpt: 'Selecting the edges whose two faces meet at or above a given angle, using the angle between face normals.'
draft: true
tags: ['maya', 'python']
---

[selectEdgesByAngle](https://github.com/JakobJK/selectEdgesByAngle) selects the hard edges of a mesh. An edge is hard when the two faces it joins meet at or above an angle I choose.

## The angle between two faces

Every polygon has a normal. The angle between the normals of two neighbouring faces measures how sharply the surface bends at their shared edge. Flat faces give 0°. A cube edge gives 90°.

For two vectors $\mathbf{v_1}$ and $\mathbf{v_2}$:

$$
\theta = \arccos\left(\frac{\mathbf{v_1} \cdot \mathbf{v_2}}{\lVert \mathbf{v_1} \rVert \, \lVert \mathbf{v_2} \rVert}\right)
$$

Maya returns unit normals, so the denominator is 1. `MVector.angle` does the whole calculation and returns radians.

## The test

For each edge, I get its connected faces and compare the angle between their normals to the threshold:

```python
radians = math.radians(angle)

faces = edgeIte.getConnectedFaces()
v1 = mesh.getPolygonNormal(faces[0])
v2 = mesh.getPolygonNormal(faces[1])

if v1.angle(v2) >= radians:
    edge_comp.addElement(edgeIte.index())
```

I convert the threshold to radians once, because the API works in radians.

An edge needs exactly two faces to have a face-to-face angle. Border edges have one face and non-manifold edges have more, so I skip any edge where `len(faces) != 2`.

## Building the selection

I collect the matching edge indices in an `MFnSingleIndexedComponent` for each selected mesh. I add each mesh and its component to a new `MSelectionList`. At the end, `om.MGlobal.setActiveSelectionList` makes that list the selection.
