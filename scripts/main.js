import Schedule from "./Schedule.js";
// CONST
const TC_TOIDA = 25;

let info = {
  SoTCDaDK: 0, // Luong TC ma truong da dang ki
  tongTC: 0,
};

let status_changes = {
  schedule: true,
}

document.querySelector('button#adjust-regis').addEventListener('click', () => {
  toggleHidden('register-section-container'); 
  toggleHidden('code-shower-container');
  status_changes.schedule = true;
});

document.querySelector('button#close-intro-btn').addEventListener('click', () => { 
  togglePopup('intro-container');
});

document.querySelector(`.register-section-container div#status-bar p[id='max-tc']`).innerText = TC_TOIDA;
document.querySelector(`.register-section-container div#status-bar p[id='registed-tc']`).innerText = info.SoTCDaDK;
document.querySelector(`.register-section-container div#status-bar p[id='cur-tc']`).innerText = info.tongTC;

let schedule = new Schedule();

let btn = document.querySelector("button#exit-btn");
btn.addEventListener("click", () => {
  let courseID = document.querySelector('div#DKBTTH-content div#DKBTTH-form table#TKBTTH-table tbody tr').id;
  let tr = document.querySelector(`div.show-result-container table tbody tr#${courseID}`);
  let checkbox = tr.querySelector('input[type="checkbox"]');
  
  togglePopup("overlay-container");
  // Drop the table
  let tbody = document.querySelector("#TKBTTH-table tbody");
  tbody.innerHTML = "";
  
  checkbox.click();
  
});

let scheduleBtn = document.querySelector("button#show-schedule");
scheduleBtn.addEventListener("click", () => {
  let container = document.querySelector('div#footer-content-container');
  if (!status_changes.schedule && container.childElementCount > 0) {
    // hide the schedule
    toggleHidden('footer-content-container');
    container.focus({ focusVisible: true });
  } else if (status_changes.schedule) {
    // update the schedule
    delete container.firstElementChild
    let table = schedule.createTable();
    container.appendChild(table);
    container.focus({ focusVisible: true });
  } else {
    // do nothing
  }
  status_changes.schedule = false;
});

let dkBtn = document.querySelector("button#DK-btn");
dkBtn.addEventListener("click", () => {
  let checkedBox = document.querySelector(
    'table#TKBTTH-table tbody tr input[type="checkbox"]:checked'
  );
  if (checkedBox === undefined || checkedBox === null) {
    showToast("Chưa chọn lớp bài tập nào", TOAST_TYPE.ERROR);
  } else {
    let maLopMoID = checkedBox.className;
    let maLopMoBT = checkedBox.id;
    // Checkbox <- div <- td <- tr
    let div = checkedBox.parentElement;
    let BTtr = checkedBox.parentElement.parentElement.parentElement;
    let lichHoc = BTtr.children[4].innerText;
    updateInputValue(maLopMoID, maLopMoBT, lichHoc);
    let tr = document.querySelector(`div.show-result-container table tbody tr#${BTtr.id}`);
    let {sucess, collapses} = schedule.canBeAddedTHBT(tr);
    if (!sucess) {
      let collapseCourses = '';
      collapses.forEach((course) => {
        collapseCourses += course + ", ";
      });
      showToast(`Trùng lịch học ${collapseCourses}`, TOAST_TYPE.ERROR);
      return;
    } else {
      schedule.addDateTHBT(
        doc[BTtr.id]['Nhóm BT'] !== "" ? 'BT' : 'TH', 
        doc[BTtr.id]['Tên Môn Học'], 
        tr.children[0].innerText, 
        lichHoc
      );
    }
    togglePopup("overlay-container");
    // Drop the table
    let tbody = document.querySelector("#TKBTTH-table tbody");
    tbody.innerHTML = "";
    
  }
});

const updateInputValue = function (maLopMoID, maLopMoBT, lichHoc) {
  let inputWrapper = document.querySelector(
    'table#dkhp-table tbody tr input[value="' + maLopMoID + '"]'
  ).parentElement;
  let soLopBT = parseInt(inputWrapper.querySelector('input#SoLopBT').value);
  let soLopTH = parseInt(inputWrapper.querySelector('input#SoLopTH').value);
  if (soLopBT > 0) {
    inputWrapper.querySelector('input#MaLopMoBT').setAttribute("value", maLopMoBT);
  } else if (soLopTH > 0) {
    inputWrapper.querySelector('input#MaLopMoTH').setAttribute("value", maLopMoBT);
  }
  inputWrapper.querySelector('input#LichHoc').setAttribute("value", lichHoc);
};

let selected = [];

let textContent = null;
let doc = null;
const DKHP_Wrapper = document.querySelector("div.show-result-container");

// Event listener for the submit button
const codeGenerateBtn = document.querySelector("#submit-btn");
codeGenerateBtn.addEventListener("click", () => {
  const textArea = document.querySelector("#web-content");
  textContent = textArea.value;
  try {
    doc = JSON.parse(textContent);
    console.log(doc);
  } catch (error) {
    console.log(error);
    showToast("Format không hợp lệ, vui lòng nhập lại!", TOAST_TYPE.INVALID);
    return;
  }
  showToast("Đã load dữ liệu thành công!", TOAST_TYPE.SUCCESS);
  showDKHP();
  toggleHidden("paste-code-container");
  toggleHidden('show-result-wrapper');
});

let genCodeBtn = document.querySelector("button#generate-code-btn");
genCodeBtn.addEventListener("click", (event) => {
  let codeToShow = `map = new Map();\nBTTHMap = new Map()\n`;

  let checked = document.querySelectorAll(
    '#dkhp-table tbody input[type="checkbox"]:checked'
  );
  checked.forEach((check) => {
    let inputWrapper = check.parentElement;
    let td = inputWrapper.parentElement;
    let tr = td.parentElement;
    let maMh = tr.children[0].innerText;
    let maLop = tr.children[2].innerText;
    let text = `map.set('${maMh}','${maLop}')\n`;
    let soLopBT = parseInt(inputWrapper.children[3].value);
    let soLopTH = parseInt(inputWrapper.children[5].value);
    if (soLopBT > 0 || soLopTH > 0) {
      text += `BTTHMap.set('${inputWrapper.querySelector('#MaLopMoID').value}','${
        soLopBT > 0
          ? inputWrapper.querySelector('#MaLopMoBT').value
          : inputWrapper.querySelector('#MaLopMoTH').value
      }');\n`;
    }
    codeToShow += text;
  });
  codeToShow += endStr;
  event.preventDefault();
  navigator.clipboard.writeText(codeToShow);
  showToast("Đã copy code thành công", TOAST_TYPE.SUCCESS);
});

let confirmRegisBtn = document.querySelector("button#confirm-regis");
confirmRegisBtn.addEventListener("click", () => {
  let checked = document.querySelectorAll(
    '#dkhp-table tbody input[type="checkbox"]:checked'
  );
  if (checked.length === 0) {
    showToast("Chưa chọn lớp nào", TOAST_TYPE.ERROR);
    return;
  } else {
    let confirmedTable = document.querySelector(
      "div#confirmed-courses-container table tbody"
    );
    confirmedTable.innerHTML = "";
    checked.forEach((check) => {
      let checkedTr = check.parentElement.parentElement.parentElement;
      let tr = document.createElement("tr");
      let td1 = document.createElement("td");
      let td2 = document.createElement("td");
      let td3 = document.createElement("td");
      let td4 = document.createElement("td");
      let td5 = document.createElement("td");
      let td6 = document.createElement("td");
      let td7 = document.createElement("td");

      td1.innerText = checkedTr.children[0].innerText;
      td2.innerText = checkedTr.children[1].innerText;
      td3.innerText = checkedTr.children[2].innerText;
      td4.innerText = checkedTr.children[3].innerText;
      td5.innerText = checkedTr.children[6].innerText;
      td6.innerText = checkedTr.children[7].innerText;
      td7.innerText = checkedTr.children[10].innerText;

      td2.classList.add("not-center-text");
      td6.classList.add("not-center-text");

      tr.appendChild(td1);
      tr.appendChild(td2);
      tr.appendChild(td3);
      tr.appendChild(td4);
      tr.appendChild(td5);
      tr.appendChild(td6);
      tr.appendChild(td7);
      confirmedTable.appendChild(tr);
    });
    toggleHidden("code-shower-container");
    toggleHidden("register-section-container");
    showToast("Đăng ký thành công", TOAST_TYPE.SUCCESS);
  }
});

const createTable = function () {
  let table = document.createElement("table");
  table.id = "dkhp-table";
  table.className = "content-table";

  let thead = document.createElement("thead");
  let tr = document.createElement("tr");
  let ths = Object.entries(Object.entries(doc)[0][1]);
  for (const [key, value] of ths) {
    let th = document.createElement("th");
    th.innerText = key;
    tr.appendChild(th);
  }
  let th = document.createElement("th");
  th.innerText = "Đăng ký";
  tr.appendChild(th);
  thead.appendChild(tr);
  table.appendChild(thead);
  return table;
};

const createInputWrapper = function (entries) {
  let div = document.createElement("div");
  div.className = "input-wrapper";
  div.classList.add("checkbox-wrapper-13");
  let LopMoID = document.createElement("input");
  let TenLopMo = document.createElement("input");
  let SoLopBT = document.createElement("input");
  let MaLopMoBT = document.createElement("input");
  let SoLopTH = document.createElement("input");
  let MaLopMoTH = document.createElement("input");
  let LichHoc = document.createElement("input");
  LopMoID.style.display = "none";
  TenLopMo.style.display = "none";
  SoLopBT.style.display = "none";
  MaLopMoBT.style.display = "none";
  SoLopTH.style.display = "none";
  MaLopMoTH.style.display = "none";
  LichHoc.style.display = "none";
  LopMoID.id = "MaLopMoID";
  TenLopMo.id = "TenLopMo";
  SoLopBT.id = "SoLopBT";
  MaLopMoBT.id = "MaLopMoBT";
  SoLopTH.id = "SoLopTH";
  MaLopMoTH.id = "MaLopMoTH";
  LichHoc.id = "LichHoc";

  let inputCheck = document.createElement("input");
  inputCheck.type = "checkbox";
  inputCheck.disabled =
    parseInt(entries["Đã ĐK"]) >= parseInt(entries["Sĩ Số"]) ? true : false;
  inputCheck.className = entries["Mã MH"];
  inputCheck.addEventListener("click", () => {
    checkDK(inputCheck);
  });
  if (entries["THBT"] !== undefined) {
    LopMoID.setAttribute("value", entries["THBT"][0]["MaLopMoID"]);
    TenLopMo.setAttribute("value", entries["Tên Lớp"]);

    // console.log(TenLopMo.value);
    SoLopBT.setAttribute("value", 0);
    SoLopTH.setAttribute("value", 0);
    if (entries["THBT"][0].hasOwnProperty("MaLopMoTH")) {
      SoLopTH.setAttribute("value", entries["THBT"].length);
    } else {
      SoLopBT.setAttribute("value", entries["THBT"].length);
    }
  }
  div.appendChild(inputCheck);
  div.appendChild(LopMoID);
  div.appendChild(TenLopMo);
  div.appendChild(SoLopBT);
  div.appendChild(MaLopMoBT);
  div.appendChild(SoLopTH);
  div.appendChild(MaLopMoTH);
  div.appendChild(LichHoc);

  return div;
};

const showDKHP = function () {
  let container = document.querySelector(".show-result-container");
  if (container.childElementCount > 0) {
    container.removeChild(container.firstChild);
  }
  let table = createTable();
  let tbody = document.createElement("tbody");
  for (const [key, value] of Object.entries(doc)) {
    let tr = document.createElement("tr");
    tr.id = key;
    let entries = Object.entries(value);
    for (const [key1, value1] of entries) {
      if (key1 === "THBT") {
        continue;
      }
      let td = document.createElement("td");
      if (key1 === "Tên Môn Học" || key1 === "Lịch Học") {
        td.className = "not-center-text";
      }
      td.innerText = value1;
      tr.appendChild(td);
    }
    let td = document.createElement("td");
    let div = createInputWrapper(value);

    td.appendChild(div);
    tr.appendChild(td);
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  container.appendChild(table);
  document
    .querySelector("div.register-section-container .submit-btn")
    .setAttribute("style", "display: flex");
};

const checkDK = function (chk) {
  //checkbox <- td <- tr (id)
  let td = chk.parentElement.parentElement;
  let tr = td.parentElement;
  let maLopMoId = tr.id;
  let sotc = parseInt(tr.children[3].innerText);
  if (chk.checked) {
    if (info.SoTCDaDK + info.tongTC + sotc > TC_TOIDA) {
      chk.checked = false;
      clearTHBTValue(maLopMoId);
      showToast("Vượt quá số tín chỉ tối đa", TOAST_TYPE.ERROR);
      return;
    } else if (!schedule.canBeAdded(tr).sucess) {
      chk.checked = false;
      clearTHBTValue(maLopMoId);
      let collapseCourses = '';
      schedule.canBeAdded(tr).collapses.forEach((course) => {
        collapseCourses += course + ", ";
      });
      showToast(`Trùng lịch học ${collapseCourses}`, TOAST_TYPE.ERROR);
      return;
    } else {
      selected.push(maLopMoId);
      info.tongTC += sotc;
      changeDKMHState(maLopMoId, true);
      openBTForm(maLopMoId);
      schedule.addDate(tr);
    }
  } else {
    info.tongTC -= sotc;
    let idx = selected.indexOf(maLopMoId);
    if (idx >= 0) {
      selected.splice(idx, 1);
      changeDKMHState(maLopMoId, false);
    }
    schedule.removeDate(tr);
    clearTHBTValue(maLopMoId);
  }
  updateStatusBar();
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

const clearTHBTValue = function (maLopMoId) {
  let maLopMo = maLopMoId.split("-")[0];
  let input = document.querySelectorAll("table#dkhp-table tbody tr");

  for (let i = 0; i < input.length; i++) {
    if (input[i].children[0].innerText === maLopMo) {
      input[i]
        .querySelector("div.input-wrapper input#MaLopMoBT")
        .setAttribute("value", "");
      input[i]
        .querySelector("div.input-wrapper input#MaLopMoTH")
        .setAttribute("value", "");
      input[i].querySelector("div.input-wrapper input#LichHoc").setAttribute("value", "");
      break;
    }
  }
};

const changeDKMHState = function (maLopMoId, state) {
  let tr = document.getElementById(maLopMoId);
  let checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach((checkbox) => {
    let checkboxID = checkbox.parentElement.parentElement.parentElement.id;
    let checkboxMM =
      checkbox.parentElement.parentElement.parentElement.children[0].innerText;
    if (tr.children[0].innerText === checkboxMM) {
      if (checkboxID !== maLopMoId) {
        checkbox.disabled = state;
      }
    }
  });
};

const openBTForm = function (maLopMoId, td) {
  let tbody = document.querySelector("#TKBTTH-table tbody");
  if (tbody.innerHTML === "") {
    let entries = doc[maLopMoId]["THBT"];
    if (entries !== undefined) {
      for (const [key, value] of Object.entries(entries)) {
        let tr = document.createElement("tr");
        tr.id = maLopMoId;

        let td1 = document.createElement("td");
        let td2 = document.createElement("td");
        let td3 = document.createElement("td");
        let td4 = document.createElement("td");
        let td5 = document.createElement("td");
        let td6 = document.createElement("td");
        
        td1.innerText = value["Nhom"];
        td2.innerText = value["SiSo"];
        td3.innerText = value["DaDK"];
        td4.innerText = value["DiaDiem"];
        td5.innerText = value["LichHoc"];

        let div = document.createElement("div");
        let input = document.createElement("input");
        input.type = "checkbox";
        input.id =
          value["MaLopMoBT"] === undefined
            ? value["MaLopMoTH"]
            : value["MaLopMoBT"];
        input.className = value["MaLopMoID"];
        input.addEventListener("click", () => {
          if (input.checked) {
            // disable other checkboxes
            let checkboxes = document.querySelectorAll(
              '#TKBTTH-table tbody input[type="checkbox"]'
            );
            checkboxes.forEach((checkbox) => {
              if (checkbox.id !== input.id) {
                checkbox.disabled = true;
              }
            });
          } else {
            let checkboxes = document.querySelectorAll(
              '#TKBTTH-table tbody input[type="checkbox"]'
            );
            checkboxes.forEach((checkbox) => {
              checkbox.disabled = false;
            });
          }
        });
        div.className = "input-wrapper";
        div.classList.add("checkbox-wrapper-13");
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
      togglePopup("overlay-container");
    }
  }
};

const togglePopup = function (idToToggle) {
  let popup = document.getElementById("popup");
  let popupContents = popup.children;
  for (let i = 0; i < popupContents.length; i++) {
    if (popupContents[i].id !== idToToggle) {
      popupContents[i].style.display = "none";
    } else {
      popupContents[i].style.display = "block";
    }
  }
  if (popup.classList.contains("show")) {
    popup.classList.remove("show");
    setTimeout(function () {
      popup.style.display = "none";
    }, 500); // Match the duration of the CSS transition
  } else {
    popup.style.display = "block";
    setTimeout(function () {
      popup.classList.add("show");
    }, 10); // Small delay to ensure display:block is applied before opacity transition
  }
};

const endStr = `let DSMon = document.querySelectorAll('#tbDSLopHocLai tbody tr, #tbDSLopMo tbody tr')
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

const toggleHidden = function (idOrClass) {
  let element = document.querySelector(`#${idOrClass}, .${idOrClass}`);
  if (element.classList.contains("hidden")) {
    element.classList.remove("hidden");
  } else {
    element.classList.add("hidden");
  }
};

const updateStatusBar = function() {
  document.querySelector(`.register-section-container div#status-bar p[id='cur-tc']`).innerText = info.tongTC;
}