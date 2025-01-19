// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
`attribute vec4 a_Position;
 attribute vec4 a_Color;
  uniform float u_Size;
   varying vec4 v_Color;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
    v_Color = a_Color;
  }`


// Fragment shader program
var FSHADER_SOURCE =
`precision mediump float;
 uniform vec4 u_FragColor;
 uniform bool u_UseVertexColor;
 varying vec4 v_Color;
 void main() {
   gl_FragColor = u_UseVertexColor ? v_Color : u_FragColor;
 }`;



//global
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_UseVertexColor;


function setupWebGL(){
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", {preserveDrawingBuffer : true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

function connectVariablesToGLSL(){
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if (a_Position < 0 || a_Color < 0) {
    console.error('Failed to get storage location of attributes.');
    return;
  }

  // // Get the storage location of a_Position
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_UseVertexColor = gl.getUniformLocation(gl.program, 'u_UseVertexColor');
if (u_UseVertexColor === null) {
  console.log('Failed to get the storage location of u_UseVertexColor');
  return;
}


}
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let isPacmanDrawn = false; // Flag to track Pac-Man state
let g_selectedColor=[1.0, 1.0, 1.0, 1.0];
let g_selectsize = 5;
let g_selectsegment = 10
let g_selecType = POINT;

function addActionsForHtmlUI(){
   //button
   document.getElementById('green').onclick = function() { g_selectedColor = [0.0, 1.0, 0.0, 1.0]; };
   document.getElementById('red').onclick = function() { g_selectedColor = [1.0, 0.0, 0.0, 1.0]; };
   document.getElementById('clearButton').onclick = function() { g_shapeList = []; renderAllShapes();gl.clearColor(0.0, 0.0, 0.0, 1.0);gl.clear(gl.COLOR_BUFFER_BIT);};

   document.getElementById('pointButton').onclick = function() {g_selecType = POINT};
   document.getElementById('triButton').onclick = function() {g_selecType = TRIANGLE};
   document.getElementById('circleButton').onclick = function() {g_selecType = CIRCLE};
   document.getElementById('pacmanButton').addEventListener('click', () => {drawPacman();});

   //slider
   document.getElementById('redSlide').addEventListener('mouseup', function() {g_selectedColor[0] = this.value/100;});
   document.getElementById('greenSlide').addEventListener('mouseup', function() {g_selectedColor[1] = this.value/100;});
   document.getElementById('blueSlide').addEventListener('mouseup', function() {g_selectedColor[2] = this.value/100;});
   document.getElementById('alphaSlide').addEventListener('mouseup', function() {g_selectedColor[3] = this.value/100;});
   //size
   document.getElementById('sizeSlide').addEventListener('mouseup', function() {g_selectsize = this.value;});
   document.getElementById('segmentsSlide').addEventListener('mouseup', function() {g_selectsegment = this.value;});
 }


function main() {

  setupWebGL();
  connectVariablesToGLSL()
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) {if(ev.buttons == 1) { click(ev)}};

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapeList = [];


let prevMousePosition = null; // To track the previous mouse position

function click(ev) {
  [x, y] = convertCoordinatesEventToGL(ev);

  if (prevMousePosition) {
    // Interpolate points between the last and current positions
    const [prevX, prevY] = prevMousePosition;
    const distance = Math.sqrt((x - prevX) ** 2 + (y - prevY) ** 2);
    const numSteps = Math.ceil(distance / 0.01); // Adjust step size as needed

    for (let i = 1; i <= numSteps; i++) {
      const t = i / numSteps;
      const interpX = prevX + t * (x - prevX);
      const interpY = prevY + t * (y - prevY);

      addPointToShapeList(interpX, interpY);
    }
  }

  // Add the current point
  addPointToShapeList(x, y);

  prevMousePosition = [x, y];
  renderAllShapes();
  canvas.onmouseup = () => {
    prevMousePosition = null;
  };
}

function addPointToShapeList(x, y) {
  let point;
  if (g_selecType == POINT) {
    point = new Point();
  } else if (g_selecType == TRIANGLE) {
    point = new Triangle();
  } else {
    point = new Circle();
    point.segments = g_selectsegment;
  }
  point.position = [x, y];
  point.color = g_selectedColor.slice();
  point.size = g_selectsize;
  g_shapeList.push(point);
}

// Reset the previous position on mouse up


 function convertCoordinatesEventToGL(ev){
   var x = ev.clientX; // x coordinate of a mouse pointer
   var y = ev.clientY; // y coordinate of a mouse pointer
   var rect = ev.target.getBoundingClientRect();

   x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
   y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
   return ([x,y]);
 }

 function renderAllShapes() {
   // Clear <canvas>
   var startTime = performance.now();
 for (let shape of g_shapeList) {
   if (shape.type === 'pacman') {
     gl.uniform1i(u_UseVertexColor, true);
   } else {
     gl.uniform1i(u_UseVertexColor, false);
     gl.uniform4f(u_FragColor, shape.color[0], shape.color[1], shape.color[2], shape.color[3]);
   }
   shape.render();
 }
 var duration = performance.now() - startTime;
 sendTextToHTML("numdot: " + g_shapeList.length + "ms: " + Math.floor(duration) + "fps: " + Math.floor(10000 / duration) / 10, "numdot");

}


function sendTextToHTML(text, htmlID){
  var htmlElm = document.getElementById(htmlID);
  if(!htmlElm){
    console.log("Failed to get" + htmlID + "from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}

function drawPacman() {
  g_shapeList = []; renderAllShapes();gl.clearColor(0.0, 0.0, 0.0, 1.0);gl.clear(gl.COLOR_BUFFER_BIT);
  const pacman = new Pacman();
  g_shapeList.push(pacman); // Add to the list of shapes
  renderAllShapes(); // Re-render all shapes
}
