var app=function(){"use strict";function e(){}function t(e){return e()}function i(){return Object.create(null)}function a(e){e.forEach(t)}function d(e){return"function"==typeof e}function o(e,t){return e!=e?t==t:e!==t||e&&"object"==typeof e||"function"==typeof e}let n,l=!1;function s(e,t,i,a){for(;e<t;){const d=e+(t-e>>1);i(d)<=a?e=d+1:t=d}return e}function m(e,t){l?(!function(e){if(e.hydrate_init)return;e.hydrate_init=!0;const t=e.childNodes,i=new Int32Array(t.length+1),a=new Int32Array(t.length);i[0]=-1;let d=0;for(let e=0;e<t.length;e++){const o=s(1,d+1,(e=>t[i[e]].claim_order),t[e].claim_order)-1;a[e]=i[o]+1;const n=o+1;i[n]=e,d=Math.max(n,d)}const o=[],n=[];let l=t.length-1;for(let e=i[d]+1;0!=e;e=a[e-1]){for(o.push(t[e-1]);l>=e;l--)n.push(t[l]);l--}for(;l>=0;l--)n.push(t[l]);o.reverse(),n.sort(((e,t)=>e.claim_order-t.claim_order));for(let t=0,i=0;t<n.length;t++){for(;i<o.length&&n[t].claim_order>=o[i].claim_order;)i++;const a=i<o.length?o[i]:null;e.insertBefore(n[t],a)}}(e),(void 0===e.actual_end_child||null!==e.actual_end_child&&e.actual_end_child.parentElement!==e)&&(e.actual_end_child=e.firstChild),t!==e.actual_end_child?e.insertBefore(t,e.actual_end_child):e.actual_end_child=t.nextSibling):t.parentNode!==e&&e.appendChild(t)}function r(e,t,i){l&&!i?m(e,t):(t.parentNode!==e||i&&t.nextSibling!==i)&&e.insertBefore(t,i||null)}function u(e){e.parentNode.removeChild(e)}function c(e,t){for(let i=0;i<e.length;i+=1)e[i]&&e[i].d(t)}function p(e){return document.createElement(e)}function g(e){return document.createTextNode(e)}function f(){return g(" ")}function b(){return g("")}function h(e,t,i){null==i?e.removeAttribute(t):e.getAttribute(t)!==i&&e.setAttribute(t,i)}function w(e,t){t=""+t,e.wholeText!==t&&(e.data=t)}function D(e){n=e}const $=[],y=[],v=[],_=[],T=Promise.resolve();let A=!1;function k(e){v.push(e)}let x=!1;const S=new Set;function M(){if(!x){x=!0;do{for(let e=0;e<$.length;e+=1){const t=$[e];D(t),B(t.$$)}for(D(null),$.length=0;y.length;)y.pop()();for(let e=0;e<v.length;e+=1){const t=v[e];S.has(t)||(S.add(t),t())}v.length=0}while($.length);for(;_.length;)_.pop()();A=!1,x=!1,S.clear()}}function B(e){if(null!==e.fragment){e.update(),a(e.before_update);const t=e.dirty;e.dirty=[-1],e.fragment&&e.fragment.p(e.ctx,t),e.after_update.forEach(k)}}const E=new Set;let C;function P(){C={r:0,c:[],p:C}}function L(){C.r||a(C.c),C=C.p}function N(e,t){e&&e.i&&(E.delete(e),e.i(t))}function O(e,t,i,a){if(e&&e.o){if(E.has(e))return;E.add(e),C.c.push((()=>{E.delete(e),a&&(i&&e.d(1),a())})),e.o(t)}}function H(e){e&&e.c()}function F(e,i,o,n){const{fragment:l,on_mount:s,on_destroy:m,after_update:r}=e.$$;l&&l.m(i,o),n||k((()=>{const i=s.map(t).filter(d);m?m.push(...i):a(i),e.$$.on_mount=[]})),r.forEach(k)}function R(e,t){const i=e.$$;null!==i.fragment&&(a(i.on_destroy),i.fragment&&i.fragment.d(t),i.on_destroy=i.fragment=null,i.ctx=[])}function G(e,t){-1===e.$$.dirty[0]&&($.push(e),A||(A=!0,T.then(M)),e.$$.dirty.fill(0)),e.$$.dirty[t/31|0]|=1<<t%31}function I(t,d,o,s,m,r,c=[-1]){const p=n;D(t);const g=t.$$={fragment:null,ctx:null,props:r,update:e,not_equal:m,bound:i(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(p?p.$$.context:d.context||[]),callbacks:i(),dirty:c,skip_bound:!1};let f=!1;if(g.ctx=o?o(t,d.props||{},((e,i,...a)=>{const d=a.length?a[0]:i;return g.ctx&&m(g.ctx[e],g.ctx[e]=d)&&(!g.skip_bound&&g.bound[e]&&g.bound[e](d),f&&G(t,e)),i})):[],g.update(),f=!0,a(g.before_update),g.fragment=!!s&&s(g.ctx),d.target){if(d.hydrate){l=!0;const e=function(e){return Array.from(e.childNodes)}(d.target);g.fragment&&g.fragment.l(e),e.forEach(u)}else g.fragment&&g.fragment.c();d.intro&&N(t.$$.fragment),F(t,d.target,d.anchor,d.customElement),l=!1,M()}D(p)}class W{$destroy(){R(this,1),this.$destroy=e}$on(e,t){const i=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return i.push(t),()=>{const e=i.indexOf(t);-1!==e&&i.splice(e,1)}}$set(e){var t;this.$$set&&(t=e,0!==Object.keys(t).length)&&(this.$$.skip_bound=!0,this.$$set(e),this.$$.skip_bound=!1)}}let j=[{audio:"https://traffic.libsyn.com/mission250/M250Ep51DrStrangelove.mp3",date:new Date("2022/05/16"),episode:51,image:"blob:https://five.libsyn.com/68e1e5f1-cff3-465f-9bfe-8996aeb6b069",imdb:"https://www.imdb.com/title/tt0057012/",title:"Dr. Strangelove or: How I Learned to Stop Worrying and Love the Bomb"},{audio:"",date:new Date("2022/05/08"),episode:0,image:"",imdb:"",title:"The Worst Person in the World"},{audio:"",date:new Date("2022/04/24"),episode:0,image:"",imdb:"",title:"Licorice Pizza"},{audio:"",date:new Date("2022/03/27"),episode:64,image:"",imdb:"",title:"Aliens"},{audio:"",date:new Date("2022/03/21"),episode:53,image:"",imdb:"",title:"Alien"},{audio:"",date:new Date("2022/03/21"),episode:54,image:"",imdb:"",title:"The Great Dictator"},{audio:"",date:new Date("2022/03/13"),episode:0,image:"",imdb:"",title:"Drive My Car"},{audio:"",date:new Date("2022/03/06"),episode:0,image:"",imdb:"",title:"Flee"},{audio:"",date:new Date("2022/02/27"),episode:0,image:"",imdb:"",title:"Lunana: A Yak in the Classroom"},{audio:"",date:new Date("2022/02/21"),episode:0,image:"",imdb:"",title:"The Hand of God"},{audio:"",date:new Date("2022/02/12"),episode:0,image:"",imdb:"",title:"Nightmare Alley"},{audio:"",date:new Date("2022/02/06"),episode:0,image:"",imdb:"",title:"A Hero"},{audio:"",date:new Date("2022/01/31"),episode:0,image:"",imdb:"",title:"Titane"},{audio:"",date:new Date("2022/01/23"),episode:0,image:"",imdb:"",title:"The Tragedy of Macbeth"},{audio:"",date:new Date("2022/01/16"),episode:0,image:"",imdb:"",title:"The Power of the Dog"},{audio:"",date:new Date("2022/01/09"),episode:0,image:"",imdb:"",title:"Shang-Chi and the Legend of the Ten Rings"},{audio:"",date:new Date("2022/01/09"),episode:0,image:"",imdb:"",title:"CODA"},{audio:"",date:new Date("2022/01/09"),episode:0,image:"",imdb:"",title:"The Matrix: Resurrections"},{audio:"",date:new Date("2021/11/28"),episode:0,image:"",imdb:"",title:"No Time To Die"},{audio:"",date:new Date("2021/11/21"),episode:55,image:"",imdb:"",title:"The Lives of Others"},{audio:"",date:new Date("2021/11/14"),episode:0,image:"",imdb:"",title:"Pig"},{audio:"",date:new Date("2021/11/07"),episode:56,image:"",imdb:"",title:"Cinema Paridiso"},{audio:"",date:new Date("2021/10/29"),episode:0,image:"",imdb:"",title:"Dune"},{audio:"",date:new Date("2021/10/25"),episode:0,image:"",imdb:"",title:"The Babadook"},{audio:"",date:new Date("2021/10/17"),episode:0,image:"",imdb:"",title:"Evil Dead 2"},{audio:"",date:new Date("2021/10/10"),episode:0,image:"",imdb:"",title:"Battle Royale"},{audio:"",date:new Date("2021/10/04"),episode:57,image:"",imdb:"",title:"Paths of Glory"},{audio:"",date:new Date("2021/09/19"),episode:0,image:"",imdb:"",title:"The Hateful Eight"},{audio:"",date:new Date("2021/09/19"),episode:58,image:"",imdb:"",title:"Django Unchained"},{audio:"",date:new Date("2021/09/12"),episode:0,image:"",imdb:"",title:"The Green Knight"},{audio:"",date:new Date("2021/08/22"),episode:59,image:"",imdb:"",title:"The Shining"},{audio:"",date:new Date("2021/08/15"),episode:0,image:"",imdb:"",title:"Mandibles"},{audio:"",date:new Date("2021/08/09"),episode:60,image:"",imdb:"",title:"Grave of the Fireflies"},{audio:"",date:new Date("2021/08/01"),episode:0,image:"",imdb:"",title:"The Eight Hundred"},{audio:"",date:new Date("2021/07/26"),episode:61,image:"",imdb:"",title:"WALL-E"},{audio:"",date:new Date("2021/07/18"),episode:0,image:"",imdb:"",title:"Arrival"},{audio:"",date:new Date("2021/07/13"),episode:63,image:"",imdb:"",title:"American Beauty"},{audio:"",date:new Date("2021/07/06"),episode:0,image:"",imdb:"",title:"Like Stars On Earth"},{audio:"",date:new Date("2021/06/21"),episode:65,image:"",imdb:"",title:"Princess Mononoke"},{audio:"",date:new Date("2021/06/13"),episode:0,image:"",imdb:"",title:"The World's End"},{audio:"",date:new Date("2021/06/06"),episode:66,image:"",imdb:"",title:"Oldboy"},{audio:"",date:new Date("2021/06/01"),episode:0,image:"",imdb:"",title:"Hot Fuzz"},{audio:"",date:new Date("2021/05/16"),episode:67,image:"",imdb:"",title:"Citizen Kane"},{audio:"",date:new Date("2021/05/10"),episode:0,image:"",imdb:"",title:"Shaun of the Dead"},{audio:"",date:new Date("2021/04/25"),episode:68,image:"",imdb:"",title:"Once Upon A Time in America"},{audio:"",date:new Date("2021/04/18"),episode:0,image:"",imdb:"",title:"Quo Vadis, Aida?"},{audio:"",date:new Date("2021/04/11"),episode:69,image:"",imdb:"",title:"North By Northwest"},{audio:"",date:new Date("2021/04/04"),episode:0,image:"",imdb:"",title:"Minari"},{audio:"",date:new Date("2021/03/21"),episode:70,image:"",imdb:"",title:"Das Boot"},{audio:"",date:new Date("2021/03/14"),episode:0,image:"",imdb:"",title:"Nomadland"},{audio:"",date:new Date("2021/03/07"),episode:71,image:"",imdb:"",title:"Vertigo"},{audio:"",date:new Date("2021/02/28"),episode:0,image:"",imdb:"",title:"Brazil"},{audio:"",date:new Date("2021/02/21"),episode:72,image:"",imdb:"",title:"Witness for the Prosecution"},{audio:"",date:new Date("2021/02/14"),episode:0,image:"",imdb:"",title:"Akira"},{audio:"",date:new Date("2021/01/24"),episode:73,image:"",imdb:"",title:"Star Wars: Return of the Jedi"},{audio:"",date:new Date("2020/10/20"),episode:0,image:"",imdb:"",title:"Hotel Mumbai"},{audio:"",date:new Date("2020/10/13"),episode:74,image:"",imdb:"",title:"M"},{audio:"",date:new Date("2020/10/07"),episode:0,image:"",imdb:"",title:"Moana"},{audio:"",date:new Date("2020/08/30"),episode:75,image:"",imdb:"",title:"Reservoir Dogs"},{audio:"",date:new Date("2020/08/23"),episode:0,image:"",imdb:"",title:"Portrait of a Lady on Fire"},{audio:"",date:new Date("2020/08/09"),episode:76,image:"",imdb:"",title:"Bravefart"},{audio:"",date:new Date("2020/08/03"),episode:0,image:"",imdb:"",title:"1917"},{audio:"",date:new Date("2020/07/26"),episode:77,image:"",imdb:"",title:"Amelie"},{audio:"",date:new Date("2020/07/19"),episode:0,image:"",imdb:"",title:"Knives Out"},{audio:"",date:new Date("2020/07/12"),episode:78,image:"",imdb:"",title:"Requiem For A Dream"},{audio:"",date:new Date("2020/07/05"),episode:0,image:"",imdb:"",title:"Hamilton"},{audio:"",date:new Date("2020/06/28"),episode:0,image:"",imdb:"",title:"Your Name."},{audio:"",date:new Date("2020/06/14"),episode:79,image:"",imdb:"",title:"A Clockwork Orange"},{audio:"",date:new Date("2020/06/07"),episode:0,image:"",imdb:"",title:"PK"},{audio:"",date:new Date("2020/05/31"),episode:80,image:"",imdb:"",title:"Taxi Driver"},{audio:"",date:new Date("2020/05/24"),episode:0,image:"",imdb:"",title:"Uncut Gems"},{audio:"",date:new Date("2020/05/17"),episode:0,image:"",imdb:"",title:"Andhadhun"},{audio:"",date:new Date("2020/05/10"),episode:81,image:"",imdb:"",title:"Double Indemnity"},{audio:"",date:new Date("2020/05/03"),episode:82,image:"",imdb:"",title:"Toy Story 3"},{audio:"",date:new Date("2020/04/26"),episode:83,image:"",imdb:"",title:"Larry of Arabia"},{audio:"",date:new Date("2020/04/19"),episode:84,image:"",imdb:"",title:"To Kill a Mockingbird"},{audio:"",date:new Date("2020/04/12"),episode:85,image:"",imdb:"",title:"Eternal Sunshine of the Spotless Mind"},{audio:"",date:new Date("2020/04/5"),episode:86,image:"",imdb:"",title:"Amadeus"},{audio:"",date:new Date("2020/03/29"),episode:87,image:"",imdb:"",title:"Full Metal Jacket"},{audio:"",date:new Date("2020/03/22"),episode:88,image:"",imdb:"",title:"The Sting"},{audio:"",date:new Date("2020/03/01"),episode:89,image:"",imdb:"",title:"2001: A Space Odyssey"},{audio:"",date:new Date("2020/03/08"),episode:90,image:"",imdb:"",title:"Bicycle Thieves"},{audio:"",date:new Date("2020/02/16"),episode:91,image:"",imdb:"",title:"Singin' in the Rain"},{audio:"",date:new Date("2020/02/09"),episode:0,image:"",imdb:"",title:"Parasite"},{audio:"",date:new Date("2020/02/03"),episode:92,image:"",imdb:"",title:"Toy Story"},{audio:"",date:new Date("2020/01/27"),episode:93,image:"",imdb:"",title:"Snatch"},{audio:"",date:new Date("2020/01/19"),episode:94,image:"",imdb:"",title:"Inglourious Basterds"},{audio:"",date:new Date("2020/01/12"),episode:95,image:"",imdb:"",title:"Mony Python and The Holy Grail"},{audio:"",date:new Date("2020/01/06"),episode:96,image:"",imdb:"",title:"The Kid"},{audio:"",date:new Date("2019/12/30"),episode:97,image:"",imdb:"",title:"LA Confidential"},{audio:"",date:new Date("2019/12/18"),episode:98,image:"",imdb:"",title:"For a Few Dollars More"},{audio:"",date:new Date("2019/12/09"),episode:0,image:"",imdb:"",title:"The Irishman"},{audio:"",date:new Date("2019/12/01"),episode:99,image:"",imdb:"",title:"Rashomon"},{audio:"",date:new Date("2019/11/24"),episode:100,image:"",imdb:"",title:"The Apartment"}];function z(e){let t,i=`${e[0].title}`;return{c(){t=g(i)},m(e,i){r(e,t,i)},p(e,a){1&a&&i!==(i=`${e[0].title}`)&&w(t,i)},d(e){e&&u(t)}}}function K(e){let t,i=`${e[0].episode}: ${e[0].title}`;return{c(){t=g(i)},m(e,i){r(e,t,i)},p(e,a){1&a&&i!==(i=`${e[0].episode}: ${e[0].title}`)&&w(t,i)},d(e){e&&u(t)}}}function U(t){let i,a,d;function o(e,t){return e[0].episode>0?K:z}let n=o(t),l=n(t);return{c(){i=p("div"),a=f(),d=p("div"),l.c(),h(i,"class","content svelte-1jmmw8h"),h(d,"class","pc-title svelte-1jmmw8h")},m(e,t){r(e,i,t),r(e,a,t),r(e,d,t),l.m(d,null)},p(e,[t]){n===(n=o(e))&&l?l.p(e,t):(l.d(1),l=n(e),l&&(l.c(),l.m(d,null)))},i:e,o:e,d(e){e&&u(i),e&&u(a),e&&u(d),l.d()}}}function q(e,t,i){let{podcast:a}=t;return e.$$set=e=>{"podcast"in e&&i(0,a=e.podcast)},[a]}class J extends W{constructor(e){super(),I(this,e,q,U,o,{podcast:0})}}function V(e,t,i){const a=e.slice();return a[0]=t[i],a}function Y(e,t,i){const a=e.slice();return a[0]=t[i],a}function Q(t){let i,a,d=0===t[0].episode&&function(t){let i,a;return i=new J({props:{podcast:t[0]}}),{c(){H(i.$$.fragment)},m(e,t){F(i,e,t),a=!0},p:e,i(e){a||(N(i.$$.fragment,e),a=!0)},o(e){O(i.$$.fragment,e),a=!1},d(e){R(i,e)}}}(t);return{c(){d&&d.c(),i=b()},m(e,t){d&&d.m(e,t),r(e,i,t),a=!0},p(e,t){0===e[0].episode&&d.p(e,t)},i(e){a||(N(d),a=!0)},o(e){O(d),a=!1},d(e){d&&d.d(e),e&&u(i)}}}function X(t){let i,a,d=t[0].episode>0&&function(t){let i,a;return i=new J({props:{podcast:t[0]}}),{c(){H(i.$$.fragment)},m(e,t){F(i,e,t),a=!0},p:e,i(e){a||(N(i.$$.fragment,e),a=!0)},o(e){O(i.$$.fragment,e),a=!1},d(e){R(i,e)}}}(t);return{c(){d&&d.c(),i=b()},m(e,t){d&&d.m(e,t),r(e,i,t),a=!0},p(e,t){e[0].episode>0&&d.p(e,t)},i(e){a||(N(d),a=!0)},o(e){O(d),a=!1},d(e){d&&d.d(e),e&&u(i)}}}function Z(e){let t,i,a,d,o,n,l,s,g,b,w,D,$=j,y=[];for(let t=0;t<$.length;t+=1)y[t]=Q(Y(e,$,t));const v=e=>O(y[e],1,1,(()=>{y[e]=null}));let _=j,T=[];for(let t=0;t<_.length;t+=1)T[t]=X(V(e,_,t));const A=e=>O(T[e],1,1,(()=>{T[e]=null}));return{c(){t=p("div"),i=p("div"),i.textContent="Here's the movies we also watched while we were attempting to watch\n\t\timdb's top 50-100 movies.",a=f(),d=p("div"),o=p("div"),n=p("div"),n.textContent="Bonus films",l=f();for(let e=0;e<y.length;e+=1)y[e].c();s=f(),g=p("div"),b=p("div"),b.textContent="Imdb listed",w=f();for(let e=0;e<T.length;e+=1)T[e].c();h(i,"class","main-title svelte-k0v8b0"),h(n,"class","podcast-category svelte-k0v8b0"),h(o,"class","bonus-films svelte-k0v8b0"),h(b,"class","podcast-category svelte-k0v8b0"),h(g,"class","imdb-films svelte-k0v8b0"),h(d,"class","podcasts svelte-k0v8b0"),h(t,"class","last-50-content svelte-k0v8b0")},m(e,u){r(e,t,u),m(t,i),m(t,a),m(t,d),m(d,o),m(o,n),m(o,l);for(let e=0;e<y.length;e+=1)y[e].m(o,null);m(d,s),m(d,g),m(g,b),m(g,w);for(let e=0;e<T.length;e+=1)T[e].m(g,null);D=!0},p(e,[t]){if(0&t){let i;for($=j,i=0;i<$.length;i+=1){const a=Y(e,$,i);y[i]?(y[i].p(a,t),N(y[i],1)):(y[i]=Q(a),y[i].c(),N(y[i],1),y[i].m(o,null))}for(P(),i=$.length;i<y.length;i+=1)v(i);L()}if(0&t){let i;for(_=j,i=0;i<_.length;i+=1){const a=V(e,_,i);T[i]?(T[i].p(a,t),N(T[i],1)):(T[i]=X(a),T[i].c(),N(T[i],1),T[i].m(g,null))}for(P(),i=_.length;i<T.length;i+=1)A(i);L()}},i(e){if(!D){for(let e=0;e<$.length;e+=1)N(y[e]);for(let e=0;e<_.length;e+=1)N(T[e]);D=!0}},o(e){y=y.filter(Boolean);for(let e=0;e<y.length;e+=1)O(y[e]);T=T.filter(Boolean);for(let e=0;e<T.length;e+=1)O(T[e]);D=!1},d(e){e&&u(t),c(y,e),c(T,e)}}}return new class extends W{constructor(e){super(),I(this,e,null,Z,o,{})}}({target:document.body,props:{}})}();
//# sourceMappingURL=bundle.js.map
