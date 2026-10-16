---
layout: post.njk
title: 'UTF-8 filenames in usdz packages'
date: 2026-10-07T18:41:54.000Z
excerpt: 'SdfZipFileWriter stored UTF-8 names without telling zip tools, so they showed garbled names for non-ASCII files.'
draft: true
tags: ['openusd', 'cpp']
---

A usdz package is an uncompressed zip file. USD reads one with non-ASCII file names without trouble. Other zip tools show garbled names for the same file. I fixed this in [OpenUSD #4272](https://github.com/PixarAnimationStudios/OpenUSD/pull/4272). The issue is [#3774](https://github.com/PixarAnimationStudios/OpenUSD/issues/3774).

## The cause

`SdfZipFileWriter` already writes file names as UTF-8. A zip file cannot tell the reader that, unless the writer sets bit 11 of the general purpose flags in the file header. Section 4.4.4 of the zip specification defines it. Without the bit, a tool is free to decode the names with a legacy code page, and I get garbage.

The writer set all the flags to zero:

```cpp
h.f.bits = 0;
```

## The fix

I set bit 11 when the name contains a non-ASCII byte:

```cpp
static bool
_IsAscii(const std::string& s)
{
    return std::all_of(s.begin(), s.end(),
        [](unsigned char c) { return c < 0x80; });
}

// Per 4.4.4, bit 11 indicates the filename is encoded in UTF-8.
h.f.bits = _IsAscii(zipFilePath) ? 0 : 0x0800;
```

The writer writes ASCII names exactly as before. A package with only ASCII names is byte for byte identical to the old output.

## The test

`test_WriterUtf8Filename` writes a package with two files, `blåbær/rødgrød.test` and `ascii.test`. Then it checks three things:

- `Sdf.ZipFile` reads both names back.
- Every file still starts on a 64-byte boundary. A multi-byte name is longer in bytes than in characters, so the header size changes, and I wanted to be sure the alignment padding follows.
- Python's `zipfile` reads both names back. It decodes names as UTF-8 only when the file sets bit 11, so this is the check that fails without the fix. The test also confirms the writer sets the bit on the UTF-8 name and leaves it unset on the ASCII one.

Another open pull request, [#4080](https://github.com/PixarAnimationStudios/OpenUSD/pull/4080), touches the same problem. I found it after I had finished, and left it to the maintainers to choose.
