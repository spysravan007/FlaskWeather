from flask import Flask, request, render_template, jsonify
import json
import requests as req

app = Flask(__name__, static_folder='static', template_folder='templates')

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/api/search/city')
def search_city():
    countries = json.load(open('static/assets/countries.min.json', 'r'))
    res, q = set(), request.args['q'].lower()
    for i in countries.keys():
        if i[:len(q)].lower() == q:
            res.add(i)
        for j in countries[i]:
            if j[:len(q)].lower() == q:
                res.add(j)
    return jsonify(list(res))

@app.route('/api/data')
def get_data():
    data = req.get("https://api.openweathermap.org/data/2.5/weather?q=" + request.args['place'] + "&appid=ce9504889c4dc894843bb5c5eecee8e1")
    lat = str(data.json()['coord']['lat'])
    lon = str(data.json()['coord']['lon'])
    data1 = req.get("https://api.openweathermap.org/data/2.5/onecall?lat="+lat+"&lon="+lon+"&exclude=current,daily,alerts&appid=ce9504889c4dc894843bb5c5eecee8e1")
    return jsonify([data.json(), data1.json()])

if __name__ == '__main__':
    app.run(debug = True)
