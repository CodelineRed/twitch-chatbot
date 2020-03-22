'use strict';

const loadCss = function(config) {
    let head = document.getElementsByTagName('head')[0];

    if (config.content) {
        let style = document.createElement('style');
        style.type = 'text/css';

        if (style.styleSheet) {
            style.styleSheet.cssText = config.content;
        } else {
            style.innerHTML = config.content;
        }

        head.appendChild(style);
    } else if (config.url) {
        let link = document.createElement('link');
        link.href = config.url;
        link.rel = 'stylesheet';
        link.type = 'text/css';
        head.appendChild(link);
    }
};
