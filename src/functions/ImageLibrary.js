
//As a backup, finalizationRegistry is used to catch when an ImagesLibrary gets garbage collected
//so we can revoke all the URLs and potentially free up a substantial amount of memory
/* eslint-disable no-undef*/
const finalizationRegistry = new FinalizationRegistry((imagesMap)=>{
    for (const [, obj] of imagesMap){
        console.error('ImageLibrary: images not properly unloaded before ImagesLibrary was garbage collected.')
        try {
            URL.revokeObjectURL(obj.imageUrl);
        }catch{}
    }
    imagesMap.clear();
});


export default class ImageLibrary{
    constructor(){
        this.imagesMap = new Map();
        finalizationRegistry.register(this, this.imagesMap);
    }

    unloadAllImages = () => {
        for (const [, obj] of this.imagesMap){
            try {
                URL.revokeObjectURL(obj.imageUrl);
            } catch {
            }
        }
        this.imagesMap.clear();
    }

    unloadImage = (imageObj) => {
        try {
            if (this.imagesMap.has(imageObj.hash)){
                imageObj.refCount--;
                if (imageObj.refCount) return;
        
                URL.revokeObjectURL(imageObj.imageUrl);
                this.imagesMap.delete(imageObj.hash);
            }else{
                throw new Error('ImageLibrary:unloadImage cannot unload an image not in the library', imageObj);
            }
        } catch (e){
            console.error('ImageLibrary:unloadImage', e);
        }
    }

    loadImage = async (filePath) => {
        let imageUrl = null;
    
        try {
            const imageData = await window.api.fs.readFile(filePath);
            const hash = await window.api.crypto.hashFromBuffer(imageData);
            if (this.imagesMap.has(hash)){
                const existingImage = this.imagesMap.get(hash);
                existingImage.refCount++;
                return existingImage;
            }
    
            const blob = new Blob([imageData]);
            imageUrl = URL.createObjectURL(blob);
            const img = new Image();
    
            const imageLoadedPromise = new Promise((resolve, reject) => {
                img.onload=()=>{
                    img.onload=undefined;
                    img.onerror=undefined;
                    const imageObject = {img, hash, imageUrl, refCount: 1};
                    this.imagesMap.set(hash, imageObject);
                    resolve(imageObject);
                }
                img.onerror=()=>{
                    img.onload=undefined;
                    img.onerror=undefined;
                    if (imageUrl) URL.revokeObjectURL(imageUrl);
                    imageUrl=null;
                    reject();
                }
                img.src = imageUrl;
            });
            return await imageLoadedPromise;
        } catch (e) {
            console.error('ImageLibrary:loadImage failed to loadImage');
            if (imageUrl) URL.revokeObjectURL(imageUrl);
            throw e;
        }
    }

    fetchImageArrayBuffer = async (imageObj) => {
        try {
            if (!this.imagesMap.has(imageObj.hash)) throw new Error('ImageLibrary:fetchImageArrayBuffer cannot fetch ArrayBuffer from image not in library');
            const response = await fetch(imageObj.imageUrl);
            const arrayBuffer = await response.arrayBuffer();
            return arrayBuffer;
        } catch (e) {
            console.error('ImageLibrary:fetchImageArrayBuffer failed to fetchImageArrayBuffer', e);
            throw e;
        }
    }
}