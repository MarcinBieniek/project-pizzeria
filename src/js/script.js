/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 0,
      defaultMax: 10,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  class Product{
    constructor(id, data){
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();

    }

    initAmountWidget(){
      const thisProduct = this;

      thisProduct.amountWidget  = new AmountWidget(thisProduct.amountWidgetElem);
      
      thisProduct.amountWidgetElem.addEventListener('updated', function(){
        thisProduct.processOrder();
      });
    
    }

    renderInMenu(){
      const thisProduct = this;

      /* generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);

      /* create element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);

      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);

      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);

    }

    getElements(){
      const thisProduct = this;
    
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
      

    }

    initAccordion(){
      const thisProduct = this;

      /* START: add event listener to clickable trigger on event click */
      thisProduct.accordionTrigger.addEventListener('click', function(event){
        
        /* prevent default action for event */
        event.preventDefault();

        /* find active product (product that has active class) */
        const active = document.querySelector(select.all.menuProductsActive);
        
        /* if there is active product and it's not thisProduct.element, remove class active from it */
        if(active && active != thisProduct.accordionTrigger){
          active.classList.remove(classNames.menuProduct.wrapperActive);
        }

        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
        
      }); 
  
    }

    initOrderForm(){
      const thisProduct = this;

      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });

      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });

    }

    processOrder() {
      const thisProduct = this;
    
      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
    
      // set price to default price
      let price = thisProduct.data.price;
    
      // for every category (param)...
      for(let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
    
        // for every option in this category
        for(let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          
          // check if there is param with a name of paramId in formData and if it includes optionId
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
          if(optionSelected) {
            // check if the option is not default
            if(option !== option.default) {
              let optionPrice = option.price;

              price = price + optionPrice;

            }
          } else {
            // check if the option is default 
            if(option === option.default) {
              let optionPrice = option.price;
              price = price - optionPrice;
            } 
          }

          // Code for adding images
          const optionImage = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);
          if(optionImage){ // if image exists
            if(optionSelected){ // if image is selected
              optionImage.classList.add(classNames.menuProduct.imageVisible); // then add active class
            } else { // if not
              optionImage.classList.remove(classNames.menuProduct.imageVisible); // remove
            }
          }
        }
      }
    
      // update calculated price in the HTML
      price *= thisProduct.amountWidget.value;
      thisProduct.priceElem.innerHTML = price;
    }
  }

  // 9.1 Start

  class AmountWidget{
    constructor(element){
      const thisWidget = this;

      thisWidget.value = settings.amountWidget.defaultValue;

      thisWidget.getElements(element);
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions();

    }

    getElements(element){
      const thisWidget = this;
    
      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value){
      const thisWidget = this;

      const newValue = parseInt(value);
      
      const maxAmount = settings.amountWidget.defaultMax;
      const minAmount = settings.amountWidget.defaultMin;

      if(thisWidget.value !== newValue && 
        !isNaN(newValue) && 
        newValue <= maxAmount && 
        newValue >= minAmount){
        thisWidget.value = newValue;
      }

      thisWidget.announce()

      thisWidget.input.value = thisWidget.value;


    }

    initActions(){
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function(){

        thisWidget.setValue(thisWidget.input.value);

      });

      thisWidget.linkDecrease.addEventListener('click', function(event){

        event.preventDefault();

        thisWidget.setValue(thisWidget.value -1);

      });

      thisWidget.linkIncrease.addEventListener('click', function(event){

        event.preventDefault();

        thisWidget.setValue(thisWidget.value +1);

      });

    }

    announce(){
      const thisWidget = this;

      const event = new Event ('updated');
      thisWidget.element.dispatchEvent(event);
    }

  }

  // 9.1 End

  const app = {

    initMenu: function(){
      const thisApp = this;  

      for (let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }

    },

    initData: function(){
      const thisApp = this;

      thisApp.data = dataSource;
    },

    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}
