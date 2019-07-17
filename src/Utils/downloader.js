import * as path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import binaries from 'ffmpeg-static';
import sanitize from 'sanitize-filename';
import ytdl from 'ytdl-core';
import fs from 'fs-extra';

const Settings = {
    'userDownloadsFolder': './Downloads',
    'bitRate': 320,
}

const getVideoAsMp4 = (urlLink, userProvidedPath, title) => {
    // Tell the user we are starting to get the video.
    title = sanitize(title);
    return new Promise((resolve, reject) => {
        let fullPath = path.join(userProvidedPath, `tmp_${title}.mp4`);
        // Create a reference to the stream of the video being downloaded.
        let videoObject = ytdl(urlLink, {filter: 'audioonly'});
        // Create write-able stream for the temp file and pipe the video stream into it.
        videoObject.pipe(fs.createWriteStream(fullPath)).on('finish', () => {
            resolve({filePath: fullPath, folderPath: userProvidedPath, fileTitle: `${title}.mp3`});
        });
    });
}

const convertMp4ToMp3 = (paths) => {
    // Tell the user we are starting to convert the file to mp3.
    return new Promise((resolve, reject) => {
        // Reset the rate limiting trigger just encase.
        // Pass ffmpeg the temp mp4 file. Set the path where is ffmpeg binary for the platform. Provided desired format.
        ffmpeg(paths.filePath)
            .setFfmpegPath(binaries.path)
            .format('mp3')
            .audioBitrate(Settings.bitRate)
            .output(fs.createWriteStream(path.join(paths.folderPath, sanitize(paths.fileTitle))))
            .on('end', () => {
                // After the mp3 is wrote to the disk we set the progress to 99% the last 1% is the removal of the temp file.
                resolve();
            })
            .run();
    });
}

export const startDownload = async (id, title) => {
    try {
        console.log(`startDownload for videoID: ${id}`)
        // Tell the user we are getting the video info, and call the function to do so.

        const info = await ytdl.getInfo(id);
        const vidTime = Math.floor(info.length_seconds / 60);
        if (vidTime < 1 || vidTime > 10)
            return {id: id, status: 'failed'}
        // Given the id of the video, the path in which to store the output, and the video title
        // download the video as an audio only mp4 and write it to a temp file then return
        // the full path for the tmp file, the path in which its stored, and the title of the desired output.
        const paths = await getVideoAsMp4(id, Settings.userDownloadsFolder, info.title);
        // Pass the returned paths and info into the function which will convert the mp4 tmp file into
        // the desired output mp3 file.
        await convertMp4ToMp3(paths);

        // Remove the temp mp4 file.
        fs.unlinkSync(paths.filePath);

        const newPath = path.join(paths.folderPath, sanitize(paths.fileTitle));
        return {id: id, title: info.title, path: newPath, status: 'completed'}
    } catch (e) {
        console.error(`startDownload ${e}`);
        // return {id: id, status: 'failedCatch'};
    }
}