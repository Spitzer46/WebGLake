export default class TextureCubeMap {
    constructor(gl, faces = null) {
        this.gl = gl;
        this.texture = gl.createTexture();
        if(faces === null) {
            const data = new Uint8Array([0, 0, 255, 255]);
            this.set([
                { target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, data, width: 1, height: 1 },
                { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, data, width: 1, height: 1 },
                { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, data, width: 1, height: 1 },
                { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, data, width: 1, height: 1 },
                { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, data, width: 1, height: 1 },
                { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, data, width: 1, height: 1 }
            ]);
        }
        else this.set(faces);
    }

    set(faces = []) {
        if(faces.length > 0) {
            const gl = this.gl;
            let generateMipmap = true;
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
            faces.forEach(face => {
                const { target, data } = face;
                let width, height;
                if(data instanceof Image) {
                    width = data.width;
                    height = data.height;
                    gl.texImage2D(target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data);
                }
                else {
                    width = face.width;
                    height = face.height;
                    gl.texImage2D(target, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
                }
                if(!this.isPowerOf2(width) || !this.isPowerOf2(height)) {
                    generateMipmap = false;
                }
            });
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            if(generateMipmap) {
                gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            }
            else {
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            }
        }
    }

    bind(unit) {
        const gl = this.gl;
        unit = unit || 0;
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
    }

    unbind(unit) {
        const gl = this.gl;
        unit = unit || 0;
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
    }

    dispose() {
        this.gl.deleteTexture(this.texture);
    }

    isPowerOf2(value) {
        return (value & (value - 1)) === 0;
    }
}