import {settings, templates, select, classNames} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './amountWidget.js';
import DatePicker from './datePicker.js';
import HourPicker from './hourPicker.js';

class Booking{
  constructor(wrapper){
    const thisBooking = this;

    thisBooking.selectedTable = undefined;
    thisBooking.render(wrapper);
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  getData(){
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(window.globalMinDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(window.globalMaxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam
      ],
    };

    const urls = {
      bookings:      settings.db.url + '/' + settings.db.booking
                                     + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event 
                                     + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:  settings.db.url + '/' + settings.db.event
                                     + '?' + params.eventsRepeat.join('&'),
    };

    // console.log('bookings urls', params)

    Promise.all([
      fetch(urls.bookings),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ]) 
      .then(function(allResponses){
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(), 
          eventsCurrentResponse.json(), 
          eventsRepeatResponse.json(), 
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        // console.log('bookings', bookings);
        // console.log('eventsCurrent', eventsCurrent);
        // console.log('eventsRepeat', eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });

  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};

    for(let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = window.globalMinDate;
    const maxDate = window.globalMinDate;

    for(let item of eventsRepeat){
      if(item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }  
    }

    thisBooking.updateDOM();

  }  

  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
      // console.log('loop', hourBlock);
    
      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }
  
      thisBooking.booked[date][hourBlock].push(table);
    
    }
  }

  updateDOM(){
    const thisBooking = this;

    thisBooking.date = window.datePickerValue;
    thisBooking.hour = utils.hourToNumber(window.hourPickerValue);

    let allAvailable = false;

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] ==  'undefined'
    ){
      allAvailable = true;
    }

    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }

      if(
        !allAvailable
        && 
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }

    }

  }

  render(element){
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget(element);
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.dateWidget = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourWidget = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);

    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.tablesDiv = thisBooking.dom.wrapper.querySelector(select.booking.tablesDiv);

    // console.log('this is thisBooking.dom.tables', thisBooking.dom.tables)

    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);
    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.address);
    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll(select.booking.starters);
    thisBooking.dom.submitForm = thisBooking.dom.wrapper.querySelector(select.booking.submitForm);

  }

  initTables(event){
    const thisBooking = this;

      const clickedElement = event.target;
      const tableNumber = clickedElement.getAttribute('data-table');

      if(clickedElement.classList.contains(classNames.booking.table)){
        if(!clickedElement.classList.contains(classNames.booking.tableBooked)){
          for(let singleTable of thisBooking.dom.tables){
            singleTable.classList.remove(classNames.booking.tableAvailable);
          }
          clickedElement.classList.add(classNames.booking.tableAvailable);
          thisBooking.selectedTable = tableNumber;

          console.log('selectedtable', thisBooking.selectedTable)
        }else{
          alert('This table is booked')
        }
      };
  }

  sendBooking(){

    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.booking;

    const payload = {
      date: window.datePickerValue,
      hour: window.hourPickerValue,
      table: parseInt(thisBooking.selectedTable),
      duration: thisBooking.hoursAmount.value,
      ppl: thisBooking.peopleAmount.value,
      starters: [],
      phone: thisBooking.dom.phone.value,
      address: thisBooking.dom.address.value
    }

    for(let starter of thisBooking.dom.starters) {
      if (starter.checked){
        payload.starters.push(starter.value);
      }
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };


    fetch(url, options)

  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.dateWidget = new DatePicker(thisBooking.dom.dateWidget);
    thisBooking.hourWidget = new HourPicker(thisBooking.dom.hourWidget);

    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();

      for(let table of thisBooking.dom.tables){
        table.classList.remove(classNames.booking.tableAvailable);
      }

      thisBooking.selectedTable = undefined;
    });

    thisBooking.dom.tablesDiv.addEventListener('click', function(event){
      thisBooking.initTables(event);
    });

    thisBooking.dom.submitForm.addEventListener('click', function(event){
      event.preventDefault();
      thisBooking.sendBooking();
    });

  }

}

export default Booking