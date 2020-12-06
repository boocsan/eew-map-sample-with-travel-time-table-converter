(async () => {
  const map = new L.Map("map", {
    center: new L.LatLng(38.558595, 137.0550225),
    zoom: 6,
    preferCanvas: true
  });

  L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png").addTo(map);

  const table = await ImportTable();
  const value = GetValue(table, 60, 57);

  L.circle([35.6896342, 139.6921007], value[0] * 1000, {
    color: "#0000ff",
    weight: 3,
    opacity: 1,
    fillColor: '#000000',
    fillOpacity: 0
  }).addTo(map);

  L.circle([35.6896342, 139.6921007], value[1] * 1000, {
    color: "#ff0000",
    weight: 6,
    opacity: 1,
    fillColor: '#ff0000',
    fillOpacity: 0.2
  }).addTo(map);

  L.marker([35.6896342, 139.6921007], {
    icon: L.icon({
      iconUrl: "assets/epicenter.png",
      iconSize: [60, 60],
      iconAnchor: [30, 30]
    })
  }).addTo(map)
})()

async function ImportTable() {
  return (await axios.get("../assets/tjma2001.txt")).data.trim().replace("\r", "").replace(/\x20+/g, " ").split("\n").map(x => {
    const s = x.split(" ");
    return {
      p: parseFloat(s[1]),
      s: parseFloat(s[3]),
      depth: parseInt(s[4]),
      distance: parseInt(s[5]),
    };
  });
}

function GetValue(table, depth, time) {
  if (depth > 700 || time > 2000) return [NaN, NaN];

  const values = table.filter(x => x.depth == depth);
  if (values.Length == 0) return [NaN, NaN];

  let p1 = values.filter(x => x.p <= time);
  p1 = p1[p1.length - 1];
  let p2 = values.filter(x => x.p >= time);
  p2 = p2[0];
  if (p1 == null || p2 == null) return [NaN, NaN];
  const p = (time - p1.p) / (p2.p - p1.p) * (p2.distance - p1.distance) + p1.distance;

  let s1 = values.filter(x => x.s <= time);
  s1 = s1[s1.length - 1];
  let s2 = values.filter(x => x.s >= time);
  s2 = s2[0];
  if (s1 == null || s2 == null) return [p, NaN];
  const s = (time - s1.s) / (s2.s - s1.s) * (s2.distance - s1.distance) + s1.distance;

  return [p, s];
}
