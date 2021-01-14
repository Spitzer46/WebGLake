export default class InstanciedBuffer {
    constructor(gl, ext, program, name, type, normalize = false) {
        this.gl = gl;
        this.ext = ext;
        this.loc = gl.getAttribLocation(program, name);
        this.buffer = gl.createBuffer();
        this.type = type || gl.FLOAT;
        this.normalize = normalize;
        this.dim = 0;
        this.isMatrix = false;
        this.bytesPerRow = 0;
        this.bytesPerCount = 0;
    }

    allocate(dim = 3, isMatrix = false, count = 1, bytesPerElement = Float32Array.BYTES_PER_ELEMENT, usage = this.gl.DYNAMIC_DRAW) {
        const gl = this.gl;
        this.dim = dim;
        this.isMatrix = isMatrix;
        this.bytesPerRow = dim * bytesPerElement;
        this.bytesPerCount = this.bytesPerRow * (isMatrix ? dim : 1);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, count * this.bytesPerCount, usage);
    }

    set(data) {
        const gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, data);
    }

    enable(state = true) {
        const gl = this.gl;
        const ext = this.ext;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        if(state) {        
            if(this.isMatrix) {
                for(let i = 0; i < this.dim; ++i) {
                    const loc = this.loc + i;
                    const offset = i * this.bytesPerRow;
                    gl.vertexAttribPointer(
                        loc,
                        this.dim,
                        this.type,
                        this.normalize,
                        this.bytesPerCount,
                        offset
                    );
                    gl.enableVertexAttribArray(loc);
                    ext.vertexAttribDivisorANGLE(loc, 1);
                }
            }
            else {
                gl.vertexAttribPointer(this.loc, this.dim, this.type, this.normalize, 0, 0);
                gl.enableVertexAttribArray(this.loc);
                ext.vertexAttribDivisorANGLE(this.loc, 1);
            }
        }
        else {
            if(this.isMatrix) {
                for(let i = 0; i < this.dim; ++i) {
                    const loc = this.loc + i;
                    ext.vertexAttribDivisorANGLE(loc, 0);
                }
            }
            else {
                ext.vertexAttribDivisorANGLE(this.loc, 0);
            }
        }
    }

    dispose() {
        this.gl.deleteBuffer(this.buffer);
    }
}