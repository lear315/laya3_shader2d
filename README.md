

#### 引擎定制
##### 修改创建Value2D实例化逻辑
laya.core.js文件修改

默认情况下Context对象在绘制纹理时创建的Value2D默认是TextureSV对象。需要修改Context._inner_drawTexture函数来告诉Laya遇到哪个Image对象要使用自定义Shader

```
_inner_drawTexture(tex: Texture, imgid: number, x: number, y: number, width: number, height: number, m: Matrix, uv: ArrayLike<number>, alpha: number, lastRender: boolean): boolean {
    //省略部分代码..
    //修改之前：
    this._submits[this._submits._length++] = this._curSubmit = submit = SubmitTexture.create(this, mesh, Value2D.create(ShaderDefines2D.TEXTURE2D, 0));
    //修改之后：
    this._submits[this._submits._length++] = this._curSubmit = submit = SubmitTexture.create(this, mesh, Shader2X['customDefines2D'].indexOf(imgid) != -1 ? Value2D.create(ShaderDefines2D.TEXTURE2D, imgid) : Value2D.create(ShaderDefines2D.TEXTURE2D, 0));
}
```