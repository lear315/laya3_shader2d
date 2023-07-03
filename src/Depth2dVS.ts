export let Depth2dVS = `
/*
	texture和fillrect使用的。
*/
attribute vec4 posuv;
attribute vec4 attribColor;
attribute vec4 attribFlags;
uniform vec4 clipMatDir;
uniform vec2 clipMatPos;		
varying vec2 cliped;
uniform vec2 size;
uniform vec2 clipOff;			
varying vec4 v_texcoordAlpha;
varying vec4 v_color;
varying float v_useTex;
void main() {
	vec4 pos = vec4(posuv.xy,0.,1.);
	vec4 pos1  =vec4((pos.x/size.x-0.5)*2.0,(0.5-pos.y/size.y)*2.0,0.,1.0);
	gl_Position=pos1;
	v_texcoordAlpha.xy = posuv.zw;
	
	v_color = attribColor/255.0;
	v_color.xyz*=v_color.w;
	v_useTex = attribFlags.r/255.0;
	float clipw = length(clipMatDir.xy);
	float cliph = length(clipMatDir.zw);
	
	vec2 clpos = clipMatPos.xy;
	vec2 clippos = pos.xy - clpos;	
	if(clipw>20000. && cliph>20000.)
		cliped = vec2(0.5,0.5);
	else {
		
		cliped=vec2( dot(clippos,clipMatDir.xy)/clipw/clipw, dot(clippos,clipMatDir.zw)/cliph/cliph);
	}
}
`