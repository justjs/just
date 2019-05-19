 /**
 * Some polyfills (for ie8) used in 2 o more APR modules.
 * @ignore
 */
(function (W) {

	'use strict';

	var D=W.document, O=W.Object, S=W.String, A=W.Array, F=W.Function, E=W.Element, V=W.Event, L=W.Location;

	function fp(c,p,f,n){var o=c[p];o=o||f;o.APRPolyfill=f===o?null:f}
	function fl(o){/* Based on: mozilla & github/jonathantneal/EventListener */var _=[];fp(o,'addEventListener',function(t,l){var s=this,fa=function(s,t,f){s.attachEvent('on'+t,f);_.push({s:s,t:t,l:l,f:f})},f1=function(e){var h=l.handleEvent,H=D.documentElement;e=e||W.event;fp(e,'target',e.srcElement||s);fp(e,'currentTarget',s);fp(e,'relatedTarget',e.fromElement);fp(e,'timeStamp',+new Date());fp(e,'pageX',e.clientX+H.scrollLeft);fp(e,'pageY',e.clientY+H.scrollTop);h?h(e):l.call(s,e)},f2=function(e){if(D.readyState!='complete'){if(e!=0)return f1(e);e=new Event(t);e.srcElement=W;f2(e)}};t!='DOMContentLoaded'?fa(s,t,f1):fa(D,'readystatechange',f2),f2(0)});fp(o,'removeEventListener',function(t,l){var i=_.length,h;while(--i>=0)if((h=_[i]).s==this&&h.t==t&&h.l==l&&h.s.detachEvent('on'+(t=='DOMContentLoaded'?'readystatechange':t),h.f))break})}
	function fy(o){return o.prototype}
	function ff(o,f){for(var k in o)fy(O).hasOwnProperty.call(o,k)&&f(k,o[k])}
	function fg(o,p,g){O.defineProperty?O.defineProperty(o,p,{get:g}):o.__defineGetter__(p,g)};
	function fv(o,p){var v=['moz','webkit','ms','o'],i=v.length,fn;while(--i>=0)if(fn=o[p+v[i]])return fn}
	function fd(o){fp(o,'dispatchEvent',function(e){return this.fireEvent('on'+e.type,e)})}

	fp(W,'Event',!fy(V)||!fy(V).constructor.name?function(t,o){var D=document,e,b,c;o=o&&typeof o=='object'?o:{};b=!!o.bubbles;c=!!o.cancelable;if('createEvent' in D)return(e=D.createEvent('Event')).initEvent(t,b,c),e;e=D.createEventObject();e.type=t;e.bubbles=b;e.cancelable=c;return e}:V);
	fp(W,'CustomEvent',W.CustomEvent&&typeof W.CustomEvent=='object'?function(t,o){var W=window,D=W.document,e=D.createEvent('CustomEvent');o=o&&typeof o=='object'?o:{};e.initCustomEvent(t,!!o.bubbles,!!o.cancelable,o.detail);return e}:W.CustomEvent||function(t,o){var e=new Event(t,o);e.detail=(o&&typeof o=='object'?o:{}).detail;return e});
	fp(W,'WeakMap',function(){var s={},i=0,t=this.prototype;t.set=function(k,v){s[k._weakMapID=i++]=v};t.get=function(k){return s[k._weakMapID]};t.has=function(k){return k._id in s};t.delete=function(k){delete s[k._weakMapID]}});

	fp(Number,'isNaN',function(v){/* source: mozilla */return v!==v});

	fp(O,'assign',function(o){var a=arguments,i=a.length,k,v;o=Object(o);while(--i>=1)for(k in a[i])if(Object.prototype.hasOwnProperty.call(v=a[i][k],k))o[k]=v;return o});
	fp(O,'create',function(p,_){function fn(){}fn.prototype=p;return new fn()});
	fp(O,'keys',function(o){var r=[],k,v;for(k in o)v=o[k]&&Object.prototype.hasOwnProperty.call(o,k)&&r.push(k);return r});
	fp(O,'values',function(o){var r=[],k,v;for(k in o)v=o[k]&&Object.prototype.hasOwnProperty.call(o,k)&&r.push(v);return r});
	fp(A,'isArray',function(a){return Object.prototype.toString.call(a)==='[object Array]'});
	fp(A,'from',function(a,fn,t){var s=this,l=Object(a),f=l.length>>>0,r=typeof s=='function'?O(new s(f)):new Array(f),i=-1;while(++i<f)r[i]=fn?fn.call(t,l[i],i):l[i];r.length=f;return r});

	fp(fy(S),'trim',function(){/* source: mozilla */return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,'')});
	fp(fy(A),'filter',function(fn){var t=this,i=0,f=t.length>>>0,r=[],v;for(;i<f;i++)fn((v=t[i]),i,t)&&r.push(v);return r});
	fp(fy(A),'indexOf',function(k,i){var t=this,f=t.length>>>0;i=i<<0;for(i+=i<0?f:0;i<f;i++)if(t[i]===k)return i;return -1});
	fp(fy(A),'forEach',function(fn,t){var s=Object(this),n=s.length,i;for(i=0;i<n;i++)fn.call(t,s[i],i,s);});
	fp(fy(A),'map',function(fn,t){var s=Object(this),n=s.length,r=[],i;for(i=0;i<n;i++)r.push(fn.call(t,s[i],i,s));return r});
	fp(fy(A),'some',function(fn,t){var s=Object(this),f=s.length>>>0,k;for(k=0;k<f;k++){if(fn.call(t,s[k],k,s))return !0}return !1});
	fp(fy(A),'find',function(fn,t){var s=Object(this),f=s.length>>>0,k,v;for(k=0;k<f;k++){if(fn.call(t,v=s[k],k,s))return v}return void 0});
	fp(fy(F),'bind',function(t){var a=Array.prototype.slice.call(arguments,1),b=this,fa=function(){},fb=function(){return b.apply(this instanceof fa?this:t,a.concat(Array.prototype.slice.call(arguments)))};fa.prototype=this.prototype;fb.prototype=new fa();return fb});
	fp(fy(V),'preventDefault',function(){this.cancelable&&(this.returnValue=!1)});
	fp(fy(V),'stopPropagation',function(){this.cancelBubble=!0});
	fp(fy(V),'stopImmediatePropagation',function(){this.cancelBubble=this.cancelImmediate=!0});
	fp(L,'origin',function(){return this.protocol+'//'+this.host});
	fp(L,'toString',function(){return this.href});

	if (!fy(E)['addEventListener']) fl(fy(Window)), fl(fy(E)), fl(fy(HTMLDocument)), fd(fy(Window)), fd(fy(E)), fd(fy(HTMLDocument));

	ff((function(fs){return{previousElementSibling:function(){return fs(this,'previous')},nextElementSibling:function(){return fs(this,'next')}}})(function fs(e,k){while((e=e[k+'Sibling'])&&e.nodeType!=1);return e}),function(k,v){(v in D.documentElement)||fg(fy(E),k,v)});

	!function(g){var fs=function(t){return fy(A).join.call(t,' ')},fi=function(t,s){return(' '+fs(t)+' ').indexOf(' '+s+' ')},fv=function(s){if(!(s=s+'')||/\s/.test(s))throw Error('"'+s+'" is invalid');return s},ft=function(s,f){var t=this;return t.contains(s)?(f===!1&&t.remove(s),!1):(f===!0&&t.add(s),!0)},fe=function(){return fy(A).filter.call(this,function(v,k){return !isNaN(k)})},fc=function(s){return !/\s/.test(s)&&fi(this,s)>=0},fr=function(a,b){var t=this;if(!b)throw TypeError('Not enough arguments');return t.contains(a=fv(a))&&(b=fv(b))&&(t.remove(a),t.add(b),!0)},fh=function(f,s){var t=this;ff(fe.call(t),function(k,v){f.call(s,v,+k,t)})},fk=function(){return O.keys(fe.call(this))},fT=function(e){var t=this;t.value=(e.getAttribute('class')||'').trim();t.length=t.value?fy(A).push.apply(t,t.value.split(/\s+/)):0;t.element=e;fy(fT).toString=function(){return fs(this)};fy(fT)._values=fy(fT)._entries=fe;fy(fT)._keys=fk},_=D.createElementNS('http://www.w3.org/2000/svg','g'),p='classList';fp(W,g,fT);(p in _)||fg(fy(E),p,function(){return new W[g](this)});fp(fy(fT),'add',function(){var t=this,a=arguments,i,s;for(i=0;i<a.length;i++)t.contains(s=fv(a[i]))||(fy(A).push.call(t,s),t.element.setAttribute('class',fs(t)))});fp(fy(fT),'remove',function(){var t=this,a=arguments,i=a.length,s;while(--i>=0)if(t.contains(s=fv(a[i]))){fh.call(t,function(v,k){v===s&&fy(A).splice.call(t,k,1)});t.element.setAttribute('class',fs(t))}});fp(fy(fT),'item',function(i){return this[i]||null});fp(fy(fT),'contains',fc);fp(fy(fT),'replace',fr);fp(fy(fT),'toggle',ft);fp(fy(fT),'forEach',fh);_[p].add('a','b');_[p].contains('b')||(fy(W[g]).contains=fc);_[p].toggle('c',!1)||(fy(W[g]).toggle=ft);_=null}
	('DOMTokenList');
	fp(fy(E),'matches',fy(E).matchesSelector||fv(fy(E),'MatchesSelector')||function(s){var t=this,m=(t.document||t.ownerDocument).querySelectorAll(s);while(--i>=0&&m[i]!==t);return i>-1});
	/* based on: https://gist.github.com/paulirish/1579671 */fp(W,'requestAnimationFrame',fv(W,'RequestAnimationFrame')||(function(l){return function(fn){var n=+new Date,c=Math.max(0,16-n-l),i=W.setTimeout(function(){fn(n+c)},c);l=n+c;return i}})(0));fp(W,'cancelAnimationFrame',fv(W,'CancelAnimationFrame')||fv(W,'CancelRequestAnimationFrame')||function(i){clearTimeout(i)});

})(typeof window!='undefined'&&window);
