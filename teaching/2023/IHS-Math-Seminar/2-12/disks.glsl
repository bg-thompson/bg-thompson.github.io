#version 330

// An elementary fragment shader illustrating orbiting disks.
// Created by Benjamin G. Thompson on 2023.11.30.
// This is part of an online lesson available at:
// https://bgthompson.com/teaching/2023/IHS-Math-Seminar/2-12/2-12.html
//
// In order to work, the code requires various uniforms to be set,
// but the code is small enough that these can be explictly be replaced
// with constants as desired.
//
// I release the code below into the public domain.

uniform float time;

void main(void) 
{
    vec2 resolution = vec2(1000,1000);
    vec2 mouse      = vec2(750,750);
    
    float screen_ratio = resolution.y / resolution.x;
    float xc = 2 * gl_FragCoord.x / resolution.x - 1;
    xc /= screen_ratio;
    float yc = 2 * gl_FragCoord.y / resolution.y - 1;
    
    float mousex = 2 * mouse.x / resolution.x - 1;
    mousex /= screen_ratio;
    float mousey = 2 * mouse.y / resolution.y - 1;
    vec2  nmouse = vec2(mousex, mousey); 
    
    vec4 color1  = vec4(xc,yc,1,1);
    vec4 color2  = vec4(0,0,0,1);
    
    vec2 pixpos = vec2(xc,yc);
    const float disk_radius = 0.075;
    vec2 disk_center = nmouse;
    bool in_R = distance(disk_center, pixpos) <= disk_radius;
    
    float angle = 5 * time;
    const float pi = 3.14159;
    vec2 small_disk_center = disk_center + 0.2 * vec2(cos(angle),sin(angle));
    vec2 small_disk_center2 = disk_center + 0.2 * vec2(cos(angle + 2*pi/3),sin(angle + 2*pi/3));
    vec2 small_disk_center3 = disk_center + 0.2 * vec2(cos(angle + 4*pi/3),sin(angle + 4*pi/3));
    bool small_disk = distance(small_disk_center, pixpos) <= 0.3 * disk_radius;
    bool small_disk2 = distance(small_disk_center2, pixpos) <= 0.3 * disk_radius;
    bool small_disk3 = distance(small_disk_center3, pixpos) <= 0.3 * disk_radius;
    bool in_disks = in_R || small_disk || small_disk2 || small_disk3;
    
     gl_FragColor = float(in_disks) * color1 + float(! in_disks) * color2;
}
