/*global cssua skateboard initCookieConsent initSlider initImageLazyLoad initCssuaMonitor*/
'use strict';

function flashGif(element, duration) {
    element.style.display = 'inline';
    setTimeout(function() {
        element.style.display = 'none';
    }, duration);
}

// jQuery.noConflict();
(function($) {
    $(document).ready(function() {
        $('html').removeClass('no-js');
        $('[data-toggle="tooltip"]').tooltip();
        
        var counter = document.getElementById('counter');
        var boo = document.getElementById('boo');
        var confetti = document.getElementById('confetti');
        var firstLoad = false;

        skateboard('http://localhost:3000/skateboard?param=true', function(stream) {
            stream.pipe(stream);

            stream.on('data', function(data) {
                console.log(data);
                var n = parseInt(data);
                counter.textContent = n;

                if (n && n % 10 === 0) {
                    flashGif(confetti, 10 *1000);
                }

                if (!n && !firstLoad) {
                    flashGif(boo, 1000);
                }

                firstLoad = false;
            });

            stream.on('disconnection', function() {
                console.log('skateboard disconnected');
            });

            stream.on('reconnection', function() {
                console.log('skateboard reconnected');
            });

        }).on('connection', function() {
            console.log('skateboard connected');
        });
        
        initCssuaMonitor();
        initCookieConsent();
        initImageLazyLoad();
        initSlider();
    });
})(jQuery);
