# Puzzle Bubble

<p align="center">
  <img src='https://github.com/AfonsoCFonseca/PuzzleBubble-Game/blob/main/screenshots/header.png'>
</p>

---------------------------------------------------------------
# Structure
There are two main pillars in this game, the Player that handles the movement and shooting and the Map that handles the group of pieces drawn in the game. 
The gamemanager will handle both classes

### GameManager ###
Takes care of the Phaser.Geoms rendering for the aim lines, checking for intersections with the walls (Rectangles) and doing the math for calculated angles

### Player ###
This class handles the movement and storing of the aim lines, the shooting of new pieces and the trigger for generating new player pieces

### Piece ###
The Piece instance represent each individual piece drawn in the map. Also makes the movement animation between aiming lines when the player shoots it, calculating the speed of the ball movement and giving the necessary margin for the bounce with the walls

### Grid ###
The Grid is a singleton class created for managing all the pieces besides the player piece. It has a 2 dimensions array of Piece representing the group of pieces displayed on the map, where the x changes depending on the y position, creating a proper map pattern.
The creation is made by a randomizer of ints to pick a color when instantiating. 
The Grid is also responsible for storing invisible Pieces in the array, to represent the empty space where the player piece will fit once shooted by the player. This class also converts the player pieces to grid piece
This class is also responsible for checking for matches when the player shots a new piece

---------------------------------------------------------------
# Development
Started the development by investigating how Phaser handles aiming. Since raycasting isn't an option of native Phaser, I decided to implement it via Phaser.Geom, a light way of managing lines as aim lines with rectangles as walls and the related intersections between them. This way, was possible to calculate both points of each aim line from drawing lines and calculate hard angle options with a lot of aim lines.

Only when I reach that goal I had officialized the development of the game and pushed it to github repo.

After I started by focusing on the shooting piece, its moving animation, its deletion when reaching out of screen coords and the generation of a new one. The calculation of the speed of movement changes depending on the trajectory the ball has to travel, with that in mind, I applied the Pythagorean theorem to the subtraction of the destiny and origin point of both axis, having that I just had to multiply its value by itself and add both together and finally finding out the square root to that value. Having that result I just applied the rule of three with constants speeds and average line width to find out the final speed for dynamic lines

Created a menu scene and the logic between scene transistion. After, added the game over menu and applied the game over, start and reset game functions

After some fine-tuning and exception handling of the player movement and shooting, I started developing the map grid as a class and storing a 2D array of pieces for storing every piece on the map. Also added the randomizer of the different types of pieces in a sprite and stored it as an enum, using it on the Piece class.

The piece collision was the next phase to tackle. Added the grid pieces to a Phaser.group and listen to a collision between the group and the player pieces. If a collision is detected, the player piece animation stops and a new piece is generated. When the animation stops, another overlap collision is created between the player piece and the invisible pieces (explained in the Grid class) to understand what are the pieces that overlaps the player's in terms of space, when found a calculation is made to understand the nearest one and a movement animation is played to that same spot. When this happen the player piece is converted to a grid piece. After this steps, the system, after, checks for new matches in the Grid class, starting in the last shot piece, validating if the adjacent ones are the same color, if yes, the process repeats itself but now with that current matched piece. 

If more than 2 pieces match, the system starts the process of those pieces falling. In fact, the pieces stay in the same place and they are converted into invisible pieces, a new image is created with the same colour (with a grey setTint) in the same positions and it's then animated to move down on the screen until it's destroyed when reaches the end of the screen

Decided to fix some bugs and make the trigger that starts the gameover logic. To trigger, I validate every time a piece is set into the grid and if that piece has Y position bigger than 12, where 12 represents the max_size of the array height, then every piece in the currentGrid is set to invisible and for each of them, a new grey image is created above it. After a few seconds, the Gameover screen pops up.

Applied the logic for the fallen pieces after a match. After matching, I check the map for pieces that might be separated from the rest of the grid. This search system checks if every piece in the map is connected to another related to one of the top pieces of the map.
If it is, it's pushed to an array, in the end, I run the array and compare it to every existent piece, if there are pieces that don't belong to that array it means they are isolated and they should fall just after the matching pieces that fell previously

---------------------------------------------------------------
# Sketches & Evolution

 <p float="left">
   <img width="195" height="255" src='https://github.com/AfonsoCFonseca/PuzzleBubble-Game/blob/main/screenshots/05_08_22.png' >
   <img width="195" height="255" src='https://github.com/AfonsoCFonseca/PuzzleBubble-Game/blob/main/screenshots/09_08_22.png' >
   <img width="195" height="255" src='https://github.com/AfonsoCFonseca/PuzzleBubble-Game/blob/main/screenshots/20_08_22.png' >
 </p>
