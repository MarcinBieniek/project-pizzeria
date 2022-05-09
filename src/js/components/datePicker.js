import BaseWidget from '../components/baseWidget.js';
import utils from '../utils.js';
import {select, settings} from '../settings.js';

class DatePicker extends BaseWidget{
  constructor(wrapper){
    super(wrapper, utils.dateToStr(new Date()));
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.datePicker.input);
    thisWidget.initPlugin();

  }
  initPlugin(){
    const thisWidget = this;

    thisWidget.minDate = new Date();
    window.globalMinDate = thisWidget.minDate;
    thisWidget.maxDate = utils.addDays(thisWidget.minDate, settings.datePicker.maxDaysInFuture);
    window.globalMaxDate = thisWidget.maxDate;
    // eslint-disable-next-line no-undef
    flatpickr(thisWidget.dom.input, {
      defaultDate: thisWidget.minDate,
      minDate: thisWidget.minDate,
      maxDate: thisWidget.maxDate,
      locale: {
        firstDayOfWeek: 1
      },
      disable: [
        function(date) {
          return (date.getDay() === 1);
        }
      ],
      onChange: function(selectedDates, dateStr) {
        thisWidget.value = dateStr;
        window.datePickerValue = thisWidget.value;
      },
    });
  }
  parseValue(value){
    return value;
  }

  isValid(){
    return true;
  }

  renderValue(){

  }
}

export default DatePicker;