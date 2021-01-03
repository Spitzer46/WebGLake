export default class Texture {
    static load(gl, src, options = {}) {
        const texture = new Texture(gl);
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.addEventListener("load", () => texture.set({ data:img, width:img.width, height:img.height, ...options }));
        img.addEventListener("error", err => console.warn(err));
        img.src = src;
        return texture;
    }

    constructor(gl, options = {}) {
        this.gl = gl;
        this.texture = gl.createTexture();
        this.width = 0;
        this.height = 0;
        this.set(options);
    }

    set(options = {}) {
        const gl = this.gl;
        const minFilter = options.minFilter || gl.LINEAR;
        const magFilter = options.maxFilter || gl.LINEAR;
        const wraps = options.wraps || gl.CLAMP_TO_EDGE;
        const wrapt = options.wrapt || gl.CLAMP_TO_EDGE;
        const format = options.format || gl.RGBA;
        const type = options.type || gl.UNSIGNED_BYTE;
        const data = options.data || null;
        let width = options.width || 1;
        let height = options.height || 1;
        let mip = false;

        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        if(data === null) {
            let defaultData = null;
            if(width === 1 && height === 1) {
                defaultData = new Uint8Array([0, 0, 255, 255]);
            }
            gl.texImage2D(gl.TEXTURE_2D, 0, format, width, height, 0, format, type, defaultData);
        }
        else {
            gl.texImage2D(gl.TEXTURE_2D, 0, format, format, type, data);
            width = data.width;
            height = data.height;
            mip = true;
        }
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wraps);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapt);
        if(mip && this.isPowerOf2(width) && this.isPowerOf2(height)) {
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            const ext = gl.getExtension("EXT_texture_filter_anisotropic");
            if(ext !== null) {
                const amoung = gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
                gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, amoung);
            }
        }
        else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);
        }
        this.width = width;
        this.height = height;
    }

    bind(unit) {
        const gl = this.gl;
        unit = unit || 0;
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
    }

    unbind(unit) {
        const gl = this.gl;
        unit = unit || 0;
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    dispose() {
        this.gl.deleteTexture(this.texture);
    }

    isPowerOf2(value) {
        return (value & (value - 1)) === 0;
    }
}