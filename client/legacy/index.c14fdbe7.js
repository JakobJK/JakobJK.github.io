import{_ as t,a as n,b as r,c as e,i as a,s,d as c,S as o,e as i,f as u,t as l,g as f,h,k as v,l as p,j as d,m as g,x as m,n as j,o as b,p as y,r as E,u as k,v as D,w as I}from"./client.36683c8d.js";function R(t){var e=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(t){return!1}}();return function(){var a,s=n(t);if(e){var c=n(this).constructor;a=Reflect.construct(s,arguments,c)}else a=s.apply(this,arguments);return r(this,a)}}function x(t,n,r){var e=t.slice();return e[1]=n[r],e}function V(t){var n,r,e,a,s,c,o,E,k,D,I,R=t[1].title+"",x=t[1].paragraph+"";return{c:function(){n=i("a"),r=i("div"),e=i("div"),a=u(),s=i("h3"),c=l(R),o=u(),E=i("p"),k=l(x),D=u(),this.h()},l:function(t){n=f(t,"A",{rel:!0,href:!0,class:!0});var i=h(n);r=f(i,"DIV",{class:!0});var u=h(r);e=f(u,"DIV",{class:!0,style:!0}),h(e).forEach(v),a=p(u),s=f(u,"H3",{class:!0});var l=h(s);c=d(l,R),l.forEach(v),o=p(u),E=f(u,"P",{class:!0});var g=h(E);k=d(g,x),g.forEach(v),u.forEach(v),D=p(i),i.forEach(v),this.h()},h:function(){g(e,"class","thumbnail svelte-1o59v8n"),m(e,"background-image","url("+t[1].thumbnail+")"),m(e,"background-repeat","no-repeat"),m(e,"background-position","center"),g(s,"class","svelte-1o59v8n"),g(E,"class","svelte-1o59v8n"),g(r,"class","gridItem svelte-1o59v8n"),g(n,"rel","prefetch"),g(n,"href",I="projects/"+t[1].slug),g(n,"class","svelte-1o59v8n")},m:function(t,i){j(t,n,i),b(n,r),b(r,e),b(r,a),b(r,s),b(s,c),b(r,o),b(r,E),b(E,k),b(n,D)},p:function(t,r){1&r&&m(e,"background-image","url("+t[1].thumbnail+")"),1&r&&R!==(R=t[1].title+"")&&y(c,R),1&r&&x!==(x=t[1].paragraph+"")&&y(k,x),1&r&&I!==(I="projects/"+t[1].slug)&&g(n,"href",I)},d:function(t){t&&v(n)}}}function P(t){for(var n,r,e,a=t[0],s=[],c=0;c<a.length;c+=1)s[c]=V(x(t,a,c));return{c:function(){n=u(),r=i("div"),e=i("div");for(var t=0;t<s.length;t+=1)s[t].c();this.h()},l:function(t){E('[data-svelte="svelte-125ut6p"]',document.head).forEach(v),n=p(t),r=f(t,"DIV",{class:!0});var a=h(r);e=f(a,"DIV",{class:!0});for(var c=h(e),o=0;o<s.length;o+=1)s[o].l(c);c.forEach(v),a.forEach(v),this.h()},h:function(){document.title="Jake - Projects",g(e,"class","grid svelte-1o59v8n"),g(r,"class","mainContainer")},m:function(t,a){j(t,n,a),j(t,r,a),b(r,e);for(var c=0;c<s.length;c+=1)s[c].m(e,null)},p:function(t,n){var r=k(n,1)[0];if(1&r){var c;for(a=t[0],c=0;c<a.length;c+=1){var o=x(t,a,c);s[c]?s[c].p(o,r):(s[c]=V(o),s[c].c(),s[c].m(e,null))}for(;c<s.length;c+=1)s[c].d(1);s.length=a.length}},i:D,o:D,d:function(t){t&&v(n),t&&v(r),I(s,t)}}}function S(t){t.params,t.query;return this.fetch("projects.json").then((function(t){return t.json()})).then((function(t){return{projects:t}}))}function q(t,n,r){var e=n.projects;return t.$set=function(t){"projects"in t&&r(0,e=t.projects)},[e]}var w=function(n){t(i,o);var r=R(i);function i(t){var n;return e(this,i),n=r.call(this),a(c(n),t,q,P,s,{projects:0}),n}return i}();export default w;export{S as preload};
