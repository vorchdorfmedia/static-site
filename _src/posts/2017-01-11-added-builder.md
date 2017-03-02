---
author: Sascha Zarhuber
title: Added builder
collection: blog
tags:
  - builder
  - GitHub
  - Diff
  - metalsmith
  - staticsite
---

# Added builder route

The `/api/project/{name}/{repo}/build` route was now added to the project. It should basically detect a *base* and *head* property within the POST-Request and therefore decide which diff to fetch from GitHub.

Based on that diff, it should be possible to detect all affected files within that timeframe. Furthermore, also the modification type of each file may be inferred, so that in case of:

* **modified**: File was modified, need immediate rebuild,
* **added**: File is not yet available in project source, needs to be built,
* **deleted**: File is not needed anymore, therefore delete from project source (Add a `301: Moved permanently` as well some time in the future).

## Functions added

* New route `/api/project/{name}/{repo}/build` added to project.
