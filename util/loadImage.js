export default function loadImage(src) {
    const args = [...arguments];
    return new Promise((loaded, failed) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.addEventListener("load", () => loaded({ img, args:args.slice(1) }));
        img.addEventListener("error", err => failed(err));
        img.src = src;
    });
}