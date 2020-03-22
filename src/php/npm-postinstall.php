<?php
if (!file_exists(__DIR__ . '/../app/gulpfile.json')
        && is_readable(__DIR__ . '/../app/gulpfile.dist.json')
        && is_writable(__DIR__ . '/../app/')) {
    copy(__DIR__ . '/../app/gulpfile.dist.json', __DIR__ . '/../app/gulpfile.json');
}

if (!file_exists(__DIR__ . '/../app/chatbot.json')
        && is_readable(__DIR__ . '/../app/chatbot.dist.json')
        && is_writable(__DIR__ . '/../app/')) {
    copy(__DIR__ . '/../app/chatbot.dist.json', __DIR__ . '/../app/chatbot.json');
}
