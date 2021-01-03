export default function loadMtl(src) {
    return new Promise((loaded, failed) => {
        const xhr = new XMLHttpRequest();
        xhr.addEventListener("loaded", data => loaded(readObj(data.target.response)));
        xhr.addEventListener("error", err => failed(err));
        xhr.open("GET", src);
        xhr.open();
    });
}

function readObj(content) {
    content.split("\n").forEach(line => {
        const components = line.split(" ");
        switch(components[0]) {
            case "newmtl": // New material
                break;
            default:
        }
    });
    return {};
}