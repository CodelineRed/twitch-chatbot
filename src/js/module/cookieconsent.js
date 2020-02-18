/*global cookieLayer*/
'use strict';

/**
 * Init cookie consent look and behavior
 * 
 * @returns {undefined}
 */
function initCookieConsent() {
    (function($) {
        window.cookieconsent.initialise({
            window: '<div role="dialog" aria-label="cookieconsent" aria-describedby="cookieconsent:desc" class="cc-window w-100 {{classes}}">'
                    + '<div class="container"><div class="row align-items-center">{{children}}</div></div></div>',
            elements: {
                messagelink: '<div class="col-12 col-sm-6 col-lg-8 pb-3 pb-sm-0"><span id="cookieconsent:desc" class="cc-message">{{message}} ' 
                        + '<a aria-label="' + cookieLayer.messageLink + '" tabindex="0" class="cc-link" href="{{href}}" data-toggle="modal" data-target="#cookie-policy">{{link}}</a></span></div>'
            },
            compliance: {
                info: '<div class="cc-compliance col-12 col-sm-6 col-lg-4">{{dismiss}}</div>',
                'opt-in':'<div class="cc-compliance col-12 col-sm-6 col-lg-4">{{dismiss}}{{allow}}</div>',
                'opt-out': '<div class="cc-compliance col-12 col-sm-6 col-lg-4">{{deny}}{{dismiss}}</div>'
            },
            theme: 'classic',
            type: 'info',
            content: {
                header: cookieLayer.header,
                message: cookieLayer.message,
                dismiss: cookieLayer.dismiss,
                allow: cookieLayer.allow,
                deny: cookieLayer.deny,
                link: cookieLayer.link,
                policy: cookieLayer.policy,
                href: cookieLayer.href
            },
            onInitialise: function(status) {
                var type = this.options.type;
                var didConsent = this.hasConsented();

                if (type === 'opt-in' && didConsent) {
                    // enable cookies
                }

                if (type === 'opt-out' && !didConsent) {
                    // disable cookies
                }

                // set .cc-window at the end of body to disable bottom margin on .container
                setTimeout(function() {
                    $('body').append($('.cc-window'));
                }, 1000);
            },
            onPopupOpen: function() {
                // do something
            },
            onPopupClose: function() {
                // do something
            },
            onStatusChange: function(status, chosenBefore) {
                var type = this.options.type;
                var didConsent = this.hasConsented();

                if (type === 'opt-in' && didConsent) {
                    // enable cookies
                }

                if (type ==='opt-out' && !didConsent) {
                    // disable cookies
                }

                // set .cc-window at the end of body to disable bottom margin on .container
                setTimeout(function() {
                    $('body').append($('.cc-window'));
                }, 1000);
            },
            onRevokeChoice: function() {
                var type = this.options.type;

                if (type === 'opt-in') {
                    // disable cookies
                }

                if (type === 'opt-out') {
                    // enable cookies
                }

                // set .cc-window at the top of body to enable bottom margin on .container
                $('body').prepend($('.cc-window'));
            }
        });
    })(jQuery);
}
