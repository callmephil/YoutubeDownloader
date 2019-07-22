import MP3Cutter from 'mp3-cutter';
import acrcloud from 'acrcloud';
import fs from 'fs-extra';

const acr = new acrcloud({
    host: 'identify-eu-west-1.acrcloud.com',
    access_key: 'f6edf443b87063938e18e960dc7df283',
    access_secret: 'XSdmIRhEiizqpJjee115asvFTQgFwDBTAXcNbv0j'
});

export const parsevid = async (path) => { 
    await MP3Cutter.cut({
        src: './Downloads/Elton John - Rocket Man (Official Music Video).mp3',
        target: './Downloads/Sample/Elton John - Rocket Man (Official Music Video).mp3',
        start: 0,
        end: 30 
    });

    const sample = fs.readFileSync('./Downloads/Sample/Elton John - Rocket Man (Official Music Video).mp3');
    acr.identify(sample).then(metadata => {
        console.log(metadata.metadata.music[1].artists);
    });
};