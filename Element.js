export default class Element {
    constructor(gl, usage, type) {
        this.gl = gl;
        this.usage = usage || gl.STATIC_DRAW;
        this.type = type || gl.UNSIGNED_SHORT;
        this.buffer = gl.createBuffer();
        this.count = 0;
        this.offset = 0;
    }

    set(data) {
        const gl = this.gl;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, this.usage);
        this.count = data.length;
    }

    enable() {
        const gl = this.gl;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer);
    }

    draw(drawMode) {
        const gl = this.gl;
        const mode = drawMode || gl.TRIANGLES;
        gl.drawElements(mode, this.count, this.type, this.offset);
    }

    dispose() {
        this.gl.deleteBuffer(this.buffer);
    }
}