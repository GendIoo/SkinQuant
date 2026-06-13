require("dotenv").config();

const express = require("express");
const axios = require("axios");

const app = express();

let cachedSkins = [];
let lastUpdate = 0;

// const skins = require("./skins.json");

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

app.get("/", async (req, res) => {

 if (
  cachedSkins.length === 0 ||
  Date.now() - lastUpdate > 5 * 60 * 1000
) {
  const response = await axios.get(
    "https://api.skinport.com/v1/items",
    {
      params: {
        app_id: 730,
        currency: "EUR"
      },
      auth: {
        username: CLIENT_ID,
        password: CLIENT_SECRET
      }
    }
  );

  cachedSkins = response.data;
  lastUpdate = Date.now();

  console.log("Skiny odświeżone");
}

const skins = cachedSkins.slice(0, 25000);


    let profitable = 0;

    let sortedSkins = skins.map(skin => {

        const buyPrice = skin.min_price || 0;
const steamNet = (skin.suggested_price || 0) * 0.85;
const profit = steamNet - buyPrice;

        let status = "🔴 NIE";
        let color = "#4a1f1f";

        if (profit > 20) {
            status = "🟢 KUP";
            color = "#1f4a2a";
            profitable++;
        } else if (profit > 0) {
            status = "🟡 OK";
            color = "#4a431f";
            profitable++;
        }

        return {
            ...skin,
            steamNet,
            profit,
            status,
            color
        };
    });

    sortedSkins.sort((a, b) => b.profit - a.profit);

    let rows = "";

    sortedSkins.forEach(skin => {

        rows += `
        <tr style="background:${skin.color}">
            <td>${skin.market_hash_name}</td>
<td>${(skin.min_price || 0).toFixed(2)} €</td>
            <td>${skin.steamNet.toFixed(2)} zł</td>
            <td>${skin.profit.toFixed(2)} zł</td>
            <td>${skin.status}</td>
        </tr>
        `;
    });

    res.send(`
<!DOCTYPE html>
<html>

<head>
<meta charset="UTF-8">
<title>SkinQuant v6</title>

<style>

body{
    background:#121212;
    color:white;
    font-family:Arial;
    margin:0;
}

.container{
    max-width:1000px;
    margin:auto;
    padding:30px;
}

.logo{
    font-size:40px;
    font-weight:bold;
}

.version{
    color:#00ff88;
}

.stats{
    display:flex;
    gap:20px;
    margin:20px 0;
}

.card{
    background:#1e1e1e;
    padding:15px;
    border-radius:10px;
}

input{
    width:300px;
    padding:10px;
    border-radius:8px;
    border:none;
    margin-bottom:20px;
}

table{
    width:100%;
    border-collapse:collapse;
}

th{
    background:#222;
}

th,td{
    padding:12px;
    border:1px solid #333;
}

tr:hover{
    filter:brightness(1.1);
}

</style>
</head>

<body>

<div class="container">

<div class="logo">
🚀 SkinQuant <span class="version">v6</span>
</div>

<div class="stats">

<div class="card">
📦 Skinów: ${skins.length}
</div>

<div class="card">
💰 Okazji: ${profitable}
</div>

</div>

<select id="profitFilter" onchange="filterTable()">
    <option value="0">Wszystkie</option>
    <option value="5">>$5</option>
    <option value="10">>$10</option>
    <option value="20">>$20</option>
    <option value="50">>$50</option>
    <option value="100">>$100</option>
</select>

<input
id="search"
type="text"
placeholder="Szukaj skina..."
onkeyup="filterTable()"
/>
<br><br>

<br><br>

<table id="skinsTable">

<tr>
<th>Skin</th>
<th>Kupno</th>
<th>Steam</th>
<th>Zysk</th>
<th>Status</th>
</tr>

${rows}

</table>

</div>

<script>

function filterTable(){

let filter =
document.getElementById("search")
.value
.toLowerCase();

let minProfit = parseFloat(
document.getElementById("profitFilter").value
);

let tr =
document.getElementById("skinsTable")
.getElementsByTagName("tr");

for(let i=1;i<tr.length;i++){

let td =
tr[i].getElementsByTagName("td")[0];

let profitTd =
tr[i].getElementsByTagName("td")[3];

if(td){

let txt =
td.textContent || td.innerText;

let profit = 0;

if (profitTd) {
profit = parseFloat(
profitTd.textContent.replace("€","").trim()
);
}

if(
txt.toLowerCase().indexOf(filter) > -1 &&
profit >= minProfit
){
tr[i].style.display="";
}
else{
tr[i].style.display="none";
}

}

}

}

</script>

</body>
</html>
`);
});

async function testSkinport() {
    try {
        const response = await axios.get(
            "https://api.skinport.com/v1/items",
            {
                params: {
                    app_id: 730,
                    currency: "EUR"
                },
                auth: {
                    username: CLIENT_ID,
                    password: CLIENT_SECRET
                }
            }
        );

        console.log("Pobrano itemów:", response.data.length);
console.log(response.data[0]);

    } catch (err) {

        console.log("Błąd API:");
        console.log(err.response?.data || err.message);

    }
}

app.listen(3000, () => {
    console.log("🚀 SkinQuant v7 działa");
    console.log("CLIENT_ID:", CLIENT_ID ? "OK" : "BRAK");
    console.log("CLIENT_SECRET:", CLIENT_SECRET ? "OK" : "BRAK");
});

testSkinport();