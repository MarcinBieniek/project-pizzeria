import {templates, select, classNames} from '../settings.js';

class Home{
    constructor(element){
        const thisHome = this;

        thisHome.render(element);
        thisHome.initWidgets();
        thisHome.initLinks();
    }

    render(element){
        const thisHome = this;

        const generatedHTML = templates.homeWidget(element);
        thisHome.dom = {};
        thisHome.dom.wrapper = element;
        thisHome.dom.wrapper.innerHTML = generatedHTML;
    }

    initWidgets(){
        const thisHome = this;
        
        var elem = document.querySelector('.main-carousel');
        var flkty = new Flickity( elem, {
        // options
        cellAlign: 'left',
        contain: true,
        autoPlay: true,
        autoPlay: 3000
        });

        // element argument can be a selector string
        //   for an individual element
        var flkty = new Flickity( '.main-carousel', {
        // options
        });
    }

    initLinks(){
        const thisHome = this;
        thisHome.buttons = document.querySelectorAll('[class^=homeBox] a');

        console.log('click', thisHome.buttons)

        for(let link of thisHome.buttons){
            link.addEventListener('click', function(event){

            const clickedLink = this;
            event.preventDefault();

            const id = clickedLink.getAttribute('href').replace('#', '');

            thisHome.clickedPage(id);

            window.location.hash = '#/' + id;

            });
        }
    }

    clickedPage(pageId){
        const thisHome = this;
        
        thisHome.pages = document.querySelector(select.containerOf.pages).children;
        thisHome.navLinks = document.querySelectorAll(select.nav.links);

        for (let page of thisHome.pages) {
            page.classList.toggle(classNames.pages.active, page.id == pageId);
            for (let link of thisHome.navLinks) {
                link.classList.toggle(
                    classNames.nav.active,
                    link.getAttribute('href') == '#' + pageId
        );
      }
    }
    }
}

export default Home