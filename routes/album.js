const cheerio = require('cheerio');

const album = {
  // 专辑信息
  '/': async ({req, res, request}) => {
    const {albummid} = req.query;

    if (!albummid) {
      return res.send({
        result: 500,
        errMsg: 'albummid 不能为空',
      });
    }

    try {
      const result = await request({
        url: 'https://c6.y.qq.com/v8/fcg-bin/musicmall.fcg',
        data: {
          _: 1734155602122,
          cv: 4747474,
          ct: 24,
          format: 'json',
          inCharset: 'utf-8',
          outCharset: 'utf-8',
          notice: 0,
          platform: 'yqq.json',
          needNewCode: 1,
          uin: req.cookies.uin,
          g_tk_new_20200303: 1758016319,
          g_tk: 1758016319,
          cmd: 'get_album_buy_page',
          albummid: albummid,
          albumid: 0
        }
      });

      let albumInfo = result.data;
      albumInfo.ar = albumInfo.singerinfo
      albumInfo.name = albumInfo.album_name
      albumInfo.mid = albumInfo.album_mid
      albumInfo.id = albumInfo.album_id
      albumInfo.publishTime = albumInfo.publictime
      
      delete albumInfo.singerinfo;
      delete albumInfo.album_name;
      delete albumInfo.album_mid;
      delete albumInfo.album_id;
      delete albumInfo.publictime;
      delete albumInfo.recomalbum;
      delete albumInfo.sale_info;
      delete albumInfo.songlist;
      
      albumInfo.ar.forEach(obj => {
          if (obj.hasOwnProperty('singermid')) {
              obj.mid = obj.singermid;
              delete obj.singermid;
          }

          if (obj.hasOwnProperty('singername')) {
              obj.name = obj.singername;
              delete obj.singername;
          }
          
          if (obj.hasOwnProperty('singerid')) {
              obj.id = obj.singerid;
              delete obj.singerid;
          }
      });
      
      res.send({
        result: 100,
        data: albumInfo,
      })
    } catch (err) {
      res.send({
        result: 400,
        errMsg: err.message,
      })
    }

  },

  // 专辑的歌曲信息
  '/songs': async ({req, res, request}) => {
    const {raw, albummid} = req.query;

    if (!albummid) {
      return res.send({
        result: 500,
        errMsg: 'albummid 不能为空',
      });
    }
    const result = await request({
      url: 'https://u.y.qq.com/cgi-bin/musicu.fcg?g_tk=5381&format=json&inCharset=utf8&outCharset=utf-8',
      data: {
        data: JSON.stringify({
          comm: {
            ct: 24,
            cv: 10000
          },
          albumSonglist: {
            method: "GetAlbumSongList",
            param: {
              albumMid: albummid,
              albumID: 0,
              begin: 0,
              num: 999,
              order: 2
            },
            module: "music.musichallAlbum.AlbumSongList"
          }
        })
      }
    });

    if (Number(raw)) {
      return res.send(result);
    }

    const resData = {
      result: 100,
      data: {
        list: result.albumSonglist.data.songList.map((item) => item.songInfo),
        total: result.albumSonglist.data.totalNum,
        albummid: result.albumSonglist.data.albumMid,
      }
    };

    res && res.send(resData);
    return resData;
  }
};

module.exports = album

