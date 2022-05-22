var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    // Track which nodes are claimed during hydration. Unclaimed nodes can then be removed from the DOM
    // at the end of hydration without touching the remaining nodes.
    let is_hydrating = false;
    function start_hydrating() {
        is_hydrating = true;
    }
    function end_hydrating() {
        is_hydrating = false;
    }
    function upper_bound(low, high, key, value) {
        // Return first index of value larger than input value in the range [low, high)
        while (low < high) {
            const mid = low + ((high - low) >> 1);
            if (key(mid) <= value) {
                low = mid + 1;
            }
            else {
                high = mid;
            }
        }
        return low;
    }
    function init_hydrate(target) {
        if (target.hydrate_init)
            return;
        target.hydrate_init = true;
        // We know that all children have claim_order values since the unclaimed have been detached
        const children = target.childNodes;
        /*
        * Reorder claimed children optimally.
        * We can reorder claimed children optimally by finding the longest subsequence of
        * nodes that are already claimed in order and only moving the rest. The longest
        * subsequence subsequence of nodes that are claimed in order can be found by
        * computing the longest increasing subsequence of .claim_order values.
        *
        * This algorithm is optimal in generating the least amount of reorder operations
        * possible.
        *
        * Proof:
        * We know that, given a set of reordering operations, the nodes that do not move
        * always form an increasing subsequence, since they do not move among each other
        * meaning that they must be already ordered among each other. Thus, the maximal
        * set of nodes that do not move form a longest increasing subsequence.
        */
        // Compute longest increasing subsequence
        // m: subsequence length j => index k of smallest value that ends an increasing subsequence of length j
        const m = new Int32Array(children.length + 1);
        // Predecessor indices + 1
        const p = new Int32Array(children.length);
        m[0] = -1;
        let longest = 0;
        for (let i = 0; i < children.length; i++) {
            const current = children[i].claim_order;
            // Find the largest subsequence length such that it ends in a value less than our current value
            // upper_bound returns first greater value, so we subtract one
            const seqLen = upper_bound(1, longest + 1, idx => children[m[idx]].claim_order, current) - 1;
            p[i] = m[seqLen] + 1;
            const newLen = seqLen + 1;
            // We can guarantee that current is the smallest value. Otherwise, we would have generated a longer sequence.
            m[newLen] = i;
            longest = Math.max(newLen, longest);
        }
        // The longest increasing subsequence of nodes (initially reversed)
        const lis = [];
        // The rest of the nodes, nodes that will be moved
        const toMove = [];
        let last = children.length - 1;
        for (let cur = m[longest] + 1; cur != 0; cur = p[cur - 1]) {
            lis.push(children[cur - 1]);
            for (; last >= cur; last--) {
                toMove.push(children[last]);
            }
            last--;
        }
        for (; last >= 0; last--) {
            toMove.push(children[last]);
        }
        lis.reverse();
        // We sort the nodes being moved to guarantee that their insertion order matches the claim order
        toMove.sort((a, b) => a.claim_order - b.claim_order);
        // Finally, we move the nodes
        for (let i = 0, j = 0; i < toMove.length; i++) {
            while (j < lis.length && toMove[i].claim_order >= lis[j].claim_order) {
                j++;
            }
            const anchor = j < lis.length ? lis[j] : null;
            target.insertBefore(toMove[i], anchor);
        }
    }
    function append(target, node) {
        if (is_hydrating) {
            init_hydrate(target);
            if ((target.actual_end_child === undefined) || ((target.actual_end_child !== null) && (target.actual_end_child.parentElement !== target))) {
                target.actual_end_child = target.firstChild;
            }
            if (node !== target.actual_end_child) {
                target.insertBefore(node, target.actual_end_child);
            }
            else {
                target.actual_end_child = node.nextSibling;
            }
        }
        else if (node.parentNode !== target) {
            target.appendChild(node);
        }
    }
    function insert(target, node, anchor) {
        if (is_hydrating && !anchor) {
            append(target, node);
        }
        else if (node.parentNode !== target || (anchor && node.nextSibling !== anchor)) {
            target.insertBefore(node, anchor || null);
        }
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                start_hydrating();
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            end_hydrating();
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.3' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    let podcasts = [
        {
            audio: "https://traffic.libsyn.com/mission250/M250Ep51DrStrangelove.mp3",
            date: new Date("2022/05/16"),
            episode: 51,
            image: "blob:https://five.libsyn.com/68e1e5f1-cff3-465f-9bfe-8996aeb6b069",
            imdb: "https://www.imdb.com/title/tt0057012/",
            title: "Dr. Strangelove or: How I Learned to Stop Worrying and Love the Bomb"
        },
        {
            audio: "",
            date: new Date("2022/05/08"),
            episode: 0,
            image: "",
            imdb: "",
            title: "The Worst Person in the World"
        }, {
            audio: "",
            date: new Date("2022/04/24"),
            episode: 1,
            image: "",
            imdb: "",
            title: "Licorice Pizza"
        }, {
            audio: "",
            date: new Date("2022/03/27"),
            episode: 64,
            image: "",
            imdb: "",
            title: "Aliens"
        }, {
            audio: "",
            date: new Date("2022/03/21"),
            episode: 53,
            image: "",
            imdb: "",
            title: "Alien"
        }, {
            audio: "",
            date: new Date("2022/03/21"),
            episode: 45,
            image: "",
            imdb: "",
            title: "The Great Dictator"
        }, {
            audio: "",
            date: new Date("2022/03/13"),
            episode: 0,
            image: "",
            imdb: "",
            title: "Drive My Car"
        }, {
            audio: "",
            date: new Date("2022/03/06"),
            episode: 0,
            image: "",
            imdb: "",
            title: "Flee"
        }, {
            audio: "",
            date: new Date("2022/02/27"),
            episode: 0,
            image: "",
            imdb: "",
            title: "Lunana: A Yak in the Classroom"
        }, {
            audio: "",
            date: new Date("2022/02/21"),
            episode: 0,
            image: "",
            imdb: "",
            title: "The Hand of God"
        }, {
            audio: "",
            date: new Date("2022/02/12"),
            episode: 0,
            image: "",
            imdb: "",
            title: "Nightmare Alley"
        }, {
            audio: "",
            date: new Date("2022/02/06"),
            episode: 0,
            image: "",
            imdb: "",
            title: "A Hero"
        }, {
            audio: "",
            date: new Date("2022/01/31"),
            episode: 0,
            image: "",
            imdb: "",
            title: "Titane"
        }, {
            audio: "",
            date: new Date("2022/01/23"),
            episode: 0,
            image: "",
            imdb: "",
            title: "The Tragedy of Macbeth"
        }, {
            audio: "",
            date: new Date("2022/01/16"),
            episode: 0,
            image: "",
            imdb: "",
            title: "The Power of the Dog"
        }, {
            audio: "",
            date: new Date("2022/01/09"),
            episode: 0,
            image: "",
            imdb: "",
            title: "Shang-Chi and the Legend of the Ten Rings"
        }, {
            audio: "",
            date: new Date("2022/01/09"),
            episode: 0,
            image: "",
            imdb: "",
            title: "CODA"
        }, {
            audio: "",
            date: new Date("2022/01/09"),
            episode: 0,
            image: "",
            imdb: "",
            title: "The Matrix: Resurrections"
        }, {
            audio: "",
            date: new Date("2021/11/28"),
            episode: 0,
            image: "",
            imdb: "",
            title: "No Time To Die"
        }, {
            audio: "",
            date: new Date("2021/11/21"),
            episode: 55,
            image: "",
            imdb: "",
            title: "The Lives of Others"
        }, {
            audio: "",
            date: new Date("2021/11/14"),
            episode: 0,
            image: "",
            imdb: "",
            title: "Pig"
        }, {
            audio: "",
            date: new Date("2021/11/07"),
            episode: 56,
            image: "",
            imdb: "",
            title: "Cinema Paridiso"
        }, {
            audio: "",
            date: new Date("2021/10/29"),
            episode: 0,
            image: "",
            imdb: "",
            title: "Dune"
        }, {
            audio: "",
            date: new Date("2021/10/25"),
            episode: 0,
            image: "",
            imdb: "",
            title: "The Babadook"
        }, {
            audio: "",
            date: new Date("2021/10/17"),
            episode: 0,
            image: "",
            imdb: "",
            title: "Evil Dead 2"
        }, {
            audio: "",
            date: new Date("2021/10/10"),
            episode: 0,
            image: "",
            imdb: "",
            title: "Battle Royale"
        }, {
            audio: "",
            date: new Date("2021/10/04"),
            episode: 57,
            image: "",
            imdb: "",
            title: "Paths of Glory"
        }, {
            audio: "",
            date: new Date("2021/09/19"),
            episode: 0,
            image: "",
            imdb: "",
            title: "The Hateful Eight"
        }, {
            audio: "",
            date: new Date("2021/09/19"),
            episode: 58,
            image: "",
            imdb: "",
            title: "Django Unchained"
        }, {
            audio: "",
            date: new Date("2021/09/12"),
            episode: 0,
            image: "",
            imdb: "",
            title: "The Green Knight"
        }, {
            audio: "",
            date: new Date("2021/08/22"),
            episode: 59,
            image: "",
            imdb: "",
            title: "The Shining"
        }, {
            audio: "",
            date: new Date("2021/08/15"),
            episode: 0,
            image: "",
            imdb: "",
            title: "Mandibles"
        }, {
            audio: "",
            date: new Date("2021/08/09"),
            episode: 60,
            image: "",
            imdb: "",
            title: "Grave of the Fireflies"
        },
        {
            audio: "",
            date: new Date("2021/08/01"),
            episode: 0,
            image: "",
            imdb: "",
            title: "The Eight Hundred"
        },
        {
            audio: "",
            date: new Date("2021/07/26"),
            episode: 61,
            image: "",
            imdb: "",
            title: "WALL-E"
        },
        {
            audio: "",
            date: new Date("2021/07/18"),
            episode: 0,
            image: "",
            imdb: "",
            title: "Arrival"
        },
        {
            audio: "",
            date: new Date("2021/07/13"),
            episode: 63,
            image: "",
            imdb: "",
            title: "American Beauty"
        },
        {
            audio: "",
            date: new Date("2021/07/06"),
            episode: 0,
            image: "",
            imdb: "",
            title: "Like Stars On Earth"
        },
        {
            audio: "",
            date: new Date("2021/06/21"),
            episode: 65,
            image: "",
            imdb: "",
            title: "Princess Mononoke"
        },
        {
            audio: "",
            date: new Date("2021/06/13"),
            episode: 0,
            image: "",
            imdb: "",
            title: "The World's End"
        },
        {
            audio: "",
            date: new Date("2021/06/06"),
            episode: 66,
            image: "",
            imdb: "",
            title: "Oldboy"
        },
        {
            audio: "",
            date: new Date("2021/06/01"),
            episode: 0,
            image: "",
            imdb: "",
            title: "Hot Fuzz"
        },
        {
            audio: "",
            date: new Date("2021/05/16"),
            episode: 67,
            image: "",
            imdb: "",
            title: "Citizen Kane"
        },
        {
            audio: "",
            date: new Date("2021/05/10"),
            episode: 0,
            image: "",
            imdb: "",
            title: "Shaun of the Dead"
        },
        {
            audio: "",
            date: new Date("2021/04/25"),
            episode: 68,
            image: "",
            imdb: "",
            title: "Once Upon A Time in America"
        },
        {
            audio: "",
            date: new Date("2021/04/18"),
            episode: 0,
            image: "",
            imdb: "",
            title: "Quo Vadis, Aida?"
        },
        {
            audio: "",
            date: new Date("2021/04/11"),
            episode: 69,
            image: "",
            imdb: "",
            title: "North By Northwest"
        },
        {
            audio: "",
            date: new Date("2021/04/04"),
            episode: 0,
            image: "",
            imdb: "",
            title: "Minari"
        },
        {
            audio: "",
            date: new Date("2021/03/21"),
            episode: 70,
            image: "",
            imdb: "",
            title: "Das Boot"
        },
        {
            audio: "",
            date: new Date("2021/03/14"),
            episode: 0,
            image: "",
            imdb: "",
            title: "Nomadland"
        },
        {
            audio: "",
            date: new Date("2021/03/07"),
            episode: 71,
            image: "",
            imdb: "",
            title: "Vertigo"
        },
        {
            audio: "",
            date: new Date("2021/02/28"),
            episode: 0,
            image: "",
            imdb: "",
            title: "Brazil"
        },
        {
            audio: "",
            date: new Date("2021/02/21"),
            episode: 72,
            image: "",
            imdb: "",
            title: "Witness for the Prosecution"
        },
        {
            audio: "",
            date: new Date("2021/02/14"),
            episode: 0,
            image: "",
            imdb: "",
            title: "Akira"
        },
        {
            audio: "",
            date: new Date("2021/01/24"),
            episode: 73,
            image: "",
            imdb: "",
            title: "Star Wars: Return of the Jedi"
        },
        {
            audio: "",
            date: new Date("2020/10/20"),
            episode: 0,
            image: "",
            imdb: "",
            title: "Hotel Mumbai"
        },
        {
            audio: "",
            date: new Date("2020/10/13"),
            episode: 74,
            image: "",
            imdb: "",
            title: "M"
        },
        {
            audio: "",
            date: new Date("2020/10/07"),
            episode: 0,
            image: "",
            imdb: "",
            title: "Moana"
        }, {
            audio: "",
            date: new Date("2020/08/30"),
            episode: 75,
            image: "",
            imdb: "",
            title: "Reservoir Dogs"
        }, {
            audio: "",
            date: new Date("2020/08/23"),
            episode: 0,
            image: "",
            imdb: "",
            title: "Portrait of a Lady on Fire"
        }, {
            audio: "",
            date: new Date("2020/08/09"),
            episode: 76,
            image: "",
            imdb: "",
            title: "Bravefart"
        }, {
            audio: "",
            date: new Date("2020/08/03"),
            episode: 0,
            image: "",
            imdb: "",
            title: "1917"
        }, {
            audio: "",
            date: new Date("2020/07/26"),
            episode: 77,
            image: "",
            imdb: "",
            title: "Amelie"
        }, {
            audio: "",
            date: new Date("2020/07/19"),
            episode: 0,
            image: "",
            imdb: "",
            title: "Knives Out"
        }, {
            audio: "",
            date: new Date("2020/07/12"),
            episode: 78,
            image: "",
            imdb: "",
            title: "Requiem For A Dream"
        }, {
            audio: "",
            date: new Date("2020/07/05"),
            episode: 0,
            image: "",
            imdb: "",
            title: "Hamilton"
        }, {
            audio: "",
            date: new Date("2020/06/28"),
            episode: 0,
            image: "",
            imdb: "",
            title: "Your Name."
        }, {
            audio: "",
            date: new Date("2020/06/14"),
            episode: 79,
            image: "",
            imdb: "",
            title: "A Clockwork Orange"
        }, {
            audio: "",
            date: new Date("2020/06/07"),
            episode: 0,
            image: "",
            imdb: "",
            title: "PK"
        }, {
            audio: "",
            date: new Date("2020/05/31"),
            episode: 80,
            image: "",
            imdb: "",
            title: "Taxi Driver"
        }, {
            audio: "",
            date: new Date("2020/05/24"),
            episode: 0,
            image: "",
            imdb: "",
            title: "Uncut Gems"
        }, {
            audio: "",
            date: new Date("2020/05/17"),
            episode: 0,
            image: "",
            imdb: "",
            title: "Andhadhun"
        }, {
            audio: "",
            date: new Date("2020/05/10"),
            episode: 0,
            image: "",
            imdb: "",
            title: "Double Indemnity"
        }, {
            audio: "",
            date: new Date("2020/05/03"),
            episode: 82,
            image: "",
            imdb: "",
            title: "Toy Story 3"
        }, {
            audio: "",
            date: new Date("2020/04/26"),
            episode: 83,
            image: "",
            imdb: "",
            title: "Larry of Arabia"
        }, {
            audio: "",
            date: new Date("2020/04/19"),
            episode: 0,
            image: "",
            imdb: "",
            title: "To Kill a Mockingbird"
        }, {
            audio: "",
            date: new Date("2020/04/12"),
            episode: 85,
            image: "",
            imdb: "",
            title: "Eternal Sunshine of the Spotless Mind"
        }, {
            audio: "",
            date: new Date("2020/04/5"),
            episode: 86,
            image: "",
            imdb: "",
            title: "Amadeus"
        }, {
            audio: "",
            date: new Date("2020/03/29"),
            episode: 0,
            image: "",
            imdb: "",
            title: "Full Metal Jacket"
        }, {
            audio: "",
            date: new Date("2020/03/22"),
            episode: 88,
            image: "",
            imdb: "",
            title: "The Sting"
        }, {
            audio: "",
            date: new Date("2020/03/01"),
            episode: 89,
            image: "",
            imdb: "",
            title: "2001: A Space Odyssey"
        }, {
            audio: "",
            date: new Date("2020/03/08"),
            episode: 90,
            image: "",
            imdb: "",
            title: "Bicycle Thieves"
        },
        {
            audio: "",
            date: new Date("2020/02/16"),
            episode: 91,
            image: "",
            imdb: "",
            title: "Singin' in the Rain"
        }, {
            audio: "",
            date: new Date("2020/02/09"),
            episode: 0,
            image: "",
            imdb: "",
            title: "Parasite"
        }, {
            audio: "",
            date: new Date("2020/02/03"),
            episode: 92,
            image: "",
            imdb: "",
            title: "Toy Story"
        }, {
            audio: "",
            date: new Date("2020/01/27"),
            episode: 93,
            image: "",
            imdb: "",
            title: "Snatch"
        }, {
            audio: "",
            date: new Date("2020/01/19"),
            episode: 94,
            image: "",
            imdb: "",
            title: "Inglourious Basterds"
        }, {
            audio: "",
            date: new Date("2020/01/12"),
            episode: 95,
            image: "",
            imdb: "",
            title: "Mony Python and The Holy Grail"
        }, {
            audio: "",
            date: new Date("2020/01/06"),
            episode: 96,
            image: "",
            imdb: "",
            title: "The Kid"
        }, {
            audio: "",
            date: new Date("2019/12/30"),
            episode: 97,
            image: "",
            imdb: "",
            title: "LA Confidential"
        }, {
            audio: "",
            date: new Date("2019/12/18"),
            episode: 98,
            image: "",
            imdb: "",
            title: "For a Few Dollars More"
        }, {
            audio: "",
            date: new Date("2019/12/09"),
            episode: 0,
            image: "",
            imdb: "",
            title: "The Irishman"
        }, {
            audio: "",
            date: new Date("2019/12/01"),
            episode: 99,
            image: "",
            imdb: "",
            title: "Rashomon"
        }, {
            audio: "",
            date: new Date("2019/11/24"),
            episode: 100,
            image: "",
            imdb: "",
            title: "The Apartment"
        },
    ];

    /* src/podcastDisplay.svelte generated by Svelte v3.38.3 */

    const file$1 = "src/podcastDisplay.svelte";

    // (9:4) {:else}
    function create_else_block(ctx) {
    	let t_value = `${/*podcast*/ ctx[0].title}` + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*podcast*/ 1 && t_value !== (t_value = `${/*podcast*/ ctx[0].title}` + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(9:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (7:4) {#if !podcast.bonus}
    function create_if_block$1(ctx) {
    	let t_value = `${/*podcast*/ ctx[0].episode}: ${/*podcast*/ ctx[0].title}` + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*podcast*/ 1 && t_value !== (t_value = `${/*podcast*/ ctx[0].episode}: ${/*podcast*/ ctx[0].title}` + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(7:4) {#if !podcast.bonus}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div0;
    	let t;
    	let div1;

    	function select_block_type(ctx, dirty) {
    		if (!/*podcast*/ ctx[0].bonus) return create_if_block$1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t = space();
    			div1 = element("div");
    			if_block.c();
    			attr_dev(div0, "class", "content svelte-6aszdl");
    			add_location(div0, file$1, 4, 0, 51);
    			attr_dev(div1, "class", "pc-title svelte-6aszdl");
    			add_location(div1, file$1, 5, 0, 75);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);
    			if_block.m(div1, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div1);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("PodcastDisplay", slots, []);
    	
    	let { podcast } = $$props;
    	const writable_props = ["podcast"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PodcastDisplay> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("podcast" in $$props) $$invalidate(0, podcast = $$props.podcast);
    	};

    	$$self.$capture_state = () => ({ podcast });

    	$$self.$inject_state = $$props => {
    		if ("podcast" in $$props) $$invalidate(0, podcast = $$props.podcast);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [podcast];
    }

    class PodcastDisplay extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { podcast: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PodcastDisplay",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*podcast*/ ctx[0] === undefined && !("podcast" in props)) {
    			console.warn("<PodcastDisplay> was created without expected prop 'podcast'");
    		}
    	}

    	get podcast() {
    		throw new Error("<PodcastDisplay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set podcast(value) {
    		throw new Error("<PodcastDisplay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.38.3 */
    const file = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    // (15:4) {#if !podcast.bonus}
    function create_if_block_1(ctx) {
    	let podcastdisplay;
    	let current;

    	podcastdisplay = new PodcastDisplay({
    			props: { podcast: /*podcast*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(podcastdisplay.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(podcastdisplay, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(podcastdisplay.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(podcastdisplay.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(podcastdisplay, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(15:4) {#if !podcast.bonus}",
    		ctx
    	});

    	return block;
    }

    // (14:3) {#each data as podcast}
    function create_each_block_1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = !/*podcast*/ ctx[0].bonus && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!/*podcast*/ ctx[0].bonus) if_block.p(ctx, dirty);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(14:3) {#each data as podcast}",
    		ctx
    	});

    	return block;
    }

    // (23:4) {#if podcast.bonus}
    function create_if_block(ctx) {
    	let podcastdisplay;
    	let current;

    	podcastdisplay = new PodcastDisplay({
    			props: { podcast: /*podcast*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(podcastdisplay.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(podcastdisplay, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(podcastdisplay.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(podcastdisplay.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(podcastdisplay, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(23:4) {#if podcast.bonus}",
    		ctx
    	});

    	return block;
    }

    // (22:3) {#each data as podcast}
    function create_each_block(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*podcast*/ ctx[0].bonus && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*podcast*/ ctx[0].bonus) if_block.p(ctx, dirty);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(22:3) {#each data as podcast}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div6;
    	let div0;
    	let t1;
    	let div5;
    	let div2;
    	let div1;
    	let t3;
    	let t4;
    	let div4;
    	let div3;
    	let t6;
    	let current;
    	let each_value_1 = podcasts;
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks_1[i], 1, 1, () => {
    		each_blocks_1[i] = null;
    	});

    	let each_value = podcasts;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out_1 = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div0 = element("div");
    			div0.textContent = "Here's the movies we watched while we were attempting to watch imdb's\n\t\ttop 50-100 movies.";
    			t1 = space();
    			div5 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			div1.textContent = "Imdb listed";
    			t3 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t4 = space();
    			div4 = element("div");
    			div3 = element("div");
    			div3.textContent = "Bonus films";
    			t6 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "main-title svelte-1nlsm4e");
    			add_location(div0, file, 6, 1, 164);
    			attr_dev(div1, "class", "podcast-category svelte-1nlsm4e");
    			add_location(div1, file, 12, 3, 344);
    			attr_dev(div2, "class", "imdb-films svelte-1nlsm4e");
    			add_location(div2, file, 11, 2, 316);
    			attr_dev(div3, "class", "podcast-category svelte-1nlsm4e");
    			add_location(div3, file, 20, 3, 539);
    			attr_dev(div4, "class", "bonus-films svelte-1nlsm4e");
    			add_location(div4, file, 19, 2, 510);
    			attr_dev(div5, "class", "podcasts svelte-1nlsm4e");
    			add_location(div5, file, 10, 1, 291);
    			attr_dev(div6, "class", "content svelte-1nlsm4e");
    			add_location(div6, file, 5, 0, 141);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div0);
    			append_dev(div6, t1);
    			append_dev(div6, div5);
    			append_dev(div5, div2);
    			append_dev(div2, div1);
    			append_dev(div2, t3);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div2, null);
    			}

    			append_dev(div5, t4);
    			append_dev(div5, div4);
    			append_dev(div4, div3);
    			append_dev(div4, t6);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div4, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*data*/ 0) {
    				each_value_1 = podcasts;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    						transition_in(each_blocks_1[i], 1);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						transition_in(each_blocks_1[i], 1);
    						each_blocks_1[i].m(div2, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks_1.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*data*/ 0) {
    				each_value = podcasts;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div4, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out_1(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks_1 = each_blocks_1.filter(Boolean);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ podcasts, data: podcasts, PodcastDisplay });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
        props: {}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
