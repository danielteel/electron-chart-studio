import React, { useEffect, useRef } from "react";

import useSize from "../lib/useSize";



export default function Canvas({onResize, drawRef, ...props}){
    const canvasRef = useRef();
    const size = useSize(canvasRef);

    if (drawRef){
      drawRef.current = {
        getContext: (type)=>canvasRef.current?.getContext(type),
        width: size?.width*window.devicePixelRatio,
        height: size?.height*window.devicePixelRatio,
        canvas: canvasRef.current
      }
    }

    useEffect( () => {
        if (canvasRef.current){
          canvasRef.current.width = size?.width*window.devicePixelRatio;
          canvasRef.current.height = size?.height*window.devicePixelRatio;
        }
        onResize?.({
          getContext: (type)=>canvasRef.current?.getContext(type),
          width: canvasRef.current.width,
          height: canvasRef.current.height
        })
    }, [size, onResize, drawRef]);

    let style={};
    if (props?.style) style={...props.style};
    style.boxSizing='border-box';
    if (style.minWidth===undefined){
      style.minWidth='1px';
    }

    return (
            <canvas {...props} ref={canvasRef} style={style}></canvas>
    );
}