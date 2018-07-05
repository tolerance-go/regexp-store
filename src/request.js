import qs from 'qs';
import jsonp_fn from 'jsonp';

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    var error = new Error(response.statusText);
    error.response = response;
    throw error;
  }
}

// dataType
function parse(response) {
  const content_type = response.headers.get('Content-Type');
  if (content_type.match('application/json')) {
    return parseJSON(response);
  }
  // if (/image\/jpeg|jpg|png|gif/gi.test(type)) {
  //   return parseIMG(response);
  // }
  // if (/application\/vnd.ms-excel/gi.test(type)) {
  //   return parseExcel(response);
  // }
  return response;
}

function parseJSON(response) {
  return response.json();
}

// function parseTEXT(response) {
//   return response.text();
// }

// function parseIMG(response) {
//   return response.arrayBuffer().then(arryBuffer => {
//     return `data:image/png;base64,${_arrayBufferToBase64(arryBuffer)}`;
//   });
// }

// function parseExcel(response) {
//   return response.arrayBuffer().then(arryBuffer => {
//     return {
//       content: `data:application/vnd.ms-excel;base64,${_arrayBufferToBase64(arryBuffer)}`,
//       fileName: `${decodeURIComponent(
//         response.headers
//           .get('content-disposition')
//           .split(';')[1]
//           .split('=')[1]
//       )}.xlsx`,
//     };
//   });
// }

const external_opts = {};
const body_typify = {
  form(body) {
    body = new FormData();
    for (let key in body) {
      if (body.hasOwnProperty()) {
        body.append(key, body[key]);
      }
    }
    return body;
  },
  json(body) {
    return JSON.stringify(body);
  },
};

function set_default_options(opts) {
  return Object.assign(external_opts, opts);
}

function set_body_typify(type, handle) {
  body_typify[type] = handle;
}

function request(url, opts) {
  if (arguments.length === 2) {
    opts.url = url;
  } else {
    if (typeof url === 'string') {
      opts = { url };
    } else {
      opts = url;
      url = opts.url
    }
  }

  let {
    credentials = 'same-origin',
    body,
    method = body ? 'POST' : 'GET',
    headers = {
      'Content-Type': 'application/json',
    },

    params,
    body_type = 'json', // form | json
    jsonp = false, // 如果是对象类型，作为 jsonp 的 option 传入
    jsonp_opts = {},
    error_handle,
    ...others
  } = {
    ...external_opts,
    ...opts,
  };

  params && (url += '?' + qs.stringify(params));

  body && body_typify[body_type] && (body = body_typify[body_type](body));

  let chain;

  if (jsonp) {
    chain = new Promise((resolve, reject) => {
      jsonp_fn(url, jsonp_opts, function(err, data) {
        if (err) reject(err);
        resolve(data);
      });
    });
  } else {
    chain = fetch(url, {
      credentials,
      method,
      headers,
      body,
      ...others,
    })
      .then(checkStatus)
      .then(parse);
  }

  return chain
    .then(function(data) {
      return packaging_result(true, data);
    })
    .catch(function(error) {
      error_handle && error_handle(error);
      return packaging_result(false, error, error.toString());
    });
}

function packaging_result(success, data, message = '') {
  return {
    success,
    fail: !success,
    data,
    message,
  };
}

export { set_default_options, set_body_typify };
export default request;
