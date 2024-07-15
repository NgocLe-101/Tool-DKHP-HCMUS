// CONST
const TC_TOIDA = 25;

let info = {
  SoTCDaDK: 0, // Luong TC ma truong da dang ki
  tongTC: 0,
};

let btn = document.querySelector('button#exit-btn');
btn.addEventListener('click', () => {
  document.querySelector('div#overlay-container').style.display = 'none';
})

let dkBtn = document.querySelector('button#DK-btn');
dkBtn.addEventListener('click', () => {
  let checkedBox = document.querySelector('table#TKBTTH-table tbody tr input[type="checkbox"]:checked');
  if (checkedBox === undefined || checkedBox === null) {
    alert('Chưa chọn lớp bài tập nào');
  } else {
    let maLopMoID = checkedBox.className;
    let maLopMoBT = checkedBox.id;
    updateInputValue(maLopMoID, maLopMoBT);
    document.querySelector('div#overlay-container').style.display = 'none';
    // Drop the table
    let tbody = document.querySelector('#TKBTTH-table tbody');
    tbody.innerHTML = '';
  }
})

updateInputValue = function(maLopMoID, maLopMoBT) {
  let inputWrapper = document.querySelector('table#dkhp-table tbody tr input[value="' + maLopMoID + '"]').parentElement;
  let soLopBT = parseInt(inputWrapper.children[3].value);
  let soLopTH = parseInt(inputWrapper.children[5].value);
  if (soLopBT > 0) {
    inputWrapper.children[4].setAttribute('value', maLopMoBT);
  } else if (soLopTH > 0) {
    inputWrapper.children[6].setAttribute('value', maLopMoBT);
  }
}

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

let genCodeBtn = document.querySelector("button#generate-code-btn");
genCodeBtn.addEventListener("click", () => {
  let codeToShow = `map = new Map();\nBTTHMap = new Map()\n`;

  let checked = document.querySelectorAll('#dkhp-table tbody input[type="checkbox"]:checked');
  if (checked.length === 0) {
    alert('Chưa chọn lớp nào');
    return;
  } else {
    checked.forEach(check => {
        let inputWrapper = check.parentElement;
        let td = inputWrapper.parentElement;
        let tr = td.parentElement;
        let maMh = tr.children[0].innerText;
        let maLop = tr.children[2].innerText;
        let text = `map.set('${maMh}','${maLop}')\n`;
        let soLopBT = parseInt(inputWrapper.children[3].value);
        let soLopTH = parseInt(inputWrapper.children[5].value);
        if (soLopBT > 0 || soLopTH > 0) {
          text += `BTTHMap.set('${inputWrapper.children[1].value}','${soLopBT > 0 ? inputWrapper.children[4].value : inputWrapper.children[6].value}');\n`;
        }
        codeToShow += text;
    });
    codeToShow += endStr;
    let codeContainer = document.querySelector('textarea#code-shower');
    codeContainer.value = codeToShow;
  }
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
  inputCheck.disabled = parseInt(entries['Đã ĐK']) >= parseInt(entries['Sĩ Số']) ? true : false;
  inputCheck.className = entries['Mã MH'];
  inputCheck.addEventListener('click', () => {
    checkDK(inputCheck);
  });
  if (entries['THBT'] !== undefined) {
    LopMoID.setAttribute('value', entries['THBT'][0]['MaLopMoID']);
    TenLopMo.setAttribute('value', entries['Tên Lớp']);

    // console.log(TenLopMo.value);
    SoLopBT.setAttribute('value', 0);
    SoLopTH.setAttribute('value', 0);
    if (entries['THBT'][0].hasOwnProperty('MaLopMoTH')) {
      SoLopTH.setAttribute('value', entries['THBT'].length);
    } else {
      SoLopBT.setAttribute('value', entries['THBT'].length);
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
      if (key1 === 'Tên Môn Học' || key1 === 'Lịch Học') {
        td.className = 'not-center-text';
      }
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
      clearTHBTValue(maLopMoId);
      return;
    } else {
      selected.push(maLopMoId);
      info.tongTC += sotc;
      changeDKMHState(maLopMoId, true);
      openBTForm(maLopMoId);
    }
  } else {
    info.tongTC -= sotc;
    let idx = selected.indexOf(maLopMoId);
    if (idx >= 0) {
      selected.splice(idx, 1);
      changeDKMHState(maLopMoId, false);
    }
    clearTHBTValue(maLopMoId);
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

clearTHBTValue = function(maLopMoId) {
  let maLopMo = maLopMoId.split('-')[0];
  let input = document.querySelectorAll('table#dkhp-table tbody tr');

  for (let i = 0; i < input.length; i++) {
    if (input[i].children[0].innerText === maLopMo) {
      input[i].querySelector('div.input-wrapper input#MaLopMoBT').setAttribute('value', '');
      input[i].querySelector('div.input-wrapper input#MaLopMoTH').setAttribute('value', '');
      break;
    }
  }
}

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

openBTForm = function(maLopMoId, td) {
  let tbody = document.querySelector('#TKBTTH-table tbody');
  if (tbody.innerHTML === '') {
  let entries = (doc[maLopMoId]['THBT']);
  if (entries !== undefined) {
    for(const [key, value] of Object.entries(entries)) {
      let tr = document.createElement('tr');
      let td1 = document.createElement('td');
      let td2 = document.createElement('td');
      let td3 = document.createElement('td');
      let td4 = document.createElement('td');
      let td5 = document.createElement('td');
      let td6 = document.createElement('td');
  
      td1.innerText = value['Nhom'];
      td2.innerText = value['SiSo'];
      td3.innerText = value['DaDK'];
      td4.innerText = value['DiaDiem'];
      td5.innerText = value['LichHoc'];
      
      let div = document.createElement('div');
      let input = document.createElement('input');
      input.type = 'checkbox';
      input.id = value['MaLopMoBT'] === undefined ? value['MaLopMoTH'] : value['MaLopMoBT'];
      input.className = value['MaLopMoID'];
      input.addEventListener('click', () => {
        if (input.checked) {
          // disable other checkboxes
          let checkboxes = document.querySelectorAll('#TKBTTH-table tbody input[type="checkbox"]');
          checkboxes.forEach(checkbox => {
            if (checkbox.id !== input.id) {
              checkbox.disabled = true;
            }
          })
        } else {
          let checkboxes = document.querySelectorAll('#TKBTTH-table tbody input[type="checkbox"]');
          checkboxes.forEach(checkbox => {
            checkbox.disabled = false;
          })
        }
      })
      div.className = 'input-wrapper';
      div.appendChild(input);
      td6.appendChild(div);

      tr.appendChild(td1);
      tr.appendChild(td2);
      tr.appendChild(td3);
      tr.appendChild(td4);
      tr.appendChild(td5);
      tr.appendChild(td6);
      tbody.appendChild(tr);
    }
    document.querySelector('div#overlay-container').style.display = 'block';
  }
}
}



endStr = `let DSMon = document.querySelectorAll('#tbDSLopHocLai tbody tr, #tbDSLopMo tbody tr')
DSMon.forEach(tr => {
    const children = (tr.children)
    
    try {
        const TenMH = children.item(0).innerText
        const TenLop = children.item(2).innerText
        const mapValue = map.get(TenMH) 
        if (mapValue === TenLop) {
            let divWrapper = tr.lastElementChild;
            // Check if the button is available
            if (divWrapper.childElementCount === 7) {
                let inputs = divWrapper.children;
                // click the button
                divWrapper.lastElementChild.checked = true;
                console.log('clicked')
                let soLopBT = parseInt(inputs[2].value);
                let soLopTH = parseInt(inputs[4].value);
                console.log(tr.id);
                if (soLopBT > 0) {
                    let lopID = tr.id;
                    inputs[3].setAttribute('value', BTTHMap.get(lopID));
                } else if (soLopTH > 0) {
                    let lopID = tr.id;
                    inputs[5].setAttribute('value', BTTHMap.get(lopID));
                }
            }
        }
    } catch (error) {
        // eat exception
        return;
    } 
})

document.querySelector('[type="submit"]').click()`;