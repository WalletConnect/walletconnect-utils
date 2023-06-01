#!/bin/bash

# Get the list of modified directories in git
modified_dirs=$(git status --porcelain | grep -o '^ M .*/.*/' | awk '{print $2}' | awk '{print substr($0, 1, length($0)-1)}')

# Predefined cp and rm commands
cp_command="cp ./misc/heartbeat/rollup.config.js ./misc/heartbeat/tsconfig.json "

# Iterate over modified directories
for dir in $modified_dirs; do
  # Execute the cp command
  eval "$cp_command $dir"

  # Execute the rm command
  eval "rm $dir/webpack.config.js $dir/tsconfig.esm.json"
done
