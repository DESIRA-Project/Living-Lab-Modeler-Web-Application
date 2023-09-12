export class ResolutionAwareComponent{
    construtor(){

    }

    isMobile() {
/*        console.log(window.innerWidth);
        console.log(window.innerHeight);*/
       // console.log(typeof window.orientation !== 'undefined');
        //console.log(window.orientation);
        return window.orientation !== undefined
    }

    isMobileScreen(){
        return ( ( window.innerWidth <= 800 ) && ( window.innerHeight <= 900 ) && (window.innerWidth < window.innerHeight)  );
    }

    openBrowserTab(url:string|null){
        if(url !== null && url.length !== 0){
            window.open(encodeURI( url) );
        }
    }

    capitalizeFirstLetter(s:string):string {
        if(s === undefined || s === null) return "";
        if(s.charAt === undefined)return "";
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

}