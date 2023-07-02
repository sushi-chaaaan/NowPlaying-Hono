type YoutubeTrack = {
  title: string
  author_name: string
  author_url: string
  type: string
  height: number
  width: number
  version: string
  provider_name: string
  provider_url: string
  thumbnail_height: number
  thumbnail_width: number
  thumbnail_url: string
  html: string
}

type SpotifyCompatibleTrack = {
  name: string
  artists: {
    name: string
  }[]
  album: {
    name: string
    images: {
      url: string
      width: number | undefined
      height: number | undefined
    }[]
  }
}
