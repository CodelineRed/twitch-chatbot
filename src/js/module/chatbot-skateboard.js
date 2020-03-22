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
            let dataJson = JSON.parse(data);
            let viewRefs = window.app.$children[0].$refs.layout.$refs.view.$refs;

            if (typeof dataJson.method === 'string' && typeof viewRefs[dataJson.ref][dataJson.method] === 'function'
                    && typeof dataJson.env === 'string' && dataJson.env === 'web') {
                if (typeof dataJson.args === 'object' && dataJson.args !== null) {
                    viewRefs[dataJson.ref][dataJson.method](dataJson.args);
                } else {
                    viewRefs[dataJson.ref][dataJson.method]();
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
