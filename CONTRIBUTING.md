
# Contribution Guide

	- Code: You can enhance the code, cleaning it up, with better algoritms, etc...
	- Translate: You can translate for any region you want, just translate the common.pot (Recommend using Poedit)
	- Open an issue: If you have problems, open an issue that it probably will be fixed.
	- New ideas: If you want something, request it opening one new issue.

	Just pull, dev, and make a push request. Every kind of contribution will help this extension.

### Dev: 

## debug gnome-shell extensions log

	This helps debugging script loaded and executions.

```sh
journalctl /usr/bin/gnome-shell -f -o cat 
```
