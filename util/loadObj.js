export default function loadObj(src) {
    return new Promise((loaded, failed) => {
        const xhr = new XMLHttpRequest();
        xhr.addEventListener("load", data => loaded(readObj(data.target.response)));
        xhr.addEventListener("error", err => failed(err));
        xhr.open("GET", src);
        xhr.send();
    });
}

function createObject() {
    return { name:"", vertices:[], uv:[], normal:[] };
}

function readObj(content) {
    let finalObject = null;
    let object = null;
    const objects = [];

    content.split("\n").forEach(line => {
        const components = line.split(" ");
        switch(components[0]) {
            case "v": // vertex
                if(components.length === 4) {
                    object.vertices.push(parseFloat(components[1]));
                    object.vertices.push(parseFloat(components[2]));
                    object.vertices.push(parseFloat(components[3]));
                }
                break;
            case "vt": // uv
                if(components.length === 3) {
                    object.uv.push(parseFloat(components[1]));
                    object.uv.push(parseFloat(components[2]));
                }
                break;
            case "vn": // normal
                if(components.length === 4) {
                    object.normal.push(parseFloat(components[1]));
                    object.normal.push(parseFloat(components[2]));
                    object.normal.push(parseFloat(components[3]));
                }
                break;
            case "f": // face
                if(components.length === 4) {
                    for(let i = 1; i < components.length; ++i) {
                        const vertex = components[i];
                        const vtn = vertex.split("/");
                        if(vtn.length === 3) {
                            const vi = (parseInt(vtn[0]) - 1) * 3;
                            const ti = (parseInt(vtn[1]) - 1) * 2;
                            const ni = (parseInt(vtn[2]) - 1) * 3;
                            finalObject.vertices.push(object.vertices[vi]);
                            finalObject.vertices.push(object.vertices[vi+1]);
                            finalObject.vertices.push(object.vertices[vi+2]);
                            finalObject.uv.push(object.uv[ti]);
                            finalObject.uv.push(object.uv[ti+1]);
                            finalObject.normal.push(object.normal[ni]);
                            finalObject.normal.push(object.normal[ni+1]);
                            finalObject.normal.push(object.normal[ni+2]);
                        }
                    }
                }
                break;
            case "o": // object
                if(components.length === 2) {
                    object = createObject();
                    finalObject = createObject();
                    finalObject.name = components[1];
                    objects.push(finalObject);
                }
                break;
            case "mtllib":
                break;
            case "usemtl":
                break;
            default:
        }
    });

    return objects;
}