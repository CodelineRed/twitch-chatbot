<?php
if (!file_exists(__DIR__ . '/../../gulpfile-config.json') 
        && is_readable(__DIR__ . '/../../gulpfile-config.dist.json') 
        && is_writable(__DIR__ . '/../../')) {
    copy(__DIR__ . '/../../gulpfile-config.dist.json', __DIR__ . '/../../gulpfile-config.json');
}

if (!file_exists(__DIR__ . '/../../.env') 
        && is_readable(__DIR__ . '/../../.env-dist') 
        && is_writable(__DIR__ . '/../../')) {
    copy(__DIR__ . '/../../.env-dist', __DIR__ . '/../../.env');
}
