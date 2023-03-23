import React, { useEffect, useRef } from "react";

import useResizeObserver from '@react-hook/resize-observer'


const useSize = (target) => {
    const [size, setSize] = React.useState()
  
    React.useLayoutEffect(() => {
      setSize(target.current.getBoundingClientRect())
    }, [target])
  
    useResizeObserver(target, (entry) => setSize(entry.contentRect))
    return size
}




export default function Canvas({onResize, drawRef, ...props}){
    const canvasRef = useRef();
    const size = useSize(canvasRef);

    if (drawRef){
      drawRef.current = {
        getContext: (type)=>canvasRef.current?.getContext(type),
        width: size?.width*window.devicePixelRatio,
        height: size?.height*window.devicePixelRatio
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