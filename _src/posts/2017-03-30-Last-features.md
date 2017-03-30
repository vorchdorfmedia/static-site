---
author: Sascha Zarhuber
title: Implementing last features
collection: blog
tags:
  - features
  - Node.js
  - express.js
  - MongoDB
  - diff
---

## What has been done

Some time passed since the last update, so here's the progress I made during the last 2 weeks:


### Changing the CWD

I spent a lot of time fixing problems with the current working directory (CWD).  
The main problems were, that the build pipeline always worked from the root directory of the node application (a.k.a base directory level, where the node process was started from). Unfortunately, different node modules had severe problems working down a few levels from there (since every webroot source lies in `_local/:owner-:repo`).

So I read in the official [node.js documentation](https://nodejs.org/api/process.html#process_process_chdir_directory) about dynamically changing the CWD of the host process. I gave that a try and it worked instantly.

From now on, every build process (which is being forked from the parent process) sets its CWD to the currently processed webroot before changing it back after finishing the rendering task.

### Storing successful builds in tarballs

Every successful build now gets stored in a `tar.gz`-archive and its filename also gets mentioned in its build entry in the database. The filename structure looks like the following: `:owner-:repo_:headhash.tar.gz`.

### Fixing the commit SHA

Since custom commit ranges seemed to cause a few problems, I had a look on these as well. I figured out, that there might still be a not very optimal solution in distinguishing the `base` and `head` values in an API call, since they can be dates, shortened hashes, as well as *START* or *HEAD*.

I thought about separately querying for the full hash values, but that meant 2 extra API calls to GitHub and therefore more time, for information that's not really necessary. While taking a closer look on the HTTP requests, I saw, that the 40-character hash value gets returned anyhow and that I only need to store it into the global object every build step receives.

Additionally, the build entry in the database now also stores the correct, 40-character SHA hash value.

### Cleanup of router file

After a lot of developing, the router file for the project routes got a bit messy. I took the time to clean it up and to seperate often needed parts into sub files and requiring them in the main routing file.

## Features added

* Dynamically adjusting the CWD for each build task
* Creating a tarball of current state (including head commit hash)
* Correct & full 40-character hash value in global configuration object
