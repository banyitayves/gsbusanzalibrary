// AI Video Generator - Main Application
class VideoGenerator {
    constructor() {
        this.apiKeys = {
            tavus: localStorage.getItem('tavus_api_key') || '',
            did: localStorage.getItem('did_api_key') || ''
        };
        this.currentJobId = null;
        this.videoHistory = JSON.parse(localStorage.getItem('videoHistory') || '[]');
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateHistoryDisplay();
        this.checkApiKeys();
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('videoForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.generateVideo();
        });

        // Character counter
        document.getElementById('videoText').addEventListener('input', (e) => {
            const count = e.target.value.length;
            document.querySelector('.char-count').textContent = `${count} / 5000`;
        });

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });

        // Download button
        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadVideo());
        }

        // Settings modal
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('settingsModal').classList.remove('active');
            });
        });

        // Voice speed slider
        const speedInput = document.getElementById('voiceSpeed');
        if (speedInput) {
            speedInput.addEventListener('change', (e) => {
                this.updateSpeedDisplay(e.target.value);
            });
        }
    }

    switchTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });

        // Remove active from all buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected tab
        const tabElement = document.getElementById(tabName);
        if (tabElement) {
            tabElement.classList.add('active');
        }

        // Mark button as active
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    }

    checkApiKeys() {
        if (!this.apiKeys.tavus && !this.apiKeys.did) {
            this.showToast('Please configure API keys first', 'warning');
            setTimeout(() => this.openSettingsModal(), 2000);
        }
    }

    openSettingsModal() {
        const modal = document.getElementById('settingsModal');
        if (modal) {
            modal.classList.add('active');
        }

        // Save settings button
        const saveBtn = document.getElementById('saveSettingsBtn');
        if (saveBtn) {
            saveBtn.onclick = () => this.saveApiSettings();
        }
    }

    saveApiSettings() {
        const tavusKey = document.getElementById('tavisApiKey')?.value;
        const didKey = document.getElementById('didApiKey')?.value;

        if (tavusKey) {
            this.apiKeys.tavus = tavusKey;
            localStorage.setItem('tavus_api_key', tavusKey);
        }

        if (didKey) {
            this.apiKeys.did = didKey;
            localStorage.setItem('did_api_key', didKey);
        }

        document.getElementById('settingsModal').classList.remove('active');
        this.showToast('API settings saved successfully', 'success');
    }

    async generateVideo() {
        const videoText = document.getElementById('videoText').value.trim();
        const avatarType = document.getElementById('avatarType').value;
        const voiceType = document.getElementById('voiceType').value;
        const videoStyle = document.getElementById('videoStyle').value;
        const bgStyle = document.getElementById('bgStyle').value;

        // Validation
        if (!videoText) {
            this.showToast('Please enter video text', 'error');
            return;
        }

        if (!avatarType || !voiceType) {
            this.showToast('Please select avatar and voice', 'error');
            return;
        }

        // Check API keys
        const selectedProvider = avatarType === 'd-id' ? 'did' : 'tavus';
        if (!this.apiKeys[selectedProvider]) {
            this.showToast(`Please configure ${selectedProvider.toUpperCase()} API key`, 'error');
            this.openSettingsModal();
            return;
        }

        // Disable form
        this.setFormDisabled(true);
        this.showProgressBar();
        this.updateProgress(10, 'Preparing video generation...');

        try {
            let videoUrl;

            if (avatarType === 'd-id') {
                videoUrl = await this.generateWithDID(videoText, voiceType, videoStyle);
            } else {
                videoUrl = await this.generateWithTavus(videoText, voiceType, videoStyle);
            }

            await this.displayVideo(videoUrl, videoText, avatarType, voiceType);
            this.addToHistory(videoText, videoUrl, avatarType, voiceType);
            this.showToast('Video generated successfully!', 'success');
        } catch (error) {
            console.error('Error generating video:', error);
            this.showToast(`Error: ${error.message}`, 'error');
        } finally {
            this.setFormDisabled(false);
            this.hideProgressBar();
        }
    }

    async generateWithDID(text, voice, style) {
        this.updateProgress(20, 'Contacting D-ID API...');

        // D-ID API endpoint
        const dIdUrl = 'https://api.d-id.com/talks';

        const payload = {
            script: {
                type: 'text',
                input: text,
                provider: {
                    type: 'microsoft',
                    voice_id: this.mapVoiceToDID(voice)
                }
            },
            config: {
                fluent: true,
                pad_audio: 0
            },
            sessions: [],
            source_url: null
        };

        this.updateProgress(30, 'Processing with D-ID...');

        try {
            const response = await fetch(dIdUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKeys.did}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`D-ID API error: ${response.statusText}`);
            }

            const data = await response.json();
            this.currentJobId = data.id;

            // Poll for completion
            return await this.pollDIDCompletion(data.id);
        } catch (error) {
            throw new Error(`D-ID generation failed: ${error.message}`);
        }
    }

    async pollDIDCompletion(jobId, attempts = 0) {
        const maxAttempts = 30;
        const pollInterval = 3000;

        if (attempts >= maxAttempts) {
            throw new Error('Video generation timeout - please try again');
        }

        this.updateProgress(40 + (attempts * 1), `Processing video (${attempts}s)...`);

        const statusUrl = `https://api.d-id.com/talks/${jobId}`;

        try {
            const response = await fetch(statusUrl, {
                headers: {
                    'Authorization': `Bearer ${this.apiKeys.did}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to check status: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.status === 'done') {
                this.updateProgress(90, 'Finalizing video...');
                return data.result_url;
            } else if (data.status === 'error') {
                throw new Error(data.error?.message || 'Video generation failed');
            }

            // Wait and retry
            await new Promise(resolve => setTimeout(resolve, pollInterval));
            return this.pollDIDCompletion(jobId, attempts + 1);
        } catch (error) {
            throw new Error(`Status check failed: ${error.message}`);
        }
    }

    async generateWithTavus(text, voice, style) {
        this.updateProgress(20, 'Contacting Tavus API...');

        // Tavus API endpoint
        const tavusUrl = 'https://api.tavus.io/v1/video-generation';

        const payload = {
            script: text,
            voice: this.mapVoiceToTavus(voice),
            style: style,
            resolution: '1080p'
        };

        this.updateProgress(30, 'Processing with Tavus...');

        try {
            const response = await fetch(tavusUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKeys.tavus}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Tavus API error: ${response.statusText}`);
            }

            const data = await response.json();
            this.currentJobId = data.id;

            // Poll for completion
            return await this.pollTavusCompletion(data.id);
        } catch (error) {
            throw new Error(`Tavus generation failed: ${error.message}`);
        }
    }

    async pollTavusCompletion(jobId, attempts = 0) {
        const maxAttempts = 30;
        const pollInterval = 3000;

        if (attempts >= maxAttempts) {
            throw new Error('Video generation timeout - please try again');
        }

        this.updateProgress(40 + (attempts * 1), `Processing video (${attempts}s)...`);

        const statusUrl = `https://api.tavus.io/v1/video-generation/${jobId}`;

        try {
            const response = await fetch(statusUrl, {
                headers: {
                    'Authorization': `Bearer ${this.apiKeys.tavus}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to check status: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.status === 'completed') {
                this.updateProgress(90, 'Finalizing video...');
                return data.video_url;
            } else if (data.status === 'failed') {
                throw new Error(data.error_message || 'Video generation failed');
            }

            // Wait and retry
            await new Promise(resolve => setTimeout(resolve, pollInterval));
            return this.pollTavusCompletion(jobId, attempts + 1);
        } catch (error) {
            throw new Error(`Status check failed: ${error.message}`);
        }
    }

    mapVoiceToDID(voice) {
        const voiceMap = {
            'male-1': 'en-US-AriaNeural',
            'male-2': 'en-US-GuyNeural',
            'female-1': 'en-US-AriaNeural',
            'female-2': 'en-US-AmberNeural'
        };
        return voiceMap[voice] || 'en-US-AriaNeural';
    }

    mapVoiceToTavus(voice) {
        const voiceMap = {
            'male-1': 'male_deep',
            'male-2': 'male_neutral',
            'female-1': 'female_warm',
            'female-2': 'female_professional'
        };
        return voiceMap[voice] || 'male_neutral';
    }

    async displayVideo(videoUrl, script, avatar, voice) {
        this.updateProgress(95, 'Loading video...');

        const videoPreview = document.getElementById('videoPreview');
        const previewPlaceholder = document.querySelector('.preview-placeholder');
        const previewInfo = document.getElementById('previewInfo');

        // Create or update video element
        let videoElement = videoPreview.querySelector('video');
        if (!videoElement) {
            videoElement = document.createElement('video');
            videoElement.controls = true;
            videoElement.style.width = '100%';
            videoElement.style.height = '100%';
            videoElement.style.objectFit = 'contain';
            videoPreview.appendChild(videoElement);
        }

        videoElement.src = videoUrl;
        previewPlaceholder.style.display = 'none';
        previewInfo.style.display = 'flex';
        document.getElementById('statusBadge').textContent = 'Ready';
        document.getElementById('statusBadge').className = 'badge success';
        document.getElementById('downloadBtn').style.display = 'block';

        this.updateProgress(100, 'Complete!');
        setTimeout(() => this.hideProgressBar(), 1500);
    }

    downloadVideo() {
        const videoElement = document.querySelector('#videoPreview video');
        if (videoElement && videoElement.src) {
            const a = document.createElement('a');
            a.href = videoElement.src;
            a.download = `video-${Date.now()}.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            this.showToast('Download started', 'success');
        }
    }

    addToHistory(script, videoUrl, avatar, voice) {
        const item = {
            id: Date.now(),
            script: script.substring(0, 50) + '...',
            fullScript: script,
            videoUrl: videoUrl,
            avatar: avatar,
            voice: voice,
            timestamp: new Date().toLocaleString(),
            date: new Date().toLocaleDateString()
        };

        this.videoHistory.unshift(item);
        if (this.videoHistory.length > 20) {
            this.videoHistory.pop();
        }

        localStorage.setItem('videoHistory', JSON.stringify(this.videoHistory));
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        const historyList = document.getElementById('historyList');
        if (!historyList) return;

        if (this.videoHistory.length === 0) {
            historyList.innerHTML = '<p class="empty-state">No videos generated yet</p>';
            return;
        }

        historyList.innerHTML = this.videoHistory.map(item => `
            <div class="history-item">
                <div class="history-thumbnail">
                    <span style="font-size: 1.5rem;">🎥</span>
                </div>
                <div class="history-details">
                    <div class="history-title">${this.escapeHtml(item.script)}</div>
                    <div class="history-meta">
                        ${item.date} • ${item.avatar} • ${item.voice}
                    </div>
                </div>
                <div class="history-actions">
                    <button class="btn btn-secondary history-btn" onclick="videoGen.playHistoryVideo('${item.id}')">Play</button>
                    <button class="btn btn-secondary history-btn" onclick="videoGen.deleteHistoryItem('${item.id}')">Delete</button>
                </div>
            </div>
        `).join('');
    }

    playHistoryVideo(id) {
        const item = this.videoHistory.find(v => v.id === parseInt(id));
        if (item) {
            const videoPreview = document.getElementById('videoPreview');
            let videoElement = videoPreview.querySelector('video');

            if (!videoElement) {
                videoElement = document.createElement('video');
                videoElement.controls = true;
                videoPreview.appendChild(videoElement);
            }

            videoElement.src = item.videoUrl;
            document.querySelector('.preview-placeholder').style.display = 'none';
            this.switchTab('preview');
            document.getElementById('downloadBtn').style.display = 'block';
        }
    }

    deleteHistoryItem(id) {
        if (confirm('Delete this video from history?')) {
            this.videoHistory = this.videoHistory.filter(v => v.id !== parseInt(id));
            localStorage.setItem('videoHistory', JSON.stringify(this.videoHistory));
            this.updateHistoryDisplay();
            this.showToast('Video removed from history', 'success');
        }
    }

    updateProgress(percentage, message) {
        const progressFill = document.getElementById('progressFill');
        if (progressFill) {
            progressFill.style.width = percentage + '%';
        }

        const statusBadge = document.getElementById('statusBadge');
        if (statusBadge) {
            statusBadge.textContent = message;
        }
    }

    showProgressBar() {
        const previewInfo = document.getElementById('previewInfo');
        if (previewInfo) {
            previewInfo.style.display = 'flex';
        }
    }

    hideProgressBar() {
        // Keep it visible
    }

    updateSpeedDisplay(speed) {
        // Update display if needed
    }

    setFormDisabled(disabled) {
        const form = document.getElementById('videoForm');
        const inputs = form.querySelectorAll('input, select, textarea, button');
        inputs.forEach(input => {
            input.disabled = disabled;
        });

        const generateBtn = document.getElementById('generateBtn');
        if (disabled) {
            generateBtn.classList.add('loading');
            document.querySelector('.btn-loader').classList.remove('hidden');
        } else {
            generateBtn.classList.remove('loading');
            document.querySelector('.btn-loader').classList.add('hidden');
        }
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        if (!toast) return;

        toast.textContent = message;
        toast.className = `toast show ${type}`;

        setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}

// Initialize on page load
let videoGen;
document.addEventListener('DOMContentLoaded', () => {
    videoGen = new VideoGenerator();
});
