import * as YoutubeAPI from './API/YoutubeApi';
import { startDownload } from './Utils/downloader';
import * as utils from './Utils/utils';

const settings = {
    MINIMUM_TO_SLEEP: 5,
    SLEEP_TIMER: 60000,
} 
let _customFolderName = '';

const downloadMultiples = (idList) => {
    const requests = idList.map(id => startDownload(id, _customFolderName));
    
    return Promise.all(requests);
}

const downloadSingle = (id) => {
    return Promise.resolve(startDownload(id)) 
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

const getLinkTypeAndID = async (url, id, type) => {
    if (url && id && type)
        return {url: url, id: id, type: type}; 
    // Replace this function by something nicer.
    const types = ['channel', 'playlist', 'watch'];
    const refractors = {'channel': '/', 'playlist': '?list=', 'watch': '?v='};

    if (url.includes(types[2]) && url.includes('list='))
        return { url: url, id: null, type: null }
    
    types.forEach(el => {
        if (url.search(el) !== -1) 
        {
            id = url.substr(url.lastIndexOf(refractors[el]) + refractors[el].length);
            type = el;
        }
    });

    return {url: url, id: id, type: type};
}
const main = async (args) => {
    if (args && args.length >= 0)
    {
        _customFolderName = args[1];
        if (_customFolderName)
            utils.CreateFolderIfNotExists(_customFolderName);

        const info = await getLinkTypeAndID(args[0]);
        let result;
        switch (info.type)
        {
            case 'channel':
                console.log(`Channel: ${info.id} being parsed`);
                result = await GetAllVideosFromChannel(info.id);
            break;
            case 'playlist':
                console.log('playlist not done yet');
                // result = await GetAllVideosFromPlaylist(info.id)
            break;
            case 'watch':
                console.log('Video Being Parsed');
                result = await startDownload(info.id);
            break;
            default:
                console.error(`unfound type ${info.type}`)
        }
        console.log(result);
    }
    console.log('job done');
}

// const ElectroPose = 'UCpO0OSNAFLRUpGrNz-bJJHA';
//  console.log(getLinkTypeAndID('https://www.youtube.com/watch?v=AOoWctmgKQs'));
//  console.log(getLinkTypeAndID('https://www.youtube.com/playlist?list=PLx2MPyvI7z7FIJ4j3vK_pxLcMxcQqWQKC'));
//  console.log(getLinkTypeAndID('https://www.youtube.com/channel/UCpO0OSNAFLRUpGrNz-bJJHA'));
//  console.log(getLinkTypeAndID('https://www.youtube.com/watch?v=vNpwOXp5mFQ&list=PLx2MPyvI7z7FIJ4j3vK_pxLcMxcQqWQKC&index=3&t=0s'));
main(process.argv.splice(2));