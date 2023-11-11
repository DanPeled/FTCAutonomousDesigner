const gridSize = 6;
let squareSize;
let robot;
let rotationInput;
let posInput;
let convertButton;
let rotationAngle = 0;
let isDragging = false;
let dragOffset;
let tile = 0.9;
let field;
let waypoints;
let img;
let showImage = true;
let tempWaypoints;
let path = [];
let draggedWaypoint = -1;
let isPaused = false;
const speedFactor = 1.5;
const tolerance = 0.04;
let controlPressed = false;
let seasonSelect;
imagePaths = { "centerstage": '../../Images/centerstage.webp' , 'powerplay' : '../../Images/powerplay.png', 'freightfrenzy' : "../../Images/freightfrenzy.png", 'skystone': "../../Images/skystone.jpg", "ultimategoal" : "../../Images/ultimategoal.jpg"};
function setup() {
  seasonSelect = document.getElementById('season-select');
  seasonSelect.addEventListener('change', () => getImage);
  rotationAngle = 0;
  createCanvas(550, 550);
  getImage();
  squareSize = width / gridSize;
  robot = new Robot(tile + 1, 0, 40);
  waypoints = [
    new Waypoint(tile + 1, 0, 0),
    new Waypoint(tile + 1, 2.5, 90),
    new Waypoint(tile - 1, 2.5, 0),
    new Waypoint(tile - 2.5, 1, 0)
  ];
  tempWaypoints = Array.from(waypoints);
  initHTML();
}
function getImage() {
  seasonSelect = document.getElementById('season-select');
  img = loadImage(imagePaths[seasonSelect.value]);
}
function initHTML() {
  var canvas = document.querySelector('canvas');
  canvas.addEventListener('contextmenu', function (e) {
    e.preventDefault();
  });
  createP('Position (X Y):').position(10, height - 110);
  posInput = createInput(`${robot.x} ${robot.y}`);
  posInput.position(10, height - 60);
  posInput.changed(updatePos);

  createP('Rotation Angle:').position(10, height - 40);
  rotationInput = createInput(rotationAngle);
  rotationInput.position(10, height + 5);
  rotationInput.attribute("placeholder", "Enter rotation angle in degrees");
  rotationInput.changed(updateRotation);

  convertButton = createButton("Convert");
  convertButton.position(10, height + 40);
  convertButton.mousePressed(convert);
  createP('paused').position(width - 30, 560).id("pausedText");
}

function updatePos() {
  let stringedPos = posInput.value();
  let arrayedPos = stringedPos.split(" ");
  arrayedPos.forEach((item, index) => {
    arrayedPos[index] = parseFloat(item);
  });
  robot.setX(arrayedPos[0]);
  robot.setY(arrayedPos[1]);
}

function convert() {
  let x = robot.x;
  let y = robot.y;
  console.log(x, y, parseFloat(rotationInput.value()));
}

function draw() {
  document.getElementById("pausedText").innerText = isPaused ? "PAUSED" : "";
  background(220, 255);
  doPath();

  img.resize(550, 550);
  push();
  translate(width / 2, height / 2);
  rotate(-HALF_PI);
  image(img, -width / 2, -height / 2);
  pop();
  drawPath();
  drawWaypoints();
  robot.display(rotationAngle);
  if (!showImage) {
    drawGrid();
  }
}

function drawGrid() {
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      let x = (i - 3) * squareSize + width / 2;
      let y = (j - 3) * squareSize + height / 2;
      fill(100, alpha = 30);
      stroke(0, alpha = 30);
      strokeWeight(2);
      rect(x, y, squareSize, squareSize);

      fill(255, alpha = 255);
      textSize(12);
      textAlign(CENTER, CENTER);
      strokeWeight(2);
      text(`(${(i - 3 + 0.9).toFixed(2)}, ${-j + 5})`, x + squareSize / 2, y + squareSize / 2);
      strokeWeight(1);
    }
  }
}

function doPath() {
  if (!isPaused && tempWaypoints.length > 0) {
    let point = tempWaypoints[0];
    let d = 0.045 * speedFactor;
    if (rotationAngle > radians(point.angle)) {
      rotationAngle -= 0.04;
    }
    if (rotationAngle < radians(point.angle)) {
      rotationAngle += 0.04;
    }
    updateRotationInput();
    // Move the robot
    let m = createVector(point.x - robot.x, point.y - robot.y);
    m.normalize();
    robot.setX(robot.x + m.x * d);
    robot.setY(robot.y + m.y * d);

    // Check if the robot is close enough to the waypoint
    let distance = dist(robot.x, robot.y, point.x, point.y);
    if (distance < tolerance) {
      robot.setX(point.x);
      robot.setY(point.y);
      rotationAngle = radians(point.angle);
      tempWaypoints.shift();
    }
  }
}

function mousePressed() {
  isDragging = false;
  draggedWaypoint = -1;

  if (mouseButton === CENTER) {
    waypoints.push(new Waypoint(tile + 0.5, 0.5, 0));
  } else if (mouseButton === RIGHT) { // Check for right mouse button click
    for (let i = waypoints.length - 1; i >= 0; i--) {
      let waypointX = (waypoints[i].x - 3 - 0.4 + 2.5) * squareSize + width / 2 + squareSize / 2;
      let waypointY = (-waypoints[i].y - 3 + 5) * squareSize + height / 2 + squareSize / 2;
      let d = dist(mouseX, mouseY, waypointX, waypointY);
      if (d < 10) {
        waypoints.splice(i, 1); // Remove the waypoint at index i
        break;
      }
    }
  } else if (robot.checkClick()) {
    isDragging = true;
    dragOffset = createVector(mouseX - robot.x, mouseY - robot.y)
  } else {
    for (let i = 0; i < waypoints.length; i++) {
      let waypointX = (waypoints[i].x - 3 - 0.4 + 2.5) * squareSize + width / 2 + squareSize / 2;
      let waypointY = (-waypoints[i].y - 3 + 5) * squareSize + height / 2 + squareSize / 2;
      let d = dist(mouseX, mouseY, waypointX, waypointY);
      if (d < 10) {
        isDragging = true;
        draggedWaypoint = i;
        dragOffset = createVector(mouseX - waypointX, mouseY - waypointY);
        break;
      }
    }
  }
}


function mouseDragged() {
  if (isDragging) {
    if (draggedWaypoint === -1) {
      let mousePosition = createVector(mouseX, mouseY);
      let newRotationAngle = atan2(
        mousePosition.y - robot.y - dragOffset.y,
        mousePosition.x - robot.x - dragOffset.x
      );
      rotationAngle = newRotationAngle;
      updateRotationInput();
    } else {
      // Undo the canvas transformations to get the mouse position in the original coordinate system
      let canvasMouse = createVector(mouseX - 100, mouseY + 200);
      let worldMouse = canvasToWorld(canvasMouse);
      // Use dragOffset to adjust the waypoint position accurately
      waypoints[draggedWaypoint].x = constrain(worldMouse.x, -2.5, 3.3);
      waypoints[draggedWaypoint].y = constrain(worldMouse.y, -0.38, 5.3);
    }
  }
}
// Helper function to convert canvas coordinates to world coordinates
function canvasToWorld(canvasVector) {
  let inverseRotation = -rotationAngle;
  let translatedX = canvasVector.x - width / 2;
  let translatedY = canvasVector.y - height / 2;

  // Undo rotation
  let rotatedX = translatedX * cos(inverseRotation) - translatedY * sin(inverseRotation);
  let rotatedY = translatedX * sin(inverseRotation) + translatedY * cos(inverseRotation);

  // Undo translation
  let worldX = rotatedX / squareSize + 3 - 0.9;
  let worldY = -rotatedY / squareSize + 5;

  return createVector(worldX, worldY);
}

function mouseReleased() {
  isDragging = false;
  draggedWaypoint = -1;
}

function drawPath() {
  path.forEach((pos, index) => {
    stroke(140, 130);
    strokeWeight(1);
    fill(140, 130);
    ellipse(pos.x, pos.y, 10, 10);
    stroke(0);
  });
}

function drawWaypoints() {
  for (let i = 0; i < waypoints.length; i++) {
    let x = (waypoints[i].x - 3 - 0.4 + 2.5) * squareSize + width / 2 + squareSize / 2;
    let y = (-waypoints[i].y - 3 + 5) * squareSize + height / 2 + squareSize / 2;

    // Draw waypoint circle
    fill(0, 0, 255);
    ellipse(x, y, 20, 20);

    // Draw waypoint index
    fill(0);
    textSize(12);
    textAlign(CENTER, CENTER);
    text(i, x, y);

    // Draw arrow indicating direction
    drawArrow(x + 30, y, radians(waypoints[i].angle));
  }
}

function drawArrow(x, y, angle) {
  let arrowSize = 15; // Adjust this size as needed

  let arrowTip = createVector(0, -arrowSize / 2);
  let arrowBase1 = createVector(arrowTip.x - arrowSize / 4, arrowTip.y + arrowSize);
  let arrowBase2 = createVector(arrowTip.x + arrowSize / 4, arrowTip.y + arrowSize);

  push();
  translate(x, y);
  rotate(angle);

  fill(255, 0, 0);
  triangle(arrowTip.x, arrowTip.y, arrowBase1.x, arrowBase1.y, arrowBase2.x, arrowBase2.y);

  pop();
}

function keyTyped() {
  if (key === 'z') {
    showImage = !showImage;
  } else if (key === 'r') {
    restart();
  } else if (key === 'k') {
    isPaused = !isPaused;
  }
}
function keyPressed() {
  controlPressed = keyCode == CONTROL;
}
function restart() {
  var wasPaused = isPaused;
  if (!wasPaused)
    isPaused = true;
  tempWaypoints = Array.from(waypoints);
  robot.setX(tempWaypoints[0].x);
  robot.setY(tempWaypoints[0].y);
  rotationAngle = 0;
  path = [];
  if (!wasPaused)
    isPaused = false;
  doPath();
}

function updateRotation() {
  let inputAngle = parseFloat(rotationInput.value());
  if (!isNaN(inputAngle)) {
    rotationAngle = radians(inputAngle);
  }
}

function updateRotationInput() {
  let newRotationAngleDegrees = degrees(rotationAngle);
  rotationInput.value(newRotationAngleDegrees.toFixed(2));
}

let wheelSize;
let wheelOffset;
class Robot {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.wheelSize = size * 0.2;
    this.wheelOffset = size * 0.4;
    this.getPos();
    this.color = color(255, 0, 0);
  }
  setX(newX) {
    this.x = newX;
    posInput.value(`${this.x.toFixed(2)} ${this.y.toFixed(2)}`);
    var pos = createVector(this.renderX, this.renderY);
    path.push(pos);
  }
  setY(newY) {
    this.y = newY;
    posInput.value(`${this.x.toFixed(2)} ${this.y.toFixed(2)}`)
    var pos = createVector(this.renderX, this.renderY);
    path.push(pos);
  }
  getPos() {
    this.renderX =
      (this.x - 3 - 0.4 + 2.5) * squareSize + width / 2 + squareSize / 2;
    this.renderY = (-this.y - 3 + 5) * squareSize + height / 2 + squareSize / 2;
  }

  checkClick() {
    return (
      mouseX > this.renderX - this.size / 2 &&
      mouseX < this.renderX + this.size / 2 &&
      mouseY > this.renderY - this.size / 2 &&
      mouseY < this.renderY + this.size / 2
    );
  }

  display(rotationAngle) {
    this.getPos();
    push();
    translate(this.renderX, this.renderY);
    rotate(rotationAngle);

    fill(0);
    ellipse(-this.wheelOffset, this.size / 2, this.wheelSize, this.wheelSize);
    ellipse(this.wheelOffset, this.size / 2, this.wheelSize, this.wheelSize);
    ellipse(-this.wheelOffset, -this.size / 2, this.wheelSize, this.wheelSize);
    ellipse(this.wheelOffset, -this.size / 2, this.wheelSize, this.wheelSize);
    fill(this.color);
    rectMode(CENTER);
    rect(0, 0, this.size, this.size);

    stroke(255);
    let arrowSize = this.size / 2;
    let arrowTip = createVector(0, -arrowSize / 4);
    let arrowBase1 = createVector(
      arrowTip.x - arrowSize / 4,
      arrowTip.y + arrowSize / 2
    );
    let arrowBase2 = createVector(
      arrowTip.x + arrowSize / 4,
      arrowTip.y + arrowSize / 2
    );

    fill(255);
    triangle(
      arrowTip.x,
      arrowTip.y,
      arrowBase1.x,
      arrowBase1.y,
      arrowBase2.x,
      arrowBase2.y
    );

    pop();
  }
}

class Waypoint {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    this.angle = angle;
  }
}
