import Uniform from "./Uniform.js";
import Buffer from "./Buffer.js";
import loadScript from "./util/loadScript.js";

export default class Shader {
    static async fromScripts(gl, vertexShaderUrl, fragShaderUrl) {
        const vertexShaderSrc = await loadScript(vertexShaderUrl);
        const fragShaderSrc = await loadScript(fragShaderUrl);
        return new Shader(gl, vertexShaderSrc, fragShaderSrc);
    }

    constructor(gl, vertexShaderSrc, fragShaderSrc) {
        this.gl = gl;
        this.program = this.createProgram(vertexShaderSrc, fragShaderSrc);
        this.uniforms = {};
        this.attributeInfos = {};
        // Uniforms
        const uniformCount = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS);
        for(let i = 0; i < uniformCount; ++i) {
            const uniform = gl.getActiveUniform(this.program, i);
            const loc = gl.getUniformLocation(this.program, uniform.name);
            this.uniforms[uniform.name] = new Uniform(gl, loc, uniform.type);
        }
        // Attributes
        const attribCount = gl.getProgramParameter(this.program, gl.ACTIVE_ATTRIBUTES);
        for(let i = 0; i < attribCount; ++i) {
            const attrib = gl.getActiveAttrib(this.program, i);
            this.attributeInfos[attrib.name] = attrib;
        }
    }

    generateAttributes() {
        const gl = this.gl;
        const attributes = {};
        for (const [attribName, attribInfo] of Object.entries(this.attributeInfos)) {
            const normalize = attribInfo.type === gl.UNSIGNED_BYTE;
            let type = 0, size =  0;
            switch(attribInfo.type) {
                case gl.FLOAT_VEC2: type = gl.FLOAT; size = 2; break;
                case gl.FLOAT_VEC3: type = gl.FLOAT; size = 3; break;
                case gl.FLOAT_VEC4: type = gl.FLOAT; size = 4; break;
                case gl.INT_VEC2: type = gl.INT; size = 2; break;
                case gl.INT_VEC3: type = gl.INT; size = 3; break;
                case gl.INT_VEC4: type = gl.INT; size = 4; break;
                case gl.BOOL_VEC2: type = gl.BOOL; size = 2; break;
                case gl.BOOL_VEC3: type = gl.BOOL; size = 3; break;
                case gl.BOOL_VEC4: type = gl.BOOL; size = 4; break;
                default:
            }
            attributes[attribName] = new Buffer(gl, this.program, attribName, gl.STATIC_DRAW, type, size, normalize);
        }
        return attributes;
    }

    createProgram(vertexShaderSrc, fragShaderSrc) {
        const gl = this.gl;
        const vertexShader = this.loadShader(vertexShaderSrc, gl.VERTEX_SHADER);
        const fragmentShader = this.loadShader(fragShaderSrc, gl.FRAGMENT_SHADER);
        if(vertexShader === null || fragmentShader === null) {
            return null;
        }
        const program = gl.createProgram();
        if(program === null) {
            return null;
        }
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
        if(!linked) {
            const error = gl.getProgramInfoLog(program);
            console.warn('failed to link program: ' + error);
            gl.deleteProgram(program);
            gl.deleteShader(fragmentShader);
            gl.deleteShader(vertexShader);
            return null;
        }
        return program;
    }
  
    loadShader(source, type) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        if(shader === null) {
            console.warn("unable to create shader");
            return null;
        }
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if(!compiled) {
            const error = gl.getShaderInfoLog(shader);
            console.warn('failed to compile shader: ' + error);
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    enable() {
        const gl = this.gl;
        if(gl.shaderUsed !== this.program) {
            gl.useProgram(this.program);
            gl.shaderUsed = this.program;
        }        
    }

    dispose() {
        this.gl.deleteProgram(this.program);
    }
}