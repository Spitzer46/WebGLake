export default class Buffer {
  constructor(gl, program, name, type, size, normalize = false) {
    this.gl = gl;
    this.loc = gl.getAttribLocation(program, name);
    this.buffer = gl.createBuffer();
    this.type = type || gl.FLOAT;
    this.size = size;
    this.normalize = normalize;
    this.step = 0;
    this.offset = 0;
    this.arrayLength = 0;
  }

  set(data, usage = this.gl.STATIC_DRAW) {
    const gl = this.gl;
    const buffer = this.buffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, usage);
    this.arrayLength = data.length;
  }

  enable() {
    const gl = this.gl;
    const loc = this.loc;
    const size = this.size;
    const type = this.type;
    const normalize = this.normalize;
    const step = this.step;
    const offset = this.offset;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.vertexAttribPointer(loc, size, type, normalize, step, offset);
    gl.enableVertexAttribArray(loc);
  }

  dispose() {
    this.gl.deleteBuffer(this.buffer);
  }

  get count() { return this.arrayLength / this.size };
}
