import { Compiler, sources } from 'webpack';
import {getFiles, writeToFile} from "./getFiles";
const { RawSource } = sources;
const {resolve} = require('path');

class ModuleLogger {

    files: string[] = []
    options: {
        outputFile: string;
    }
    
    static defaultOptions = {
        outputFile: 'assets.md',
    };
    
    

    // Any options should be passed in the constructor of your plugin,
    // (this is a public API of your plugin).
    constructor(options = {}) {
        // Applying user-specified options over the default options
        // and making merged options further available to the plugin methods.
        // You should probably validate all the options here as well.
        this.options = { ...ModuleLogger.defaultOptions, ...options };
    }



    apply(compiler: Compiler) {


        compiler.hooks.beforeRun.tapPromise('ModuleLogger', async () => {
            await new Promise((resolve) => {
                getFiles('./src/', (err: any, outFiles: string[]) => {
                    resolve(outFiles)
                })
            }).then((res: string[]) => this.files = res)
        })

        compiler.hooks.normalModuleFactory.tap(

            'ModuleLogger',
            (normalModuleFactory) => {

                normalModuleFactory.hooks.module.tap('ModuleLogger', (_module, _createData, resolveData) => {
                    // @ts-ignore

                    let usedFile = _createData.resource.toString().replace(/\\/g, '/')
                    let formatUsedFile = usedFile.slice(usedFile.indexOf('/src/') + 1, usedFile.length);

                    if(this.files.indexOf(formatUsedFile) != -1){
                        this.files.splice(this.files.indexOf(formatUsedFile), 1)
                    }
                    console.log(formatUsedFile, 'check')

                    return _module;
                });

            }
        );

        compiler.hooks.emit.tap('ModuleLogger',
            (compilation) => {
                let out: string[] = []

                let whiteList = ['src/index.html', 'src/index.css', 'src/styles.css']

                for(let white of whiteList){
                    if(this.files.indexOf(white) != -1){
                        this.files.splice(this.files.indexOf(white), 1)
                    }
                }

                for (let file of this.files){
                    let path = resolve(`./${file}`)
                    path = path.replace(/^.:/, '')
                    path = path.replace(/\\/g, '/')
                    out.push(path)
                }

                console.log(out)

                writeToFile(this.options.outputFile, out)

                // compilation.emitAsset(
                //     this.options.outputFile,
                //     new RawSource(JSON.stringify(out))
                // )
            }
        )

    }
}

export default ModuleLogger;