package shaderdemo

import rl "vendor:raylib"
import f  "core:fmt"
import    "core:time"

main :: proc() {
    rl.InitWindow(1000, 1000, "Four shaders")
    defer rl.CloseWindow()

    // Load shaders.
    gradient_shader_code     :: #load("color-gradient.glsl", cstring)
    disks_shader_code        :: #load("disks.glsl", cstring)
    checkerboard_shader_code :: #load("checkerboard.glsl", cstring)
    julia_sets_shader_code   :: #load("julia-sets.glsl", cstring)
    gradient_shader     := rl.LoadShaderFromMemory(nil, gradient_shader_code)
    disks_shader     := rl.LoadShaderFromMemory(nil, disks_shader_code)
    checkerboard_shader := rl.LoadShaderFromMemory(nil, checkerboard_shader_code)
    julia_sets_shader   := rl.LoadShaderFromMemory(nil, julia_sets_shader_code)

    // Start a clock.
    watch : time.Stopwatch
    time.stopwatch_start(&watch)
    // The variable we'll set the uniform time to.
    seconds : f32
    
    // Get uniform location of uniforms in shaders.
    disks_time_loc   := rl.GetShaderLocation(disks_shader, "time")
    julia_sets_time_loc := rl.GetShaderLocation(julia_sets_shader, "time")
    assert(disks_time_loc != -1) // rl.GetShaderLocation returns -1 if str not found.
    assert(julia_sets_time_loc != -1) 

    rl.SetTargetFPS(60)
    
    for ! rl.WindowShouldClose() {

        raw_duration := time.stopwatch_duration(watch)
        seconds = f32(time.duration_seconds(raw_duration))
        
        // Set time uniforms.
        rl.SetShaderValue(disks_shader,
                          cast(rl.ShaderLocationIndex) disks_time_loc,
                          &seconds,
                          .FLOAT)

        rl.SetShaderValue(julia_sets_shader,
                          cast(rl.ShaderLocationIndex) julia_sets_time_loc,
                          &seconds,
                          .FLOAT)
        
        rl.BeginDrawing()
        
        rl.ClearBackground(rl.GRAY)
        
        rl.BeginShaderMode(gradient_shader)        
        rl.DrawRectangle(0,0,500,500,rl.BLACK)
        rl.EndShaderMode()
        
        rl.BeginShaderMode(checkerboard_shader)
        rl.DrawRectangle(0,500,500,500,rl.BLACK)
        rl.EndShaderMode()

        rl.BeginShaderMode(disks_shader)
        rl.DrawRectangle(500,0,500,500,rl.BLACK)
        rl.EndShaderMode()

        rl.BeginShaderMode(julia_sets_shader)
        rl.DrawRectangle(500,500,500,500,rl.BLACK)
        rl.EndShaderMode()
        
        rl.EndDrawing()
    }
}
