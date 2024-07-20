getCode = function() {
  let text =  `CacMon = document.querySelectorAll("table#tbPDTKQ tbody tr");
reg = new RegExp("showFormDK(BaiTap|ThucHanh)(.+)");
function alterGetNhomLopMo(method, lmid) {
  var returnVal = null;
  var param = { method: method, lmid: lmid, dot: 1 };
  var isFailed = false;
  var xhr = $.ajax({
    type: "GET",
    url: "Modules/SVDangKyHocPhan/HandlerSVDKHP.ashx",
    data: param,
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    cache: false,
    async: false,
    success: function (result) {
      if (result != null) {
        returnVal = result;
      }
    },
    error: function () {
      isFailed = true;
    },
  });
  if (isFailed) {
    xhr.abort();
  }
  return returnVal;
}

function extractID(txt) {
  return /\\d+/.exec(reg.exec(txt)[0])[0];
}

let objectToStore = {};

initObj = function () {
  monObj = {};
  const headers = document.querySelectorAll("#tbPDTKQ thead th");
  headers.forEach((header) => {
    monObj[header.firstChild.innerText] = null;
  });
  return monObj;
};

storeElementObj = function (obj, row) {
  const children = row.children;
  let i = 0;
  for (const [key, value] of Object.entries(obj)) {
    obj[key] = children[i].innerText;
    i++;
  }
};

CacMon.forEach((mon) => {
  monObj = initObj();
  let result = null;
  let ID = null;
  let b_isBT = false;
  const children = mon.children;
  const MaMon = children[0].innerText;
  const MaLop = children[2].innerText;
  const MaMonDK = MaMon + "-" + MaLop;
  if (children[8].childElementCount !== 0) {
    const aHTML = children[8].lastElementChild.outerHTML;
    ID = extractID(aHTML);
    result = alterGetNhomLopMo("LopThucHanh", ID);
  } else if (children[9].childElementCount !== 0) {
    const aHTML = children[9].lastElementChild.outerHTML;
    ID = extractID(aHTML);
    result = alterGetNhomLopMo("LopBaiTap", ID);
    b_isBT = true;
  } else {
    storeElementObj(monObj, mon);
    objectToStore[MaMonDK] = monObj;
    return;
  }
  storeElementObj(monObj, mon);
  if (result !== null) {
    if (b_isBT) {
      monObj["THBT"] = result.LopMoBTs;
    } else {
      monObj["THBT"] = result.LopMoTHs;
    }
  }
  objectToStore[MaMonDK] = monObj;
});

let data = {
  "tableContent": objectToStore,
  "sharedContent": null,
};

objectToStoreTXT = JSON.stringify(data);
const DSLopMo = document.querySelector('#ketqua-dkhp');
let button = document.createElement('button');
button.innerText = 'Copy';
button.addEventListener('click', event => {
    event.preventDefault();
    navigator.clipboard.writeText(objectToStoreTXT)
    alert('Copied to clipboard')
})
button.style = 'width: 100%; height: 50px; font-size: 20px; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;'
DSLopMo.insertBefore(button, DSLopMo.firstChild)`;
  return text;
}

let getCodebtn = document.querySelector('div#intro-container .outer li button');
getCodebtn.addEventListener('click', event => {
  event.preventDefault();
  navigator.clipboard.writeText(getCode());
  alert('Code copied to clipboard!')
});