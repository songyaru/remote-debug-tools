# 使用说明

### 安装
`npm install adb-devtools -g`

### Android 真机调试支持
Android 设备打开 usb 调试模式，并通过了授权

![授权](https://songyaru.github.io/doc-backup/images/author.png)

接线连接 android 手机，启动小程序后执行 `devtools` 会自动打开 chrome 进行调试

或者使用 ```devtools -s``` 打开 http://localhost:8090/ 点击对应的智能小程序链接

### IOS 真机调试支持

MacOS,需要先安装[homebrew](http://brew.sh/)
```shell
brew install ios-webkit-debug-proxy
```
ios 设备通过 "设置" -> "Safari 浏览器" -> "高级" -> "Web 检查器" 打开

Windows 未测试，暂不支持


### 命令参数
  Usage: devtools [options]

  Options:
    
    -V, --version            output the version number
    -u, --upload             upload preload files to android
    -s, --start-server       start inspector server
    -p, --port [number]      set server port (default: 8090)
    -f, --prefix [string]    debug webview type prefix (default: webview)
    -d, --server-dir [path]  the root path of inspector server (default: /usr/local/lib/node_modules/adb-devtools/node_modules/devtools-frontend)
    -n, --new-server-dir     use the newest chrome devtools frontend
    -h, --help               output usage information


### 调试服务器
```
devtools -s 
```

打开 inspector 的 web 服务，用户可以通过打开 http://localhost:8090/ 列出所有已连接设备的可调试 webview 页面

其中 '智能小程序' 的链接是专门针对手机百度智能小程序做了特殊处理，可以实时的根据小程序的生存期自动连接对应的调试页面


### 参数使用示例

#### 启动静态服务器
```
devtools -s -p 8090 
```



#### 使用新版的 chrome inspector 界面
```
devtools -n 
```
默认使用的是 chrome 48 ，加上 -n 的参数后使用最新版的 chrome 调试界面 （当前是 chrome 69） 


#### 调试指定的移动浏览器类型

``` 
devtools -f webview 
```
通过在命令行里面执行 ```adb shell cat /proc/net/unix | grep --text  _devtools_remote``` 可以发现，不同的移动浏览器返回的结果可能不一样。
如 @webview_devtools_remote 的形式 (_devtools_remote 的前缀是 webview) ,因此提供 ```-f``` 来指定类型。

#### 将 preload 的 JS 文件上传到 android 手机的 /sdcard/ 目录下
``` 
devtools -u 
```
默认每次执行 devtools 都会上传覆盖


#### 其他
[真机调试技术方案](https://songyaru.github.io/doc-backup/adb-devtools/)



