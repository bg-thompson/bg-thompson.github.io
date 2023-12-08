#version 330

// An elementary fragment shader illustrating a checkerboard pattern.
// Created by Benjamin G. Thompson on 2023.11.30.
// This is part of an online lesson available at:
// https://bgthompson.com/teaching/2023/IHS-Math-Seminar/2-12/2-12.html
//
// I release the code below into the public domain.

void main(void) 
{
    vec2 resolution = vec2(1000,1000);
    float screen_ratio = resolution.y / resolution.x;
    float xc = 2 * gl_FragCoord.x / resolution.x - 1;
    xc /= screen_ratio;
    float yc = 2 * gl_FragCoord.y / resolution.y - 1;
    
    vec4 color1  = vec4(1,1,1,1);
    vec4 color2  = vec4(0,0,0,1);
    
    bool in_R = (int(floor(8 * xc)) + int(floor(8 * yc))) % 2 == 0;
    
    gl_FragColor = float(in_R) * color1 + float(! in_R) * color2;
}
