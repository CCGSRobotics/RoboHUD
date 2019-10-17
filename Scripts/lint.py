#! /usr/bin/python
"""This script lints all files contained in every given path."""

import os
import subprocess
import argparse

PARSER = argparse.ArgumentParser(description=
                                 'Lint all files in the given directory')
PARSER.add_argument('paths', metavar='paths', type=str, nargs='*', default=['.'],
                    help='The paths to lint (defaults to .)')
ARGS = PARSER.parse_args()


EXCLUDE = ['node_modules', '.git']
GOOD_FILES = []
BAD_FILES = []
COMMANDS = {
        'js': ['node node_modules/eslint/bin/eslint.js FILENAME', '-c .eslintrc.json'],
        'cpp': ['cpplint FILENAME'],
        'html': ['htmlhint FILENAME', '-c Scripts/htmlhintrc.json'],
        'py': ['pylint FILENAME'],
        'md': ['node node_modules/remark-cli/cli.js FILENAME']
        }

CHECKS = {
    'js': ['[ -e node_modules/eslint/bin/eslint.js ]'],
    'cpp': ['which cpplint'],
    'html': ['which htmlhint'],
    'py': ['which pylint'],
    'md': ['[ -e node_modules/remark-cli/cli.js ]']
}
EXISTS = {}

for lang in CHECKS:
    devnull = open(os.devnull, 'wb')
    res = subprocess.call(CHECKS[lang], stdout=devnull, stderr=devnull, shell=True)
    if not res:
        print('Able to use language: {}'.format(lang))
        EXISTS[lang] = True
    else:
        print(res)
        print('Unable to use language: {} (Not installed)'.format(lang))
        EXISTS[lang] = False

def lint(filename):
    """Lint a single file and return the result.

    Parameters:
    filename (str): The name of the file
    """
    print('----- Linting {}'.format(filename))

    ext = os.path.splitext(filename)[1][1:]
    COMMANDS[ext][0] = COMMANDS[ext][0].replace('FILENAME', filename)
    result = subprocess.call(COMMANDS[ext], shell=True)
    COMMANDS[ext][0] = COMMANDS[ext][0].replace(filename, 'FILENAME')

    return result

def check_file(name):
    """Check to see if a file is applicable for linting.

    Parameters:
    name (str): The name of the file
    """
    index = name.rfind('.')
    _, ext = name[:index], name[index+1:]
    if ext in COMMANDS and EXISTS[ext]:
        filename = os.path.join(root, name)
        result = lint(filename)
        if result != 0:
            BAD_FILES.append(os.path.join(root, name))
        else:
            GOOD_FILES.append(os.path.join(root, name))
            print('\33[32mFile passed all linting tests!\33[0m\n')

def check_dir(root_dir, dirs, files):
    """Check a directory for lintable files.

    Parameters:
    root_dir (str): The base filepath
    dirs (list): Every subdirectory of the directory
    files (list): Every file directly inside the directory
    """
    dirs[:] = [d for d in dirs if d not in EXCLUDE]
    files[:] = [f for f in files if f not in EXCLUDE]
    for name in files:
        check_file(os.path.join(root_dir, name))

def check_dirs(directory):
    """Call check_dir on every path in a directory.

    Parameters:
    directory (str): The path of the directory to operate on
    """
    for root_dir, dirs, files in os.walk(directory, topdown=True):
        check_dir(root_dir, dirs, files)
try:
    if ARGS.paths == []:
        check_dirs('.')
    else:
        for path in ARGS.paths:
            root = '.'
            if os.path.isfile(path):
                check_file(path)
            else:
                check_dirs(path)

except KeyboardInterrupt:
    print('Cancelled! Exiting...')
    quit()

for i in GOOD_FILES:
    print('\33[32m' + i + '\33[0m')
for i in BAD_FILES:
    print('\33[31m' + i + '\33[0m')

if BAD_FILES != []:
    ERROR = ''
    if len(BAD_FILES) == 1:
        ERROR = '1 file breaks its corresponding styleguide'
    else:
        ERROR = '{} files break their corresponding styleguides'.format(len(BAD_FILES))

    raise Exception(ERROR)
print('Congratulations! No files break their corresponding styleguides')
