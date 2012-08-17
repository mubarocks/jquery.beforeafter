 /*
 *  Project: Before After
 *  Project URL: https://github.com/dfadler/jquery.beforeafter
 *  Description: Parses CSS for pseudo classes before & after, if found divs are injected into the DOM with the respective classes.
 *  Author: Dustin Fadler
 *  Copyright 
 *  License: GNU General Public License, version 3 (GPL-3.0) http://opensource.org/licenses/GPL-3.0
 *
 *global Modernizr, console
 */


;(function($, window, undefined) {

    var beforeAfter = 'beforeAfter',
        isLegacy =  Modernizr ? !Modernizr.generatedcontent : document.all && !document.querySelector,
        defaults = {
            contentPattern: new RegExp(/content: '.'/),
            elements: [],
            extensionPattern: new RegExp(/.css$/),
            legacy: true,
            pseudoPattern: (isLegacy || $.browser.mozilla) ? new RegExp(/:before|:after/) : new RegExp(/::before|::after/),
            stylesheets: document.styleSheets,
            stylesheetsLength: document.styleSheets.length,
            stylesheet: undefined,
            applyCss: false
        };

    function BeforeAfter(options) {
        this.ele = document;
        this.config = $.extend({}, defaults, options);

        if(this.config.legacy === true && !isLegacy) {
            return false;
        } else {
            this.init();
        }
    }

    BeforeAfter.prototype.checkStylesheet = function(stylesheet){

        var stylesheets = this.config.stylesheets,
            stylesheetsLength = stylesheets.length,
            stylesheet = (stylesheet === undefined) ? this.config.stylesheet : stylesheet;

        if(stylesheet === this.config.stylesheet) {
            var pattern = new RegExp(stylesheet);
            for(var i = 0; i < stylesheetsLength; i++) {
                if (pattern.test(stylesheets[i].href)) {
                    return stylesheets[i];
                }
            }
            return stylesheets;
        } else {
            return stylesheets;
        }
    };

    BeforeAfter.prototype.parseStylesheet = function(stylesheet) {

        var stylesheets = this.config.stylesheets,
            stylesheetsLength = stylesheets.length,
            stylesheet = stylesheet || this.config.stylesheet,
            pattern = this.config.pseudoPattern,
            declarations = [],
            contents = [],
            declarationsLength,
            declarationType = isLegacy ? 'selectorText' : 'cssText';
            elements = [];

        function parseRules(stylesheet) {
            var rules, rulesLength;

            rules = stylesheet.cssRules || stylesheet.rules;
            rulesLength = rules.length;

            for(var i = 0; i < rulesLength; i++) {
                if(pattern.test(rules[i][declarationType ])) {

                    contents.push(
                        rules[i].style['content'].charAt(1)
                        );

                    declarations.push(rules[i]);
                }
            }
        }

        function parseDeclaration(declaration, content) {

            var pseudoPrefix = new RegExp(/::/),
                pseudoClass = declaration[declarationType].match(pattern),
                pseudoClass = pseudoPrefix.test(pseudoClass) ? pseudoClass[0].replace('::', '') : pseudoClass[0].replace(':', ''),
                selectors = declaration.selectorText.split(','),
                selectorsLength = selectors.length,
                selector, content;
            
            for(var i = 0; i < selectorsLength; i++) {
                if( pattern.test(selectors[i]) ){
                    selector = selectors[i].replace(pattern, '');
                }
            }

            elements.push({
                selector: selector,
                pseudoClass: pseudoClass,
                content: content
            });
        }

        if(stylesheet === this.config.stylesheet) {
            
            parseRules(stylesheet);
            
        } else {

            for(var i = 0; i < stylesheetsLength; i++) {
                parseRules(stylesheets[i]);
            }
        }

        declarationsLength = declarations.length;

        for(var i = 0; i < declarationsLength; i++) {
            
            parseDeclaration(
                declarations[i], 
                contents[i]
                );
        }
        
        return elements;

    };

    BeforeAfter.prototype.addContainer = function(elements) {
        
        var elementsLength = elements.length,
            that = this.addContainer;

        if(elements.length === 1 || elements.length === undefined) {
            
            that.add(elements);

        } else {

            for(var i = 0; i < elementsLength; i++){

                var element =  elements[i];

                that.add(element);
            }
        }

    };

    BeforeAfter.prototype.addContainer.add = function(element) {

            if(element.pseudoClass === 'before') {
                
                $(element.selector)
                    .prepend(
                        '<div class="before">'+element.content+'</div>'
                        );

            } else {
               
               $(element.selector)
                    .append(
                        '<div class="after">'+element.content+'</div>'
                        ); 
            }
    };

    BeforeAfter.prototype.init = function() {

        var stylesheets = this.checkStylesheet(),
            declarations = this.parseStylesheet(stylesheets);


        this.addContainer(declarations);

    };

    // A really lightweight plugin wrapper around the constructor
    // preventing against multiple instantiations
    $.fn[beforeAfter] = function(options) {

        return this.each(function(){

            var ele = window.document;

            if (!$.data(ele, 'plugin_' + beforeAfter)) {
                
                $.data(
                    ele, 
                    'plugin_' + beforeAfter, 
                    new BeforeAfter(options)
                    );
            }
        });

    };

})(jQuery, window);