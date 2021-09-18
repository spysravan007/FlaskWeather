$(document).ready(() => {
    $("#city-input").keypress(function(e) {
        let val = this.value + e.originalEvent.key;
        if(val.length > 4){
            $.get('/api/search/city', { q: val }, 
            (res) => {
                let city_list = $('#city-list')
                city_list.empty()
                for(let i of res)
                    city_list.append("<option value='" + i + "'>");
            });
        } 
    });

    $("#get-data").click(() => {
        if($("#city-input").val().length > 2){
            $.get('/api/data', {place: $("#city-input").val()},
            (res) => {
                $("#section1").css('display', 'inline-block');
                $("#section2").css('display', 'inline-block');
                $("#section3").css('display', 'none');
                startDrawing(res[0], res[1])
            });
        }else{
            alert("Enter a city name");
        }
    });
});

async function startDrawing(data, data2){
    let image_id = data.weather[0].icon[data.weather[0].icon.length - 1]
    if (data.weather[0].id == 800)
        image_id = 800 + image_id;
    else
        image_id = String(data.weather[0].id)[0] + "xx" + image_id;
    $("#weather_image").attr("src", "/static/assets/weather_icons/" + image_id + ".svg");
    $("#weather-main").text(data.weather[0].main);
    $("#weather-desc").text(data.weather[0].description);
    let t = new Date(1970, 0, 1);
    t.setSeconds(data.dt);
    $("#last-updated-date").text(t.toString().replace("(India Standard Time)","IST"));
    let colors = await getColors(data2.hourly);
    drawChart1(data2.hourly, colors);
    $("#latitude").text(data.coord.lon);
    $("#longitude").text(data.coord.lat);
    $("#wind-speed").text(data.wind.speed + "mph");
    $("#arrow").css('transform', 'rotate(' + data.wind.deg + "deg)");
    $("#direction-value").text(setDirection(data.wind.deg));
    let wind_data = processWindData(data2.hourly);
    drawChart2(wind_data);
}



function processWindData(data){
    let maxw = 0, minw = 0;
    for(let w of data){
        if(w.wind_speed < minw)
            minw = w.wind_speed;
        if(w.wind_speed > maxw)
            maxw = w.wind_speed;
    }
    let cat = [], val = (maxw + 0.0000001)/5;
    for(let i =0; i< 5;i++)
        cat.push({'N':0, 'NE':0,'E':0, 'ES':0,'S':0, 'SW':0,'W':0, 'WN':0});
    for(let w of data){
            if(Math.floor(w.wind_speed/val) < 5)
                cat[Math.floor(w.wind_speed/val)][setDirection(w.wind_deg)] += 1;
    }
    return cat;
}

function setDirection(dir){
    let dirVal = "";
    if(dir > 10 && dir < 80)
        dirVal = "NE";
    else if (dir > 80 && dir < 100)
        dirVal = "E";
    else if (dir > 100 && dir < 170)
        dirVal = "ES";
    else if (dir > 170 && dir < 190)
        dirVal = "S";
    else if (dir > 190 && dir < 260)
        dirVal = "SW";
    else if (dir > 260 && dir < 280)
        dirVal = "W";
    else if (dir > 280 && dir < 350)
        dirVal = "WN";
    else
        dirVal = "N"
    return dirVal;
}

async function getTimeData(data){
    let arr = [], labels = [];
    for (let i of data) {
        let t = new Date(1970, 0, 1);
        t.setSeconds(i.dt);
        arr.push({ t: t.toString().replace(" (India Standard Time)",""), y: i.temp } ) 
        labels.push(t.toString().replace(" (India Standard Time)",""));
    }
    return [arr, labels];
}

async function getColors(data){
    let mint = data[0].temp, maxt = data[0].temp, arr = [];
    for(let i of data) {
        if(i.temp < mint)
            mint = i.temp;
        if(i.temp > maxt)
            maxt = i.temp;            
    }
    let diff = maxt - mint;
    for (let i of data) {
        arr.push('rgba(255,0,0,' + (Math.round(((i.temp - mint)/diff) * 10) / 10) + ')'); 
    }
    return arr
}

async function drawChart1(data, colors){
    var ctx = document.getElementById("weather-box-1-canvas");
    data = await getTimeData(data);
    new Chart(ctx, {
  type: 'line',
  options: {
    scales: {
      xAxes: [{
        type: 'time',
      }]
    },
    legend: { display: false },
    datasetFill: true,
    title: {
        display: true,
        text: 'Temperature Distribution in last 48 hours'
      }
  },
  data: {
    labels: data[1],
    datasets: [{
      label: 'Temp',
      data: data[0],
      fillColor: colors,
      backgroundColor: colors,
      borderColor: colors,
      borderWidth: 0
    }]
  }
});
}


function getWindDatasets(data){
    let dataarr = [], clrsarr = ['rgba(191, 191, 63, 0.5)','rgba(63, 191, 191, 0.5)','rgba(63, 63, 191, 0.5)','rgba(237, 87, 7, 0.5)','rgba(244, 10, 10, 0.5)'];
    let labels = ["Light Air", "Light Breeze", "Medium Breeze", "Strong Breeze", "Gale"];
    for(let i = 0; i < 5; i++){
        dataarr.push({
        label: labels[i],
        data: [data[i].N, data[i].NE, data[i].E, data[i].ES, data[i].S, data[i].SW, data[i].W, data[i].WN],
        fill: true,
        backgroundColor: clrsarr[i],
        borderColor: clrsarr[i],
        pointBackgroundColor: clrsarr[i],
        pointBorderColor: '#fff',
      });
    }
    return dataarr;
}

function drawChart2(data){
    var ctx = document.getElementById("weather-box-2-canvas");
    new Chart(ctx, {
        type: 'radar',
        options: {
            responsive: true,
    maintainAspectRatio: false,
            legend: { display: true},
            title: {
                display: true,
                text: 'Wind Rose'
              },
          elements: {
            line: {
              borderWidth: 1
            }
          }
        },
        data: {
  labels: [
    'N', 'NE',
    'E', 'ES', 
    'S', 'SW',
    'W', 'WN'
  ],
  datasets: getWindDatasets(data)
}
      });

}




