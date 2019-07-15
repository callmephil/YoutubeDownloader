import * as path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import binaries from 'ffmpeg-static';
import sanitize from 'sanitize-filename';
import ytdl from 'ytdl-core';
import fs from 'fs-extra';
import * as YoutubeAPI from './YoutubeApi';

const getVideoAsMp4 = (urlLink, userProvidedPath, title) => {
    try { 
    title = sanitize(title);
    console.log(`Started Download of ${title}`);
    return new Promise((resolve, reject) => {
        const fullPath = path.join(userProvidedPath, `tmp_${title}.mp4`);
        const videoObject = ytdl(urlLink, {filter: 'audioonly'});

        // Create write-able stream for the temp file and pipe the video stream into it.
        videoObject.pipe(fs.createWriteStream(fullPath)).on('finish', () => {
            // all of the video stream has finished piping, set the progress bar to 100% and give user pause to see the
            // completion of step. Then we return the path to the temp file, the output path, and the desired filename.
            setTimeout(() => {
                resolve({filePath: fullPath, folderPath: userProvidedPath, fileTitle: `${title}.mp3`});
            }, 1000);
        });
    });
    } catch (e) {
        console.log(e);
    }
}

const convertMp4ToMp3 = (paths) => {
    // Tell the user we are starting to convert the file to mp3.
    console.log(paths.filePath, binaries.folderPath, paths.folderPath);
    return new Promise((resolve, reject) => {
        // Reset the rate limiting trigger just encase.

        // Pass ffmpeg the temp mp4 file. Set the path where is ffmpeg binary for the platform. Provided desired format.
        ffmpeg(paths.filePath)
            .setFfmpegPath(binaries.path)
            .format('mp3')
            .audioBitrate(320)
            .output(fs.createWriteStream(path.join(paths.folderPath, sanitize(paths.fileTitle))))
            .on('end', () => {
                // After the mp3 is wrote to the disk we set the progress to 99% the last 1% is the removal of the temp file.
                // console.log({progress: 99});
                resolve();
            })
            .run();
    });
}

const fullPath = path.join('./Downloads/ElectroPose', `tmp_Addal - I See Fire (Feat. Jasmine Thompson).mp4`);

convertMp4ToMp3({filePath: fullPath, folderPath:'./Downloads/ElectroPose', fileTitle:'Addal - I See Fire (Feat. Jasmine Thompson)'})

const startDownload = async (id, path) => {
    try {
        const info = await ytdl.getInfo(id);
        // If path doesn't exist then create folder
        let paths = await getVideoAsMp4(id, path, info.title);

        await convertMp4ToMp3(paths);
        fs.unlinkSync(paths.filePath);

        await (() => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve();
                }, 900);
            });
        });

        console.log(`Download Completed ${id}, ${info.title}`);
    } catch (e) {
        console.log(e);
    }
}

const FolderPath = './Downloads/ElectroPose';
const MostlyStrings = 'UCvF1TbHHdXwCfkX0OuU-UjA';
const ElectroPose = 'UCpO0OSNAFLRUpGrNz-bJJHA';

let range = 25;
let counter = 100;
const GetAllVideosFromChannel = () => {
    
    YoutubeAPI.Paginator(ElectroPose).then(data => {
        const rep =  Math.ceil(data.length / 25) + 1;
        let range = 0;
        setTimeout(function(){
         for (let i = 1; i <= rep; i++) {
            for (let j = range; j <= 25 * i; j++)
            {
                console.log('testing')
                const element = data[j];
                if (element)
                    startDownload(element, FolderPath);
            }
            range += 25;
         }
         console.log(`Timer On Position`);
        }, 30000);
    });
  };
  
//   GetAllVideosFromChannel();