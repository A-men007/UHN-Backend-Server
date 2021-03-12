const getFromUrl = async (url) => {
  let response = await fetch(url);
  if (response.ok) {
    return await response.json();
  } else {
    return null;
  }
};

const createTable = {
  users: (data) => {
    let table = document.createElement('table');
    table.classList.add('metrics-table');

    let headerRow = document.createElement('tr');
    headerRow.innerHTML = `
      <th>User Name</th>
      <th>User ID</th>
      <th>Phone #</th>
      <th>Note</th>
      <th>Last Seen</th>
      <th>Naloxone?</th>`;
    table.appendChild(headerRow);
    
    data.forEach(user => {
      console.log(user)
      let lastSeen = new Date(parseInt(user.lastSeen));
      let userRow = document.createElement('tr')
      userRow.innerHTML = `
      <td>${user.username}</td>
      <td>${user._id}</td>
      <td>${user.phone}</td>
      <td>${user.note}</td>
      <td>${user.lastSeen == null ? "" : lastSeen.toLocaleDateString() + " " + lastSeen.toLocaleTimeString()}</td>
      <td>${user.naloxoneAvailability}</td>`
      table.appendChild(userRow)
    });
    return table
  },
  alarms: (data) => {
    let table = document.createElement('table');
    table.classList.add('metrics-table');

    let headerRow = document.createElement('tr');
    headerRow.innerHTML = `
      <th>User Id</th>
      <th>Alarm Start</th>
      <th>Alarm End</th>
      <th>Alarm Sent?</th>`;
    table.appendChild(headerRow);
    
    data.forEach(alarm => {
      let start = new Date(alarm.alarmstart);
      let end = new Date(alarm.alarmend);

      let alarmRow = document.createElement('tr')

      alarmRow.innerHTML = `
      <td>${alarm.userid}</td>
      <td>${alarm.alarmstart == null ? "" : start.toLocaleDateString() + " " + start.toLocaleTimeString()}</td>
      <td>${alarm.alarmend == null ? "" : end.toLocaleDateString() + " " + end.toLocaleTimeString()}</td>
      <td>${alarm.alarmsent}</td>`
      table.appendChild(alarmRow)
    });
    return table

  },
  timers: (data) => {
    let table = document.createElement('table');
    table.classList.add('metrics-table');

    let headerRow = document.createElement('tr');
    headerRow.innerHTML = `
      <th></th>
      <th></th>
      <th></th>`;
    table.appendChild(headerRow);
    
    data.forEach(user => {
      let lastSeen = new Date(parseInt(user.lastSeen));

      let userRow = document.createElement('tr')

      userRow.innerHTML = `
      <td>${"Hi"}</td>
      <td>${"??"}</td>
      <td>${"Ok"}</td>`
      table.appendChild(userRow)
    });
    return table

  },
  arrivals: (data) => {
    let table = document.createElement('table');
    table.classList.add('metrics-table');

    let headerRow = document.createElement('tr');
    headerRow.innerHTML = `
      <th></th>
      <th></th>
      <th></th>`;
    table.appendChild(headerRow);
    
    data.forEach(user => {
      let lastSeen = new Date(parseInt(user.lastSeen));

      let userRow = document.createElement('tr')

      userRow.innerHTML = `
      <td>${"Hi"}</td>
      <td>${"??"}</td>
      <td>${"Ok"}</td>`
      table.appendChild(userRow)
    });
    return table

  },
  responses: (data) => {
    let table = document.createElement('table');
    table.classList.add('metrics-table');

    let headerRow = document.createElement('tr');
    headerRow.innerHTML = `
      <th>Response ID</th>
      <th>Responder ID (User)</th>
      <th>Alarm ID</th>
      <th>Alert Response?</th>
      <th>Response Time</th>`;
    table.appendChild(headerRow);
    
    data.forEach(response => {
      let responseTime = new Date(response.responsetime);

      let responseRow = document.createElement('tr')

      responseRow.innerHTML = `
      <td>${response.id}</td>
      <td>${response.responderid}</td>
      <td>${response.alarmid}</td>
      <td>${response.alertresponse}</td>
      <td>${response.alertresponse ? responseTime.toLocaleDateString() + " " + responseTime.toLocaleTimeString() : ""}</td>`
      table.appendChild(responseRow)
    });
    return table

  }
}

const openTab = async (evt, tableName) => {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(tableName).style.display = "block";
  evt.currentTarget.className += " active";

  let tabData = await getFromUrl(url+tableName);

  let table = createTable[tableName](tabData);

  console.log(document.getElementById(tableName).firstChild)
  if(document.getElementById(tableName).firstChild == null) {
    document.getElementById(tableName).appendChild(table)
  } else {
    document.getElementById(tableName).replaceChild(table, document.getElementById(tableName).firstChild);
  }
}


const url = "http://ec2-3-96-125-87.ca-central-1.compute.amazonaws.com/metrics/";
// const url = "http://localhost:3000/metrics/";


window.addEventListener("load", async () => {

});