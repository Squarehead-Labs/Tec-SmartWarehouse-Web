function setSectionHTML(selector, html) {
  console.log("Setting HTML for selector:", selector);
  let frame = document.getElementsByTagName("iframe")[0];
  frame.contentWindow.postMessage(
    { type: "SET_HTML", selector, html },
    "https://smartwh.sqhlabs.com"
  );
}

async function fetchWeatherData() {
    const response = await fetch('/data/weather.csv')
    const data = await response.text();
    console.table(csvToJson(data));
}

function csvToJson(csvString) {
    const rows = csvString.split("\n");
    const headers = rows[0].split(",");
    const jsonData = [];

    for (let i = 1; i < rows.length; i++) {
    const values = rows[i].split(",");
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = values[j];
    }
    jsonData.push(obj);
    }

    return jsonData
}

function loadData() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const dataFile = urlParams.get('q') || 'default';

    fetch(`/data/${dataFile}`)
        .then(response => response.text())
        .then(data => {
            const jsonData = csvToJson(data);

            // sort jsonData on reverse order except the first element (header)
            jsonData.sort((a, b) => {
                const dateA = new Date(a[Object.keys(a)[0]]);
                const dateB = new Date(b[Object.keys(b)[0]]);
                return dateB - dateA;
            });

            const cardBody = document.createElement('div');
            cardBody.className = 'card-body';
            cardBody.innerHTML += `
              <div class="table-responsive">
                <table class="table table-striped table-responsive table-hover table-bordered mb-0">
                    <thead>
                        <tr>
                            ${Object.keys(jsonData[0]).map(header => `<th>${header.toLocaleUpperCase()}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${jsonData.map(row => `
                            <tr>
                                ${Object.values(row).map(value => `<td>${value}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
              </div>
            `;


            let tableTitle = '';
            switch (urlParams.get('q')) {
                case 'x':
                    tableTitle = 'Data Set X';
                    break;
                case 'temperature':
                    tableTitle = 'Registro de Temperaturas';
                    break;
                case 'humidity':
                    tableTitle = 'Registro de Humedad';
                    break;
                case 'system':
                    tableTitle = 'Registro de Sistema';
                    break;
                default:
                    tableTitle = 'Data Table';
            }

            setSectionHTML('#table-title', tableTitle);
            setSectionHTML('#table-card', cardBody.outerHTML);
        })
        .catch(error => console.error('Error fetching data:', error));
}