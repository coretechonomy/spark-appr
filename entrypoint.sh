#!/bin/sh

set -e

xvfb-run --auto-servernum --server-args="-screen 0 1024x768x16" bash -c \
    "wine /tmp/etechonomy/${SETUP_EXE} & \
    pid=\$! && while kill -0 \$pid 2> /dev/null; do \
    xdotool key alt+i; \
    sleep 5; \
    ls ~/.wine/drive_c/users/root/AppData/Local/Temp; \
    if [ -f ~/.wine/drive_c/users/root/AppData/Local/Temp/${MSI_FILE} ]; then \
        mv ~/.wine/drive_c/users/root/AppData/Local/Temp/${MSI_FILE} /tmp/etechonomy/${MSI_FILE}.msi; \
        exit 0; \
    fi; \
    done && wait \$pid && echo 'Wine process finished'"
