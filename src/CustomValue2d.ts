/**
 * 自定义2D的shader的Value2d扩展
 */

export default class CustomValue2d extends Laya.TextureSV{
    public u_colorMatrix: any[];
    public strength: number = 0;
    public blurInfo: any[] = null;
    public colorMat: Float32Array = null;
    public colorAlpha: Float32Array = null;
    private value2dProxy: any = null;
    private _textureHost: Laya.Texture = null;
    // 自定义的ShaderDefines2D
    public static CustomId = 0x4000

    public static applyCustomId(): number{
        let currentId = this.CustomId;
        (Laya.Shader2X as any)['customDefines2D'].push(currentId);
        this.CustomId++;
        return currentId;
    }

    constructor(subID:number=0){
        super(subID);     
        this._attribLocation = ['posuv', 0, 'attribColor', 1, 'attribFlags', 2];
        // 重写,增加代理绑定
        Object.defineProperty(this, 'textureHost', {
            get() {
                return this._textureHost;
            },
            set(newValue: number) {
                this._textureHost = newValue;
                this.value2dProxy = (Laya.Shader2X as any)['value2dMap'][this._textureHost.id];
            },
            enumerable: true,
            configurable: true,
          });
    }

    public clear():void{
        super.clear();
    }

    public setValue(value: Laya.Shader2D):void{
        super.setValue(value);
    }

    public upload():void{
        //渲染之前可用更新自定义的变量
        super.upload();
    }

    /**
     * 代理参数传递
     */
    public get texture_depth(): WebGLTexture {
        return this.value2dProxy.texture_depth;
    }

    public get dimensions(): number[] {
        return this.value2dProxy.dimensions;
    }

    public get mapDimensions(): number[] {
        return this.value2dProxy.mapDimensions;
    }

    public get scale(): number {
        return this.value2dProxy.scale;
    }

    public get offset(): number[] {
        return this.value2dProxy.offset;
    }

    public get focus(): number {
        return this.value2dProxy.focus;
    }

    public get enlarge(): number {
        return this.value2dProxy.enlarge;
    }
}