"use strict";
// TODO: What does the above do?

const main_canvas = document.getElementById('drawing-area');
const canvas_ctx  = main_canvas.getContext('2d');

// Text to be formatted by the .wasm
const text_main_equation    = document.getElementById('overlay_text_main_equation');
const text_problem_number   = document.getElementById('overlay_text_problem_number');
const text_button_true      = document.getElementById('overlay_text_button_true');
const text_button_false     = document.getElementById('overlay_text_button_false');
const text_incorrect        = document.getElementById('overlay_text_incorrect');
const text_button_try_again = document.getElementById('overlay_text_try_again');
const text_button_menu1     = document.getElementById('overlay_text_menu1');
const text_button_menu2     = document.getElementById('overlay_text_menu2');
const text_button_menu3     = document.getElementById('overlay_text_menu3');

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
                _draw_circle(cx, cy, r, red, green, blue, alpha) {
                    canvas_ctx.fillStyle = `rgba(${255*red}, ${255*green}, ${255*blue}, ${alpha})`;
                    canvas_ctx.beginPath();
                    canvas_ctx.arc(cx, cy, r, 0, 2 * Math.PI);
                    canvas_ctx.fill();
                },
                _draw_triangle(p1x, p1y, p2x, p2y, p3x, p3y, red, green, blue, alpha) {
                    canvas_ctx.fillStyle = `rgba(${255*red}, ${255*green}, ${255*blue}, ${alpha})`;
                    canvas_ctx.beginPath();
                    canvas_ctx.moveTo(p1x, p1y);
		    canvas_ctx.lineTo(p2x, p2y);
                    canvas_ctx.lineTo(p3x, p3y);
                    canvas_ctx.fill();
                },
                _draw_etriangle(px, py, l, red, green, blue, alpha) {
                    const SQRT3 = 1.73205;
                    canvas_ctx.fillStyle = `rgba(${255*red}, ${255*green}, ${255*blue}, ${alpha})`;
                    canvas_ctx.beginPath();
                    canvas_ctx.lineTo(px - 0.5 * l, py + 0.5 / SQRT3 * l);
                    canvas_ctx.lineTo(px + 0.5 * l, py + 0.5 / SQRT3 * l);
                    canvas_ctx.lineTo(px,           py - 1.0 / SQRT3 * l);
                    canvas_ctx.fill();
                },
                _draw_hexagon(px, py, l, red, green, blue, alpha) {
                    const SQRT3 = 1.73205;
                    canvas_ctx.fillStyle = `rgba(${255*red}, ${255*green}, ${255*blue}, ${alpha})`;
                    canvas_ctx.beginPath();
                    canvas_ctx.moveTo(px + l,       py);
		    canvas_ctx.lineTo(px + 0.5 * l, py + 0.5 * SQRT3 * l);
                    canvas_ctx.lineTo(px - 0.5 * l, py + 0.5 * SQRT3 * l);
                    canvas_ctx.lineTo(px - l,       py);
                    canvas_ctx.lineTo(px - 0.5 * l, py - 0.5 * SQRT3 * l);
                    canvas_ctx.lineTo(px + 0.5 * l, py - 0.5 * SQRT3 * l);
                    canvas_ctx.fill();
                },
                // TODO: Rename this to something which also indicates it updates the index.
                _choose_math_text(index) {
                    if (0 <= index && index < possible_equations.length) {
                        text_main_equation.innerHTML = possible_equations[index];
                        equation_number = index + 1;
                    }
                },
                _format_overlay_text(text_type, xpos, ypos, size, color_enum, vis_enum) {
                    // Note: for whatever crappy .js reason, switchs don't seem to work.
                    var stext = text_main_equation; // selected text.
                    if (text_type == 1) {
                        stext = text_problem_number;
                        text_problem_number.innerHTML = `Ex. ${equation_number}`
                    }
                    if (text_type == 2) {
                        stext = text_button_true;
                    }
                    if (text_type == 3) {
                        stext = text_button_false;
                    }
                    if (text_type == 4) {
                        stext = text_incorrect;
                    }
                    if (text_type == 5) {
                        stext = text_button_try_again;
                    }
                    if (text_type == 6) {
                        stext = text_button_menu1;
                    }
                    if (text_type == 7) {
                        stext = text_button_menu2;
                    }
                    if (text_type == 8) {
                        stext = text_button_menu3;
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
                /*
                  _render_hardcoded_text(xpos, ypos, size, red, green, blue, alpha) {
                    canvas_ctx.font = `${size}px 'Montserrat'`
                    canvas_ctx.fillStyle = `rgba(${255*red}, ${255*green}, ${255*blue}, ${alpha})`;
                    canvas_ctx.fillText("Colors", xpos, ypos)
                }
                */
            },
        });
    } catch (e) {
	console.error(e);
	return;
    }
    const p = window.wasm.test_add(1.0,2.0);
    console.log(p)

    // Call procs whenever the mouse moves or is down.
    main_canvas.addEventListener('mousemove', updateMouseMov);
    main_canvas.addEventListener('mousedown', notifyMouseDown);
    main_canvas.addEventListener('mouseup',   notifyMouseUp);

    function updateMouseMov(mouseEvent) {
        var xpos = mouseEvent.offsetX;
        var ypos = mouseEvent.offsetY;
        window.wasm.update_mouse_pos(xpos,ypos);
    }

    function notifyMouseDown(mouseEvent) {
        window.wasm.notify_mouse_down();
    }

    function notifyMouseUp(mouseEvent) {
        window.wasm.notify_mouse_up();
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
