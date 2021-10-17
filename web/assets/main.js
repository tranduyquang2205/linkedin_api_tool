function csvToArray(str, delimiter = ",") {

    // slice from start of text to the first \n index
    // use split to create an array from string by delimiter
    const headers = str.slice(0, str.indexOf("\r\n")).split(delimiter);

    // slice from \n index + 1 to the end of the text
    // use split to create an array of each csv value row
    const rows = str.slice(str.indexOf("\n") + 1).split("\r\n");

    // Map the rows
    // split values from each row into an array
    // use headers.reduce to create an object
    // object properties derived from headers:values
    // the object passed as an element of the array
    rows.pop()
    const arr = rows.map(function (row) {
    if(row!=""){
      const values = row.split(delimiter);
      const el = headers.reduce(function (object, header, index) {
        object[parseInt(index)] = values[index];
        return object;
      }, []);
      return el;
    }
    });
    
    arr.unshift(headers);
    return arr;
  }
async function gen_row(user,pass){
    await eel.get_messages(user,pass)().then(async function(result) {
        document.getElementById("table_account").innerHTML += '<tr><td> <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-folder icon-dual"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg> <span class="ms-2 fw-semibold"><a href="javascript: void(0);" class="text-reset">'+user+'</a></span></td><td><p class="mb-0">'+pass+'</p></td><td>'+result+'</td></tr>'
    })

}
async function get_account(){
    await eel.get_account()().then(async function(result) {
        list_account = (result)
        for(let item of list_account){
            await gen_row(item.split(',')[0],item.split(',')[1])
        }
        document.getElementById("loading_row").innerHTML = "";
     })
   

}
function get_update_info(){
	
    document.getElementById("account_list").style.display = "none";  
	document.getElementById("update_info").style.display = "block"; 
    document.getElementById("auto_connect").style.display = "none";  
    document.getElementById("connection_filter").style.display = "none"; 
    
	
}
function get_account_list(){
	document.getElementById("update_info").style.display = "none";  
    document.getElementById("account_list").style.display = "block";  
	document.getElementById("auto_connect").style.display = "none"; 
    document.getElementById("connection_filter").style.display = "none"; 
    document.getElementById("send_message").style.display = "none";
	
}
function get_auto_connect(){
	document.getElementById("update_info").style.display = "none";  
    document.getElementById("account_list").style.display = "none";  
	document.getElementById("auto_connect").style.display = "block"; 
    document.getElementById("connection_filter").style.display = "none"; 
    document.getElementById("send_message").style.display = "none";
	
}
function get_connection_filter(){
	document.getElementById("update_info").style.display = "none";  
    document.getElementById("account_list").style.display = "none";  
	document.getElementById("auto_connect").style.display = "none"; 
    document.getElementById("connection_filter").style.display = "block"; 
    document.getElementById("send_message").style.display = "none";
	
}
function get_send_message(){
	document.getElementById("update_info").style.display = "none";  
    document.getElementById("account_list").style.display = "none";  
	document.getElementById("auto_connect").style.display = "none"; 
    document.getElementById("connection_filter").style.display = "none"; 
    document.getElementById("send_message").style.display = "block"; 
	
}
document.getElementById("sendContent").defaultValue = "Hi [[Full Name]],\n\nI'm [[full_name]] - [[work_info]]\nI'll contact with you through your Whatsapp's number [[Phone Number]].\n\nRegard,\n[[full_name]]"

get_account()
async function update_info(){
    document.getElementById('submit_button').innerHTML = '<i class="mdi mdi-reload fa-spin"></i> Đang đồng bộ...'
    first_name = document.getElementById('inputFName').value
    last_name = document.getElementById('inputLName').value
    info = document.getElementById('inputInfo').value
    state = document.getElementById('inputAddress').value

    await eel.update_info(first_name,last_name,info,state)().then(function(result) {
        toastr.success('Đồng bộ thành công', '', {timeOut: 5000})
        document.getElementById('submit_button').innerHTML = 'Đồng bộ'

     })
}
async function auto_connect(){
    document.getElementById('connect_button').innerHTML = '<i class="mdi mdi-reload fa-spin"></i> Searching and Connecting...'
    keywords = document.getElementById('inputKeywords').value
    limit = document.getElementById('inputLimit').value
    message = document.getElementById('inputMessage').value

    await eel.auto_connect(keywords,limit,message)().then(function(result) {
        toastr.success('Thành công', '', {timeOut: 5000})
        document.getElementById('connect_button').innerHTML = 'Connect'

     })
}
async function connection_filter(){
    document.getElementById('filter_button').innerHTML = '<i class="mdi mdi-reload fa-spin"></i> Filtering...'
    keywords = document.getElementById('filterKeywords').value
    username = document.getElementById('filterUser').value
    password = document.getElementById('filterPass').value

    await eel.connection_filter(0,username,password,keywords)().then(function(result) {
        toastr.success('Thành công', '', {timeOut: 5000})
        document.getElementById('process_bar').innerHTML = '<div class="progress-bar" role="progressbar" style="width: 100%;" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">100%</div>'

        document.getElementById('filter_button').innerHTML = 'Filter'

     })
}
async function send_message(){
    document.getElementById('send_button').innerHTML = '<i class="mdi mdi-reload fa-spin"></i> Sending...'
    sendFile = document.getElementById('sendFile')
    sendContent = document.getElementById('sendContent').value
    sendDelete = document.getElementById('sendDelete').value
    username = document.getElementById('sendUser').value
    password = document.getElementById('sendPass').value

    if (sendFile.files.length == 0) {
          toastr.error('Vui lòng chọn file trước', '', {timeOut: 2000})
          return;
        }
    if (sendFile.files[0].name.toLowerCase().lastIndexOf(".csv") == -1) {
      toastr.error('Vui lòng chọn file đúng định dạng .csv', '', {timeOut: 2000})
      return;
    }
    const reader = new FileReader();

    reader.onload = async function (e) {
      const text = e.target.result;
      const data = csvToArray(text);
      await eel.send_message(data,username,password,sendContent,sendDelete)().then(function(result) {
        toastr.success('Thành công', '', {timeOut: 5000})
        document.getElementById('send_button').innerHTML = 'Send'

     })
    };
    
    reader.readAsText(sendFile.files[0]);
}
eel.expose(update_process_bar);
function update_process_bar(percent) {
    floor = Math.floor(percent*100)
    document.getElementById('process_bar').innerHTML = '<div class="progress-bar" role="progressbar" style="width: '+floor+'%;" aria-valuenow="'+floor+'" aria-valuemin="0" aria-valuemax="100">'+percent*100+'%</div>'
}
