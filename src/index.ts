// import EventEmitter from '@markting/mk-version-sdk/build/main/lib/event';
import { convert } from './color/convert'

interface Config {
  cnname: 'themeChange',
  name: '主题修改',
  productName: '',
  color: ''
}

const originalStylesheetCount = document.styleSheets.length || -1

export default class ThemeJSDK {
  constructor(config: Config) {
    // super();
    this.config = config;
    this.initStyle(config.color);
  }

  originalStyle: any = null // 原始样式

  colors: any = {}
  
  config: Config;

  /**
   * 获取初始化样式
   */
  private async initStyle (color: any) {
    await this.getFile('//unpkg.com/element-ui/lib/theme-chalk/index.css')
      .then((res:any) => {
        this.originalStyle = this.getStyleTemplate(res.data)
        if (color) {
          this.setThemeColor({ color })
        }
      })
    return  
  }

  // 获取样式模板
  private getStyleTemplate (data: any) {
    const colorMap: any = {
      '#3a8ee6': 'shade-1',
      '#409eff': 'primary',
      '#53a8ff': 'light-1',
      '#66b1ff': 'light-2',
      '#79bbff': 'light-3',
      '#8cc5ff': 'light-4',
      '#a0cfff': 'light-5',
      '#b3d8ff': 'light-6',
      '#c6e2ff': 'light-7',
      '#d9ecff': 'light-8',
      '#ecf5ff': 'light-9'
    }
    Object.keys(colorMap).forEach((key: string) => {
      const value = colorMap[key]
      data = data.replace(new RegExp(key, 'ig'), value)
    })
    return data
  }

  // 获取文件
  private getFile (url: string, isBlob = false) {
    return new Promise((resolve, reject) => {
      const client = new XMLHttpRequest()
      client.responseType = isBlob ? 'blob' : ''
      client.onreadystatechange = () => {
        if (client.readyState !== 4) {
          return
        }
        if (client.status === 200) {
          const urlArr = client.responseURL.split('/')
          resolve({
            data: client.response,
            url: urlArr[urlArr.length - 1]
          })
        } else {
          reject(new Error(client.statusText))
        }
      }
      client.open('GET', url)
      client.send()
    })
  }

  // 设置颜色
  async setThemeColor (data: any) {
    console.log('设置主题', data)
    if (!this.originalStyle) {
      await this.initStyle('')
    }
    this.colors.primary = data.color
    const generateColors = (primary: any) => {
      let colors: any= {}
      let formula: any = {
        "shade-1": "color(primary shade(10%))",
        "light-1": "color(primary tint(10%))",
        "light-2": "color(primary tint(20%))",
        "light-3": "color(primary tint(30%))",
        "light-4": "color(primary tint(40%))",
        "light-5": "color(primary tint(50%))",
        "light-6": "color(primary tint(60%))",
        "light-7": "color(primary tint(70%))",
        "light-8": "color(primary tint(80%))",
        "light-9": "color(primary tint(90%))"
      } 
      Object.keys(formula).forEach((key: string) => {
        const value = formula[key].replace(/primary/g, primary)
        colors[key] = convert(value)
      })
      return colors
    }
    this.colors = Object.assign({}, this.colors, generateColors(this.colors.primary))
    this.writeNewStyle()
  }

  // 写入全局
  private writeNewStyle () {
    let cssText = this.originalStyle
    Object.keys(this.colors).forEach(key => {
      cssText = cssText.replace(new RegExp('(:|\\s+)' + key, 'g'), '$1' + this.colors[key])
    })

    if (originalStylesheetCount === document.styleSheets.length) {
      const style = document.createElement('style')
      style.innerText = cssText
      document.head.appendChild(style)
    } else {
      let document: any= window.document
      try {
        document.head.lastChild.innerText = cssText
      } catch (e) {
        console.log(e)
      }
    }
  }
}
