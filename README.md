# theme-js-sdk

ThemeJSDK Element-UI 主题色变更的二次封装，一键修改 Element-UI 主题色

## 功能

一键修改 Element-UI 主题色，方便使用

## 如何使用

``` js
yarn add theme-js-sdk 
or
npm install theme-js-sdk

// 引入
import ThemeJSDK from 'theme-js-sdk'

// 初始化sdk，参数非必填。这里的设置默认颜色是异步操作
const theme = new ThemeJSDK({ 
  productName: 'qw-manage', // 非必填
  color: '#67C23A' // 默认颜色
})

// 主动设置主题颜色
theme.setThemeColor({color: '#67C23A'})

```
## 如何贡献

联系维护者进行代码贡献
## 项目结构说明
``` js
.
├── src                                                               // 源代码文件夹
│   └── index.ts                                                      // 实现代码
├── test                                                              // 测试
├── .gitignore                                                        // git 忽略文件
├── commitlint.config                                                 // commitlint 配置文件
├── package.json                                                      // npm 模块描述文件
├── tsconfig.json                                                     // TS 配置文件
└── yarn.lock   
```

#### 特点
快速修改 Element-UI 主题色，方便使用，参考 [theme-chalk-preview](https://github.com/ElementUI/theme-chalk-preview) 进行使用

#### 说明
> 如果对您对此项目有兴趣，可以点 "Star" 支持一下 谢谢！ ^_^
#### 参与贡献
1. Fork 本项目
2. 新建 Feat_xxx 分支
3. 提交代码
4. 新建 Pull Request
