const {parseArgs} = require('node:util');
const axios = require('axios');

const videoUrlRegexp = new RegExp('[\'\"](https://)(.+)\.mp4[\'\"]', 'gm');

async function getPageUrl() {

    const options = {
        url: {
            type: "string",
            short: "i",
        }
    };

    const {
        values,
        positionals
    } = parseArgs({
        options: options,
        allowPositionals: true,
        strict: false
    });

    const url = positionals[0] ?? values['url'];
    if (!url) {
        throw new Error('No url provided');

    }
    return url;

}

async function getVideoUrl(pageUrl) {

    return axios.get(pageUrl).then(response => {

        if (response.status !== 200) {
            throw new Error(`Unable to get page content: http status code is [${response.status}] (${response.statusText})`)
        }

        const pageContent = String(response.data);

        const videoUrls = pageContent.match(videoUrlRegexp);

        if(videoUrls.length < 1){
            throw new Error('No video urls found');
        }

        return videoUrls.pop();
    })

}

async function main() {
    /**
     *
     * @returns {Promise<string>}
     */
    function resolveVideoUrl() {
        return getPageUrl().then(pageUrl => {
            return getVideoUrl(pageUrl);
        }).then(function(videoUrl) {
            return videoUrl;
        });
    }

    return await resolveVideoUrl();

}

main().then(url => {
    console.log(url);
}).catch(e => {
    console.error(e);
})


