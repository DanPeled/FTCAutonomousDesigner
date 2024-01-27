# FTC Autonomous Designer
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/) ![GitHub language count](https://img.shields.io/github/languages/top/DanPeled/FTCAutonomousDesigner)
---
> This JavaScript code implements a robot path planner using the p5.js library. The application provides a user interface for planning and visualizing the movement of a robot on a grid-based field.
---
## Key Components

### 1. Initialization

- The `setup` function initializes the canvas, loads images, and sets up initial configurations, including the robot's starting position and waypoints.

### 2. User Interface

- The `initHTML` function creates input fields, buttons, and event listeners to interact with the robot and waypoints.

### 3. Image Loading

- The `getImage` function loads images based on the selected season from the dropdown menu.

### 4. Robot and Waypoints

- The `Robot` class represents the robot with methods for setting its position, displaying it, and checking for user interactions.
- The `Waypoint` class defines waypoints with coordinates and angles.

### 5. Path Planning

- The `doPath` function handles the logic for moving the robot along the waypoints, adjusting rotation and position.

### 6. User Interaction

- Mouse events (`mousePressed`, `mouseDragged`, `mouseReleased`) allow users to interact with the robot and waypoints, adding, removing, or dragging them.

### 7. Drawing Functions

- Functions like `drawGrid`, `drawPath`, `drawWaypoints` handle the visualization of the grid, robot path, and waypoints.

### 8. Keyboard Shortcuts

- The `keyTyped` and `keyPressed` functions provide keyboard shortcuts for toggling image visibility, restarting, and pausing/resuming path planning.

### 9. Conversion and Input Handling

- Functions like `convert`, `updatePos`, `updateRotation`, and `updateRotationInput` handle input conversion and updating robot properties.

### 10. Restarting and Pausing

- The `restart` function resets the robot's path, and the `isPaused` variable controls whether the path planning is paused or active.
---
## Usage

1. **Adding Waypoints:**
   - Left-click on the field to add a waypoint.
   - Right-click on a waypoint to remove it.
   - Center-click / CTRL + Left-click to add a default waypoint.

2. **Moving Robot:**
   - Adjust the rotation angle using the input field.

3. **Controlling Path Planning:**
   - Toggle between different seasons using the dropdown menu.

4. **Keyboard Shortcuts:**
   - Press 'z' to toggle the field image visibility.
   - Press 'r' to restart the robot's path.
   - Press 'k' to pause or resume path planning.
---
## Customization
This code provides a foundation for a visual robot path planner, allowing users to experiment with different scenarios and field configurations.

