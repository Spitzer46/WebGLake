import Display from "./Display.js"
import Camera from "./Camera.js";
import WaterMesh from "./water/WaterMesh.js";
import BoxMesh from "./cube/BoxMesh.js";
import { SkyboxMesh } from "./skybox/SkyboxMesh.js";
import FrameBuffer from "./FrameBuffer.js";

const gl = Display.init({ alpha:false, antialias:false });
gl.clearColor(0.95, 0.95, 0.95, 1.0);
gl.enable(gl.DEPTH_TEST);
gl.cullFace(gl.BACK);

const reflectionFrameBuffer = new FrameBuffer(gl);
const firstPass = [];
const secondPass = [];
const camera = new Camera({ near:0.01, zoomFactor:0.00025, zoom:5 });

const skyBox = new SkyboxMesh(gl);
const water = new WaterMesh(gl);
const box = new BoxMesh(gl);
reflectionFrameBuffer.attachement(water.reflectionTexture);
firstPass.push(skyBox, box);
secondPass.push(skyBox, box, water);

let prevTimestamp = performance.now();
let nextTimeFps = performance.now();
const fpsCounter = document.getElementById("fpsCounter"); 

function animate(timestamp) {
  requestAnimationFrame(animate);
  // Compute ellapse time of this frame
  const ellapsed = timestamp - prevTimestamp;
  prevTimestamp = timestamp;
  // Update fps counter every 250 milliseconds
  if(timestamp > nextTimeFps) {
    fpsCounter.innerHTML = `${Math.floor(1000 / ellapsed)} fps`;
    nextTimeFps = timestamp + 250;
  }
  // Update perspective
  if (Display.isResized) {
    camera.perspective(Display.aspect);
  }
  // Reflection pass
  reflectionFrameBuffer.bind();
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  camera.reflective = true;
  camera.update(Display.width, Display.height);
  for(const mesh of firstPass) {
    if(mesh.ready) {
      mesh.render(camera);
    }
  }
  reflectionFrameBuffer.unbind();
  // Render pass
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  camera.reflective = false;
  camera.update(Display.width, Display.height);
  for(const mesh of secondPass) {
    if(mesh.ready) {
      mesh.update(ellapsed);
      mesh.render(camera);
    }
  }
}
requestAnimationFrame(animate);