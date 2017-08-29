/*jslint node:true es6*/
const http=require("http")
      ,url=require("url")
      ,fileSystem=require("fs")//Need for the error message
      ;
var functionHttpRequestHandler
    ,functionShowHelp//Default/Error message
    ,functionCapitalize//Something to make *my* life a little easier
    ,httpServer
    ;
functionHttpRequestHandler=function(request,response){
  "use strict";
  var strUtc=url.parse(request.url).pathname.substr(1)
      //Something to keep track of in case someone submits a negative value as a timestamp
      ,intSign=1
      ,strStaticDate='12 15 2015'
      ,strOutput=''
      ,varTmpDate
      ,strContentType={"Content-Type":"text/plain"}
      ,objMonth=[
        {name:"january",abbr:"jan",number:1,max:31}
        ,{name:"february",abbr:"feb",number:2,max:28}
        ,{name:"march",abbr:"mar",number:3,max:31}
        ,{name:"april",abbr:"apr",number:4,max:30}
        ,{name:"may",abbr:"may",number:5,max:31}
        ,{name:"june",abbr:"jun",number:6,max:30}
        ,{name:"july",abbr:"jul",number:7,max:31}
        ,{name:"august",abbr:"aug",number:8,max:31}
        ,{name:"september",abbr:"sep",number:9,max:30}
        ,{name:"october",abbr:"oct",number:10,max:31}
        ,{name:"november",abbr:"nov",number:11,max:30}
        ,{name:"december",abbr:"dec",number:12,max:31}
      ]
      ,arrayString=[]
      ;
  //Check the first character of the processed url and see if it's a negative number
  if(strUtc.charAt(0)==="-"){
    //... if so, store the sign as a separate integer, then remove the minus sign
    //so that the numeric macth can work it's mojo
    intSign=-1;
    strUtc=strUtc.substr(1);
  }
  //Check if (processed) path is *not* a number, and check for a manual date
  if(strUtc.match(/^[0-9]+$/)===null){
    arrayString=strUtc.toLowerCase().split('%20');

    //First bit, check and see if there are text variables? If so, are there 3?
    if(arrayString.length===3){
      //Format 2 digit years by adding a "19", or "20" to the front
      if(arrayString[2].length===2){
        if(parseInt(arrayString[2])<50){
          arrayString[2]="20"+arrayString[2];
        }else{
          arrayString[2]="19"+arrayString[2];
        }
      }
      //Second bit, convert the name of the given month to lower case
      arrayString[0]=arrayString[0].toLowerCase();
      //Formatting being done, it's time to check the year for leap years
      if(
        ((parseInt(arrayString[2]))%4===0 //Check if year is divisible by 4
        && parseInt(arrayString[2])%100!==0) //...but either not a multiple of a hundred
        || parseInt(arrayString[2])%400===0 //...OR divisible by 400
        //&& parseInt(arrayString[2])>1752 //Having done the fancy math, also check if it's more than 1752
      ){
        //If it IS a leap year, set the maximum number of dates for February to 29
        objMonth[1].max=29;
      }
      objMonth.forEach(function(month){
        if((month.name===arrayString[0]||month.abbr===arrayString[0]||month.number===parseInt(arrayString[0]))&&(month.max>=parseInt(arrayString[1]))){

          //Store the date as a string proper, just to make life a little easier
          strStaticDate=functionCapitalize(month.name)+' '+arrayString[1]+', '+arrayString[2];

          //Generate output
          strOutput='{"unix":'+((new Date(strStaticDate).getTime())/1000)+',"natural":"'+strStaticDate+'"}';
        }
      });
      //If the loop above hasn't modified strOutput, there must've been some kind of error, so set things up to show the error page
      if(strOutput===''){
        strContentType={"Content-Type":"text/html"};
        strOutput=functionShowHelp();
      }
    //If the url is a string, but not a valid date, set things up to show the error page
    }else{
      strContentType={"Content-Type":"text/html"};
      strOutput=functionShowHelp();
    }
  }else{
    //The path is a number, so just generate the date & stuff...
    varTmpDate=new Date(parseInt(strUtc)*intSign*1000);
    strOutput='{"unix":'+parseInt(strUtc)*intSign+',"natural":"'+functionCapitalize(objMonth[varTmpDate.getMonth()].name)+' '+varTmpDate.getDate()+', '+varTmpDate.getFullYear()+'"}';
  }
  response.writeHead(200,strContentType);
  response.write(strOutput);
  response.end();
};

functionShowHelp=function(){
  "use strict";
  //Return the contents of 'error_message.html' as a string
  return fileSystem.readFileSync('views/error_message.html','utf8');
};

functionCapitalize=function(str){
  "use strict";
  return str.charAt(0).toUpperCase()+str.substr(1);
};

httpServer=http.createServer(functionHttpRequestHandler);
httpServer.listen(3000);