/**
 * @fileOverview BrowserDetect module definition
 */

//TODO: UMD
//define(function(require) {
var BrowserDetect = (function() {
    'use strict';

    //var $ = require('jquery');
    
    /**
     * Intended to report information about the user's browser capabilities.
     * Feature, OS, and Browser detection is performed.
     * Used in place of Modernizr to avoid bringing in a bloated (and sometimes broken) detection library
     *
     * Usage:
     *   var browserDetect = require('lib/BrowserDetect');
     *
     *   browserDetect.features.canvas          // Canvas is supported
     *   browserDetect.os.mobile                // User is on a Mobile device
     *   browserDetect.browser.ie               // Internet Explorer browser is detected
     *   browserDetect.browser.ieVersion < 9    // Internet Explorer version is 8 or below
     *
     * @class BrowserDetect
     * @constructor
     */
    var BrowserDetect = function() {
        this.userAgent = '';
        this.vendor = '';
        this.platform = '';
        this.appVersion = '';

        /**
         * Feature detection results
         *
         * @property features
         * @type {object}
         */
        this.features = {
            touch: false,               // Supports touch events
            transforms: false,          // Supports CSS transforms
            transforms3d: false,        // Supports 3D CSS transforms
            canvas: false,              // Supports HTML5 Canvas
            localstorage: false,         // Supports local storage
            svg: false
        };

        /**
         * OS detection results
         *
         * @property features
         * @type {object}
         */
        this.os = {
            mac: false,                 // Mac desktop
            windows: false,             // Windows desktop
            mobile: false,              // Any mobile device (phone or tablet)
            phone: false,               // Any mobile phone device
            tablet: false,              // Any mobile tablet device
            retina: false,              // Any retina-based device
            iOS: false,                 // Any iOS (iPhone or iPad)
            iOSVersion: 0,              // iOS version number
            iPhone: false,              // iPhone device
            iPad: false,                // iPad device
            android: false              // Android device
        };

        /**
         * Browser detection results
         *
         * @property features
         * @type {object}
         */
        this.browser = {
            ie: false,                  // Internet Explorer
            ieVersion: 0,               // Internet Explorer version number
            firefox: false,             // Firefox
            safari: false,              // Safari
            chrome: false,              // Chrome (both Desktop and Android)
            android: false,             // Stock Android Browser
            iframed: false,             // Window is being hosted within an iFrame
            appMode: false              // Window is in iOS full-screen app mode
        };

        this.sniffCapabilities();
        this.addBodyClasses();
    };

    /**
    * Detects features, os, and browser
    */
    BrowserDetect.prototype.sniffCapabilities = function() {
        this.userAgent = navigator.userAgent.toLowerCase();

        if (navigator.vendor) {
            this.vendor = navigator.vendor.toLowerCase();
        }
        this.platform = navigator.platform.toLowerCase();
        this.appVersion = navigator.appVersion.toLowerCase();

        // Features
        this.features.touch = this.detectTouch();
        this.features.localstorage = this.detectLocalStorage();
        this.features.canvas = this.detectCanvas();
        this.features.transforms = this.detectTransforms();
        this.features.transforms3d = this.detectTransforms3d();
        this.features.svg = this.detectSvg();

        // OS
        this.os.mac = /mac/i.test(this.platform);
        this.os.windows = /win/i.test(this.platform);
        this.os.linux = /linux/i.test(this.platform);
        this.os.mobile = this.detectMobile();
        this.os.phone = this.detectPhone();
        this.os.tablet = this.detectTablet();
        this.os.retina = window.devicePixelRatio > 1;
        this.os.iPhone = /iphone/i.test(this.userAgent);
        this.os.iPad = /ipad/i.test(this.userAgent);
        this.os.iOS = this.os.iPhone || this.os.iPad;
        this.os.android = /android/i.test(this.userAgent);
        if (this.os.iOS) {
            this.os.iOSVersion = this.getiOSVersion();
        }

        // Browser
        this.browser.ie = /msie|trident/i.test(this.userAgent);
        if (this.browser.ie) {
            this.browser.ieVersion = this.getIEVersion();
        }
        this.browser.firefox = /firefox/i.test(this.userAgent);
        this.browser.safari = /apple/i.test(this.vendor) && /safari/i.test(this.userAgent);
        this.browser.chrome = /chrome/i.test(this.userAgent);
        this.browser.android = this.os.android && !this.browser.chrome; // Stock Android browser
        this.browser.appMode = this.detectAppMode();
        this.browser.iframed = this.detectIframed();
    };

    /**
     * Adds an appropriate classes to wrapper depending on detected browser capabilities.
     * This can be used for easy conditional styling of CSS rules based on browser capabilities.
     *
     * In order to work correctly, an assumption is made that the body tag already contains
     * hardcoded classes as follows:
     *
     * <body class="noJs noTouch">
     */
    BrowserDetect.prototype.addBodyClasses = function() {
        // Assumes body already contains 'noJs' class upon page load
        $(document.body).removeClass('noJs');
       
        // Assumes body already contains 'touch' class upon page load
        if (this.features.touch) {
            $(document.body).removeClass('noTouch');
            $(document.body).addClass('touch');
        } else {
            $(document.body).removeClass('touch');
            $(document.body).addClass('noTouch');
        }

        if (this.features.transforms3d) {
            $(document.body).removeClass('noTransforms3d');
            $(document.body).addClass('transforms3d');
        } else {
            $(document.body).removeClass('transforms3d');
            $(document.body).addClass('noTransforms3d');
        }
    };

    /////////////////////////////////////////////////////////////
    // Feature detection helpers
    /////////////////////////////////////////////////////////////

    BrowserDetect.prototype.detectTouch = function() {
        if(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
            return true;
        }
        return false;
    };

    BrowserDetect.prototype.detectCanvas = function() {
        var detectCanvas = false;

        var canvas = document.createElement('canvas');
        if (canvas.getContext && canvas.getContext('2d')) {
            detectCanvas = true;
        }
        
        return detectCanvas;
    };

    BrowserDetect.prototype.detectSvg = function() {
        var detectSvg = false;

        if (document.createElement('svg').getAttributeNS) {
            detectSvg = true;
        }

        return detectSvg;
    };

    BrowserDetect.prototype.detectTransforms = function() {
        var detectTransforms = false;

        var el = document.createElement('p');
        var t;
        var transforms = {
            'WebkitTransform':'-webkit-transform',
            'OTransform':'-o-transform',
            'msTransform':'-ms-transform',
            'MozTransform':'-moz-transform',
            'transform':'transform'
        };

        /* Add it to the body to get the computed style.*/
        document.body.insertBefore(el, document.body.lastChild);

        for(t in transforms){
            if( el.style[t] !== undefined ){
                detectTransforms = true;
                break;
            }
        }
        
        return detectTransforms;
    };

    /*
     */
    BrowserDetect.prototype.detectTransforms3d = function() {
        var el = document.createElement('p');
        var t;
        var has3d;
        var transforms = {
            'WebkitTransform':'-webkit-transform',
            'OTransform':'-o-transform',
            'msTransform':'-ms-transform',
            'MozTransform':'-moz-transform',
            'transform':'transform'
        };

        /* Add it to the body to get the computed style.*/
        document.body.insertBefore(el, document.body.lastChild);

        for(t in transforms){
            if( el.style[t] !== undefined ){
                el.style[t] = 'matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)';
                has3d = window.getComputedStyle(el).getPropertyValue(transforms[t]);
                break;
            }
        }

        if( has3d !== undefined ){
            return has3d !== 'none';
        } else {
            return false;
        }
    };

    BrowserDetect.prototype.detectLocalStorage = function() {
        var detectLocalStorage = false;

        var test = 'test';
        try {
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            detectLocalStorage = true;
        } catch(e) {
        }

        return detectLocalStorage;
    };

    /////////////////////////////////////////////////////////////
    // OS detection helpers
    /////////////////////////////////////////////////////////////

    /**
    * Determine whether user-agent indicates a mobile device
    *
    * @returns {bool} true if user-agent indicates a mobile device
    */
    BrowserDetect.prototype.detectMobile = function() {
        var mobileStrings = [
            'iemobile',
            'midp',
            '240x320',
            'blackberry',
            'netfront',
            'nokia',
            'panasonic',
            'portalmmm',
            'sharp',
            'sie-',
            'sonyericsson',
            'symbian',
            'windows ce',
            'benq',
            'mda',
            'mot-',
            'opera mini',
            'philips',
            'pocket pc',
            'sagem',
            'samsung',
            'sda',
            'sgh-',
            'vodafone',
            'xda',
            'palm',
            'iphone',
            'ipod',
            'ipad',
            'android'
        ];

        var userAgent = navigator.userAgent.toLowerCase();
        var detectMobile = false;
        for(var d = 0; d < mobileStrings.length; d++){
            if(userAgent.indexOf(mobileStrings[d]) !== -1){
                detectMobile = true;
                break;
            }
        }

        return detectMobile;
    };
    

    /**
    * Determine whether user-agent indicates a mobile phone device
    *
    * @returns {bool} true if user-agent indicates a mobile phone device
    */
    BrowserDetect.prototype.detectPhone = function() {
        var detectPhone = false;
        var maxHeight = 600;
        var deviceHeight = screen.height;
        
        if (this.os.mobile && deviceHeight <= maxHeight) {
            detectPhone = true;
        }
        
        return detectPhone;
    };
    
    /**
    * Determine whether user-agent indicates a mobile tablet device
    *
    * @returns {bool} true if user-agent indicates a mobile tablet device
    */
    BrowserDetect.prototype.detectTablet = function() {
        var detectTablet = false;
        
        if (this.os.mobile && !this.os.isPhone) {
            detectTablet = true;
        }
        
        return detectTablet;
    };

    /**
     * Check if the iOS browser is in full-screen App mode
     *
     * @returns {bool} True if in app mode
     */
    BrowserDetect.prototype.detectAppMode = function() {
        var detectAppMode = false;

        if (window.navigator.standalone === true) {
            detectAppMode = true;
        }
        return detectAppMode;
    };

    /**
     * Check if browser window is currently within an iframe
     * (can be useful in the scenario where we want to bust out of an undesired iframe)
     *
     * @returns {bool} True if hosted in an iframe
     */
    BrowserDetect.prototype.detectIframed = function() {
        var iframed = top !== self;
        return iframed;
    };

    /////////////////////////////////////////////////////////////
    // Browser detection helpers
    /////////////////////////////////////////////////////////////

    /**
    * Determines the browser version of IE
    *
    * @returns {float} Browser version number in the form 9.0
    */
    BrowserDetect.prototype.getIEVersion = function() {
        var ieVersion = 0;

        var matches = /msie (\d+.\d+)/i.exec(this.appVersion);

        if (matches != null && matches.length > 1) {
            ieVersion = parseFloat(matches[1]);
        }

        if (isNaN(ieVersion) || ieVersion === 0) {
            ieVersion = 11;
        }

        return ieVersion;
    };

    /**
    * Determines version of iOS
    *
    * @returns {float} OS version number in the form 7.0
    */
    BrowserDetect.prototype.getiOSVersion = function() {
        var iOSVersion = 0;

        var matches = /os (\d+_\d+)/i.exec(this.appVersion);

        if (matches != null && matches.length > 1) {
            iOSVersion = parseFloat(matches[1].replace('_', '.'));
        }
        return iOSVersion;
    };

    return new BrowserDetect();
})();