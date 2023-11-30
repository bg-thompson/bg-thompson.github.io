#version 330

// An elementary fragment shader illustrating Julia sets.
// Created by Benjamin G. Thompson on 2023.11.30.
// This is part of an online lesson available at:
// https://bgthompson.com/teaching/2023/IHS-Math-Seminar/2-9/2-9.html
//
// In order to work, the code requires various uniforms to be set,
// but the code is small enough that these can be explictly be replaced
// with constants as desired.
//
// I release the code below into the public domain.

uniform vec2 resolution;
uniform int ilimit;
uniform vec2 mouse;

void main(void) 
{
    vec2 pos = 1.5 * (2 * gl_FragCoord.xy - resolution) / resolution.y;
    vec2 nmouse = 1 * (2 * mouse.xy - resolution) / resolution.y;
    
    vec4 color1  = vec4(1,1,1,1);
    vec4 color2  = vec4(0,0,0,1);
    
    vec2 zn = pos;
    int esci = 0;
    for (int i = 0; i < ilimit; i += 1) {
        zn = vec2(zn.x * zn.x - zn.y * zn.y, 2 * zn.x * zn.y) - nmouse;
        esci += int(length(zn) <= 2.0);
    }
    float escp = log(float(esci)) / log(float(ilimit));
    
    bool in_R = length(zn) <= 2;
    
    gl_FragColor = float(in_R) * color1 + float(! in_R) * vec4(escp, 0, escp, 1);
}