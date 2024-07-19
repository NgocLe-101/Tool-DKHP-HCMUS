const DEFAULT_OPTIONS = {
    regex: /T\d\(\d-\d+\)/g,
    WeekDate: {
        "2": {}, // T2
        "3": {}, // T3
        "4": {}, // T4
        "5": {}, // T5
        "6": {}, // T6
        "7": {}, // T7
    }
}

export default class Schedule {
     
    constructor(options) {
        Object.entries({...DEFAULT_OPTIONS,...options}).forEach(([key, value]) => {
            this[key] = value;
        });
    }

    canBeAdded(tr) {
        let DateString = tr.children[7].innerText;
        let canBeAdded = true;
        let Collapses = new Set();
        DateString.match(this.regex).forEach((match) => {
            let day = match[1];
            let time = match.slice(3,match.length - 1);
            let {sucess, collapses} = this.__canBeAdded(day, time);
            canBeAdded = canBeAdded && sucess;
            collapses.forEach((collapse) => {
                Collapses.add(collapse);
            });
        });
        let DateStringTHBT = tr.lastChild.querySelector('input#LichHoc').value;
        if (DateStringTHBT !== "") {
            DateStringTHBT.match(this.regex).forEach((match) => {
                let day = match[1];
                let time = match.slice(3,match.length - 1);
                let {sucess, collapses} = this.__canBeAdded(day, time);
                canBeAdded = canBeAdded && sucess;
                collapses.forEach((collapse) => {
                    Collapses.add(collapse);
                });
            });
        }
        return {sucess: canBeAdded, collapses: Collapses};
    }

    canBeAddedTHBT(tr) {
        let canBeAdded = true;
        let Collapses = new Set();
        let DateStringTHBT = tr.lastChild.querySelector('input#LichHoc').value;
        if (DateStringTHBT !== "") {
            DateStringTHBT.match(this.regex).forEach((match) => {
                let day = match[1];
                let time = match.slice(3,match.length - 1);
                let {sucess, collapses} = this.__canBeAdded(day, time);
                canBeAdded = canBeAdded && sucess;
                collapses.forEach((collapse) => {
                    Collapses.add(collapse);
                });
            });
        }
        return {sucess: canBeAdded, collapses: Collapses};
    }

    __canBeAdded(day, time) {
        let timeInDay = this.WeekDate[day];
        let startTime = parseInt(time.split("-")[0]) - 1;
        let endTime = parseInt(time.split("-")[1]) + 1;
        
        let hasTimeInStart = false;
        let hasTimeInEnd = false;
        let collapses = [];
        Object.entries(timeInDay).forEach(([range, value]) => {
            let rangeStart = parseInt(range.split("-")[0]);
            let rangeEnd = parseInt(range.split("-")[1]);
            if (rangeEnd <= startTime) {
                hasTimeInStart = true;
            } else if (endTime <= rangeStart) {
                hasTimeInEnd = true;
            } else {
                collapses.push(value);
            }
        });
        if (Object.entries(timeInDay).length === 0) {
            return { sucess: true, collapses: []};
        } else if (Object.entries(timeInDay).length === 1) {
            if (hasTimeInStart || hasTimeInEnd) {
                return { sucess: true, collapses: []};
            }
            return {sucess: false, collapses: collapses};
        }
        if (hasTimeInStart && hasTimeInEnd) {
            return { sucess: true, collapses: []};
        }
        return { sucess: false, collapses: collapses};
    }

    addDate(tr) {
        if (!this.canBeAdded(tr)) {
            throw new Error("Overlapping time in schedule");
        }
        // console.log(DateString.match(this.regex));
        let DateString = tr.children[7].innerText;
        let DateStringSplit = DateString.split(';');
        DateStringSplit.forEach((dayString) => {
             dayString.match(this.regex).forEach((match)=> {
                let day = match[1];
                let time = match.slice(3,match.length - 1);
                this.__addDayTime(day, time, tr.children[1].innerText);
             });
        });
        // DateString.match(this.regex).forEach((match) => {
        //     console.log(match);
        //     let day = match[1];
        //     let time = match.slice(3,match.length - 1);
        //     this.__addDayTime(day, time);
        // });
    }
    __addDayTime(day, time, schedule) {
        let timeInDay = this.WeekDate[day];
        timeInDay[time] = schedule;
    }

    addDateTHBT(indicatorText, TenLopMo, TenLopTHBT, lichHoc) {
            let lichHocSplit = lichHoc.split(';');
            lichHocSplit.forEach((dayString) => {
                dayString.match(this.regex).forEach((match)=> {
                    let day = match[1];
                    let time = match.slice(3,match.length - 1);
                    this.__addDayTime(day, time, `${indicatorText} ${TenLopMo} - Lớp: ${TenLopTHBT}`);
                });
            });
    }

    removeDate(tr) {
        let DateString = tr.children[7].innerText;
        DateString.match(this.regex).forEach((match) => {
            let day = match[1];
            let time = match.slice(3,match.length - 1);
            this.__removeDayTime(day, time);
        });
        let DateStringTHBT = tr.lastChild.querySelector('input#LichHoc').value;
        if (DateStringTHBT !== "") {
            DateStringTHBT.match(this.regex).forEach((match) => {
                let day = match[1];
                let time = match.slice(3,match.length - 1);
                this.__removeDayTime(day, time);
            });
        }
    }

    __removeDayTime(day, time) {
        let timeInDay = this.WeekDate[day];
        if (timeInDay[time]) {
            delete timeInDay[time];
        }
    }


    getWeekDate() {
        return this.WeekDate;
    }

    __createTableFrame() {
        let table = document.createElement('div');
        table.className = "schedule-table";
        let thead = document.createElement('div');
        thead.className = "thead";
        let theadTr = document.createElement('div');
        theadTr.className = "tr";

        let th = document.createElement('p');
        th.className = "th";
        th.innerText = "Lịch học";

        let th2 = document.createElement('p');
        th2.className = "th";
        th2.innerText = "Thứ 2";

        let th3 = document.createElement('p');
        th3.className = "th";
        th3.innerText = "Thứ 3";

        let th4 = document.createElement('p');
        th4.className = "th";
        th4.innerText = "Thứ 4";

        let th5 = document.createElement('p');
        th5.className = "th";
        th5.innerText = "Thứ 5";

        let th6 = document.createElement('p');
        th6.className = "th";
        th6.innerText = "Thứ 6";

        let th7 = document.createElement('p');
        th7.className = "th";
        th7.innerText = "Thứ 7";

        theadTr.appendChild(th);
        theadTr.appendChild(th2);
        theadTr.appendChild(th3);
        theadTr.appendChild(th4);
        theadTr.appendChild(th5);
        theadTr.appendChild(th6);
        theadTr.appendChild(th7);

        thead.appendChild(theadTr);
        table.appendChild(thead);
        return table;
    }

    createTable() {
        let table = this.__createTableFrame();
        let tbody = document.createElement('div');
        tbody.className = "tbody";
        let lichHocTr = document.createElement('div');
        lichHocTr.className = "tr";
        for (let i = 1; i <= 12; i++) {
            let td = document.createElement('p');
            td.className = "td";
            td.innerText = i;
            lichHocTr.appendChild(td);
        }
        tbody.append(lichHocTr);
        Object.entries(this.WeekDate).forEach(([day, timeInDay]) => {
            console.log(day);
            let tr = document.createElement('div');
            tr.className = "tr";
            let timeInDays = Object.keys(timeInDay).sort();
            if (timeInDays.length === 0) {
                for (let i = 0; i < 12; i++) {
                    let td = document.createElement('p');
                    td.className = "td";
                    tr.appendChild(td);
                }
            } else {
                let index = 1;
                for (let i = 0;i<timeInDays.length;i++) {
                    let startTime = parseInt(timeInDays[i].split("-")[0]);
                    if (index !== startTime) {
                        for (let j = index; j < startTime; j++) {
                            let td = document.createElement('p');
                            td.className = "td";
                            tr.appendChild(td);
                        }
                        index = startTime;
                    }
                    let endTime = parseInt(timeInDays[i].split("-")[1]);
                    let diff = endTime - startTime + 1;
                    let td = document.createElement('p');
                    td.className = "td";
                    td.classList.add('value-cell');
                    td.innerText = timeInDay[timeInDays[i]];
                    td.setAttribute('style',`flex: ${diff}`);
                    tr.appendChild(td);
                    index += diff;
                    if (index - parseInt(index) > 0) {
                        let td = document.createElement('p');
                        td.className = "td";
                        td.setAttribute('style',`flex: ${1 - (index - parseInt(index))}`);
                        tr.appendChild(td);
                        index = parseInt(index) + 1;
                    }
                }
                if (index <= 12) {
                    for (let i = index; i <= 12; i++) {
                        let td = document.createElement('p');
                        td.className = "td";
                        tr.appendChild(td);
                    }
                }
                console.log(timeInDays);
            }
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        return table;
    }
}