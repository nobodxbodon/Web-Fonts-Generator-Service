woff资源生成器
===========================

woff generator：based on TTFRender, gulp-ttf2woff, and NodeJS. 简化中文字体定制。

中文字体文件过大导致web font文件最好限于需要美化的部分。详见:
https://github.com/wangxiaomo/TTFRender

#### 依赖：

```
Python 2.7+ (2.7.3 for me)
NodeJS (0.10.26 for me)
```

安装gulp
```
npm install -g gulp

```
安装fontforge. 仅在ubuntu 12.04成功，Mac无果(http://stackoverflow.com/questions/9964284/fontforge-python-bindings-with-macports?noredirect=1#comment35450979_9964284)：
```
$ sudo apt-get install fontforge python-fontforge
```

#### 使用
$ npm install
启动NodeJS服务:
```
$ node server.js
```
访问：
```
localhost:3000
```
上传内容文件（需纯文本，若有编码问题请提issue）、ttf文件。生成woff文件（下载文件名为download,请自行改名），即可在css中引用：

```
@font-face
{
font-family: myFirstFont;
src: url('generated.woff');
}

div
{
font-family:myFirstFont;
}

```

#### 生成woff文件大小
生成woff约1k/字，根据ttf字体文件大小有别
