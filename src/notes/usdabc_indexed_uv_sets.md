---
layout: post.njk
title: 'Indexed uv sets in usdAbc'
date: 2026-10-13T22:37:16.000Z
excerpt: 'usdAbc read Alembic indices as uint[], so USD did not see extra uv sets and color sets as indexed primvars.'
draft: true
tags: ['openusd', 'cpp', 'alembic']
---

When usdAbc reads an Alembic file, the extra uv sets and color sets lose their indexing in USD. I fixed this in [OpenUSD #4278](https://github.com/PixarAnimationStudios/OpenUSD/pull/4278). The issue is [#3729](https://github.com/PixarAnimationStudios/OpenUSD/issues/3729).

## The cause

An indexed Alembic GeomParam has two properties: `.vals` holds the values and `.indices` holds the indices. Alembic stores the indices as uint32. usdAbc turned them into `uint[]` in USD.

`UsdGeomPrimvar` only treats `int[]` as indices. A primvar with `uint[]` indices is not indexed to it, so it reads the raw `.vals` array. The primary uv set already worked, because usdAbc read its indices as `int[]`. Every other indexed GeomParam went through the generic out-of-schema path and kept `uint[]`.

## The fix

In `AddOutOfSchemaProperty`, I check whether the property is the `.indices` of a GeomParam. A property is, if its name is `.indices` and its parent also has `.vals`. If so, the type changes from `uint[]` to `int[]`:

```cpp
static
bool
_IsGeomParamIndices(const AlembicProperty& property)
{
    if (property.GetName() != ".indices") {
        return false;
    }
    const ICompoundProperty parent = property.GetParent();
    return parent.valid() && parent.getPropertyHeader(".vals");
}

// Indices of a GeomParam are uint32, but UsdGeomPrimvar needs int[].
if (usdTypeName == SdfValueTypeNames->UIntArray &&
    _IsGeomParamIndices(property)) {
    usdTypeName = SdfValueTypeNames->IntArray;
}
```

I added a converter from uint32 to `int`, so the reader can produce the int array:

```cpp
data.AddConverter<int, uint32_t>();
```

The values of extra uv sets had a second problem. usdAbc read them as `float2[]`, while the primary uv set is `texCoord2f[]`. A second check finds the `.vals` of a uv GeomParam and uses the primary uv set's type:

```cpp
else if (usdTypeName == SdfValueTypeNames->Float2Array &&
         _IsUVGeomParamValues(property)) {
    usdTypeName = _GetUVTypeName();
}
```

## The tests

The existing baseline for `testUsdAbcIndexedGeomArb` changes. The indices of `colorSet` and `vals` are now `int[]` instead of `uint[]`.

`testUsdAbcIndexedUvSets` is new. It opens `multipleUvSets.abc`, a cube with two uv sets, `st` and `map2`. For each set it checks that `IsIndexed()` is true, that the type is `texCoord2f[]` and that the indices are `int[]`.

I also opened `test_sphere.abc` from the issue. Its extra uv set `UDIM` is now an indexed `texCoord2f[]` with `int[]` indices.
