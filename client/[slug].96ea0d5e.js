import{S as t,i as s,s as e,a,e as r,t as c,q as o,f as n,g as i,c as l,b as h,d as u,h as j,j as p,k as f,l as d,n as m}from"./client.c5eb36a7.js";function v(t){let s,e,v,x,E,g,k,H=t[0].title+"",b=t[0].html+"";return document.title=s="Jake - Projects - "+t[0].title,{c(){e=a(),v=r("div"),x=r("h3"),E=c(H),g=a(),k=r("div"),this.h()},l(t){o('[data-svelte="svelte-3eejej"]',document.head).forEach(n),e=i(t),v=l(t,"DIV",{class:!0});var s=h(v);x=l(s,"H3",{});var a=h(x);E=u(a,H),a.forEach(n),g=i(s),k=l(s,"DIV",{class:!0}),h(k).forEach(n),s.forEach(n),this.h()},h(){j(k,"class","content svelte-1x3xiap"),j(v,"class","mainContainer")},m(t,s){p(t,e,s),p(t,v,s),f(v,x),f(x,E),f(v,g),f(v,k),k.innerHTML=b},p(t,[e]){1&e&&s!==(s="Jake - Projects - "+t[0].title)&&(document.title=s),1&e&&H!==(H=t[0].title+"")&&d(E,H),1&e&&b!==(b=t[0].html+"")&&(k.innerHTML=b)},i:m,o:m,d(t){t&&n(e),t&&n(v)}}}async function x({params:t,query:s}){const e=await this.fetch(`projects/${t.slug}.json`),a=await e.json();if(200===e.status)return{project:a};this.error(e.status,a.message)}function E(t,s,e){let{project:a}=s;return t.$set=t=>{"project"in t&&e(0,a=t.project)},[a]}export default class extends t{constructor(t){super(),s(this,t,E,v,e,{project:0})}}export{x as preload};