// CONST
const TC_TOIDA = 25;

let info = {
  SoTCDaDK: 0, // Luong TC ma truong da dang ki
  tongTC: 0,
};

selected = [];

codeGenerateBtn = document.querySelector("#submit-btn");

let textContent = null;
let doc = null;
const DKHP_Wrapper = document.querySelector('div.show-result-container')

codeGenerateBtn.addEventListener("click", () => {
  const textArea = document.querySelector("#web-content");
  textContent = textArea.value;
  doc = JSON.parse(textContent);
  console.log(doc);
  showDKHP();
});

createTable = function() {
  let table = document.createElement('table');
  table.id = "dkhp-table";

  let thead = document.createElement('thead');
  let ths = Object.entries(Object.entries(doc)[0][1])
  for (const [key, value] of ths) {
    let th = document.createElement('th');
    th.innerText = key;
    thead.appendChild(th);
  }
  let th = document.createElement('th');
  th.innerText = "Đăng ký";
  thead.appendChild(th);
  table.appendChild(thead);
  return table;
}

createInputWrapper = function(entries) {
  let div = document.createElement('div');
  div.className = 'input-wrapper';
  let LopMoID = document.createElement('input');
  let TenLopMo = document.createElement('input');
  let SoLopBT = document.createElement('input');
  let MaLopMoBT = document.createElement('input');
  let SoLopTH = document.createElement('input');
  let MaLopMoTH = document.createElement('input');
  LopMoID.style.display = "none";
  TenLopMo.style.display = "none";
  SoLopBT.style.display = "none";
  MaLopMoBT.style.display = "none";
  SoLopTH.style.display = "none";
  MaLopMoTH.style.display = "none";
  LopMoID.id = 'MaLopMoID';
  TenLopMo.id = 'TenLopMo';
  SoLopBT.id = 'SoLopBT';
  MaLopMoBT.id = 'MaLopMoBT';
  SoLopTH.id = 'SoLopTH';
  MaLopMoTH.id = 'MaLopMoTH';

  let inputCheck = document.createElement('input');
  inputCheck.type = "checkbox";
  inputCheck.className = entries['Mã MH'];
  inputCheck.addEventListener('change', () => {
    checkDK(inputCheck);
  });
  if (entries['THBT'] !== undefined) {
    LopMoID.value = entries['THBT'][0]['MaLopMoID'];
    TenLopMo.value = entries['Tên Lớp'];
    console.log(TenLopMo.value);
    SoLopBT.value = 0;
    SoLopTH.value = 0;
    if (entries['THBT'][0].hasOwnProperty('MaLopMoTH')) {
      SoLopTH.value = entries['THBT'].length;
    } else {
      SoLopBT.value = entries['THBT'].length;
    }
  }

  div.appendChild(inputCheck);
  div.appendChild(LopMoID);
  div.appendChild(TenLopMo);
  div.appendChild(SoLopBT);
  div.appendChild(MaLopMoBT);
  div.appendChild(SoLopTH);
  div.appendChild(MaLopMoTH);

  return div;
}

showDKHP = function() {
  let container = document.querySelector('.show-result-container');
  if (container.childElementCount > 0) {
    container.removeChild(container.firstChild);
  }
  let table = createTable();
  let tbody = document.createElement('tbody');
  for (const [key, value] of Object.entries(doc)) {
    let tr = document.createElement('tr');
    tr.id = key;
    let entries = Object.entries(value);
    for (const [key1, value1] of entries) {
      if (key1 === 'THBT') {
        continue;
      }
      let td = document.createElement('td');
      td.innerText = value1;
      tr.appendChild(td);
    }
    let td = document.createElement('td');
    let div = createInputWrapper(value);
    
    td.appendChild(div);
    tr.appendChild(td);
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  container.appendChild(table);
}


checkDK = function (chk) {
  //checkbox <- td <- tr (id)
  let td = chk.parentElement.parentElement;
  let tr = td.parentElement;
  let maLopMoId = tr.id;
  let sotc = parseInt(tr.children[3].innerText);
  if (chk.checked) {
    if (info.SoTCDaDK + info.tongTC + sotc > TC_TOIDA) {
      chk.checked = false;
      return;
    } else {
      selected.push(maLopMoId);
      info.tongTC += sotc;
      changeDKMHState(maLopMoId, true);
      openBTForm(maLopMoId, td);
    }
  } else {
    info.tongTC -= sotc;
    let idx = selected.indexOf(maLopMoId);
    if (idx >= 0) {
      selected.splice(idx, 1);
      changeDKMHState(maLopMoId, false);
    }
  }
  // dkhp.specialMsg = "";
  // if ($(chk).is(":checked")) {
  //   if (info.SoTCDaDK + info.tongTC + sotc > TC_TOIDA) {
  //     dkhp.specialMsg = dkhp.messages.exceedSoTC;
  //     $(chk).prop("checked", false);
  //     clearTHBTValue(td);
  //   } else {
  //     dkhp.selected.push(maLopMoId);
  //     dkhp.tongTC += sotc;
  //     checkExistedMonHoc(maLopMoId, dkhp.getMonHocCode(maLopMoId), true);
  //     registeringLT = true;
  //     openBTForm(maLopMoId, td);
  //   }
  // } else {
  //   dkhp.tongTC -= sotc;
  //   var idx = $.inArray(maLopMoId, dkhp.selected);
  //   if (idx >= 0) {
  //     dkhp.selected.splice(idx, 1);
  //     checkExistedMonHoc(maLopMoId, dkhp.getMonHocCode(maLopMoId), false);
  //   }
  //   clearTHBTValue(maLopMoId, td);
  // }
};

changeDKMHState = function(maLopMoId, state) {
  let tr = document.getElementById(maLopMoId);
  let checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    let checkboxID = checkbox.parentElement.parentElement.parentElement.id;
    let checkboxMM = checkbox.parentElement.parentElement.parentElement.children[0].innerText;
    if (tr.children[0].innerText === checkboxMM) {
      if (checkboxID !== maLopMoId) {
        checkbox.disabled = state;
      }
    }
  })
}