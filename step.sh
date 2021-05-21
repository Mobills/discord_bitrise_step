#!/bin/bash
set -ex

THIS_SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

npm install --prefix $THIS_SCRIPT_DIR axios moment --save

$THIS_SCRIPT_DIR/step.js "${is_debug_mode}" "${webhook_url}" "${preset_status}" "${mention_role}"
