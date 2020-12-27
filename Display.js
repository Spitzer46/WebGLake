export default {
    init(options = {}) {
      this.canvas = document.createElement("canvas");
      this.gl = this.canvas.getContext("webgl", options);
      if(this.gl === null) {
        return null;
      }
      document.body.appendChild(this.canvas);
      this.resized = false;
      this.resize();
      window.addEventListener("resize", this.resize.bind(this));
      return this.gl;
    },
    resize() {
      const dpr = window.devicePixelRatio || 1;
      this.width = this.canvas.offsetWidth * dpr;
      this.height = this.canvas.offsetHeight * dpr;
      this.aspect = this.width / this.height;
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      const gl = this.gl;
      gl.viewport(0, 0, this.width, this.height);
      this.resized = true;
    },
    get isResized() {
      if(this.resized) {
        this.resized = false;
        return true;
      }
      return false;
    }
  }