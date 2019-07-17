require('dotenv').config()
import axios from "axios";

const YOUTUBE_API_KEY = process.env.NODE_YOUTUBE_API_KEY_1;

const youtubeAPI = async (url, params) => {
  try {
    params.params.part = "snippet";
    params.params.key = YOUTUBE_API_KEY;

    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/${url}`,
      params
    );

    if (response) return response.data;
    else throw "Invalid Data";
  } catch (e) {
    // console.error(e);
  }
};

const getPlayListSize = async playlistID => {
  const result = await youtubeAPI("playlistItems", {
    params: {
      playlistId: playlistID,
      maxResults: 1
    }
  });

  const size = result.pageInfo.totalResults + 1;
  return size;
};

export const getPlayListItems = async playlistID => {
  const playListSize = await getPlayListSize(playlistID);
  const result = await youtubeAPI("playlistItems", {
    params: {
      maxResults: playListSize,
      playlistId: playlistID
    }
  });
  return result.items;
};


// GET https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=UCj_Y-xJ2DRDGP4ilfzplCOQ&maxResults=50&order=date&key=[YOUR_API_KEY] HTTP/1.1
const getChannelListSize = async ChannelID => {
    const result = await youtubeAPI("search", {
        params: {
            channelId: ChannelID,
            maxResults: 1,
            order:'date',
            regionCode: 'US'
        }
      });

      return result.pageInfo.totalResults;
}


export const getChannelListItems = async (ChannelID, nextPageToken) => {
    const result = await youtubeAPI("search", {
        params: {
            channelId: ChannelID,
            maxResults: 25,
            pageToken: nextPageToken,
            order:'date',
            regionCode: 'LB'
        }
      });

    if (result)
        return { nextPageToken: result.nextPageToken, data: result.items };
}

export const Paginator = async (ChannelID, nextPageToken = '', vidList = {}, objKey = 0) => {
    const omfg = await getChannelListItems(ChannelID, nextPageToken);
    const list = [];
    if (omfg.data)
    {
        omfg.data.forEach(element => {
          if (element.id.videoId)
            list.push(element.id.videoId);
        });
        if (list.length != 0)
          vidList[objKey] = list;
    }
    if (omfg.nextPageToken)
    {
        objKey++;
        await Paginator(ChannelID, omfg.nextPageToken, vidList, objKey);
    }
    
    return vidList;
}