---
layout: post.njk
title: 'Custom Maya Marking Menu'
date: 2025-01-15T03:51:17.704Z
excerpt: >
  I'm starting a new modeling project in Maya. I haven't done modeling in any meaningful capacity in years, so it's fun to re-visit. I am currently setting up my custom marking menus,
  and since I know how to code, I thought I'd customize my virtual workspace a little further than before.
draft: true
tags: ['maya', 'python']
---

I've been diving into mesh symmetry lately and decided to develop a script that verifies symmetry in Maya geometry using Python and Maya's API. Here’s a walkthrough of the script and its key methods.

Symmetry in geometry is not always strictly necessary, but can greatly cut costs if you can easily transfer attributes across symmetry lines.

The strategy is to perform a double Breadth First Search (BFS) traversal from a central edge.

## 1. Defining Face-to-Edge Order

To verify symmetry, we need the ability to traverse the face’s edges.

```python
def _get_face_edges_from_start_edge(mesh, face_index, start_edge_index, reverse=False):
    face_it = om.MItMeshPolygon(mesh)
    face_it.setIndex(face_index)
    edges = list(face_it.getEdges())
    edge_idx = edges.index(start_edge_index)
    edges = edges[edge_idx:] + edges[:edge_idx]
    if reverse:
        edges = edges[:1] + edges[1:][::-1]
    return edges
```
