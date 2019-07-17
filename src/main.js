import * as YoutubeAPI from './API/YoutubeApi';
import { startDownload } from './Utils/downloader';

const settings = {
    MINIMUM_TO_SLEEP: 5,
    SLEEP_TIMER: 60000,
} 

const downloadMultiples = (vidList) => {
    const requests = vidList.map(vid => startDownload(vid.vidID, vid.title));
    
    return Promise.all(requests);
}

const downloadSingle = (url) => {
    return Promise.resolve(startDownload(url.vidID, url.title)) 
}

const GetAllVideosFromChannel = async (url) => {
    const videoList = await YoutubeAPI.Paginator(url);
    const list = Object.values(videoList);
    const sleep = (milliseconds) => {
        console.log(`GetAllVideosFromChannel request sleep of ${milliseconds}`);
        return new Promise(resolve => setTimeout(resolve, milliseconds))
    }      
    
    const result = []
    for(const ids of list)
    {
        const res = await downloadMultiples(ids);
        result.push(...res);
        if (list.length >= settings.MINIMUM_TO_SLEEP)
            await sleep(settings.SLEEP_TIMER);
    }
    return result;
};

const ElectroPose = 'UCpO0OSNAFLRUpGrNz-bJJHA';
const main = async () => {
    // foreach objectOfArrayUrl
    const result = await GetAllVideosFromChannel(ElectroPose);
    console.log(result);
    // if (result.success)
    //     console.log('All downloads Completed');
    // console.log(list);
    // const result = await startDownload('_DjE4gbIVZk');
    // console.log(result);
}

main();