export default class FrameBuffer {
    constructor(gl) {
        this.gl = gl;
        this.frameBuffer = gl.createFramebuffer();
        this.depthBuffer = gl.createRenderbuffer();
        this.target = null;
    }

    attachement(target, attachmentPoint) {
        const gl = this.gl;
        this.target = target;
        attachmentPoint = attachmentPoint === undefined ? gl.COLOR_ATTACHMENT0 : attachmentPoint;
        // Attachement 0
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, target.texture, 0);
        // Depth buffer
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, target.width, target.height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depthBuffer);
    }

    bind() {
        if(this.target !== null) {
            const gl = this.gl;
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
            gl.viewport(0, 0, this.target.width, this.target.height);
        }
    }

    unbind() {
        const gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    }

    dispose() {
        this.gl.deleteFramebuffer(this.frameBuffer);
    }
}