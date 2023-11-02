"use strict";

const canvas = document.getElementById('drawing-area');
const ctx    = canvas.getContext('2d');

canvas.width   = 500;
canvas.height  = 500;

ctx.fillStyle = "lightgray";
ctx.fillRect(0,0,500,500);

ctx.fillStyle = "crimson";
ctx.fillRect(100,100,100,100);
