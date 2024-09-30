import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Modal from 'react-modal';

const bergischGladbachCoordinates = [
  { lat: 51.050, lng: 7.060 },
  { lat: 51.050, lng: 7.150 },
  { lat: 51.000, lng: 7.150 },
  { lat: 51.000, lng: 7.060 },
];

// Modal-Styling
const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '600px',
    height: '400px',
  },
};

// Modal für die Karte
Modal.setAppElement('#root');

function App() {
  // Zustände für das Startmenü und Spiel
  const [gameStarted, setGameStarted] = useState(false);
  const [rounds, setRounds] = useState(5);
  const [timeLimit, setTimeLimit] = useState(60);
  const [currentRound, setCurrentRound] = useState(0);
  const [timer, setTimer] = useState(timeLimit);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [guessLocation, setGuessLocation] = useState(null); // Vom Nutzer ausgewählter Ort
  const [modalIsOpen, setModalIsOpen] = useState(false); // Sichtbarkeit des Popups

  // Orte in Bergisch Gladbach
  const locations = useMemo(() => [
    { lat: 51.0224, lng: 7.1211 }, // Bergisch Gladbach
    { lat: 51.0178, lng: 7.1376 }, // Beispiel
    { lat: 51.0285, lng: 7.1186 }, // Beispiel
  ], []);

  // Funktion, um einen zufälligen Ort in Bergisch Gladbach zu erhalten
  const getRandomLocation = useCallback(() => {
    return locations[Math.floor(Math.random() * locations.length)];
  }, [locations]);

  // Funktion zum Starten des Spiels
  const startGame = () => {
    setGameStarted(true);
    setCurrentRound(1);
    setCurrentLocation(getRandomLocation());
    setTimer(timeLimit);
  };

  // Timer-Logik
  useEffect(() => {
    let timerInterval;
    if (gameStarted && timer > 0) {
      timerInterval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0 && currentRound < rounds) {
      setCurrentRound((prevRound) => prevRound + 1);
      setCurrentLocation(getRandomLocation());
      setTimer(timeLimit);
    } else if (currentRound >= rounds && timer === 0) {
      setGameStarted(false);
    }
    return () => clearInterval(timerInterval);
  }, [gameStarted, timer, currentRound, rounds, timeLimit, getRandomLocation]);

  // Street View-Anzeige
  useEffect(() => {
    if (gameStarted && currentLocation) {
      const googleMapsScript = document.createElement('script');
      googleMapsScript.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAwZQ-nF5ivyr2Ywzs-dEJRoXmjosyOhoQ&callback=initMap`;
      googleMapsScript.async = true;
      googleMapsScript.defer = true;
      window.document.body.appendChild(googleMapsScript);

      window.initMap = function () {
        new window.google.maps.StreetViewPanorama(
          document.getElementById('street-view'),
          {
            position: currentLocation,
            pov: { heading: 165, pitch: 0 },
            zoom: 1,
            disableDefaultUI: true,
            clickToGo: false,
            linksControl: false,
            panControl: false,
            motionTracking: false,
          }
        );
      };
    }
  }, [gameStarted, currentLocation]);

  // Google Maps Karte anzeigen im Modal
  useEffect(() => {
    if (modalIsOpen) {
      const googleMapsScript = document.createElement('script');
      googleMapsScript.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAwZQ-nF5ivyr2Ywzs-dEJRoXmjosyOhoQ&callback=initMap`;
      googleMapsScript.async = true;
      googleMapsScript.defer = true;
      window.document.body.appendChild(googleMapsScript);
  
      window.initMap = function () {
        // Erstelle die Karte, zentriert auf Bergisch Gladbach
        const map = new window.google.maps.Map(document.getElementById('map'), {
          center: { lat: 51.0224, lng: 7.1211 },
          zoom: 12,
          mapTypeId: 'roadmap',
        });
  
        // Definiere die Grenzen von Bergisch Gladbach als Polygon
        const bergischGladbachPolygon = new window.google.maps.Polygon({
          paths: bergischGladbachCoordinates,
          strokeColor: '#FF0000',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#FF0000',
          fillOpacity: 0.35, // Die Stadt wird leicht hervorgehoben
        });
  
        // Zeige das Polygon auf der Karte an
        bergischGladbachPolygon.setMap(map);
  
        // Stilisiere den Bereich außerhalb des Polygons (Rest wird ausgegraut)
        const mapStyles = [
          {
            featureType: 'all',
            elementType: 'geometry.fill',
            stylers: [
              { visibility: 'on' },
              { color: '#e0e0e0' }, // Außenbereich wird grau dargestellt
            ],
          },
        ];
  
        // Wende den Stil an
        map.setOptions({ styles: mapStyles });
  
        // Listener, um den vom Nutzer gewählten Ort zu speichern
        map.addListener('click', function (e) {
          setGuessLocation({ lat: e.latLng.lat(), lng: e.latLng.lng() });
        });
      };
    }
  }, [modalIsOpen]);

  return (
    <div className="App">
      <h1>GeoGuessr für Bergisch Gladbach</h1>

      {/* Startmenü */}
      {!gameStarted && currentRound === 0 && (
        <div>
          <label>Runden: </label>
          <input
            type="number"
            value={rounds}
            onChange={(e) => setRounds(Number(e.target.value))}
          />
          <label>Zeitlimit (Sekunden): </label>
          <input
            type="number"
            value={timeLimit}
            onChange={(e) => setTimeLimit(Number(e.target.value))}
          />
          <button onClick={startGame}>Runde starten</button>
        </div>
      )}

      {/* Street View anzeigen */}
      {gameStarted && currentLocation && currentRound <= rounds && (
        <div>
          <h2>Runde {currentRound} von {rounds}</h2>
          <div>Verbleibende Zeit: {timer} Sekunden</div>
          <div id="street-view" style={{ width: '100%', height: '500px' }}></div>

          {/* Button zum Öffnen der Karte im Popup */}
          <button onClick={() => setModalIsOpen(true)}>Karte öffnen</button>

          {/* Modal für Google Maps */}
          <Modal
            isOpen={modalIsOpen}
            onRequestClose={() => setModalIsOpen(false)}
            style={customStyles}
            contentLabel="Ort auswählen"
          >
            <h2>Wähle einen Ort in Bergisch Gladbach</h2>
            <div id="map" style={{ width: '100%', height: '300px' }}></div>
            <p>Gewählter Ort: {guessLocation ? `${guessLocation.lat}, ${guessLocation.lng}` : "Noch kein Ort gewählt"}</p>
            <button onClick={() => setModalIsOpen(false)}>Bestätigen</button>
          </Modal>
        </div>
      )}

      {/* Scoreboard anzeigen, wenn das Spiel beendet ist */}
      {!gameStarted && currentRound > 0 && currentRound > rounds && (
        <div>
          <h2>Spiel beendet!</h2>
          <button onClick={() => setCurrentRound(0)}>Nochmals spielen</button>
        </div>
      )}
    </div>
  );
}

export default App;
