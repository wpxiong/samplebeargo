try {
    if (window.CHITIKA &&
        top.CHITIKA &&
        top.CHITIKA !== window.CHITIKA) {
        top.CHITIKA.units = top.CHITIKA.units.append(window.CHITIKA.units);
        delete(window.CHITIKA);
    }
    window.CHITIKA = window.CHITIKA ? window.CHITIKA : top.CHITIKA;
    window.CHITIKA_ADS = window.CHITIKA_ADS ? window.CHITIKA_ADS : top.CHITIKA_ADS;
} catch (e) {}

window.CHITIKA = window.CHITIKA ? window.CHITIKA : {};
window.CHITIKA_ADS = window.CHITIKA_ADS ? window.CHITIKA_ADS : (function() {
    "use strict";
    var lightbox_modal;
    var lightbox_container;
    var mobile;
    var size_screen;
    var size_scroll;
    var size_viewport;
    var snippet_cache;
    var time_start          = new Date();
    var timeout_mainloop;
    var url_data_cache;
    var version             = "7.0";

    var amm_getads_map = {
        'ch_alternate_ad_url'       : 'alternate_ad_url',
        'ch_alternate_css_url'      : 'alternate_css_url',
        'ch_cid'                    : 'cid',
        'ch_city'                   : 'city',
        'ch_client'                 : 'publisher',
        'ch_color_bg'               : 'color_bg',
        'ch_color_border'           : 'color_border',
        'ch_color_site_link'        : 'color_site_link',
        'ch_color_text'             : 'color_text',
        'ch_color_title'            : 'color_title',
        'ch_fluidH'                 : 'fluidH',
        'ch_font_text'              : 'font_text',
        'ch_font_title'             : 'font_title',
        'ch_height'                 : 'height',
        'ch_nump'                   : 'nump',
        'ch_queries'                : 'queries',
        'ch_query'                  : 'query',
        'ch_sid'                    : 'sid',
        'ch_state'                  : 'state',
        'ch_target'                 : 'target',
        'ch_third_party_tracker'    : 'third_party_tracker',
        'ch_where'                  : 'where',
        'ch_width'                  : 'width',
        'ch_zip'                    : 'zip'
    };

    // For a long time we gave silly instructions to tell is by
    // parameter some default colors. That's a waste of time.
    // Skip them.
    var default_params = {
        'color_bg'          : '^#?ffffff',
        'color_border'      : '^#?ffffff',
        'color_site_link'   : '^#?0000cc',
        'color_text'        : '^#?000000',
        'color_title'       : '^#?0000cc'
    };

    var lightbox_config = {
        'border'            : '1px solid #acacac',
        'borderRadius'      : '1px',
        'boxShadow'         : '0px 0px 10px 5px #a2a2a2',
        'cid'               : undefined,
        'close_config'      : {
            'background'  : 'url(//images.chitika.net/buttons/close_metro.png)',
            'height'      : '18px',
            'right'       : '5px',
            'top'         : '5px',
            'width'       : '18px'
        },
        'close_handler'     : lightbox_hide,
        'height_max'        : 500,
        'height_min'        : 180,
        'height_percent'    : 0.6,
        'modal_color'       : '#888888',
        'modal_opacity'     : 0.40,
        'padding'           : '20px 10px 10px 10px',
        'sid'               : 'lightbox',
        'spinner_url'       : '//images.chitika.net/spinner.gif',
        'width_max'         : 700,
        'width_min'         : 300,
        'width_percent'     : 0.65
    };

    var product_activation_map = {
    };

    var window_data = {
        'top_accessible'    : false,
        'top_same'          : false
    };

    try {
        if (window === top) { window_data.top_same = true; }
        var l = top.document.location;
        window_data.top_accessible = true;
    } catch (e) {}

    function add_script(url, d) {
        if (d === undefined) {d = document;}
        if (typeof(url) !== 'string') {return undefined;}
        var h = d.getElementsByTagName('head')[0];
        if (!h) {return undefined;}
        var s = d.createElement('script');
        s.type = 'text/javascript';
        s.src = url;
        h.appendChild(s);
        return s;
    }

    function animate(container, frames, start_pos, target_pos) {
        animation_helper(container, 1, frames, start_pos, target_pos)();
    }

    // NOTE: frames here refers to the number of frames to draw, not a
    //       collection of iframes.
    function animation_helper(container, c, frames, start_pos, target_pos) {
        return function() {
            for (var k in target_pos) {
                // 1: Discovery.
                var end_at = target_pos[k];
                var start_at = start_pos[k];

                // 2: Figure out how much to move for this round.
                var total_movement = end_at - start_at;
                var new_offset = total_movement * (Math.pow(c, 4) / Math.pow(frames, 4));
                var stop_at = start_at + new_offset;

                // 3: Move there.
                if (k == 'l') {
                    container.style.left = stop_at + 'px';
                } else if (k == 't') {
                    container.style.top = stop_at + 'px';
                } else if (k == 'r') {
                    container.style.right = stop_at + 'px';
                } else if (k == 'b') {
                    container.style.bottom = stop_at + 'px';
                }
            }
            if (c < frames) {
                c++;
                setTimeout(animation_helper(container,
                                            c,
                                            frames,
                                            start_pos,
                                            target_pos),
                           20);
            }
        };
    }

    function append_func(obj, event, fun) {
        if (obj.addEventListener) {
            obj.addEventListener(event, fun, false);
        } else {
            obj.attachEvent('on' + event, fun);
        }
    }

    function attach_close(container, properties, fun, d) {
        if (d === undefined) { d = document; }
        var button = d.createElement('a');
        button.href = "#chitika_close_button";
        button.style.background = "url(//images.chitika.net/buttons/close_round_white_on_red.png)";
        button.style["background-repeat"] = 'no-repeat';
        button.style.height = "14px";
        button.style.position = "absolute";
        button.style.right = "0px";
        button.style.top = "0px";
        button.style.width = "16px";
        button.style.zIndex = "999999";

        // Set optional properties on the new button.
        if (typeof(properties) == 'object') { set_properties(button.style, properties); }

        append_func(button, 'click', fun);
        container.appendChild(button);
    }

    // Backwards compat for amm.js
    function bridge_amm() {
        var w = window;
        // 0: Bail out if backcompat not necessary
        if (w.ch_client === undefined) { return; }

        // 1: Start with an empty unit description.
        var unit = {};

        // 1.5: If being asked for type=mobile, activate adhesion product.
        if (w.ch_type == 'mobile') {
            CHITIKA.publisher = ch_client;
            var mobile_type_local = mobile_type();
            if (mobile_type_local >= 1 &&
                mobile_type_local <= 3) {
                add_script('//cdn.chitika.net/apps/adhesion.js');
                CHITIKA_ADS.already_adhesion = true;
            }
            return;
        }

        // 2: Map properties into a unit instruction.
        for (var n in amm_getads_map) {
            var mapped = amm_getads_map[n];
            var value = w[n];
            if (typeof(value) !== 'function') {
                unit[mapped] = value;
            }
        }

        // 3: Identify the impsrc specially.
        unit.impsrc = def(w.ch_impsrc, 'amm-getads-bridge');

        // 4: Save the unit instruction.
        var r = CHITIKA.units.length;
        CHITIKA.units[r] = unit;

        // 5: Write the div beacon.
        document.write('<div id="chitikaAdBlock-'+r+'" class="chitikaAdContainer"></div>');

        // 6: Fixups for the evil past.
        if (unit.publisher == 'magicyellow' &&
            w.ch_hq == 1 &&
            unit.width == 783) {
            delete unit.hq;
            var viewport_size_data = get_viewport_size();
            unit.width = Math.floor(viewport_size_data.w * 0.866);
        }
        if (unit.publisher == 'salary' &&
            unit.third_party_tracker) {
            // Yes, really. This is not a joke.
            unit.third_party_tracker = decodeURIComponent(decodeURIComponent(unit.third_party_tracker));
        }
        if (unit.publisher == 'thirdage' &&
            w.ch_hq == 1) {
            delete unit.hq;
            if (get_url_data()['url'].indexOf(/\/d\//) === -1) {
                CHITIKA.snippet_priority.unshift('h1');
            } else {
                CHITIKA.snippet_priority.unshift('h3');
            }
        }
        if (unit.publisher == 'epodunk') {
            var m = window.location.hostname.match(/([^\.]+)\.(com|net|org|info|mobi|co\.uk|org\.uk|ac\.uk|uk)$/);
            if (m) { unit.sid = 'epodunk_' + m[1]; }
        } else if (unit.publisher.match(/^epodunk_/)) {
            unit.sid = unit.publisher;
            unit.publisher = 'epodunk';
        }
        if (unit.publisher == 'yellowbook' &&
            w.ch_hq == 1) {
            var tmp = document.getElementById('related-categories');
            if (tmp) { tmp = tmp.getElementsByTagName('a'); }
            if (tmp) { tmp = tmp[0].innerHTML; }
            unit.query = tmp;
        }

        // 7: Clear global variables.
        w.ch_alternate_ad_url = undefined;
        w.ch_alternate_css_url = undefined;
        w.ch_cid = undefined;
        w.ch_city = undefined;
        w.ch_fluidH = undefined;
        w.ch_height = undefined;
        w.ch_impsrc = undefined;
        w.ch_metro_id = undefined;
        w.ch_nump = undefined;
        w.ch_query = undefined;
        w.ch_sid = undefined;
        w.ch_state = undefined;
        w.ch_where = undefined;
        w.ch_width = undefined;
        w.ch_zip = undefined;
    }

    function create_container(name, config, d) {
        if (d === undefined) { d = document; }
        var container = d.createElement('div');
        container.id = name;
        container.className = 'chitikaAdContainer';
        set_properties(container.style, {
            'backgroundColor'   : def(config.bgColor, '#FFFFFF'),
            'border'            : def(config.border, 'none'),
            'borderRadius'      : def(config.borderRadius, 'none'),
            'boxShadow'         : def(config.boxShadow, 'none'),
            'padding'           : def(config.padding, 'none'),
            'position'          :'fixed',
            'zIndex'            : '99999'
        });
        if (config.close_handler) {
            attach_close(
                container,
                config.close_config,
                config.close_handler,
                d);
        }
        return container;
    }

    var create_handle_message = function(window) {
        var document        = window.document,
            handle_message  = function(message, targetOrigin) {
            if (!message) { return; }
            var m1 = typeof(message) === "object" ? message.data : message;
            var m = m1.match(/^([^\|]*)\|?([\s\S]*)/);
            var action = m[1],
                content = m[2];
            if (action == "close") {
                try { document.close(); } catch (e) {}
            }
            else if (action == "script" && content) {
                var h = document.getElementsByTagName("head")[0];
                if (!h) {return undefined;}
                var s = document.createElement("script");
                s.src = content;
                h.appendChild(s);
            }
            else if (action == "write" && content) {
                var save = [
                    'CHITIKA',
                    'CHITIKA_ADS',
                    'handle_message',
                    'lightbox',
                    'lightbox_config',
                    'render_ad'
                ];
                var saved = {};
                for (var c = 0; c < save.length; c++) {
                    var key = save[c];
                    saved[key] = window[key];
                }

                document.write(content);
                try {
                    if (document.body.innerHTML.length == 0) {
                        // document.write failed, use fallback
                        window.parent.CHITIKA_ADS.rewrite_iframe(window.frameElement.id, content);
                    }
                } catch(e) {}

                for (var c = 0; c < save.length; c++) {
                    var key = save[c];
                    window[key] = saved[key];
                }

                if (window.postMessage === undefined) {
                    window.postMessage = saved['handle_message'];
                } else {
                    if (window.addEventListener) {
                        window.addEventListener("message", window.handle_message, false);
                    } else {
                        window.attachEvent("onmessage", window.handle_message);
                    }
                }
            }
        }
        return handle_message;
    }

    ////////////////////////////////////////////////////////////////
    // Shorthand for creating an iframe element.
    function create_iframe(name, width, height, d) {
        if (d === undefined) { d = document; }

        var properties = {
            'allowTransparency' : 'allowTransparency',
            'border'            : '0',
            'className'         : 'chitikaAdBlock',
            'frameBorder'       : '0',
            'height'            : (typeof(height) === 'string' ? 0 : height),
            'hspace'            : '0',
            'id'                : name,
            'marginHeight'      : '0',
            'marginWidth'       : '0',
            'padding'           : '0',
            'scrolling'         : 'no',
            'src'               : 'about:blank',
            'style'             : {
                'margin'        : '0',
                'padding'       : '0'
            },
            'vspace'            : '0',
            'width'             : (typeof(width) === 'string' ? 0 : width)
        };

        var frame = d.createElement('iframe');
        set_properties(frame, properties);
        return frame;
    }

    function create_iframe_autoclose(unit) {
        return function() {
            for (var c = 0; c < unit.frames.length; c++) {
                unit.frames[c].contentWindow.postMessage('close', '*');
            }
        }
    }

    function create_iframe_load_callback(unit, frame_number) {
        return function() {
            var frame = unit.frames[frame_number];
            if (unit.frames_loaded[frame_number]) { return; }
            unit.frames_loaded[frame_number] = true;
            // 1: Prepare the message handling function.
            unit.message_handlers[frame_number] = def(unit.message_handlers[frame_number], create_handle_message(frame.contentWindow));
            var handle_message = unit.message_handlers[frame_number];
            var w = frame.contentWindow;

            // 2: Try to attach some functions to our iframe.
            var src;
            var dangerWillRobinson = false;
            try {
                w.CHITIKA = CHITIKA;
                w.CHITIKA_ADS = CHITIKA_ADS;
                w.handle_message = unit.message_handlers[frame_number];
                w.lightbox = lightbox;
                w.lightbox_config = lightbox_config;
                w.render_ad = unit.callback;
            } catch (e) {
                send_event('getads_except_sic1', null, {message: e.message});
                dangerWillRobinson = true;
            }

            // 3: Decide how to put stuff in the frame.
            // 3a: security situation, no postMessage support.
            if (dangerWillRobinson && window.postMessage === undefined) {
                src = 'window.postMessage = ' + handle_message.toString() + '; ';
            }
            // 3b: no postMessage support (MSIE < 8).
            else if (window.postMessage === undefined) {
                w.postMessage = handle_message;
            }
            // 3c: security situation with postMessage.
            else if (dangerWillRobinson) {
                src = 'var handle_message = ' + handle_message.toString() + '; ';
                if (window.addEventListener) {
                    src += 'window.addEventListener("message", handle_message, true);';
                } else {
                    src += 'window.attachEvent("onmessage", handle_message);';
                }
            }
            // 3d: best case scenario: Modern WebKit or Gecko. Also sometimes IE 9-11.
            else {
                w.handle_message = handle_message;
                append_func(w, 'message', handle_message);
            }
            if (src) {
                src = 'javascript:(function() { ' + src + ' }())';
                frame.src = src;
            }

            // 4: Apparently older MSIEs fires the frame load event before
            //    there is a document available in the frame. There is no
            //    way we can figure out when it's *really* loaded, so we
            //    force our hand.
            if (frame_number === 0 &&
                navigator.userAgent &&
                navigator.userAgent.match(/MSIE [5-8]/)) {
                w.postMessage('write|<!DOCTYPE html><html><head></head><body></body></html>', '*');
            }

            // 5: Flag that another unit has become ready.
            unit.frames_ready++;
        }
    }

    function create_spinner(d, id, properties, spinner_url) {
        if (!spinner_url) { spinner_url = '//images.chitika.net/spinner.gif'; }
        var container = d.createElement('div');
        container.id = id;
        set_properties(container, properties);
        var spinner = d.createElement('img');
        spinner.src = spinner_url;
        spinner.style.margin = 'auto';
        spinner.style.display = 'block';
        container.appendChild(spinner);
        return container;
    }

    // def() - If defined, return v, else return def(ault)
    function def(v, def) {
        if (v !== null && v !== undefined) {
            return v;
        }
        else {
            return def;
        }
    }

    // dq() - Return input surrounded by double-quotes
    function dq(s) { return (s !== null) ? '"' + s + '"' : '""'; }

    function drop_it_like_its_hot(response) {
        if (!response) { return; }
        var unit            = CHITIKA.units[response.unit_id];
        var frame           = unit.frames[0];
        if (!unit.ad_url_params || !frame) { return; }
        if (response.extra_params) {
            for (var k in response.extra_params) {
                var v = response.extra_params[k];
                unit.ad_url_params = param_concat_escape(unit.ad_url_params, k, v);
            }
        }
        var url = '//' + CHITIKA.host + '/minimall' + unit.ad_url_params;
        frame.contentWindow.postMessage('script|' + url, '*');
    }

    function get_adspec() {
        if (!CHITIKA.enable_one_call) { return; }
        var adspec = [];
        for (var unit_id = 0; unit_id < CHITIKA.units.length; unit_id++) {
            var unit = CHITIKA.units[unit_id];
            var unit_data = {
                'calltype'   : unit.calltype,
                'cid'       : unit.cid,
                'h'         : unit.height,
                'product'   : unit.product,
                'nump'      : unit.nump,
                'sid'       : unit.sid,
                'w'         : unit.width
            };
            adspec.push(unit_data);
        }

        if (typeof(JSON) !== undefined &&
            typeof(JSON.stringify) !== undefined) {
            return JSON.stringify(adspec);
        } else {
            return stringify(adspec);
        }
    }

    function get_screen_size() {
        if (size_screen !== undefined) { return size_screen; }
        size_screen = {
            h: screen.height,
            w: screen.width
        };
        return size_screen;
    }

    function get_scroll_size() {
        if (size_scroll !== undefined) { return size_scroll; }
        var d = window_data.top_accessible ? top.document : window.document;
        size_scroll = {
            h: d.documentElement.scrollHeight ||
               d.body.scrollHeight,
            w: d.documentElement.scrollWidth ||
               d.body.scrollWidth
        };
        return size_scroll;
    }

    // get_snippet_data - Gathers snippets of text from the page which can
    // be used for targeting.
    function get_snippet_data() {
        if (snippet_cache) { return snippet_cache; }
        snippet_cache = {};

        // 1. Decide which document scope to search.
        var d = window_data.top_accessible ? top.document : window.document;

        // 2. Meta tags. Get them all.
        var meta = d.getElementsByTagName('meta');
        for (var i = 0; i < meta.length; i++) {
            var name    = meta[i].getAttribute('name'),
                content = meta[i].getAttribute('content');

            if (name && content) {
                snippet_cache[name.toLowerCase()] = content;
            }
        }

        // 3. Look up any of our "priorities" by tag name.
        for (var c = 0; c < CHITIKA.snippet_priority.length; c++) {
            var m = CHITIKA.snippet_priority[c].match(/^([^\/]+)(?:\/(\d+))?/);
            var i = (m[2] ? parseInt(m[2], 10) : 0);
            var tags = d.getElementsByTagName(m[1]);
            if (tags.length <= i ) { continue; }
            snippet_cache[m[1]] = tags[i].textContent || tags[i].innerText;
        }

        // 4. Return it.
        return snippet_cache;
    }

    function get_url_data() {
        if (url_data_cache !== undefined) { return url_data_cache; }
        var frm, ref, serveUrl, url;
        // Detect iframes and pass appropriate frm & url values
        if (window_data.top_same) {
            ref             = document.referrer;
            url             = document.location.href;
        } else if (window_data.top_accessible) {
            frm             = 1;
            ref             = top.document.referrer;
            url             = top.document.location.href;
            serveUrl        = document.location.href;
        } else {
            // Security exception.
            frm             = 2;
            url             = document.referrer;
            serveUrl        = document.location.href;
        }

        if (serveUrl && url && serveUrl == url) { serveUrl = undefined; }

        if (serveUrl &&
            serveUrl.match(/^javascript:/)) {
            serveUrl = undefined;
        }

        if (ref &&
            ref.length > 500) {
            ref = ref.replace(/[?#].*/, '');
            if (ref.length > 500) {
                ref = ref.match(/.*\/\/[^\/]*\//)[0];
            }
        }

        url_data_cache = {
            frm         : frm,
            url         : url,
            ref         : ref,
            serveUrl    : serveUrl
        };
        return url_data_cache;
    }

    function get_viewport_size() {
        if (size_viewport !== undefined) { return size_viewport; }
        var w = window_data.top_accessible ? top : window;
        size_viewport = {
            h   : w.innerHeight ||
                  w.document.documentElement.clientHeight ||
                  w.document.body.clientHeight,
            w   : w.innerWidth ||
                  w.document.documentElement.clientWidth ||
                  w.document.body.clientWidth
        };
        return size_viewport;
    }

    // If the window is resized, the ad unit my re-flow. We need to adjust
    // the height automatically if this happens.
    function handle_resize() {
        // Dirty our viewport size cache.
        size_viewport = undefined;
        // Reflow units and recalc size.
        for (var unit_id = 0; unit_id < CHITIKA.units.length; unit_id++) {
            var unit = CHITIKA.units[unit_id];
            if (!unit.already_rendered) { continue; }
            if (unit.fluidH) {
                for (var c = 0; c < unit.frames.length; c++) {
                    var frame = unit.frames[c];
                    if (!frame ||
                        !frame.contentWindow ||
                        !frame.contentWindow.document) {
                        continue;
                    }
                    var h1 = frame.contentWindow.document.body ?
                        frame.contentWindow.document.body.scrollHeight : frame.contentWindow.document.documentElement.scrollHeight;
                    var h2 = unit.height;
                    if (h1 != h2) {
                        unit.height = h1;
                        frame.style.height = h1 + "px";
                    }
                }
            }
            if (window_data.top_accessible &&
                !unit.already_visible &&
                !unit.disable_vcpm) {
                unit.loc = locate_obj(unit.container);
            }
        }
        if (lightbox_container &&
            lightbox_container.style.display == 'block') {
            lightbox_show();
        }
    }

    // ldef() - Return the first argument that isn't undefined
    function ldef() {
        for (var i = 0; i < arguments.length; i++) {
            if (arguments[i] !== undefined) {
                return arguments[i];
            }
        }
        return undefined;
    }

    function lightbox(impId, index, query) {
        var metadata = {
            'hc1'           : query,
            'lc1'           : index
        };
        send_event('lightbox_click', impId, metadata);

        if (!window_data.top_accessible) { return; }

        // 1: Intercept our config.
        if (CHITIKA.lightbox_config) {
            set_properties(lightbox_config, CHITIKA.lightbox_config);
        }

        // 2: Make sure we know how big the unit will be.
        if (!lightbox_config.height || !lightbox_config.width) {
            var l = ['height', 'width'];
            var viewport_size_data = get_viewport_size();
            for (var c = 0; c < 2; c++) {
                var k = l[c];
                if (lightbox_config[k]) { continue; }
                lightbox_config[k] = Math.floor(viewport_size_data[(k == 'width' ? 'w' : 'h')] * lightbox_config[k+'_percent']);
                if (lightbox_config[k] > lightbox_config[k+'_max']) {
                    lightbox_config[k] = lightbox_config[k+'_max'];
                } else if (lightbox_config[k] < lightbox_config[k+'_min']) {
                    lightbox_config[k] = lightbox_config[k+'_min'];
                }
            }
        }

        // 3: Make sure we have a units reference.
        if (top.lightbox_units === undefined) { top.lightbox_units = {}; }
        var lightbox_units = top.lightbox_units;

        // 4: Find out modal mask, and make new stuff if not found.
        lightbox_modal = top.document.getElementById('chitika-modal');
        if (lightbox_modal === null) {
            lightbox_modal = top.document.createElement('div');
            lightbox_modal.id = 'chitika-modal';
            set_properties(lightbox_modal.style, {
                'allowTransparency' : 'allowTransparency',
                'backgroundColor'   : lightbox_config.modal_color,
                'bottom'            : '0',
                'display'           : 'none',
                'filter'            : 'alpha(opacity='+lightbox_config.modal_opacity*100+')',
                'left'              : '0',
                'opacity'           : lightbox_config.modal_opacity,
                'position'          : 'fixed',
                'right'             : '0',
                'top'               : '0',
                'zIndex'            : '9999',
                'zoom'              : '1'
            });
            append_func(lightbox_modal, 'click', lightbox_hide);
            top.document.body.appendChild(lightbox_modal);

            lightbox_container = create_container('chitika-container-lightbox', lightbox_config, top.document);
            lightbox_container.style.margin = 'auto auto';
            top.document.body.appendChild(lightbox_container);
            lightbox_container.appendChild(create_spinner(top.document,
                                                          'chitika-spinner-lightbox',
                                                          undefined,
                                                          lightbox_config.spinner_url));
        }

        lightbox_container = top.document.getElementById('chitika-container-lightbox');
        if (lightbox_units[impId] === undefined) { lightbox_units[impId] = {}; }

        // 5: Make an ad call, or use a cached ad.
        if (lightbox_units[impId][index] === undefined) {
            top.document.getElementById('chitika-spinner-lightbox').style.display = 'block';
            var frame_name = 'chitikaLightbox-'+impId + '-' + index;

            var unit = {
                'callback'          : lightbox_callback,
                'cid'               : lightbox_config.cid,
                'container_id'      : 'chitika-container-lightbox',
                'container_document': top.document,
                'disable_vcpm'      : true,
                'frame_id'          : frame_name,
                'height'            : lightbox_config.height,
                'impId'             : impId,
                'product'           : 'lightbox',
                'query'             : query,
                'sid'               : lightbox_config.sid,
                'skip_one_call'     : 1,
                'width'             : lightbox_config.width
            };
            lightbox_units[impId][index] = unit;
            CHITIKA.units.push(unit);
            make_it_so();
        } else {
            lightbox_units[impId][index].frames[0].style.display = 'block';
        }
        lightbox_show();
    }

    function lightbox_callback(response) {
        if (response === undefined ||
            (!response.output &&
             !response.alturl)) {
            lightbox_hide();
        }
        var unit = CHITIKA.units[response.unit_id];
        var frame = unit.frames[0];

        top.document.getElementById('chitika-spinner-lightbox').style.display = 'none';
        render_ad_basic(response);
        render_ad_inject_content(response);
        frame.style.display = 'block';
    }

    function lightbox_show() {
        var viewport_size_data = get_viewport_size();
        var boxOffsetLeft = (viewport_size_data.w - lightbox_config.width)/2;
        var boxOffsetTop = (viewport_size_data.h - lightbox_config.height)/2;

        lightbox_container.style.left = boxOffsetLeft+'px';
        lightbox_container.style.top = boxOffsetTop+'px';
        lightbox_container.style.display = 'block';
        lightbox_modal.style.display = 'block';
    }

    function lightbox_hide() {
        for (var k in top.lightbox_units) {
            for (var j in top.lightbox_units[k]) {
                top.lightbox_units[k][j].frames[0].style.display = 'none';
            }
        }
        lightbox_container.style.display = 'none';
        lightbox_modal.style.display = 'none';
        return false;
    }

    // locate_obj() - walks the DOM tree from obj, accumulating offset left
    // and top to find X, Y position for obj
    function locate_obj(obj) {
        var _x = 0;
        var _y = 0;
        var _w = 0;
        var _h = 0;
        _w = obj.offsetWidth;
        _h = obj.offsetHeight;
        while (obj) {
            try {
                _x += obj.offsetLeft;
                _y += obj.offsetTop;
                if (obj.tagName == 'BODY') {
                    var w = obj.ownerDocument.defaultView ||
                            obj.ownerDocument.parentWindow;
                    obj = w.frameElement;
                } else {
                    obj = obj.offsetParent;
                }
            } catch (e) {
                send_event('getads_except_locate_obj', null, {message: e.message});
                return {};
            }
        }
        return { x: _x, y: _y, w: _w, h: _h };
    }

    function make_ad_server_call() {
        var base_url = '//' + CHITIKA.host + '/minimall';
        for (var unit_id = 0; unit_id < CHITIKA.units.length; unit_id++) {
            var unit            = CHITIKA.units[unit_id];
            var frame           = unit.frames[0];
            var url             = base_url;
            // Don't call for units that are already done or not ready yet.
            if (unit.already_fired || !unit.ad_url_params || !frame) { continue; }
            if (unit.frames_ready !== (unit.hasClones+1)) { continue; }

            if (CHITIKA.enable_one_call === 1 &&
                !unit.skip_one_call &&
                unit_id !== 0) {
                continue;
            }

            if (unit.force_rtb ||
                (!unit.disable_rtb &&
                 (unit.cpm_floor || Math.random() < 0))) {
                url = 'http://ss.chitika.net/chitika/decision';
            }

            url = url + unit.ad_url_params;

            unit.already_fired = true;
            unit.frame_autoclose_timeout = setTimeout(create_iframe_autoclose(unit), 10000);
            frame.contentWindow.postMessage('script|' + url, '*');
        }
    }

    function make_it_so() {
        // 0: Clear the timeout, in case it's going still
        if (timeout_mainloop) {
            clearTimeout(timeout_mainloop);
            timeout_mainloop = null;
        }

        // 1: Pixel it let us know about a page load.
        if (!CHITIKA.mmu0_initial) {
/*
            send_event('mmu0_initial', null, {
                'hc1'       : (new Date() - time_start)
            });
*/
            CHITIKA.mmu0_initial = 1;
        }

        // 2: Try to service this unit.
        try {
            prepare_instructions();
        } catch (e) { send_event('getads_except_prepare_instructions', null, {message: e.message}); }
        try {
            prepare_containers();
        } catch (e) { send_event('getads_except_prepare_containers', null, {message: e.message}); }
        try {
            prepare_ad_urls();
        } catch (e) { send_event('getads_except_prepare_ad_urls', null, {message: e.message}); }
        try {
            make_ad_server_call();
        } catch (e) { send_event('getads_except_make_ad_server_call', null, {message: e.message}); }

        // 3: See if we need to continue our loop.
        var keep_going = false;
        for (var c = 0; c < CHITIKA.units.length; c++) {
            if (!CHITIKA.units[c].already_fired) {
                keep_going = true;
                break;
            }
        }
        if (keep_going) {
            timeout_mainloop = setTimeout(make_it_so, 250);
        }
    }

    function minimall_callback(response) {
        if (response === undefined) { return; }

        if (response.unit_id === 0) {
/*
            send_event('mmu0_render', CHITIKA.units[0].impId, {
                'lc1'       : (response ? 1 : 0),
                'lc2'       : (response && response.output ? 1 : 0),
                'hc1'       : (new Date() - time_start)
            });
*/
        }

        if (response.apps) {
            for (var app in response.apps) {
                if (product_activation_map[app] !== undefined) {
                    product_activation_map[app]();
                }
            }
            prepare_instructions();
            prepare_ad_urls();
            make_ad_server_call();
        }

        if (response.unit_id === 0 &&
            CHITIKA.enable_one_call) {
            for (var c = 1; c < CHITIKA.units.length; c++) {
                if (CHITIKA.enable_one_call &&
                    !CHITIKA.units[c].skip_one_call) {
                    CHITIKA.units[c].impId = response.impId;
                }
            }

            CHITIKA.enable_one_call = 2;
            prepare_ad_urls();
            make_ad_server_call();
        }

        render_ad_basic(response);
        try {
            render_ad_inject_content(response);
        } catch (e) { send_event('getads_except_render_inject', null, {message: e.message}); }
        render_ad_js(response);
        render_ad_pixels(response);
        // Trigger a few times to deal with slow DOM rendering.
        setTimeout(handle_resize, 30);
        setTimeout(handle_resize, 60);
        setTimeout(handle_resize, 180);
    }

    function mobile_type() {
        if (mobile !== undefined) { return mobile; }
        if (/i[Pp]ad/.test(navigator.userAgent)) {
            mobile = 1;
        }
        else if (/i[Pp]od/.test(navigator.userAgent)) {
            mobile = 4;
        }
        else if (/i[Pp]hone/.test(navigator.userAgent)) {
            mobile = 2;
        }
        else if (/[Aa]ndroid/.test(navigator.userAgent)) {
            mobile = 3;
        }
        else if (/BlackBerry|RIM/.test(navigator.userAgent)) {
            mobile = 5;
        }
        else {
            mobile = 0;
        }
        return mobile;
    }

    function param_concat(url, p, v) {
        if (!v && v !== 0) { return url; }
        return url + '&' + p + '=' + v;
    }

    function param_concat_escape(url, p, v) {
        if (!v && v !== 0) { return url; }
        return url + '&' + p + '=' + encodeURIComponent(v);
    }

    function param_concat_words(url, p, v) {
        if (!v && v !== 0) { return url; }
        v = v.replace(/[\W]+/, '_');
        return url + '&' + p + '=' + encodeURIComponent(v);
    }

    function prepare_ad_urls() {
        var adspec = [],
            screen_size_data = {},
            scroll_size_data = {},
            snippet_data = {},
            url_data = {},
            viewport_size_data = {};
        try {
            adspec              = get_adspec();
        } catch (e) { send_event('getads_except_pau_1', null, {message: e.message}); }
        try {
            screen_size_data    = get_screen_size();
        } catch (e) { send_event('getads_except_pau_2', null, {message: e.message}); }
        try {
            scroll_size_data    = get_scroll_size();
        } catch (e) { send_event('getads_except_pau_3', null, {message: e.message}); }
        try {
            snippet_data        = get_snippet_data();
        } catch (e) { send_event('getads_except_pau_4', null, {message: e.message}); }
        try {
            url_data            = get_url_data();
        } catch (e) { send_event('getads_except_pau_5', null, {message: e.message}); }
        try {
            viewport_size_data  = get_viewport_size();
        } catch (e) { send_event('getads_except_pau_6', null, {message: e.message}); }

        for (var unit_id = 0; unit_id < CHITIKA.units.length; unit_id++) {
            var unit            = CHITIKA.units[unit_id];

            // See if we're in the needed state to get url prepared.
            if (!unit.already_fixup ||
                unit.ad_url_params ||
                (CHITIKA.enable_one_call === 1 && unit_id > 0)) {
                 continue;
            }

            // 3.1: Initial URI for ad request.
            var ad_url = '?output='+ unit.output;

            // 3.2: Critical identification properties.
            ad_url = param_concat_escape(ad_url, 'publisher',           unit.publisher);
            ad_url = param_concat_escape(ad_url, 'altsid',              unit.altsid);
            ad_url = param_concat(ad_url, 'unit_id',                    unit_id);
            ad_url = param_concat_escape(ad_url, 'impId',               unit.impId);
            ad_url = param_concat_escape(ad_url, 'extra_subid_info',    unit.extra_subid_info);
            ad_url = param_concat_escape(ad_url, 'cpm_floor',           unit.cpm_floor);

            // 3.3: Are we doing one call?
            if (CHITIKA.enable_one_call &&
                !unit.skip_one_call &&
                adspec !== undefined &&
                typeof(adspec) == 'string') {
                ad_url = param_concat_escape(ad_url, 'adspec', adspec);
            } else {
                ad_url = param_concat_escape(ad_url, 'sid',                 unit.sid);
                ad_url = param_concat_words(ad_url, 'cid',                  unit.cid);
                ad_url = param_concat_escape(ad_url, 'calltype',            unit.calltype);
                ad_url = param_concat_escape(ad_url, 'product',             unit.product);
                ad_url = param_concat_escape(ad_url, 'w',                   unit.width);
                ad_url = param_concat_escape(ad_url, 'h',                   unit.height);
                ad_url = param_concat_escape(ad_url, 'nump',                unit.nump);
            }

            // 3.4: Info about where we are on the internet.
            for (var k in url_data) {
                var v = url_data[k];
                var v2;
                if (unit.omg !== undefined) {
                    v2 = unit.omg[k];
                    if (v2 && v2 != v) {
                        ad_url = param_concat(ad_url, 'omg_'+k, 1);
                        v = v2;
                    }
                }
                ad_url = param_concat_escape(ad_url, k, v);
            }

            // 3.5: Some publisher settings.
            ad_url = param_concat_escape(ad_url, 'altcss',              unit.alternate_css_url);
            ad_url = param_concat_escape(ad_url, 'alturl',              unit.alternate_ad_url);
            ad_url = param_concat_escape(ad_url, 'cttarget',            unit.target);
            ad_url = param_concat_escape(ad_url, 'tptracker',           unit.third_party_tracker);

            // 3.6: Targetting data.
            ad_url = param_concat_escape(ad_url, 'query',               unit.query);
            ad_url = param_concat_escape(ad_url, 'where',               unit.where);
            ad_url = param_concat_escape(ad_url, 'city',                unit.city);
            ad_url = param_concat_escape(ad_url, 'state',               unit.state);
            ad_url = param_concat_escape(ad_url, 'zip',                 unit.zip);
            if (unit.queries &&
                unit.queries.constructor.toString().indexOf("Array") !== -1) {
                ad_url = param_concat_escape(ad_url, 'mquery', unit.queries.join('|'));
            }

            // 3.7: Visual configuration properties.
            ad_url = param_concat_escape(ad_url, 'cl_border',           unit.color_border);
            ad_url = param_concat_escape(ad_url, 'cl_button',           unit.color_button);
            ad_url = param_concat_escape(ad_url, 'cl_button_text',      unit.color_button_text);
            ad_url = param_concat_escape(ad_url, 'cl_bg',               unit.color_bg);
            ad_url = param_concat_escape(ad_url, 'cl_title',            unit.color_title);
            ad_url = param_concat_escape(ad_url, 'cl_text',             unit.color_text);
            ad_url = param_concat_escape(ad_url, 'cl_site_link',        unit.color_site_link);
            ad_url = param_concat_escape(ad_url, 'fn_title',            unit.font_title);
            ad_url = param_concat_escape(ad_url, 'fn_text',             unit.font_text);

            // 3.8: Data attributes.
            ad_url = param_concat(ad_url, 'dpr',                        window.devicePixelRatio);
            ad_url = param_concat_escape(ad_url, 'impsrc',              unit.impsrc);
            try {
                ad_url = param_concat_escape(ad_url, 'history',         window.history.length);
            } catch (e) { send_event('getads_except_pau_7', null, {message: e.message}); }
            ad_url = param_concat_escape(ad_url, 'size_screen',         screen_size_data.w+'x'+screen_size_data.h);
            ad_url = param_concat_escape(ad_url, 'size_scroll',         scroll_size_data.w+'x'+scroll_size_data.h);
            ad_url = param_concat_escape(ad_url, 'size_viewport',       viewport_size_data.w+'x'+viewport_size_data.h);
            ad_url = param_concat_escape(ad_url, 'vsn',                 version);
            if (window_data.top_accessible &&
                top.document.compatMode != 'CSS1Compat') {
                ad_url = param_concat(ad_url, 'quirks', 1);
            }

            // 3.9 Anything extra.
            if (unit.extra_params !== undefined) {
                for (var k in unit.extra_params) {
                    ad_url = param_concat_escape(ad_url, k, unit.extra_params[k]);
                }
            }

            // 3.10: Indicate Chrome prerendering mode.
            if (navigator.userAgent.match(/Chrome/) &&
                document.webkitVisibilityState !== undefined &&
                document.webkitVisibilityState == "prerender") {
                ad_url = param_concat(ad_url, 'prerender', 1);
            }

            // 3.11: Include some targetting data from the local page.
            var count = 0;
            for (var c = 0; c < CHITIKA.snippet_priority.length && count < CHITIKA.snippet_count; c++) {
                var id = CHITIKA.snippet_priority[c].match(/^([^\/]+)(?:\/(\d+))?/)[1];
                if (snippet_data[id]) {
                    ad_url = param_concat_escape(ad_url, 'snip_' + id, snippet_data[id].substring(0, CHITIKA.snippet_length));
                    ++count;
                }
            }

            ad_url = ad_url.substring(0, 2048);       // Trim request URL to 2048 characters
            ad_url = ad_url.replace(/%\w?$/, '');     // Remove any trailing malformed URL encoded character

            if (unit.adurl_fixup !== undefined) {
                ad_url = unit.adurl_fixup(ad_url);
            }
            unit.ad_url_params = ad_url;
        }
    }

    function prepare_containers() {
        for (var unit_id = 0; unit_id < CHITIKA.units.length; unit_id++) {
            var unit        = CHITIKA.units[unit_id];
            if (!unit.already_fixup || unit.container) { continue; }
            var d = unit.container_document ? unit.container_document : document;

            for (var c = 0; c <= unit.hasClones; c++) {
                // 1: Generate names for stuff.
                var container_name = def(unit.container_id, 'chitikaAdBlock-' + unit_id);
                if (c !== 0) { container_name += '-' + c; }
                var frame_name  = unit.frame_id ? unit.frame_id : "ch_ad" + unit_id + '-' + c;

                // 2: Locate the container, save ref to the first one.
                var container  = d.getElementById(container_name);
                if (!container) { continue; }
                if (c === 0) { unit.container = container; }

                // 3: Apply class name for easy identification
                if (!container.className) {
                    container.className = "chitikaAdContainer";
                } else if (container.className.indexOf("chitikaAdContainer") == -1) {
                    container.className += " chitikaAdContainer";
                }

                // 4: Create an iframe, push into array, listen for load event.
                var frame = create_iframe(frame_name, unit.width, unit.height);
                // NOTE: Pushing here is mandatory! Things break if you wait.
                unit.frames.push(frame);
                append_func(frame, 'load', create_iframe_load_callback(unit, c));

                // 5: Optionally hide iframe until it has content.
                if (unit.defer_show) {
                    frame.style.display = 'none';
                }

                // 6: Attach iframe to the container and let's go!
                container.appendChild(frame);
            }
        }
    }

    function prepare_instructions() {
        for (var unit_id = 0; unit_id < CHITIKA.units.length; unit_id++) {
            var unit = CHITIKA.units[unit_id];
            if (unit.already_fixup) { continue; }

            // 1: s/client/publisher/. Imposed vocabulary correction.
            if (unit.client) {
                unit.publisher = unit.client;
                delete unit.client;
            }

            // 2: Save a reference to the publisher name. Sometimes needed
            //    for Apps later
            CHITIKA.publisher = def(CHITIKA.publisher, unit.publisher);
            if (!unit.publisher) { unit.publisher = CHITIKA.publisher; }

            // 3: Make sure we have a CID for automated identification.
            if (!unit.cid) {
                if (!unit.sid ||
                    unit.sid == 'Chitika Default') {
                    unit.cid = 'unit-'+unit_id;
                }
                else {
                    unit.cid = unit.sid;
                }
            }

            // 4: Make sure we identify the traffic generator.
            unit.impsrc = def(unit.impsrc, "getads");

            // 5: Remove default parameter values. They waste log space.
            for (var p in default_params) {
                var c = default_params[p];
                if (!unit[p]) { continue; }
                if (unit[p].match(new RegExp(c, "i"))) { delete unit[p]; }
            }

            // 6: Publisher only gets to ask for a number of ads in h=auto mode.
            if (!unit.fluidH &&
                unit.nump) {
                delete unit.nump;
            }

            // 7: Make sure there are at least 0 clones, init the frames array.
            unit.frames = def(unit.frames, []);
            unit.frames_loaded = {};
            unit.hasClones = def(unit.hasClones, 0);
            unit.message_handlers = def(unit.message_handlers, []);

            // 8: Ensure there's an output type defined.
            unit.output = def(unit.output, 'jsonp');

            // 9: Make sure a callback is specified.
            unit.callback = def(unit.callback, minimall_callback);

            // 10: Set state indicator, so we don't repeat this effort.
            unit.already_fixup = true;

            // 11: Initialize ready frame count.
            unit.frames_ready = 0;
        }
    }

    function render_ad_basic(response) {
        var unit_id = response.unit_id;
        var unit = CHITIKA.units[unit_id];

        if (response.alturl) {
            unit.alternate_ad_url = response.alturl;
        }

        if (response.disable_vcpm) {
            unit.disable_vcpm = true;
        }

        if (response.fluidH) {
            unit.fluidH = true;
        }

        unit.impId = response.impId;
        unit.navajo = response.navajo;

        if (window_data.top_accessible &&
            !unit.disable_vcpm) {
            unit.loc = locate_obj(unit.container);
        }
    }

    function render_ad_inject_content(response) {
        var unit_id = response.unit_id;
        var unit = CHITIKA.units[unit_id];

        for (var c = 0; c < unit.frames.length; c++) {
            var frame = unit.frames[c];
            var w = frame.contentWindow;
            if (response.output) {
                w.postMessage('write|' + response.output, '*');
                if (!response.dont_close) {
                    w.postMessage('close', '*');
                    clearTimeout(CHITIKA.units[c].frame_autoclose_timeout);
                }
                unit.already_rendered = true;
                if (!unit.disable_vcpm) { visibility_check(); }
            } else if (unit.alternate_ad_url) {
                frame.src = unit.alternate_ad_url;
                unit.disable_vcpm = false;
            } else if (response.altjs) {
                unit.disable_vcpm = false;
                w.postMessage('script|' + response.altjs, '*');
            } else {
                if (window.jQuery !== undefined) {
                    window.jQuery(frame).slideUp();
                } else {
                    frame.style.display = 'none';
                }
                w.postMessage('close', '*');
                clearTimeout(CHITIKA.units[c].frame_autoclose_timeout);
                unit.disable_vcpm = false;
            }

            if (unit.defer_show &&
                (response.output ||
                 response.alternate_ad_url ||
                 response.altjs)) {
                if (window.jQuery !== undefined) {
                    window.jQuery(frame).slideDown();
                } else {
                    frame.style.display = 'block';
                }
            }
        }
    }

    function render_ad_js(response) {
        if (!response.js) { return; }
        var d = window_data.top_accessible ? top.document : window.document;
        for (var i = 0; i < response.js.length; i++) {
            var url = response.js[i];
            add_script(url, d);
        }
    }

    function render_ad_pixels(response) {
        if (!response.pixels) { return; }
        for (var i = 0; i < response.pixels.length; i++) {
            var url = response.pixels[i];
            var fimg = document.createElement("img");
            fimg.border = 0;
            fimg.style.border = 'none';
            fimg.style.display = 'none';
            fimg.width = 1;
            fimg.height = 1;
            fimg.src = url;
            document.body.appendChild(fimg);
        }
    }

    function send_event(event_name, impId, metadata) {
        var url_data = get_url_data();
        var url = '//mm.chitika.net/chewey?event='+event_name;
        url = param_concat_escape(url, 'publisher', CHITIKA.publisher);
        url = param_concat_escape(url, 'impId', impId);
        url = param_concat_escape(url, 'url', url_data.url);
        url = param_concat_escape(url, 'vsn', version);
        if (metadata) {
            for (var k in metadata) {
                var v = metadata[k];
                url = param_concat_escape(url, k, v);
            }
        }
        var pixel = new Image(1, 1);
        pixel.src = url;
        pixel.style.display = 'none';
    }

    // Define a function for setting iframe attributes from a hash. Needs to function
    // recursively for properties like style.
    function set_properties(o, p) {
        if (!o || !p) { return; }
        for (var k in p) {
            var v = p[k];
            if (v === undefined) { continue; }
            if (typeof v === 'function') { continue; }
            if (typeof v === 'object') {
                set_properties(o[k], v);
            } else {
                o[k] = v;
            }
        }
    }

    function stringify(obj) {
        if (obj instanceof Object) {
            var out = "";
            if (obj.constructor === Array) {
              for (var i = 0; i < obj.length; out += stringify(obj[i]) + ",", i++);
              return "[" + out.substr(0, out.length - 1) + "]";
            }
            if (obj.toString !== Object.prototype.toString) {
                return "\"" + obj.toString().replace(/"/g, "\\$&") + "\"";
            }
            for (var s in obj) {
                if (obj[s] === undefined) { continue; }
                out += "\"" + s.replace(/"/g, "\\$&") + "\":" + stringify(obj[s]) + ",";
            }
            return "{" + out.substr(0, out.length - 1) + "}";
      }
      return typeof obj === "string" ? "\"" + obj.replace(/"/g, "\\$&") + "\"" : String(obj);
    }

    function uuid() {
        var uuid = "", i, random;
        for (i = 0; i < 32; i++) {
            random = Math.random() * 16 | 0;
            uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
        }
        return uuid;
    }

    function visibility_check() {
        if (!window_data.top_accessible) { return; }
        var offset_h = document.documentElement.scrollTop ||
                       document.body.scrollTop;
        var viewport_size_data = get_viewport_size();
        for (var c = 0; c < CHITIKA.units.length; c++) {
            var unit = CHITIKA.units[c];
            // 1: Get info about where we are and where the unit is.
            if (!unit.already_rendered ||
                unit.already_visible ||
                unit.disable_vcpm) {
                continue;
            }
            var h = unit.height;
            var y = unit.loc.y;

            // 2: Skip if we're not 50% in that visible area.
            if (y < (offset_h - (0.5*h)) ||
                y > (offset_h + viewport_size_data.h - (0.5*h))) {
                continue;
            }

            // 3: Send event.
            var metadata = {
                'unit_id'       : c,
                'h'             : h,
                'offset_h'      : offset_h,
                'sid'           : unit.sid,
                'viewport_h'    : viewport_size_data.h,
                'viewport_w'    : viewport_size_data.w,
                'xargs'         : unit.navajo,
                'w'             : unit.width,
                'y'             : y
            };
            send_event('imp_visible', unit.impId, metadata);

            // 4: Mark as already visible.
            unit.already_visible = true;
        }
    }

    function rewrite_iframe(id, content) {
        // iframe seppuku, cannot document.write to yourself while you're busy
        setTimeout(function() {
            document.getElementById(id).contentWindow.document.write(content);
        }, 1);
    }

    append_func(window_data.top_accessible ? top : window, 'resize', handle_resize);

    if (window_data.top_accessible) {
        append_func(top, 'scroll', visibility_check);
    }

    return {
        'add_script'                : add_script,
        'already_adhesion'          : false,
        'animate'                   : animate,
        'append_func'               : append_func,
        'attach_close'              : attach_close,
        'bridge_amm'                : bridge_amm,
        'create_container'          : create_container,
        'create_spinner'            : create_spinner,
        'def'                       : def,
        'dq'                        : dq,
        'drop_it_like_its_hot'      : drop_it_like_its_hot,
        'get_screen_size'           : get_screen_size,
        'get_scroll_size'           : get_scroll_size,
        'get_snippet_data'          : get_snippet_data,
        'get_url_data'              : get_url_data,
        'get_viewport_size'         : get_viewport_size,
        'ldef'                      : ldef,
        'locate_obj'                : locate_obj,
        'make_it_so'                : make_it_so,
        'mobile_type'               : mobile_type,
        'param_concat_escape'       : param_concat_escape,
        'param_concat'              : param_concat,
        'param_concat_words'        : param_concat_words,
        'render_ad_basic'           : render_ad_basic,
        'render_ad_inject_content'  : render_ad_inject_content,
        'rewrite_iframe'            : rewrite_iframe,
        'send_event'                : send_event,
        'set_properties'            : set_properties,
        'uuid'                      : uuid,
        'window_data'               : window_data
    };
}());

if (CHITIKA_ADS.window_data.top_accessible &&
    !top.CHITIKA) {
    top.CHITIKA = CHITIKA;
    top.CHITIKA_ADS = CHITIKA_ADS;
}

CHITIKA.host                = CHITIKA_ADS.def(CHITIKA.host, 'mm.chitika.net');
CHITIKA.publisher           = CHITIKA_ADS.def(CHITIKA.publisher, undefined);
CHITIKA.snippet_count       = CHITIKA_ADS.def(CHITIKA.snippet_count, 1);
CHITIKA.snippet_length      = CHITIKA_ADS.def(CHITIKA.snippet_length, 100);
CHITIKA.snippet_priority    = CHITIKA_ADS.def(CHITIKA.snippet_priority, ['title', 'h1', 'keywords', 'description']);
CHITIKA.units               = CHITIKA_ADS.def(CHITIKA.units, []);


if (window.chitika_units !== undefined) {
    for (var c = 0; c < window.chitika_units.length; c++) {
        var unit = window.chitika_units[c];
        if (!unit) { continue; }
        CHITIKA.units.push(unit);
        window.chitika_units[c] = null;
    }
}

CHITIKA_ADS.bridge_amm();
if (!CHITIKA.no_adhesion &&
    !CHITIKA_ADS.already_adhesion &&
    CHITIKA_ADS.mobile_type() !== 0) {
    if (!CHITIKA.publisher && CHITIKA.units[0] && CHITIKA.units[0].publisher) {
        CHITIKA.publisher = CHITIKA.units[0].publisher;
    }
    if (CHITIKA.publisher) {
        CHITIKA_ADS.add_script('//cdn.chitika.net/apps/adhesion.js');
        CHITIKA_ADS.already_adhesion = true;
    }
}

var DNC = {
    'publiceduonline'       : 1,
    'olgalevin'             : 1,
    'tehatin'               : 1,
    'gamefus'               : 1,
    'popstore'              : 1,
    'gameajax'              : 1,
    'revogame'              : 1,
    'phonecall'             : 1,
    'gopalakrishna811'      : 1,
    'medialooker'           : 1,
    'mobilega'              : 1,
    'musicall'              : 1,
    'upgamesnow'            : 1,
    'gamenexon'             : 1,
    'amusespot'             : 1,
    'howsthat'              : 1,
    'movietop'              : 1,
    'revelone'              : 1,
    'alteredgamer'          : 1,
    'daily9ames'            : 1,
    'arcadegrounds'         : 1,
    'prashanthellina'       : 1,
    'mhoang14122'           : 1,
    'banglachotis'          : 1,
    'caovuong'              : 1,
    'limdee8'               : 1,
    'gamesbaby'             : 1,
}

if (CHITIKA.publisher !== undefined) {
    if ( typeof DNC[CHITIKA.publisher] === 'undefined' ) {
        CHITIKA_ADS.make_it_so();
        CHITIKA_ADS.append_func(window, 'load', CHITIKA_ADS.make_it_so);
    }
} 
else {  
    CHITIKA_ADS.make_it_so();
    CHITIKA_ADS.append_func(window, 'load', CHITIKA_ADS.make_it_so);
}