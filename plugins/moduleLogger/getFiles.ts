import fs from "fs";
import * as async from "async";
import path from "path";

export function getFiles (dirPath: string, callback: any) {

    fs.readdir(dirPath, function (err, files) {
        if (err) return callback(err);

        let filePaths: string[] = [];
        async.eachSeries(files, function (fileName: string, eachCallback: any) {
            let filePath = path.join(dirPath, fileName);

            fs.stat(filePath, function (err, stat) {
                if (err) return eachCallback(err);

                if (stat.isDirectory()) {
                    getFiles(filePath, function (err: string, subDirFiles: string) {
                        if (err) return eachCallback(err);

                        filePaths = filePaths.concat(subDirFiles);
                        eachCallback(null);
                    });

                } else {
                    filePaths.push(filePath.replace(/\\/g, '/'));

                    eachCallback(null);
                }
            });
        }, function (err: string) {
            callback(err, filePaths);
        });

    });
}

export function writeToFile(fileName: string, data: any){
    fs.writeFileSync(`${fileName}`, JSON.stringify(data));
}
