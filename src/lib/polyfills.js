/* eslint-disable */
/**
 * Polyfills (for IE9 and above):
 * console.log, Event, CustomEvent, WeakMap, Number.isNaN, 
 * Object.assign, Object.values, Array.from, Location.origin, Location.toString,
 * DOMTokenList, matches, requestAnimationFrame, cancelAnimationFrame
 */
(function(W) {

    var D=W.document, O=W.Object, A=W.Array, E=W.Element, V=W.Event, L=W.Location;

    function fp(c,p,f){var o=c[p]=c[p]||f;o.APRPolyfill=f===o?null:f}
    function fy(o){return o.prototype}
    function ff(o,f){for(var k in o)fy(O).hasOwnProperty.call(o,k)&&f(k,o[k])}
    function fg(o,p,g){O.defineProperty(o,p,{get:g})}
    function fv(o,p){var v=['moz','webkit','ms','o'],i=v.length,fn;while(--i>=0)if((fn=o[p+v[i]]))return fn}

    fp(W,'console',{log:function(){}});

    fp(W,'Event',!fy(V).constructor?function(t,o){var e=document.createEvent('Event'),O=Object(o);e.initEvent(t,O.bubbles,O.cancelable);return e}:V);
    fp(W,'CustomEvent',!fy(CustomEvent).constructor?function(t,o){var e=document.createEvent('CustomEvent'),O=Object(o);e.initCustomEvent(t,O.bubbles,O.cancelable,O.detail);return e}:V);
    fp(W,'WeakMap',function shim(){var s={},i=0,K='__WeakMapID';return {'set':function(k,v){s[k[K]=i++]=v},'get':function(k){return s[k[K]]},'has':function(k){return k[K] in s},'delete':function(k){delete s[k[K]]}}});

    fp(Number,'isNaN',function(v){/*! source: mozilla */return v!==v});

    fp(O,'assign',function(o){var a=arguments,i=a.length,k,v;o=Object(o);while(--i>=1){v=a[i];for(k in v){if(({}).hasOwnProperty.call(v,k))o[k]=v[k]}}return o});
    fp(O,'values',function(o){var r=[],k;for(k in o)({}).hasOwnProperty.call(o,k)&&r.push(o[k]);return r});
    fp(A,'from',function(a,fn,t){var s=this,l=Object(a),f=l.length>>>0,r=typeof s=='function'?O(new s(f)):new Array(f),i=-1;while(++i<f)r[i]=fn?fn.call(t,l[i],i):l[i];r.length=f;return r});
    fp(O,'setPrototypeOf',function(o,p){'__proto__'in o?(o.__proto__=p):ff(p,function(k,v){o[k]=v})});

    if (!fy(L).origin) fg(fy(L),'origin',function(){return this.protocol+'//'+this.host});
    fp(fy(L),'toString',function(){return this.href});

    !function(g){var fs=function(t){return [].join.call(t,' ')},fi=function(t,s){return(' '+fs(t)+' ').indexOf(' '+s+' ')},fv=function(s){if(!(s=s+'')||/\s/.test(s))throw Error('"'+s+'" is invalid');return s},ft=function(s,f){var t=this;return t.contains(s)?(f===!1&&t.remove(s),!1):(f===!0&&t.add(s),!0)},fe=function(){return [].call(this,function(v,k){return !isNaN(k)})},fc=function(s){return !/\s/.test(s)&&fi(this,s)>=0},fr=function(a,b){var t=this;if(!b)throw TypeError('Not enough arguments');return t.contains(a=fv(a))&&(b=fv(b))&&(t.remove(a),t.add(b),!0)},fh=function(f,s){var t=this;ff(fe.call(t),function(k,v){f.call(s,v,+k,t)})},fk=function(){return O.keys(fe.call(this))},fT=function(e){var t=this;t.value=(e.getAttribute('class')||'').trim();t.length=t.value?[].push.apply(t,t.value.split(/\s+/)):0;t.element=e;fy(fT).toString=function(){return fs(this)};fy(fT)._values=fy(fT)._entries=fe;fy(fT)._keys=fk},_=D.createElement('a'),p='classList';fp(W,g,fT);(p in _)||fg(fy(E),p,function(){return new W[g](this)});fp(fy(fT),'add',function(){var t=this,a=arguments,i,s;for(i=0;i<a.length;i++)t.contains(s=fv(a[i]))||(fy(A).push.call(t,s),t.element.setAttribute('class',fs(t)))});fp(fy(fT),'remove',function(){var t=this,a=arguments,i=a.length,s;while(--i>=0)if(t.contains(s=fv(a[i]))){fh.call(t,function(v,k){v===s&&fy(A).splice.call(t,k,1)});t.element.setAttribute('class',fs(t))}});fp(fy(fT),'item',function(i){return this[i]||null});fp(fy(fT),'contains',fc);fp(fy(fT),'replace',fr);fp(fy(fT),'toggle',ft);fp(fy(fT),'forEach',fh);_[p].add('a','b');_[p].contains('b')||(fy(W[g]).contains=fc);_[p].toggle('c',!1)||(fy(W[g]).toggle=ft);_=null}('DOMTokenList');
    fp(fy(E),'matches',fy(E).matchesSelector||fv(fy(E),'MatchesSelector')||function(s){var t=this,m=(t.document||t.ownerDocument).querySelectorAll(s),i=m.length;while(--i>=0&&m[i]!==t);return i>-1});
    /*! based on: https://gist.github.com/paulirish/1579671 */fp(W,'requestAnimationFrame',fv(W,'RequestAnimationFrame')||(function(l){return function(fn){var n=+new Date,c=Math.max(0,16-n-l),i=W.setTimeout(function(){fn(n+c)},c);l=n+c;return i}})(0));fp(W,'cancelAnimationFrame',fv(W,'CancelAnimationFrame')||fv(W,'CancelRequestAnimationFrame')||function(i){clearTimeout(i)});

})(typeof window!=='undefined'&&window);
