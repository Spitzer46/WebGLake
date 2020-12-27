export default function loadScript(url) {
    return new Promise((loaded, failed) => {
        const xhr = new XMLHttpRequest();
        xhr.addEventListener("load", data => loaded(data.target.response));
        xhr.addEventListener("error", err => failed(err));
        xhr.open("GET", url);
        xhr.send();
    });
}