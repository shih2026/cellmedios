#!/bin/zsh
cd -- "${0:A:h}"
if command -v node >/dev/null 2>&1; then
  task_node="$(command -v node)"
else
  task_node="/Users/shih/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
fi
export PATH="${task_node:h}:$PATH"
exec "$task_node" node_modules/vinext/dist/cli.js dev --host 127.0.0.1
