#! /usr/bin/python
"""This script lints all files contained in every given path."""

import os
import subprocess
import argparse
import glob
from multiprocessing import Process

PARSER = argparse.ArgumentParser(description=
                                 'Lint all files in the given directory')
PARSER.add_argument('paths', metavar='paths', type=str, nargs='*',
                    help='The paths to lint (defaults to .)')
ARGS = PARSER.parse_args()


EXCLUDE = ['node_modules', '.git', '.eslintrc.json', 'htmlhintrc.json']
GOOD_FILES = []
BAD_FILES = []
COMMANDS = {
        'js': ['node node_modules/eslint/bin/eslint.js FILENAME', '-c .eslintrc.json'],
        'cpp': ['cpplint FILENAME'],
        'html': ['htmlhint FILENAME', '-c Scripts/htmlhintrc.json'],
        'py': ['pylint FILENAME'],
        'md': ['node node_modules/remark-cli/cli.js FILENAME --no-stdout --frail']
        }

CHECKS = {
    'js': ['[ -e node_modules/eslint/bin/eslint.js ]'],
    'cpp': ['which cpplint'],
    'html': ['which htmlhint'],
    'py': ['which pylint'],
    'md': ['[ -e node_modules/remark-cli/cli.js ]']
}
EXISTS = {}
LINTABLE = {}
LINTERS = {}
COLOURS = {
    'okblue': '\033[94m',
    'okgreen': '\033[92m',
    'warn': '\033[93m',
    'err': '\033[91m',
    'bold': '\033[1m',
    'underline': '\033[4m',
    'end': '\x1b[0m'
}

def prettyprint(colours, string):
    if type(colours) == list:
        pre = ''.join([COLOURS[i] for i in colours])
    else:
        pre = COLOURS[colours]
    print(pre + string + COLOURS['end'])

class Linter:
    def __init__(self, name, languages, script, check):
        self.name = name
        self.languages = languages
        self.script = script
        self.check = check

        self.available = subprocess.run(self.check, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, shell=True).returncode == 0

        if self.available:
            prettyprint(['okblue', 'underline'], 'Loaded linter: {}'.format(name))
            print('\n'.join(['  Able to use language: {}'.format(lang) for lang in languages]))
            global LINTABLE
            for language in languages:
                if language in LINTABLE:
                    LINTABLE[language].append(name)
                else:
                    LINTABLE[language] = [name]
        else:
            prettyprint(['err', 'underline'], 'Unable to load linter: {}'.format(name))
    def lint_file(self, filename):
        if self.available:
            proc = subprocess.Popen(self.script.format(filename), shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
            out, _ = proc.communicate()
            out = out.decode('utf-8')
            if proc.returncode != 0:
                prettyprint('warn', 'Linting errors found in {}:'.format(filename))
                print(out)
            else:
                prettyprint('okgreen', 'Linted {} and found no errors'.format(filename))

def new_linter(name, languages, script, check):
    LINTERS[name] = Linter(name, languages, script, check)

new_linter('CCPLint', ['.cc', '.cpp', '.ino'], 'cpplint {}', 'which cpplint')
new_linter('ESLint', ['.js', '.json'], 'node node_modules/eslint/bin/eslint.js -c .eslintrc.json {}', '[ -e node_modules/eslint/bin/eslint.js ]')
new_linter('HTMLHint', ['.html'], 'htmlhint -c Scripts/.htmlhintrc.json {}', 'which htmlhint')
new_linter('PyLint', ['.py'], 'pylint -s n {}', 'which pylint')
new_linter('ReMark', ['.md'], 'node node_modules/remark-cli/cli.js --no-stdout --frail {}', '[ -e node_modules/remark-cli/cli.js ]')

def lint_file(path):
    _, extension = os.path.splitext(path)
    if extension in LINTABLE:
        for linter in LINTABLE[extension]:
            proc = Process(target=LINTERS[linter].lint_file, args=(path,))
            proc.start()

def excluded(filepath):
    for exclusion in EXCLUDE:
        filepath = os.path.basename(os.path.realpath(filepath))
        exclusion = os.path.basename(exclusion)
        if filepath == exclusion:
            return True
    return False

try:
    GLOBS = []

    if ARGS.paths == []:
        GLOBS.append(os.listdir(os.getcwd()))
    for arg in ARGS.paths:
        if os.path.isdir(arg):
            arg += '**/*'
        GLOBS.append([path for path in glob.glob(arg, recursive=True) if not excluded(path) and os.path.isfile(path)])
    for item in GLOBS:
        for file_path in item:
            lint_file(file_path)

except KeyboardInterrupt:
    prettyprint(['err', 'bold'], 'Cancelled! Exiting...')
    quit()
