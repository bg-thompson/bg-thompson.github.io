// This code generates a multiplication table for octonions in Odin.
// Created by Benjamin Thompson (github: bg-thompson)
// Last updated: 2022.08.28
// Created for educational purposes. Used verbatim, it is
// probably unsuitable for production code.

package octonions

import   "core:fmt"
import u "core:unicode/utf8"
import s "core:strings"

quat :: [4] int  // Our 'integer' quaternion type.
oct  :: [2] quat // Our 'integer' octonion type.

// Standard basis for the quaternions.
id  :: quat{ 1, 0, 0, 0}
i   :: quat{ 0, 1, 0, 0}
j   :: quat{ 0, 0, 1, 0}
k   :: quat{ 0, 0, 0, 1}
zq  :: quat{ 0, 0, 0, 0}

// Create the standard basis for the octonions (from Cayley-Dickson construction).
a :: oct{id, zq }
b :: oct{ i, zq }
c :: oct{ j, zq }
d :: oct{ k, zq }
e :: oct{ zq, id}
f :: oct{ zq, i }
g :: oct{ zq, j }
h :: oct{ zq, k }

// Simple quaternion multiplication.
qm  :: proc( x,y : quat ) -> (z : quat ) {
    a, b, c, d :    = x[0], x[1], x[2], x[3]
    e, f, g, h :    = y[0], y[1], y[2], y[3]
    z[0]            = a*e - b*f - c*g - d*h
    z[1]            = a*f + b*e + c*h - d*g
    z[2]            = a*g + c*e + d*f - b*h
    z[3]            = a*h + d*e + b*g - c*f
    return
}

// Simple quaternion transpose.
qt :: proc ( x : quat ) -> ( z : quat ) {
    z[0], z[1], z[2], z[3] = x[0], -x[1], -x[2], -x[3]
    return
}

// Octonian multiplication, defined using the standard multiplication from Cayley-Dickson
om :: proc ( x, y : oct) -> ( z : oct) {
    a, b := x[0], x[1]
    c, d := y[0], y[1]
    z[0] = qm(a,c) - qm(qt(d),b)
    z[1] = qm(d,a) + qm(b,qt(c))
    return 
}

main :: proc() {
    // Automatic overloading of +,-,* for fixed-length numerical arrays.
    assert(id + 2*i + 3*j + 4*k == quat{1,2,3,4})
    
    // Testing of quaternion multiplication procedures.
    fmt.println("Testing multiplication of standard basis i,j,k...")
    fmt.println("ij  ==  k:", qm(i,j) == k)
    fmt.println("jk  ==  i:", qm(j,k) == i)
    fmt.println("ki  ==  j:", qm(k,i) == j)
    fmt.println("ijk == -1:", qm(qm(i,j),k) == -1*id)
    fmt.println("j * {1,2,3,4} == {-3,4,1,-2}:",
		qm(j,quat{1,2,3,4}) == quat{-3,4,1,-2})
    // These parse the expected tests.

    make_simple_table()

    make_formatted_table()
}

make_simple_table :: proc() {
    // Create a map from the octonions to the letters they represent.
    basis_char_map := make(map[oct] rune)
    basis_char_map[a] = '0'
    basis_char_map[b] = '1'
    basis_char_map[c] = '2'
    basis_char_map[d] = '3'
    basis_char_map[e] = '4'
    basis_char_map[f] = '5'
    basis_char_map[g] = '6'
    basis_char_map[h] = '7'

    fmt.println("A simple octonion multiplication table:")
    for ei in basis_char_map {
	fmt.println("")
	for ej in basis_char_map {
	    prod  := om(ei, ej)
	    // Code to express product in the basis.
	    // Assume the product will be of the form +- e_k.
	    char_p, pos_ok := basis_char_map[prod]
	    char_n, neg_ok := basis_char_map[-1*prod]
	    if pos_ok { fmt.printf(" %c ", char_p) }
	    if neg_ok { fmt.printf("-%c ", char_n) }
	    if !pos_ok && !neg_ok {
		fmt.println("\nERROR: A product was not of the form +- e_k !")
	    }
	}
    }
    fmt.println("\n")
}

make_formatted_table :: proc() {
    // create a map from the octonions to the letters they represent.
    basis_char_map := make(map[oct] rune)
    basis_char_map[a] = '1'
    basis_char_map[b] = 'i'
    basis_char_map[c] = 'j'
    basis_char_map[d] = 'k'
    basis_char_map[e] = 'a'
    basis_char_map[f] = 'b'
    basis_char_map[g] = 'c'
    basis_char_map[h] = 'd'

    // Write the main procedure which will do the calculations needed to generate
    // the table.

    SPACE_AROUND_RESULT :: 1
    ROW_WIDTH           :: 2*SPACE_AROUND_RESULT + 2 + 1
    TABLE_WIDTH         :: 10*ROW_WIDTH          + 2
    
    // First compute the rows with data; later print these out in the context of the
    // wider table.
    computed_rows     : [8] string
    curr_computed_row := 0
    // NOTE: Rows start off with a | rune!
    oct_x_num := 0
    for oct_x in basis_char_map {
	defer oct_x_num += 1

	rune_row : [10*ROW_WIDTH + 2] rune // The +2 is for the | and \n characters at the row's end.
	// Print out gap followed by oct_1, as well as the final characters in the row.
	for i in 0..2*ROW_WIDTH { rune_row[i]   = ' ' }
	for i in 0..1           { rune_row[ROW_WIDTH*i] = '|' }
	rune_row[ROW_WIDTH + SPACE_AROUND_RESULT + 2] = basis_char_map[oct_x]
	rune_row[10*ROW_WIDTH] = '|'
	rune_row[10*ROW_WIDTH + 1] = '\n'
	if oct_x_num == 3 {
	    rune_row[2 + SPACE_AROUND_RESULT] = 'x'
	}
	// Now do the actual calculation, and print out the row.
	// NOTE: iterating x, y over the map iterates over the key, then value.
	i := 0 // oct_y index.
	for oct_y in basis_char_map {
	    defer { i += 1 }
            rune_row[(2 + i)*ROW_WIDTH] = ' '
	    if i == 0 { rune_row[2*ROW_WIDTH] = '|' }
	    for j in 1..SPACE_AROUND_RESULT {
		rune_row[(2 + i)*ROW_WIDTH + j]					= ' '
		rune_row[(2 + i)*ROW_WIDTH + SPACE_AROUND_RESULT + 2 + j]	= ' '
	    }

	    // Determine whether or not the multiplication gives a - result by
	    // trying to look it up in the basis_char_map.
	    // If it returns, it has the right sign.
            p_prod, p_ok := basis_char_map[om(oct_x,oct_y)]
            n_prod, n_ok := basis_char_map[-om(oct_x,oct_y)]
            if p_ok {
		// Positive, so preface the character with a ' '.
                rune_row[(2 + i)*ROW_WIDTH + SPACE_AROUND_RESULT + 1] = ' '
                rune_row[(2 + i)*ROW_WIDTH + SPACE_AROUND_RESULT + 2] = p_prod
            }
            if n_ok {
		// Negative, so preface the character with a '-'.
                rune_row[(2 + i)*ROW_WIDTH + SPACE_AROUND_RESULT + 1] = '-'
                rune_row[(2 + i)*ROW_WIDTH + SPACE_AROUND_RESULT + 2] = n_prod
            }
        }
	computed_rows[curr_computed_row] = u.runes_to_string(rune_row[:])
	curr_computed_row                += 1
    }

    // Print out the final table!
    fmt.println("A formatted octonion multiplication table:")
    dash_row_array      : [TABLE_WIDTH] rune = { 0..TABLE_WIDTH-2 = '-', TABLE_WIDTH-1 = '\n' }
    dash_row_string     := u.runes_to_string(dash_row_array[:])
    fmt.printf("%s", dash_row_string)

    // Print out the top row.
    top_row_array : [TABLE_WIDTH] rune = { 0..TABLE_WIDTH-1 = ' ' }
    top_row_array[0] = '|'
    top_row_array[2*ROW_WIDTH] = '|'
    top_row_array[TABLE_WIDTH-2] = '|'
    top_row_array[TABLE_WIDTH-1] = '\n'
    top_row_array[5*ROW_WIDTH + SPACE_AROUND_RESULT + 2] = 'y'
    top_row_str := u.runes_to_string(top_row_array[:])

    fmt.printf("%s", top_row_str)

    // Dividing row
    dividing_row := dash_row_array
    for i in 1..2*ROW_WIDTH-1 { dividing_row[i] = ' ' }
    dividing_row[ROW_WIDTH - 1] = 'x'
    dividing_row[ROW_WIDTH + 0] = '*'
    dividing_row[ROW_WIDTH + 1] = 'y'

    dividing_str := u.runes_to_string(dividing_row[:])
    fmt.printf("%s", dividing_str)
    
    // Create the oct_y label row.
    space_array : [TABLE_WIDTH] rune = { 0..TABLE_WIDTH-1 = ' ' }
    for i in 0..10 { space_array[i*ROW_WIDTH] = '|' }
    space_array[TABLE_WIDTH - 1] = '\n'
    space_array[ROW_WIDTH] = ' '
    c_ind := 0
    for c in basis_char_map {
	defer c_ind += 1
	space_array[(2 + c_ind)*ROW_WIDTH + 3] = basis_char_map[c]
    }
    oct_y_label_row := u.runes_to_string(space_array[:])


    fmt.printf("%s", oct_y_label_row)
    fmt.printf("%s", dash_row_string)
    for str in computed_rows {
	fmt.printf(str)
    }

    // Print the last row.
    fmt.printf("%s", dash_row_string)
}

