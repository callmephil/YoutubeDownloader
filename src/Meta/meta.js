import * as mm from 'music-metadata';
import * as util from 'util';
import NodeID3  from 'node-id3';

export const read = (filepath) => {
    mm.parseFile(filepath)
    .then( metadata => {
      console.log(util.inspect(metadata, {showHidden: false, depth: null}));
    })
    .catch((err) => {
      console.error(err.message);
    });
}

export const create = (filename) => {
  const tags = { };
  const lbl = filename.toLowerCase();

  const substrgBefore = (str) => lbl.substr(0, lbl.indexOf(str));
  const substrAfter = (str) => lbl.substr(lbl.indexOf(str), lbl.length);
  const substrBetween = (str1, str2) => lbl.split(str1).pop().split(str2)[0];

  const artistName = substrgBefore(' -');
  const songTitle = filename.includes('(') ? substrBetween('- ', ' (') : substrBetween('- ', '.');
  const remixArtist = filename.includes('Remix') ? substrBetween('(', '.') : 'null';

  if (filename.includes('feat') || filename.includes('Feat'))
    tags.singer = substrBetween('(', ')');
    
  

  // const tags = { title: songTitle, artist: artistName, remix: remixArtist, singer: singer }
  return tags;
}

export const write = (tags, filepath) => {
    try {
        const result = NodeID3.write(tags, filepath);
        const message = result ? 'Meta Data Created successfully' : `Failed to create meta data for ${filepath}`;
        console.log(message);
    } catch (e) { console.log(`mdCreate errors : ${e}`) }
}

let tags = {
    title: "Dans La Peau",
    artist: "Ash (ft. Amelie Martinez)",
    album: "Youtube Manager",
    rating: '3',
  }

// mdCreate(tags, FilePath);
// mdRead(FilePath);