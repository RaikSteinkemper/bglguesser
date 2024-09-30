import React, { useState, useEffect } from 'react';

function App() {
  const [rounds, setRounds] = useState(5);
  const [timeLimit, setTimeLimit] = useState(60); // Sekunden
  const [currentLocation, setCurrentLocation] = useState(null); // Für zufällige Orte

  // Funktion zum Starten eines neuen Spiels / einer neuen Runde
  useEffect(() => {
    function getRandomLocation() {
      const locations = [
        { lat: 52.5200, lng: 13.4050 }, // Berlin
        { lat: 48.8566, lng: 2.3522 },  // Paris
        { lat: 51.5074, lng: -0.1278 }, // London
      ];
      return locations[Math.floor(Math.random() * locations.length)];
    }

    setCurrentLocation(getRandomLocation()); // Wählt einen zufälligen Ort
  }, []); // Leeres Abhängigkeitsarray, um es nur beim Initialisieren auszuführen

  useEffect(() => {
    const googleMapsScript = document.createElement('script');
    googleMapsScript.src = `https://maps.googleapis.com/maps/api/js?key=my_key&callback=initMap`;
    googleMapsScript.async = true;
    googleMapsScript.defer = true;
    window.document.body.appendChild(googleMapsScript);

    window.initMap = function () {
      new window.google.maps.StreetViewPanorama(
        document.getElementById('street-view'),
        {
          position: currentLocation, // Nutze den aktuellen zufälligen Ort
          pov: { heading: 165, pitch: 0 },
          zoom: 1,
          disableDefaultUI: true, // Deaktiviert alle Standard-Bedienelemente
          clickToGo: false,       // Verhindert das Klicken zum Bewegen
          linksControl: false,    // Entfernt die Richtungspfeile
          panControl: false,      // Verhindert das Verschieben der Ansicht mit der Maus
          motionTracking: false,  // Deaktiviert Bewegungserkennung bei Mobilgeräten
        }
      );
    };
  }, [currentLocation]);

  return (
    <div className="App">
      <h1>GeoGuessr für deine Stadt</h1>

      {/* Eingabefelder für Runden und Zeitlimit */}
      <div>
        <label>Runden: </label>
        <input
          type="number"
          value={rounds}
          onChange={(e) => setRounds(e.target.value)}
        />
      </div>

      <div>
        <label>Zeitlimit (Sekunden): </label>
        <input
          type="number"
          value={timeLimit}
          onChange={(e) => setTimeLimit(e.target.value)}
        />
      </div>

      {/* Street View anzeigen */}
      <div id="street-view" style={{ width: '100%', height: '500px' }}></div>
    </div>
  );
}

export default App;
