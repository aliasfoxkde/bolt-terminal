# PLANNING

## Terminal Commands
- Networking
  - nslookup, traceroute, ip, ifconfig, speedcheck, ftp, chmod, ping, 
  - pscan?, ssl_client, 
- Storage/Files
  - cp, mv, chdir, zip/gzip/bzip/etc., chksum, sum, tar, 
  - read, realpath
- Programming Logic:
  - &, do, done, fi, for, local, global, return, sh, shell, bash, type,
  - sleep, etc.
- Permissions??
  - sudo, su,
- TBD?
  - bash,  brctl, vi
  - df, ed?, env, exit, expr, free, tree, pretty, man, 
  - halt, kill/killall, hd, head, hostname, ip, ifconfig, 
  - sort, split, whoai (easter egg "iamai")
  - list processes? list commands? date/time, reset (resets consoles?)
  - mount, umount, ed, expr, script, seq, setconsole, truncate, 
  - uptime, wait, diff, tftpd
- Custom
  - robocopy/rsync?, lint, 
- `code .` to open IDE (build logic to "talk" to)
- Make simplier "zip" that supports compress/uncompress, and most formats/extension?
- Make simple ftp (sftp, tftpd) client to simplify the commands.
- Simple but nice looking UI
- Fully mobile responsive
- Reference:
  https://www.boxmatrix.info/wiki/BusyBox-Commands

## Research
- Look at busybox docs for features to replicate

## TBD
- Ability to interact directly with the console/dom?
- Create an `agent` command to interact with the AI directly from the terminal
  - Ability to switch Agents (api/local/etc), provide data, etc.
- With "storage" support, impliment persistant storage on refresh
- Can the main system (aka. AI interact with the terminal; build out logic for this).
- Can auto-merge work for all commited PR's?