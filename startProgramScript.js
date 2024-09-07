// T1 Gateway
// Ver 4.1

var gateway = `ws://${window.location.hostname}/ws`;
var websocket;
window.addEventListener('load', onload);

var illum = new Boolean(false);
var pump = new Boolean(false);
var compressor = new Boolean(false);
var timer = new Boolean(false);
var leader = new Boolean(false); //False = Member, true = Leader
var version = new String();
var choosenProgram = new String();
var programIndex;

//Program running flags
var program = new Boolean(false);
var preProgram = new Boolean(false);
var preProgramManuell = new Boolean(false);

var progressValue = 0;
var programPos = 0;

var validConnection = 0; //Connection counter

setInterval(checkConnection, 3000);

function checkConnection()
{
    //Increase connection counter
    validConnection++;
    
    if (validConnection > 2) {
        //Turn background red
        document.body.style.background = 'red';
        
        //Send PING
        websocket.send(0xA);
    }
    

}


function onload(event) {
    initWebSocket();
    
    //Show program text
    document.getElementById("text").value = "GÖM TEXT";
    document.getElementsByClassName('programsTable')[0].style.display = 'inline';
    


}

function startProgramLoad() {
    
    //Get URL
    var URL = new String;
    
    URL = window.location.href;
    programIndex = parseInt(URL.substr(URL.length-3, 3));

    //console.log(programIndex);
    
    //Set program title
    for (var i = 0; i < programsId.length; ++i) {
        if (programsId[i].id == programIndex) {
            //Match
            document.getElementById("programTitle").innerHTML = programsId[i].name;
            choosenProgram = programsId[i].name;
            //Fill table
            
           
            
            updateProgramList(programsId[i].name);
        }   
    }  
    
    //Lane checkboxes
    if (localStorage.getItem("lane1") == "true") { document.getElementById('lane1').checked = true;  } else { document.getElementById('lane1').checked = false; }
    
    if (localStorage.getItem("lane2") == "true") { document.getElementById('lane2').checked = true; } else { document.getElementById('lane2').checked = false; }
    
 
    
    

    
}  



function initWebSocket() {
    
    console.log('Trying to open a WebSocket connection…');
   
    websocket = new WebSocket(gateway);
    websocket.onopen = onOpen;
    websocket.onclose = onClose;
    websocket.onmessage = onMessage;
}

function onOpen(event) {
    console.log('Connection opened');
    
}

function onClose(event) {
    console.log('Connection closed');
    setTimeout(initWebSocket, 500);
}




function onMessage(event) {
    console.log(event.data);
    
    //Reset connection counter
    validConnection = 0;
    //Turn background white
    document.body.style.background = 'white';
    
    var myObj = JSON.parse(event.data);
    var keys = Object.keys(myObj);
    
    console.log(keys.length);
    
    //Update table
    updateProgramList(choosenProgram);

    for (var i = 0; i < keys.length; i++){
        var key = keys[i];
        //console.log(key);
   
        
        //Preprogrammed program
        if (key == "preProgram") {
            //Program
            if (myObj[key] > 0)  {
                //Preprogrammed program running
                
                //Set value to progress bar just first time
                if (preProgram == false) { 
                    preProgressValue = myObj[key]+1;
                    const preProgress = document.getElementById("preProgramProgress");
                    preProgress.max = preProgressValue;//100;
                   
                }

                //Increase slider
                const preProgress = document.getElementById("preProgramProgress");
                preProgress.value = (preProgressValue - myObj[key]+1);
               
                programPos = (preProgressValue - myObj[key]+1);
                      
                
                preProgram = true;
                
                document.getElementById("preProgramStartStopButton").value = "STOPPA PROGRAM";
                document.getElementById("preProgramStartStopButton").style.backgroundColor = 'red'; 
                                
                //Disable reset button
               // document.getElementById("preProgramResetSliders").disabled = true;
                
                                                 
            } else {
                //Not running
                    
                preProgram = false;
                
                document.getElementById("preProgramStartStopButton").value = "STARTA PROGRAM";
                document.getElementById("preProgramStartStopButton").style.backgroundColor = '#32612D';
                
                document.getElementById("preProgramExtra").value = "EXTRA";
                document.getElementById("preProgramExtra").style.backgroundColor = '#32612D';
                
                //Reset timer value
                //document.getElementById("preProgramTimerTime").innerHTML = 0;      
                
                //Reset progress bar
                const preProgress = document.getElementById("preProgramProgress");
                preProgress.value = 0;
                
                //Reset big counter
                document.getElementById("preProgramTimerTime").innerHTML = "0";
                
                //Reset table
                updateProgramList(choosenProgram);
                
                

            }
        }  
        
       
        
        //Extra button
        if (key == "extraButton") {
        
            if (myObj[key] == 0) {
                //No extra function enabled
                document.getElementById("preProgramExtra").value = "EXTRA";
                
                //Set color
                document.getElementById("preProgramExtra").style.backgroundColor = '#32612D';
                
                //Reset flag
                fieldFlag = false;
            }
            
            if (myObj[key] == 1) {
                //Fast forward Precsion
                document.getElementById("preProgramExtra").value = "GÅ TILL ELD UPPHÖR";
                           
                //Set color
                document.getElementById("preProgramExtra").style.backgroundColor = 'Blue';
            }
            
            if (myObj[key] == 2) {
                //Pause Milsnabb
                document.getElementById("preProgramExtra").value = "GÅ TILL PATRON UR";
                           
                //Set color
                document.getElementById("preProgramExtra").style.backgroundColor = 'Blue';
            }
            
            if (myObj[key] == 3 && fieldFlag == false) {
                //Pause Fält
                if (confirm("Om alla skyttar är klara väljer du OK. Väljer du avbryt så kommer ytterliggare ett skjutkommando 'ALLA KLARA?' att aktiveras")) {
                    //OK continue program
                    websocket.send("playPreProgram");
                    
                    fieldFlag = true;
                   
                  } else {
                    //Play another sound commando "ALLA KLARA?"
                    websocket.send("fieldBackPreProgram");
                      
                    fieldFlag = true;
                }
            }
            
            
        }  
        
        //Timer block
        if (key == "timerBlock") {
            //document.getElementById("preProgramTimerTime").innerHTML = myObj[key];
        }
        

        
        //Latest program
        if (key == "latestProgram") {
            //Check what program
            for (var j = 0; j < programsId.length; ++j) {
                if (programsId[j].id == myObj[key]) { 
                    //Match
                    document.getElementById("latestProgram").innerHTML = "Senast körda program: " + programsId[j].name;
                }   
            } 
            
        }
        
        //Start program via remote
        if (key == "remote") {
           
            if (myObj[key] == 1) {
                //Activate START/STOP button
                //Only start, not stop
                if (preProgram == false) {  preProgramStartStop() }
            }   
        }
        
       
        
        
        
        
        
    }
}



function preProgramStartStop() {
    //Start/Stop preprogrammed program
    
    console.log("Program Start");
    
    //Check lane boxes
    if (document.getElementById('lane1').checked == false && document.getElementById('lane2').checked == false) { 
        alert("Du måste välja minst en bana");
    } else {
    
   
        //choosenProgram = document.getElementById("programs").value;

        //Check that a preprogrammed program is choosed
        if (choosenProgram == "Välj program") {
            alert("Du måste välja ett program");

         } else {
         

    
                if (preProgram == false) {

                    //OK start program
                    //Check what program

                    for (var i = 0; i < programsId.length; ++i) {

                        //Filter out the program ID 
                        if (programsId[i].name == choosenProgram) {
                            preProgramId = programsId[i].id;
                        }
                    }




                    //Check what lanes are activated
                    if (document.getElementById('lane1').checked) {
                        var lane1 = "1";
                    } else {
                        var lane1 = "0";
                    }

                    if (document.getElementById('lane2').checked) {
                        var lane2 = "1";
                    } else {
                        var lane2 = "0";
                    }

                    //Send message
                     websocket.send("preProgramStart" + lane1 + lane2 + preProgramId);
                    
                    //Flag
                    preProgramManuell = true;
                    
                    //Change button
                    document.getElementById("preProgramStartStopButton").value = "STOPPA PROGRAM";
                    document.getElementById("preProgramStartStopButton").style.backgroundColor = 'red'; 


                  //  }
               } else {
                   //Send message
                     websocket.send("preProgramStop");
                   
                    //Clear table
                    // let table1 = document.getElementById('programsTable');
                    let table1 = document.querySelector("#programsTable tbody"); 
     
                    table1.innerHTML = "";
                    programPos = 0;
                   
                    //Flag
                    preProgramManuell = false;
                   
                    //Button
                    document.getElementById("preProgramStartStopButton").value = "STARTA PROGRAM";
                    document.getElementById("preProgramStartStopButton").style.backgroundColor = '#32612D';
                    
                    //Update list
                    updateProgramList(choosenProgram);
                   
                    //Reset big counter
                    document.getElementById("preProgramTimerTime").innerHTML = "0";
                    
                   
               } 
         }
    }
}




function lane1Checked() {
    //At least one lane must be checked
    if (document.getElementById('lane1').checked == false && document.getElementById('lane2').checked == false) {
        document.getElementById('lane2').checked = true;
    }
    
    //Save
    if (document.getElementById('lane1').checked == true) { localStorage.setItem("lane1", "true");} else { localStorage.setItem("lane1", "false");}
    if (document.getElementById('lane2').checked == true) { localStorage.setItem("lane2", "true");} else { localStorage.setItem("lane2", "false");}
}

function lane2Checked() {
    //At least one lane must be checked
    if (document.getElementById('lane2').checked == false && document.getElementById('lane1').checked == false) {
        document.getElementById('lane1').checked = true;
    }
    
    //Save
    if (document.getElementById('lane1').checked == true) { localStorage.setItem("lane1", "true");} else { localStorage.setItem("lane1", "false");}
    if (document.getElementById('lane2').checked == true) { localStorage.setItem("lane2", "true");} else { localStorage.setItem("lane2", "false");}
}






function updateProgramList(selectValue) {
    
    console.log("Update of table...");
    console.log(programPos);
    
   // let table1 = document.getElementById('programsTable');
    let table1 = document.querySelector("#programsTable tbody"); 
    

     
    table1.innerHTML = "";

    
    //Update program list
    for (var i = 0; i < programs.length; ++i) {
         
        //Filter out the program items 
        if (programs[i].name == selectValue) {
                             
            //Create row
            let tr = document.createElement('tr');          
            
            //Columns
            let td1 = document.createElement('td');
            let td2 = document.createElement('td');
            
            //Which image?
            td1.innerHTML = "";
              
            //Target
            if (programs[i].action.substring(0, 10) == "Tavla fram") { 
                td1.innerHTML = '<img src="target.png" alt="" height="24" width="24"</img>';
            }
            
            
            //Away
            if (programs[i].action.substring(0, 10) == "Tavla bort") { 
                td1.innerHTML = '<img src="away.png" alt="" height="24" width="24"</img>';
            }
            
            //Timer
            if (programs[i].action.substring(0, 11) == "Fördröjning") { 
                td1.innerHTML = '<img src="timer.png" alt="" height="24" width="24"</img>';
            }
            
            //Speaker (Second character is uppercase)
            if (programs[i].action.substring(1, 2) == programs[i].action.substring(1, 2).toUpperCase()) { 
                td1.innerHTML = '<img src="sound.png" alt="" height="24" width="24"</img>';
            }
      
            
            
            
            if (programPos >= programs[i].start && programPos <= programs[i].stop) {
                
                td2.textContent = programs[i].action + " = " + (programs[i].stop - programPos+1);
              
                td2.style.border = "solid #0000FF";
                td2.style.borderRadius = "10px";
                td2.style.color = "#000000";
                
                //Show big counter
                document.getElementById("preProgramTimerTime").innerHTML = (programs[i].stop - programPos+1);
               
 
            } else {
                
                td2.textContent = programs[i].action;
                td2.style.color = "#000000";
            }  
  
            //Add to row
            tr.appendChild(td1);
            tr.appendChild(td2);
            
            //Add to table
            table1.appendChild(tr);

        } 
    }


   
    
}   




function preProgramExtra() {
    
    //Check function
    if (document.getElementById("preProgramExtra").value == "GÅ TILL ELD UPPHÖR") {
        //Send fast forward command for Precision
        websocket.send("fastForwardPrecison");
    }
    
    if (document.getElementById("preProgramExtra").value == "GÅ TILL PATRON UR") {
        //Send start program again
        websocket.send("playPreProgram");
    }  
}

function markera() {
    
    //Check that no program is runnning
    if (program == 0 && preProgram == 0) {
        if (confirm("Genom att välja OK kommer skjutkommandot MARKERA att aktiveras utan fördröjning")) {
        
            //Send sound command
            websocket.send("markera");
            
        } else {
            //Do nothing    
        }
    } 
    
}

function showText() {

    if (document.getElementsByClassName('programsTable')[0].style.display == 'none') {
        
        document.getElementById("text").value = "GÖM TEXT";
        document.getElementsByClassName('programsTable')[0].style.display = 'inline';
     } else {
        document.getElementsByClassName('programsTable')[0].style.display = 'none'; 
        document.getElementById("text").value = "VISA TEXT";

    }
}

//Next program
function nextProgram() {
    console.log(programIndex);
    if (preProgram == false) {
        //Program not running
        
        ++programIndex;
         
        //Set program title
        for (var i = 0; i < programsId.length; ++i) {
            if (programsId[i].id == programIndex) { // Add 1 to index
                //Match
                document.getElementById("programTitle").innerHTML = programsId[i].name;
                choosenProgram = programsId[i].name;
                //Fill table
                updateProgramList(programsId[i].name);
            }   
        } 
    } 
    
}   

const soundCommands = [
    
    //Sound commands
    { index: 'A', text: 'BANAN ÄR ÖPPEN'},
    { index: 'B', text: 'FÖRBEREDELSETID START'},
    { index: 'C', text: 'FÖRBEREDELSETID STOPP'},
    { index: 'D', text: 'PROVSERIE'},
    { index: 'E', text: 'SERIE 1'},
    { index: 'F', text: 'SERIE 2'},
    { index: 'G', text: 'SERIE 3'},
    { index: 'H', text: 'SERIE 4'},
    { index: 'I', text: 'SERIE 5'},
    { index: 'J', text: 'SERIE 6'},
    { index: 'K', text: 'SERIE 7'},
    { index: 'L', text: 'SERIE 8'},
    { index: 'M', text: 'SERIE 9'},
    { index: 'N', text: 'SERIE 10'},
    { index: 'O', text: 'LADDA'},
    { index: 'P', text: 'FÄRDIGA'},
    { index: 'Q', text: 'ELD'},
    { index: 'R', text: 'ELD UPPHÖR'},
    { index: 'S', text: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET'},
    { index: 'T', text: 'VISITATION'},
    { index: 'U', text: 'SEKUNDER'},
    { index: 'V', text: 'SERIE'},
    { index: 'Z', text: 'ALLA KLARA?'},
    { index: 'a', text: '10 SEKUNDER KVAR'},
    { index: 'b', text: 'NÅGRA FUNKTIONERINGSFEL?'},
    { index: 'c', text: '4'},
    { index: 'd', text: '6'},
    { index: 'e', text: '8'},
    { index: 'f', text: '10'},
    { index: 'g', text: '12'},
    { index: 'h', text: '14'},
    { index: 'i', text: '16'},
    { index: 'j', text: '20'},
    { index: 'k', text: '150'},
    { index: 'l', text: 'FÖRBEREDELSETID BÖRJAR NU'},
    { index: 'm', text: 'STOPP, PATRON UR'},
    { index: 'n', text: 'FÖR FÖRSTA TÄVLINGSERIE - LADDA'},
    { index: 'o', text: 'FÖR NÄSTA TÄVLINGSERIE - LADDA'},
    { index: 'p', text: 'FÖR PROVSERIE - LADDA'},
    { index: 'q', text: 'PATRON UR, PROPPA VAPEN'},
    { index: 'r', text: 'START'},
    { index: 's', text: 'ELD UPPHÖR (UTDRAGET UNDER 3 SEK)'},
    { index: 't', text: '150 SEK SERIE LADDA'},
    { index: 'u', text: '20 SEK SERIE LADDA'},
    { index: 'v', text: '10 SEK SERIE LADDA'},
    { index: 'z', text: 'SÄRSKJUTNING'},
    { index: 'w', text: 'KOMPLETTERINGSSERIE'},

];

const programs = [
    
    //25 METER PRECISION
    { name: 'Precision Förberedelsetid', action: 'FÖRBEREDELSETID START', start: 1, stop: 3},
    { name: 'Precision Förberedelsetid', action: 'Fördröjning 300 sekunder', start: 4, stop: 303},
    { name: 'Precision Förberedelsetid', action: 'FÖRBEREDELSETID STOPP', start: 304, stop: 305},  
    
    { name: 'Precision Provserie', action: 'PROVSERIE LADDA', start: 1, stop: 4},
    { name: 'Precision Provserie', action: 'Fördröjning 57 sekunder', start: 5, stop: 61},
    { name: 'Precision Provserie', action: 'FÄRDIGA', start: 62, stop: 63},
    { name: 'Precision Provserie', action: 'ELD', start: 64, stop: 65},
    { name: 'Precision Provserie', action: 'Fördröjning 297 sekunder', start: 66, stop: 362},
    { name: 'Precision Provserie', action: 'ELD UPPHÖR', start: 363, stop: 367},
    { name: 'Precision Provserie', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET', start: 368, stop: 372},
    { name: 'Precision Provserie', action: 'VISITATION', start: 373, stop: 375},
    
    { name: 'Precision Serie 1', action: 'SERIE 1 LADDA', start: 1, stop: 4},
    { name: 'Precision Serie 1', action: 'Fördröjning 57 sekunder', start: 5, stop: 61},
    { name: 'Precision Serie 1', action: 'FÄRDIGA', start: 62, stop: 63},
    { name: 'Precision Serie 1', action: 'ELD', start: 64, stop: 65},
    { name: 'Precision Serie 1', action: 'Fördröjning 297 sekunder', start: 66, stop: 362},
    { name: 'Precision Serie 1', action: 'ELD UPPHÖR', start: 363, stop: 367},
    { name: 'Precision Serie 1', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET', start: 368, stop: 372},
    { name: 'Precision Serie 1', action: 'VISITATION', start: 373, stop: 375},
    
    { name: 'Precision Serie 2', action: 'SERIE 2 LADDA', start: 1, stop: 4},
    { name: 'Precision Serie 2', action: 'Fördröjning 57 sekunder', start: 5, stop: 61},
    { name: 'Precision Serie 2', action: 'FÄRDIGA', start: 62, stop: 63},
    { name: 'Precision Serie 2', action: 'ELD', start: 64, stop: 65},
    { name: 'Precision Serie 2', action: 'Fördröjning 297 sekunder', start: 66, stop: 362},
    { name: 'Precision Serie 2', action: 'ELD UPPHÖR', start: 363, stop: 367},
    { name: 'Precision Serie 2', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET', start: 368, stop: 372},
    { name: 'Precision Serie 2', action: 'VISITATION', start: 373, stop: 375},
    
    { name: 'Precision Serie 3', action: 'SERIE 3 LADDA', start: 1, stop: 4},
    { name: 'Precision Serie 3', action: 'Fördröjning 57 sekunder', start: 5, stop: 61},
    { name: 'Precision Serie 3', action: 'FÄRDIGA', start: 62, stop: 63},
    { name: 'Precision Serie 3', action: 'ELD', start: 64, stop: 65},
    { name: 'Precision Serie 3', action: 'Fördröjning 297 sekunder', start: 66, stop: 362},
    { name: 'Precision Serie 3', action: 'ELD UPPHÖR', start: 363, stop: 367},
    { name: 'Precision Serie 3', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET', start: 368, stop: 372},
    { name: 'Precision Serie 3', action: 'VISITATION', start: 373, stop: 375},
    
    { name: 'Precision Serie 4', action: 'SERIE 4 LADDA', start: 1, stop: 4},
    { name: 'Precision Serie 4', action: 'Fördröjning 57 sekunder', start: 5, stop: 61},
    { name: 'Precision Serie 4', action: 'FÄRDIGA', start: 62, stop: 63},
    { name: 'Precision Serie 4', action: 'ELD', start: 64, stop: 65},
    { name: 'Precision Serie 4', action: 'Fördröjning 297 sekunder', start: 66, stop: 362},
    { name: 'Precision Serie 4', action: 'ELD UPPHÖR', start: 363, stop: 367},
    { name: 'Precision Serie 4', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET', start: 368, stop: 372},
    { name: 'Precision Serie 4', action: 'VISITATION', start: 373, stop: 375},
    
    { name: 'Precision Serie 5', action: 'SERIE 5 LADDA', start: 1, stop: 4},
    { name: 'Precision Serie 5', action: 'Fördröjning 57 sekunder', start: 5, stop: 61},
    { name: 'Precision Serie 5', action: 'FÄRDIGA', start: 62, stop: 63},
    { name: 'Precision Serie 5', action: 'ELD', start: 64, stop: 65},
    { name: 'Precision Serie 5', action: 'Fördröjning 297 sekunder', start: 66, stop: 362},
    { name: 'Precision Serie 5', action: 'ELD UPPHÖR', start: 363, stop: 367},
    { name: 'Precision Serie 5', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET', start: 368, stop: 372},
    { name: 'Precision Serie 5', action: 'VISITATION', start: 373, stop: 375},
    
    { name: 'Precision Serie 6', action: 'SERIE 6 LADDA', start: 1, stop: 4},
    { name: 'Precision Serie 6', action: 'Fördröjning 57 sekunder', start: 5, stop: 61},
    { name: 'Precision Serie 6', action: 'FÄRDIGA', start: 62, stop: 63},
    { name: 'Precision Serie 6', action: 'ELD', start: 64, stop: 65},
    { name: 'Precision Serie 6', action: 'Fördröjning 297 sekunder', start: 66, stop: 362},
    { name: 'Precision Serie 6', action: 'ELD UPPHÖR', start: 363, stop: 367},
    { name: 'Precision Serie 6', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET', start: 368, stop: 372},
    { name: 'Precision Serie 6', action: 'VISITATION', start: 373, stop: 375},
    
    { name: 'Precision Serie 7', action: 'SERIE 7 LADDA', start: 1, stop: 4},
    { name: 'Precision Serie 7', action: 'Fördröjning 57 sekunder', start: 5, stop: 61},
    { name: 'Precision Serie 7', action: 'FÄRDIGA', start: 62, stop: 63},
    { name: 'Precision Serie 7', action: 'ELD', start: 64, stop: 65},
    { name: 'Precision Serie 7', action: 'Fördröjning 297 sekunder', start: 66, stop: 362},
    { name: 'Precision Serie 7', action: 'ELD UPPHÖR', start: 363, stop: 367},
    { name: 'Precision Serie 7', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET', start: 368, stop: 372},
    { name: 'Precision Serie 7', action: 'VISITATION', start: 373, stop: 375},
    
    { name: 'Precision Serie 8', action: 'SERIE 8 LADDA', start: 1, stop: 4},
    { name: 'Precision Serie 8', action: 'Fördröjning 57 sekunder', start: 5, stop: 61},
    { name: 'Precision Serie 8', action: 'FÄRDIGA', start: 62, stop: 63},
    { name: 'Precision Serie 8', action: 'ELD', start: 64, stop: 65},
    { name: 'Precision Serie 8', action: 'Fördröjning 297 sekunder', start: 66, stop: 362},
    { name: 'Precision Serie 8', action: 'ELD UPPHÖR', start: 363, stop: 367},
    { name: 'Precision Serie 8', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET', start: 368, stop: 372},
    { name: 'Precision Serie 8', action: 'VISITATION', start: 373, stop: 375},
    
    { name: 'Precision Serie 9', action: 'SERIE 9 LADDA', start: 1, stop: 4},
    { name: 'Precision Serie 9', action: 'Fördröjning 57 sekunder', start: 5, stop: 61},
    { name: 'Precision Serie 9', action: 'FÄRDIGA', start: 62, stop: 63},
    { name: 'Precision Serie 9', action: 'ELD', start: 64, stop: 65},
    { name: 'Precision Serie 9', action: 'Fördröjning 297 sekunder', start: 66, stop: 362},
    { name: 'Precision Serie 9', action: 'ELD UPPHÖR', start: 363, stop: 367},
    { name: 'Precision Serie 9', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET', start: 368, stop: 372},
    { name: 'Precision Serie 9', action: 'VISITATION', start: 373, stop: 375},
    
    { name: 'Precision Serie 10', action: 'SERIE 10 LADDA', start: 1, stop: 4},
    { name: 'Precision Serie 10', action: 'Fördröjning 57 sekunder', start: 5, stop: 61},
    { name: 'Precision Serie 10', action: 'FÄRDIGA', start: 62, stop: 63},
    { name: 'Precision Serie 10', action: 'ELD', start: 64, stop: 65},
    { name: 'Precision Serie 10', action: 'Fördröjning 297 sekunder', start: 66, stop: 362},
    { name: 'Precision Serie 10', action: 'ELD UPPHÖR', start: 363, stop: 367},
    { name: 'Precision Serie 10', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET', start: 368, stop: 372},
    { name: 'Precision Serie 10', action: 'VISITATION', start: 373, stop: 375},
    
    //25 METER MILSNABB 10 SEK
    { name: 'Militär Snabbmatch Förberedelsetid', action: 'FÖRBEREDELSETID START' , start: 1, stop: 3},
    { name: 'Militär Snabbmatch Förberedelsetid', action: 'Fördröjning 180 sekunder', start: 4, stop: 183},
    { name: 'Militär Snabbmatch Förberedelsetid', action: 'FÖRBEREDELSETID STOPP', start: 184, stop: 185},   
    
    { name: 'Militär Snabbmatch Provserie', action: 'PROVSERIE 10 SEKUNDER LADDA', start: 1, stop: 9},
    { name: 'Militär Snabbmatch Provserie', action: 'Fördröjning 60 sekunder', start: 10, stop: 69},
    { name: 'Militär Snabbmatch Provserie', action: 'FÄRDIGA', start: 70, stop: 70},
    { name: 'Militär Snabbmatch Provserie', action: 'Tavla bort 7 sekunder', start: 71, stop: 77},
    { name: 'Militär Snabbmatch Provserie', action: 'Tavla fram 10 sekunder', start: 78, stop: 87},
    { name: 'Militär Snabbmatch Provserie', action: 'Tavla bort', start: 88, stop: 89},
    { name: 'Militär Snabbmatch Provserie', action: 'ELD UPPHÖR', start: 90, stop: 92},
    { name: 'Militär Snabbmatch Provserie', action: 'NÅGRA FUNKTIONERINGSFEL?', start: 93, stop: 98},
    { name: 'Militär Snabbmatch Provserie', action: 'PATRON UR, PROPPA OCH LÄGG NER VAPNET', start: 99, stop: 103},
    { name: 'Militär Snabbmatch Provserie', action: 'VISITATION', start: 104, stop: 106},
    
    { name: 'Militär Snabbmatch - Serie 1 - 10 sek', action: 'SERIE 1 - 10 SEKUNDER LADDA', start: 1, stop: 9},
    { name: 'Militär Snabbmatch - Serie 1 - 10 sek', action: 'Fördröjning 60 sekunder', start: 10, stop: 69},
    { name: 'Militär Snabbmatch - Serie 1 - 10 sek', action: 'FÄRDIGA', start: 70, stop: 70},
    { name: 'Militär Snabbmatch - Serie 1 - 10 sek', action: 'Tavla bort 7 sekunder', start: 71, stop: 77},
    { name: 'Militär Snabbmatch - Serie 1 - 10 sek', action: 'Tavla fram 10 sekunder', start: 78, stop: 87},
    { name: 'Militär Snabbmatch - Serie 1 - 10 sek', action: 'Tavla bort', start: 88, stop: 89},
    { name: 'Militär Snabbmatch - Serie 1 - 10 sek', action: 'ELD UPPHÖR', start: 90, stop: 92},
    { name: 'Militär Snabbmatch - Serie 1 - 10 sek', action: 'NÅGRA FUNKTIONERINGSFEL?', start: 93, stop: 98},
    { name: 'Militär Snabbmatch - Serie 1 - 10 sek', action: 'PATRON UR PROPPA OCH LÄGG NER VAPNET', start: 99, stop: 103},
    { name: 'Militär Snabbmatch - Serie 1 - 10 sek', action: 'VISITATION', start: 104, stop: 106},
    
    { name: 'Militär Snabbmatch - Serie 2 - 10 sek', action: 'SERIE 2 - 10 SEKUNDER LADDA', start: 1, stop: 9},
    { name: 'Militär Snabbmatch - Serie 2 - 10 sek', action: 'Fördröjning 60 sekunder', start: 10, stop: 69},
    { name: 'Militär Snabbmatch - Serie 2 - 10 sek', action: 'FÄRDIGA', start: 70, stop: 70},
    { name: 'Militär Snabbmatch - Serie 2 - 10 sek', action: 'Tavla bort 7 sekunder', start: 71, stop: 77},
    { name: 'Militär Snabbmatch - Serie 2 - 10 sek', action: 'Tavla fram 10 sekunder', start: 78, stop: 87},
    { name: 'Militär Snabbmatch - Serie 2 - 10 sek', action: 'Tavla bort', start: 88, stop: 89},
    { name: 'Militär Snabbmatch - Serie 2 - 10 sek', action: 'ELD UPPHÖR', start: 90, stop: 92},
    { name: 'Militär Snabbmatch - Serie 2 - 10 sek', action: 'NÅGRA FUNKTIONERINGSFEL?', start: 93, stop: 98},
    { name: 'Militär Snabbmatch - Serie 2 - 10 sek', action: 'PATRON UR PROPPA OCH LÄGG NER VAPNET', start: 99, stop: 103},
    { name: 'Militär Snabbmatch - Serie 2 - 10 sek', action: 'VISITATION', start: 104, stop: 106},
    
    { name: 'Militär Snabbmatch - Serie 3 - 10 sek', action: 'SERIE 3 - 10 SEKUNDER LADDA', start: 1, stop: 9},
    { name: 'Militär Snabbmatch - Serie 3 - 10 sek', action: 'Fördröjning 60 sekunder', start: 10, stop: 69},
    { name: 'Militär Snabbmatch - Serie 3 - 10 sek', action: 'FÄRDIGA', start: 70, stop: 70},
    { name: 'Militär Snabbmatch - Serie 3 - 10 sek', action: 'Tavla bort 7 sekunder', start: 71, stop: 77},
    { name: 'Militär Snabbmatch - Serie 3 - 10 sek', action: 'Tavla fram 10 sekunder', start: 78, stop: 87},
    { name: 'Militär Snabbmatch - Serie 3 - 10 sek', action: 'Tavla bort', start: 88, stop: 89},
    { name: 'Militär Snabbmatch - Serie 3 - 10 sek', action: 'ELD UPPHÖR', start: 90, stop: 92},
    { name: 'Militär Snabbmatch - Serie 3 - 10 sek', action: 'NÅGRA FUNKTIONERINGSFEL?', start: 93, stop: 98},
    { name: 'Militär Snabbmatch - Serie 3 - 10 sek', action: 'PATRON UR PROPPA OCH LÄGG NER VAPNET', start: 99, stop: 103},
    { name: 'Militär Snabbmatch - Serie 3 - 10 sek', action: 'VISITATION', start: 104, stop: 106},
    
    { name: 'Militär Snabbmatch - Serie 4 - 10 sek', action: 'SERIE 4 - 10 SEKUNDER LADDA', start: 1, stop: 9},
    { name: 'Militär Snabbmatch - Serie 4 - 10 sek', action: 'Fördröjning 60 sekunder', start: 10, stop: 69},
    { name: 'Militär Snabbmatch - Serie 4 - 10 sek', action: 'FÄRDIGA', start: 70, stop: 70},
    { name: 'Militär Snabbmatch - Serie 4 - 10 sek', action: 'Tavla bort 7 sekunder', start: 71, stop: 77},
    { name: 'Militär Snabbmatch - Serie 4 - 10 sek', action: 'Tavla fram 10 sekunder', start: 78, stop: 87},
    { name: 'Militär Snabbmatch - Serie 4 - 10 sek', action: 'Tavla bort', start: 88, stop: 89},
    { name: 'Militär Snabbmatch - Serie 4 - 10 sek', action: 'ELD UPPHÖR', start: 90, stop: 92},
    { name: 'Militär Snabbmatch - Serie 4 - 10 sek', action: 'NÅGRA FUNKTIONERINGSFEL?', start: 93, stop: 98},
    { name: 'Militär Snabbmatch - Serie 4 - 10 sek', action: 'PATRON UR PROPPA OCH LÄGG NER VAPNET', start: 99, stop: 103},
    { name: 'Militär Snabbmatch - Serie 4 - 10 sek', action: 'VISITATION', start: 104, stop: 106},
        
    //25 METER MILSNABB 8 SEK
    { name: 'Militär Snabbmatch - Serie 1 - 8 sek', action: 'SERIE 1 - 8 SEKUNDER LADDA', start: 1, stop: 9},
    { name: 'Militär Snabbmatch - Serie 1 - 8 sek', action: 'Fördröjning 60 sekunder', start: 10, stop: 69},
    { name: 'Militär Snabbmatch - Serie 1 - 8 sek', action: 'FÄRDIGA', start: 70, stop: 70},
    { name: 'Militär Snabbmatch - Serie 1 - 8 sek', action: 'Tavla bort 7 sekunder', start: 71, stop: 77},
    { name: 'Militär Snabbmatch - Serie 1 - 8 sek', action: 'Tavla fram 8 sekunder', start: 78, stop: 85},
    { name: 'Militär Snabbmatch - Serie 1 - 8 sek', action: 'Tavla bort', start: 86, stop: 87},
    { name: 'Militär Snabbmatch - Serie 1 - 8 sek', action: 'ELD UPPHÖR', start: 88, stop: 90},
    { name: 'Militär Snabbmatch - Serie 1 - 8 sek', action: 'NÅGRA FUNKTIONERINGSFEL?', start: 91, stop: 96},
    { name: 'Militär Snabbmatch - Serie 1 - 8 sek', action: 'PATRON UR PROPPA OCH LÄGG NER VAPNET', start: 97, stop: 101},
    { name: 'Militär Snabbmatch - Serie 1 - 8 sek', action: 'VISITATION', start: 102, stop: 104},
    
    { name: 'Militär Snabbmatch - Serie 2 - 8 sek', action: 'SERIE 2 - 8 SEKUNDER LADDA', start: 1, stop: 9},
    { name: 'Militär Snabbmatch - Serie 2 - 8 sek', action: 'Fördröjning 60 sekunder', start: 10, stop: 69},
    { name: 'Militär Snabbmatch - Serie 2 - 8 sek', action: 'FÄRDIGA', start: 70, stop: 70},
    { name: 'Militär Snabbmatch - Serie 2 - 8 sek', action: 'Tavla bort 7 sekunder', start: 71, stop: 77},
    { name: 'Militär Snabbmatch - Serie 2 - 8 sek', action: 'Tavla fram 8 sekunder', start: 78, stop: 85},
    { name: 'Militär Snabbmatch - Serie 2 - 8 sek', action: 'Tavla bort', start: 86, stop: 87},
    { name: 'Militär Snabbmatch - Serie 2 - 8 sek', action: 'ELD UPPHÖR', start: 88, stop: 90},
    { name: 'Militär Snabbmatch - Serie 2 - 8 sek', action: 'NÅGRA FUNKTIONERINGSFEL?', start: 91, stop: 96},
    { name: 'Militär Snabbmatch - Serie 2 - 8 sek', action: 'PATRON UR PROPPA OCH LÄGG NER VAPNET', start: 97, stop: 101},
    { name: 'Militär Snabbmatch - Serie 2 - 8 sek', action: 'VISITATION', start: 102, stop: 104},
    
    { name: 'Militär Snabbmatch - Serie 3 - 8 sek', action: 'SERIE 3 - 8 SEKUNDER LADDA', start: 1, stop: 9},
    { name: 'Militär Snabbmatch - Serie 3 - 8 sek', action: 'Fördröjning 60 sekunder', start: 10, stop: 69},
    { name: 'Militär Snabbmatch - Serie 3 - 8 sek', action: 'FÄRDIGA', start: 70, stop: 70},
    { name: 'Militär Snabbmatch - Serie 3 - 8 sek', action: 'Tavla bort 7 sekunder', start: 71, stop: 77},
    { name: 'Militär Snabbmatch - Serie 3 - 8 sek', action: 'Tavla fram 8 sekunder', start: 78, stop: 85},
    { name: 'Militär Snabbmatch - Serie 3 - 8 sek', action: 'Tavla bort', start: 86, stop: 87},
    { name: 'Militär Snabbmatch - Serie 3 - 8 sek', action: 'ELD UPPHÖR', start: 88, stop: 90},
    { name: 'Militär Snabbmatch - Serie 3 - 8 sek', action: 'NÅGRA FUNKTIONERINGSFEL?', start: 91, stop: 96},
    { name: 'Militär Snabbmatch - Serie 3 - 8 sek', action: 'PATRON UR PROPPA OCH LÄGG NER VAPNET', start: 97, stop: 101},
    { name: 'Militär Snabbmatch - Serie 3 - 8 sek', action: 'VISITATION', start: 102, stop: 104},
    
    { name: 'Militär Snabbmatch - Serie 4 - 8 sek', action: 'SERIE 4 - 8 SEKUNDER LADDA', start: 1, stop: 9},
    { name: 'Militär Snabbmatch - Serie 4 - 8 sek', action: 'Fördröjning 60 sekunder', start: 10, stop: 69},
    { name: 'Militär Snabbmatch - Serie 4 - 8 sek', action: 'FÄRDIGA', start: 70, stop: 70},
    { name: 'Militär Snabbmatch - Serie 4 - 8 sek', action: 'Tavla bort 7 sekunder', start: 71, stop: 77},
    { name: 'Militär Snabbmatch - Serie 4 - 8 sek', action: 'Tavla fram 8 sekunder', start: 78, stop: 85},
    { name: 'Militär Snabbmatch - Serie 4 - 8 sek', action: 'Tavla bort', start: 86, stop: 87},
    { name: 'Militär Snabbmatch - Serie 4 - 8 sek', action: 'ELD UPPHÖR', start: 88, stop: 90},
    { name: 'Militär Snabbmatch - Serie 4 - 8 sek', action: 'NÅGRA FUNKTIONERINGSFEL?', start: 91, stop: 96},
    { name: 'Militär Snabbmatch - Serie 4 - 8 sek', action: 'PATRON UR PROPPA OCH LÄGG NER VAPNET', start: 97, stop: 101},
    { name: 'Militär Snabbmatch - Serie 4 - 8 sek', action: 'VISITATION', start: 102, stop: 104},
    
    //25 METER MILSNABB 6 SEK
    { name: 'Militär Snabbmatch - Serie 1 - 6 sek', action: 'SERIE 1 - 6 SEKUNDER LADDA', start: 1, stop: 9},
    { name: 'Militär Snabbmatch - Serie 1 - 6 sek', action: 'Fördröjning 60 sekunder', start: 10, stop: 69},
    { name: 'Militär Snabbmatch - Serie 1 - 6 sek', action: 'FÄRDIGA', start: 70, stop: 70},
    { name: 'Militär Snabbmatch - Serie 1 - 6 sek', action: 'Tavla bort 7 sekunder', start: 71, stop: 77},
    { name: 'Militär Snabbmatch - Serie 1 - 6 sek', action: 'Tavla fram 6 sekunder', start: 78, stop: 83},
    { name: 'Militär Snabbmatch - Serie 1 - 6 sek', action: 'Tavla bort', start: 84, stop: 85},
    { name: 'Militär Snabbmatch - Serie 1 - 6 sek', action: 'ELD UPPHÖR', start: 86, stop: 88},
    { name: 'Militär Snabbmatch - Serie 1 - 6 sek', action: 'NÅGRA FUNKTIONERINGSFEL?', start: 89, stop: 94},
    { name: 'Militär Snabbmatch - Serie 1 - 6 sek', action: 'PATRON UR PROPPA OCH LÄGG NER VAPNET', start: 95, stop: 99},
    { name: 'Militär Snabbmatch - Serie 1 - 6 sek', action: 'VISITATION', start: 100, stop: 102},
    
    { name: 'Militär Snabbmatch - Serie 2 - 6 sek', action: 'SERIE 2 - 6 SEKUNDER LADDA', start: 1, stop: 9},
    { name: 'Militär Snabbmatch - Serie 2 - 6 sek', action: 'Fördröjning 60 sekunder', start: 10, stop: 69},
    { name: 'Militär Snabbmatch - Serie 2 - 6 sek', action: 'FÄRDIGA', start: 70, stop: 70},
    { name: 'Militär Snabbmatch - Serie 2 - 6 sek', action: 'Tavla bort 7 sekunder', start: 71, stop: 77},
    { name: 'Militär Snabbmatch - Serie 2 - 6 sek', action: 'Tavla fram 6 sekunder', start: 78, stop: 83},
    { name: 'Militär Snabbmatch - Serie 2 - 6 sek', action: 'Tavla bort', start: 84, stop: 85},
    { name: 'Militär Snabbmatch - Serie 2 - 6 sek', action: 'ELD UPPHÖR', start: 86, stop: 88},
    { name: 'Militär Snabbmatch - Serie 2 - 6 sek', action: 'NÅGRA FUNKTIONERINGSFEL?', start: 89, stop: 94},
    { name: 'Militär Snabbmatch - Serie 2 - 6 sek', action: 'PATRON UR PROPPA OCH LÄGG NER VAPNET', start: 95, stop: 99},
    { name: 'Militär Snabbmatch - Serie 2 - 6 sek', action: 'VISITATION', start: 100, stop: 102},
    
    { name: 'Militär Snabbmatch - Serie 3 - 6 sek', action: 'SERIE 3 - 6 SEKUNDER LADDA', start: 1, stop: 9},
    { name: 'Militär Snabbmatch - Serie 3 - 6 sek', action: 'Fördröjning 60 sekunder', start: 10, stop: 69},
    { name: 'Militär Snabbmatch - Serie 3 - 6 sek', action: 'FÄRDIGA', start: 70, stop: 70},
    { name: 'Militär Snabbmatch - Serie 3 - 6 sek', action: 'Tavla bort 7 sekunder', start: 71, stop: 77},
    { name: 'Militär Snabbmatch - Serie 3 - 6 sek', action: 'Tavla fram 6 sekunder', start: 78, stop: 83},
    { name: 'Militär Snabbmatch - Serie 3 - 6 sek', action: 'Tavla bort', start: 84, stop: 85},
    { name: 'Militär Snabbmatch - Serie 3 - 6 sek', action: 'ELD UPPHÖR', start: 86, stop: 88},
    { name: 'Militär Snabbmatch - Serie 3 - 6 sek', action: 'NÅGRA FUNKTIONERINGSFEL?', start: 89, stop: 94},
    { name: 'Militär Snabbmatch - Serie 3 - 6 sek', action: 'PATRON UR PROPPA OCH LÄGG NER VAPNET', start: 95, stop: 99},
    { name: 'Militär Snabbmatch - Serie 3 - 6 sek', action: 'VISITATION', start: 100, stop: 102},
    
    { name: 'Militär Snabbmatch - Serie 4 - 6 sek', action: 'SERIE 4 - 6 SEKUNDER LADDA', start: 1, stop: 9},
    { name: 'Militär Snabbmatch - Serie 4 - 6 sek', action: 'Fördröjning 60 sekunder', start: 10, stop: 69},
    { name: 'Militär Snabbmatch - Serie 4 - 6 sek', action: 'FÄRDIGA', start: 70, stop: 70},
    { name: 'Militär Snabbmatch - Serie 4 - 6 sek', action: 'Tavla bort 7 sekunder', start: 71, stop: 77},
    { name: 'Militär Snabbmatch - Serie 4 - 6 sek', action: 'Tavla fram 6 sekunder', start: 78, stop: 83},
    { name: 'Militär Snabbmatch - Serie 4 - 6 sek', action: 'Tavla bort', start: 84, stop: 85},
    { name: 'Militär Snabbmatch - Serie 4 - 6 sek', action: 'ELD UPPHÖR', start: 86, stop: 88},
    { name: 'Militär Snabbmatch - Serie 4 - 6 sek', action: 'NÅGRA FUNKTIONERINGSFEL?', start: 89, stop: 94},
    { name: 'Militär Snabbmatch - Serie 4 - 6 sek', action: 'PATRON UR PROPPA OCH LÄGG NER VAPNET', start: 95, stop: 99},
    { name: 'Militär Snabbmatch - Serie 4 - 6 sek', action: 'VISITATION', start: 100, stop: 102},
    
    { name: 'Militär Snabbmatch - Särskjutning Provserie - 10 sek', action: 'SÄRSKJUTNING PROVSERIE - 10 SEKUNDER LADDA', start: 1, stop: 9},
    { name: 'Militär Snabbmatch - Särskjutning Provserie - 10 sek', action: 'Fördröjning 60 sekunder', start: 10, stop: 69},
    { name: 'Militär Snabbmatch - Särskjutning Provserie - 10 sek', action: 'FÄRDIGA', start: 70, stop: 70},
    { name: 'Militär Snabbmatch - Särskjutning Provserie - 10 sek', action: 'Tavla bort 7 sekunder', start: 71, stop: 77},
    { name: 'Militär Snabbmatch - Särskjutning Provserie - 10 sek', action: 'Tavla fram 10 sekunder', start: 78, stop: 87},
    { name: 'Militär Snabbmatch - Särskjutning Provserie - 10 sek', action: 'Tavla bort', start: 88, stop: 89},
    { name: 'Militär Snabbmatch - Särskjutning Provserie - 10 sek', action: 'ELD UPPHÖR', start: 90, stop: 92},
    { name: 'Militär Snabbmatch - Särskjutning Provserie - 10 sek', action: 'NÅGRA FUNKTIONERINGSFEL?', start: 93, stop: 98},
    { name: 'Militär Snabbmatch - Särskjutning Provserie - 10 sek', action: 'PATRON UR PROPPA OCH LÄGG NER VAPNET', start: 99, stop: 103},
    { name: 'Militär Snabbmatch - Särskjutning Provserie - 10 sek', action: 'VISITATION', start: 104, stop: 106},
    
    { name: 'Militär Snabbmatch - Särskjutning - 6 sek', action: 'SÄRSKJUTNING - 6 SEKUNDER LADDA', start: 1, stop: 9},
    { name: 'Militär Snabbmatch - Särskjutning - 6 sek', action: 'Fördröjning 60 sekunder', start: 10, stop: 69},
    { name: 'Militär Snabbmatch - Särskjutning - 6 sek', action: 'FÄRDIGA', start: 70, stop: 70},
    { name: 'Militär Snabbmatch - Särskjutning - 6 sek', action: 'Tavla bort 7 sekunder', start: 71, stop: 77},
    { name: 'Militär Snabbmatch - Särskjutning - 6 sek', action: 'Tavla fram 6 sekunder', start: 78, stop: 83},
    { name: 'Militär Snabbmatch - Särskjutning - 6 sek', action: 'Tavla bort', start: 84, stop: 85},
    { name: 'Militär Snabbmatch - Särskjutning - 6 sek', action: 'ELD UPPHÖR', start: 86, stop: 88},
    { name: 'Militär Snabbmatch - Särskjutning - 6 sek', action: 'NÅGRA FUNKTIONERINGSFEL?', start: 89, stop: 94},
    { name: 'Militär Snabbmatch - Särskjutning - 6 sek', action: 'PATRON UR PROPPA OCH LÄGG NER VAPNET', start: 95, stop: 99},
    { name: 'Militär Snabbmatch - Särskjutning - 6 sek', action: 'VISITATION', start: 100, stop: 102},
    
    { name: 'Militär Snabbmatch - Kompletteringserie - 10 sek', action: 'KOMPLETTERINGSERIE - 10 SEKUNDER LADDA', start: 1, stop: 9},
    { name: 'Militär Snabbmatch - Kompletteringserie - 10 sek', action: 'Fördröjning 60 sekunder', start: 10, stop: 69},
    { name: 'Militär Snabbmatch - Kompletteringserie - 10 sek', action: 'FÄRDIGA', start: 70, stop: 70},
    { name: 'Militär Snabbmatch - Kompletteringserie - 10 sek', action: 'Tavla bort 7 sekunder', start: 71, stop: 77},
    { name: 'Militär Snabbmatch - Kompletteringserie - 10 sek', action: 'Tavla fram 10 sekunder', start: 78, stop: 87},
    { name: 'Militär Snabbmatch - Kompletteringserie - 10 sek', action: 'Tavla bort', start: 88, stop: 89},
    { name: 'Militär Snabbmatch - Kompletteringserie - 10 sek', action: 'ELD UPPHÖR', start: 90, stop: 92},
    { name: 'Militär Snabbmatch - Kompletteringserie - 10 sek', action: 'NÅGRA FUNKTIONERINGSFEL?', start: 93, stop: 98},
    { name: 'Militär Snabbmatch - Kompletteringserie - 10 sek', action: 'PATRON UR PROPPA OCH LÄGG NER VAPNET', start: 99, stop: 103},
    { name: 'Militär Snabbmatch - Kompletteringserie - 10 sek', action: 'VISITATION', start: 104, stop: 106},
    
    { name: 'Militär Snabbmatch - Kompletteringserie - 8 sek', action: 'KOMPLETTERINGSERIE - 8 SEKUNDER LADDA', start: 1, stop: 9},
    { name: 'Militär Snabbmatch - Kompletteringserie - 8 sek', action: 'Fördröjning 60 sekunder', start: 10, stop: 69},
    { name: 'Militär Snabbmatch - Kompletteringserie - 8 sek', action: 'FÄRDIGA', start: 70, stop: 70},
    { name: 'Militär Snabbmatch - Kompletteringserie - 8 sek', action: 'Tavla bort 7 sekunder', start: 71, stop: 77},
    { name: 'Militär Snabbmatch - Kompletteringserie - 8 sek', action: 'Tavla fram 8 sekunder', start: 78, stop: 85},
    { name: 'Militär Snabbmatch - Kompletteringserie - 8 sek', action: 'Tavla bort', start: 86, stop: 87},
    { name: 'Militär Snabbmatch - Kompletteringserie - 8 sek', action: 'ELD UPPHÖR', start: 88, stop: 90},
    { name: 'Militär Snabbmatch - Kompletteringserie - 8 sek', action: 'NÅGRA FUNKTIONERINGSFEL?', start: 91, stop: 96},
    { name: 'Militär Snabbmatch - Kompletteringserie - 8 sek', action: 'PATRON UR PROPPA OCH LÄGG NER VAPNET', start: 97, stop: 101},
    { name: 'Militär Snabbmatch - Kompletteringserie - 8 sek', action: 'VISITATION', start: 102, stop: 104},

    { name: 'Militär Snabbmatch - Kompletteringserie - 6 sek', action: 'KOMPLETTERINGSERIE - 6 SEKUNDER LADDA', start: 1, stop: 9},
    { name: 'Militär Snabbmatch - Kompletteringserie - 6 sek', action: 'Fördröjning 60 sekunder', start: 10, stop: 69},
    { name: 'Militär Snabbmatch - Kompletteringserie - 6 sek', action: 'FÄRDIGA', start: 70, stop: 70},
    { name: 'Militär Snabbmatch - Kompletteringserie - 6 sek', action: 'Tavla bort 7 sekunder', start: 71, stop: 77},
    { name: 'Militär Snabbmatch - Kompletteringserie - 6 sek', action: 'Tavla fram 6 sekunder', start: 78, stop: 83},
    { name: 'Militär Snabbmatch - Kompletteringserie - 6 sek', action: 'Tavla bort', start: 84, stop: 85},
    { name: 'Militär Snabbmatch - Kompletteringserie - 6 sek', action: 'ELD UPPHÖR', start: 86, stop: 88},
    { name: 'Militär Snabbmatch - Kompletteringserie - 6 sek', action: 'NÅGRA FUNKTIONERINGSFEL?', start: 89, stop: 94},
    { name: 'Militär Snabbmatch - Kompletteringserie - 6 sek', action: 'PATRON UR PROPPA OCH LÄGG NER VAPNET', start: 95, stop: 99},
    { name: 'Militär Snabbmatch - Kompletteringserie - 6 sek', action: 'VISITATION', start: 100, stop: 102},
    
    { name: 'Militär Snabbmatch - Träningsserie - 10 sek', action: 'SERIE 1 - 10 SEKUNDER LADDA', start: 1, stop: 9},
    { name: 'Militär Snabbmatch - Träningsserie - 10 sek', action: 'Fördröjning 20 sekunder', start: 10, stop: 29},
    { name: 'Militär Snabbmatch - Träningsserie - 10 sek', action: 'FÄRDIGA', start: 30, stop: 30},
    { name: 'Militär Snabbmatch - Träningsserie - 10 sek', action: 'Tavla bort 7 sekunder', start: 31, stop: 37},
    { name: 'Militär Snabbmatch - Träningsserie - 10 sek', action: 'Tavla fram 10 sekunder', start: 38, stop: 47},
    { name: 'Militär Snabbmatch - Träningsserie - 10 sek', action: 'Tavla bort', start: 48, stop: 49},
    { name: 'Militär Snabbmatch - Träningsserie - 10 sek', action: 'ELD UPPHÖR', start: 50, stop: 52},
    { name: 'Militär Snabbmatch - Träningsserie - 10 sek', action: 'PATRON UR PROPPA OCH LÄGG NER VAPNET', start: 53, stop: 59},
    { name: 'Militär Snabbmatch - Träningsserie - 10 sek', action: 'VISITATION', start: 60, stop: 62},
    
    { name: 'Militär Snabbmatch - Träningsserie - 8 sek', action: 'SERIE 1 - 8 SEKUNDER LADDA', start: 1, stop: 9},
    { name: 'Militär Snabbmatch - Träningsserie - 8 sek', action: 'Fördröjning 20 sekunder', start: 10, stop: 29},
    { name: 'Militär Snabbmatch - Träningsserie - 8 sek', action: 'FÄRDIGA', start: 30, stop: 30},
    { name: 'Militär Snabbmatch - Träningsserie - 8 sek', action: 'Tavla bort 7 sekunder', start: 31, stop: 37},
    { name: 'Militär Snabbmatch - Träningsserie - 8 sek', action: 'Tavla fram 8 sekunder', start: 38, stop: 45},
    { name: 'Militär Snabbmatch - Träningsserie - 8 sek', action: 'Tavla bort', start: 46, stop: 47},
    { name: 'Militär Snabbmatch - Träningsserie - 8 sek', action: 'ELD UPPHÖR', start: 48, stop: 50},
    { name: 'Militär Snabbmatch - Träningsserie - 8 sek', action: 'PATRON UR PROPPA OCH LÄGG NER VAPNET', start: 51, stop: 57},
    { name: 'Militär Snabbmatch - Träningsserie - 8 sek', action: 'VISITATION', start: 58, stop: 60},

    { name: 'Militär Snabbmatch - Träningsserie - 6 sek', action: 'SERIE 1- 6 SEKUNDER LADDA', start: 1, stop: 9},
    { name: 'Militär Snabbmatch - Träningsserie - 6 sek', action: 'Fördröjning 20 sekunder', start: 10, stop: 29},
    { name: 'Militär Snabbmatch - Träningsserie - 6 sek', action: 'FÄRDIGA', start: 30, stop: 30},
    { name: 'Militär Snabbmatch - Träningsserie - 6 sek', action: 'Tavla bort 7 sekunder', start: 31, stop: 37},
    { name: 'Militär Snabbmatch - Träningsserie - 6 sek', action: 'Tavla fram 6 sekunder', start: 38, stop: 43},
    { name: 'Militär Snabbmatch - Träningsserie - 6 sek', action: 'Tavla bort', start: 44, stop: 45},
    { name: 'Militär Snabbmatch - Träningsserie - 6 sek', action: 'ELD UPPHÖR', start: 46, stop: 48},
    { name: 'Militär Snabbmatch - Träningsserie - 6 sek', action: 'PATRON UR PROPPA OCH LÄGG NER VAPNET', start: 49, stop: 55},
    { name: 'Militär Snabbmatch - Träningsserie - 6 sek', action: 'VISITATION', start: 56, stop: 58},
    
    
    //25 METER SNABBPISTOL
   // { name: 'Snabbpistol Förberedelsetid', action: 'FÖRBEREDELSETID START'},
    //{ name: 'Snabbpistol Förberedelsetid', action: 'Fördröjning 300 sekunder'},
    //{ name: 'Snabbpistol Förberedelsetid', action: 'FÖRBEREDELSETID STOPP'},
    
    { name: 'Snabbpistol Förberedelsetid + Provserie', action: 'FÖRBEREDELSETID BÖRJAR NU', start: 1, stop: 3},
    { name: 'Snabbpistol Förberedelsetid + Provserie', action: 'Fördröjning 180 sekunder', start: 4, stop: 183},
    { name: 'Snabbpistol Förberedelsetid + Provserie', action: 'PROVSERIE 8 SEKUNDER LADDA', start: 184, stop: 190},
    { name: 'Snabbpistol Förberedelsetid + Provserie', action: 'Fördröjning 60 sekunder', start: 191, stop: 250},
    { name: 'Snabbpistol Förberedelsetid + Provserie', action: 'FÄRDIGA', start: 251, stop: 251},
    { name: 'Snabbpistol Förberedelsetid + Provserie', action: 'Tavla bort 7 sekunder', start: 252, stop: 258},
    { name: 'Snabbpistol Förberedelsetid + Provserie', action: 'Tavla fram 8 sekunder', start: 259, stop: 266},
    { name: 'Snabbpistol Förberedelsetid + Provserie', action: 'Tavla bort', start: 267, stop: 268},
    { name: 'Snabbpistol Förberedelsetid + Provserie', action: 'NÅGRA FUNKTIONERINGSFEL?', start:269, stop: 271},
    { name: 'Snabbpistol Förberedelsetid + Provserie', action: 'STOPP, PATRON UR', start: 272, stop: 275},
    { name: 'Snabbpistol Förberedelsetid + Provserie', action: 'VISITATION', start: 276, stop: 278},
    
    //25 METER SNABBPISTOL 8 SEK
    { name: 'Snabbpistol - Serie 1 - 8 sek', action: 'SERIE 1 - 8 SEKUNDER LADDA', start: 1, stop: 9},
    { name: 'Snabbpistol - Serie 1 - 8 sek', action: 'Fördröjning 60 sekunder', start: 10, stop: 69},
    { name: 'Snabbpistol - Serie 1 - 8 sek', action: 'FÄRDIGA', start: 70, stop: 70},
    { name: 'Snabbpistol - Serie 1 - 8 sek', action: 'Tavla bort 7 sekunder', start: 71, stop: 77},
    { name: 'Snabbpistol - Serie 1 - 8 sek', action: 'Tavla fram 8 sekunder', start: 78, stop: 85},
    { name: 'Snabbpistol - Serie 1 - 8 sek', action: 'Tavla bort', start: 86, stop: 87},
    { name: 'Snabbpistol - Serie 1 - 8 sek', action: 'NÅGRA FUNKTIONERINGSFEL?', start: 88, stop: 90},
    { name: 'Snabbpistol - Serie 1 - 8 sek', action: 'STOPP, PATRON UR', start: 91, stop: 94},
    { name: 'Snabbpistol - Serie 1 - 8 sek', action: 'VISITATION', start: 95, stop: 97},
    
    { name: 'Snabbpistol - Serie 2 - 8 sek', action: 'SERIE 2 - 8 SEKUNDER LADDA', start: 1, stop: 9},
    { name: 'Snabbpistol - Serie 2 - 8 sek', action: 'Fördröjning 60 sekunder', start: 10, stop: 69},
    { name: 'Snabbpistol - Serie 2 - 8 sek', action: 'FÄRDIGA', start: 70, stop: 70},
    { name: 'Snabbpistol - Serie 2 - 8 sek', action: 'Tavla bort 7 sekunder', start: 71, stop: 77},
    { name: 'Snabbpistol - Serie 2 - 8 sek', action: 'Tavla fram 8 sekunder', start: 78, stop: 85},
    { name: 'Snabbpistol - Serie 2 - 8 sek', action: 'Tavla bort', start: 86, stop: 87},
    { name: 'Snabbpistol - Serie 2 - 8 sek', action: 'NÅGRA FUNKTIONERINGSFEL?', start: 88, stop: 90},
    { name: 'Snabbpistol - Serie 2 - 8 sek', action: 'STOPP, PATRON UR', start: 91, stop: 94},
    { name: 'Snabbpistol - Serie 2 - 8 sek', action: 'VISITATION', start: 95, stop: 97},
    
    //25 METER SNABBPISTOL 6 SEK
    { name: 'Snabbpistol - Serie 1 - 6 sek', action: 'SERIE 1 - 6 SEKUNDER LADDA', start: 1, stop: 9},
    { name: 'Snabbpistol - Serie 1 - 6 sek', action: 'Fördröjning 60 sekunder', start: 10, stop: 69},
    { name: 'Snabbpistol - Serie 1 - 6 sek', action: 'FÄRDIGA', start: 70, stop: 70},
    { name: 'Snabbpistol - Serie 1 - 6 sek', action: 'Tavla bort 7 sekunder', start: 71, stop: 77},
    { name: 'Snabbpistol - Serie 1 - 6 sek', action: 'Tavla fram 6 sekunder', start: 78, stop: 83},
    { name: 'Snabbpistol - Serie 1 - 6 sek', action: 'Tavla bort', start: 84, stop: 85},
    { name: 'Snabbpistol - Serie 1 - 6 sek', action: 'NÅGRA FUNKTIONERINGSFEL?', start: 86, stop: 88},
    { name: 'Snabbpistol - Serie 1 - 6 sek', action: 'STOPP, PATRON UR', start: 89, stop: 92},
    { name: 'Snabbpistol - Serie 1 - 6 sek', action: 'VISITATION', start: 93, stop: 95},
    
    { name: 'Snabbpistol - Serie 2 - 6 sek', action: 'SERIE 2 - 6 SEKUNDER LADDA', start: 1, stop: 9},
    { name: 'Snabbpistol - Serie 2 - 6 sek', action: 'Fördröjning 60 sekunder', start: 10, stop: 69},
    { name: 'Snabbpistol - Serie 2 - 6 sek', action: 'FÄRDIGA', start: 70, stop: 70},
    { name: 'Snabbpistol - Serie 2 - 6 sek', action: 'Tavla bort 7 sekunder', start: 71, stop: 77},
    { name: 'Snabbpistol - Serie 2 - 6 sek', action: 'Tavla fram 6 sekunder', start: 78, stop: 83},
    { name: 'Snabbpistol - Serie 2 - 6 sek', action: 'Tavla bort', start: 84, stop: 85},
    { name: 'Snabbpistol - Serie 2 - 6 sek', action: 'NÅGRA FUNKTIONERINGSFEL?', start: 86, stop: 88},
    { name: 'Snabbpistol - Serie 2 - 6 sek', action: 'STOPP, PATRON UR', start: 89, stop: 92},
    { name: 'Snabbpistol - Serie 2 - 6 sek', action: 'VISITATION', start: 93, stop: 95},
    
    //25 METER SNABBPISTOL 4 SEK
    { name: 'Snabbpistol - Serie 1 - 4 sek', action: 'SERIE 1 - 4 SEKUNDER LADDA', start: 1, stop: 9},
    { name: 'Snabbpistol - Serie 1 - 4 sek', action: 'Fördröjning 60 sekunder', start: 10, stop: 69},
    { name: 'Snabbpistol - Serie 1 - 4 sek', action: 'FÄRDIGA', start: 70, stop: 70},
    { name: 'Snabbpistol - Serie 1 - 4 sek', action: 'Tavla bort 7 sekunder', start: 71, stop: 77},
    { name: 'Snabbpistol - Serie 1 - 4 sek', action: 'Tavla fram 4 sekunder', start: 78, stop: 81},
    { name: 'Snabbpistol - Serie 1 - 4 sek', action: 'Tavla bort', start: 82, stop: 83},
    { name: 'Snabbpistol - Serie 1 - 4 sek', action: 'NÅGRA FUNKTIONERINGSFEL?', start: 84, stop: 86},
    { name: 'Snabbpistol - Serie 1 - 4 sek', action: 'STOPP, PATRON UR', start: 87, stop: 90},
    { name: 'Snabbpistol - Serie 1 - 4 sek', action: 'VISITATION', start: 91, stop: 93},
    
    { name: 'Snabbpistol - Serie 2 - 4 sek', action: 'SERIE 2 - 4 SEKUNDER LADDA', start: 1, stop: 9},
    { name: 'Snabbpistol - Serie 2 - 4 sek', action: 'Fördröjning 60 sekunder', start: 10, stop: 69},
    { name: 'Snabbpistol - Serie 2 - 4 sek', action: 'FÄRDIGA', start: 70, stop: 70},
    { name: 'Snabbpistol - Serie 2 - 4 sek', action: 'Tavla bort 7 sekunder', start: 71, stop: 77},
    { name: 'Snabbpistol - Serie 2 - 4 sek', action: 'Tavla fram 4 sekunder', start: 78, stop: 81},
    { name: 'Snabbpistol - Serie 2 - 4 sek', action: 'Tavla bort', start: 82, stop: 83},
    { name: 'Snabbpistol - Serie 2 - 4 sek', action: 'NÅGRA FUNKTIONERINGSFEL?', start: 84, stop: 86},
    { name: 'Snabbpistol - Serie 2 - 4 sek', action: 'STOPP, PATRON UR', start: 87, stop: 90},
    { name: 'Snabbpistol - Serie 2 - 4 sek', action: 'VISITATION', start: 91, stop: 93},
    
    //25 METER SPORT/GROVPISTOL PRECISION
    { name: 'Sport/Grovpistol Förberedelsetid + Provserie', action: 'FÖRBEREDELSETID BÖRJAR NU', start: 1, stop: 3},
    { name: 'Sport/Grovpistol Förberedelsetid + Provserie', action: 'Fördröjning 180 sekunder', start: 4, stop: 183},
    { name: 'Sport/Grovpistol Förberedelsetid + Provserie', action: 'FÖR PROVSERIE LADDA', start: 184, stop: 186},
    { name: 'Sport/Grovpistol Förberedelsetid + Provserie', action: 'Fördröjning 60 sekunder', start: 187, stop: 246},
    { name: 'Sport/Grovpistol Förberedelsetid + Provserie', action: 'FÄRDIGA', start: 247, stop: 248},
    { name: 'Sport/Grovpistol Förberedelsetid + Provserie', action: 'Tavla bort 7 sekunder', start: 249, stop: 255},
    { name: 'Sport/Grovpistol Förberedelsetid + Provserie', action: 'Tavla fram 300 sekunder', start: 256, stop: 555},
    { name: 'Sport/Grovpistol Förberedelsetid + Provserie', action: 'Tavla bort', start: 556, stop: 557},
    { name: 'Sport/Grovpistol Förberedelsetid + Provserie', action: 'STOPP, PATRON UR', start: 558, stop: 561},
    { name: 'Sport/Grovpistol Förberedelsetid + Provserie', action: 'VISITATION', start: 562, stop: 564},
    
    { name: 'Sport/Grovpistol Serie 1', action: 'FÖR FÖRSTA TÄVLINGSSERIE LADDA', start: 1, stop: 4},
    { name: 'Sport/Grovpistol Serie 1', action: 'Fördröjning 60 sekunder', start: 5, stop: 64},
    { name: 'Sport/Grovpistol Serie 1', action: 'FÄRDIGA', start: 65, stop: 65},
    { name: 'Sport/Grovpistol Serie 1', action: 'Tavla bort 7 sekunder', start: 66, stop: 72},
    { name: 'Sport/Grovpistol Serie 1', action: 'Tavla fram 300 sekunder', start: 73, stop: 372},
    { name: 'Sport/Grovpistol Serie 1', action: 'Tavla bort', start: 373, stop: 374},
    { name: 'Sport/Grovpistol Serie 1', action: 'STOPP, PATRON UR', start: 375, stop: 378},
    { name: 'Sport/Grovpistol Serie 1', action: 'VISITATION', start: 379, stop: 381},
    
    { name: 'Sport/Grovpistol Serie 2', action: 'FÖR NÄSTA TÄVLINGSSERIE LADDA', start: 1, stop: 4},
    { name: 'Sport/Grovpistol Serie 2', action: 'Fördröjning 60 sekunder', start: 5, stop: 64},
    { name: 'Sport/Grovpistol Serie 2', action: 'FÄRDIGA', start: 65, stop: 65},
    { name: 'Sport/Grovpistol Serie 2', action: 'Tavla bort 7 sekunder', start: 66, stop: 72},
    { name: 'Sport/Grovpistol Serie 2', action: 'Tavla fram 300 sekunder', start: 73, stop: 372},
    { name: 'Sport/Grovpistol Serie 2', action: 'Tavla bort', start: 373, stop: 374},
    { name: 'Sport/Grovpistol Serie 2', action: 'STOPP, PATRON UR', start: 375, stop: 378},
    { name: 'Sport/Grovpistol Serie 2', action: 'VISITATION', start: 379, stop: 381},
    
    { name: 'Sport/Grovpistol Serie 3', action: 'FÖR NÄSTA TÄVLINGSSERIE LADDA', start: 1, stop: 4},
    { name: 'Sport/Grovpistol Serie 3', action: 'Fördröjning 60 sekunder', start: 5, stop: 64},
    { name: 'Sport/Grovpistol Serie 3', action: 'FÄRDIGA', start: 65, stop: 65},
    { name: 'Sport/Grovpistol Serie 3', action: 'Tavla bort 7 sekunder', start: 66, stop: 72},
    { name: 'Sport/Grovpistol Serie 3', action: 'Tavla fram 300 sekunder', start: 73, stop: 372},
    { name: 'Sport/Grovpistol Serie 3', action: 'Tavla bort', start: 373, stop: 374},
    { name: 'Sport/Grovpistol Serie 3', action: 'STOPP, PATRON UR', start: 375, stop: 378},
    { name: 'Sport/Grovpistol Serie 3', action: 'VISITATION', start: 379, stop: 381},
    
    { name: 'Sport/Grovpistol Serie 4', action: 'FÖR NÄSTA TÄVLINGSSERIE LADDA', start: 1, stop: 4},
    { name: 'Sport/Grovpistol Serie 4', action: 'Fördröjning 60 sekunder', start: 5, stop: 64},
    { name: 'Sport/Grovpistol Serie 4', action: 'FÄRDIGA', start: 65, stop: 65},
    { name: 'Sport/Grovpistol Serie 4', action: 'Tavla bort 7 sekunder', start: 66, stop: 72},
    { name: 'Sport/Grovpistol Serie 4', action: 'Tavla fram 300 sekunder', start: 73, stop: 372},
    { name: 'Sport/Grovpistol Serie 4', action: 'Tavla bort', start: 373, stop: 374},
    { name: 'Sport/Grovpistol Serie 4', action: 'STOPP, PATRON UR', start: 375, stop: 378},
    { name: 'Sport/Grovpistol Serie 4', action: 'VISITATION', start: 379, stop: 381},
    
    { name: 'Sport/Grovpistol Serie 5', action: 'FÖR NÄSTA TÄVLINGSSERIE LADDA', start: 1, stop: 4},
    { name: 'Sport/Grovpistol Serie 5', action: 'Fördröjning 60 sekunder', start: 5, stop: 64},
    { name: 'Sport/Grovpistol Serie 5', action: 'FÄRDIGA', start: 65, stop: 65},
    { name: 'Sport/Grovpistol Serie 5', action: 'Tavla bort 7 sekunder', start: 66, stop: 72},
    { name: 'Sport/Grovpistol Serie 5', action: 'Tavla fram 300 sekunder', start: 73, stop: 372},
    { name: 'Sport/Grovpistol Serie 5', action: 'Tavla bort', start: 373, stop: 374},
    { name: 'Sport/Grovpistol Serie 5', action: 'STOPP, PATRON UR', start: 375, stop: 378},
    { name: 'Sport/Grovpistol Serie 5', action: 'VISITATION', start: 379, stop: 381},
    
    { name: 'Sport/Grovpistol Serie 6', action: 'FÖR NÄSTA TÄVLINGSSERIE LADDA', start: 1, stop: 4},
    { name: 'Sport/Grovpistol Serie 6', action: 'Fördröjning 60 sekunder', start: 5, stop: 64},
    { name: 'Sport/Grovpistol Serie 6', action: 'FÄRDIGA', start: 65, stop: 65},
    { name: 'Sport/Grovpistol Serie 6', action: 'Tavla bort 7 sekunder', start: 66, stop: 72},
    { name: 'Sport/Grovpistol Serie 6', action: 'Tavla fram 300 sekunder', start: 73, stop: 372},
    { name: 'Sport/Grovpistol Serie 6', action: 'Tavla bort', start: 374, stop: 375},
    { name: 'Sport/Grovpistol Serie 6', action: 'STOPP, PATRON UR', start: 375, stop: 378},
    { name: 'Sport/Grovpistol Serie 6', action: 'VISITATION', start: 379, stop: 381},
    
    //25 METER SPORT/GROVPISTOL SNABBSKJUTNING
    { name: 'Sport/Grovpistol Snabb Förberedelsetid + Provserie', action: 'FÖRBEREDELSETID BÖRJAR NU', start: 1, stop: 3},
    { name: 'Sport/Grovpistol Snabb Förberedelsetid + Provserie', action: 'Fördröjning 180 sekunder', start: 4, stop: 183},
    { name: 'Sport/Grovpistol Snabb Förberedelsetid + Provserie', action: 'FÖR PROVSERIE LADDA', start: 184, stop: 186},
    { name: 'Sport/Grovpistol Snabb Förberedelsetid + Provserie', action: 'Fördröjning 60 sekunder', start: 187, stop: 246},
    { name: 'Sport/Grovpistol Snabb Förberedelsetid + Provserie', action: 'FÄRDIGA', start: 247, stop: 247},
    { name: 'Sport/Grovpistol Snabb Förberedelsetid + Provserie', action: 'Tavla bort 7 sekunder', start: 248, stop: 254},
    { name: 'Sport/Grovpistol Snabb Förberedelsetid + Provserie', action: 'Tavla fram 3 sekunder', start: 255, stop: 257},
    { name: 'Sport/Grovpistol Snabb Förberedelsetid + Provserie', action: 'Tavla bort 7 sekunder', start: 258, stop: 264},
    { name: 'Sport/Grovpistol Snabb Förberedelsetid + Provserie', action: 'Tavla fram 3 sekunder', start: 265, stop: 267},
    { name: 'Sport/Grovpistol Snabb Förberedelsetid + Provserie', action: 'Tavla bort 7 sekunder', start: 268, stop: 274},
    { name: 'Sport/Grovpistol Snabb Förberedelsetid + Provserie', action: 'Tavla fram 3 sekunder', start: 275, stop: 277},
    { name: 'Sport/Grovpistol Snabb Förberedelsetid + Provserie', action: 'Tavla bort 7 sekunder', start: 278, stop: 284},
    { name: 'Sport/Grovpistol Snabb Förberedelsetid + Provserie', action: 'Tavla fram 3 sekunder', start: 285, stop: 287},
    { name: 'Sport/Grovpistol Snabb Förberedelsetid + Provserie', action: 'Tavla bort 7 sekunder', start: 288, stop: 294},
    { name: 'Sport/Grovpistol Snabb Förberedelsetid + Provserie', action: 'Tavla fram 3 sekunder', start: 295, stop: 297},
    { name: 'Sport/Grovpistol Snabb Förberedelsetid + Provserie', action: 'Tavla bort', start: 298, stop: 299},
    { name: 'Sport/Grovpistol Snabb Förberedelsetid + Provserie', action: 'NÅGRA FUNKTIONERINGSFEL?', start: 300, stop: 306},
    { name: 'Sport/Grovpistol Snabb Förberedelsetid + Provserie', action: 'STOPP, PATRON UR', start: 307, stop: 310},
    { name: 'Sport/Grovpistol Snabb Förberedelsetid + Provserie', action: 'VISITATION', start: 311, stop: 313},
    
    { name: 'Sport/Grovpistol Snabb Serie 1', action: 'FÖR FÖRSTA TÄVLINGSSERIE LADDA', start: 1, stop: 3},
    { name: 'Sport/Grovpistol Snabb Serie 1', action: 'Fördröjning 60 sekunder', start: 4, stop: 63},
    { name: 'Sport/Grovpistol Snabb Serie 1', action: 'FÄRDIGA', start: 64, stop: 64},
    { name: 'Sport/Grovpistol Snabb Serie 1', action: 'Tavla bort 7 sekunder', start: 65, stop: 71},
    { name: 'Sport/Grovpistol Snabb Serie 1', action: 'Tavla fram 3 sekunder', start: 72, stop: 74},
    { name: 'Sport/Grovpistol Snabb Serie 1', action: 'Tavla bort 7 sekunder', start: 75, stop: 81},
    { name: 'Sport/Grovpistol Snabb Serie 1', action: 'Tavla fram 3 sekunder', start: 82, stop: 84},
    { name: 'Sport/Grovpistol Snabb Serie 1', action: 'Tavla bort 7 sekunder', start: 85, stop: 91},
    { name: 'Sport/Grovpistol Snabb Serie 1', action: 'Tavla fram 3 sekunder', start: 92, stop: 94},
    { name: 'Sport/Grovpistol Snabb Serie 1', action: 'Tavla bort 7 sekunder', start: 95, stop: 101},
    { name: 'Sport/Grovpistol Snabb Serie 1', action: 'Tavla fram 3 sekunder', start: 102, stop: 104},
    { name: 'Sport/Grovpistol Snabb Serie 1', action: 'Tavla bort 7 sekunder', start: 105, stop: 111},
    { name: 'Sport/Grovpistol Snabb Serie 1', action: 'Tavla fram 3 sekunder', start: 112, stop: 114},
    { name: 'Sport/Grovpistol Snabb Serie 1', action: 'Tavla bort', start: 115, stop: 116},
    { name: 'Sport/Grovpistol Snabb Serie 1', action: 'NÅGRA FUNKTIONERINGSFEL?', start: 117, stop: 124},
    { name: 'Sport/Grovpistol Snabb Serie 1', action: 'STOPP, PATRON UR', start: 125, stop: 128},
    { name: 'Sport/Grovpistol Snabb Serie 1', action: 'VISITATION', start: 129, stop: 131},
    
    { name: 'Sport/Grovpistol Snabb Serie 2', action: 'FÖR NÄSTA TÄVLINGSSERIE LADDA', start: 1, stop: 4},
    { name: 'Sport/Grovpistol Snabb Serie 2', action: 'Fördröjning 60 sekunder', start: 4, stop: 63},
    { name: 'Sport/Grovpistol Snabb Serie 2', action: 'FÄRDIGA', start: 64, stop: 64},
    { name: 'Sport/Grovpistol Snabb Serie 2', action: 'Tavla bort 7 sekunder', start: 65, stop: 71},
    { name: 'Sport/Grovpistol Snabb Serie 2', action: 'Tavla fram 3 sekunder', start: 72, stop: 74},
    { name: 'Sport/Grovpistol Snabb Serie 2', action: 'Tavla bort 7 sekunder', start: 75, stop: 81},
    { name: 'Sport/Grovpistol Snabb Serie 2', action: 'Tavla fram 3 sekunder', start: 82, stop: 84},
    { name: 'Sport/Grovpistol Snabb Serie 2', action: 'Tavla bort 7 sekunder', start: 85, stop: 91},
    { name: 'Sport/Grovpistol Snabb Serie 2', action: 'Tavla fram 3 sekunder', start: 92, stop: 94},
    { name: 'Sport/Grovpistol Snabb Serie 2', action: 'Tavla bort 7 sekunder', start: 95, stop: 101},
    { name: 'Sport/Grovpistol Snabb Serie 2', action: 'Tavla fram 3 sekunder', start: 102, stop: 104},
    { name: 'Sport/Grovpistol Snabb Serie 2', action: 'Tavla bort 7 sekunder', start: 105, stop: 111},
    { name: 'Sport/Grovpistol Snabb Serie 2', action: 'Tavla fram 3 sekunder', start: 112, stop: 114},
    { name: 'Sport/Grovpistol Snabb Serie 2', action: 'Tavla bort', start: 115, stop: 116},
    { name: 'Sport/Grovpistol Snabb Serie 2', action: 'NÅGRA FUNKTIONERINGSFEL?', start: 117, stop: 124},
    { name: 'Sport/Grovpistol Snabb Serie 2', action: 'STOPP, PATRON UR', start: 125, stop: 128},
    { name: 'Sport/Grovpistol Snabb Serie 2', action: 'VISITATION', start: 129, stop: 131},
    
    { name: 'Sport/Grovpistol Snabb Serie 3', action: 'FÖR NÄSTA TÄVLINGSSERIE LADDA', start: 1, stop: 4},
    { name: 'Sport/Grovpistol Snabb Serie 3', action: 'Fördröjning 60 sekunder', start: 4, stop: 63},
    { name: 'Sport/Grovpistol Snabb Serie 3', action: 'FÄRDIGA', start: 64, stop: 64},
    { name: 'Sport/Grovpistol Snabb Serie 3', action: 'Tavla bort 7 sekunder', start: 65, stop: 71},
    { name: 'Sport/Grovpistol Snabb Serie 3', action: 'Tavla fram 3 sekunder', start: 72, stop: 74},
    { name: 'Sport/Grovpistol Snabb Serie 3', action: 'Tavla bort 7 sekunder', start: 75, stop: 81},
    { name: 'Sport/Grovpistol Snabb Serie 3', action: 'Tavla fram 3 sekunder', start: 82, stop: 84},
    { name: 'Sport/Grovpistol Snabb Serie 3', action: 'Tavla bort 7 sekunder', start: 85, stop: 91},
    { name: 'Sport/Grovpistol Snabb Serie 3', action: 'Tavla fram 3 sekunder', start: 92, stop: 94},
    { name: 'Sport/Grovpistol Snabb Serie 3', action: 'Tavla bort 7 sekunder', start: 95, stop: 101},
    { name: 'Sport/Grovpistol Snabb Serie 3', action: 'Tavla fram 3 sekunder', start: 102, stop: 104},
    { name: 'Sport/Grovpistol Snabb Serie 3', action: 'Tavla bort 7 sekunder', start: 105, stop: 111},
    { name: 'Sport/Grovpistol Snabb Serie 3', action: 'Tavla fram 3 sekunder', start: 112, stop: 114},
    { name: 'Sport/Grovpistol Snabb Serie 3', action: 'Tavla bort', start: 115, stop: 116},
    { name: 'Sport/Grovpistol Snabb Serie 3', action: 'NÅGRA FUNKTIONERINGSFEL?', start: 117, stop: 124},
    { name: 'Sport/Grovpistol Snabb Serie 3', action: 'STOPP, PATRON UR', start: 125, stop: 128},
    { name: 'Sport/Grovpistol Snabb Serie 3', action: 'VISITATION', start: 129, stop: 131},
    
    { name: 'Sport/Grovpistol Snabb Serie 4', action: 'FÖR NÄSTA TÄVLINGSSERIE LADDA', start: 1, stop: 4},
    { name: 'Sport/Grovpistol Snabb Serie 4', action: 'Fördröjning 60 sekunder', start: 4, stop: 63},
    { name: 'Sport/Grovpistol Snabb Serie 4', action: 'FÄRDIGA', start: 64, stop: 64},
    { name: 'Sport/Grovpistol Snabb Serie 4', action: 'Tavla bort 7 sekunder', start: 65, stop: 71},
    { name: 'Sport/Grovpistol Snabb Serie 4', action: 'Tavla fram 3 sekunder', start: 72, stop: 74},
    { name: 'Sport/Grovpistol Snabb Serie 4', action: 'Tavla bort 7 sekunder', start: 75, stop: 81},
    { name: 'Sport/Grovpistol Snabb Serie 4', action: 'Tavla fram 3 sekunder', start: 82, stop: 84},
    { name: 'Sport/Grovpistol Snabb Serie 4', action: 'Tavla bort 7 sekunder', start: 85, stop: 91},
    { name: 'Sport/Grovpistol Snabb Serie 4', action: 'Tavla fram 3 sekunder', start: 92, stop: 94},
    { name: 'Sport/Grovpistol Snabb Serie 4', action: 'Tavla bort 7 sekunder', start: 95, stop: 101},
    { name: 'Sport/Grovpistol Snabb Serie 4', action: 'Tavla fram 3 sekunder', start: 102, stop: 104},
    { name: 'Sport/Grovpistol Snabb Serie 4', action: 'Tavla bort 7 sekunder', start: 105, stop: 111},
    { name: 'Sport/Grovpistol Snabb Serie 4', action: 'Tavla fram 3 sekunder', start: 112, stop: 114},
    { name: 'Sport/Grovpistol Snabb Serie 4', action: 'Tavla bort', start: 115, stop: 116},
    { name: 'Sport/Grovpistol Snabb Serie 4', action: 'NÅGRA FUNKTIONERINGSFEL?', start: 117, stop: 124},
    { name: 'Sport/Grovpistol Snabb Serie 4', action: 'STOPP, PATRON UR', start: 125, stop: 128},
    { name: 'Sport/Grovpistol Snabb Serie 4', action: 'VISITATION', start: 129, stop: 131},
    
    { name: 'Sport/Grovpistol Snabb Serie 5', action: 'FÖR NÄSTA TÄVLINGSSERIE LADDA', start: 1, stop: 4},
    { name: 'Sport/Grovpistol Snabb Serie 5', action: 'Fördröjning 60 sekunder', start: 4, stop: 63},
    { name: 'Sport/Grovpistol Snabb Serie 5', action: 'FÄRDIGA', start: 64, stop: 64},
    { name: 'Sport/Grovpistol Snabb Serie 5', action: 'Tavla bort 7 sekunder', start: 65, stop: 71},
    { name: 'Sport/Grovpistol Snabb Serie 5', action: 'Tavla fram 3 sekunder', start: 72, stop: 74},
    { name: 'Sport/Grovpistol Snabb Serie 5', action: 'Tavla bort 7 sekunder', start: 75, stop: 81},
    { name: 'Sport/Grovpistol Snabb Serie 5', action: 'Tavla fram 3 sekunder', start: 82, stop: 84},
    { name: 'Sport/Grovpistol Snabb Serie 5', action: 'Tavla bort 7 sekunder', start: 85, stop: 91},
    { name: 'Sport/Grovpistol Snabb Serie 5', action: 'Tavla fram 3 sekunder', start: 92, stop: 94},
    { name: 'Sport/Grovpistol Snabb Serie 5', action: 'Tavla bort 7 sekunder', start: 95, stop: 101},
    { name: 'Sport/Grovpistol Snabb Serie 5', action: 'Tavla fram 3 sekunder', start: 102, stop: 104},
    { name: 'Sport/Grovpistol Snabb Serie 5', action: 'Tavla bort 7 sekunder', start: 105, stop: 111},
    { name: 'Sport/Grovpistol Snabb Serie 5', action: 'Tavla fram 3 sekunder', start: 112, stop: 114},
    { name: 'Sport/Grovpistol Snabb Serie 5', action: 'Tavla bort', start: 115, stop: 116},
    { name: 'Sport/Grovpistol Snabb Serie 5', action: 'NÅGRA FUNKTIONERINGSFEL?', start: 117, stop: 124},
    { name: 'Sport/Grovpistol Snabb Serie 5', action: 'STOPP, PATRON UR', start: 125, stop: 128},
    { name: 'Sport/Grovpistol Snabb Serie 5', action: 'VISITATION', start: 129, stop: 131},
    
    { name: 'Sport/Grovpistol Snabb Serie 6', action: 'FÖR NÄSTA TÄVLINGSSERIE LADDA', start: 1, stop: 4},
    { name: 'Sport/Grovpistol Snabb Serie 6', action: 'Fördröjning 60 sekunder', start: 4, stop: 63},
    { name: 'Sport/Grovpistol Snabb Serie 6', action: 'FÄRDIGA', start: 64, stop: 64},
    { name: 'Sport/Grovpistol Snabb Serie 6', action: 'Tavla bort 7 sekunder', start: 65, stop: 71},
    { name: 'Sport/Grovpistol Snabb Serie 6', action: 'Tavla fram 3 sekunder', start: 72, stop: 74},
    { name: 'Sport/Grovpistol Snabb Serie 6', action: 'Tavla bort 7 sekunder', start: 75, stop: 81},
    { name: 'Sport/Grovpistol Snabb Serie 6', action: 'Tavla fram 3 sekunder', start: 82, stop: 84},
    { name: 'Sport/Grovpistol Snabb Serie 6', action: 'Tavla bort 7 sekunder', start: 85, stop: 91},
    { name: 'Sport/Grovpistol Snabb Serie 6', action: 'Tavla fram 3 sekunder', start: 92, stop: 94},
    { name: 'Sport/Grovpistol Snabb Serie 6', action: 'Tavla bort 7 sekunder', start: 95, stop: 101},
    { name: 'Sport/Grovpistol Snabb Serie 6', action: 'Tavla fram 3 sekunder', start: 102, stop: 104},
    { name: 'Sport/Grovpistol Snabb Serie 6', action: 'Tavla bort 7 sekunder', start: 105, stop: 111},
    { name: 'Sport/Grovpistol Snabb Serie 6', action: 'Tavla fram 3 sekunder', start: 112, stop: 114},
    { name: 'Sport/Grovpistol Snabb Serie 6', action: 'Tavla bort', start: 115, stop: 116},
    { name: 'Sport/Grovpistol Snabb Serie 6', action: 'NÅGRA FUNKTIONERINGSFEL?', start: 117, stop: 124},
    { name: 'Sport/Grovpistol Snabb Serie 6', action: 'STOPP, PATRON UR', start: 125, stop: 128},
    { name: 'Sport/Grovpistol Snabb Serie 6', action: 'VISITATION', start: 129, stop: 131},
    
    { name: 'Sport/Grovpistol Snabb Kompletteringsserie', action: 'FÖR KOMPLETTERINGSSERIE LADDA', start: 1, stop: 4},
    { name: 'Sport/Grovpistol Snabb Kompletteringsserie', action: 'Fördröjning 60 sekunder', start: 4, stop: 63},
    { name: 'Sport/Grovpistol Snabb Kompletteringsserie', action: 'FÄRDIGA', start: 64, stop: 64},
    { name: 'Sport/Grovpistol Snabb Kompletteringsserie', action: 'Tavla bort 7 sekunder', start: 65, stop: 71},
    { name: 'Sport/Grovpistol Snabb Kompletteringsserie', action: 'Tavla fram 3 sekunder', start: 72, stop: 74},
    { name: 'Sport/Grovpistol Snabb Kompletteringsserie', action: 'Tavla bort 7 sekunder', start: 75, stop: 81},
    { name: 'Sport/Grovpistol Snabb Kompletteringsserie', action: 'Tavla fram 3 sekunder', start: 82, stop: 84},
    { name: 'Sport/Grovpistol Snabb Kompletteringsserie', action: 'Tavla bort 7 sekunder', start: 85, stop: 91},
    { name: 'Sport/Grovpistol Snabb Kompletteringsserie', action: 'Tavla fram 3 sekunder', start: 92, stop: 94},
    { name: 'Sport/Grovpistol Snabb Kompletteringsserie', action: 'Tavla bort 7 sekunder', start: 95, stop: 101},
    { name: 'Sport/Grovpistol Snabb Kompletteringsserie', action: 'Tavla fram 3 sekunder', start: 102, stop: 104},
    { name: 'Sport/Grovpistol Snabb Kompletteringsserie', action: 'Tavla bort 7 sekunder', start: 105, stop: 111},
    { name: 'Sport/Grovpistol Snabb Kompletteringsserie', action: 'Tavla fram 3 sekunder', start: 112, stop: 114},
    { name: 'Sport/Grovpistol Snabb Kompletteringsserie', action: 'Tavla bort', start: 115, stop: 116},
    { name: 'Sport/Grovpistol Snabb Kompletteringsserie', action: 'NÅGRA FUNKTIONERINGSFEL?', start: 117, stop: 124},
    { name: 'Sport/Grovpistol Snabb Kompletteringsserie', action: 'STOPP, PATRON UR', start: 125, stop: 128},
    { name: 'Sport/Grovpistol Snabb Kompletteringsserie', action: 'VISITATION', start: 129, stop: 131},
        
    //25 METER STANDARDPISTOL
    { name: 'Standardpistol Förberedelsetid + Provserie', action: 'FÖRBEREDELSETID BÖRJAR NU', start: 1, stop: 3},
    { name: 'Standardpistol Förberedelsetid + Provserie', action: 'Fördröjning 180 sekunder', start: 4, stop: 183},
    { name: 'Standardpistol Förberedelsetid + Provserie', action: 'PROVSERIE 150 SEKUNDER LADDA', start: 184, stop: 190},
    { name: 'Standardpistol Förberedelsetid + Provserie', action: 'Fördröjning 60 sekunder', start: 191, stop: 250},
    { name: 'Standardpistol Förberedelsetid + Provserie', action: 'FÄRDIGA', start: 251, stop: 251},
    { name: 'Standardpistol Förberedelsetid + Provserie', action: 'Tavla bort 7 sekunder', start: 252, stop: 258},
    { name: 'Standardpistol Förberedelsetid + Provserie', action: 'Tavla fram 150 sekunder', start: 259, stop: 408},
    { name: 'Standardpistol Förberedelsetid + Provserie', action: 'Tavla bort', start: 409, stop: 410},
    { name: 'Standardpistol Förberedelsetid + Provserie', action: 'NÅGRA FUNKTIONERINGSFEL?', start: 411, stop: 418},
    { name: 'Standardpistol Förberedelsetid + Provserie', action: 'STOPP, PATRON UR', start: 419, stop: 422},
    { name: 'Standardpistol Förberedelsetid + Provserie', action: 'VISITATION', start: 423, stop: 425},
    
    { name: 'Standardpistol 150 sek', action: '150 SEKUNDERS SERIE LADDA', start: 1, stop: 4},
    { name: 'Standardpistol 150 sek', action: 'Fördröjning 60 sekunder', start: 5, stop: 64},
    { name: 'Standardpistol 150 sek', action: 'FÄRDIGA', start: 65, stop: 65},
    { name: 'Standardpistol 150 sek', action: 'Tavla bort 7 sekunder', start: 66, stop: 72},
    { name: 'Standardpistol 150 sek', action: 'Tavla fram 150 sekunder', start: 73, stop: 222},
    { name: 'Standardpistol 150 sek', action: 'Tavla bort', start: 223, stop: 224},
    { name: 'Standardpistol 150 sek', action: 'NÅGRA FUNKTIONERINGSFEL?', start: 225, stop: 230},
    { name: 'Standardpistol 150 sek', action: 'STOPP, PATRON UR', start: 231, stop: 234},
    { name: 'Standardpistol 150 sek', action: 'VISITATION', start: 235, stop: 237},
        
    { name: 'Standardpistol 20 sek', action: '20 SEKUNDERS SERIE LADDA', start: 1, stop: 4},
    { name: 'Standardpistol 20 sek', action: 'Fördröjning 60 sekunder', start: 5, stop: 64},
    { name: 'Standardpistol 20 sek', action: 'FÄRDIGA', start: 65, stop: 65},
    { name: 'Standardpistol 20 sek', action: 'Tavla bort 7 sekunder', start: 66, stop: 72},
    { name: 'Standardpistol 20 sek', action: 'Tavla fram 20 sekunder', start: 73, stop: 92},
    { name: 'Standardpistol 20 sek', action: 'Tavla bort', start: 93, stop: 94},
    { name: 'Standardpistol 20 sek', action: 'NÅGRA FUNKTIONERINGSFEL?', start: 95, stop: 100},
    { name: 'Standardpistol 20 sek', action: 'STOPP, PATRON UR', start: 101, stop: 104},
    { name: 'Standardpistol 20 sek', action: 'VISITATION', start: 105, stop: 107},
    
    { name: 'Standardpistol 10 sek', action: '10 SEKUNDERS SERIE LADDA', start: 1, stop: 4},
    { name: 'Standardpistol 10 sek', action: 'Fördröjning 60 sekunder', start: 5, stop: 64},
    { name: 'Standardpistol 10 sek', action: 'FÄRDIGA', start: 65, stop: 65},
    { name: 'Standardpistol 10 sek', action: 'Tavla bort 7 sekunder', start: 66, stop: 72},
    { name: 'Standardpistol 10 sek', action: 'Tavla fram 10 sekunder', start: 73, stop: 82},
    { name: 'Standardpistol 10 sek', action: 'Tavla bort', start: 83, stop: 84},
    { name: 'Standardpistol 10 sek', action: 'NÅGRA FUNKTIONERINGSFEL?', start: 85, stop: 90},
    { name: 'Standardpistol 10 sek', action: 'STOPP, PATRON UR', start: 91, stop: 94},
    { name: 'Standardpistol 10 sek', action: 'VISITATION', start: 95, stop: 97},
    
    //FÄLT RÖRLIGA MÅL
    { name: 'Fält Rörlig - 16 sek', action: 'LADDA', start: 1, stop: 3},
    { name: 'Fält Rörlig - 16 sek', action: 'Fördröjning 30 sekunder', start: 4, stop: 33},
    { name: 'Fält Rörlig - 16 sek', action: 'ALLA KLARA?', start: 34, stop: 35},
    { name: 'Fält Rörlig - 16 sek', action: '10 SEKUNDER KVAR', start: 36, stop: 41},
    { name: 'Fält Rörlig - 16 sek', action: 'Fördröjning 7 sekunder', start: 42, stop: 48},
    { name: 'Fält Rörlig - 16 sek', action: 'FÄRDIGA', start: 49, stop: 49},
    { name: 'Fält Rörlig - 16 sek', action: 'Fördröjning 3 sekunder', start: 50, stop: 52},
    { name: 'Fält Rörlig - 16 sek', action: 'Tavla fram 16 sekunder', start: 53, stop: 68},
    { name: 'Fält Rörlig - 16 sek', action: 'Tavla bort', start: 69, stop: 70},
    { name: 'Fält Rörlig - 16 sek', action: 'ELD UPPHÖR', start: 71, stop: 75},
    { name: 'Fält Rörlig - 16 sek', action: 'PATRON UR, PROPPA VAPEN', start: 76, stop: 80},
    { name: 'Fält Rörlig - 16 sek', action: 'VISITATION', start: 81, stop: 83},
    
    { name: 'Fält Rörlig - 14 sek', action: 'LADDA', start: 1, stop: 3},
    { name: 'Fält Rörlig - 14 sek', action: 'Fördröjning 30 sekunder', start: 4, stop: 33},
    { name: 'Fält Rörlig - 14 sek', action: 'ALLA KLARA?', start: 34, stop: 35},
    { name: 'Fält Rörlig - 14 sek', action: '10 SEKUNDER KVAR', start: 36, stop: 41},
    { name: 'Fält Rörlig - 14 sek', action: 'Fördröjning 7 sekunder', start: 42, stop: 48},
    { name: 'Fält Rörlig - 14 sek', action: 'FÄRDIGA', start: 49, stop: 49},
    { name: 'Fält Rörlig - 14 sek', action: 'Fördröjning 3 sekunder', start: 50, stop: 52},
    { name: 'Fält Rörlig - 14 sek', action: 'Tavla fram 14 sekunder', start: 53, stop: 66},
    { name: 'Fält Rörlig - 14 sek', action: 'Tavla bort', start: 67, stop: 68},
    { name: 'Fält Rörlig - 14 sek', action: 'ELD UPPHÖR', start: 69, stop: 73},
    { name: 'Fält Rörlig - 14 sek', action: 'PATRON UR, PROPPA VAPEN', start: 74, stop: 78},
    { name: 'Fält Rörlig - 14 sek', action: 'VISITATION', start: 79, stop: 81},
    
    { name: 'Fält Rörlig - 12 sek', action: 'LADDA', start: 1, stop: 3},
    { name: 'Fält Rörlig - 12 sek', action: 'Fördröjning 30 sekunder', start: 4, stop: 33},
    { name: 'Fält Rörlig - 12 sek', action: 'ALLA KLARA?', start: 34, stop: 35},
    { name: 'Fält Rörlig - 12 sek', action: '10 SEKUNDER KVAR', start: 36, stop: 41},
    { name: 'Fält Rörlig - 12 sek', action: 'Fördröjning 7 sekunder', start: 42, stop: 48},
    { name: 'Fält Rörlig - 12 sek', action: 'FÄRDIGA', start: 49, stop: 49},
    { name: 'Fält Rörlig - 12 sek', action: 'Fördröjning 3 sekunder', start: 50, stop: 52},
    { name: 'Fält Rörlig - 12 sek', action: 'Tavla fram 12 sekunder', start: 53, stop: 64},
    { name: 'Fält Rörlig - 12 sek', action: 'Tavla bort', start: 65, stop: 66},
    { name: 'Fält Rörlig - 12 sek', action: 'ELD UPPHÖR', start: 67, stop: 71},
    { name: 'Fält Rörlig - 12 sek', action: 'PATRON UR, PROPPA VAPEN', start: 72, stop: 76},
    { name: 'Fält Rörlig - 12 sek', action: 'VISITATION', start: 77, stop: 79},
    
    { name: 'Fält Rörlig - 10 sek', action: 'LADDA', start: 1, stop: 3},
    { name: 'Fält Rörlig - 10 sek', action: 'Fördröjning 30 sekunder', start: 4, stop: 33},
    { name: 'Fält Rörlig - 10 sek', action: 'ALLA KLARA?', start: 34, stop: 35},
    { name: 'Fält Rörlig - 10 sek', action: '10 SEKUNDER KVAR', start: 36, stop: 41},
    { name: 'Fält Rörlig - 10 sek', action: 'Fördröjning 7 sekunder', start: 42, stop: 48},
    { name: 'Fält Rörlig - 10 sek', action: 'FÄRDIGA', start: 49, stop: 49},
    { name: 'Fält Rörlig - 10 sek', action: 'Fördröjning 3 sekunder', start: 50, stop: 52},
    { name: 'Fält Rörlig - 10 sek', action: 'Tavla fram 10 sekunder', start: 53, stop: 62},
    { name: 'Fält Rörlig - 10 sek', action: 'Tavla bort', start: 63, stop: 64},
    { name: 'Fält Rörlig - 10 sek', action: 'ELD UPPHÖR', start: 65, stop: 69},
    { name: 'Fält Rörlig - 10 sek', action: 'PATRON UR, PROPPA VAPEN', start: 70, stop: 74},
    { name: 'Fält Rörlig - 10 sek', action: 'VISITATION', start: 75, stop: 77},
    
    { name: 'Fält Rörlig - 8 sek', action: 'LADDA', start: 1, stop: 3},
    { name: 'Fält Rörlig - 8 sek', action: 'Fördröjning 30 sekunder', start: 4, stop: 33},
    { name: 'Fält Rörlig - 8 sek', action: 'ALLA KLARA?', start: 34, stop: 35},
    { name: 'Fält Rörlig - 8 sek', action: '10 SEKUNDER KVAR', start: 36, stop: 41},
    { name: 'Fält Rörlig - 8 sek', action: 'Fördröjning 7 sekunder', start: 42, stop: 48},
    { name: 'Fält Rörlig - 8 sek', action: 'FÄRDIGA', start: 49, stop: 49},
    { name: 'Fält Rörlig - 8 sek', action: 'Fördröjning 3 sekunder', start: 50, stop: 52},
    { name: 'Fält Rörlig - 8 sek', action: 'Tavla fram 8 sekunder', start: 53, stop: 60},
    { name: 'Fält Rörlig - 8 sek', action: 'Tavla bort', start: 61, stop: 62},
    { name: 'Fält Rörlig - 8 sek', action: 'ELD UPPHÖR', start: 63, stop: 67},
    { name: 'Fält Rörlig - 8 sek', action: 'PATRON UR, PROPPA VAPEN', start: 68, stop: 72},
    { name: 'Fält Rörlig - 8 sek', action: 'VISITATION', start: 73, stop: 75},
    
    { name: 'Fält Rörlig - 6 sek', action: 'LADDA', start: 1, stop: 3},
    { name: 'Fält Rörlig - 6 sek', action: 'Fördröjning 30 sekunder', start: 4, stop: 33},
    { name: 'Fält Rörlig - 6 sek', action: 'ALLA KLARA?', start: 34, stop: 35},
    { name: 'Fält Rörlig - 6 sek', action: '10 SEKUNDER KVAR', start: 36, stop: 41},
    { name: 'Fält Rörlig - 6 sek', action: 'Fördröjning 7 sekunder', start: 42, stop: 48},
    { name: 'Fält Rörlig - 6 sek', action: 'FÄRDIGA', start: 49, stop: 49},
    { name: 'Fält Rörlig - 6 sek', action: 'Fördröjning 3 sekunder', start: 50, stop: 52},
    { name: 'Fält Rörlig - 6 sek', action: 'Tavla fram 6 sekunder', start: 53, stop: 58},
    { name: 'Fält Rörlig - 6 sek', action: 'Tavla bort', start: 59, stop: 60},
    { name: 'Fält Rörlig - 6 sek', action: 'ELD UPPHÖR', start: 61, stop: 65},
    { name: 'Fält Rörlig - 6 sek', action: 'PATRON UR, PROPPA VAPEN', start: 66, stop: 70},
    { name: 'Fält Rörlig - 6 sek', action: 'VISITATION', start: 71, stop: 73},
    
    { name: 'Fält Rörlig 2x8/8', action: 'LADDA', start: 1, stop: 3},
    { name: 'Fält Rörlig 2x8/8', action: 'Fördröjning 30 sekunder', start: 4, stop: 33},
    { name: 'Fält Rörlig 2x8/8', action: 'ALLA KLARA?', start: 34, stop: 35},
    { name: 'Fält Rörlig 2x8/8', action: '10 SEKUNDER KVAR', start: 36, stop: 41},
    { name: 'Fält Rörlig 2x8/8', action: 'Fördröjning 7 sekunder', start: 42, stop: 48},
    { name: 'Fält Rörlig 2x8/8', action: 'FÄRDIGA', start: 49, stop: 49},
    { name: 'Fält Rörlig 2x8/8', action: 'Fördröjning 3 sekunder', start: 50, stop: 52},
    { name: 'Fält Rörlig 2x8/8', action: 'Tavla fram 8 sekunder', start: 53, stop: 60},
    { name: 'Fält Rörlig 2x8/8', action: 'Tavla bort 8 sekunder', start: 61, stop: 68},
    { name: 'Fält Rörlig 2x8/8', action: 'Tavla fram 8 sekunder', start: 69, stop: 76},
    { name: 'Fält Rörlig 2x8/8', action: 'Tavla bort', start: 77, stop: 78},
    { name: 'Fält Rörlig 2x8/8', action: 'ELD UPPHÖR', start: 79, stop: 84},
    { name: 'Fält Rörlig 2x8/8', action: 'PATRON UR, PROPPA VAPEN', start: 85, stop: 89},
    { name: 'Fält Rörlig 2x8/8', action: 'VISITATION', start: 90, stop: 92},
    
    { name: 'Fält Rörlig 2x6/6', action: 'LADDA', start: 1, stop: 3},
    { name: 'Fält Rörlig 2x6/6', action: 'Fördröjning 30 sekunder', start: 4, stop: 33},
    { name: 'Fält Rörlig 2x6/6', action: 'ALLA KLARA?', start: 34, stop: 35},
    { name: 'Fält Rörlig 2x6/6', action: '10 SEKUNDER KVAR', start: 36, stop: 41},
    { name: 'Fält Rörlig 2x6/6', action: 'Fördröjning 7 sekunder', start: 42, stop: 48},
    { name: 'Fält Rörlig 2x6/6', action: 'FÄRDIGA', start: 49, stop: 49},
    { name: 'Fält Rörlig 2x6/6', action: 'Fördröjning 3 sekunder', start: 50, stop: 52},
    { name: 'Fält Rörlig 2x6/6', action: 'Tavla fram 6 sekunder', start: 53, stop: 58},
    { name: 'Fält Rörlig 2x6/6', action: 'Tavla bort 6 sekunder', start: 59, stop: 64},
    { name: 'Fält Rörlig 2x6/6', action: 'Tavla fram 6 sekunder', start: 65, stop: 70},
    { name: 'Fält Rörlig 2x6/6', action: 'Tavla bort', start: 71, stop: 72},
    { name: 'Fält Rörlig 2x6/6', action: 'ELD UPPHÖR', start: 73, stop: 78},
    { name: 'Fält Rörlig 2x6/6', action: 'PATRON UR, PROPPA VAPEN', start: 79, stop: 83},
    { name: 'Fält Rörlig 2x6/6', action: 'VISITATION', start: 84, stop: 86},
    
    { name: 'Fält Rörlig 2x5/5', action: 'LADDA', start: 1, stop: 3},
    { name: 'Fält Rörlig 2x5/5', action: 'Fördröjning 30 sekunder', start: 4, stop: 33},
    { name: 'Fält Rörlig 2x5/5', action: 'ALLA KLARA?', start: 34, stop: 35},
    { name: 'Fält Rörlig 2x5/5', action: '10 SEKUNDER KVAR', start: 36, stop: 41},
    { name: 'Fält Rörlig 2x5/5', action: 'Fördröjning 7 sekunder', start: 42, stop: 48},
    { name: 'Fält Rörlig 2x5/5', action: 'FÄRDIGA', start: 49, stop: 49},
    { name: 'Fält Rörlig 2x5/5', action: 'Fördröjning 3 sekunder', start: 50, stop: 52},
    { name: 'Fält Rörlig 2x5/5', action: 'Tavla fram 5 sekunder', start: 53, stop: 57},
    { name: 'Fält Rörlig 2x5/5', action: 'Tavla bort 5 sekunder', start: 58, stop: 62},
    { name: 'Fält Rörlig 2x5/5', action: 'Tavla fram 5 sekunder', start: 63, stop: 67},
    { name: 'Fält Rörlig 2x5/5', action: 'Tavla bort', start: 68, stop: 69},
    { name: 'Fält Rörlig 2x5/5', action: 'ELD UPPHÖR', start: 70, stop: 75},
    { name: 'Fält Rörlig 2x5/5', action: 'PATRON UR, PROPPA VAPEN', start: 76, stop: 80},
    { name: 'Fält Rörlig 2x5/5', action: 'VISITATION', start: 81, stop: 83},
    
    { name: 'Fält Rörlig 2x4/4', action: 'LADDA', start: 1, stop: 3},
    { name: 'Fält Rörlig 2x4/4', action: 'Fördröjning 30 sekunder', start: 4, stop: 33},
    { name: 'Fält Rörlig 2x4/4', action: 'ALLA KLARA?', start: 34, stop: 35},
    { name: 'Fält Rörlig 2x4/4', action: '10 SEKUNDER KVAR', start: 36, stop: 41},
    { name: 'Fält Rörlig 2x4/4', action: 'Fördröjning 7 sekunder', start: 42, stop: 48},
    { name: 'Fält Rörlig 2x4/4', action: 'FÄRDIGA', start: 49, stop: 49},
    { name: 'Fält Rörlig 2x4/4', action: 'Fördröjning 3 sekunder', start: 50, stop: 52},
    { name: 'Fält Rörlig 2x4/4', action: 'Tavla fram 4 sekunder', start: 53, stop: 56},
    { name: 'Fält Rörlig 2x4/4', action: 'Tavla bort 4 sekunder', start: 57, stop: 60},
    { name: 'Fält Rörlig 2x4/4', action: 'Tavla fram 4 sekunder', start: 61, stop: 64},
    { name: 'Fält Rörlig 2x4/4', action: 'Tavla bort', start: 65, stop: 66},
    { name: 'Fält Rörlig 2x4/4', action: 'ELD UPPHÖR', start: 67, stop: 72},
    { name: 'Fält Rörlig 2x4/4', action: 'PATRON UR, PROPPA VAPEN', start: 73, stop: 77},
    { name: 'Fält Rörlig 2x4/4', action: 'VISITATION', start: 78, stop: 80},
    
    { name: 'Fält Rörlig 2x3/3', action: 'LADDA', start: 1, stop: 3},
    { name: 'Fält Rörlig 2x3/3', action: 'Fördröjning 30 sekunder', start: 4, stop: 33},
    { name: 'Fält Rörlig 2x3/3', action: 'ALLA KLARA?', start: 34, stop: 35},
    { name: 'Fält Rörlig 2x3/3', action: '10 SEKUNDER KVAR', start: 36, stop: 41},
    { name: 'Fält Rörlig 2x3/3', action: 'Fördröjning 7 sekunder', start: 42, stop: 48},
    { name: 'Fält Rörlig 2x3/3', action: 'FÄRDIGA', start: 49, stop: 49},
    { name: 'Fält Rörlig 2x3/3', action: 'Fördröjning 3 sekunder', start: 50, stop: 52},
    { name: 'Fält Rörlig 2x3/3', action: 'Tavla fram 3 sekunder', start: 53, stop: 55},
    { name: 'Fält Rörlig 2x3/3', action: 'Tavla bort 3 sekunder', start: 56, stop: 58},
    { name: 'Fält Rörlig 2x3/3', action: 'Tavla fram 3 sekunder', start: 59, stop: 61},
    { name: 'Fält Rörlig 2x3/3', action: 'Tavla bort', start: 62, stop: 63},
    { name: 'Fält Rörlig 2x3/3', action: 'ELD UPPHÖR', start: 64, stop: 69},
    { name: 'Fält Rörlig 2x3/3', action: 'PATRON UR, PROPPA VAPEN', start: 70, stop: 74},
    { name: 'Fält Rörlig 2x3/3', action: 'VISITATION', start: 75, stop: 77},
    
    { name: 'Fält Rörlig 3x6/4', action: 'LADDA', start: 1, stop: 3},
    { name: 'Fält Rörlig 3x6/4', action: 'Fördröjning 30 sekunder', start: 4, stop: 33},
    { name: 'Fält Rörlig 3x6/4', action: 'ALLA KLARA?', start: 34, stop: 35},
    { name: 'Fält Rörlig 3x6/4', action: '10 SEKUNDER KVAR', start: 36, stop: 41},
    { name: 'Fält Rörlig 3x6/4', action: 'Fördröjning 7 sekunder', start: 42, stop: 48},
    { name: 'Fält Rörlig 3x6/4', action: 'FÄRDIGA', start: 49, stop: 49},
    { name: 'Fält Rörlig 3x6/4', action: 'Fördröjning 3 sekunder', start: 50, stop: 52},
    { name: 'Fält Rörlig 3x6/4', action: 'Tavla fram 6 sekunder', start: 53, stop: 58},
    { name: 'Fält Rörlig 3x6/4', action: 'Tavla bort 4 sekunder', start: 59, stop: 62},
    { name: 'Fält Rörlig 3x6/4', action: 'Tavla fram 6 sekunder', start: 63, stop: 68},
    { name: 'Fält Rörlig 3x6/4', action: 'Tavla bort 4 sekunder', start: 69, stop: 72},
    { name: 'Fält Rörlig 3x6/4', action: 'Tavla fram 6 sekunder', start: 73, stop: 78},
    { name: 'Fält Rörlig 3x6/4', action: 'Tavla bort', start: 79, stop: 80},
    { name: 'Fält Rörlig 3x6/4', action: 'ELD UPPHÖR', start: 81, stop: 86},
    { name: 'Fält Rörlig 3x6/4', action: 'PATRON UR, PROPPA VAPEN', start: 87, stop: 91},
    { name: 'Fält Rörlig 3x6/4', action: 'VISITATION', start: 92, stop: 94},
    
    { name: 'Fält Rörlig 3x4/4', action: 'LADDA', start: 1, stop: 3},
    { name: 'Fält Rörlig 3x4/4', action: 'Fördröjning 30 sekunder', start: 4, stop: 33},
    { name: 'Fält Rörlig 3x4/4', action: 'ALLA KLARA?', start: 34, stop: 35},
    { name: 'Fält Rörlig 3x4/4', action: '10 SEKUNDER KVAR', start: 36, stop: 41},
    { name: 'Fält Rörlig 3x4/4', action: 'Fördröjning 7 sekunder', start: 42, stop: 48},
    { name: 'Fält Rörlig 3x4/4', action: 'FÄRDIGA', start: 49, stop: 49},
    { name: 'Fält Rörlig 3x4/4', action: 'Fördröjning 3 sekunder', start: 50, stop: 52},
    { name: 'Fält Rörlig 3x4/4', action: 'Tavla fram 4 sekunder', start: 53, stop: 56},
    { name: 'Fält Rörlig 3x4/4', action: 'Tavla bort 4 sekunder', start: 57, stop: 60},
    { name: 'Fält Rörlig 3x4/4', action: 'Tavla fram 4 sekunder', start: 61, stop: 64},
    { name: 'Fält Rörlig 3x4/4', action: 'Tavla bort 4 sekunder', start: 65, stop: 68},
    { name: 'Fält Rörlig 3x4/4', action: 'Tavla fram 4 sekunder', start: 69, stop: 72},
    { name: 'Fält Rörlig 3x4/4', action: 'Tavla bort', start: 73, stop: 74},
    { name: 'Fält Rörlig 3x4/4', action: 'ELD UPPHÖR', start: 75, stop: 80},
    { name: 'Fält Rörlig 3x4/4', action: 'PATRON UR, PROPPA VAPEN', start: 81, stop: 85},
    { name: 'Fält Rörlig 3x4/4', action: 'VISITATION', start: 86, stop: 88},
    
    { name: 'Fält Rörlig 3x3/3', action: 'LADDA', start: 1, stop: 3},
    { name: 'Fält Rörlig 3x3/3', action: 'Fördröjning 30 sekunder', start: 4, stop: 33},
    { name: 'Fält Rörlig 3x3/3', action: 'ALLA KLARA?', start: 34, stop: 35},
    { name: 'Fält Rörlig 3x3/3', action: '10 SEKUNDER KVAR', start: 36, stop: 41},
    { name: 'Fält Rörlig 3x3/3', action: 'Fördröjning 7 sekunder', start: 42, stop: 48},
    { name: 'Fält Rörlig 3x3/3', action: 'FÄRDIGA', start: 49, stop: 49},
    { name: 'Fält Rörlig 3x3/3', action: 'Fördröjning 3 sekunder', start: 50, stop: 52},
    { name: 'Fält Rörlig 3x3/3', action: 'Tavla fram 3 sekunder', start: 53, stop: 55},
    { name: 'Fält Rörlig 3x3/3', action: 'Tavla bort 3 sekunder', start: 56, stop: 58},
    { name: 'Fält Rörlig 3x3/3', action: 'Tavla fram 3 sekunder', start: 59, stop: 61},
    { name: 'Fält Rörlig 3x3/3', action: 'Tavla bort 3 sekunder', start: 62, stop: 64},
    { name: 'Fält Rörlig 3x3/3', action: 'Tavla fram 3 sekunder', start: 65, stop: 67},
    { name: 'Fält Rörlig 3x3/3', action: 'Tavla bort', start: 68, stop: 69},
    { name: 'Fält Rörlig 3x3/3', action: 'ELD UPPHÖR', start: 70, stop: 75},
    { name: 'Fält Rörlig 3x3/3', action: 'PATRON UR, PROPPA VAPEN', start: 76, stop: 80},
    { name: 'Fält Rörlig 3x3/3', action: 'VISITATION', start: 81, stop: 83},
    
    { name: 'Fält Rörlig 3x3/2', action: 'LADDA', start: 1, stop: 3},
    { name: 'Fält Rörlig 3x3/2', action: 'Fördröjning 30 sekunder', start: 4, stop: 33},
    { name: 'Fält Rörlig 3x3/2', action: 'ALLA KLARA?', start: 34, stop: 35},
    { name: 'Fält Rörlig 3x3/2', action: '10 SEKUNDER KVAR', start: 36, stop: 41},
    { name: 'Fält Rörlig 3x3/2', action: 'Fördröjning 7 sekunder', start: 42, stop: 48},
    { name: 'Fält Rörlig 3x3/2', action: 'FÄRDIGA', start: 49, stop: 49},
    { name: 'Fält Rörlig 3x3/2', action: 'Fördröjning 3 sekunder', start: 50, stop: 52},
    { name: 'Fält Rörlig 3x3/2', action: 'Tavla fram 3 sekunder', start: 53, stop: 55},
    { name: 'Fält Rörlig 3x3/2', action: 'Tavla bort 2 sekunder', start: 56, stop: 57},
    { name: 'Fält Rörlig 3x3/2', action: 'Tavla fram 3 sekunder', start: 58, stop: 60},
    { name: 'Fält Rörlig 3x3/2', action: 'Tavla bort 2 sekunder', start: 61, stop: 62},
    { name: 'Fält Rörlig 3x3/2', action: 'Tavla fram 3 sekunder', start: 63, stop: 65},
    { name: 'Fält Rörlig 3x3/2', action: 'Tavla bort', start: 66, stop: 67},
    { name: 'Fält Rörlig 3x3/2', action: 'ELD UPPHÖR', start: 68, stop: 73},
    { name: 'Fält Rörlig 3x3/2', action: 'PATRON UR, PROPPA VAPEN', start: 74, stop: 78},
    { name: 'Fält Rörlig 3x3/2', action: 'VISITATION', start: 79, stop: 81},
    
    { name: 'Fält Rörlig 3x2/2', action: 'LADDA', start: 1, stop: 3},
    { name: 'Fält Rörlig 3x2/2', action: 'Fördröjning 30 sekunder', start: 4, stop: 33},
    { name: 'Fält Rörlig 3x2/2', action: 'ALLA KLARA?', start: 34, stop: 35},
    { name: 'Fält Rörlig 3x2/2', action: '10 SEKUNDER KVAR', start: 36, stop: 41},
    { name: 'Fält Rörlig 3x2/2', action: 'Fördröjning 7 sekunder', start: 42, stop: 48},
    { name: 'Fält Rörlig 3x2/2', action: 'FÄRDIGA', start: 49, stop: 49},
    { name: 'Fält Rörlig 3x2/2', action: 'Fördröjning 3 sekunder', start: 50, stop: 52},
    { name: 'Fält Rörlig 3x2/2', action: 'Tavla fram 2 sekunder', start: 53, stop: 54},
    { name: 'Fält Rörlig 3x2/2', action: 'Tavla bort 2 sekunder', start: 55, stop: 56},
    { name: 'Fält Rörlig 3x2/2', action: 'Tavla fram 2 sekunder', start: 57, stop: 58},
    { name: 'Fält Rörlig 3x2/2', action: 'Tavla bort 2 sekunder', start: 59, stop: 60},
    { name: 'Fält Rörlig 3x2/2', action: 'Tavla fram 2 sekunder', start: 61, stop: 62},
    { name: 'Fält Rörlig 3x2/2', action: 'Tavla bort', start: 63, stop: 64},
    { name: 'Fält Rörlig 3x2/2', action: 'ELD UPPHÖR', start: 65, stop: 70},
    { name: 'Fält Rörlig 3x2/2', action: 'PATRON UR, PROPPA VAPEN', start: 71, stop: 75},
    { name: 'Fält Rörlig 3x2/2', action: 'VISITATION', start: 76, stop: 78},
    
    { name: 'Fält Rörlig 6x4/2', action: 'LADDA', start: 1, stop: 3},
    { name: 'Fält Rörlig 6x4/2', action: 'Fördröjning 30 sekunder', start: 4, stop: 33},
    { name: 'Fält Rörlig 6x4/2', action: 'ALLA KLARA?', start: 34, stop: 35},
    { name: 'Fält Rörlig 6x4/2', action: '10 SEKUNDER KVAR', start: 36, stop: 41},
    { name: 'Fält Rörlig 6x4/2', action: 'Fördröjning 7 sekunder', start: 42, stop: 48},
    { name: 'Fält Rörlig 6x4/2', action: 'FÄRDIGA', start: 49, stop: 49},
    { name: 'Fält Rörlig 6x4/2', action: 'Fördröjning 3 sekunder', start: 50, stop: 52},
    { name: 'Fält Rörlig 6x4/2', action: 'Tavla fram 4 sekunder', start: 53, stop: 56},
    { name: 'Fält Rörlig 6x4/2', action: 'Tavla bort 2 sekunder', start: 57, stop: 58},
    { name: 'Fält Rörlig 6x4/2', action: 'Tavla fram 4 sekunder', start: 59, stop: 62},
    { name: 'Fält Rörlig 6x4/2', action: 'Tavla bort 2 sekunder', start: 63, stop: 64},
    { name: 'Fält Rörlig 6x4/2', action: 'Tavla fram 4 sekunder', start: 65, stop: 68},
    { name: 'Fält Rörlig 6x4/2', action: 'Tavla bort 2 sekunder', start: 69, stop: 70},
    { name: 'Fält Rörlig 6x4/2', action: 'Tavla fram 4 sekunder', start: 71, stop: 74},
    { name: 'Fält Rörlig 6x4/2', action: 'Tavla bort 2 sekunder', start: 75, stop: 76},
    { name: 'Fält Rörlig 6x4/2', action: 'Tavla fram 4 sekunder', start: 77, stop: 80},
    { name: 'Fält Rörlig 6x4/2', action: 'Tavla bort 2 sekunder', start: 81, stop: 82},
    { name: 'Fält Rörlig 6x4/2', action: 'Tavla fram 4 sekunder', start: 83, stop: 86},
    { name: 'Fält Rörlig 6x4/2', action: 'Tavla bort', start: 87, stop: 88},
    { name: 'Fält Rörlig 6x4/2', action: 'ELD UPPHÖR', start: 89, stop: 94},
    { name: 'Fält Rörlig 6x4/2', action: 'PATRON UR, PROPPA VAPEN', start: 95, stop: 99},
    { name: 'Fält Rörlig 6x4/2', action: 'VISITATION', start: 100, stop: 102},
    
    { name: 'Fält Rörlig 6x3/2', action: 'LADDA', start: 1, stop: 3},
    { name: 'Fält Rörlig 6x3/2', action: 'Fördröjning 30 sekunder', start: 4, stop: 33},
    { name: 'Fält Rörlig 6x3/2', action: 'ALLA KLARA?', start: 34, stop: 35},
    { name: 'Fält Rörlig 6x3/2', action: '10 SEKUNDER KVAR', start: 36, stop: 41},
    { name: 'Fält Rörlig 6x3/2', action: 'Fördröjning 7 sekunder', start: 42, stop: 48},
    { name: 'Fält Rörlig 6x3/2', action: 'FÄRDIGA', start: 49, stop: 49},
    { name: 'Fält Rörlig 6x3/2', action: 'Fördröjning 3 sekunder', start: 50, stop: 52},
    { name: 'Fält Rörlig 6x3/2', action: 'Tavla fram 3 sekunder', start: 53, stop: 55},
    { name: 'Fält Rörlig 6x3/2', action: 'Tavla bort 2 sekunder', start: 56, stop: 57},
    { name: 'Fält Rörlig 6x3/2', action: 'Tavla fram 3 sekunder', start: 58, stop: 60},
    { name: 'Fält Rörlig 6x3/2', action: 'Tavla bort 2 sekunder', start: 61, stop: 62},
    { name: 'Fält Rörlig 6x3/2', action: 'Tavla fram 3 sekunder', start: 63, stop: 65},
    { name: 'Fält Rörlig 6x3/2', action: 'Tavla bort 2 sekunder', start: 66, stop: 67},
    { name: 'Fält Rörlig 6x3/2', action: 'Tavla fram 3 sekunder', start: 68, stop: 70},
    { name: 'Fält Rörlig 6x3/2', action: 'Tavla bort 2 sekunder', start: 71, stop: 72},
    { name: 'Fält Rörlig 6x3/2', action: 'Tavla fram 3 sekunder', start: 73, stop: 75},
    { name: 'Fält Rörlig 6x3/2', action: 'Tavla bort 2 sekunder', start: 76, stop: 77},
    { name: 'Fält Rörlig 6x3/2', action: 'Tavla fram 3 sekunder', start: 78, stop: 80},
    { name: 'Fält Rörlig 6x3/2', action: 'Tavla bort', start: 81, stop: 82},
    { name: 'Fält Rörlig 6x3/2', action: 'ELD UPPHÖR', start: 83, stop: 88},
    { name: 'Fält Rörlig 6x3/2', action: 'PATRON UR, PROPPA VAPEN', start: 89, stop: 93},
    { name: 'Fält Rörlig 6x3/2', action: 'VISITATION', start: 94, stop: 96},
    
    { name: 'Fält Rörlig 6x2/2', action: 'LADDA', start: 1, stop: 3},
    { name: 'Fält Rörlig 6x2/2', action: 'Fördröjning 30 sekunder', start: 4, stop: 33},
    { name: 'Fält Rörlig 6x2/2', action: 'ALLA KLARA?', start: 34, stop: 35},
    { name: 'Fält Rörlig 6x2/2', action: '10 SEKUNDER KVAR', start: 36, stop: 41},
    { name: 'Fält Rörlig 6x2/2', action: 'Fördröjning 7 sekunder', start: 42, stop: 48},
    { name: 'Fält Rörlig 6x2/2', action: 'FÄRDIGA', start: 49, stop: 49},
    { name: 'Fält Rörlig 6x2/2', action: 'Fördröjning 3 sekunder', start: 50, stop: 52},
    { name: 'Fält Rörlig 6x2/2', action: 'Tavla fram 2 sekunder', start: 53, stop: 54},
    { name: 'Fält Rörlig 6x2/2', action: 'Tavla bort 2 sekunder', start: 55, stop: 56},
    { name: 'Fält Rörlig 6x2/2', action: 'Tavla fram 2 sekunder', start: 57, stop: 58},
    { name: 'Fält Rörlig 6x2/2', action: 'Tavla bort 2 sekunder', start: 59, stop: 60},
    { name: 'Fält Rörlig 6x2/2', action: 'Tavla fram 2 sekunder', start: 61, stop: 62},
    { name: 'Fält Rörlig 6x2/2', action: 'Tavla bort 2 sekunder', start: 63, stop: 64},
    { name: 'Fält Rörlig 6x2/2', action: 'Tavla fram 2 sekunder', start: 65, stop: 66},
    { name: 'Fält Rörlig 6x2/2', action: 'Tavla bort 2 sekunder', start: 67, stop: 68},
    { name: 'Fält Rörlig 6x2/2', action: 'Tavla fram 2 sekunder', start: 69, stop: 70},
    { name: 'Fält Rörlig 6x2/2', action: 'Tavla bort 2 sekunder', start: 71, stop: 72},
    { name: 'Fält Rörlig 6x2/2', action: 'Tavla fram 2 sekunder', start: 73, stop: 74},
    { name: 'Fält Rörlig 6x2/2', action: 'Tavla bort', start: 75, stop: 76},
    { name: 'Fält Rörlig 6x2/2', action: 'ELD UPPHÖR', start: 77, stop: 82},
    { name: 'Fält Rörlig 6x2/2', action: 'PATRON UR, PROPPA VAPEN', start: 83, stop: 87},
    { name: 'Fält Rörlig 6x2/2', action: 'VISITATION', start: 88, stop: 90},
    
    { name: 'Fält Rörlig 6x1/2', action: 'LADDA', start: 1, stop: 3},
    { name: 'Fält Rörlig 6x1/2', action: 'Fördröjning 30 sekunder', start: 4, stop: 33},
    { name: 'Fält Rörlig 6x1/2', action: 'ALLA KLARA?', start: 34, stop: 35},
    { name: 'Fält Rörlig 6x1/2', action: '10 SEKUNDER KVAR', start: 36, stop: 41},
    { name: 'Fält Rörlig 6x1/2', action: 'Fördröjning 7 sekunder', start: 42, stop: 48},
    { name: 'Fält Rörlig 6x1/2', action: 'FÄRDIGA', start: 49, stop: 49},
    { name: 'Fält Rörlig 6x1/2', action: 'Fördröjning 3 sekunder', start: 50, stop: 52},
    { name: 'Fält Rörlig 6x1/2', action: 'Tavla fram 1 sekunder', start: 53, stop: 53},
    { name: 'Fält Rörlig 6x1/2', action: 'Tavla bort 2 sekunder', start: 54, stop: 55},
    { name: 'Fält Rörlig 6x1/2', action: 'Tavla fram 1 sekunder', start: 56, stop: 56},
    { name: 'Fält Rörlig 6x1/2', action: 'Tavla bort 2 sekunder', start: 57, stop: 58},
    { name: 'Fält Rörlig 6x1/2', action: 'Tavla fram 1 sekunder', start: 59, stop: 59},
    { name: 'Fält Rörlig 6x1/2', action: 'Tavla bort 2 sekunder', start: 60, stop: 61},
    { name: 'Fält Rörlig 6x1/2', action: 'Tavla fram 1 sekunder', start: 62, stop: 62},
    { name: 'Fält Rörlig 6x1/2', action: 'Tavla bort 2 sekunder', start: 63, stop: 64},
    { name: 'Fält Rörlig 6x1/2', action: 'Tavla fram 1 sekunder', start: 65, stop: 65},
    { name: 'Fält Rörlig 6x1/2', action: 'Tavla bort 2 sekunder', start: 66, stop: 67},
    { name: 'Fält Rörlig 6x1/2', action: 'Tavla fram 1 sekunder', start: 68, stop: 68},
    { name: 'Fält Rörlig 6x1/2', action: 'Tavla bort', start: 69, stop: 70},
    { name: 'Fält Rörlig 6x1/2', action: 'ELD UPPHÖR', start: 71, stop: 76},
    { name: 'Fält Rörlig 6x1/2', action: 'PATRON UR, PROPPA VAPEN', start: 77, stop: 81},
    { name: 'Fält Rörlig 6x1/2', action: 'VISITATION', start: 82, stop: 84},
    
    { name: 'Fält Rörlig 6x1/1', action: 'LADDA', start: 1, stop: 3},
    { name: 'Fält Rörlig 6x1/1', action: 'Fördröjning 30 sekunder', start: 4, stop: 33},
    { name: 'Fält Rörlig 6x1/1', action: 'ALLA KLARA?', start: 34, stop: 35},
    { name: 'Fält Rörlig 6x1/1', action: '10 SEKUNDER KVAR', start: 36, stop: 41},
    { name: 'Fält Rörlig 6x1/1', action: 'Fördröjning 7 sekunder', start: 42, stop: 48},
    { name: 'Fält Rörlig 6x1/1', action: 'FÄRDIGA', start: 49, stop: 49},
    { name: 'Fält Rörlig 6x1/1', action: 'Fördröjning 3 sekunder', start: 50, stop: 52},
    { name: 'Fält Rörlig 6x1/1', action: 'Tavla fram 1 sekunder', start: 53, stop: 53},
    { name: 'Fält Rörlig 6x1/1', action: 'Tavla bort 1 sekunder', start: 54, stop: 54},
    { name: 'Fält Rörlig 6x1/1', action: 'Tavla fram 1 sekunder', start: 55, stop: 55},
    { name: 'Fält Rörlig 6x1/1', action: 'Tavla bort 1 sekunder', start: 56, stop: 56},
    { name: 'Fält Rörlig 6x1/1', action: 'Tavla fram 1 sekunder', start: 57, stop: 57},
    { name: 'Fält Rörlig 6x1/1', action: 'Tavla bort 1 sekunder', start: 58, stop: 58},
    { name: 'Fält Rörlig 6x1/1', action: 'Tavla fram 1 sekunder', start: 59, stop: 59},
    { name: 'Fält Rörlig 6x1/1', action: 'Tavla bort 1 sekunder', start: 60, stop: 60},
    { name: 'Fält Rörlig 6x1/1', action: 'Tavla fram 1 sekunder', start: 61, stop: 61},
    { name: 'Fält Rörlig 6x1/1', action: 'Tavla bort 1 sekunder', start: 62, stop: 62},
    { name: 'Fält Rörlig 6x1/1', action: 'Tavla fram 1 sekunder', start: 63, stop: 63},
    { name: 'Fält Rörlig 6x1/1', action: 'Tavla bort', start: 64, stop: 65},
    { name: 'Fält Rörlig 6x1/1', action: 'ELD UPPHÖR', start: 66, stop: 71},
    { name: 'Fält Rörlig 6x1/1', action: 'PATRON UR, PROPPA VAPEN', start: 72, stop: 76},
    { name: 'Fält Rörlig 6x1/1', action: 'VISITATION', start: 77, stop: 79},
    
    //FÄLT FASTA MÅL
    { name: 'Fält Fast - 16 sek', action: 'LADDA', start: 1, stop: 3},
    { name: 'Fält Fast - 16 sek', action: 'Fördröjning 30 sekunder', start: 4, stop: 33},
    { name: 'Fält Fast - 16 sek', action: 'ALLA KLARA?', start: 34, stop: 35},
    { name: 'Fält Fast - 16 sek', action: '10 SEKUNDER KVAR', start: 36, stop: 41},
    { name: 'Fält Fast - 16 sek', action: 'Fördröjning 7 sekunder', start: 42, stop: 48},
    { name: 'Fält Fast - 16 sek', action: 'FÄRDIGA (3 sekunder innan ELD)', start: 49, stop: 49},
    { name: 'Fält Fast - 16 sek', action: 'Fördröjning 3 sekunder', start: 50, stop: 52},
    { name: 'Fält Fast - 16 sek', action: 'ELD', start: 53, stop: 53},
    { name: 'Fält Fast - 16 sek', action: 'Fördröjning 13 sekunder', start: 54, stop: 66},
    { name: 'Fält Fast - 16 sek', action: 'ELD UPPHÖR (Utdraget under 3 sek)', start: 67, stop: 70},
    { name: 'Fält Fast - 16 sek', action: 'PATRON UR, PROPPA VAPEN', start: 71, stop: 75},
    { name: 'Fält Fast - 16 sek', action: 'VISITATION', start: 76, stop: 78},
    
    { name: 'Fält Fast - 14 sek', action: 'LADDA', start: 1, stop: 3},
    { name: 'Fält Fast - 14 sek', action: 'Fördröjning 30 sekunder', start: 4, stop: 33},
    { name: 'Fält Fast - 14 sek', action: 'ALLA KLARA?', start: 34, stop: 35},
    { name: 'Fält Fast - 14 sek', action: '10 SEKUNDER KVAR', start: 36, stop: 41},
    { name: 'Fält Fast - 14 sek', action: 'Fördröjning 7 sekunder', start: 42, stop: 48},
    { name: 'Fält Fast - 14 sek', action: 'FÄRDIGA (3 sekunder innan ELD)', start: 49, stop: 49},
    { name: 'Fält Fast - 14 sek', action: 'Fördröjning 3 sekunder', start: 50, stop: 52},
    { name: 'Fält Fast - 14 sek', action: 'ELD', start: 53, stop: 53},
    { name: 'Fält Fast - 14 sek', action: 'Fördröjning 11 sekunder', start: 54, stop: 64},
    { name: 'Fält Fast - 14 sek', action: 'ELD UPPHÖR (Utdraget under 3 sek)', start: 65, stop: 68},
    { name: 'Fält Fast - 14 sek', action: 'PATRON UR, PROPPA VAPEN', start: 69, stop: 73},
    { name: 'Fält Fast - 14 sek', action: 'VISITATION', start: 74, stop: 76},
    
    { name: 'Fält Fast - 12 sek', action: 'LADDA', start: 1, stop: 3},
    { name: 'Fält Fast - 12 sek', action: 'Fördröjning 30 sekunder', start: 4, stop: 33},
    { name: 'Fält Fast - 12 sek', action: 'ALLA KLARA?', start: 34, stop: 35},
    { name: 'Fält Fast - 12 sek', action: '10 SEKUNDER KVAR', start: 36, stop: 41},
    { name: 'Fält Fast - 12 sek', action: 'Fördröjning 7 sekunder', start: 42, stop: 48},
    { name: 'Fält Fast - 12 sek', action: 'FÄRDIGA (3 sekunder innan ELD)', start: 49, stop: 49},
    { name: 'Fält Fast - 12 sek', action: 'Fördröjning 3 sekunder', start: 50, stop: 52},
    { name: 'Fält Fast - 12 sek', action: 'ELD', start: 53, stop: 53},
    { name: 'Fält Fast - 12 sek', action: 'Fördröjning 9 sekunder', start: 54, stop: 62},
    { name: 'Fält Fast - 12 sek', action: 'ELD UPPHÖR (Utdraget under 3 sek)', start: 63, stop: 66},
    { name: 'Fält Fast - 12 sek', action: 'PATRON UR, PROPPA VAPEN', start: 67, stop: 71},
    { name: 'Fält Fast - 12 sek', action: 'VISITATION', start: 72, stop: 74},
    
    { name: 'Fält Fast - 10 sek', action: 'LADDA', start: 1, stop: 3},
    { name: 'Fält Fast - 10 sek', action: 'Fördröjning 30 sekunder', start: 4, stop: 33},
    { name: 'Fält Fast - 10 sek', action: 'ALLA KLARA?', start: 34, stop: 35},
    { name: 'Fält Fast - 10 sek', action: '10 SEKUNDER KVAR', start: 36, stop: 41},
    { name: 'Fält Fast - 10 sek', action: 'Fördröjning 7 sekunder', start: 42, stop: 48},
    { name: 'Fält Fast - 10 sek', action: 'FÄRDIGA (3 sekunder innan ELD)', start: 49, stop: 49},
    { name: 'Fält Fast - 10 sek', action: 'Fördröjning 3 sekunder', start: 50, stop: 52},
    { name: 'Fält Fast - 10 sek', action: 'ELD', start: 53, stop: 53},
    { name: 'Fält Fast - 10 sek', action: 'Fördröjning 7 sekunder', start: 54, stop: 60},
    { name: 'Fält Fast - 10 sek', action: 'ELD UPPHÖR (Utdraget under 3 sek)', start: 61, stop: 64},
    { name: 'Fält Fast - 10 sek', action: 'PATRON UR, PROPPA VAPEN', start: 65, stop: 69},
    { name: 'Fält Fast - 10 sek', action: 'VISITATION', start: 70, stop: 72},
    
    { name: 'Fält Fast - 8 sek', action: 'LADDA', start: 1, stop: 3},
    { name: 'Fält Fast - 8 sek', action: 'Fördröjning 30 sekunder', start: 4, stop: 33},
    { name: 'Fält Fast - 8 sek', action: 'ALLA KLARA?', start: 34, stop: 35},
    { name: 'Fält Fast - 8 sek', action: '10 SEKUNDER KVAR', start: 36, stop: 41},
    { name: 'Fält Fast - 8 sek', action: 'Fördröjning 7 sekunder', start: 42, stop: 48},
    { name: 'Fält Fast - 8 sek', action: 'FÄRDIGA (3 sekunder innan ELD', start: 49, stop: 49},
    { name: 'Fält Fast - 8 sek', action: 'Fördröjning 3 sekunder', start: 50, stop: 52},
    { name: 'Fält Fast - 8 sek', action: 'ELD', start: 53, stop: 53},
    { name: 'Fält Fast - 8 sek', action: 'Fördröjning 5 sekunder', start: 54, stop: 58},
    { name: 'Fält Fast - 8 sek', action: 'ELD UPPHÖR (Utdraget under 3 sek)', start: 59, stop: 62},
    { name: 'Fält Fast - 8 sek', action: 'PATRON UR, PROPPA VAPEN', start: 63, stop: 67},
    { name: 'Fält Fast - 8 sek', action: 'VISITATION', start: 68, stop: 70},
    
    { name: 'Fält Fast - 6 sek', action: 'LADDA', start: 1, stop: 3},
    { name: 'Fält Fast - 6 sek', action: 'Fördröjning 30 sekunder', start: 4, stop: 33},
    { name: 'Fält Fast - 6 sek', action: 'ALLA KLARA?', start: 34, stop: 35},
    { name: 'Fält Fast - 6 sek', action: '10 SEKUNDER KVAR', start: 36, stop: 41},
    { name: 'Fält Fast - 6 sek', action: 'Fördröjning 7 sekunder', start: 42, stop: 48},
    { name: 'Fält Fast - 6 sek', action: 'FÄRDIGA (3 sekunder innan ELD)', start: 49, stop: 49},
    { name: 'Fält Fast - 6 sek', action: 'Fördröjning 3 sekunder', start: 50, stop: 52},
    { name: 'Fält Fast - 6 sek', action: 'ELD', start: 53, stop: 53},
    { name: 'Fält Fast - 6 sek', action: 'Fördröjning 3 sekunder', start: 54, stop: 56},
    { name: 'Fält Fast - 6 sek', action: 'ELD UPPHÖR (Utdraget under 3 sek)', start: 57, stop: 60},
    { name: 'Fält Fast - 6 sek', action: 'PATRON UR, PROPPA VAPEN', start: 61, stop: 65},
    { name: 'Fält Fast - 6 sek', action: 'VISITATION', start: 66, stop: 68},
    
];

const programsId = [
    
    //PRECISION SERIE PROVSERIE OCH 1-5
    { name: 'Precision Förberedelsetid', id: 0},
    { name: 'Precision Provserie', id: 1},
    { name: 'Precision Serie 1', id: 2},
    { name: 'Precision Serie 2', id: 3},
    { name: 'Precision Serie 3', id: 4},
    { name: 'Precision Serie 4', id: 5},
    { name: 'Precision Serie 5', id: 6},
    { name: 'Precision Serie 6', id: 7},
    { name: 'Precision Serie 7', id: 8},
    { name: 'Precision Serie 8', id: 9},
    { name: 'Precision Serie 9', id: 10},
    { name: 'Precision Serie 10', id: 11},
    
    //MILITÄR SNABBMATCH
    { name: 'Militär Snabbmatch Förberedelsetid', id: 19},
    { name: 'Militär Snabbmatch Provserie', id: 20},
    { name: 'Militär Snabbmatch - Serie 1 - 10 sek', id: 21},
    { name: 'Militär Snabbmatch - Serie 2 - 10 sek', id: 22},
    { name: 'Militär Snabbmatch - Serie 3 - 10 sek', id: 23},
    { name: 'Militär Snabbmatch - Serie 4 - 10 sek', id: 24},
    { name: 'Militär Snabbmatch - Serie 1 - 8 sek', id: 25},
    { name: 'Militär Snabbmatch - Serie 2 - 8 sek', id: 26},
    { name: 'Militär Snabbmatch - Serie 3 - 8 sek', id: 27},
    { name: 'Militär Snabbmatch - Serie 4 - 8 sek', id: 28},
    { name: 'Militär Snabbmatch - Serie 1 - 6 sek', id: 29},
    { name: 'Militär Snabbmatch - Serie 2 - 6 sek', id: 30},
    { name: 'Militär Snabbmatch - Serie 3 - 6 sek', id: 31},
    { name: 'Militär Snabbmatch - Serie 4 - 6 sek', id: 32},
    { name: 'Militär Snabbmatch - Särskjutning Provserie - 10 sek', id: 33},
    { name: 'Militär Snabbmatch - Särskjutning - 6 sek', id: 34},
    { name: 'Militär Snabbmatch - Kompletteringserie - 10 sek', id: 35},
    { name: 'Militär Snabbmatch - Kompletteringserie - 8 sek', id: 36},
    { name: 'Militär Snabbmatch - Kompletteringserie - 6 sek', id: 37},
    { name: 'Militär Snabbmatch - Träningsserie - 10 sek', id: 110},
    { name: 'Militär Snabbmatch - Träningsserie - 8 sek', id: 111},
    { name: 'Militär Snabbmatch - Träningsserie - 6 sek', id: 112},
    
    //SNABBPISTOL
    //{ name: 'Snabbpistol Förberedelsetid', id: 40},
    //{ name: 'Snabbpistol Provserie', id: 41},
    { name: 'Snabbpistol Förberedelsetid + Provserie', id: 40},  
    { name: 'Snabbpistol - Serie 1 - 8 sek', id: 42},
    { name: 'Snabbpistol - Serie 2 - 8 sek', id: 43},
    { name: 'Snabbpistol - Serie 1 - 6 sek', id: 44},
    { name: 'Snabbpistol - Serie 2 - 6 sek', id: 45},
    { name: 'Snabbpistol - Serie 1 - 4 sek', id: 46},
    { name: 'Snabbpistol - Serie 2 - 4 sek', id: 47},
    
    //SPORT/GROVPISTOL PRECISION
    { name: 'Sport/Grovpistol Förberedelsetid + Provserie', id: 51},
    { name: 'Sport/Grovpistol Serie 1', id: 52},
    { name: 'Sport/Grovpistol Serie 2', id: 53},
    { name: 'Sport/Grovpistol Serie 3', id: 54},
    { name: 'Sport/Grovpistol Serie 4', id: 55},
    { name: 'Sport/Grovpistol Serie 5', id: 56},
    { name: 'Sport/Grovpistol Serie 6', id: 57},
    
    //SPORT/GROVPISTOL SNABBSKJUTNING
    { name: 'Sport/Grovpistol Snabb Förberedelsetid + Provserie', id: 60},
    { name: 'Sport/Grovpistol Snabb Serie 1', id: 61},
    { name: 'Sport/Grovpistol Snabb Serie 2', id: 62},
    { name: 'Sport/Grovpistol Snabb Serie 3', id: 63},
    { name: 'Sport/Grovpistol Snabb Serie 4', id: 64},
    { name: 'Sport/Grovpistol Snabb Serie 5', id: 65},
    { name: 'Sport/Grovpistol Snabb Serie 6', id: 66},
    { name: 'Sport/Grovpistol Snabb Kompletteringsserie', id: 67},
    
    //STANDARDPISTOL
    { name: 'Standardpistol Förberedelsetid + Provserie', id: 70},
    //{ name: 'Standardpistol Provserie', id: 71},
    { name: 'Standardpistol 150 sek', id: 72},
    { name: 'Standardpistol 20 sek', id: 73},
    { name: 'Standardpistol 10 sek', id: 74},
    
    //FÄLT RÖRLIGA MÅL
    { name: 'Fält Rörlig - 16 sek', id: 80},
    { name: 'Fält Rörlig - 14 sek', id: 81},
    { name: 'Fält Rörlig - 12 sek', id: 82},
    { name: 'Fält Rörlig - 10 sek', id: 83},
    { name: 'Fält Rörlig - 8 sek', id: 84},
    { name: 'Fält Rörlig - 6 sek', id: 85},
    
    { name: 'Fält Rörlig 2x8/8', id: 86},
    { name: 'Fält Rörlig 2x6/6', id: 87},
    { name: 'Fält Rörlig 2x5/5', id: 88},
    { name: 'Fält Rörlig 2x4/4', id: 89},
    { name: 'Fält Rörlig 2x3/3', id: 90},
    { name: 'Fält Rörlig 3x6/4', id: 91},
    { name: 'Fält Rörlig 3x4/4', id: 92},
    { name: 'Fält Rörlig 3x3/3', id: 93},
    { name: 'Fält Rörlig 3x3/2', id: 94},
    { name: 'Fält Rörlig 3x2/2', id: 95},
    { name: 'Fält Rörlig 6x4/2', id: 96},
    { name: 'Fält Rörlig 6x3/2', id: 97},
    { name: 'Fält Rörlig 6x2/2', id: 98},
    { name: 'Fält Rörlig 6x1/2', id: 99},
    { name: 'Fält Rörlig 6x1/1', id: 100},
    
    //FÄLT FASTA MÅL
    { name: 'Fält Fast - 16 sek', id: 101},
    { name: 'Fält Fast - 14 sek', id: 102},
    { name: 'Fält Fast - 12 sek', id: 103},
    { name: 'Fält Fast - 10 sek', id: 104},
    { name: 'Fält Fast - 8 sek', id: 105},
    { name: 'Fält Fast - 6 sek', id: 106},

    
];






