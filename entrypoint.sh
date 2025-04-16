#!/bin/sh

set -e

extracted_file=~/.wine/drive_c/users/root/AppData/Local/Temp/${MSI_FILE}

xvfb-run --auto-servernum --server-args="-screen 0 1024x768x16" bash -c \
    "extracted_file='${extracted_file}'; \
    wine /tmp/etechonomy/${SETUP_EXE} & \
    pid=\$! && while kill -0 \$pid 2> /dev/null; do \
        xdotool key alt+i; \
        sleep 1; \
        if [ -f ${extracted_file} ]; then \
            while true; do \
                last_modified=\$(stat -c %Y \$extracted_file 2>/dev/null); \
                if [ -z \$last_modified ]; then \
                    sleep 1; \
                    continue; \
                fi; \
                current_time=\$(date +%s); \
                time_diff=\$((current_time - last_modified)); \
                if [ \$time_diff -gt 5 ]; then \
                    break; \
                fi; \
                sleep 1; \
            done; \
            echo File extraction likely complete.; \
            mv ${extracted_file} /tmp/etechonomy/${MSI_FILE}; \
            exit 0; \
        fi; \
    done && wait \$pid && echo Wine process finished"