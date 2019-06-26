#! /usr/bin/python
import os
import sys

exclude = ["node_modules", ".git", "charts.js", "virtualjoystick.js"]
good_files = []
bad_files = []
lint = {
        "js": "eslint -c Scripts/.eslintrc.json",
        "cpp": "cpplint",
        "html": "htmlhint -c Scripts/htmlhintrc.json"
        }

if "--fix" or "-f" in sys.argv:
    lint["js"] += " --fix"

for root, dirs, files in os.walk(".", topdown=True):
        dirs[:] = [d for d in dirs if d not in exclude]
        files[:] = [f for f in files if f not in exclude]
        path = root.split(os.sep)
        for name in files:
            index = name.rfind('.')
            filename, ext = name[:index], name[index+1:]
            if ext in lint:
                print(os.path.join(root, name))
                result = os.system(f"%s %s" % (lint[ext], os.path.join(root, name)))
                if result != 0:
                    bad_files.append(os.path.join(root, name))
                else:
                    good_files.append(os.path.join(root, name))
                    print("\33[32mFile passed all linting tests!\33[0m\n")

for i in good_files:
    print(f"\33[32m%s\33[0m" % (i))
for i in bad_files:
    print(f"\33[31m%s\33[0m" % (i))

class LintingError(Exception):
    pass

if len(bad_files) != 0:
    if len(bad_files) == 1: 
        raise LintingError("1 file breaks its corresponding styleguide")
    else: 
        raise LintingError(f"%d files break their corresponding styleguides" % len(bad_files))
