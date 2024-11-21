<h1 align="center">
xs-signature
</h1>

<p align="center">
 <a href="README.md">简体中文</a> 
</p>


`Xs-Signature` 是一个 `Vue` 在实现移动端实现`手写签名`的"最佳实践"，媲美原生 `App` 丝滑流畅的使用体验，上手即用。使用了最新的 `Vue` 技术栈，基于 [`Vue3`](https://cn.vuejs.org/)、[`Vite5`](https://cn.vitejs.dev/)
实现。Tips：目前仅支持Vue3技术栈，如果有需求在考虑拓展功能！




## 使用

```sh
$ npm install xs-signature
$ npm install vue-signature-pad
```
```sh
$ yarn add xs-signature
$ yarn add vue-signature-pad
```
```sh
$ pnpm install xs-signature
$ pnpm install vue-signature-pad
```

## 引入

```sh
在项目入口文件引入
$ import "xs-signature/style.css"
$ import VueSignaturePad from "vue-signature-pad";
$ import XsSignature from "xs-signature"
app.use(VueSignaturePad)
app.use(XsSignature)

在业务组件使用
<xs-signature :csutom='false'/>
```


## 方法

| Name                                                           | Argument Type | Description                                                                        |
|:---------------------------------------------------------------|:--------------|------------------------------------------------------------------------------------|
| `overlayText`                                                  | `String`      | `自定义页面主体提示语`                                                                       |
| `horizontalScreenText`                                         | `String`      | `自定义翻转提示语`                                                                         |
| `title`                                                        | `String`      | `自定义头部标题`                                                                          |
| `showHeader`                                                   | `Boolean`     | `是否展示头部`                                                                           |
| `showFooter`                                                   | `Boolean`     | `是否展示底部`                                                                           |
| `custom`                                                       | `Boolean`     | `是否开启自定义模式(依旧保留头部、底部，不同于为可以自定义其中内容) 默认 'false'`                                    |
| `colorList`                                                    | `Array`       | `字体可选颜色集合 默认 '黑色' '红色' '蓝色'  ([{id:Number:xxx,text:String:xxx,value:String:xxx}])` |
| `boldList`                                                     | `Array`       | `字体可选粗细集合 默认 '3' '6' '9'  ([{id:Number:xxx,text:String:xxx,value:String:xxx}])`    |
| `close()`                                                      | `Function`    | `回退一步的操作`                                                                          |
| `reset()`                                                      | `Function`    | `清空页面所绘制签名操作`                                                                      |
| `submit(isEmpty,data,orientation)`                             | `Function`    | `提交获取签名Base64` `'empty':签名是否为空值、'data':签名后旋转裁切得到的Base64、'orientation':屏幕翻转方向`      |


## 运行

注意：本项目属于二开组件，仅适用于彦祖学习和研究，其他人不得用于商业使用


## 学习

[Vue Signature Pad](https://github.com/neighborhood999/vue-signature-pad) - Best Practices for Smooth Signature Drawing in Vue Based on HTML5 Canvas


## 功能与建议

目前项目处于开发初期，新功能正在持续添加中，如果你对该组件有任何功能与建议，欢迎联系[作者](https://github.com/smallSun0110/Xs-Signature/issues)。
如果你也喜欢本插件的设计思想，非常感谢您对于我的支持，给项目[点个星星](https://github.com/smallSun0110/Xs-Signature)吧！


## 许可协议

MIT © [smallSun](https://github.com/smallSun0110)
