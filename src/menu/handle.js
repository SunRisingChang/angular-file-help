const vscode = require('vscode');
const path = require("path");
const fs = require("fs");

// 获取目标路径
function getFolderPath(agrs) {
    return fs.lstatSync(agrs.fsPath).isDirectory() ? agrs.fsPath : path.dirname(agrs.fsPath)
}

// 获取模板内容
function getTemplateStr(tmplName) {
    try {
        return fs.readFileSync(path.resolve(__dirname, `../templates/${tmplName}.tmpl`), 'utf-8')
    } catch (error) {
        throw new Error(`模板${tmplName}读取失败`)
    }
}

// 解析模板内容
function resolveTmpl(tmplStr, params) {
    // 取出待替换的内容
    let tmplParArry = tmplStr ? tmplStr.match(/\$\{.*?\}/g) : []
    let paramsKeys = Object.keys(params);
    for (const tmplPar of tmplParArry) {
        for (const key of paramsKeys) {
            if (tmplPar.includes(key))
                tmplStr = tmplStr.replace(tmplPar, params[key])
        }
    }
    return tmplStr
}

// 合法对象名
function toUpperCaseObjName(name) {
    return name.replace(/^\S/, s => s.toUpperCase()).replace(/[_-].{1}/g, s => {
        return s[1].toUpperCase()
    })
}

// 获取必要数据
async function getFileInfo(agrs, command) {
    let name = ""
    switch (command) {
        case "extension.addAngularPage":
            name = "page"
            break;
        case "extension.addAngularComponent":
            name = "component"
            break;
        case "extension.addAngularDirective":
            name = "directive"
            break;
        case "extension.addAngularPipe":
            name = "pipe"
            break;
        case "extension.addAngularService":
            name = "service"
            break;
        case "extension.addAngularRoute":
            name = "route"
            break;
        case "extension.addAngularModule":
            name = "module"
            break;
    }

    // 获取目标路径
    let folderPath = getFolderPath(agrs);

    // 获取组件名称
    let inputStr = await vscode.window.showInputBox({ prompt: `Please enter the ${name} name`, value: `my-${name}` })
    if (!inputStr) return; // ESC或者空输入

    // 输入内容合法校验
    if (!/^[a-z-_0-9]*$/ig.test(inputStr)) {
        vscode.window.showInformationMessage('无效的内容');
        return;
    }

    if (name === 'component' || name === 'module' || name === 'page') {
        // 输出文件夹
        folderPath = folderPath + '/' + inputStr;
        fs.mkdirSync(folderPath)
    }

    // 驼峰命名
    const UpperInputStr = toUpperCaseObjName(inputStr)

    return {
        folderPath,
        inputStr,
        UpperInputStr
    }
}

// 写入文件
async function writeTmplToFile(command, { folderPath, inputStr, UpperInputStr }, isPage) {
    // 获取配置属性
    const styleType = vscode.workspace.getConfiguration().get('angularComponent.styleType');
    // 获取配置属性
    const isCreatTestFile = vscode.workspace.getConfiguration().get('angularTest.creatTestFile');
    const pagePath = isPage ? "page/" : ''

    if (command === "extension.addAngularComponent") {
        // 获取html模板 写入文件
        let htmlContent = resolveTmpl(getTemplateStr(`${pagePath}component.html`), {
            Name: inputStr
        })
        fs.writeFileSync(`${folderPath}/${inputStr}.component.html`, htmlContent)

        // 获取style模板 写入文件
        let styleContent = resolveTmpl(getTemplateStr(`${pagePath}component.style`), {})
        fs.writeFileSync(`${folderPath}/${inputStr}.component.${styleType}`, styleContent)

        // 获取ts模板 写入文件
        let tsContent = resolveTmpl(getTemplateStr(`${pagePath}component.ts`), {
            Name: inputStr,
            UpperName: UpperInputStr
        })
        fs.writeFileSync(`${folderPath}/${inputStr}.component.ts`, tsContent)

        if (!isCreatTestFile) return;
        // 获取spec模板 写入文件
        let specContent = resolveTmpl(getTemplateStr(`${pagePath}component.spec.ts`), {
            Name: inputStr,
            UpperName: UpperInputStr
        })
        fs.writeFileSync(`${folderPath}/${inputStr}.component.spec.ts`, specContent)
    }
    if (command === "extension.addAngularDirective") {
        // 获取模板 写入文件
        let directiveContent = resolveTmpl(getTemplateStr(`${pagePath}directive.ts`), {
            UpperName: UpperInputStr
        })
        fs.writeFileSync(`${folderPath}/${inputStr}.directive.ts`, directiveContent)

        if (!isCreatTestFile) return;
        // 获取spec模板 写入文件
        let specContent = resolveTmpl(getTemplateStr(`${pagePath}directive.spec.ts`), {
            Name: inputStr,
            UpperName: UpperInputStr
        })
        fs.writeFileSync(`${folderPath}/${inputStr}.directive.spec.ts`, specContent)
    }
    if (command === "extension.addAngularPipe") {
        // 获取模板 写入文件
        let pipeContent = resolveTmpl(getTemplateStr(`${pagePath}pipe.ts`), {
            Name: inputStr,
            UpperName: UpperInputStr
        })
        fs.writeFileSync(`${folderPath}/${inputStr}.pipe.ts`, pipeContent)

        if (!isCreatTestFile) return;
        // 获取spec模板 写入文件
        let specContent = resolveTmpl(getTemplateStr(`${pagePath}pipe.spec.ts`), {
            Name: inputStr,
            UpperName: UpperInputStr
        })
        fs.writeFileSync(`${folderPath}/${inputStr}.pipe.spec.ts`, specContent)
    }
    if (command === "extension.addAngularService") {
        // 获取模板 写入文件
        let serviceContent = resolveTmpl(getTemplateStr(`${pagePath}service.ts`), {
            UpperName: UpperInputStr
        })
        fs.writeFileSync(`${folderPath}/${inputStr}.service.ts`, serviceContent)

        if (!isCreatTestFile) return;
        // 获取spec模板 写入文件
        let specContent = resolveTmpl(getTemplateStr(`${pagePath}service.spec.ts`), {
            Name: inputStr,
            UpperName: UpperInputStr
        })
        fs.writeFileSync(`${folderPath}/${inputStr}.service.spec.ts`, specContent)
    }
    if (command === "extension.addAngularRoute") {
        // 获取模板 写入文件
        let routeContent = resolveTmpl(getTemplateStr(`${pagePath}route.ts`), {
            UpperName: UpperInputStr
        })
        fs.writeFileSync(`${folderPath}/${inputStr}-routing.module.ts`, routeContent)
    }
    if (command === "extension.addAngularModule") {
        // 获取模板 写入文件
        let moduleContent = resolveTmpl(getTemplateStr(`${pagePath}module.ts`), {
            UpperName: UpperInputStr,
        })
        fs.writeFileSync(`${folderPath}/${inputStr}.module.ts`, moduleContent)
    }
}

// 添加组件
async function addAngularFileHandle(agrs, command) {
    let fileInfo = await getFileInfo(agrs, command);
    if (fileInfo)
        if (command === "extension.addAngularPage") {
            writeTmplToFile("extension.addAngularComponent", fileInfo, true)
            writeTmplToFile("extension.addAngularService", fileInfo, true)
            writeTmplToFile("extension.addAngularRoute", fileInfo, true)
            writeTmplToFile("extension.addAngularModule", fileInfo, true)
        } else
            writeTmplToFile(command, fileInfo)
}

module.exports = {
    addAngularFileHandle
}