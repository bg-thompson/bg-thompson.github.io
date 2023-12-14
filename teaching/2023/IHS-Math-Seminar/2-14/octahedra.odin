package octahedron

// A simple Odin/raylib program which draws some octahedra.
//
// Created by Benjamin G. Thompson on 2023.12.13
//
// This is part of an online lesson available at:
// https://bgthompson.com/teaching/2023/IHS-Math-Seminar/2-14/2-14.html
//
// In order to work, the code requires several areas marked ??? to be
// correctly filled in.
//
// I release this code into the public domain.

import rl   "vendor:raylib"
import      "core:time"
import m    "core:math"
import rm   "core:math/rand"

Vec3  :: rl.Vector3

Triangle :: struct{
    a, b, c : Vec3,
    color   : rl.Color,
}

P0 :: Vec3{ 0, -1,  0}
P1 :: Vec3{ 1,  0,  0}
P2 :: Vec3{ 0,  0,  1}
P3 :: Vec3{-1,  0,  0}
P4 :: Vec3{ 0,  0, -1}
P5 :: ??? // What's the final coordinate of this octahedron?

Octahedron_Triangles :: [8] Triangle{
    {P0, P1, P2, {  0,   0,   0, 255}},
    {P0, P2, P3, {  0,   0, 255, 255}},
    {P0, P3, P4, {  0, 255,   0, 255}},
    {P0, P4, P1, {  0, 255, 255, 255}}, // This data contains the coordinates
    {   ???    , {255,   0,   0, 255}}, // of the eight triangles forming
    {   ???    , {255,   0, 255, 255}}, // the octahedron, four of which have already
    {   ???    , {255, 255,   0, 255}}, // been specified. What are the corner combinations
    {   ???    , {255, 255, 255, 255}}, // of the other four triangles?
}

main :: proc() {
    rl.InitWindow(1920,1080,"Octahedra")
    defer rl.CloseWindow()

    moving_camera := rl.Camera3D{
        position = {0, 1, 5},
        target   = {0, 0, 0},
        up       = {0, 1, 0},
        fovy     = 45,
        projection = rl.CameraProjection.PERSPECTIVE,
    }

    // Create some random locations to draw octahedra.
    OCT_NUM :: 50
    random_positions : [OCT_NUM] Vec3
    for i in 0..<OCT_NUM {
        random_positions[i].x = rm.float32()
        random_positions[i].y = rm.float32()
        random_positions[i].z = rm.float32()
        random_positions[i] *= 4
        random_positions[i] -= 2
    }

    // Create random rotation speeds for the octahedra.
    random_rotation_speeds : [OCT_NUM] f32
    for i in 0..<OCT_NUM {
        random_rotation_speeds[i] = rm.float32()
    }

    watch : time.Stopwatch
    time.stopwatch_start(&watch)
    
    rl.SetTargetFPS( ??? ) // This should be set to the refresh rate of
                           // your monitor / screen in frames per second.
                           // What is that? (If you don't already know, you
                           // may need to ask a friend or do an internet search
                           // to find out how to determine this number.)
    for ! rl.WindowShouldClose() {

        raw_duration := time.stopwatch_duration(watch)
        seconds      := time.duration_seconds(raw_duration)
        theta        := f32(seconds)

        // Update camera position.
        moving_camera.position = {5 * m.cos(0.49 * theta), 0, 5 * m.sin(0.21 * theta)}

        // Start drawing.
        rl.BeginDrawing()
        rl.BeginMode3D(moving_camera)
        rl.ClearBackground( ??? ) // What should we set the background color to?

        // Draw the octahedrons.
        for pos, i in random_positions {
            draw_octahedron(pos, 0.2, (0.5 + random_rotation_speeds[i]) * f32(seconds))
        }

        rl.EndMode3D()
        rl.EndDrawing()
    }
}

draw_octahedron :: proc(pos : Vec3, size : f32, theta : f32) {
    octahedron_triangles := Octahedron_Triangles
    rotation_matrix := matrix[3, 3] f32{
        // The following is a matrix that we'll use to rotate the
        // octahedra. Most of the entries are not filled in, what
        // should they be?
        //
        // HINT: Check out the Wikipedia page on basic 3D rotations:
        // https://en.wikipedia.org/wiki/Rotation_matrix#Basic_3D_rotations
        // The matrix below is a rotation through the y-axis.
        m.cos(theta),    0, -m.sin(theta),
                ??? , ??? , ??? ,
                ??? , ??? , ??? ,
    }
    for tri in octahedron_triangles {
        draw_triangle(size * rotation_matrix * tri.a + pos,
                      size * rotation_matrix * tri.b + pos,
                      size * rotation_matrix * tri.c + pos,
                      tri.color)
    }
}

draw_triangle :: proc(a, b, c : Vec3, color : rl.Color) {
    rl.DrawTriangle3D(a, b, c, color)
    rl.DrawTriangle3D(a, c, b, color)
}
