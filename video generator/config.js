// API Configuration for Video Generation

const API_CONFIG = {
    // D-ID API Configuration
    DID: {
        baseUrl: 'https://api.d-id.com',
        endpoints: {
            talks: '/talks',
            status: '/talks/{id}'
        },
        timeout: 120000, // 2 minutes
        maxRetries: 30,
        pollInterval: 3000
    },

    // Tavus API Configuration
    TAVUS: {
        baseUrl: 'https://api.tavus.io/v1',
        endpoints: {
            videoGeneration: '/video-generation',
            status: '/video-generation/{id}'
        },
        timeout: 120000, // 2 minutes
        maxRetries: 30,
        pollInterval: 3000
    },

    // Voice Options
    VOICES: {
        DID: {
            'male-1': { id: 'en-US-GuyNeural', name: 'Guy (Male)' },
            'male-2': { id: 'en-US-AriaNeural', name: 'Aria (Neural)' },
            'female-1': { id: 'en-US-AmberNeural', name: 'Amber (Female)' },
            'female-2': { id: 'en-US-SaraNeural', name: 'Sara (Female)' }
        },
        TAVUS: {
            'male-1': { id: 'male_deep', name: 'Deep Male' },
            'male-2': { id: 'male_neutral', name: 'Neutral Male' },
            'female-1': { id: 'female_warm', name: 'Warm Female' },
            'female-2': { id: 'female_professional', name: 'Professional Female' }
        }
    },

    // Avatar Options
    AVATARS: {
        DID: [
            { id: 'avatar-1', name: 'Professional - Sarah' },
            { id: 'avatar-2', name: 'Professional - James' },
            { id: 'avatar-3', name: 'Casual - Emma' }
        ],
        TAVUS: [
            { id: 'avatar-1', name: 'Avatar 1' },
            { id: 'avatar-2', name: 'Avatar 2' },
            { id: 'avatar-3', name: 'Avatar 3' }
        ]
    },

    // Video Styles
    STYLES: {
        professional: 'Professional',
        casual: 'Casual',
        educational: 'Educational',
        marketing: 'Marketing'
    },

    // Background Styles
    BACKGROUNDS: {
        'solid-blue': 'Solid Blue',
        'solid-white': 'Solid White',
        'gradient': 'Gradient',
        'custom': 'Custom'
    },

    // Local Storage Keys
    STORAGE_KEYS: {
        tavusKey: 'tavus_api_key',
        didKey: 'did_api_key',
        history: 'videoHistory',
        settings: 'videoGeneratorSettings'
    },

    // Validation Rules
    VALIDATION: {
        minTextLength: 10,
        maxTextLength: 5000,
        minDuration: 10,
        maxDuration: 300
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
}
