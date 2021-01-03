import Display from "./Display.js"
import Camera from "./Camera.js";
import WaterMesh from "./water/WaterMesh.js";
import BoxMesh from "./cube/BoxMesh.js";
import { SkyboxMesh } from "./skybox/SkyboxMesh.js";
import FrameBuffer from "./FrameBuffer.js";
import loadObj from "./util/loadObj.js";
import MeshLoaded from "./mesh/MeshLoaded.js";
import * as mat4 from "./lib/mat4.js";

const gl = Display.init({ alpha:false, antialias:false });
gl.clearColor(0.95, 0.95, 0.95, 1.0);
gl.enable(gl.DEPTH_TEST);
gl.enable(gl.CULL_FACE);

const reflectionFrameBuffer = new FrameBuffer(gl);
const firstPass = [];
const secondPass = [];
const camera = new Camera({ near:1, far:2000, zoomFactor:0.005, zoom:50 });

const skyBox = new SkyboxMesh(gl);
const water = new WaterMesh(gl);
const box = new BoxMesh(gl);
// const palm = new MeshLoaded(
//   gl, 
//   "../model/Coconut_palm/coconut_palm.obj", 
//   "../model/Coconut_palm/palm_stem_palm_stem_BaseColor.png", 
//   "../model/Coconut_palm/palm_stem_palm_stem_Normal.png");
  
// mat4.fromTranslation(palm.model, [0, 10, -20]);
const dune = new MeshLoaded(
  gl,
  "../model/Desert/dune.obj",
  "../model/Desert/desert.png",
  "../model/Desert/desert_normal.png");
mat4.fromTranslation(dune.model, [0, -2, 0]);
mat4.scale(dune.model, dune.model, [80, 80, 80]);
reflectionFrameBuffer.attachement(water.reflectionTexture);
firstPass.push(skyBox, dune);
secondPass.push(skyBox, dune, water);

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
      mesh.render(camera, 0);
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
      mesh.render(camera, 2);
    }
  }
}
requestAnimationFrame(animate);