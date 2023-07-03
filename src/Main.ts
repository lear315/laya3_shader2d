import AniDepthValue2d from "./AniDepthValue2d";
import CustomValue2d from "./CustomValue2d";
import { Depth2dFS } from "./Depth2dFS";
import { Depth2dVS } from "./Depth2dVS";

const { regClass, property } = Laya;

@regClass()
export class Main extends Laya.Script {

    onStart() {
		// 初始化2d自定义渲染
		(Laya.Shader2X as any)['customDefines2D'] = [];
		(Laya.Shader2X as any)['value2dMap'] = {};


        Laya.loader.load(["bg/anibg2.jpg", "bg/anibgdepth2.jpg"], Laya.Handler.create(this, this.use2dShader));
    }

    public use2dShader() {
        let shaderImage: Laya.Image = new Laya.Image();
        let texture = Laya.loader.getRes("bg/anibg2.jpg");
        // 深度图
        let texture_depth = Laya.loader.getRes("bg/anibgdepth2.jpg");

        // 申请id
        let id = CustomValue2d.applyCustomId();
        texture.bitmap["_id"] = id;
        shaderImage.source = texture;
        shaderImage.zOrder = 999;

        shaderImage.width = Laya.stage.width;
        shaderImage.height = Laya.stage.height;
        
        // 创建深度动效
        let aniDepthValue2d = new AniDepthValue2d(texture.id);
        aniDepthValue2d.texture_host_depth = texture_depth;
        aniDepthValue2d.dimensions = [texture.width, texture.height, texture_depth.width, texture_depth.height];
        aniDepthValue2d.mapDimensions = [texture.width, texture.height];

        Laya.Value2D._initone(Laya.ShaderDefines2D.TEXTURE2D | id, CustomValue2d);
        let attribLocation = ['posuv', 0, 'attribColor', 1, 'attribFlags', 2];
        let shader = new Laya.Shader2X(Depth2dVS, Depth2dFS, Laya.ShaderDefines2D.TEXTURE2D | Laya.ShaderDefines2D.GAMMASPACE | id, null, attribLocation);
        Laya.stage.addChild(shaderImage);
    }

}