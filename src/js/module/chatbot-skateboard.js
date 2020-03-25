/*global app skateboard*/
'use strict';

let streamWrite = null;

function initChatbotSkateboard() {
    skateboard('http://localhost:3100/skateboard?param=true', function(stream) {
        stream.pipe(stream);
        
        streamWrite = function(object) {
            stream.write(JSON.stringify(object));
        };

        stream.on('data', function(data) {
            let viewRefsMethod = null;
            let dataJson = JSON.parse(data);
            
            if ((typeof window.app.$children === 'undefined' 
                || typeof window.app.$children[0].$refs.layout.$refs.view[dataJson.method] !== 'function') 
                && (typeof window.app.$children === 'undefined' 
                || typeof window.app.$children[0].$refs.layout.$refs.view.$refs[dataJson.ref] === 'undefined')) {
                return false;
            }
            
            if (typeof window.app.$children[0].$refs.layout.$refs.view[dataJson.method] === 'function') {
                viewRefsMethod = window.app.$children[0].$refs.layout.$refs.view[dataJson.method];
            } else {
                viewRefsMethod = window.app.$children[0].$refs.layout.$refs.view.$refs[dataJson.ref][dataJson.method];
            }
            
            if (typeof dataJson.method === 'string' && typeof viewRefsMethod === 'function'
                    && typeof dataJson.env === 'string' && dataJson.env === 'web') {
                if (typeof dataJson.args === 'object' && dataJson.args !== null) {
                    viewRefsMethod(dataJson.args);
                } else {
                    viewRefsMethod();
                }
            }
        });

        stream.on('disconnection', function() {
            //console.log('skateboard disconnected');
        });

        stream.on('reconnection', function() {
            //console.log('skateboard reconnected');
        });

    }).on('connection', function() {
        //console.log('skateboard connected');
    });
}
