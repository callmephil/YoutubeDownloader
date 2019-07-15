import * as path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import binaries from 'ffmpeg-static';
import sanitize from 'sanitize-filename';
import ytdl from 'ytdl-core';
import fs from 'fs-extra';
import * as MetaData from './Utils/meta';
import * as YoutubeAPI from './API/YoutubeApi';

let rateLimitTriggered = false;

const getVideoAsMp4 = (urlLink, userProvidedPath, title) => {
    // Tell the user we are starting to get the video.
    console.log({progressMessage: 'Downloading...'});
    title = sanitize(title);
    return new Promise((resolve, reject) => {
        let fullPath = path.join('./Downloads/MostlyStrings', `tmp_${title}.mp4`);

        // Create a reference to the stream of the video being downloaded.
        let videoObject = ytdl(urlLink, {filter: 'audioonly'});

        videoObject.on('progress', (chunkLength, downloaded, total) => {
            // When the stream emits a progress event, we capture the currently downloaded amount and the total
            // to download, we then divided the downloaded by the total and multiply the result to get a float of
            // the percent complete, which is then passed through the Math.floor function to drop the decimals.
            if (!rateLimitTriggered) {
                let newVal = Math.floor((downloaded / total) * 100);
                console.log({progress: newVal});

                // Set the rate limit trigger to true and set a timeout to set it back to false. This will prevent the UI
                // from updating every few milliseconds and creating visual lag.
                rateLimitTriggered = true;
                setTimeout(() => {
                    rateLimitTriggered = false;
                }, 800);
            }
        });

        // Create write-able stream for the temp file and pipe the video stream into it.
        videoObject.pipe(fs.createWriteStream(fullPath)).on('finish', () => {
            // all of the video stream has finished piping, set the progress bar to 100% and give user pause to see the
            // completion of step. Then we return the path to the temp file, the output path, and the desired filename.
            console.log({progress: 100});
            setTimeout(() => {
                resolve({filePath: fullPath, folderPath: userProvidedPath, fileTitle: `${title}.mp3`});
            }, 1000);
        });
    });
}

const convertMp4ToMp3 = (paths) => {
    // Tell the user we are starting to convert the file to mp3.
    console.log({progressMessage: 'Converting...', progress: 0});

    return new Promise((resolve, reject) => {
        // Reset the rate limiting trigger just encase.
        rateLimitTriggered = false;

        // console.log("DEBUG", binaries.path());
        // Pass ffmpeg the temp mp4 file. Set the path where is ffmpeg binary for the platform. Provided desired format.
        console.log(paths);
        ffmpeg(paths.filePath)
            .setFfmpegPath(binaries.path)
            .format('mp3')
            .audioBitrate(320)
            .on('progress', (progress) => {
                // Use same rate limiting as above in function "getVideoAsMp4()" to prevent UI lag.
                if (!rateLimitTriggered) {
                    console.log({progress: Math.floor(progress.percent)});
                    rateLimitTriggered = true;
                    setTimeout(() => {
                        rateLimitTriggered = false;
                    }, 800);
                }
            })
            .output(fs.createWriteStream(path.join(paths.folderPath, sanitize(paths.fileTitle))))
            .on('end', () => {
                // After the mp3 is wrote to the disk we set the progress to 99% the last 1% is the removal of the temp file.
                console.log({progress: 99});
                resolve();
            })
            .run();
    });
}

let tags = {
    title: "Playmate",
    artist: "Olive B",
    album: "MrSuicideSheep",
  }

const startDownload = async (id) => {
    // // Reset state for each download/conversion
    // console.log({
    //     progress: 0,
    //     showProgressBar: true,
    //     progressMessage: '...'
    // });

    try {
        // Tell the user we are getting the video info, and call the function to do so.
        console.log({progressMessage: 'Fetching video info...'});
        let info = await ytdl.getInfo(id);

        console.log("YT", info)

        // Given the id of the video, the path in which to store the output, and the video title
        // download the video as an audio only mp4 and write it to a temp file then return
        // the full path for the tmp file, the path in which its stored, and the title of the desired output.
        let paths = await getVideoAsMp4(id, './Downloads/MostlyStrings', info.title);

        // Pass the returned paths and info into the function which will convert the mp4 tmp file into
        // the desired output mp3 file.
        await convertMp4ToMp3(paths);

        // Remove the temp mp4 file.
        fs.unlinkSync(paths.filePath);

        // Set the bar to 100% and give the OS about one second to get rid of the temp file.
        await (() => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    // console.log({progress: 100});
                    resolve();
                }, 900);
            });
        });

        // Signal that the download and conversion have completed and we need to tell the user about it and then reset.
        // this.downloadFinished();
        // console.log(`${paths.folderPath}/${paths.fileTitle}`)
        // mdWrite(tags, `${paths.folderPath}/${paths.fileTitle}`);
        console.log('Download Completed');

    } catch (e) {
        console.error(e);
    }
}

// startDownload('8hOa633MGno');
// startDownload('pdy-ouZSR2o');

startDownload('_xiHZciD08s');

// const PlaylistID = "PLx2MPyvI7z7FagGMFNJ6K4CATAu-x0BMC";
// const GetPlayListVideoIds = async () => {
//   YoutubeAPI.getPlayListItems(PlaylistID).then(data => {
//     data.forEach(element => {
//       startDownload(element.snippet.resourceId.videoId);
//       // console.log(element.snippet.resourceId.videoId)
//     });
//   });
// };

// function sleep(milliseconds) {
//     var start = new Date().getTime();
//     for (var i = 0; i < 1e7; i++) {
//       if ((new Date().getTime() - start) > milliseconds){
//         break;
//       }
//     }
//   }

// const GetAllVideosFromChannel = () => {
//   YoutubeAPI.Paginator("UCvF1TbHHdXwCfkX0OuU-UjA").then(data => {
//       for (let index = 0; index < 100; index++) {
//           const element = data[index];
//           if (element)
//             startDownload(element);
//       }
//     // data.forEach(element => {
//     //     if (element != undefined)
//     //     {
//     //         startDownload(element);
//     //         sleep(30000)
//     //     }
//     // });
//   });
// };

// GetAllVideosFromChannel();
// // GetPlayListVideoIds();


// // const tagss = MetaData.create('NANKOO - NDGO (Schaarup Remix) (Feat. Mr Tout Le Monde).mp3');
// // console.table(tagss)