const got = require('got')
const crypto = require('crypto')
const qs = require('querystring')


module.exports = class NCT {

    NCT_V1_TOKEN_KEY = 'nct@asdgvhfhyth1391515932000'

    INDEX = 1

    SIZE = 30

    constructor() {

    }

    checkValidUrl() {
        nct_valid = match("https?:\/\/www\.nhaccuatui\.com\/bai-hat\/[-.a-z0-9A-Z]+\.html", link)
    }

    async getToken() {
        const options = {
            form: {
                deviceinfo: `{"DeviceID":"dd03852ada21ec149103d02f76eb0a04","DeviceName":"TrolyFaceBook.Com","OsName":"SmartTV","OsVersion":"8.0","AppName":"NCTTablet","AppVersion":"1.3.0","UserName":"0","QualityPlay":"128","QualityDownload":"128","QualityCloud":"128","Network":"WIFI","Provider":"BeDieuApp"}`,
                md5: `488c994e95caa50344d217e9926caf76`,
                timestamp: 1497863709521
            },
        }

        const endpoint = 'https://graph.nhaccuatui.com/v2/commons/token'
        const response = await got.post(endpoint, options).json()
        return response
    }

    async getV1(url) {
        const token = await this.getToken()
        const options = {
            headers: {
                "Connection": "keep-alive",
                "Keep-Alive": "300",
                "Accept-Charset": "ISO-8859-1,utf-8;q=0.7,*;q=0.7",
                "Accept-Language": "en-us,en;q=0.5",
                "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.124 Safari/537.36"
            },
            searchParams: {
                access_token: token.data.accessToken
            },
            https: {
                rejectUnauthorized: false
            },
            followRedirect: false
        }
        const response = await got.get(url, options)
        console.log(response.headers)
        return response
    }

    createV1Token() {
        return crypto.createHash('md5').update(this.NCT_V1_TOKEN_KEY).digest('hex')
    }

    createV1SearchToken(type, keyword) {
        const value = type + keyword + this.INDEX + this.SIZE + this.NCT_V1_TOKEN_KEY
        return crypto.createHash('md5').update(value).digest('hex')
    }

    createV1SearchUrl(action, token, option) {
        // http://api.m.nhaccuatui.com/mobile/v5.0/api
        // ?secretkey=nct@mobile_service
        // &deviceinfo={"DeviceID":"90c18c4cb3c37d442e8386631d46b46f","OsName":"ANDROID","OsVersion":"10","AppName":"NhacCuaTui","AppVersion":"5.0.1","UserInfo":"","LocationInfo":""}
        // &pageindex='.$this -> index.'
        // &pagesize='.$this -> size.'
        // &time=1391515932000
        // &token='.$token.'
        // &action='.$action.'
        // &'.$option

        const params = {
            secretkey: 'nct@mobile_service',
            deviceinfo: `{"DeviceID":"90c18c4cb3c37d442e8386631d46b46f","OsName":"ANDROID","OsVersion":"10","AppName":"NhacCuaTui","AppVersion":"5.0.1","UserInfo":"","LocationInfo":""}`,
            pageindex: this.INDEX,
            pagesize: this.SIZE,
            time: 1391515932000,
            token: token,
            action: action,
            option: option
        }

        return `http://api.m.nhaccuatui.com/mobile/v5.0/api?${qs.encode(params)}`
    }

    FIELDS_MAP = {
        '1': 'uid',
        '2': 'title',
        '3': 'artist',
        '5': 'listen_count',
        '6': 'url',
        '7': '128kbit',
        '8': 'poster_url',
        '10': 'duration',
        '11': '128kbit',
        '12': '320kbit',
        // '19' : 'lossless'
    }

    parseSong(song) {
        console.log(song)
        const song_parsed = { qualities: {} }
        Object.keys(song).map((key) => {
            const correspond_key = this.FIELDS_MAP[key]
            if (correspond_key) {
                if (typeof (song[key]) != 'number' && song[key].includes('mp3')) {
                    song_parsed.qualities[correspond_key] = song[key]
                }
                else {
                    song_parsed[correspond_key] = song[key]
                }
            }
        })
        return song_parsed
    }

    async getSongDetail(song_id) {
        const endpoint = `https://graph.nhaccuatui.com/v1/songs/${song_id}`
        const response = await this.getV1(endpoint)
        console.log(response)
    }

    async getPlaylistDetail(playlist_id) {
        const endpoint = `https://graph.nhaccuatui.com/v1/playlists/${playlist_id}`
        const response = await this.getV1(endpoint)
        const songs = response.data['9'].map((song) => {
            return this.parseSong(song)
        })
        const data = response.data
        console.log({
            uid: data['1'],
            title: data['2'],
            poster_url: data['4'],
            url: data['8'],
            songs: songs
        })
    }

    async songSearch(keyword) {
        const action = 'search-song'
        const token = this.createV1SearchToken(action, keyword)
        const endpoint = this.createV1SearchUrl(action, token, `keyword=${keyword}`)
        const response = await this.getV1(endpoint)
        console.log(response)
    }

}