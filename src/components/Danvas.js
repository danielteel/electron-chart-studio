import React, {useCallback, useEffect, useRef} from "react";

import useSize from "../lib/useSize";

const zoomFactor=1.1;

function screenToChart(xy, zoom, viewOrigin){
    return {
        x: xy.x / zoom - viewOrigin.x,
        y: xy.y / zoom - viewOrigin.y
    };
}

function buildScaledDrawFunctions(context, view){
    const scale = view.zoom*window.devicePixelRatio;
    return {
        drawImage: (...args) => {
            if (args.length===3){
                const [image, dx, dy] = [...args];
                return context.drawImage(image, dx*scale+view.origin.x*scale, dy*scale+view.origin.y*scale, image.width*scale, image.height*scale);
            }else if (args.length===5){
                const [image, dx, dy, dWidth, dHeight] = [...args];
                return context.drawImage(image, dx*scale+view.origin.x*scale, dy*scale+view.origin.y*scale, dWidth*scale, dHeight*scale);
            }else if (args.length===9){
                const [image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight] = [...args];
                return context.drawImage(image, sx, sy, sWidth, sHeight, dx*scale+view.origin.x*scale, dy*scale+view.origin.y*scale, dWidth*scale, dHeight*scale);
            }else{
                console.error('unknown drawImage parameters');
            }
        },
        setLineWidth: (bScale, width) => {
            if (bScale){
                context.lineWidth = width*scale;
            }else{
                context.lineWidth = width*window.devicePixelRatio;
            }
        },
        setStrokeStyle: (style, cap, join) => {
            if (style) context.strokeStyle=style;
            if (cap) context.lineCap = cap;
            if (join) context.lineJoin = join;
        },
        setFillStyle: (style) => {
            context.fillStyle = style;
        },
        fillRect: (bScale, x, y, w, h) => {
            if (bScale){
                context.fillRect(x*scale+view.origin.x*scale, y*scale+view.origin.y*scale, w*scale, h*scale);
            }else{
                context.fillRect(x*scale+view.origin.x*scale, y*scale+view.origin.y*scale, w*window.devicePixelRatio, h*window.devicePixelRatio);
            }
        },
        setFont: (bScale, size, font) => {
            if (bScale){
                context.font = `${size*scale}px ${font}`;
            }else{
                context.font = `${size*window.devicePixelRatio}px ${font}`;
            }
        },
        setTextAlign: (textAlign) => {
            context.textAlign = textAlign;
        },
        setTextBaseline: (baseLine) => {
            context.textBaseline = baseLine;
        },
        fillText: (text, x, y) => {
            context.fillText(text, x*scale + view.origin.x*scale, y*scale + view.origin.y*scale);
        },
        strokeText: (text, x, y) => {
            context.strokeText(text, x*scale + view.origin.x*scale, y*scale + view.origin.y*scale);
        },
        beginPath: ()=>{
            context.beginPath();
        },
        closePath: ()=>{
            context.closePath();
        },
        moveTo: (x, y) => {
            context.moveTo(x*scale+view.origin.x*scale, y*scale+view.origin.y*scale);
        },
        lineTo: (x, y) => {
            context.lineTo(x*scale+view.origin.x*scale, y*scale+view.origin.y*scale);
        },
        stroke: () =>{
            context.stroke();
        }
    }
}

export default function Danvas({onNeedsRedraw, drawRef, ...props}) {
    const canvasRef = useRef();
    const size = useSize(canvasRef);
    const view = useRef({zoom: 1, origin: {x: 0, y: 0}});
    const mouseInfo = useRef({anchor: {x: 0, y: 0}, left: false, middle: false, right: false, pointerId: null});
    const redrawPending = useRef(false);


    const doRedraw = useCallback( () => {
        redrawPending.current=true;
        requestAnimationFrame(()=>{
            if (!redrawPending.current) return;
            redrawPending.current=false;
            const context = canvasRef.current.getContext('2d');
            onNeedsRedraw?.({
                context: context,
                width: canvasRef.current.width,
                height: canvasRef.current.height,
                canvas: canvasRef.current,
                view: view.current,
                scale: window.devicePixelRatio,
                drawFunctions: buildScaledDrawFunctions(context, view.current)
            });
        })
    }, [onNeedsRedraw])

    useEffect(()=>{
        if (drawRef){
            const context = canvasRef.current.getContext('2d');
            drawRef.current = {
                context: context,
                width: canvasRef.current.width,
                height: canvasRef.current.height,
                canvas: canvasRef.current,
                view: view.current,
                scale: window.devicePixelRatio,
                drawFunctions: buildScaledDrawFunctions(context, view.current)
            };
        }
    }, [onNeedsRedraw, drawRef]);

    useEffect(() => {
        if (canvasRef.current) {
            canvasRef.current.width = size?.width * window.devicePixelRatio;
            canvasRef.current.height = size?.height * window.devicePixelRatio;
        }
        doRedraw();
    }, [size, doRedraw]);

    useEffect(()=>{
        const canvas = canvasRef.current;
        const onWheel = (e) => {
            e.preventDefault();
            const mousePos = {x: e.offsetX, y: e.offsetY};
            const canvasPos = screenToChart(mousePos, view.current.zoom, view.current.origin);

            let newZoom=view.current.zoom;
            if (e.deltaY<0){
                newZoom*=zoomFactor;
            }else{
                newZoom/=zoomFactor;
            }
            view.current.origin = screenToChart(mousePos, newZoom, mouseInfo.current.middle?mouseInfo.current.anchor:canvasPos);
            view.current.zoom = newZoom;
            
            doRedraw();
        }
        const onPointerDown = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (mouseInfo.current.pointerId){
                e.target.releasePointerCapture(mouseInfo.current.pointerId);
                mouseInfo.current.pointerId=null;
                mouseInfo.current.left=false;
                mouseInfo.current.middle=false;
                mouseInfo.current.right=false;
            }
            e.target.setPointerCapture(e.pointerId);
            mouseInfo.current.pointerId=e.pointerId;
            if (e.button===0){
                mouseInfo.current.left=true;
            }else if (e.button===1){
                mouseInfo.current.middle=true;
                mouseInfo.current.anchor=screenToChart({x: e.offsetX, y: e.offsetY}, view.current.zoom, view.current.origin);
            }else if (e.button===2){
                mouseInfo.current.right=true;
            }
        }
        const onPointerMove = (e) => {
            e.preventDefault();
            if (mouseInfo.current.middle){
                view.current.origin = screenToChart({x: e.offsetX, y: e.offsetY}, view.current.zoom, mouseInfo.current.anchor);
                doRedraw();
            }
        }
        const onPointerUp = (e) => {
            e.preventDefault();
            e.target.releasePointerCapture(e.pointerId);
            mouseInfo.current.pointerId=null;
            if (e.button===0){
                mouseInfo.current.left=false;
            }else if (e.button===1){
                mouseInfo.current.middle=false;
                doRedraw();
            }else if (e.button===2){
                mouseInfo.current.right=false;
            }
        }
        canvas.addEventListener('wheel', onWheel);
        canvas.addEventListener('pointerdown', onPointerDown);
        canvas.addEventListener('pointermove', onPointerMove);
        canvas.addEventListener('pointerup', onPointerUp);
        return () => {
            canvas.removeEventListener('wheel', onWheel);
            canvas.removeEventListener('pointerdown', onPointerDown);
            canvas.removeEventListener('pointermove', onPointerMove);
            canvas.removeEventListener('pointerup', onPointerUp);
        }
    }, [view, doRedraw]);

    let style = {};
    if (props?.style) style = {...props.style};
    
    style.boxSizing = 'border-box';
    if (style.minWidth === undefined) {
        style.minWidth = '1px';
    }

    return (<canvas {...props} ref={canvasRef} style={style}></canvas>);
}