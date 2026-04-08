Create a game about matrix inversion in react-native with expo. manage state in zustand and setup ci/cd and analytics like in github.com/nikhedonia/lineball


# Game:

The user sees two NxN Matrix modulo m=2 eg.:


Target:

1 | 0 | 1
0 | 1 | 0
0 | 1 | 1


Current:

1 | 0 | 0
0 | 1 | 0
0 | 0 | 1


Where the number is mapped to a color. 1 = black, 0 = white
m might be bigger in which case we adopt the color palete.

The goal is to transform the current matrix to the target matrix.
The user can only add rows or columns by clicking on buttons to select a column/row and apply it to another column/row (columns to columns and rows to rows)


The UI should be just an extended matrix with buttons in the first row / column
and general stats, timers and game menu


Add a start screen where the user can configure the difficoulty and game modes.
Either 1 off or "race" where the user selects a starting difficoulty and a time (1, 3, 5mins) and the goal is to solve as many as possible.

