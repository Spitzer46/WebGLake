import Display from "./Display.js"
import Camera from "./Camera.js";
import WaterMesh from "./water/WaterMesh.js";
import { SkyboxMesh } from "./skybox/SkyboxMesh.js";
import FrameBuffer from "./FrameBuffer.js";
import MeshLoaded from "./mesh/MeshLoaded.js";
import * as mat4 from "./lib/mat4.js";
import Light from "./Light.js";
import ParticleRenderer from "./particule/ParticleRenderer.js";

const gl = Display.init({ alpha:true, antialias:false });
gl.clearColor(0.95, 0.95, 0.95, 1.0);
gl.enable(gl.DEPTH_TEST);
gl.enable(gl.CULL_FACE);

const reflectionFrameBuffer = new FrameBuffer(gl);
const refractionFrameBuffer = new FrameBuffer(gl);
const reflectionPass = [];
const refractionPass = [];
const renderPass = [];
const camera = new Camera({ near:1, far:2000, zoomFactor:0.005, zoom:50 });

const sun = new Light(-270.0, 300.0, -500.0);
const skyBox = new SkyboxMesh(gl);
const water = new WaterMesh(gl);
const dune = new MeshLoaded(
  gl,
  "../model/Desert/dune.obj",
  "../model/Desert/desert.png",
  "../model/Desert/desert_normal.png");
mat4.fromTranslation(dune.model, [0, -2, 0]);
mat4.scale(dune.model, dune.model, [80, 80, 80]);
const particleSystem = new ParticleRenderer(gl);
reflectionFrameBuffer.attachement(water.reflectionTexture);
refractionFrameBuffer.attachement(water.refractionTexture);
reflectionPass.push(skyBox, dune);
refractionPass.push(dune);
renderPass.push(skyBox, dune, water, particleSystem);

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
	if(Display.isResized) {
		camera.perspective(Display.aspect);
	}
	// Reflection pass
	reflectionFrameBuffer.bind();
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	camera.reflective = true;
	camera.update(Display.width, Display.height);
	for(const mesh of reflectionPass) {
		if(mesh.ready) {
		mesh.render(camera, sun, 0);
		}
	}
	reflectionFrameBuffer.unbind();
	// Refraction pass
	refractionFrameBuffer.bind();
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	camera.reflective = false;
	camera.update(Display.width, Display.height);
	for(const mesh of refractionPass) {
		if(mesh.ready) {
		mesh.render(camera, sun, 1);
		}
	}
	refractionFrameBuffer.unbind();
	// Render pass
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	for(const mesh of renderPass) {
		if(mesh.ready) {
			mesh.update(ellapsed, camera);
			mesh.render(camera, sun, 2);
		}
	}
}
requestAnimationFrame(animate);