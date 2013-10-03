NMJS.load('basics.selectors', {
    /**
    * @name NMJS.modules.basics.selectors
    * @namespace CSS2 and a part of CSS3 selector functions
    **/
    // Added by : Ryan Megidov
    // Based on Simon Willison, Dustin Diaz and Jacob Thornton's work
    // Created : 26/12/2011
    
    /* Usage :
     * nmQuery.css('a', {'color':'red'});
     * nmQuery.each('a', function(e){ console.log(e); })
     * OR
     * nmQuery("a[href*='php']").css({'backgroundColor':'red'}).addClass('zzz').addClass('zzz').toggleClass('yooo','yyyy').each(function(e){ console.log(e); })
     * nmQuery('a').each(function(e){ console.log(e); })
     */
    loaded: function() {
        window.nmSelectorVersion = window.nmSelectorVersion || 'old';
        if (window.nmSelectorVersion != 'new'){
            window.nmQuery = NMJS.modules.basics.selectors.nmSelector(); // Load main selector
        }else{
            window.nmSelector = NMJS.modules.basics.selectors.nmSelector(); // Load main selector
            window.nmQuery = NMJS.modules.basics.selectors.extensions; // Load extensions
        }
    },
    
    extensions : function(ele, searchIn){
        var context = searchIn || document;
        var selectElement = NMJS.modules.basics.selectors.nmSelector(); //redeclare incase missing when not using chaining style
        var nmq = selectElement(ele, context);

        nmq.isIE = !!navigator.userAgent.match(/MSIE/ig);
        nmq.isFx = (typeof NMJS.modules.ui == 'undefined') ? false : (("animation" in NMJS.modules.ui) ? true : false);

        nmq.each = function(cb){
            NMJS.modules.basics.selectors.each(selectElement(ele, context), cb);
            return this;
        };
        nmq.trim = function(str){
            return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
        };
        nmq.hasClass = function(cls) {
            var matches = [];
            nmq.each(function(e){
                if (e.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'))){
                    matches.push(e);
                }
            });
            return matches.length != 0 ? matches : false;
        };
        nmq.addClass = function(cls) {
            if (nmq.hasClass(cls)) return this;
            nmq.each(function(e){
                e.className += " " + cls;
                e.className = nmq.trim(e.className);
            });
            return this;
        };
        nmq.removeClass = function(cls) {
            nmq.each(function(e){
                var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
                e.className = e.className.replace(reg, ' ').replace(/^\s\s*/, '').replace(/\s\s*$/, '');
            });
            return this;
        };
        nmq.replaceClass = function(oldClass, newClass){
            if(nmq.hasClass(oldClass)){
                nmq.removeClass(oldClass);
                nmq.addClass(newClass);
            }
            return this;
        };
        nmq.toggleClass = function(cls1, cls2){
            if(nmq.hasClass(cls1)){
                nmq.replaceClass(cls1, cls2);
            }else if(nmq.hasClass(cls2)){
                nmq.replaceClass(cls2, cls1);
            }else{
                nmq.addClass(cls1);
            }
            return this;
        };
        nmq.toggle = function(event, one, two){
            nmq.each(function(e){
                var isToggled = 0; // Each anonymous function has it's own isToggled value
                if (typeof event == 'string') event = [event];
                for (f in event){
                    e[event[f]] = function(){ 
                        if (isToggled = Math.abs(--isToggled)) one(e); else two(e); 
                    };
                }
            });
            return this;
        };
        nmq.css = function(css){
            nmq.each(function(e){
                for (f in css) e.style[f] = css[f];
            });
            return this;
        };
        nmq.show = function(speed, style, callback){
            nmq.each(function(e){
                if (!nmq.isFx){
                    e.style.display = (style || 'block');
                    if (nmq.isIE){
                        e.style.zoom = 1;
                        e.style.filter = 'alpha(opacity=100);';
                    }else{
                        e.style.opacity = 1;
                    }
                    callback && callback(e);
                }else{
                    NMJS.modules.ui.animation.fx(e)
                    .fxAdd({type: 'opacity', from:10, to:100, step: 3, delay: (speed || 50), onstart: function(){ e.style.display = (style || 'block');}, onfinish: callback && callback(e) })
                    .fxRun();
                }
            });
            return this;
        };
        nmq.hide = function(speed, callback){
            nmq.each(function(e){
                if (!nmq.isFx){
                    if (nmq.isIE){
                        e.style.zoom = 1;
                        e.style.filter = 'alpha(opacity=0);';
                    }else{
                        e.style.opacity = 0;
                    }
                    callback && callback(e);
                }else{
                    NMJS.modules.ui.animation.fx(e)
                    .fxAdd({type: 'opacity', from:60, to:0, step: -5, delay: (speed || 50), onfinish: function(){ e.style.display = 'none'; callback && callback(e); } })
                    .fxRun();
                }
            });
            return this;
        };
        return nmq;
    },

    // Not as fast as inline loops in older browsers so don't use liberally
    each: function(a, fn) {
        for (var i = 0, l = a.length; i < l; i++) fn(a[i]);
    },

    isNode: function(el, t) {
        return el && typeof el === 'object' && (t = el.nodeType) && (t == 1 || t == 9);
    },

    arrayify: function(ar) {
        for (var i = 0, l = ar.length, r = []; i < l; i++) r[i] = ar[i];
        return r;
    },

    nmSelector : function () {
        var doc = document
        ,html = doc.documentElement
        ,byTag = 'getElementsByTagName'
        ,qSA = 'querySelectorAll'
        ,id = /#([\w\-]+)/
        ,clas = /\.[\w\-]+/g
        ,idOnly = /^#([\w\-]+)$/
        ,classOnly = /^\.([\w\-]+)$/
        ,tagOnly = /^([\w\-]+)$/
        ,tagAndOrClass = /^([\w]+)?\.([\w\-]+)$/
        ,easy = new RegExp(idOnly.source + '|' + tagOnly.source + '|' + classOnly.source)
        ,splittable = /(^|,)\s*[>~+]/
        ,normalizr = /^\s+|\s*([,\s\+\~>]|$)\s*/g
        ,splitters = /[\s\>\+\~]/
        ,splittersMore = /(?![\s\w\-\/\?\&\=\:\.\(\)\!,@#%<>\{\}\$\*\^'"]*\]|[\s\w\+\-]*\))/
        ,simple = /^(\*|[a-z0-9]+)?(?:([\.\#]+[\w\-\.#]+)?)/
        ,attr = /\[([\w\-]+)(?:([\|\^\$\*\~]?\=)['"]?([ \w\-\/\?\&\=\:\.\(\)\!,@#%<>\{\}\$\*\^]+)["']?)?\]/
        ,pseudo = /:([\w\-]+)(\(['"]?([\s\w\+\-]+)['"]?\))?/
        ,dividers = new RegExp('(' + splitters.source + ')' + splittersMore.source, 'g')
        ,tokenizr = new RegExp(splitters.source + splittersMore.source)
        ,chunker = new RegExp(simple.source + '(' + attr.source + ')?' + '(' + pseudo.source + ')?')
        // Check if we can pass a selector to a non-CSS3 compatible qSA.
        // NOT suitable for validating a selector, it's too lose; it's the users' responsibility to pass valid selectors
        ,css2 = /^(([\w\-]*[#\.]?[\w\-]+|\*)?(\[[\w\-]+([\~\|]?=['"][ \w\-\/\?\&\=\:\.\(\)\!,@#%<>\{\}\$\*\^]+["'])?\])?(\:(link|visited|active|hover))?([\s>+~\.,]|(?:$)))+$/
        ,walker = {
            ' ': function (node) {
                return node && node !== html && node.parentNode;
            },
            '>': function (node, contestant) {
                return node && node.parentNode == contestant.parentNode && node.parentNode;
            },
            '~': function (node) {
                return node && node.previousSibling;
            },
            '+': function (node, contestant, p1, p2) {
                return (!node) ? false : (p1 = previous(node)) && (p2 = previous(contestant)) && p1 == p2 && p1;
            }
        };

        function cache() {
            this.c = {};
        }
        cache.prototype = {
            g: function (k) {
                return this.c[k] || undefined;
            },
            s: function (k, v, r) {
                return (this.c[k] = (r ? new RegExp(v) : v));
            }
        };

        var classCache = new cache(), cleanCache = new cache(), attrCache = new cache(), tokenCache = new cache();

        function classRegex(c) {
            return classCache.g(c) || classCache.s(c, '(^|\\s+)' + c + '(\\s+|$)', 1)
        }

        function flatten(ar) {
            for (var r = [], i = 0, l = ar.length; i < l; ++i) arrayLike(ar[i]) ? (r = r.concat(ar[i])) : (r[r.length] = ar[i]);
            return r;
        }

        function previous(n) {
            while (n = n.previousSibling) if (n.nodeType == 1) break;
            return n;
        }

        function q(query) {
            return query.match(chunker);
        }

        // Called using `this` as element and arguments from regex group results given
        function interpret(whole, tag, idsAndClasses, wholeAttribute, attribute, qualifier, value) {
            var i, m, k, o, classes;
            if (this.nodeType !== 1) return false;
            if (tag && tag !== '*' && this.tagName && this.tagName.toLowerCase() !== tag) return false;
            
            if (idsAndClasses && (m = idsAndClasses.match(id)) && m[1] !== this.id) return false;
            if (idsAndClasses && (classes = idsAndClasses.match(clas))) {
                for (i = classes.length; i--;) if (!classRegex(classes[i].slice(1)).test(this.className)) return false;
            }
            if (wholeAttribute && !value) { // Select is just for existance of attrib
                o = this.attributes;
                for (k in o) {
                    if (Object.prototype.hasOwnProperty.call(o, k) && (o[k].name || k) == attribute) return this;
                }
            }
            if (wholeAttribute && !checkAttr(qualifier, getAttr(this, attribute) || '', value)) return false; // Select is for attrib equality
            return this;
        }

        function clean(s) {
            return cleanCache.g(s) || cleanCache.s(s, s.replace(/([.*+?\^=!:${}()|\[\]\/\\])/g, '\\$1'));// Remove special chars
        }

        function checkAttr(qualify, actual, val) {
            switch (qualify) {
                case '=':
                    return actual == val;
                case '^='://Matches any element whose att attribute value begins with "val"
                    return actual.match(attrCache.g('^=' + val) || attrCache.s('^=' + val, '^' + clean(val), 1));
                case '$='://Matches any element whose att attribute value ends with "val".
                    return actual.match(attrCache.g('$=' + val) || attrCache.s('$=' + val, clean(val) + '$', 1));
                case '*='://Matches any element whose att attribute value contains the substring "val".
                    return actual.match(attrCache.g(val) || attrCache.s(val, clean(val), 1));
            }
            return 0;
        }

        // Given a selector, first check for simple cases then collect all base candidate matches and filter
        function _nmSelector(selector, _root) {
            var r = [], ret = [], i, l, m, token, els, intr, item, root = _root,
            tokens = tokenCache.g(selector) || tokenCache.s(selector, selector.split(tokenizr)), dividedTokens = selector.match(dividers);

            if (!tokens.length) return r;

            token = (tokens = tokens.slice(0)).pop(); // Copy cached tokens, take the last one
            if (tokens.length && (m = tokens[tokens.length - 1].match(idOnly))) root = byId(_root, m[1]);
            if (!root) return r;

            intr = q(token);
            // Collect base candidates to filter
            els = root !== _root && root.nodeType !== 9 && dividedTokens && /^[+~]$/.test(dividedTokens[dividedTokens.length - 1]) ?
            function (r) {
                while (root = root.nextSibling) {
                    root.nodeType == 1 && (intr[1] ? intr[1] == root.tagName.toLowerCase() : 1) && (r[r.length] = root);
                }
                return r;
            }([]) :
            root[byTag](intr[1] || '*');
            // Filter elements according to the right part of the selector
            for (i = 0, l = els.length; i < l; i++) {
                if (item = interpret.apply(els[i], intr)) r[r.length] = item;
            }
            if (!tokens.length) return r;

            // Filter further according to the rest of the selector (the left side)
            NMJS.modules.basics.selectors.each(r, function(e) {
                if (ancestorMatch(e, tokens, dividedTokens)) ret[ret.length] = e;
            });
            return ret;
        }

        // Given elements matching the right-most part of a selector, filter out any that don't match the rest
        function ancestorMatch(el, tokens, dividedTokens, root) {
            var cand;
            // Recursively work backwards through the tokens and up the dom, covering all options
            function crawl(e, i, p) {
                while (p = walker[dividedTokens[i]](p, e)) {
                    if (NMJS.modules.basics.selectors.isNode(p) && (interpret.apply(p, q(tokens[i])))) {
                        if (i) {
                            if (cand = crawl(p, i - 1, p)) return cand;
                        } else return p;
                    }
                }
            }
            return (cand = crawl(el, tokens.length - 1, el)) && (!root || isAncestor(cand, root));
        }

        function uniq(ar) {
            var a = [], i, j;
            o: for (i = 0; i < ar.length; ++i) {
                for (j = 0; j < a.length; ++j) if (a[j] == ar[i]) continue o; 
                a[a.length] = ar[i];
            }
            return a;
        }
        
        function arrayLike(o) {
            return (typeof o === 'object' && isFinite(o.length));
        }

        function normalizeRoot(root) {
            if (!root) return doc;
            if (typeof root == 'string') return nmq(root)[0];
            if (!root.nodeType && arrayLike(root)) return root[0];
            return root;
        }

        function byId(root, id, el) {
            // If doc, query on it, else query the parent doc or if a detached fragment rewrite the query and run on the fragment
            // Element=1 Attr=2 Text=3 Entity=6 Document=9
            return root.nodeType === 9 ? root.getElementById(id) :
            root.ownerDocument && (
                ((el = root.ownerDocument.getElementById(id)) && isAncestor(el, root) && el) ||
                (!isAncestor(root, root.ownerDocument) && select('[id="' + id + '"]', root)[0])
            );
        }

        function nmq(selector, _root) {
            var m, el, root = normalizeRoot(_root);

            // Easy, fast cases that we can dispatch with simple DOM calls
            if (!root || !selector) return [];
            if (selector === window || NMJS.modules.basics.selectors.isNode(selector)) {
                return !_root || (selector !== window && NMJS.modules.basics.selectors.isNode(root) && isAncestor(selector, root)) ? [selector] : [];
            }
            if (selector && arrayLike(selector)) return flatten(selector);
            if (m = selector.match(easy)) {
                if (m[1]) return (el = byId(root, m[1])) ? [el] : [];
                if (m[2]) return NMJS.modules.basics.selectors.arrayify(root[byTag](m[2]));
            }

            return select(selector, root);
        }

        // If the root is not "document" and a relationship selector is first we have to do some awkward adjustments to get it to work, even with querySelectAll
        function collectSelector(root, collector) {
            return function(s) {
                var oid, nid;
                if (splittable.test(s)) {
                    if (root.nodeType !== 9) {
                        // Make sure the el has an id, rewrite the query, set root to doc and run it
                        if (!(nid = oid = root.getAttribute('id'))) root.setAttribute('id', nid = '__nmSelectormeupscotty');
                        s = '[id="' + nid + '"]' + s; // avoid byId and allow us to match context element
                        collector(root.parentNode || root, s, true);
                        oid || root.removeAttribute('id');
                    }
                    return;
                }
                s.length && collector(root, s, false);
            }
        }

        var isAncestor = 'compareDocumentPosition' in html ?
            function (element, container) {
                return (container.compareDocumentPosition(element) & 16) == 16;
            } : 'contains' in html ?
            function (element, container) {
                container = container.nodeType === 9 || container == window ? html : container;
                return container !== element && container.contains(element);
            } :
            function (element, container) {
                while (element = element.parentNode) if (element === container) return 1;
                return 0;
            };
        
        var getAttr = function() {
            // Detect buggy IE src/href getAttribute() call
            var e = doc.createElement('p');
            return ((e.innerHTML = '<a href="#x">x</a>') && e.firstChild.getAttribute('href') != '#x') ?
            function(e, a) {
                return a === 'class' ? e.className : (a === 'href' || a === 'src') ? e.getAttribute(a, 2) : e.getAttribute(a);
            } :
            function(e, a) {
                return e.getAttribute(a);
            };
        }();
        
        // Native support for CSS2 selectors only
        var selectCSS2 = function (selector, root) {
            var i, r, l, ss, result = [];
            selector = selector.replace(normalizr, '$1');
            // safe to pass whole selector to qSA
            if (!splittable.test(selector) && css2.test(selector)) return NMJS.modules.basics.selectors.arrayify(root[qSA](selector));
            // for more complex queries such as "a[href^=http],span"
            NMJS.modules.basics.selectors.each(ss = selector.split(','), collectSelector(root, function(ctx, s, rewrite) {
                // use native querySelectAll if selector is compatile, otherwise use _nmSelector()
                r = css2.test(s) ? ctx[qSA](s) : _nmSelector(s, ctx);
                for (i = 0, l = r.length; i < l; i++) {
                    if (ctx.nodeType === 9 || rewrite || isAncestor(r[i], root)) result[result.length] = r[i];
                }
            }));
            return ss.length > 1 && result.length > 1 ? uniq(result) : result;
        };
        
        // No native selector support
        var selectNonNative = function (selector, root) {
            var result = [], items, m, i, l, r, ss;
            selector = selector.replace(normalizr, '$1');
            if (m = selector.match(tagAndOrClass)) {
                r = classRegex(m[2]);
                items = root[byTag](m[1] || '*');
                for (i = 0, l = items.length; i < l; i++) {
                    if (r.test(items[i].className)) result[result.length] = items[i];
                }
                return result;
            }
            // More complex selector, get `_nmSelector()` to do the work for us
            NMJS.modules.basics.selectors.each(ss = selector.split(','), 
                collectSelector(root, function(ctx, s, rewrite) {
                    r = _nmSelector(s, ctx);
                    for (i = 0, l = r.length; i < l; i++) {
                        if (ctx.nodeType === 9 || rewrite || isAncestor(r[i], root)) result[result.length] = r[i];
                    }
                })
            );
            return ss.length > 1 && result.length > 1 ? uniq(result) : result;
        };
        
        var select = (doc[qSA] ? selectCSS2 : selectNonNative);
        /**
        * Helper functions go here
        */
        nmq.func = NMJS.modules.basics.selectors.extensions;
        nmq.isIE = !!navigator.userAgent.match(/MSIE/ig);
        nmq.isFx = (typeof NMJS.modules.ui == 'undefined') ? false : (("animation" in NMJS.modules.ui) ? true : false);

        nmq.each = function(ele, cb){
            nmq.func(ele).each(cb);
        };
        nmq.hasClass = function(ele, cls) {
            return nmq.func(ele).hasClass(cls);
        };
        nmq.addClass = function(ele, cls) {
            nmq.func(ele).addClass(cls);
        };
        nmq.removeClass = function(ele, cls) {
            nmq.func(ele).removeClass(cls);
        };
        nmq.replaceClass = function(ele, oldClass, newClass){
            nmq.func(ele).replaceClass(oldClass, newClass);
        };
        nmq.toggleClass = function(ele, cls1, cls2){
            nmq.func(ele).toggleClass(cls1, cls2);
        };
        nmq.css = function(ele, css){
            nmq.func(ele).css(css);
        };
        nmq.show = function(ele, speed, style, callback){
            nmq.func(ele).show(speed, style, callback);
        };
        nmq.hide = function(ele, speed, callback){
            nmq.func(ele).hide(speed, callback);
        };
        nmq.toggle = function(ele, event, one, two){
            nmq.func(ele).toggle(event, one, two);
        };
        return nmq;
    }
});