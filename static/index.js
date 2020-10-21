const getFromUrl = async (url) => {
  let response = await fetch(url);
  if (response.ok) {
    return await response.json();
  } else {
    return null;
  }
};

window.addEventListener("load", async () => {
  const table = document.querySelector("#metrics-table");
  //let url = "http://localhost:3000/metrics/stats";
  let url = "http://ec2-3-96-125-87.ca-central-1.compute.amazonaws.com/metrics/stats";
  let data = await getFromUrl(url);

  data.forEach(user => {
      let lastSeen = new Date(parseInt(user.lastSeen));
      let userRow = document.createElement('tr')
      userRow.innerHTML = `
      <td>${user.username}</td>
      <td>${user.lastSeen == null ? "" : lastSeen.toLocaleDateString() + " " + lastSeen.toLocaleTimeString()}</td>
      <td>${user.naloxoneAvailability}</td>`
      table.appendChild(userRow)
  });
});