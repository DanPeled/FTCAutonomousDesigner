const gridSize = 6;
const speedFactor = 1.5;
const tolerance = 0.04;
let squareSize, robot, rotationInput, posInput, downloadButton, uploadButton, rotationAngle = 0;
let isDragging = false, dragOffset, tile = 0.9, halfTile = 0.4404 / 2, field, waypoints;
let img, showImage = true, tempWaypoints, path = [], draggedWaypoint = -1, isPaused = false, container;
let controlPressed = false, seasonSelect;
const minX = -3.5, maxX = 2.3, minY = -0.176, maxY = 5.6;
let lastTime = 0;
let delayTime = 0; // 60 frames delay (adjust as needed)
const imagePaths = {
  "centerstage": 'Images/centerstage.webp',
  'powerplay': 'Images/powerplay.png',
  'freightfrenzy': "Images/freightfrenzy.png",
  'skystone': "Images/skystone.jpg",
  "ultimategoal": "Images/ultimategoal.jpg"
};
function setup() {
  posInput = document.getElementById('posInput');
  seasonSelect = document.getElementById('season-select');
  seasonSelect.addEventListener('change', () => getImage);
  rotationAngle = 0;
  createCanvas(550, 550);
  getImage();
  squareSize = width / gridSize;
  robot = new Robot(tile, halfTile, 40);
  waypoints = [
    new Waypoint(tile, halfTile, 0, "", 0),
    new Waypoint(tile, 2.5, 90, "", 0),
    new Waypoint(tile - 2, 2.5, 0, "", 0),
    new Waypoint(tile - 3.5, 1 + halfTile, 0, "", 0)
  ];
  tempWaypoints = Array.from(waypoints);
  initHTML();
}
function getImage() {
  seasonSelect = document.getElementById('season-select');
  try {
    img = loadImage(imagePaths[seasonSelect.value]);
  }
  catch {
    img = loadImage(imagePaths['centerstage'])
  }
}
function initHTML() {
  var canvas = document.querySelector('canvas');
  canvas.addEventListener('contextmenu', function (e) {
    e.preventDefault();
  });
  canvas.setAttribute('alt', 'FIELD IMAGE GOES HERE')
  updateWaypointInputFields();
}

function updatePos() {
  let posInput = document.getElementById('posInput');
  let values = posInput.value.split(' ');
  robot.setX(parseFloat(values[0]));
  robot.setY(parseFloat(values[1]));
}

function downloadPath() {
  // Convert JSON to a string
  const jsonString = JSON.stringify(waypoints, null, 2);

  // Create a Blob with the JSON content
  const blob = new Blob([jsonString], { type: "application/json" });

  // Create a download link
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "pathname.path";

  // Append the link to the body
  document.body.appendChild(a);

  // Trigger a click on the link to start the download
  a.click();

  // Remove the link from the DOM
  document.body.removeChild(a);
}
function loadPath() {
  // Get the file input element
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.style.display = "none";
  // Listen for the change event on the file input
  fileInput.addEventListener('change', function () {
    // Check if a file is selected
    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];

      // Create a FileReader
      const reader = new FileReader();

      // Define a callback function to handle the file reading
      reader.onload = function (e) {
        try {
          // Parse the JSON content
          const jsonData = JSON.parse(e.target.result);

          // Use the jsonData as needed
          waypoints = jsonData;
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }

        // Remove the file input after processing
        document.body.removeChild(fileInput);
      };

      // Read the file as text
      reader.readAsText(file);
    } else {
      alert('Please select a file.');

      // Remove the file input if no file is selected
      document.body.removeChild(fileInput);
    }
  });

  // Trigger a click on the file input to open the file dialog
  document.body.appendChild(fileInput);
  fileInput.click();
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
    let currentTime = frameCount;

    if (currentTime - lastTime > delayTime) {
      let d = 0.045 * speedFactor;
      let point = tempWaypoints[0];
      // Gradually rotate towards the target angle
      rotationAngle = lerp(rotationAngle, radians(point.angle), 0.04);
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
        updateRotationInput();
        lastTime = currentTime; // Update lastTime for the delay
        delayTime = point.waitTime * 60;
      }
    }
  }
}
function calculateWaypointX(x) {
  return (x - 3 - 0.4 + 2.5 + 1) * squareSize + width / 2 + squareSize / 2;
}
function calculateWaypointY(y) {
  return (-y - 3 + 5 + (0.4404 / 2)) * squareSize + height / 2 + squareSize / 2;
}
function mousePressed() {
  isDragging = false;
  draggedWaypoint = -1;

  if (mouseButton === CENTER) {
    let canvasMouse = createVector(mouseX - 250, mouseY + 200);
    let worldMouse = canvasToWorld(canvasMouse);

    waypoints.push(new Waypoint(constrain(worldMouse.x, minX, maxX), constrain(worldMouse.y, minY, maxY), 0));
  } else if (mouseButton === RIGHT) { // Check for right mouse button click
    for (let i = waypoints.length - 1; i >= 0; i--) {
      let waypointX = calculateWaypointX(waypoints[i].x)
      let waypointY = calculateWaypointY(waypoints[i].y);
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
      let waypointX = calculateWaypointX(waypoints[i].x)
      let waypointY = calculateWaypointY(waypoints[i].y);
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
      let canvasMouse = createVector(mouseX - 250, mouseY + 200);
      let worldMouse = canvasToWorld(canvasMouse);
      // Use dragOffset to adjust the waypoint position accurately
      waypoints[draggedWaypoint].x = constrain(worldMouse.x, minX, maxX);
      waypoints[draggedWaypoint].y = constrain(worldMouse.y, minY, maxY);
      updateWaypointInputFields();
    }
  }
}
// Helper function to convert canvas coordinates to world coordinates
function canvasToWorld(canvasVector) {
  let translatedX = canvasVector.x - width / 2;
  let translatedY = canvasVector.y - height / 2;

  // Undo translation
  let worldX = translatedX / squareSize + 3 - 0.9;
  let worldY = -translatedY / squareSize + 5;

  return createVector(worldX, worldY);
}


function mouseReleased() {
  isDragging = false;
  draggedWaypoint = -1;
}

function drawPath() {
  for (let i = 0; i < waypoints.length; i++) {
    if (i > 0) {
      let x = calculateWaypointX(waypoints[i].x);
      let y = calculateWaypointY(waypoints[i].y);
      let prevx = calculateWaypointX(waypoints[i - 1].x);
      let prevy = calculateWaypointY(waypoints[i - 1].y);

      strokeWeight(4);
      stroke(255);
      line(x, y, prevx, prevy);
      stroke(0);
      strokeWeight(1);
    }
  }
}
function drawWaypoints() {
  for (let i = 0; i < waypoints.length; i++) {
    let x = calculateWaypointX(waypoints[i].x);
    let y = calculateWaypointY(waypoints[i].y);

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
  let rotationInput = document.getElementById('rotationInput');
  rotationAngle = radians(parseFloat(rotationInput.value));
}

function updateRotationInput() {
  let rotationInput = document.getElementById('rotationInput');
  rotationInput.value = parseFloat(degrees(rotationAngle).toFixed(2));
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
    this.color = color(2, 136, 2);
  }
  setX(newX) {
    this.x = newX;
    posInput.value = (`${this.x.toFixed(2)} ${this.y.toFixed(2)}`);
    var pos = createVector(this.renderX, this.renderY);
    path.push(pos);
  }
  setY(newY) {
    this.y = newY;
    posInput.value = (`${this.x.toFixed(2)} ${this.y.toFixed(2)}`)
    var pos = createVector(this.renderX, this.renderY);
    path.push(pos);
  }
  getPos() {
    this.renderX = calculateWaypointX(this.x);
    this.renderY = calculateWaypointY(this.y);
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
  constructor(x, y, angle, description, waitTime) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.waitTime = waitTime;
    this.description = description;
  }
}
function updateWaypointInputFields() {
  let index = parseInt(document.getElementById('waypoint-edit-waypointnum').value);
  document.getElementById("waypoint-edit-waypointx").value = waypoints[index].x;
  document.getElementById("waypoint-edit-waypointy").value = waypoints[index].y;
  document.getElementById("waypoint-edit-waypointangle").value = waypoints[index].angle;
  document.getElementById('waypoint-edit-description').value = waypoints[index].description;
}
function updateWayPointValues() {
  let index = parseInt(document.getElementById('waypoint-edit-waypointnum').value);
  waypoints[index].x = constrain(document.getElementById("waypoint-edit-waypointx").value, minX, maxX);
  waypoints[index].y = constrain(document.getElementById("waypoint-edit-waypointy").value, minY, maxY);
  waypoints[index].angle = document.getElementById("waypoint-edit-waypointangle").value;
  waypoints[index].description = document.getElementById('waypoint-edit-description').value;
  updateWaypointInputFields();
}
async function wait(sec) {
  return new Promise(resolve => {
    setTimeout(resolve, sec * 1000);
  });
}