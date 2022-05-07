import {settings, templates, select} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './amountWidget.js';
import DatePicker from './datePicker.js';
import HourPicker from './hourPicker.js';

class Booking{
  constructor(wrapper){
    const thisBooking = this;

    thisBooking.render(wrapper);
    thisBooking.initWidgets();
    thisBooking.getData();

  }

  getData(){
    const thisBooking = this; 

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        endDateParam,
      ],
    };

    const urls = {
      booking: settings.db.url + '/' + settings.db.booking
                                     + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event 
                                           + '?' + params.eventsCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.event 
                                          + '?' + params.eventsRepeat.join('&'),
    };

    console.log('getData,url', urls);
  }

  render(element){
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget(element);
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
    thisBooking.dom.dateWidget = document.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourWidget = document.querySelector(select.widgets.hourPicker.wrapper);

  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.dateWidget = new DatePicker(thisBooking.dom.dateWidget);
    thisBooking.hourWidget = new HourPicker(thisBooking.dom.hourWidget);

  }
}

export default Booking;