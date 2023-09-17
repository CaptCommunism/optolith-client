const builder = require('electron-builder');
const path = require('path');

builder.build({
    targets: builder.Platform.WINDOWS.createTarget(),
    config: {
        // Konfigurationsoptionen für den Windows-Build hier einfügen
    },
})
    .then(() => {
        console.log('Build erfolgreich abgeschlossen!');
    })
    .catch((error) => {
        console.error('Fehler beim Build:', error);
    });