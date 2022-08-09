# Puzzle Bubble

<!-- <p align="center">
  <img src='https://github.com/AfonsoCFonseca/Bejeweled-Game/blob/main/screenshots/ImageBorderGithub.png'>
</p> -->

---------------------------------------------------------------
# Structure
There are two main pillars in this game, the Player that handles the movement and shooting and the Map that handles the group of pieces drawn in the game. 
The gamemanager will handle both classes

### GameManager ###
Takes care of the Phaser.Geoms rendering for the aim lines, checking for intersections with the walls (Rectangles) and doing the math for calculated angles

### Player ###
This class handles the movement and storing of the aim lines,  the shooting of new pieces

### Piece ###
The Piece instance represent each individual piece drawn in the map. Also makes the movement animation between aiming lines when the player shoots it, calculating the speed of the ball movement and giving the necessary margin for the bounce with the walls

---------------------------------------------------------------
# Development
Started the development by investigating how Phaser handles aiming. Since raycasting isn't an option of native Phaser, I decided to implement it via Phaser.Geom, a light way of managing lines as aim lines with rectangles as walls and the related intersections between them. This way, was possible to calculate both points of each aim line from drawing lines and calculate hard angle options with a lot of aim lines.

Only when I reach that goal I had officialized the development of the game and pushed it to github repo.

After I started by focusing on the shooting piece, its moving animation, its deletion when reaching out of screen coords and the generation of a new one. The calculation of the speed of movement changes depending on the trajectory the ball has to travel, with that in mind, I applied the Pythagorean theorem to the subtraction of the destiny and origin point of both axis, having that I just had to multiply its value by itself and add both together and finally finding out the square root to that value. Having that result I just applied the rule of three with constants speeds and average line width to find out the final speed for dynamic lines

---------------------------------------------------------------
# Sketches & Evolution

 <p float="left">
   <img width="235" height="255" src='https://github.com/AfonsoCFonseca/PuzzleBubble-Game/blob/main/screenshots/05_08_22.png' >
   <img width="235" height="255" src='https://github.com/AfonsoCFonseca/PuzzleBubble-Game/blob/main/screenshots/09_08_22.png' >
 </p>
