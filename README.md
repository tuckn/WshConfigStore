# WshConfigStore

The config manager for WSH (Windows Script Host) that reads/writes configuration values in a JSON file.

## tuckn/WshModeJs basic applications structure

[WshBasicApps](https://github.com/tuckn/WshBasicPackage)  
&emsp;&emsp;├─ [WshCommander](https://github.com/tuckn/WshCommander) (./dist/module.js)  
&emsp;&emsp;├─ WshConfigStore - This repository (./dist/module.js)  
&emsp;&emsp;├─ [WshDotEnv](https://github.com/tuckn/WshDotEnv) (./dist/module.js)  
&emsp;&emsp;├─ [WshLogger](https://github.com/tuckn/WshLogger) (./dist/module.js)  
&emsp;&emsp;└─ [WshModeJs](https://github.com/tuckn/WshModeJs) (./dist/bundle.js)

WshBasicApps can use all the above modules functions.

## Operating environment

Works on JScript in Windows.

## Installation

(1) Create a directory of your WSH project.

```console
D:\> mkdir MyWshProject
D:\> cd MyWshProject
```

(2) Download this ZIP and unzipping or Use the following `git` command.

```console
> git clone https://github.com/tuckn/WshConfigStore.git ./WshModules/WshConfigStore
or
> git submodule add https://github.com/tuckn/WshConfigStore.git ./WshModules/WshConfigStore
```

(3) Include _.\\WshConfigStore\\dist\\bundle.js_ into your .wsf file.
For Example, if your file structure is

```console
D:\MyWshProject\
├─ .wsh\
│  └─ settings.json
├─ Run.wsf
├─ MyScript.js
└─ WshModules\
    └─ WshConfigStore\
        └─ dist\
          └─ bundle.js
```

The content of above _Run.wsf_ is

```xml
<package>
  <job id = "run">
    <script language="JScript" src="./WshModules/WshConfigStore/dist/bundle.js"></script>
    <script language="JScript" src="./MyScript.js"></script>
  </job>
</package>
```

I recommend this .wsf file encoding to be UTF-8 [BOM, CRLF].
This allows the following functions to be used in _.\\MyScript.js_.

### Together with another WshModeJs Apps

If you want to use it together with another WshModeJs Apps, install as following

```console
> git clone https://github.com/tuckn/WshModeJs.git ./WshModules/WshModeJs
> git clone https://github.com/tuckn/WshCommander.git ./WshModules/WshCommander
> git clone https://github.com/tuckn/WshConfigStore.git ./WshModules/WshConfigStore
or
> git submodule add https://github.com/tuckn/WshModeJs.git ./WshModules/WshModeJs
> git submodule add https://github.com/tuckn/WshCommander.git ./WshModules/WshCommander
> git submodule add https://github.com/tuckn/WshConfigStore.git ./WshModules/WshConfigStore
```

```xml
<package>
  <job id = "run">
    <script language="JScript" src="./WshModules/WshModeJs/dist/bundle.js"></script>
    <script language="JScript" src="./WshModules/WshCommander/dist/module.js"></script>
    <script language="JScript" src="./WshModules/WshConfigStore/dist/module.js"></script>
    <script language="JScript" src="./MyScript.js"></script>
  </job>
</package>
```

If you have no special circumstances, I recommend using [WshBasicApps](https://github.com/tuckn/WshBasicPackage).

## Usage

Now the above _.\\MyScript.js_ (JScript) can read/write _setting.json_ easily.
The default path is _%CD%\\.wsh\\settings.json_.

```js
var conf = new Wsh.ConfigStore();
// Equal with `new Wsh.ConfigStore(null, { dirPath: 'cwd' });`

conf.path;
// Returns: %CD%\.wsh\settings.json

conf.store;
// Returns: An Object in the above settings.json.
// Ex: { objName: { propName: 'value' } }

// Gets the item.
conf.get(); // undefined
conf.get('objName'); // { propName: 'value' }
conf.get('objName.propName'); // 'value'
conf.get('propNameB'); // undefined

// Checks if store has the item.
conf.has('propNameB'); // false

// Sets the item and writes the JSON file.
conf.set('propNameB', 'New Value');
conf.store;
// Returns: { objName: { propName: 'value' }, propNameB: 'New Value' }

// Deletes the item.
conf.has('propNameB'); // true
conf.del('propNameB');
conf.has('propNameB'); // false
```

### To Change Setting-Path

```js
// Default
var conf = new Wsh.ConfigStore();
// Equal with `new Wsh.ConfigStore(null, { dirPath: 'cwd' });`
conf.path; // Returns: %CD%\.wsh\settings.json

// Portable
var conf = new Wsh.ConfigStore(null, { dirPath: 'portable' });
conf.path; // Returns: <Wsh Script Directory>\.wsh\settings.json

// UserProfile
var conf = new Wsh.ConfigStore('myStore', { dirPath: 'userProfile' });
conf.path; // Returns: %USERPROFILE%\myStore.json

// Specifing absolute directory path
var conf = new Wsh.ConfigStore(null, { dirPath: 'C:\\conf' });
conf.path; // Returns: C:\conf\settings.json

// Can use the date literal
var conf = new Wsh.ConfigStore('vals_#{yy-MM}', { dirPath: 'D:\\confs' });
conf.path; // Returns: C:\confs\vals_20-08.json
```

### Dependency Modules

You can also use the following useful functions in _.\\MyScript.js_ (JScript).

- [tuckn/WshPolyfill](https://github.com/tuckn/WshPolyfill)
- [tuckn/WshUtil](https://github.com/tuckn/WshUtil)
- [tuckn/WshPath](https://github.com/tuckn/WshPath)
- [tuckn/WshOS](https://github.com/tuckn/WshOS)
- [tuckn/WshFileSystem](https://github.com/tuckn/WshFileSystem)
- [tuckn/WshProcess](https://github.com/tuckn/WshProcess)
- [tuckn/WshChildProcess](https://github.com/tuckn/WshChildProcess)
- [tuckn/WshNet](https://github.com/tuckn/WshNet)
- [tuckn/WshModeJs](https://github.com/tuckn/WshModeJs)

## Documentation

See all specifications [here](https://docs.tuckn.net/WshConfigStore) and also below.

- [WshPolyfill](https://docs.tuckn.net/WshPolyfill)
- [WshUtil](https://docs.tuckn.net/WshUtil)
- [WshPath](https://docs.tuckn.net/WshPath)
- [WshOS](https://docs.tuckn.net/WshOS)
- [WshFileSystem](https://docs.tuckn.net/WshFileSystem)
- [WshProcess](https://docs.tuckn.net/WshProcess)
- [WshChildProcess](https://docs.tuckn.net/WshChildProcess)
- [WshNet](https://docs.tuckn.net/WshNet)
- [WshModeJs](https://docs.tuckn.net/WshModeJs)

## License

MIT

Copyright (c) 2020 [Tuckn](https://github.com/tuckn)
