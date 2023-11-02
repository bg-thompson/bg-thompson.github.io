"use strict";

const canvas = document.getElementById('drawing-area');
const ctx    = canvas.getContext('2d');

const slength = 700;
canvas.width  = slength;
canvas.height = slength;

// Colors from
// https://www.w3.org/TR/SVG11/types.html#ColorKeywords

// Ridiculous javascript crap to stop canvas zoom.
const scale   = window.devicePixelRatio;
canvas.width  = slength * scale;
canvas.height = slength * scale;
ctx.scale(scale,scale);
canvas.style.width  = slength + 'px';
canvas.style.height = slength + 'px';

ctx.fillStyle = "lightgray";
ctx.fillRect(0,0,500,500);

ctx.fillStyle = "crimson";
const a = 100;
const b = 200;
ctx.beginPath();
ctx.moveTo(0,0);
ctx.lineTo(2 * a, 0);
ctx.lineTo(a + b, a);
ctx.closePath();
ctx.fill();
