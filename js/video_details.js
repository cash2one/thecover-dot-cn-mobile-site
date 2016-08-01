define(function (require) {
  var id = COVER.getUrl('id');
  if (COVER.isEmpty(id)) {
    COVER.skip('index.html');
    return false;
  }
  var app = {
    init: function () {
      var self = this;
      COVER.juicer_register(juicer);
      $('.DownloadApp').on('click', function () {
        COVER.downloadApp();
      });
      $('#startload').show();
      COVER.$post(COVER.apis().newsDetail, 'data=' + JSON.stringify({
            news_id: id
          })).then(function (data) {
        var infotype = 'news'; // 资源类型
        var D = data;
        if (COVER.isEmpty(D)) {
          COVER.skip('404.html');
        }
        var sharedata = {
          'title': D.news_title + ' | 封面新闻' || '封面新闻-因人而异',
          'link': window.location.href,
          'imgUrl': D.share_img || 'http://wapcdn.thecover.cn/wap/1.0.0/img/share_logo.png',
          'desc': D.brief || '封面新闻-因人而异'
        };
        if (COVER.device.isWeixin()) {
          COVER.openapi.weixin.wx_share(sharedata);
        }
        if (D.kind == 4 && !COVER.isEmpty(D.video_url)) {
          $('#video').attr('poster', D.img_video);
          $('#video').attr('src', D.video_url);
          $('.tc-video').show();
          infotype = 'video';
        }
        D.img_top && $('<img>').prop('src', D.img_top).appendTo('#img_top');
        $('.article h1').text(D.news_title || '');
        $('.details-source').text(D.source || '封面新闻');
        $('.details-time').text(D.happen_time && COVER.time_tag('news_detail_subtitle', D.happen_time) || '');
        $('.details').html(D.content || '');
        // 有相关新闻，才显示相关新闻栏
        var related = D.related_list;
        if (!COVER.isEmpty(related) && related.length > 0) {
          self.initRelated(related, infotype);
        }
        $('#startload').hide();
        $('body').removeClass('transparent');
      });
      this.initTalk();
    },
    getReplyList: function () {
      var payload = 'data=' + JSON.stringify({
            "news_id": id,
            "page": 1,
            "page_size": 20
          });
      // console.log(payload);
      return COVER.$post(COVER.apis().getReplyList, payload);
    },
    initTalk: function () {
      var self = this;
      self.getReplyList().then(function (data) {
        // console.log('getReplyList() => ', data);
        $('.news-talk').show();
        if (data.total > 0) {
          $('.news-list ul').html(juicer(self.talkTpl(), data));
        } else {
          $('.news-list').addClass('notalk').html('还没有人评论过，快去APP中抢沙发吧！');
        }
      });
    },
    initRelated: function (data, infotype) {
      // console.log(data);
      var self = this;
      var tpl = self.relatedTpl();
      if (infotype == 'video') {
        tpl = self.relatedVideoTpl();
      }
      var related_block = juicer(tpl, {
        data: data
      });
      $('.article').after(related_block).promise().then(function () {
        $('.thumbnail').css('height', $('.thumbnail').width() / 16 * 9 + 'px');
      });
    },
    relatedTpl: function () {
      var tpl = [
        '<div class="related limited-max-width">',
        '    <div class="related-title">',
        '        <div class="related-name tc-disbk">',
        '            <img src="http://wapcdn.thecover.cn/wap/1.0.0/img/news-icon.png" alt="相关新闻">',
        '            <span>相关新闻</span>',
        '        </div>',
        '    </div>',
        '    <div class="related-list">',
        '     <div class="related-list-inner">',
        '        {@each data as item}',
        '            <div class="related-news-item">',
        '        <a href="${item.news_id, item.flag, item.external_url | Link}">',
        '                <div class="thumbnail" style="background-image: url(${item.img_url});"></div>',
        '<div class="below-img">',
        '                <h3>${item.news_title}</h3>',
        '                <div class="related-date">',
        '                    <span>${item.source | source}</span>',
        '                    <span>${item.review_count}</span>',
        '                </div>',
        '            </div>',
        '        </a>',
        '      </div>',
        '        {@/each}',
        '    </div>',
        '    </div>',
        '</div>'
      ].join('');
      return tpl;
    },
    // 相关视频模板
    relatedVideoTpl: function () {
      var tpl = [
        '<div class="related limited-max-width">',
        '    <div class="related-title">',
        '        <div class="related-name tc-disbk">',
        '            <img src="http://wapcdn.thecover.cn/wap/1.0.0/img/news-icon.png">',
        '            <span>相关视频</span>',
        '        </div>',
        '    </div>',
        '    <div class="related-list">',
        '     <div class="related-list-inner">',
        '        {@each data as item}',
        '            <div class="related-news-item">',
        '        <a href="${item.news_id, item.flag, item.external_url | Link}">',
        '                <div class="thumbnail" style="background-image: url(${item.img_url});"></div>',
        '<div class="below-img">',
        '                <h3>${item.news_title}</h3>',
        '                <div class="related-date">',
        '                    <span>${item.source | source}</span>',
        '                    <span>${item.review_count}</span>',
        '                </div>',
        '            </div>',
        '        </a>',
        '      </div>',
        '        {@/each}',
        '    </div>',
        '    </div>',
        '</div>'
      ].join('');
      return tpl;
    },
    // 评论模板
    talkTpl: function () {
      var tpl = [
        '{@each list as item}',
        '<li>',
        '    <div class="tc-portrait"><img src="${item.avatar | defavatar}" alt=""></div>',
        '    <div class="tc-talkitem">',
        '        <div class="tc-talkname">${item.nickname} <br><span>${item.showTime}</span></div>',
        '        <p>${item.content}</p>',
        '    </div>',
        '</li>',
        '{@/each}'
      ].join('');
      return tpl;
    }
  };
  app.init();
});