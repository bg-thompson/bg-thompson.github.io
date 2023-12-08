#version 330

// An elementary fragment shader illustrating color gradients.

void main(void) 
{
    vec2 resolution = vec2(1000,1000);
    float xratio = 2 * gl_FragCoord.x / resolution.x - 1;
    float yratio = 2 * gl_FragCoord.y / resolution.y - 1;

    gl_FragColor = vec4(vec3(xratio * xratio, abs(yratio), 0.5), 1);
}
