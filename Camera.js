import * as mat4 from "./lib/mat4.js";
import * as vec3 from "./lib/vec3.js";

const Button = { LEFT:0, MIDDLE:1, RIGHT:2 };
const Mode = { NONE:0, ROTATION:1, TRANSLATION:2 };

export default class Camera {
    constructor(config = {}) {
        this.fov = config.fov || 45;
        this.near = config.near || 1;
        this.far = config.far || 10000;
        
        this.projectionMatrix = mat4.create();
        this.modelMatrix = mat4.create();
        this.viewMatrix = mat4.create();
        this.motionlessViewMatrix = mat4.create();
        this.vec3 = vec3.create();
        this.origin = vec3.create();
        vec3.set(this.origin, 0, 8, 0);
        // vec3.set(this.origin, 10, 3, 10);

        this.factor = config.factor === undefined ? 0.1 : config.factor;
        this.zoomFactor = config.zoomFactor || 0.001;
        this.startYRot = config.startYRot || 0;

        this.mode = Mode.NONE;
        this.dtx = 0;
        this.dty = 0;
        this.ptx = 0;
        this.pty = 0;
        this.etx = 0;
        this.ety = 0;

        this.dx = 0;
        this.dy = 0;
        this.px = 0;
        this.py = 0;
        this.ex = 0;
        this.ey = 0;
        this.mx = 0;
        this.my = 0;
        this.zoom = config.zoom || 2;
        this.press = false;
        this.reflective = false;

        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseWheel = this.onMouseWheel.bind(this);
        this.onPress = this.onPress.bind(this);
        this.onRelease = this.onRelease.bind(this);

        window.addEventListener("mousemove", this.onMouseMove);
        window.addEventListener("mousewheel", this.onMouseWheel);
        window.addEventListener("mousedown", this.onPress);
        window.addEventListener("mouseup", this.onRelease);
        window.addEventListener("contextmenu", e => e.preventDefault());
    }

    computeViewMatrix() {
        // Compute view matrix
        mat4.invert(this.viewMatrix, this.modelMatrix);
    }

    perspective(aspect) {
        mat4.perspective(this.projectionMatrix, this.fov, aspect, this.near, this.far);
        return this;
    }

    loadProjectionMatrix(uniform) {
        uniform.set(this.projectionMatrix);
    }

    loadViewMatrix(uniform,  displacement = true) {
        if(displacement) {
            uniform.set(this.viewMatrix);
        }
        else {
            mat4.copy(this.motionlessViewMatrix, this.viewMatrix);
            this.motionlessViewMatrix[12] = 0;
            this.motionlessViewMatrix[13] = 0;
            this.motionlessViewMatrix[14] = 0;
            uniform.set(this.motionlessViewMatrix);
        }
    }

    loadPositionVector(uniform) {
        uniform.set(this.getPosition());
    }

    getPosition() {
        mat4.getTranslation(this.vec3, this.modelMatrix);
        return this.vec3;
    }

    onMouseMove(e) {
        const dpr = window.devicePixelRatio || 1;
        this.mx = e.clientX * dpr;
        this.my = -e.clientY * dpr;
        if(this.press) {
            if(this.mode === Mode.ROTATION) {
                this.dx += this.mx - this.px;
                this.dy += this.my - this.py;
            }
            else if(this.mode === Mode.TRANSLATION) {
                this.dtx += this.mx - this.ptx;
                this.dty += this.my - this.pty;
            }
        }
        this.px = this.mx;
        this.py = this.my;
        this.ptx = this.mx;
        this.pty = this.my;
    }

    onMouseWheel(e) {
        this.zoom += e.wheelDelta * this.zoomFactor;
    }

    onPress(e) {
        switch(e.button) {
            case Button.LEFT: 
                this.mode = Mode.ROTATION; 
                this.press = true;
                break;
            case Button.RIGHT: 
                this.mode = Mode.TRANSLATION; 
                this.press = true;
                break;
            default:
        }
    }

    onRelease(e) {
        this.press = false;
    }

    update(width, height) {
        const halfWidth = width / 2;
        const halfHeight = height / 2;
        // Rotation
        this.ex += (this.dx - this.ex) * this.factor;
        this.ey += (this.dy - this.ey) * this.factor;
        const rx = (this.ex - halfWidth) / (width / 3);
        const ry = (this.ey - halfHeight) / (height / 3);
        // Translation
        this.etx += (this.dtx - this.etx) * this.factor;
        this.ety += (this.dty - this.ety) * this.factor;
        const tx = (this.etx - halfWidth) / (width / 50);
        const ty = (this.ety - halfHeight) / (height / 50);
        vec3.set(this.origin, tx, 0, ty);

        mat4.identity(this.modelMatrix);
        mat4.translate(this.modelMatrix, this.modelMatrix, this.origin);
        mat4.rotateY(this.modelMatrix, this.modelMatrix, rx - Math.PI * 1.55);
        mat4.rotateX(this.modelMatrix, this.modelMatrix, ry - Math.PI * 1.7);
        vec3.set(this.vec3, 0, 0, this.zoom);
        mat4.translate(this.modelMatrix, this.modelMatrix, this.vec3);
        // Update matrix
        this.computeViewMatrix();
        // Reflective
        if(this.reflective) {
            vec3.set(this.vec3, 1, -1, 1);
            mat4.scale(this.viewMatrix, this.viewMatrix, this.vec3);
        }
    }

    dispose() {
        window.removeEventListener("mousemove", this.onMouseMove);
        window.removeEventListener("mousewheel", this.onMouseWheel);
        window.removeEventListener("mousedown", this.onPress);
        window.removeEventListener("mouseup", this.onRelease);
    }
}