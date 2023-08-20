"use strict";
// TODO: What does the above do?

const main_canvas = document.getElementById('drawing-area');
const canvas_ctx  = main_canvas.getContext('2d');

// Text to be formatted by the .wasm
const text_main_equation    = document.getElementById('overlay_text_main_equation');
const text_button_true      = document.getElementById('overlay_text_button_true');
const text_button_false     = document.getElementById('overlay_text_button_false');

var equation_number = 0;

async function init() {
    // Default dims, adjust dynamically.

    // Set display size in css pixels. (Whatever they are.)
    main_canvas.style.width  = window.innerWidth;
    main_canvas.style.height = window.innerHeight;
    // Set display size in terms of pixels computed.
    const scale = window.devicePixelRatio;
    console.log("DEBUG: window.devicePixelRatio:", scale);
    main_canvas.width  = scale * window.innerWidth;
    main_canvas.height = scale * window.innerHeight;
    // Normalize coordinate system to use CSS pixels.
    canvas_ctx.scale(scale,scale);
    console.log("Hellope!")
    // set default error message to bug in case we get a module-level error
    const memory = new WebAssembly.Memory({ initial: 2000, maximum: 65536 });

    try {
	window.wasm = await window.odin.runWasm(`draw.wasm`, null, memory, {
	    js: {
                _set_canvas_dims(w,h) {
                    main_canvas.width  = w;
                    main_canvas.height = h;
                },
                _draw_rect(x, y, w, h, red, green, blue, alpha) {
                    canvas_ctx.fillStyle = `rgba(${255*red}, ${255*green}, ${255*blue}, ${alpha})`;
                    canvas_ctx.fillRect(x - 0.5 * w, y - 0.5 * h, w, h);
                },
                _format_overlay_text(text_type, xpos, ypos, size, color_enum, vis_enum) {
                    // Note: for whatever crappy .js reason, switches don't seem to work.
                    var stext = text_main_equation; // selected text.
                    if (text_type == 1) {
                        stext = text_button_true;
                    }
                    if (text_type == 2) {
                        stext = text_button_false;
                    }
                    stext.style.left = `${xpos}px`;
                    stext.style.top = `${ypos}px`;
                    stext.style.fontSize = `${size}px`;
                    if (color_enum == 0) {
                        stext.style.color = "black";
                    } else if (color_enum == 1) {
                        stext.style.color = "white";
                    } else {
                        stext.style.color = "magenta";
                    }
                    if (vis_enum == 0) {
                        stext.style.visibility = "hidden";
                    } else {
                        stext.style.visibility = "visible";
                    }
                }
            },
        });
    } catch (e) {
	console.error(e);
	return;
    }
    // Call procs whenever the mouse moves or is down.
    main_canvas.addEventListener('mousemove', updateMouseMov);
    main_canvas.addEventListener('mousedown', notifyMouseDown);
    main_canvas.addEventListener('touchstart', notifyTouchStart);

    // For touchscreens.
    function notifyTouchStart(touchEvent) {
        touchEvent.preventDefault();
        var xpos = touchEvent.touches[0].pageX;
        var ypos = touchEvent.touches[0].pageY;
        console.log("Touchevent", xpos, ypos) // @debug
        window.wasm.notify_mouse_pressed(xpos, ypos);
    }

    // For desktop devices.
    function notifyMouseDown(mouseEvent) {
        var xpos = mouseEvent.offsetX;
        var ypos = mouseEvent.offsetY;
        console.log("Mousedownevent", xpos, ypos) // @debug
        window.wasm.notify_mouse_pressed(xpos, ypos);
    }

    function updateMouseMov(mouseEvent) {
        var xpos = mouseEvent.offsetX;
        var ypos = mouseEvent.offsetY;
        window.wasm.update_mouse_pos(xpos,ypos);
    }
    
    // Call procs whenever the window is resized.
    function updateCanvasDims() {
        var cwidth = window.innerWidth;
        var chidth = window.innerHeight;
        main_canvas.style.width  = `${cwidth}px`
        main_canvas.style.height = `${chidth}px`
        // Set display size in terms of pixels computed.
        main_canvas.width  = scale * window.innerWidth;
        main_canvas.height = scale * window.innerHeight;
        // Normalize coordinate system to use CSS pixels.
        canvas_ctx.scale(scale,scale);
        window.wasm.update_canvas_dims(cwidth, chidth);
    }

    window.addEventListener('resize', updateCanvasDims);
    
    function drawFrame() {
        canvas_ctx.clearRect(0,0,main_canvas.width, main_canvas.height);
        window.wasm.render_canvas();
        window.requestAnimationFrame(drawFrame);
    }
    // Set the initial canvas dims.
    updateCanvasDims()

    // Start the rendering!
    window.requestAnimationFrame(drawFrame);
}

init();
