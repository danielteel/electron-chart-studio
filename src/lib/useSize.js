import React from 'react';

import useResizeObserver from '@react-hook/resize-observer';

export default function useSize(target){
    const [size, setSize] = React.useState()
  
    React.useLayoutEffect(() => {
      setSize(target.current.getBoundingClientRect())
    }, [target])
  
    useResizeObserver(target, (entry) => setSize(entry.contentRect))
    return size
}
