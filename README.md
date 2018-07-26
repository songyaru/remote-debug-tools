# 使用说明

### 安装
`npm install adb-devtools -g`

### 启动真机调试
接线连接手机，启动小程序后执行 `devtools` 会自动打开 chrome 进行调试


  Usage: devtools [options]

  Options:
    
    -V, --version            output the version number
    -u, --upload             upload preload files to android
    -s, --start-server       start inspector server
    -p, --port [number]      set server port (default: 8090)
    -f, --prefix [string]    debug webview type prefix (default: webview)
    -d, --server-dir [path]  the root path of inspector server (default: /usr/local/lib/node_modules/adb-devtools/node_modules/devtools-frontend)
    -h, --help               output usage information

### 参数使用示例

#### 启动静态服务器
```
devtools -s -p 8090 
```

打开 inspector 的 web 服务，用户可以通过 http://localhost:8090/devtools/inspector.html 访问 inspector 的静态资源


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



