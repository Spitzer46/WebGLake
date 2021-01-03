export default class Uniform {
    constructor(gl, loc, type) {
        this.setter = null;
        this.loc = loc;
        switch(type) {
            case 0x8b50: this.setter = (l, data) => gl.uniform2fv(l, data); break;
            case 0x8b51: this.setter = (l, data) => gl.uniform3fv(l, data); break;
            case 0x8b52: this.setter = (l, data) => gl.uniform4fv(l, data); break;
            case 0x8b53: this.setter = (l, data) => gl.uniform2iv(l, data); break;
            case 0x8b54: this.setter = (l, data) => gl.uniform3iv(l, data); break;
            case 0x8b55: this.setter = (l, data) => gl.uniform4iv(l, data); break;
            case 0x8b56: this.setter = (l, data) => gl.uniform1i(l, data); break;
            case 0x8b5c: this.setter = (l, data) => gl.uniformMatrix4fv(l, false, data); break;
            case 0x8b5e: this.setter = (l, data) => gl.uniform1i(l, data); break;
            case 0x1404: this.setter = (l, data) => gl.uniform1i(l, data); break;
            case 0x1406: this.setter = (l, data) => gl.uniform1f(l, data); break;
            case 0x8B60: this.setter = (l, data) => gl.uniform1i(l, data); break;
            default:
                console.log(type);
        }
    }

    set(data) {
        if(this.setter !== null) {
            this.setter(this.loc, data);
        }
    }
}