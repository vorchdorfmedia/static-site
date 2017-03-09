---
author: Sascha Zarhuber
title: Child processes
collection: blog
tags:
  - threads
  - Node.js
  - metalsmith
  - MongoDB
---

## Forking child processes

Since the whole event loop of JavaScript is blocking the main thread, I started to think about ways to outsource certain heavy tasks into threads.
This is possible through forking child processes in Node.js. Similar to web workers, an own thread, connected to the parent process via events is executed and runs in parallel.

### Persisting build status

To persist the current build status, the main process needs to create a DB entry first. This looks something like this:  
```
{
  status: "pending",
  base: <BASE_HASH>,    // From which base to which head commit current build process spans.
  head: <HEAD_HASH>,
  files: [ 'list_of_affected_files' ]
}
```
A reference to this entry is also stored into the project's database entry. After the child process succeeded/failed, the status information in this build entry gets updated accordingly.

### Functions added

* Child process for Metalsmith.
* DB entry handler for build pipeline.
