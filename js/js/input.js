// js/input.js

// Definieert de input-handler en de knoppenstatus
var Input = {
    _pressed: {}, // Voor toetsenbordinvoer
    _touches: {}, // Om aanrakingen te volgen
    
    // Knoppen die we willen ondersteunen: 
    // Opmerking: de waarden zijn de KeyCode of de ID van de touch-knop
    KEY: {
        LEFT: 37, 'touch-left': 'touch-left',
        UP: 38,
        RIGHT: 39, 'touch-right': 'touch-right',
        DOWN: 40,
        JUMP: 88, 'touch-jump': 'touch-jump', // X
        RUN: 90, 'touch-run': 'touch-run', // Z
        PAUSE: 80, // P
        MUTE: 77 // M
    },

    // Controleert of een bepaalde knop (toets of touch) is ingedrukt
    isDown: function(key) {
        return this._pressed[key];
    },
    
    // Toetsenbord-handlers
    onKeyDown: function(event) {
        this._pressed[event.keyCode] = true;
    },
    
    onKeyUp: function(event) {
        delete this._pressed[event.keyCode];
    },

    // Touch-event handlers
    
    // Initialiseer touch-listeners
    initTouchControls: function() {
        var self = this;
        var touchControls = document.getElementById('touch-controls');
        
        // Zorg ervoor dat touch-controls bestaan
        if (!touchControls) return;

        // Listener voor het starten van een aanraking (Touch Start)
        // Dit is voor de knoppen in de DOM
        var buttons = touchControls.querySelectorAll('button');
        buttons.forEach(function(button) {
            button.addEventListener('touchstart', function(event) {
                event.preventDefault(); // Voorkom standaardacties zoals scrollen/zoomen
                self._handleTouchStart(event, button.id);
            }, false);
            button.addEventListener('touchend', function(event) {
                event.preventDefault();
                self._handleTouchEnd(event, button.id);
            }, false);
            // Voor desktop-testen kunnen we ook mousedown/mouseup toevoegen
            button.addEventListener('mousedown', function(event) {
                event.preventDefault();
                self._handleTouchStart(event, button.id);
            }, false);
            button.addEventListener('mouseup', function(event) {
                event.preventDefault();
                self._handleTouchEnd(event, button.id);
            }, false);
            button.addEventListener('mouseleave', function(event) {
                // Afhandeling wanneer de muis van de knop afgaat (belangrijk voor desktop-testen)
                if (self._pressed[button.id]) {
                    self._handleTouchEnd(event, button.id);
                }
            }, false);
        });
        
        // Optioneel: listeners voor de hele canvas/game-ruimte als je dat wilt
        // Dit is complexer, laten we ons voor nu focussen op de knoppen.
    },
    
    _handleTouchStart: function(event, buttonId) {
        // Markeer de knop als ingedrukt
        this._pressed[buttonId] = true;
    },
    
    _handleTouchEnd: function(event, buttonId) {
        // Markeer de knop als losgelaten
        delete this._pressed[buttonId];
    },

    // Functie om de listeners op te zetten
    setup: function() {
        window.addEventListener('keydown', this.onKeyDown.bind(this));
        window.addEventListener('keyup', this.onKeyUp.bind(this));
        
        // Initialiseer de touch-controls
        this.initTouchControls();
    }
};

// Zorg ervoor dat de input-handlers worden opgestart
Input.setup(); 
