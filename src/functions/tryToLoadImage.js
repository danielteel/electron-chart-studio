function fileName(path) {
    const start=Math.max(path.lastIndexOf('\\'), path.lastIndexOf('/'))+1;
    return path.substr(start, path.lastIndexOf('.')-start);
}



//  Returns a promise that will resolve to image name if image was succesfully load and will resolve to null if unable to
//  onLoad is called when image is loaded, an object is passed that looks like {
//      name: fileName of loaded image, if name already exists and image is different, a number is appened (file2, file3, file4, etc...). If image is the same, the image fails to load
//      image: reference to the Image object
//      hash: SHA-256 hash of the image file
//      cleanup: a function that will revoke this images object url, call this to help prevent memory leak
//}
export default async function tryToLoadImage(imagesMap, filePath, onLoad) {
    let imageUrl = null;
    
    const cleanup = () => {
        try {

            if (imageUrl){
                URL.revokeObjectURL(imageUrl);
                imageUrl=null;
            }
        } catch (e) {
            console.error('tryToAddImage -> cleanup: failed to revoke object URL', e);
        }
    };

    try {
        const name = fileName(filePath);

        let imageBuffer = await window.api.fs.readFile(filePath);
        const hash = await window.api.crypto.hashFromBuffer(imageBuffer);
        
        const nameAlreadyExists = imagesMap.has(name);
        if (nameAlreadyExists){
            if (hash === imagesMap.get(name).hash){
                return false;
            }
        }
        let blob = new Blob([imageBuffer]);
        imageBuffer=null;
        imageUrl = URL.createObjectURL(blob);
        blob=null;
        const img = new Image();

        const onImageLoadPromise = new Promise((resolve, reject) => {
            img.onload = () => {
                img.onload=undefined;
                img.onerror=undefined;
                try {
                    onLoad({name, image: img, hash, cleanup});
                    resolve(name);
                } catch (e) {
                    cleanup();
                    resolve(null);
                }
            }
            img.onerror = () => {
                img.onload=undefined;
                img.onerror=undefined;
                cleanup();
                resolve(null);
            }

            img.src = imageUrl;
        });
        return await onImageLoadPromise;
    } catch (e) {
        console.error('tryToLoadImage', e);
        cleanup();
        return null;
    }
};