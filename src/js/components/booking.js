import {templates, select} from '../settings.js';
import AmountWidget from './amountWidget.js';
import DatePicker from './datePicker.js';
import HourPicker from './hourPicker.js';

class Booking{
    constructor(element){
        const thisBooking = this;

        thisBooking.render(element);
        thisBooking.initWidgets();
    }

    render(element){
        const thisBooking = this;

        /* generate HTML code based on templates.bookingWidget */
        const generatedHTML = templates.bookingWidget(element)
 
        /* create empty thisBooking.dom object */
        
        thisBooking.dom = {}

        /* add to object property "wrapper", assing to it container reference */
        thisBooking.dom.wrapper = element;

        /* change wrapper inner on generated HTML code */ 
        thisBooking.dom.wrapper.innerHTML = generatedHTML;

        // Part 2

        thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
        thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
        thisBooking.dom.dateWidget = document.querySelector(select.widgets.datePicker.wrapper);
        thisBooking.dom.hourWidget = document.querySelector(select.widgets.hourPicker.wrapper);

        console.log('thisBooking.dom.peopleAmount', thisBooking.dom.peopleAmount )

    }

    initWidgets(){
        const thisBooking = this;

        thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
        thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
        thisBooking.dateWidget = new DatePicker(thisBooking.dom.dateWidget);
        thisBooking.hourWidget = new HourPicker(thisBooking.dom.hourWidget);

        thisBooking.dom.peopleAmount.addEventListener('updated', function(){

        });

        thisBooking.dom.hoursAmount.addEventListener('updated', function(){

        });



    }
}

export default Booking;