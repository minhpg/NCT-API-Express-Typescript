import got, { Got } from 'got'
import cryptoJS from 'crypto-js'

enum MediaType {
    Song = 'song',
    Playlist = 'playlist',
    Karaoke = 'karaoke',
    Video = 'video',
    Artist = 'artist'
}

enum SearchType {
    Full = 'full',
    Quick = 'quick'
}

type SearchTypes = MediaType | SearchType

enum Routes {
    Media = 'media/info',
    Lyric = 'lyric',
    Top20 = 'ranking/top20',
    Top100 = 'ranking/top100',
    Home = 'home',
    Topic = 'topic',
    Search = 'search/all'
}


interface FetchParams {
    key?: string,
    category?: string,
    type?: MediaType,
    pageSize?: number
}

interface NCTErrorType {
    code: number,
    message: string
}

class NCTError extends Error {
    statusCode: number
    constructor({ code, message } : NCTErrorType) {
        super(message)
        this.statusCode = code
    }
}

class NCT {

    private KEY: string = 'U2FsdGVkX19BWoF1uTP8o90p9KAWsXZ/VJ41PG7XYF/63qnjiMh1TLy8zAfZBMa9iqiGyPiN5iMUocpD74kAsg=='
    private API_KEY: string = 'e3afd4b6c89147258a56a641af16cc79'

    private instance: Got
    private ResponseKeys = ['search', 'playlist', 'song', 'artist', 'lyric', 'karaoke', 'video', 'artist']

    constructor() {
        this.instance = got.extend({
            prefixUrl: 'https://beta.nhaccuatui.com/api/'
        })
    }

    generateAPISignature = () => {
        const t = new Date().getTime().toString()

        const n: string = cryptoJS.AES.decrypt(this.KEY, 'nhaccuatui').toString(
            cryptoJS.enc.Utf8
        )
        const s: string = cryptoJS.HmacSHA512(t, n).toString();
        return {
            a: this.API_KEY,
            s,
            t,
        }
    }

    async fetch(path: any, params?: FetchParams) {
        const signature = this.generateAPISignature()
        console.log(signature)
        const response: any = await this.instance.post(path, {
            searchParams: signature,
            form: params,
        }).json()
        console.log(response)
        if (response.status != 'success') throw new NCTError(response.error)
        for (const key in response) {
            if (this.ResponseKeys.includes(key)) {
                return response[key]
            }
        }
    }

    getSong(key: string) {
        return this.fetch(Routes.Media, {
            key,
            type: MediaType.Song
        })
    }

    getPlaylist(key: string) {
        return this.fetch(Routes.Media, {
            key,
            type: MediaType.Playlist,
        })
    }

    getLyric(key: string) {
        return this.fetch(Routes.Lyric, {
            key,
            type: MediaType.Song
        })
    }

    getTop20(category: string = 'nhac-viet', size: number = 20) {
        return this.fetch(Routes.Top20, {
            type: MediaType.Song,
            category: category,
            pageSize: size
        })
    }

    search(keyword: string, limit: number = 20, type: SearchTypes = SearchType.Quick) {
        if(!keyword) throw new Error('please provide query')
        return this.fetch(`${Routes.Search}/${type}`, { key: keyword, pageSize: limit })
    }

    getTop100(key: string) {
        return this.fetch(Routes.Top100, { key })
    }

    getHome() {
        return this.fetch(Routes.Home)
    }

    getTopic() {
        return this.fetch(Routes.Topic)
    }

}

export default NCT