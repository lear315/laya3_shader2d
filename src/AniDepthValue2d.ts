export default class AniDepthValue2d {
    private _texture_depth: WebGLTexture = null;
    private _texture_host_depth: Laya.Texture = null;
    private _dimensions: number[] = [0, 0, 0, 0];
    private _mapDimensions: number[] = [1, 5112];
    private _scale: number = .0215;
    private _offset: number[] = [ 0.1, 0.1, 0.1];
    private _focus: number = .5;
    private _enlarge: number = 1.06;
    public animateType: number = 1;
    public animateDuration: number = 3;
    public easeFactor: number = .2;
    public animateScale = {
        x: 1,
        y: .95,
        z: 0.95,
        px: 0.9,
        py: .925,
        pz: .925
    }
    public pointZ = {
        x: 0,
        y: 0
    }
    public pointB = {
        x: 0,
        y: 0
    }

    public constructor(texture_id: number) {
        // 绑定数据
        (Laya.Shader2X as any)['value2dMap'][texture_id] = this;
        Laya.timer.frameLoop(1, this, this.update);
    }

    private update() {
        if (this.animateType == 0) {
            return;
        }
        if (this.animateType == 1) {
            // 投影
            let time = Date.now() / 1e3 / this.animateDuration;
            let s = this.animateScale.px;
            let l = this.animateScale.py;
            let u = this.animateScale.pz;
            this.offset = [
                Math.sin(2 * Math.PI * (time + s)) * this.animateScale.x,
                Math.sin(2 * Math.PI * (time + l)) * this.animateScale.y,
                .5 * (1 + Math.sin(2 * Math.PI * (time + u))) * this.animateScale.z
            ];
        }
    }

    public get texture_depth(): WebGLTexture {
        return this._texture_depth;
    }

    public set texture_host_depth(texture: Laya.Texture) {
        this._texture_depth = (texture as any)["_getSource"]();
        this._texture_host_depth = texture;
    }

    public get dimensions(): number[] {
        return this._dimensions;
    }

    public set dimensions(value: number[]) {
        this._dimensions = value;
    }

    public get mapDimensions(): number[] {
        return this._mapDimensions;
    }

    public set mapDimensions(value: number[]) {
        this._mapDimensions = value;
    }

    public get scale(): number {
        return this._scale;
    }

    public set scale(value: number) {
        this._scale = value;
    }

    public get offset(): number[] {
        return this._offset;    
    }

    public set offset(value: number[]) {
        this._offset = value;
    }

    public get focus(): number {
        return this._focus;
    }

    public set focus(value: number) {
        this._focus = value;
    }

    public get enlarge(): number {
        return this._enlarge;
    }

    public destroy() {
        Laya.timer.clear(this, this.update);
        this._texture_depth = null;
        if (this._texture_host_depth) {
            this._texture_host_depth.disposeBitmap();
        }
        this._texture_host_depth = null;
    }

}