/* global $ */
import React from 'react';
import styles from './index.less';
import classnames from 'classnames';
import QueueAnim from 'rc-queue-anim';
import qs from 'qs';

export default class Index extends React.Component {
  state = {
    show_avatar_id: null,
    results: [],
    regs: [],
    search_num: 0,
    show_data_ource: [],
    data_source: [
      {
        title: '匹配中文字符',
        // eslint-disable-next-line
        regex: /[\u4e00-\u9fa5]/,
      },
      {
        title: '匹配双字节字符',
        // eslint-disable-next-line
        descs: ['包括汉字在内'],
        regex: /[^\x00-\xff]/,
      },
      {
        title: '匹配空白行',
        // eslint-disable-next-line
        regex: /\n\s*\r/,
      },
      {
        title: '匹配Email地址',
        // eslint-disable-next-line
        regex: /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/,
      },
      {
        title: '匹配网址URL',
        // eslint-disable-next-line
        regex: /[a-zA-z]+:\/\/[^\s]*/,
      },
      {
        title: '匹配国内电话号码',
        regex: /\d{3}-\d{8}|\d{4}-\{7,8}/,
      },
      {
        title: '匹配QQ号',
        regex: /[1-9][0-9]{4,}/,
      },
      {
        title: '匹配中国邮政编码',
        regex: /[1-9]\d{5}(?!\d)/,
      },
      {
        title: '匹配18位身份证号',
        regex: /^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X)$/,
      },
      {
        title: '匹配(年-月-日)格式日期',
        regex: /([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3})-(((0[13578]|1[02])-(0[1-9]|[12][0-9]|3[01]))|((0[469]|11)-(0[1-9]|[12][0-9]|30))|(02-(0[1-9]|[1][0-9]|2[0-8])))/,
      },
      {
        title: '匹配正整数',
        regex: /^[1-9]\d*$/,
      },
      {
        title: '匹配负整数',
        regex: /^-[1-9]\d*$/,
      },
      {
        title: '匹配整数',
        regex: /^-?[1-9]\d*$/,
      },
      {
        title: '匹配非负整数（正整数 + 0）',
        regex: /^[1-9]\d*|0$/,
      },
      {
        title: '匹配非正整数（负整数 + 0）',
        regex: /^-[1-9]\d*|0$/,
      },
      {
        title: '匹配正浮点数',
        regex: /^[1-9]\d*\.\d*|0\.\d*[1-9]\d*$/,
      },
      {
        title: '匹配负浮点数',
        regex: /^-[1-9]\d*\.\d*|-0\.\d*[1-9]\d*$/,
      },
    ].map((item, index) => {
      item.id = index;
      item.username = 'wyatt';
      return item;
    }),
  };

  componentDidMount = () => {
    const demo = `/Hello word/ig.test('hello word')`;
    this.copy(demo);
    this.exec(demo);

    const query = (this.query = qs.parse(window.location.href.split('?')[1]));
    if (query.search) {
      this.$search.value = query.search;
    }
    this.onSearch();
  };

  onConsolePress = e => {
    if (e.keyCode === 13) {
      const input = e.currentTarget.value;
      this.exec(input);
    }
  };

  exec = input => {
    try {
      // eslint-disable-next-line
      const result = eval(input);
      this.setState({
        results: this.state.results.concat({
          content: `${input.split('test')[1]} => ${result}`,
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
          this.setState({
            show_data_ource: search
              ? this.state.data_source.filter(item => {
                  if (item.title.match(new RegExp(search, 'ig'))) {
                    return true;
                  }
                  return false;
                })
              : this.state.data_source,
          });
          // https://motion.ant.design/api/queue-anim
        }, old_len * 0 + 450 + 50);
      }
    );
  };

  copy = (regex, id = 'input') => {
    const input = document.getElementById(id);
    console.log(regex, input);
    input.value = regex; // 修改文本框的内容
    input.select(); // 选中文本
    document.execCommand('copy'); // 执行浏览器复制命令
  };

  render() {
    return (
      <div className={styles.page_index}>
        <nav className="nav justify-content-end">
          <a
            className="nav-link active"
            href="https://github.com/zeeshanu/learn-regex/blob/master/README-cn.md"
          >
            Learn
          </a>
          <a className="nav-link disabled" href="">
            Upload
          </a>
          <a className="nav-link disabled" href="">
            Zone
          </a>
          <a className="nav-link" href="https://github.com/tolerance-go/regexp-store">
            Github
          </a>
        </nav>

        <div className="container">
          <div className="row justify-content-center logo">
            <img src={require('../assets/imgs/logo.jpg')} alt="logo" className="logo-img" />
            <div className="log-beta">beta</div>
          </div>

          <div className="row justify-content-center">
            <div className="console col-10 col-md-8" id="console">
              <div className="console-input_wrap console-item">
                <div className="console-text">></div>
                <input
                  onKeyDown={this.onConsolePress}
                  type="text"
                  className="console-input"
                  id="input"
                  placeholder="exec..."
                />
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

          <div className="row justify-content-center">
            <div className="search col-10 col-md-8">
              <input
                type="text"
                className="search-input"
                placeholder="keywords"
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
        </div>

        <div className="container-fluid cell_container">
          <QueueAnim
            interval={0}
            type={['top', 'bottom']}
            className="cell_row row justify-content-start"
          >
            {this.state.show_data_ource.map((item, key) => {
              return (
                <div key={item.id} className="cell_wrap col-md-3 col-sm-12">
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
                      <img src={require('../assets/imgs/duck.jpg')} alt="" className="avatar-img" />
                      <div className="avatar-name"> {item.username}</div>
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
                          const $item = $('#share_' + item.id);
                          $item.tooltip('enable');
                          $item.tooltip('show');
                          setTimeout(() => {
                            $item.tooltip('hide');
                            $item.tooltip('disable');
                          }, 1000);
                          this.query.search = item.title;
                          this.copy(
                            window.location.href + '?' + qs.stringify(this.query),
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
                          const $item = $('#action_' + item.id);
                          $item.tooltip('enable');
                          $item.tooltip('show');
                          setTimeout(() => {
                            $item.tooltip('hide');
                            $item.tooltip('disable');
                          }, 1000);
                          this.copy(item.regex);
                        }}
                      >
                        <img
                          src={require('../assets/imgs/copy.png')}
                          alt="copy"
                          className="cell-actions-item-icon"
                        />
                        <div className="cell-actions-item-text">copy</div>
                      </div>
                      {/* <div className="cell-actions-item">
                        <img src={require("../assets/imgs/like.png")} alt="like" className="cell-actions-item-icon" />
                        <div className="cell-actions-item-text">like</div>
                      </div> */}
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
