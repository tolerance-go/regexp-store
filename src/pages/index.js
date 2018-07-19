/* global $ */
import React from 'react';
import styles from './index.less';
import classnames from 'classnames';
import QueueAnim from 'rc-queue-anim';
import qs from 'qs';
import regexs from '../assets/regexs';
import unionBy from 'lodash.unionby';
import debounce from 'lodash.debounce';
import request from '../request';

const api_base =
  process.env.NODE_ENV === 'development'
    ? 'http://127.0.0.1:7001/'
    : 'https://www.regexp-server.top/';

export default class Index extends React.Component {
  state = {
    show_avatar_id: null,
    results: [],
    regs: [],
    search_num: 0,
    show_data_ource: [],
    data_source: require('../assets/regexs').default.map((item, index) => {
      item.id = index;
      return item;
    }),
    user_infos: {},
  };

  like_num_cache = {};

  componentDidMount = () => {
    $('#operator').scrollToFixed({ marginTop: 10 });

    this.fetch_user();

    const demo_regexp = String(/Hello word/gi);
    const demo_params = JSON.stringify('hello word');
    this.copy(demo_params, 'input_params');
    this.copy(demo_regexp, 'input_regexp');
    this.exec(demo_regexp, demo_params);

    const query = (this.query = qs.parse(window.location.href.split('?')[1]));
    if (query.search) {
      this.$search.value = query.search;
    }
    this.onSearch();
  };

  fetch_like_num = async () => {
    const { show_data_ource } = this.state;
    const results = await Promise.all(
      show_data_ource.map(item => {
        if (this.like_num_cache[item.id]) {
          return Promise.resolve({
            success: true,
            data: this.like_num_cache[item.id],
          });
        }
        return request(api_base + 'like', {
          jsonp: true,
          params: {
            id: item.id,
          },
        }).then(result => {
          Object.assign(result.data, item);
          this.like_num_cache[result.data.id] = result.data;
          return result;
        });
      })
    );

    if (results.every(item => item.success)) {
      this.setState({
        show_data_ource: results.map(item => item.data).sort((a, b) => {
          return b.like_num - a.like_num;
        }),
      });
    }
  };

  fetch_user = async () => {
    const authors = regexs.map(item => item.author).filter(item => !!item);
    const { success, data: profiles } = await request({
      url: api_base + 'github_user_infos',
      jsonp: true,
      params: {
        urls: unionBy(authors, 'author'),
      },
    });

    if (success) {
      const user_infos = profiles.reduce((local, meta) => {
        const { avatar, username, author } = meta;
        local[author] = { avatar, username };
        return local;
      }, {});

      this.setState({ user_infos });
    }
  };

  on_like = debounce(async id => {
    const is_increment = !JSON.parse(localStorage.getItem(id + '_has_like'));
    const { success, data } = await request({
      url: api_base + 'like_change',
      jsonp: true,
      params: {
        id,
        type: is_increment ? 'increment' : 'decrement',
      },
    });
    if (success) {
      this.setState({
        show_data_ource: this.state.show_data_ource.map(item => {
          if (item.id === id) {
            item.like_num = data.like_num;
          }
          return item;
        }),
      });
      localStorage.setItem(id + '_has_like', is_increment);
    }
  }, 200);

  onConsolePress = e => {
    if (e.keyCode === 13) {
      this.exec();
    }
  };

  exec = (p_regex, p_params) => {
    try {
      const regex = p_regex || document.getElementById('input_regexp').value;
      const params = p_params || document.getElementById('input_params').value;
      // eslint-disable-next-line
      const result = eval(regex + '.test(' + params + ')');

      this.setState({
        results: this.state.results.concat({
          content: `${
            regex.length > 40 ? regex.slice(0, 15) + ' ... ' + regex.slice(-15) : regex
          }.test(${params}) => ${result}`,
          timestamp: new Date().getTime(),
        }),
      });
    } catch (err) {
      // eslint-disable-next-line
      window.alert(err);
    }
  };

  onSearch = () => {
    const search = this.$search.value;
    const old_len = this.state.show_data_ource.length;

    this.setState(
      {
        search_num: this.state.search_num + 1,
        show_data_ource: [],
      },
      () => {
        setTimeout(() => {
          this.setState(
            {
              show_data_ource: search
                ? this.state.data_source.filter(item => {
                    if (item.title.match(new RegExp(search, 'ig'))) {
                      return true;
                    }
                    return false;
                  })
                : this.state.data_source,
            },
            () => {
              this.fetch_like_num();
            }
          );
          // https://motion.ant.design/api/queue-anim
        }, old_len * 0 + 450 + 50);
      }
    );
  };

  copy = (regex, id) => {
    const input = document.getElementById(id);
    input.value = regex; // 修改文本框的内容
    input.select(); // 选中文本
    document.execCommand('copy'); // 执行浏览器复制命令
  };

  toggleTooltip = id => {
    const $item = $(id);
    $item.tooltip('enable');
    $item.tooltip('show');
    setTimeout(() => {
      $item.tooltip('hide');
      $item.tooltip('disable');
    }, 1000);
    return $item;
  };

  render() {
    return (
      <div className={styles.page_index}>
        {/* <div
          className="alert alert-primary"
          role="alert"
          style={{
            borderRadius: 0,
          }}
        >
          https服务域名正在备案中，期间全站点赞，正则作者信息展示功能无法正常使用
        </div> */}

        <div className="container-fluid">
          <nav className="nav justify-content-end">
            <a
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link active"
              href="https://github.com/zeeshanu/learn-regex"
            >
              Learn
            </a>
            <a
              onClick={() => {}}
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link"
              href="https://github.com/tolerance-go/regexp-store/edit/master/src/assets/regexs.js"
            >
              Upload
            </a>
            <a
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link"
              href="https://github.com/tolerance-go/regexp-store"
            >
              Github
            </a>
          </nav>
          <div className="row justify-content-center logo">
            <img src={require('../assets/imgs/logo.jpg')} alt="logo" className="logo-img" />
            <div className="log-beta">beta</div>
          </div>

          <div id="operator">
            <div className="row justify-content-center">
              <div className="search col-8 col-md-8">
                <input
                  type="text"
                  className="search-input"
                  placeholder="keywords..."
                  ref={node => (this.$search = node)}
                  onKeyDown={e => {
                    if (e.keyCode === 13) {
                      this.onSearch();
                    }
                  }}
                />
                <div onClick={this.onSearch} className="search-btn">
                  search
                </div>
              </div>
            </div>
            <div className="row justify-content-center">
              <div className="console col-8 col-md-8" id="console">
                <div className="console-input_wrap console-item">
                  <div className="console-text">></div>
                  <input
                    onKeyDown={this.onConsolePress}
                    type="text"
                    className="console-input"
                    id="input_regexp"
                    placeholder="input regexp..."
                  />
                  <div className="console-text">.test (</div>
                  <input
                    onKeyDown={this.onConsolePress}
                    type="text"
                    className="console-input"
                    id="input_params"
                    placeholder="input test content... &amp; press the enter"
                  />
                  <div className="console-text">)</div>
                  <div
                    className="console-remove"
                    onClick={() => {
                      this.setState({
                        results: [],
                      });
                    }}
                  >
                    x
                  </div>
                </div>
                <QueueAnim>
                  {this.state.results.map((result, k) => {
                    return (
                      <div key={result.timestamp} className="console-result console-item result">
                        <div>
                          <div className="console-text">=</div>
                          {result.content}
                        </div>
                        <div
                          className="console-remove"
                          onClick={() => {
                            this.setState({
                              results: this.state.results.filter((item, index) => {
                                return index !== k;
                              }),
                            });
                          }}
                        >
                          -
                        </div>
                      </div>
                    );
                  })}
                </QueueAnim>
              </div>
            </div>
          </div>
        </div>

        <div className="container-fluid cell_container">
          <QueueAnim
            interval={0}
            type={['top', 'bottom']}
            className="cell_row row justify-content-start"
          >
            {this.state.show_data_ource.map((item, key) => {
              return (
                <div key={key + this.state.search_num} className="cell_wrap col-md-3 col-sm-12">
                  <div className="cell">
                    <div
                      className={classnames('avatar', {
                        show: this.state.show_avatar_id === item.id,
                      })}
                      ref={node => (this.$avatar = node)}
                      onMouseEnter={() => {
                        this.setState({
                          show_avatar_id: item.id,
                        });
                      }}
                      onMouseLeave={() => {
                        this.setState({
                          show_avatar_id: null,
                        });
                      }}
                    >
                      <img
                        src={
                          this.state.user_infos[item.author] &&
                          this.state.user_infos[item.author].avatar
                        }
                        onClick={() => {
                          if (item.author) {
                            window.open(item.author);
                          }
                        }}
                        alt=""
                        className="avatar-img"
                      />
                      <div className="avatar-name">
                        {this.state.user_infos[item.author] &&
                          this.state.user_infos[item.author].username}
                      </div>
                    </div>
                    <h5>{item.title}</h5>
                    <div className="cell-content">
                      <ol>{(item.descs || []).map((it, k) => <li key={k}>{it}</li>)}</ol>
                    </div>
                    <input className="fake_input" type="text" id={'fake_input' + item.id} />
                    <div className="cell-actions">
                      <div
                        className="cell-actions-item"
                        data-placement="top"
                        title="copy link success!"
                        data-trigger="manual"
                        id={'share_' + item.id}
                        onClick={() => {
                          this.toggleTooltip('#share_' + item.id);
                          this.copy(
                            window.location.href +
                              '?' +
                              qs.stringify({
                                ...this.query,
                                search: item.title,
                              }),
                            'fake_input' + item.id
                          );
                        }}
                      >
                        <img
                          src={require('../assets/imgs/share.png')}
                          alt="share"
                          className="cell-actions-item-icon"
                        />
                        <div className="cell-actions-item-text">share</div>
                      </div>
                      <div
                        className="cell-actions-item"
                        data-placement="top"
                        title="copy success!"
                        data-trigger="manual"
                        id={'action_' + item.id}
                        onClick={() => {
                          this.toggleTooltip('#action_' + item.id);
                          this.copy(item.regex, 'input_regexp');
                          document.getElementById('input_regexp').scrollIntoViewIfNeeded(true);
                        }}
                      >
                        <img
                          src={require('../assets/imgs/copy.png')}
                          alt="copy"
                          className="cell-actions-item-icon"
                        />
                        <div className="cell-actions-item-text">copy</div>
                      </div>
                      <div
                        className="cell-actions-item"
                        onClick={() => {
                          this.on_like(item.id);
                        }}
                      >
                        <img
                          src={require('../assets/imgs/like.png')}
                          alt="like"
                          className="cell-actions-item-icon"
                        />
                        <div className="cell-actions-item-text">like {item.like_num}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </QueueAnim>
        </div>
      </div>
    );
  }
}
