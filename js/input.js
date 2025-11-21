(function() {
    var pressedKeys = {};

    function setKey(event, status) {
        // Bestaande toetsenbord logica
        var code = event.keyCode;
        var key;

        switch(code) {
        case 32:
            key = 'SPACE'; break;
        case 37:
            key = 'LEFT'; break;
        case 38:
            key = 'UP'; break;
        case 39:
            key = 'RIGHT'; break;
        case 40:
            key = 'DOWN'; break;
        case 88: // X
            key = 'JUMP'; break;
        case 90: // Z
            key = 'RUN'; break;
        default:
            key = String.fromCharCode(code);
        }

        pressedKeys[key] = status;
    }

    // --- Toetsenbord Event Listeners ---
    document.addEventListener('keydown', function(e) {
        setKey(e, true);
    });

    document.addEventListener('keyup', function(e) {
        setKey(e, false);
    });

    // --- Touchscreen Logica: Nieuw Toegevoegd! ---
    
    function setupTouchControls() {
        var touchControls = {
            'touch-left': 'LEFT',
            'touch-right': 'RIGHT',
            'touch-jump': 'JUMP',
            'touch-run': 'RUN'
        };

        // Koppel elke knop aan de juiste game-actie
        for (var id in touchControls) {
            var element = document.getElementById(id);
            if (element) {
                var action = touchControls[id];
                
                // Bij aanraking (touchstart): Zet de toets op 'ingedrukt'
                element.addEventListener('touchstart', function(e) {
                    e.preventDefault(); // Voorkomt standaard browser acties zoals scrollen/zoomen
                    var keyToPress = touchControls[this.id];
                    pressedKeys[keyToPress] = true;
                });

                // Bij loslaten (touchend/touchcancel): Zet de toets op 'niet ingedrukt'
                element.addEventListener('touchend', function(e) {
                    e.preventDefault();
                    var keyToRelease = touchControls[this.id];
                    pressedKeys[keyToRelease] = false;
                });
                
                // 'touchcancel' voor als de vinger van het element afglijdt
                element.addEventListener('touchcancel', function(e) {
                    e.preventDefault();
                    var keyToRelease = touchControls[this.id];
                    pressedKeys[keyToRelease] = false;
                });
                
                // Voor desktop debugging, kun je ook mousedown/up toevoegen:
                element.addEventListener('mousedown', function() {
                    var keyToPress = touchControls[this.id];
                    pressedKeys[keyToPress] = true;
                });
                element.addEventListener('mouseup', function() {
                    var keyToRelease = touchControls[this.id];
                    pressedKeys[keyToRelease] = false;
                });
            }
        }
    }
    
    // Voer de setup pas uit nadat de pagina volledig is geladen
    window.addEventListener('load', setupTouchControls);
    
    // --- Algemene Event Listeners (Bestaand) ---

    window.addEventListener('blur', function() {
        // Reset alle ingedrukte toetsen wanneer het venster de focus verliest
        pressedKeys = {};
    });

    window.input = {
        isDown: function(key) {
            return pressedKeys[key.toUpperCase()];
        },
        reset: function() {
          // Resetten voor game-logica (bestaand)
          pressedKeys['RUN'] = false;
          pressedKeys['LEFT'] = false;
          pressedKeys['RIGHT'] = false;
          pressedKeys['DOWN'] = false;
          pressedKeys['JUMP'] = false;
        }
    };
})();
