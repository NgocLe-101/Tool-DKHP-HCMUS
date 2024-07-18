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
        let startTime = parseInt(time.split("-")[0]);
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
}