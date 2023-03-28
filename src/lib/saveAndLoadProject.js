
export async function saveProjectAs(filePath, project, progressCallback){
    try {
        
        let imagesProgress = {saved: 0, numToSave: project.images.size};

        progressCallback?.(0);
        const images = [];
        for (const [, image] of project.images){
            const serializedImage = {...image};

            const imageDataPromise = new Promise( (resolve, reject) => {
                fetch(image.image.src).then(response => {
                    return response.arrayBuffer();
                }).then( data => {
                    return window.api.buffer.fromArrayBuffertoBase64(data);
                }).then( base64 => {
                    serializedImage.imageData=base64;
                    delete serializedImage.imageDataPromise;
                    delete serializedImage.image;
                    delete serializedImage.cleanup;
                    
                    imagesProgress.saved++;
                    progressCallback?.(imagesProgress.saved/imagesProgress.numToSave*50);

                    resolve();
                }).catch( e => {
                    console.error('saveProjectAs', e);
                    reject();
                });
            });

            serializedImage.imageDataPromise = imageDataPromise;
            images.push(serializedImage);
        }

        await Promise.all( images.map( image => image.imageDataPromise) );

        const success = await window.api.fs.writeFileJSON(filePath, {...project, images});
        if (!success) throw new Error('failed to save file');
        progressCallback?.(100);
        return true;
    } catch (e) {
        console.error('saveProjectAs', e);
        progressCallback?.(100);
        return false;
    }
    
}

export async function loadProjectFrom(filePath, progressCallback){
    const images = new Map();

    try {
        progressCallback?.(0);
        const project = await window.api.fs.readFileJSON(filePath);
        if (!project) throw new Error('failed to read file');
        progressCallback?.(50);

        const loadImagePromises = [];
        
        let imagesProgress = {loaded: 0, numToLoad: project.images.length};

        for (const image of project.images){
            loadImagePromises.push(new Promise( (resolve, reject) => {
                window.api.buffer.fromBase64ToArrayBuffer(image.imageData).then( imageBuffer => {
                    let imageUrl=null;

                    const cleanup = () => {
                        delete image.cleanup;
                        try {
                            if (imageUrl){
                                URL.revokeObjectURL(imageUrl);
                                imageUrl=null;
                            }
                        } catch (e) {
                            console.error('loadProjectFrom -> cleanup: failed to revoke object URL', e);
                        }
                    };

                    let blob = new Blob([imageBuffer]);
                    imageBuffer=null;
                    imageUrl = URL.createObjectURL(blob);
                    blob=null;
                    const img = new Image();
                        
                    img.onload = () => {
                        img.onload=undefined;
                        img.onerror=undefined;
                        image.cleanup=cleanup;
                        image.image=img;
                        delete image.imageData;

                        images.set(image.name, image);
                        
                        imagesProgress.loaded++;
                        progressCallback?.(imagesProgress.loaded/imagesProgress.numToLoad*50+50);

                        resolve();
                    }
                    img.onerror = () => {
                        img.onload=undefined;
                        img.onerror=undefined;
                        cleanup();
                        reject();
                    }
                    img.src = imageUrl;
                })
            }));
        }

        await Promise.all(loadImagePromises);

        progressCallback?.(100);
        return {...project, images};

    } catch (e) {
        for (const [, image] of images){
            if (image.cleanup) image.cleanup();
        }
        console.error('loadProjectFrom', e);
        
        progressCallback?.(100);
        return null;
    }
}