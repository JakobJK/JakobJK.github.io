---
layout: post.njk
title: 'Topological Symmetry'
date: 2023-10-30T00:00:00.000Z
excerpt: 'A Maya script that verifies mesh symmetry with a double breadth-first search from a central edge.'
draft: false
tags: ['topology', 'maya', 'python']
---


I wrote a script that verifies symmetry in Maya geometry using Python and Maya's API.

Topological symmetry speeds up blendshape work, and it lets me enforce symmetry after small adjustments without changing the vertex order.

The strategy is a double Breadth First Search (BFS) traversal from a selected central edge.

![Bidirectional breadth-first search traversal of a mesh](/blog/bidirectional_bfs_traversal.webp)
