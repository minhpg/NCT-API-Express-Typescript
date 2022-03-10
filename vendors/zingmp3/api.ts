import got, { Got } from 'got'
import { getHash256, getHmac512 } from './encrypt'
import qs from 'querystring'

interface Query {
    q?: string,
    id?: string,
    alias?: string,
    page?: number,
    ctime?: number,
    sig?: string
}

interface FetchParams {
    path: Routes,
    query?: Query,
    haveParam?: boolean,
}

enum Routes {
    SectionBottom = '/playlist/get/SectionBottom',
    PlaylistDetail = '/playlist/get/detail',
    ArtistDetail = '/artist/get/detail',
    SongInfo = '/song/get/info',
    SongStreaming = '/song/get/streaming',
    Home = '/home',
    Top100 = '/top100',
    ChartHome = '/chart/get/home',
    WeekChart = '/chart/get/WeekChart',
    NewRelaseChart = '/chart/get/NewReleaseChart',
    Search = '/search/multi'
}

class ZingMP3 {

    private URL_API: string = 'https://zingmp3.vn/api/v2'
    private API_KEY: string = '88265e23d4284f25963e6eedac8fbfa3'
    private SECRET_KEY: string = '2aa2d1c561e809b267f3638c4a307aab'
    private API_VERSION: string = '1.4.0'

    private instance: Got
    private time!: number

    constructor() {
        this.instance = got.extend({
            prefixUrl: this.URL_API,
            headers: require('./headers'),
            responseType: 'json'
        })
        this.setTime()
    }

    private setTime() {
        this.time = Math.floor(Date.now() / 1000)
    }

    private hashParams({ path, query, haveParam } : FetchParams) {
        let params = `ctime=${this.time}`
        if(haveParam && query){
            params += qs.encode({ ...query })
       }
        console.log(params)
        return getHmac512(path+getHash256(params), this.SECRET_KEY)
    }

    private async getCookie() {
        // // const cookies = await this.jar.getCookies(this.URL_API) 
        // await this.instance.get('/')
    }
    
    private async fetch({path, query = {}, haveParam = true } : FetchParams) {
        await this.getCookie()
        this.setTime()
        const signature = this.hashParams({path, query, haveParam})
        const response = await this.instance.get(
            path.replace('/',''),
            {
                searchParams: {
                    ...query,
                    ctime: this.time,
                    sig: signature,
                    apiKey: this.API_KEY,
                    version: this.API_VERSION
                }
            }
        ).json()
        console.log(response)
    }

    getSectionPlaylist(id: string) {
        return this.fetch({
            path: Routes.SectionBottom,
            query: { id }
        })
    }

    getDetailPlaylist(id: string) {
        return this.fetch({
            path: Routes.PlaylistDetail,
            query: { id }
        })
    }

    getDetailArtist(alias: string) {
        return this.fetch({
            path: Routes.ArtistDetail,
            query: { alias }
        })
    }

    getInfoMusic(id: string) {
        return this.fetch({
            path: Routes.SongInfo,
            query: { id }
        })
    }

    getStreaming(id: string) {
        return this.fetch({
            path: Routes.SongStreaming,
            query: { id }
        })
    }

    getHome(page: number) {
        return this.fetch({
            path: Routes.Home,
            query: { page }
        })
    }    

    getTop100() {
        return this.fetch({
            path: Routes.Top100
        })
    }

    getChartHome() {
        return this.fetch({
            path: Routes.ChartHome
        })
    }

    getWeekChart(id: string) {
        return this.fetch({
            path: Routes.WeekChart,
            query: { id }
        })
    }

    getNewReleaseChart(id: string) {
        return this.fetch({
            path: Routes.NewRelaseChart,
            query: { id }
        })
    }

    search(q: string) {
        return this.fetch({
            path: Routes.Search,
            query: { q }
        })
    }
  }

let zing = new ZingMP3()
zing.getInfoMusic('ZWZDBEZE')