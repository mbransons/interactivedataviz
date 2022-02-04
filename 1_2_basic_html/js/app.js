let tBody = document.querySelector('tbody');
let rank = 1;
async function getGames() {
  await axios
    .get('data/board-games-top-ten.json')
    .then((res) => res.data)
    .then((data) => {
      data.forEach((game) => {
        tBody.appendChild(buildRow(game));
        rank += 1;
      });
    });
}

function buildRow(data) {
  let row = document.createElement('tr');
  row.innerHTML = `<td>${rank}</td>
    <td class="image-box"><img src=${data.ImagePath} alt="" srcset=""></td>
    <td class="line-clamp">${data.Name}</td>
    <td>${data.YearPublished}</td>
    <td class="line-clamp">${data.Description}</td>
    <td>${data.MinPlayers}/${data.MaxPlayers}</td>`;
  return row;
}

getGames();
