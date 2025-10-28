// Configuration for NathFarma Dashboard
const API_CONFIG = {
    // Data is loaded from static JSON files in the data/ folder
    // These files are updated daily by GitHub Actions
    dataPath: 'data/',
    
    // Deck IDs (used by GitHub Actions workflow)
    decks: {
        general: 'cb70190e-5ca3-461b-8618-3d7bccc1b7c3', // NathFarma root
        blome: '939d30f7-750c-4d69-9cea-014aa04c402f'    // Bloomé module
    },
    
    // Total flashcards per module
    flashcards: {
        general: 611,
        blome: 65
    },
    
    // Sappie brand colors
    colors: {
        primary: '#6001AE',
        secondary: '#8B3FD9',
        dark: '#2C005E',
        success: '#4CAF50',
        error: '#FF5252',
        background: '#EDF1F5'
    }
};