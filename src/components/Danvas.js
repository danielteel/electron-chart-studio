import React, {useEffect, useRef, useState} from "react";

import useSize from "../lib/useSize";

const zoomFactor=1.1;

function screenToChart(xy, zoom, viewOrigin){
    return {
        x: xy.x / zoom - viewOrigin.x,
        y: xy.y / zoom - viewOrigin.y
    };
}

export default function Danvas({onNeedsRedraw, drawRef, ...props}) {
    const canvasRef = useRef();
    const size = useSize(canvasRef);
    const [zoom, setZoom] = useState(1);
    const [origin, setOrigin] = useState({x: 0, y: 0});

    if (drawRef) {
        drawRef.current = {
            getContext: (type) => canvasRef.current?.getContext(type),
            width: size?.width * window.devicePixelRatio,
            height: size?.height * window.devicePixelRatio,
            canvas: canvasRef.current,
            zoom: zoom,
            origin: origin,
            scale: window.devicePixelRatio
        }
    }

    useEffect(() => {
        if (canvasRef.current) {
            canvasRef.current.width = size?.width * window.devicePixelRatio;
            canvasRef.current.height = size?.height * window.devicePixelRatio;
        }
        onNeedsRedraw?.({
            getContext: (type) => canvasRef.current?.getContext(type),
            width: canvasRef.current.width,
            height: canvasRef.current.height,
            zoom: zoom,
            origin: origin,
            scale: window.devicePixelRatio
        })
    }, [size, onNeedsRedraw, drawRef, zoom, origin]);

    useEffect(()=>{
        const canvas = canvasRef.current;
        const onWheel = (e) => {
            e.preventDefault();
            const mousePos = {x: e.offsetX, y: e.offsetY};
            const canvasPos = screenToChart(mousePos, zoom, origin);

            let newZoom=zoom;
            if (e.deltaY<0){
                newZoom*=zoomFactor;
            }else{
                newZoom/=zoomFactor;
            }
            setOrigin(screenToChart(mousePos, newZoom, canvasPos));
            setZoom(newZoom);
        }
        canvas.addEventListener('wheel', onWheel);
        return () => {
            canvas.removeEventListener('wheel', onWheel);
        }
    }, [origin, zoom]);

    let style = {};
    if (props?.style) style = {...props.style};
    
    style.boxSizing = 'border-box';
    if (style.minWidth === undefined) {
        style.minWidth = '1px';
    }


    return (<canvas {...props} ref={canvasRef} style={style}></canvas>);
}