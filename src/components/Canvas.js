import React from "react";

export default class Canvas extends React.Component {
    constructor(props){
        super(props);

        this.canvasRef = React.createRef();

        this.state={};
        this.leftDown=false;
        this.middleDown=false;
        this.rightDown=false;
        this.pointerId=null;

        this.lastMouseScreenPos={x: 0, y: 0};

        this.view = {
            origin: {x: 0, y: 0},
            zoomLevel: 4,
            zoom: 1,
            translateAnchor:{x: 0, y: 0}
        }
    }

    redraw = () => {
        requestAnimationFrame( () => {
            const ctx = this.canvasRef.current.getContext('2d');
            
            const scale = window.devicePixelRatio*1;
            this.canvasRef.current.width=Number(this.canvasRef.current.style.width.substr(0, this.canvasRef.current.style.width.indexOf('p')))*scale;
            this.canvasRef.current.height=Number(this.canvasRef.current.style.height.substr(0, this.canvasRef.current.style.height.indexOf('p')))*scale;


            ctx.setTransform(1, 0, 0, 1, 0, 0);

            ctx.fillStyle=this.props.backgroundColor || 'black';
            ctx.fillRect(0, 0, this.canvasRef.current.width, this.canvasRef.current.height);

            
            ctx.beginPath();
            ctx.strokeStyle='#000000';
            ctx.lineJoin='round';
            ctx.lineCap='round';
            ctx.lineWidth=1*this.view.zoom*scale;
            

            const xToDisplay=(x)=>(x*this.view.zoom+this.view.origin.x*this.view.zoom)*scale;
            const yToDisplay=(y)=>(y*this.view.zoom+this.view.origin.y*this.view.zoom)*scale;
            const vToScale=(v)=>(v*this.view.zoom*scale);

            const drawFns={
                line: (x, y, x2, y2) => {
                    ctx.beginPath();
                    ctx.moveTo(xToDisplay(x), yToDisplay(y));
                    ctx.lineTo(xToDisplay(x2), yToDisplay(y2));
                    ctx.stroke();
                },
                circle: (x, y, radius) => {
                    ctx.beginPath();
                    ctx.ellipse(xToDisplay(x), yToDisplay(y), vToScale(radius), vToScale(radius), 0, 0, Math.PI*2);
                    ctx.stroke();
                },
                circleFilled: (x, y, radius)=>{
                    ctx.beginPath();
                    ctx.ellipse(xToDisplay(x), yToDisplay(y), vToScale(radius), vToScale(radius), 0, 0, Math.PI*2);
                    ctx.fill();
                },
                lineSize: (size) => ctx.lineWidth=size*this.view.zoom*scale,
                lineColor: (color) => ctx.strokeStyle=color,
                fillColor: (color) => ctx.fillStyle=color,
                drawImage: (img, x, y) => ctx.drawImage(img, xToDisplay(x), yToDisplay(y), vToScale(img.width), vToScale(img.height))
            }

            if (this.props.draw){
                this.props.draw(ctx, drawFns, this.canvasRef.current.parentElement.offsetWidth, this.canvasRef.current.parentElement.offsetHeight);
            }
            ctx.stroke();
        })
    }

    screenToChart = (xy, zoom, viewOrigin) => {
        if (zoom===undefined){
            return this.screenToChart(xy, this.view.zoom, this.view.origin)
        }else{
            return {
                x: xy.x / zoom - viewOrigin.x,
                y: xy.y / zoom - viewOrigin.y
            };
        }
    }


    leftButtonDown = ({x, y}) => {
        this.props?.onLeftButtonDown({x,y});
    }
    rightButtonDown = ({x, y}) => {
        this.props?.onRightButtonDown({x,y});
    }

    componentDidUpdate = (prevProps) => {
        this.redraw();
    }


    mouseDown = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const xy=this.screenToChart({x: e.offsetX, y: e.offsetY});
        if (this.pointerId) {
            e.target.releasePointerCapture(this.pointerId);
            this.pointerId=null;
            this.leftDown=false;
            this.middleDown=false;
            this.rightDown=false;
        }
        e.target.setPointerCapture(e.pointerId);
        this.pointerId=e.pointerId;

        if (e.button===0){
            this.leftButtonDown(xy);
            this.leftDown=true;
        }else if (e.button===2){
            this.view.translateAnchor=xy;
            this.middleDown=true;
        }else if (e.button===1){
            this.rightButtonDown(xy);
            this.rightDown=true;
        }
        this.redraw();
    }
    mouseUp = (e) => {
        e.preventDefault();
        const xy=this.screenToChart({x: e.offsetX, y: e.offsetY});
        e.target.releasePointerCapture(e.pointerId);
        this.pointerId=null;
        if (e.button===0){
            this.leftDown=false;
        }else if (e.button===2){
            this.middleDown=false;
        }else if (e.button===1){
            this.rightDown=false;
        }
        this.redraw();

    }
    mouseMove = (e) => {
        e.preventDefault();
        const xy={x: e.offsetX, y: e.offsetY};
        
        this.lastMouseScreenPos=xy;

        if (this.leftDown){
             this.leftButtonDown(this.screenToChart(xy));
        }
        if (this.middleDown){
            this.view.origin=this.screenToChart(xy, this.view.zoom, this.view.translateAnchor);
        } 
        if (this.rightDown){
            this.rightButtonDown(this.screenToChart(xy));
        }
        this.redraw();
    }

    mouseWheel = (e) => {
            e.preventDefault();
            const xy={x: e.offsetX, y: e.offsetY};
            const oldOrigin = this.screenToChart(xy);
            this.view.zoomLevel-=e.deltaY/150;
            if (this.view.zoomLevel<1) this.view.zoomLevel=1;
            this.view.zoom=(this.view.zoomLevel/4)**2;
            
            this.view.origin=this.screenToChart(xy, this.view.zoom, oldOrigin);
            this.redraw();
    }

    contextMenu = (e) => {
        e.preventDefault();
        this.redraw();
    }

    keyDown = (e) => {
    }

    componentDidMount = () => {
        this.canvasRef.current.addEventListener('wheel', this.mouseWheel);
        this.canvasRef.current.addEventListener('pointerdown', this.mouseDown);
        this.canvasRef.current.addEventListener('pointerup', this.mouseUp);
        this.canvasRef.current.addEventListener('pointermove', this.mouseMove);
        this.canvasRef.current.addEventListener('contextmenu', this.contextMenu);
        this.canvasRef.current.addEventListener('keydown', this.keyDown);
        this.redraw();
    }

    componentWillUnmount = () => {
    }

    render = () => {
        return (
            <canvas ref={this.canvasRef} className="noselect" style={{touchAction: "none", userSelect: "none", width: this.props.width, height: this.props.height}} width={100} height={100} tabIndex={0}></canvas>
        );
    }
}