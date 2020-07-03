/*global app skateboard*/
'use strict';

let socketWrite = null;

function initChatbotPort(port) {
    skateboard({port: port}, function(socket) {
        socket.pipe(socket);

        socketWrite = function(object) {
            if (typeof object.env !== 'undefined') {
                socket.write(JSON.stringify(object));
            }
        };

        socket.on('data', function(data) {
            let viewRefsMethod = null;
            let dataJson = JSON.parse(data);

            // if method not found and ref not found
            if ((typeof window.app.$children === 'undefined' 
                || typeof window.app.$children[0].$refs.layout.$refs.view[dataJson.method] !== 'function') 
                && (typeof window.app.$children === 'undefined' 
                || typeof window.app.$children[0].$refs.layout.$refs.view.$refs[dataJson.ref] === 'undefined')) {
                return false;
            }

            // if popout window or page
            if (typeof window.app.$children[0].$refs.layout.$refs.view[dataJson.method] === 'function') {
                viewRefsMethod = window.app.$children[0].$refs.layout.$refs.view[dataJson.method];
            } else if (typeof window.app.$children[0].$refs.layout.$refs.view.$refs[dataJson.ref][dataJson.method] === 'function') {
                // if static component
                viewRefsMethod = window.app.$children[0].$refs.layout.$refs.view.$refs[dataJson.ref][dataJson.method];
            } else if (typeof window.app.$children[0].$refs.layout.$refs.view.$refs[dataJson.ref][0][dataJson.method] === 'function') {
                // if dynamic component
                viewRefsMethod = window.app.$children[0].$refs.layout.$refs.view.$refs[dataJson.ref][0][dataJson.method];
            }

            // if method is function and env is "browser"
            if (typeof dataJson.method === 'string' && typeof viewRefsMethod === 'function'
                    && typeof dataJson.env === 'string' && dataJson.env === 'browser') {
                // if args defined
                if (typeof dataJson.args === 'object' && dataJson.args !== null) {
                    viewRefsMethod(dataJson.args);
                } else {
                    viewRefsMethod();
                }
            }
        });

        socket.on('disconnection', function() {
            //console.log('skateboard disconnected');
        });

        socket.on('reconnection', function() {
            //console.log('skateboard reconnected');
        });
    }).on('connection', function() {
        //console.log('skateboard connected');
    });
}

function initChatbotSkateboard() {
    if (/^#\/channel\/(.*)\/counter\/?/.test(window.location.hash)) {
        initChatbotPort(3150);
    } else if (/^#\/channel\/(.*)\/poll\/?/.test(window.location.hash)) {
        initChatbotPort(3140);
    } else if (/^#\/channel\/(.*)\/raffle\/?/.test(window.location.hash)) {
        initChatbotPort(3130);
    } else if (/^#\/channel\/(.*)\/player\/?/.test(window.location.hash)) {
        initChatbotPort(3120);
    } else if (/^#\/channel\/(.*)\/chat\/?/.test(window.location.hash)) {
        initChatbotPort(3110);
    } else {
        // Main Window
        initChatbotPort(3100);
    }
}
